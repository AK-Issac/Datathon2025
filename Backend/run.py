# /Backend/run.py

from app import create_app
from dotenv import load_dotenv

load_dotenv()

# Create the Flask app instance using our factory
app = create_app()

if __name__ == '__main__':
    # This block runs the server when you execute `python run.py`
    app.run(host='0.0.0.0', port=5000, debug=True)