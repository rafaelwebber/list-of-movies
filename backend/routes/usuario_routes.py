from flask import Blueprint, request, jsonify
from controllers.usuario_controller import add_usuario, fazer_login

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
