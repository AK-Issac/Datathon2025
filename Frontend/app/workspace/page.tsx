// app/workspace/page.tsx

"use client"

import { useState, useEffect } from "react"
import Workspace from "@/components/workspace"
import { uploadAndStartAnalysis, checkAnalysisStatus, generateStrategicAnalysis } from "@/lib/apiService" 

export default function WorkspacePage() {
  const [analysisState, setAnalysisState] = useState<"empty" | "processing" | "results" | "error">("empty");
  const [summaryData, setSummaryData] = useState<any>(null);
  const [strategyData, setStrategyData] = useState<any>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

  useEffect(() => {
    if (analysisState !== 'processing' || !documentId) return;

    const intervalId = setInterval(async () => {
      try {
        const statusResponse = await checkAnalysisStatus(documentId);
        
        if (statusResponse.status === 'COMPLETE') {
          clearInterval(intervalId); // 1. Arrêter le polling, nous avons le résumé.
          console.log("Rapport d'analyse brut reçu :", statusResponse.data);

          // --- C'EST LA CORRECTION PRINCIPALE ---
          
          // 2. Mettre à jour l'UI IMMÉDIATEMENT avec le résumé.
          setSummaryData(statusResponse.data);
          setAnalysisState("results"); // Passer à l'état final pour afficher le panneau central.
          
          // 3. Tenter de générer la stratégie en arrière-plan, SANS bloquer l'interface.
          try {
            console.log("Demande de l'analyse stratégique en arrière-plan...");
            const strategicResponse = await generateStrategicAnalysis(statusResponse.data);
            console.log("Analyse stratégique générée :", strategicResponse);
            
            // Mettre à jour l'état de la stratégie quand la réponse arrive.
            setStrategyData(strategicResponse); 
          } catch (strategyError) {
            console.error("Échec de la génération de la stratégie (non bloquant) :", strategyError);
            // On peut stocker un objet d'erreur pour l'afficher dans le panneau de stratégie.
            setStrategyData({ error: "La génération de l'analyse stratégique a échoué." });
          }
        }
      } catch (error) {
        console.error("Erreur lors du polling :", error);
        setAnalysisState("error");
        clearInterval(intervalId);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [analysisState, documentId]);

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const fileToUpload = files[0];
    setAnalysisState("processing");
    try {
      const uniqueId = String(Date.now());
      await uploadAndStartAnalysis(fileToUpload, uniqueId);
      setDocumentId(uniqueId); 
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setAnalysisState("error");
    }
  }

  const handleNewAnalysis = () => {
    setAnalysisState("empty");
    setSummaryData(null);
    setStrategyData(null);
    setDocumentId(null);
  }

  return (
    <main className="min-h-screen bg-background">
      <Workspace 
        state={analysisState} 
        summaryData={summaryData}
        strategyData={strategyData}
        onUpload={handleUpload} 
        onNewAnalysis={handleNewAnalysis} 
      />
    </main>
  )
}