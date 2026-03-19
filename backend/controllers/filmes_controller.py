from models.database import conn, cursor
from models.resposta_padrao import RespostaPadrao
from services.tmdb_api import buscar_filme_por_titulo, GENERO_MAP


def buscar_filmes(titulo):
    if not titulo:
        return RespostaPadrao(400, "Termo de busca é obrigatório.").to_dict()
    
    try:
        resultados = buscar_filme_por_titulo(titulo)
        if not resultados:
            return RespostaPadrao(404, "Nenhum filme encontrado.").to_dict()
        
        # Formatar resultados para o frontend
        filmes_formatados = []
        for filme in resultados:
            filmes_formatados.append({
                "id": filme.get("id"),
                "title": filme.get("title"),
                "release_date": filme.get("release_date"),
                "overview": filme.get("overview"),
                "poster_path": filme.get("poster_path"),
                "vote_average": filme.get("vote_average")
            })
        
        return RespostaPadrao(200, "Busca realizada com sucesso.", dados=filmes_formatados).to_dict()
    except Exception as e:
        print("Erro ao buscar filmes:", e)
        return RespostaPadrao(500, "Erro interno ao buscar filmes.", id_erro="TMDB001").to_dict()


def add_filme(titulo, ano=None, imagem_url=None):
    if not titulo:
        return RespostaPadrao(400, "Titulo do filme é obrigatório.").to_dict()
    
    try:
        titulo = titulo.strip()
        ano_int = None
        genero = "Desconhecido"

        if ano:
            try:
                ano_int = int(str(ano)[:4]) if str(ano).replace("-","").isdigit() else 0
            except:
                ano_int = 0
        if ano_int is None:
            ano_int = 0

        if not imagem_url:
            resultados = buscar_filme_por_titulo(titulo)
            if resultados:
                filme = resultados[0]
                titulo = filme.get("title", titulo)
                release_date = filme.get("release_date")
                if release_date and release_date.split("-")[0].isdigit():
                    ano_int = int(release_date.split("-")[0])
                genero_ids = filme.get("genre_ids", [])
                genero = GENERO_MAP.get(genero_ids[0], "Desconhecido") if genero_ids else "Desconhecido"
                poster_path = filme.get("poster_path")
                imagem_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None

        cursor.execute("SELECT id FROM filmes WHERE titulo = %s", (titulo,))
        filme_existente = cursor.fetchone()
        
        if filme_existente:
            filme_id = filme_existente[0]
            return RespostaPadrao(409, "Filme já cadastrado.", dados={"filme_id": filme_id}).to_dict()

        sql = 'INSERT INTO filmes (titulo, genero, ano, imagem_url) VALUES (%s, %s, %s, %s)'
        valores = (titulo, genero, ano_int, imagem_url)
        cursor.execute(sql, valores)
        filme_id = cursor.lastrowid
        conn.commit()

        return RespostaPadrao(201, f"Filme {titulo} cadastrado com sucesso.", dados={"filme_id": filme_id}).to_dict()

    except Exception as e:
        conn.rollback()  # Reverter transação em caso de erro
        print("Erro ao cadastrar filme:", e)
        return RespostaPadrao(500, "Erro interno ao cadastrar filme.", id_erro="DB001").to_dict()


def listar_filmes():
    try:
        cursor.execute('SELECT * FROM filmes')
        resultados = cursor.fetchall()
        filmes = []
        for filme in resultados:
            filmes.append({
                "id": filme[0],
                "titulo": filme[1],
                "genero": filme[2],
                "ano": filme[3]
            })
        return RespostaPadrao(200,'Lista de filmes.', dados=filmes ).to_dict()
    except Exception as e:
        return RespostaPadrao(500, "Erro ao listar filmes.", id_erro="DB002").to_dict()
    
def vincular_filme_usuario(filme_id, usuario_id):
    try:
        cursor.execute(
            "SELECT * FROM usuario_filme WHERE usuario_id = %s AND filme_id = %s",
            (usuario_id, filme_id)
        )
        if cursor.fetchone():
            return {
                "status_http": 409,
                "mensagem": "Filme já vinculado ao usuário."
            }

        cursor.execute(
            "INSERT INTO usuario_filme (usuario_id, filme_id) VALUES (%s, %s)",
            (usuario_id, filme_id)
        )
        conn.commit()
        return {
            "status_http": 201,
            "mensagem": "Filme vinculado com sucesso."
        }

    except Exception as e:
        conn.rollback()  # Reverter transação em caso de erro
        print("Erro ao vincular filme:", e)
        return {
            "status_http": 500,
            "mensagem": "Erro ao vincular filme.",
            "erro": str(e)
        }


def listar_recomendacoes(usuario_id):
    try:
        import requests
        import os
        from dotenv import load_dotenv
        from pathlib import Path
        for p in [Path(__file__).parent.parent / '.env']:
            if p.exists():
                load_dotenv(p)
                break
        api_key = os.getenv("TMDB_API_KEY")
        if not api_key:
            return RespostaPadrao(200, "Recomendações.", dados=[]).to_dict()

        cursor.execute("SELECT f.titulo FROM filmes f JOIN usuario_filme uf ON f.id = uf.filme_id WHERE uf.usuario_id = %s", (usuario_id,))
        meus_titulos = {r[0].lower() for r in cursor.fetchall()}

        r = requests.get(f"https://api.themoviedb.org/3/movie/popular", params={"api_key": api_key, "language": "pt-BR", "page": 1})
        if r.status_code != 200:
            return RespostaPadrao(200, "Recomendações.", dados=[]).to_dict()

        popular = r.json().get("results", [])[:10]
        lista = []
        for m in popular:
            titulo = m.get("title", "")
            if titulo.lower() not in meus_titulos:
                lista.append({
                    "id": m.get("id"),
                    "titulo": titulo,
                    "ano": m.get("release_date", "").split("-")[0] if m.get("release_date") else None,
                    "imagem_url": f"https://image.tmdb.org/t/p/w500{m['poster_path']}" if m.get("poster_path") else None,
                    "motivo": "Filme popular"
                })
        return RespostaPadrao(200, "Recomendações.", dados=lista).to_dict()
    except Exception as e:
        print("Erro recomendações:", e)
        return RespostaPadrao(200, "Recomendações.", dados=[]).to_dict()
