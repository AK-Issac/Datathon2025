// components/workspace.tsx

"use client"

import { useState } from "react"
import TopBar from "./top-bar"
import FileListSidebar from "./file-list-sidebar"
import DocumentViewer from "./document-viewer"
import ChatAssistant from "./chat-assistant"
import UploadModal from "./upload-modal"
import ProcessingUI from "./processing-ui" // <-- IMPORT the processing UI
import ResultsDashboard from "./results-dashboard" // <-- IMPORT the results UI
import EvidenceModal from "./evidence-modal" // <-- IMPORT the evidence modal
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Upload } from "lucide-react"

interface WorkspaceProps {
  state: "empty" | "processing" | "results" | "error" // <-- Add 'error' state
  data: any
  onUpload: (files: File[]) => void // <-- Correctly type the prop
  onNewAnalysis: () => void
}

export default function Workspace({ state, data, onUpload, onNewAnalysis }: WorkspaceProps) {
  const [activeFile, setActiveFile] = useState<any>(null)
  const [pinnedSnippets, setPinnedSnippets] = useState<any[]>([])
  const [chatContext, setChatContext] = useState<string>("")
  const [highlightedChunks, setHighlightedChunks] = useState<string[]>([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)

  const handlePinSnippet = (snippet: any) => {
    setPinnedSnippets((prev) => {
      const exists = prev.find((s) => s.id === snippet.id)
      return exists ? prev.filter((s) => s.id !== snippet.id) : [...prev, snippet]
    })
  }

  const handleAddToChatContext = (text: string) => {
    setChatContext(text)
  }

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company)
    setEvidenceModalOpen(true)
  }

  // --- RENDER LOGIC BASED ON STATE ---

  if (state === "empty" || state === "error") {
    return (
      <div className="flex h-screen flex-col">
        <TopBar onNewAnalysis={onNewAnalysis} onUpload={() => setUploadModalOpen(true)} state={state} />
        <div className="flex flex-1 items-center justify-center bg-background">
          <div className="text-center space-y-6">
            {state === "error" && (
                <h2 className="text-2xl font-semibold text-red-500 mb-2">Upload Failed</h2>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Start Analyzing Regulations</h2>
              <p className="text-muted-foreground">Upload regulatory documents to begin your analysis</p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-5 w-5" />
              {state === "error" ? "Try Again" : "Upload Documents"}
            </button>
          </div>
        </div>
        <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} onUpload={onUpload} />
      </div>
    )
  }
  
  if (state === "processing") {
      return (
          <div className="flex h-screen flex-col">
              <TopBar onNewAnalysis={onNewAnalysis} onUpload={() => {}} state={state} />
              <div className="flex flex-1 items-center justify-center bg-background">
                  <ProcessingUI />
              </div>
          </div>
      )
  }

  // --- RESULTS VIEW ---
  const mockFiles = [
    {
      id: "1",
      name: data?.fileName || "EU_AI_Regulation_2024.pdf",
      type: "pdf",
      timestamp: new Date(),
      status: "processed",
      evidenceCount: 12,
      importance: 9.5,
    }
  ];

  return (
    <div className="flex h-screen flex-col">
      <TopBar onNewAnalysis={onNewAnalysis} onUpload={() => setUploadModalOpen(true)} state={state} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <FileListSidebar files={mockFiles} activeFile={activeFile} onFileSelect={setActiveFile} onUpload={onUpload} />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          {/* Main content is now the results dashboard */}
          <ResultsDashboard data={data} onCompanySelect={handleCompanySelect} />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <ChatAssistant
            activeFile={activeFile}
            pinnedSnippets={pinnedSnippets}
            chatContext={chatContext}
            onRemoveSnippet={handlePinSnippet}
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