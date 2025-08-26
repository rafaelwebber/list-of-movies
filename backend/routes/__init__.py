from flask import Flask
from routes.filmes_routes import filmes_bp
from routes.usuario_routes import usuario_bp
<<<<<<< HEAD
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app) 
=======

def create_app():
    app = Flask(__name__)
>>>>>>> 208880cba3f5f2081aecb6b34a15a4f31fe95439
    app.register_blueprint(filmes_bp)
    app.register_blueprint(usuario_bp)
    return app
