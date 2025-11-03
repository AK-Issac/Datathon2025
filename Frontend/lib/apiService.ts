// lib/apiService.ts

// --- GESTION PROFESSIONNELLE DE L'URL DE L'API ---
// Cette ligne est la clé pour que votre application fonctionne en local ET sur Vercel.
// 1. Elle essaie de lire la variable d'environnement 'NEXT_PUBLIC_API_URL' (que vous configurez sur Vercel).
// 2. Si elle ne la trouve pas (parce que vous êtes en local), elle utilise 'http://localhost:5000/api' par défaut.
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = 'http://localhost:5000/api';
/**
 * Envoie un fichier ET son ID unique généré par le frontend au backend Flask.
 * @param file Le fichier sélectionné par l'utilisateur.
 * @param documentId L'ID unique (ex: un timestamp) généré côté frontend.
 * @returns La réponse JSON du serveur, confirmant la réception.
 */
export async function uploadAndStartAnalysis(file: File, documentId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentId', documentId);

  // L'URL construite sera correcte dans tous les environnements.
  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file.');
    } catch (e) {
      throw new Error('Failed to upload file. The server may be down, unreachable, or blocking the request.');
    }
  }

  return response.json();
}

/**
 * Interroge le backend pour obtenir le statut d'une analyse en cours.
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
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check status.');
    } catch (e) {
      throw new Error('Failed to check status. The server may be down or unreachable.');
    }
  }
  
  return response.json();
}

/**
 * Envoie une question au backend pour obtenir une réponse du RAG de Bedrock (pour le chatbot).
 * @param question La question de l'utilisateur.
 * @returns Une promesse qui se résout avec la réponse de l'IA.
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
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get an answer.');
    } catch (e) {
      throw new Error('Failed to get an answer. The server may be down or unreachable.');
    }
  }
  
  return response.json();
}

/**
 * Envoie le rapport sommaire au backend pour obtenir une analyse stratégique du LLM "stratège".
 * @param summaryData L'objet JSON du rapport d'analyse brut.
 * @returns Une promesse qui se résout avec le JSON de l'analyse stratégique.
 */
export async function generateStrategicAnalysis(summaryData: any) {
  const response = await fetch(`${BASE_URL}/generate_strategy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(summaryData),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate strategic analysis.');
    } catch (e) {
      throw new Error('Failed to generate strategic analysis. The server may be down or unreachable.');
    }
  }
  
  return response.json();
}