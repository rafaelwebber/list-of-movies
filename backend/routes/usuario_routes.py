from flask import Blueprint, request, jsonify
from controllers.usuario_controller import (
    add_usuario, 
    fazer_login, 
    buscar_usuario_por_id, 
    atualizar_usuario, 
    alterar_senha,
    atualizar_foto_perfil
)
from controllers.usuario_controller import atualizar_tema

usuario_bp = Blueprint('usuarios', __name__, url_prefix='/usuarios')

@usuario_bp.route('/cadastro', methods=['POST'])
def cadastrar():
    dados = request.get_json()
    nome = dados.get("nome")
    email = dados.get("email")
    data_nascimento = dados.get("data_nascimento")
    senha = dados.get("senha")
    resposta = add_usuario(nome, email, data_nascimento, senha)
    return jsonify(resposta), resposta["status"]

@usuario_bp.route('/login', methods=['POST'])
def login():
    dados = request.get_json()
    email = dados.get("email")
    senha = dados.get("senha")
    resposta = fazer_login(email, senha)
    return jsonify(resposta), resposta["status"]

@usuario_bp.route('/<int:usuario_id>', methods=['GET'])
def buscar_usuario(usuario_id):
    resposta = buscar_usuario_por_id(usuario_id)
    return jsonify(resposta), resposta["status"]

@usuario_bp.route('/<int:usuario_id>', methods=['PUT'])
def atualizar_dados(usuario_id):
    dados = request.get_json()
    nome = dados.get("nome")
    email = dados.get("email")
    data_nascimento = dados.get("data_nascimento")
    resposta = atualizar_usuario(usuario_id, nome, email, data_nascimento)
    return jsonify(resposta), resposta["status"]

@usuario_bp.route('/<int:usuario_id>/senha', methods=['PUT'])
def alterar_senha_usuario(usuario_id):
    dados = request.get_json()
    senha_atual = dados.get("senha_atual")
    nova_senha = dados.get("nova_senha")
    resposta = alterar_senha(usuario_id, senha_atual, nova_senha)
    return jsonify(resposta), resposta["status"]

@usuario_bp.route('/<int:usuario_id>/foto', methods=['PUT'])
def atualizar_foto(usuario_id):
    dados = request.get_json()
    foto_base64 = dados.get("foto_base64")
    resposta = atualizar_foto_perfil(usuario_id, foto_base64)
    return jsonify(resposta), resposta["status"]


@usuario_bp.route('/<int:usuario_id>/tema', methods=['PUT'])
def atualizar_tema_usuario(usuario_id):
    dados = request.get_json() or {}
    tema = dados.get("tema")
    resposta = atualizar_tema(usuario_id, tema)
    return jsonify(resposta), resposta["status"]
