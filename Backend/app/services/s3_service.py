import boto3
import os
import sys
import time 

# AWS credentials
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-west-2")


s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

# Bucket
uploads_bucket = "s3rpent-uploads"

# Get file path from command line
if len(sys.argv) < 2:
    print("Usage: python upload_to_s3.py /path/to/file [document_id]")
    sys.exit(1)

file_path = sys.argv[1]
file_name = os.path.basename(file_path)

# Optional: pass a document ID or timestamp
if len(sys.argv) >= 3:
    document_id = sys.argv[2]
else:
    document_id = str(int(time.time() * 1000))  # default: current millis

# Upload file with metadata
with open(file_path, "rb") as f:
    s3.put_object(
        Bucket=uploads_bucket,
        Key=file_name,
        Body=f,
        Metadata={
            "documentId": document_id
        }
    )

print(f"Uploaded {file_name} to bucket {uploads_bucket} with documentId={document_id}")