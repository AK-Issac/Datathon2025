// lib/apiService.ts

// --- C'EST LA CORRECTION FINALE ---
// Nous utilisons une variable d'environnement pour l'URL de l'API.
// - En production, Vercel fournira la valeur via les "Environment Variables".
// - En local, si vous n'avez pas de fichier .env.local, il utilisera la valeur par défaut.
// La valeur par défaut est maintenant l'URL HTTPS de votre backend déployé, ce qui résout le problème de "Mixed Content".
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// const BASE_URL = 'http://localhost:5000/api';

/**
 * Envoie un fichier ET son ID unique généré par le frontend au backend Flask.
 * @param file Le fichier sélectionné par l'utilisateur.
 * @param documentId L'ID unique (ex: un timestamp) généré côté frontend.
 * @returns La réponse JSON du serveur, confirmant la réception.
 */
export async function uploadAndStartAnalysis(file: File, documentId: string) {
  // FormData est utilisé pour envoyer des fichiers et des données textuelles ensemble.
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentId', documentId);

  // L'URL construite sera maintenant correcte dans tous les cas :
  // Ex (local avec backend en ligne): https://flask-backend.../api/upload
  // Ex (production):                   https://flask-backend.../api/upload
  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    // Si la réponse n'est pas OK, on tente de lire l'erreur JSON renvoyée par le backend.
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file.');
    } catch (e) {
      // Si la réponse n'est même pas du JSON (ex: erreur réseau CORS), on renvoie une erreur générique.
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
 * Envoie une question au backend pour obtenir une réponse du RAG de Bedrock.
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
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get an answer.');
    } catch (e) {
      throw new Error('Failed to get an answer. The server may be down or unreachable.');
    }
  }
  
  return response.json();
}