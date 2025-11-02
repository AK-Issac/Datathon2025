# /Backend/app/routes.py

import time
import os
from flask import Blueprint, request, jsonify
import boto3
from botocore.exceptions import ClientError

api_blueprint = Blueprint('api', __name__)

# --- AWS Configuration ---
# These are loaded securely from your .env file
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
S3_BUCKET = os.getenv("S3_BUCKET", "s3rpent-uploads")

# --- NEW: Bedrock Knowledge Base Configuration ---
# It's best practice to put these in your .env file as well
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID", "WYB2IFQ7KZ") 
# Using the model from your friend's working example
MODEL_ARN = os.getenv("MODEL_ARN", "arn:aws:bedrock:us-west-2::foundation-model/cohere.command-r-plus-v1:0")

# --- Boto3 Clients ---
# Initialize the S3 client (for uploads)
s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

# NEW: Initialize the Bedrock Agent Runtime client (for querying)
bedrock_agent_client = boto3.client(
    "bedrock-agent-runtime",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

# --- API Endpoints ---

@api_blueprint.route('/upload', methods=['POST'])
def upload_file():
    """
    Receives a file upload from the frontend, uploads it to S3.
    The Bedrock Knowledge Base will automatically index it.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        # Use the original filename as the key in S3
        file_name = file.filename

        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=file_name,
            Body=file,
            # We don't need the documentId metadata for this RAG workflow
        )

        return jsonify({
            "message": f"File '{file_name}' uploaded successfully and is being indexed.",
            "document_id": file_name # We can use the filename as an identifier for now
        }), 200

    except ClientError as e:
        return jsonify({"error": f"Error uploading to S3: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {e}"}), 500


@api_blueprint.route('/query', methods=['POST'])
def query_knowledge_base():
    """
    Receives a question from the frontend and queries the Bedrock Knowledge Base.
    """
    data = request.get_json()
    question = data.get('question')

    if not question:
        return jsonify({"error": "A 'question' is required."}), 400

    try:
        # This is the core logic from your friend's script
        response = bedrock_agent_client.retrieve_and_generate(
            input={"text": question},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": MODEL_ARN,
                }
            }
        )
        
        # Extract the answer text from the response
        answer = response['output']['text']
        citations = response.get('citations', []) # Include citations if they exist

        return jsonify({
            "answer": answer,
            "citations": citations
        }), 200

    except ClientError as e:
        return jsonify({"error": f"Error querying Bedrock: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error during query: {e}"}), 500