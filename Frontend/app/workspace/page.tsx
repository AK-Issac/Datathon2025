// app/workspace/page.tsx

"use client"

import { useState, useEffect } from "react"
import Workspace from "@/components/workspace"
import { uploadAndStartAnalysis, checkAnalysisStatus } from "@/lib/apiService"

export default function WorkspacePage() {
  const [analysisState, setAnalysisState] = useState<"empty" | "processing" | "results" | "error">("empty")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)

  // Le useEffect pour le polling reste exactement le même, il est déjà correct.
  useEffect(() => {
    if (analysisState !== 'processing' || !documentId) return;

    const intervalId = setInterval(async () => {
      try {
        const statusResponse = await checkAnalysisStatus(documentId);
        if (statusResponse.status === 'COMPLETE') {
          setAnalysisData(statusResponse.data);
          setAnalysisState("results");
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error("Error during polling:", error);
        setAnalysisState("error");
        clearInterval(intervalId);
      }
    }, 10000); // Poll toutes les 10 secondes

    return () => clearInterval(intervalId);
  }, [analysisState, documentId]);

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const fileToUpload = files[0];
    setAnalysisState("processing");

    try {
      // --- C'EST LA NOUVELLE LOGIQUE ---
      // 1. Générer un ID unique basé sur le timestamp, comme dans l'exemple.
      const uniqueId = String(Date.now());
      
      // 2. Envoyer le fichier ET l'ID au backend.
      await uploadAndStartAnalysis(fileToUpload, uniqueId);
      
      // 3. Définir l'ID pour que le polling puisse commencer.
      setDocumentId(uniqueId); 
      
    } catch (error) {
      console.error("Error during upload:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
      setAnalysisState("error");
    }
  }

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