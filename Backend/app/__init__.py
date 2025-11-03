import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    """
    Factory for creating the Flask app.
    Configures CORS for local frontend communication.
    """
    load_dotenv()
    app = Flask(__name__)

    # Allow only localhost frontend (you can add others later)
    origins = ["http://localhost:3000"]

    # Enable CORS for all routes during local development
    CORS(
        app,
        resources={r"/*": {"origins": origins}},
        methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True
    )

    # Register routes
    from .routes import api_blueprint
    app.register_blueprint(api_blueprint, url_prefix="/api")

    # Health check
    @app.route("/health")
    def health():
        return "OK", 200

    # Ensure CORS headers are added after every request
    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    return app
