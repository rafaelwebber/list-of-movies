from models.database import conn, cursor
from models.resposta_padrao import RespostaPadrao
import hashlib

def add_usuario(nome, email, senha):
    if not nome or not email or not senha:
        return RespostaPadrao(400, "Todos os campos são obrigatórios.").to_dict()

    cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
    if cursor.fetchone():
        return RespostaPadrao(409, "Email já cadastrado.").to_dict()

    senha_hash = hashlib.sha256(senha.encode()).hexdigest()
    cursor.execute("INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)", (nome, email, senha_hash))
    conn.commit()

    return RespostaPadrao(201, "Usuário cadastrado com sucesso.").to_dict()


def fazer_login(email, senha):
    if not email or not senha:
        return RespostaPadrao(400, "Email e senha são obrigatórios.").to_dict()

    senha_hash = hashlib.sha256(senha.encode()).hexdigest()
    cursor.execute("SELECT id, nome FROM usuarios WHERE email = %s AND senha = %s", (email, senha_hash))
    usuario = cursor.fetchone()

    if not usuario:
        return RespostaPadrao(401, "Credenciais inválidas.").to_dict()

    return RespostaPadrao(200, "Login realizado com sucesso.", dados={"id": usuario[0], "nome": usuario[1]}).to_dict()
