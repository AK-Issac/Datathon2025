// lib/apiService.ts


const BASE_URL = 'http://flask-backend.us-west-2.elasticbeanstalk.com/'

/**
 * Envoie un fichier ET son ID unique généré par le frontend au backend Flask.
 * Le backend utilisera cet ID pour nommer le fichier sur S3, ce qui nous permettra de suivre son analyse.
 * @param file Le fichier sélectionné par l'utilisateur.
 * @param documentId L'ID unique (ex: un timestamp) généré côté frontend.
 * @returns La réponse JSON du serveur, confirmant la réception.
 */
export async function uploadAndStartAnalysis(file: File, documentId: string) {
  // FormData est utilisé pour envoyer des fichiers et des données textuelles ensemble.
  const formData = new FormData();
  
  // Ajouter le fichier à la requête
  formData.append('file', file);
  
  // NOUVEAU : Ajouter l'ID unique comme un champ de texte séparé
  // Le nom 'documentId' doit correspondre exactement à ce que Flask attend dans `request.form['documentId']`
  formData.append('documentId', documentId);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    // Note : Ne pas définir manuellement l'en-tête 'Content-Type' lorsque vous utilisez FormData.
    // Le navigateur le fait automatiquement et inclut la "boundary" nécessaire.
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload file.');
  }

  return response.json();
}


/**
 * Interroge le backend pour obtenir le statut d'une analyse en cours.
 * Le backend vérifiera si le fichier de résultats correspondant à l'ID existe sur S3.
 * @param documentId L'ID unique de l'analyse que nous suivons.
 * @returns Une promesse qui se résout avec la réponse du backend (ex: { status: 'PROCESSING' } ou { status: 'COMPLETE', data: {...} }).
 */
export async function checkAnalysisStatus(documentId: string) {
  const response = await fetch(`${BASE_URL}/status/${documentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to check status.');
  }
  
  return response.json();
}


/**
 * Envoie une question au backend pour obtenir une réponse du RAG de Bedrock.
 * Cette fonction est utilisée par le panneau de chat.
 * @param question La question de l'utilisateur.
 * @returns Une promesse qui se résout avec la réponse de l'IA, incluant les citations.
 */
export async function askQuestion(question: string) {
  const response = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get an answer.');
  }
  
  return response.json();
}
