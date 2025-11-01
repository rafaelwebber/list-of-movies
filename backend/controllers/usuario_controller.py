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

def buscar_usuario_por_id(usuario_id):
    try:
        cursor.execute("SELECT id, nome, email, data_nascimento FROM usuario WHERE id = %s", (usuario_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            return RespostaPadrao(404, "Usuário não encontrado.").to_dict()
        
        dados = {
            "id": usuario[0],
            "nome": usuario[1],
            "email": usuario[2],
            "data_nascimento": str(usuario[3]) if usuario[3] else None
        }
        
        return RespostaPadrao(200, "Dados do usuário.", dados=dados).to_dict()
    
    except Exception as e:
        return RespostaPadrao(500, "Erro ao buscar usuário.", id_erro="USR003").to_dict()

def atualizar_usuario(usuario_id, nome=None, email=None, data_nascimento=None):
    try:
        # Verificar se o usuário existe
        cursor.execute("SELECT id FROM usuario WHERE id = %s", (usuario_id,))
        if not cursor.fetchone():
            return RespostaPadrao(404, "Usuário não encontrado.").to_dict()
        
        # Se email foi fornecido, verificar se já está em uso por outro usuário
        if email:
            cursor.execute("SELECT id FROM usuario WHERE email = %s AND id != %s", (email, usuario_id))
            if cursor.fetchone():
                return RespostaPadrao(409, "Email já está em uso por outro usuário.").to_dict()
        
        # Montar query de atualização dinamicamente
        campos = []
        valores = []
        
        if nome:
            campos.append("nome = %s")
            valores.append(nome)
        if email:
            campos.append("email = %s")
            valores.append(email)
        if data_nascimento:
            campos.append("data_nascimento = %s")
            valores.append(data_nascimento)
        
        if not campos:
            return RespostaPadrao(400, "Nenhum campo para atualizar foi fornecido.").to_dict()
        
        valores.append(usuario_id)
        query = f"UPDATE usuario SET {', '.join(campos)} WHERE id = %s"
        cursor.execute(query, valores)
        conn.commit()
        
        return RespostaPadrao(200, "Dados atualizados com sucesso.").to_dict()
    
    except Exception as e:
        return RespostaPadrao(500, "Erro ao atualizar usuário.", id_erro="USR004").to_dict()

def alterar_senha(usuario_id, senha_atual, nova_senha):
    try:
        if not senha_atual or not nova_senha:
            return RespostaPadrao(400, "Senha atual e nova senha são obrigatórias.").to_dict()
        
        if len(nova_senha) < 6:
            return RespostaPadrao(400, "A nova senha deve ter no mínimo 6 caracteres.").to_dict()
        
        # Buscar usuário e verificar senha atual
        cursor.execute("SELECT senha FROM usuario WHERE id = %s", (usuario_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            return RespostaPadrao(404, "Usuário não encontrado.").to_dict()
        
        if not bcrypt.checkpw(senha_atual.encode(), usuario[0].encode()):
            return RespostaPadrao(401, "Senha atual incorreta.").to_dict()
        
        # Atualizar senha
        nova_senha_hash = bcrypt.hashpw(nova_senha.encode(), bcrypt.gensalt())
        cursor.execute("UPDATE usuario SET senha = %s WHERE id = %s", (nova_senha_hash, usuario_id))
        conn.commit()
        
        return RespostaPadrao(200, "Senha alterada com sucesso.").to_dict()
    
    except Exception as e:
        return RespostaPadrao(500, "Erro ao alterar senha.", id_erro="USR005").to_dict()
