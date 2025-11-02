import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    """
    Usine d'application Flask (Application Factory).
    Initialise et configure l'application Flask, y compris la gestion de CORS.
    """
    # Charge les variables d'environnement depuis le fichier .env
    load_dotenv()
    
    # Crée l'instance de l'application Flask
    app = Flask(__name__)
    
    # --- C'EST LA CORRECTION POUR LE DÉPLOIEMENT ---
    
    # 1. Définir une liste des "origines" autorisées à contacter ce backend.
    #    C'est plus sécurisé que d'autoriser tout le monde avec "*".
    origins = [
        "http://localhost:3000",                  # Pour votre développement frontend local
        "https://datathon2025-ashen.vercel.app"   # Pour votre application Vercel déployée
    ]

    # 2. Initialiser CORS avec cette liste d'origines.
    #    Ceci indiquera aux navigateurs que les requêtes provenant de ces deux URLs
    #    sont autorisées et sécurisées.
    CORS(app, resources={r"/api/*": {"origins": origins}})

    # Charge la configuration depuis le fichier config.py (si vous en avez un)
    # app.config.from_object('config.Config')

    # Enregistre le Blueprint qui contient toutes les routes de notre API
    # Toutes les routes dans routes.py auront le préfixe /api
    from .routes import api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')
    
    # Renvoie l'application configurée
    return app