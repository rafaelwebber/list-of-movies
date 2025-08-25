import mysql.connector
import os
from dotenv import load_dotenv
from pathlib import Path

# Carrega variáveis do .env
env_path = Path(__file__).parent.parent / '.env' / '.env'
load_dotenv(dotenv_path=env_path)

# Conexão com o banco
conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

cursor = conn.cursor()
