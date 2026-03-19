from flask import Blueprint, request, jsonify
from controllers.filmes_controller import add_filme, listar_filmes, vincular_filme_usuario, buscar_filmes, listar_recomendacoes
from controllers.usuario_controller import listar_filmes_por_usuario, avaliar_filme_usuario, remover_filme_usuario

filmes_bp = Blueprint('filmes', __name__, url_prefix='/filmes')

@filmes_bp.route('/', methods=['GET'])
def listar():
    resposta = listar_filmes()
    return jsonify(resposta), resposta["status"]

@filmes_bp.route('/buscar', methods=['GET'])
def buscar():
    termo_busca = request.args.get('q')
    resposta = buscar_filmes(termo_busca)
    return jsonify(resposta), resposta["status"]

@filmes_bp.route('/', methods=['POST'])
def adicionar():
    dados = request.get_json() or {}
    titulo = dados.get("titulo")
    ano = dados.get("ano")
    imagem_url = dados.get("imagem_url")
    resposta = add_filme(titulo, ano=ano, imagem_url=imagem_url)
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

@filmes_bp.route('/usuario/<int:usuario_id>/filmes/<int:filme_id>', methods=['DELETE'])
def remover_filme(usuario_id, filme_id):
    resposta = remover_filme_usuario(usuario_id, filme_id)
    return jsonify(resposta), resposta["status"]

@filmes_bp.route('/recomendacoes', methods=['GET'])
def recomendacoes():
    usuario_id = request.args.get('usuario_id')
    if not usuario_id:
        return jsonify({"status": 400, "mensagem": "usuario_id obrigatório"}), 400
    resposta = listar_recomendacoes(int(usuario_id))
    return jsonify(resposta), resposta["status"]

@filmes_bp.route('/avaliar', methods=['POST'])
def avaliar_filme():
    dados = request.get_json()
    usuario_id = dados.get("usuario_id")
    filme_id = dados.get("filme_id")
    nota = dados.get("nota")

    resposta = avaliar_filme_usuario(usuario_id, filme_id, nota)
    return jsonify(resposta), resposta["status"]
