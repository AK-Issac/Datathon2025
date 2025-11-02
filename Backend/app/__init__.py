import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    load_dotenv()
    app = Flask(__name__)

    # Assurez-vous que cette configuration est bien en place
    origins = [
        "http://localhost:3000",                  # Pour votre développement local
        "https://datathon2025-ashen.vercel.app"   # Pour votre déploiement Vercel

    ]
    CORS(app, resources={r"/api/*": {"origins": origins}})

    from .routes import api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')
    
    @app.route("/health")
    def health():
        return "OK", 200

    return app