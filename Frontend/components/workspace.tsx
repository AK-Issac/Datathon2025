// components/workspace.tsx

"use client"

import { useState } from "react"
import TopBar from "./top-bar"
import FileListSidebar from "./file-list-sidebar"
import ChatAssistant from "./chat-assistant"
import UploadModal from "./upload-modal"
import ProcessingUI from "./processing-ui"
import EvidenceModal from "./evidence-modal"
import ResultsDashboard from "./results-dashboard" // Le nouveau composant unifié
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Upload, Bot } from "lucide-react"

interface WorkspaceProps {
  state: "empty" | "processing" | "generating_strategy" | "results" | "error";
  summaryData: any;
  strategyData: any;
  onUpload: (files: File[]) => void;
  onNewAnalysis: () => void;
}

// Sous-composant pour l'état initial (ne change pas)
function InitialUploadZone({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background p-12 text-center">
      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold text-foreground mb-2">Commencer une Nouvelle Analyse</h2>
      <p className="text-muted-foreground mb-6">Uploadez un document réglementaire pour lancer le processus.</p>
      <button
        onClick={onUploadClick}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        <Upload className="h-5 w-5" />
        Uploader un Document
      </button>
    </div>
  );
}

// Sous-composant pour la génération de stratégie (ne change pas)
function GeneratingStrategyUI() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background p-12 text-center">
      <Bot className="h-12 w-12 text-primary mb-4 animate-pulse" />
      <h2 className="text-2xl font-semibold text-foreground mb-2">Génération de la Stratégie</h2>
      <p className="text-muted-foreground max-w-md">Le rapport d'analyse brut est prêt. L'IA de S3rpent formule maintenant des scénarios et des recommandations d'ajustement pour votre portefeuille...</p>
    </div>
  );
}

export default function Workspace({ state, summaryData, strategyData, onUpload, onNewAnalysis }: WorkspaceProps) {
  const [activeFile, setActiveFile] = useState<any>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company)
    setEvidenceModalOpen(true)
  }

  // Décide dynamiquement quoi afficher dans le panneau central
  const renderMainPanel = () => {
    switch(state) {
      case "processing":
      case "generating_strategy": // On peut montrer l'UI de processing pendant la génération de stratégie aussi
        return <ProcessingUI />;
      case "results":
        return <ResultsDashboard 
                  summaryData={summaryData} 
                  strategyData={strategyData}
                  onCompanySelect={handleCompanySelect}
               />;
      case "error":
        return <div className="p-8 text-center text-red-500">L'analyse a échoué. Veuillez réessayer.</div>;
      case "empty":
      default:
        return <InitialUploadZone onUploadClick={() => setUploadModalOpen(true)} />;
    }
  }

  const mockFiles = [ /* Vos données mockées pour la barre de gauche */ ];

  return (
    <div className="flex h-screen flex-col">
      <TopBar onNewAnalysis={onNewAnalysis} onUpload={() => setUploadModalOpen(true)} state={state} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Panneau de gauche (Navigation) */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <FileListSidebar files={mockFiles} activeFile={activeFile} onFileSelect={setActiveFile} onUpload={onUpload} />
        </ResizablePanel>

        <ResizableHandle />

        {/* Panneau central (Contenu principal) */}
        <ResizablePanel defaultSize={50} minSize={30}>
            {renderMainPanel()}
        </ResizablePanel>

        <ResizableHandle />

        {/* Panneau de droite (Toujours le Chatbot RAG) */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <ChatAssistant
            activeFile={activeFile}
            pinnedSnippets={[]}
            chatContext={""}
            onRemoveSnippet={() => {}}
          />
        </ResizablePanel>

      </ResizablePanelGroup>
      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} onUpload={onUpload} />
      {selectedCompany && (
        <EvidenceModal isOpen={evidenceModalOpen} onClose={() => setEvidenceModalOpen(false)} company={selectedCompany} />
      )}
    </div>
  )
}