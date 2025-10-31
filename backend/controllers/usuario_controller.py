from models.database import conn, cursor
from models.resposta_padrao import RespostaPadrao
import bcrypt

def add_usuario(nome, email, data_nascimento, senha):
    if not nome or not email or not senha or not data_nascimento:
        return RespostaPadrao(400, "Todos os campos são obrigatórios.").to_dict()

    cursor.execute("SELECT id FROM usuario WHERE email = %s", (email,))
    if cursor.fetchone():
        return RespostaPadrao(409, "Email já cadastrado.").to_dict()

    senha_hash = bcrypt.hashpw(senha.encode(), bcrypt.gensalt())
    cursor.execute("INSERT INTO usuario (nome, email, data_nascimento, senha) VALUES (%s, %s, %s, %s)", (nome, email, data_nascimento, senha_hash))
    conn.commit()

    return RespostaPadrao(201, "Usuário cadastrado com sucesso.").to_dict()


def fazer_login(email, senha):
    if not email or not senha:
        return RespostaPadrao(400, "Email e senha são obrigatórios.").to_dict()

    cursor.execute("SELECT id, nome, senha FROM usuario WHERE email = %s" , (email,))
    usuario = cursor.fetchone()

    if not usuario or not bcrypt.checkpw(senha.encode(), usuario[2].encode()):
        return RespostaPadrao(401, "Credenciais inválidas.").to_dict()

    return RespostaPadrao(200, "Login realizado com sucesso.", dados={"id": usuario[0], "nome": usuario[1]}).to_dict()

def listar_filmes_por_usuario(usuario_id):
    try:
        cursor.execute("""
            SELECT f.id, f.titulo, f.genero, f.ano, f.imagem_url, uf.nota
            FROM filmes f
            JOIN usuario_filme uf ON f.id = uf.filme_id
            WHERE uf.usuario_id = %s
        """, (usuario_id,))
        filmes = cursor.fetchall()

        if not filmes:
            return RespostaPadrao(200, "Usuário não possui filmes vinculados.", dados=[]).to_dict()

        lista = [{"id": f[0], "titulo": f[1], "genero": f[2], "ano": f[3], "imagem_url": f[4], "nota": f[5]} for f in filmes]
        return RespostaPadrao(200, "Filmes do usuário.", dados=lista).to_dict()
    
    except Exception as e:
        return RespostaPadrao(500, "Erro ao listar filmes do usuário.", id_erro="FILMEUSR002").to_dict()

def avaliar_filme_usuario(usuario_id, filme_id, nota):
    try:
        if nota < 1 or nota > 5:
            return RespostaPadrao(400, "Nota inválida. Use valores de 1 a 5.").to_dict()

        cursor.execute("""
            SELECT * FROM usuario_filme
            WHERE usuario_id = %s AND filme_id = %s
        """, (usuario_id, filme_id))
        if not cursor.fetchone():
            return RespostaPadrao(404, "Filme não vinculado ao usuário.").to_dict()

        cursor.execute("""
            UPDATE usuario_filme
            SET nota = %s
            WHERE usuario_id = %s AND filme_id = %s
        """, (nota, usuario_id, filme_id))
        conn.commit()

        return RespostaPadrao(200, "Avaliação registrada com sucesso.").to_dict()

    except Exception as e:
        return RespostaPadrao(500, "Erro ao avaliar filme.", id_erro="AVALFILME001").to_dict()
