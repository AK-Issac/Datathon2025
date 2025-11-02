import os
import json
from flask import Blueprint, request, jsonify
import boto3
from botocore.exceptions import ClientError

# Crée un Blueprint pour organiser les routes de l'API
api_blueprint = Blueprint('api', __name__)

# --- CONFIGURATION AWS (depuis .env) ---
# Charge les variables d'environnement de manière sécurisée
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-west-2")

# Le bucket pour les uploads initiaux
UPLOADS_S3_BUCKET = os.getenv("UPLOADS_S3_BUCKET", "s3rpent-uploads")

# Le bucket où les résultats JSON finaux sont stockés
RESULTS_S3_BUCKET = os.getenv("RESULTS_S3_BUCKET", "s3rpent-results")

# Configuration pour le RAG de Bedrock (utilisé par /query)
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID", "WYB2IFQ7KZ")
MODEL_ARN = os.getenv("MODEL_ARN", "arn:aws:bedrock:us-west-2::foundation-model/cohere.command-r-plus-v1:0")


# --- INITIALISATION DES CLIENTS BOTO3 ---
# Un seul endroit pour initialiser les clients pour de meilleures performances
try:
    s3_client = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
    bedrock_agent_client = boto3.client(
        "bedrock-agent-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )
except Exception as e:
    s3_client = None
    bedrock_agent_client = None
    print(f"AVERTISSEMENT: Échec de l'initialisation des clients AWS. Les appels à l'API échoueront. Erreur: {e}")


# --- POINTS DE TERMINAISON DE L'API ---

@api_blueprint.route('/upload', methods=['POST'])
def upload_file():
    """
    Reçoit un fichier et un ID unique ('documentId') du frontend.
    Upload le fichier sur S3 en y attachant l'ID comme métadonnée,
    ce qui est requis par la fonction Lambda en aval.
    """
    if not s3_client:
        return jsonify({"error": "Service de stockage non configuré."}), 503

    if 'file' not in request.files or 'documentId' not in request.form:
        return jsonify({"error": "La requête doit contenir les champs 'file' et 'documentId'."}), 400

    file = request.files['file']
    document_id = request.form['documentId']

    if file.filename == '' or not document_id:
        return jsonify({"error": "Nom de fichier ou documentId manquant."}), 400

    try:
        # Construit la clé S3 en utilisant l'ID comme un "dossier" pour l'organisation
        s3_key = f"{document_id}/{file.filename}"

        print(f"Upload du fichier vers S3. Bucket: {UPLOADS_S3_BUCKET}, Clé: {s3_key}")

        # --- C'EST LA MODIFICATION IMPORTANTE ---
        # Ajoute le 'documentId' aux métadonnées de l'objet S3 via 'ExtraArgs'.
        # C'est ce qui corrige l'erreur "Missing documentId" dans la Lambda.
        s3_client.upload_fileobj(
            file,
            UPLOADS_S3_BUCKET,
            s3_key,
            ExtraArgs={
                'Metadata': {
                    'documentId': document_id
                },
                'ContentType': file.content_type
            }
        )

        return jsonify({
            "message": f"Fichier envoyé avec succès avec l'ID '{document_id}'.",
            "document_id": document_id
        }), 200

    except ClientError as e:
        return jsonify({"error": f"Erreur S3: {e.response['Error']['Code']}"}), 500
    except Exception as e:
        return jsonify({"error": f"Erreur inattendue lors de l'upload: {str(e)}"}), 500


@api_blueprint.route('/status/<document_id>', methods=['GET'])
def get_analysis_status(document_id):
    """
    Vérifie l'existence du fichier de résultats JSON dans le bucket S3 des résultats.
    C'est le point de terminaison que le frontend appelle en boucle (polling).
    """
    if not s3_client:
        return jsonify({"error": "Service de stockage non configuré."}), 503
    if not document_id:
        return jsonify({"error": "Un 'document_id' est requis."}), 400

    expected_results_key = f"final_reports/{document_id}_summary.json"
    print(f"Polling pour le fichier '{expected_results_key}' dans le bucket '{RESULTS_S3_BUCKET}'...")

    try:
        s3_object = s3_client.get_object(Bucket=RESULTS_S3_BUCKET, Key=expected_results_key)
        
        print(f"Fichier de résultats trouvé pour {document_id}! Envoi des données.")
        results_data = json.loads(s3_object['Body'].read().decode('utf-8'))

        return jsonify({
            "status": "COMPLETE",
            "data": results_data
        }), 200

    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchKey':
            print(f"Fichier non trouvé (NoSuchKey). L'analyse pour {document_id} est en cours...")
            return jsonify({"status": "PROCESSING"}), 202
        else:
            print(f"Erreur client AWS inattendue: {e}")
            return jsonify({"error": f"Erreur de service de stockage : {e.response['Error']['Code']}"}), 500
            
    except Exception as e:
        print(f"Erreur inattendue lors de la vérification du statut: {e}")
        return jsonify({"error": "Une erreur inattendue est survenue."}), 500


@api_blueprint.route('/query', methods=['POST'])
def query_knowledge_base():
    """
    Reçoit une question du panneau de chat du frontend et interroge le RAG de Bedrock.
    """
    if not bedrock_agent_client:
        return jsonify({"error": "Le service d'analyse (Bedrock) n'est pas configuré."}), 503

    data = request.get_json()
    question = data.get('question')
    if not question:
        return jsonify({"error": "Le champ 'question' est requis."}), 400

    try:
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
        
        answer = response['output']['text']
        citations = response.get('citations', [])

        return jsonify({"answer": answer, "citations": citations}), 200

    except ClientError as e:
        return jsonify({"error": f"Erreur lors de l'interrogation de Bedrock: {e.response['Error']['Code']}"}), 500
    except Exception as e:
        return jsonify({"error": f"Erreur inattendue lors de la requête: {str(e)}"}), 500