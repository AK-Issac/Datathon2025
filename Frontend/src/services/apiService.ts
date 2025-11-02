// src/services/apiService.ts

const BASE_URL = 'http://localhost:5000/api';

/**
 * Uploads a file to the Flask backend to start the S3 transfer and analysis pipeline.
 * @param file The file selected by the user.
 * @returns The JSON response from the server, which includes the `document_id`.
 */
export async function uploadAndStartAnalysis(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  // If the server returns an error (like 400 or 500), throw an error
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload file.');
  }

  // If the upload was successful, return the JSON response (e.g., { message, document_id })
  return response.json();
}