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

# --- CONFIGURATION RAG (depuis .env) ---
# Ces valeurs sont spécifiques à votre configuration Bedrock Knowledge Base
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID", "SEOJ7RDOJJ")
MODEL_ARN = os.getenv("MODEL_ARN", "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0")

# --- CONFIGURATION DU MODÈLE STRATÉGIQUE (depuis .env) ---
STRATEGY_MODEL_ID = os.getenv("STRATEGY_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")


# --- INITIALISATION DES CLIENTS BOTO3 ---
try:
    s3_client = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
    bedrock_agent_runtime_client = boto3.client(
        "bedrock-agent-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )
    bedrock_runtime_client = boto3.client(
        "bedrock-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
except Exception as e:
    s3_client = None
    bedrock_agent_runtime_client = None
    bedrock_runtime_client = None
    print(f"AVERTISSEMENT: Échec de l'initialisation des clients AWS. Erreur: {e}")


# --- POINTS DE TERMINAISON DE L'API ---

@api_blueprint.route('/upload', methods=['POST'])
def upload_file():
    """
    Reçoit un fichier et un ID unique ('documentId') du frontend.
    Upload le fichier sur S3 en y attachant l'ID comme métadonnée.
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
        s3_key = f"{document_id}/{file.filename}"
        s3_client.upload_fileobj(
            file,
            UPLOADS_S3_BUCKET,
            s3_key,
            ExtraArgs={
                'Metadata': {'documentId': document_id},
                'ContentType': file.content_type
            }
        )
        return jsonify({"message": f"Fichier envoyé avec succès avec l'ID '{document_id}'.", "document_id": document_id}), 200
    except ClientError as e:
        return jsonify({"error": f"Erreur S3: {e.response['Error']['Code']}"}), 500
    except Exception as e:
        return jsonify({"error": f"Erreur inattendue lors de l'upload: {str(e)}"}), 500


@api_blueprint.route('/status/<document_id>', methods=['GET'])
def get_analysis_status(document_id):
    """
    Vérifie l'existence du fichier de résultats JSON dans le bucket S3 des résultats.
    """
    if not s3_client:
        return jsonify({"error": "Service de stockage non configuré."}), 503
    if not document_id:
        return jsonify({"error": "Un 'document_id' est requis."}), 400

    expected_results_key = f"final_reports/{document_id}_summary.json"
    try:
        s3_object = s3_client.get_object(Bucket=RESULTS_S3_BUCKET, Key=expected_results_key)
        results_data = json.loads(s3_object['Body'].read().decode('utf-8'))
        return jsonify({"status": "COMPLETE", "data": results_data}), 200
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchKey':
            return jsonify({"status": "PROCESSING"}), 202
        else:
            return jsonify({"error": f"Erreur de service de stockage : {e.response['Error']['Code']}"}), 500
    except Exception as e:
        return jsonify({"error": f"Une erreur inattendue est survenue lors de la vérification du statut: {str(e)}"}), 500


@api_blueprint.route('/query', methods=['POST'])
def query_knowledge_base():
    """
    Interroge le RAG de Bedrock avec la nouvelle configuration détaillée.
    """
    if not bedrock_agent_runtime_client:
        return jsonify({"error": "Le service d'analyse (Bedrock RAG) n'est pas configuré."}), 503
        
    data = request.get_json()
    question = data.get('question')
    if not question:
        return jsonify({"error": "Le champ 'question' est requis."}), 400
        
    try:
        print(f"Interrogation du RAG avec la question : '{question}'")
        
        # Utilisation de la nouvelle configuration complète pour l'appel RAG
        response = bedrock_agent_runtime_client.retrieve_and_generate(
            input={"text": question},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": MODEL_ARN,
                    "retrievalConfiguration": {
                        "vectorSearchConfiguration": {"numberOfResults": 5}
                    },
                    "generationConfiguration": {
                        "inferenceConfig": {"textInferenceConfig": {"temperature": 0.1, "maxTokens": 2048, "stopSequences": ["\nObservation"]}}
                    },
                    "orchestrationConfiguration": {
                        "queryTransformationConfiguration": {"type": "QUERY_DECOMPOSITION"},
                        "inferenceConfig": {"textInferenceConfig": {"temperature": 0.1, "maxTokens": 2048, "stopSequences": ["\nObservation"]}}
                    }
                }
            }
        )
        answer = response['output']['text']
        citations = response.get('citations', [])
        
        print("Réponse du RAG obtenue avec succès.")
        return jsonify({"answer": answer, "citations": citations}), 200
        
    except ClientError as e:
        # Ajout de logs détaillés pour un meilleur débogage
        print(f"!!! ERREUR CLIENT AWS (Boto3) lors de la requête RAG: {e}")
        return jsonify({"error": f"Erreur lors de l'interrogation de Bedrock RAG: {e.response['Error']['Code']}"}), 500
    except Exception as e:
        # Ajout de logs détaillés pour un meilleur débogage
        print(f"!!! ERREUR INATTENDUE (Python) lors de la requête RAG: {e}")
        return jsonify({"error": f"Erreur inattendue lors de la requête RAG: {str(e)}"}), 500


@api_blueprint.route('/generate_strategy', methods=['POST', 'OPTIONS'])
def generate_strategy():
    """Génère une stratégie à partir d’un rapport d’analyse."""
    if not bedrock_runtime_client:
        return jsonify({"error": "Service d'analyse (Bedrock) non configuré."}), 503

    report_data = request.get_json()
    if not report_data:
        return jsonify({"error": "Les données du rapport d'analyse sont requises."}), 400

    prompt = f"""Tu es un analyste financier et de gestion des risques spécialisé dans l’évaluation d’impact sectoriel et réglementaire.
On te fournit un document JSON issu d’une analyse contenant un résumé exécutif, des métriques de risque et une liste de risques actionnables :
{json.dumps(report_data, indent=2)}

Ta tâche :
1️⃣ Simule deux scénarios (optimiste et pessimiste).
2️⃣ Évalue les risques par domaine (faible / modéré / élevé) et relie-les à des secteurs et zones géographiques.
3️⃣ Identifie les entreprises les plus à risque et propose des ajustements concrets.

Réponds en français dans un JSON structuré :
{{
  "scenarios": [
    {{ "type": "optimiste", "description": "...", "impact_portefeuille": "..." }},
    {{ "type": "pessimiste", "description": "...", "impact_portefeuille": "..." }}
  ],
  "risk_assessment": [
    {{ "domaine": "...", "niveau": "...", "secteurs_affectes": "...", "zones_geographiques": "..." }}
  ],
  "recommended_actions": [
    {{ "entreprises_concernees": "...", "actions_proposees": "..." }}
  ]
}}"""

    try:
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}]
        })

        response = bedrock_runtime_client.invoke_model(
            body=body,
            modelId=STRATEGY_MODEL_ID,
            accept='application/json',
            contentType='application/json'
        )

        response_body = json.loads(response.get("body").read())
        strategy_json_string = response_body.get("content")[0].get("text", "")

        if strategy_json_string.strip().startswith("```json"):
            strategy_json_string = strategy_json_string.strip()[7:-3]

        strategy_data = json.loads(strategy_json_string)
        return jsonify(strategy_data), 200

    except ClientError as e:
        return jsonify({"error": f"Erreur Bedrock : {e.response['Error']['Code']}"}), 500
    except json.JSONDecodeError:
        return jsonify({"error": "Le LLM a renvoyé une réponse JSON invalide."}), 500
    except Exception as e:
        return jsonify({"error": f"Erreur inattendue : {str(e)}"}), 500