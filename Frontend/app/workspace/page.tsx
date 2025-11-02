// app/workspace/page.tsx

"use client"

import { useState } from "react"
import Workspace from "@/components/workspace"
import { uploadAndStartAnalysis } from "@/lib/apiService"

export default function WorkspacePage() {
  const [analysisState, setAnalysisState] = useState<"empty" | "processing" | "results" | "error">("empty")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const fileToUpload = files[0];
    setAnalysisState("processing")

    try {
      const result = await uploadAndStartAnalysis(fileToUpload);
      console.log("Backend response:", result);
      setDocumentId(result.document_id);

      setTimeout(() => {
        setAnalysisData({
          fileName: fileToUpload.name,
          uploadedAt: new Date().toISOString(),
          // Add other mock data for the dashboard to use
        });
        setAnalysisState("results")
      }, 5000);

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