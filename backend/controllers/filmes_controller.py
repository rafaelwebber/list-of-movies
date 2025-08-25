from models.database import conn, cursor
from models.resposta_padrao import RespostaPadrao
from services.tmdb_api import buscar_filme_por_titulo, GENERO_MAP


def add_filme(titulo):
    if not titulo:
        return RespostaPadrao(400, "Titulo do filme é obrigatório.").to_dict()
    
    try:
        resultados = buscar_filme_por_titulo(titulo)
        if not resultados:
            return RespostaPadrao(404, "Filme não encontrado!").to_dict()
        
        filme = resultados[0]

        titulo = filme.get("title", "Desconhecido")
        ano = filme.get("release_date", "").split("-")[0] if filme.get("release_date") else "Desconhecido"
        genero_ids = filme.get("genre_ids", [])
        genero = GENERO_MAP.get(genero_ids[0], "Desconhecido") if genero_ids else "Desconhecido"

        poster_path = filme.get("poster_path")
        imagem_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None
        
        cursor.execute("SELECT id FROM filmes WHERE titulo = %s AND ano = %s", (titulo, ano))
        if cursor.fetchone():
            return RespostaPadrao(409, "Filme já cadastrado.").to_dict()

        sql = 'INSERT INTO filmes (titulo, genero, ano, imagem_url) VALUES (%s, %s, %s, %s)'
        valores = (titulo, genero, ano, imagem_url)
        cursor.execute(sql, valores)
        conn.commit()

        return RespostaPadrao(201, f"Filme {titulo} cadastrado com sucesso.").to_dict()

    except Exception as e:
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