import requests
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent / '.env' / '.env'
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

def buscar_filme_por_titulo(titulo, idioma="pt-BR"):
    url = f"{BASE_URL}/search/movie"
    params = {
        "api_key": API_KEY,
        "query": titulo,
        "language": idioma
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get("results", [])
    else:
        return []

def montar_url_imagem(caminho):
    if caminho:
        return f"{IMAGE_BASE_URL}{caminho}"
    return None

GENERO_MAP = {
    28: "Ação",
    12: "Aventura",
    16: "Animação",
    35: "Comédia",
    80: "Crime",
    99: "Documentário",
    18: "Drama",
    10751: "Família",
    14: "Fantasia",
    36: "História",
    27: "Terror",
    10402: "Música",
    9648: "Mistério",
    10749: "Romance",
    878: "Ficção científica",
    10770: "Cinema TV",
    53: "Thriller",
    10752: "Guerra",
    37: "Faroeste"
}

