import mysql.connector
import os
from dotenv import load_dotenv
from pathlib import Path

# Carrega variáveis do .env de diferentes locais
env_paths = [
    Path(__file__).parent.parent / '.env',  # backend/.env
    Path(__file__).parent / '.env',  # backend/models/.env
    Path(__file__).parent.parent.parent / '.env',  # raiz do projeto/.env
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        break
else:
    # Se não encontrou em nenhum lugar específico, tentar carregar do diretório atual
    load_dotenv()

# Conexão com o banco
conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

cursor = conn.cursor()
