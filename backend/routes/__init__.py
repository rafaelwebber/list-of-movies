from flask import Flask
from routes.filmes_routes import filmes_bp
from routes.usuario_routes import usuario_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app) 
    app.register_blueprint(filmes_bp)
    app.register_blueprint(usuario_bp)
    return app
