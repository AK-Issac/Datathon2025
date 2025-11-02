# /Backend/app/routes.py

import time
import os
from flask import Blueprint, request, jsonify
import boto3
from botocore.exceptions import ClientError

api_blueprint = Blueprint('api', __name__)

# AWS configuration
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
S3_BUCKET = os.getenv("S3_BUCKET", "s3rpent-uploads")

s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)


@api_blueprint.route('/upload', methods=['POST'])
def upload_file():
    """
    Receives a file upload from the frontend or Postman,
    assigns it a unique document ID (timestamp-based),
    uploads it to S3 with metadata, and returns confirmation.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        # Generate a timestamp-based document ID
        document_id = str(int(time.time() * 1000))
        file_name = file.filename

        # Upload file with metadata
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=file_name,
            Body=file,
            Metadata={"documentId": document_id}
        )

        return jsonify({
            "message": f"File {file_name} uploaded successfully.",
            "document_id": document_id,
            "bucket": S3_BUCKET
        }), 200

    except ClientError as e:
        return jsonify({"error": f"Error uploading to S3: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {e}"}), 500
