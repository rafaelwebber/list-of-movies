from flask import Blueprint, request, jsonify
from controllers.filmes_controller import add_filme, listar_filmes, vincular_filme_usuario
from controllers.usuario_controller import listar_filmes_por_usuario

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

@filmes_bp.route('/vincular', methods=['POST'])
def vincular():
    dados = request.get_json()
    filme_id = dados.get("filme_id")
    usuario_id = dados.get("usuario_id")
    resposta = vincular_filme_usuario(filme_id, usuario_id)
    return jsonify(resposta), resposta["status_http"]

@filmes_bp.route('/usuario/<int:usuario_id>/filmes', methods=['GET'])
def filmes_por_usuario(usuario_id):
    resposta = listar_filmes_por_usuario(usuario_id)
    return jsonify(resposta), resposta["status"]

