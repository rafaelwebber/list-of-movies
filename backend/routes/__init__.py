from flask import Flask
from routes.filmes_routes import filmes_bp
from routes.usuario_routes import usuario_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(filmes_bp)
    app.register_blueprint(usuario_bp)
    return app
