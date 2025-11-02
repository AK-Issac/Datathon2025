// app/page.tsx

"use client"

import { useState } from "react"
import Workspace from "@/components/workspace"
import { uploadAndStartAnalysis } from "@/lib/apiService" // <-- IMPORT the new API service

export default function Home() {
  // Add an 'error' state for robust handling
  const [analysisState, setAnalysisState] = useState<"empty" | "processing" | "results" | "error">("empty")
  
  // State to hold the final analysis data for the dashboard
  const [analysisData, setAnalysisData] = useState<any>(null)

  // State to hold the unique ID of the current job
  const [documentId, setDocumentId] = useState<string | null>(null)

  /**
   * This function is the core of the upload process.
   * It receives the files from the UploadModal, sends the first one to the backend,
   * and manages the UI state transitions.
   */
  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    // For this workflow, we'll process the first selected file.
    const fileToUpload = files[0];

    setAnalysisState("processing") // Immediately show the processing UI

    try {
      // 1. Call the API service to send the file to the backend
      const result = await uploadAndStartAnalysis(fileToUpload);
      
      // 2. The backend returns a document_id. Store it.
      console.log("Backend response:", result);
      setDocumentId(result.document_id);

      // --- MOCKING THE ASYNC LAMBDA WORKFLOW ---
      // In a real app, you'd start polling a /status endpoint here.
      // For now, we simulate a delay before showing the results.
      setTimeout(() => {
        // Prepare mock data for the results dashboard
        setAnalysisData({
          fileName: fileToUpload.name,
          uploadedAt: new Date().toISOString(),
        });
        setAnalysisState("results")
      }, 5000); // 5-second simulated processing time

    } catch (error) {
      console.error("Error during upload:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
      setAnalysisState("error"); // Set the error state to show a failure message
    }
  }

  // Resets the application to its initial state
  const handleNewAnalysis = () => {
    setAnalysisState("empty")
    setAnalysisData(null)
    setDocumentId(null)
  }

  return (
    <main className="min-h-screen bg-background">
      <Workspace 
        state={analysisState} 
        data={analysisData} 
        onUpload={handleUpload} 
        onNewAnalysis={handleNewAnalysis} 
      />
    </main>
  )
}