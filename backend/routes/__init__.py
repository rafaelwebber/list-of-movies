from flask import Flask, send_from_directory
from routes.filmes_routes import filmes_bp
from routes.usuario_routes import usuario_bp
from flask_cors import CORS
from pathlib import Path

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

    @app.route('/')
    def index():
        return {'mensagem': 'API List of Movies - Use o frontend em http://localhost:3000', 'status': 200}, 200
    
    # Registrar rota para servir arquivos de upload
    @app.route('/uploads/fotos_perfil/<filename>')
    def servir_foto_perfil(filename):
        upload_dir = Path(__file__).parent.parent / 'uploads' / 'fotos_perfil'
        return send_from_directory(str(upload_dir), filename)
    
    app.register_blueprint(filmes_bp)
    app.register_blueprint(usuario_bp)
    return app
