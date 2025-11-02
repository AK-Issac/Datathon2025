import os
from flask import Flask
from flask_cors import CORS  # <-- 1. IMPORT THE LIBRARY
from dotenv import load_dotenv

def create_app():
    """Flask application factory."""
    load_dotenv()
    
    app = Flask(__name__)
    
    # --- THIS IS THE FIX ---
    # 2. INITIALIZE CORS
    # This tells the browser that any origin ('*') is allowed to make requests
    # to any of your routes that start with /api/.
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Load configuration from config.py if you have it
    # app.config.from_object('config.Config')

    # Register the blueprint that contains all our API routes
    from .routes import api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')
    
    @app.route("/health")
    def health():
        return "OK", 200

    return app