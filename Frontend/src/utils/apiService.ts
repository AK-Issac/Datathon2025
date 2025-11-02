// lib/apiService.ts

const BASE_URL = 'http://localhost:5000/api';

/**
 * Uploads a file to the Flask backend.
 */
export async function uploadAndStartAnalysis(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload file.');
  }

  return response.json();
}

/**
 * NEW: Sends a question to the backend to be answered by the Bedrock RAG.
 * @param question The user's question string.
 * @returns The JSON response from the server, containing the `answer` and `citations`.
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