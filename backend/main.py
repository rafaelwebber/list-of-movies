import mysql.connector
import bcrypt
from dotenv import load_dotenv

load_dotenv()
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="123456",
    database="catalago"
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

cursor = conn.cursor()

class RespostaPadrao:
    def __init__(self, status_http: int, mensagem: str, dados=None, id_erro=None):
        self.status_http = status_http  
        self.mensagem = mensagem
        self.dados = dados
        self.id_erro = id_erro

    def to_dict(self):
        resposta = {
            "status_http": self.status_http,
            "mensagem": self.mensagem
        }
        if self.dados is not None:
            resposta["dados"] = self.dados
        if self.id_erro is not None:
            resposta["id_erro"] = self.id_erro
        return resposta
    #"CAMPOS_OBRIGATORIOS": "USR001",
    #"EMAIL_DUPLICADO": "USR002",
    #"ERRO_DESCONHECIDO": "USR999"
    #DB001 : Falha ao conectar com o banco de dados
    #"USUARIO_NAO_ENCONTRADO": "AUTH001",
    #"SENHA_INCORRETA": "AUTH002",
    #"ERRO_LOGIN": "AUTH999"

def add_filme(titulo, genero, ano):
    if not titulo or not genero or not ano:
        return RespostaPadrao(400, "Todos os campos são obrigatorios.").to_dict()
    
    try:
        sql = 'INSERT INTO filmes (titulo, genero, ano) VALUES (%s, %s, %s)'
        valores = (titulo, genero, ano)
        cursor.execute(sql, valores)
        conn.commit()
        return RespostaPadrao(201, f"Filme {titulo} cadastrado com sucesso.").to_dict()
    except ValueError:
        return RespostaPadrao(400, "Ano deve ser um número inteiro.").to_dict()
    except Exception as e:
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


def add_usuario(nome, email, senha, data_nascimento):
    if not nome or not email or not senha or not data_nascimento:
        return RespostaPadrao(400, "Todos os campos são obrigatorios.", id_erro="USR001").to_dict()

    email=email.strip().lower()
    cursor.execute("SELECT id FROM usuario WHERE email = %s", (email,))
    if cursor.fetchone():
        return RespostaPadrao(409, "E-mail já cadastrado.", id_erro="USR002").to_dict()

    senha_hash = bcrypt.hashpw(senha.encode(), bcrypt.gensalt())
    sql = 'INSERT INTO usuario (nome, email, senha, data_nascimento) VALUES(%s, %s, %s, %s)'
    valores = (nome, email, senha_hash, data_nascimento)
    cursor.execute(sql, valores)
    conn.commit()
    return RespostaPadrao(201, f"Usuário {nome} cadastrado com sucesso!").to_dict()


def fazer_login(email, senha, cursor):
    if not email or not senha:
        return RespostaPadrao(400, "E-mail e senha são obrigatórios.", id_erro="LOGIN001").to_dict()

    email = email.strip().lower()
    cursor.execute("SELECT id, nome, senha FROM usuario WHERE email = %s", (email,))
    usuario = cursor.fetchone()

    if not usuario:
        return RespostaPadrao(404, "Usuário não encontrado.", id_erro="LOGIN002").to_dict()

    id_usuario, nome_usuario, senha_hash = usuario

    if not bcrypt.checkpw(senha.encode(), senha_hash.encode() if isinstance(senha_hash, str) else senha_hash):
        return RespostaPadrao(401, "Senha incorreta.", id_erro="LOGIN003").to_dict()

    return RespostaPadrao(200, f"Login realizado com sucesso. Bem-vindo, {nome_usuario}!", id_erro=None).to_dict()

print(fazer_login("rafael@email.com", "senha123", cursor))  

conn.close()