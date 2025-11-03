from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    load_dotenv()
    app = Flask(__name__)

    origins = [
        "http://localhost:3000",
        "https://datathon2025-ashen.vercel.app"
    ]

    CORS(
        app,
        resources={r"/api/*": {"origins": origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "OPTIONS"]
    )

    from .routes import api_blueprint
    app.register_blueprint(api_blueprint, url_prefix="/api")

    @app.route("/health")
    def health():
        return "OK", 200

<<<<<<< HEAD
    return app
=======
    return app
>>>>>>> c80425ee23b1bd01385a5d6d16a8b019c4fab1cd
