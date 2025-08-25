from flask import Blueprint, request, jsonify
from controllers.filmes_controller import add_filme, listar_filmes

filmes_bp = Blueprint('filmes', __name__, url_prefix='/filmes')

@filmes_bp.route('/', methods=['GET'])
def listar():
    resposta = listar_filmes()
    return jsonify(resposta), resposta["status"]

@filmes_bp.route('/', methods=['POST'])
def adicionar():
    dados = request.get_json()
    titulo = dados.get("titulo")
    resposta = add_filme(titulo)
    return jsonify(resposta), resposta["status"]
