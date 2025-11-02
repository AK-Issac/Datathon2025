// components/workspace.tsx

"use client"

import { useState } from "react"
import TopBar from "./top-bar"
import FileListSidebar from "./file-list-sidebar"
import ChatAssistant from "./chat-assistant"
import UploadModal from "./upload-modal"
import ProcessingUI from "./processing-ui"
import ResultsDashboard from "./results-dashboard"
import EvidenceModal from "./evidence-modal"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area" // <-- Import ScrollArea
import { Upload } from "lucide-react"

interface WorkspaceProps {
  state: "empty" | "processing" | "results" | "error"
  data: any
  onUpload: (files: File[]) => void
  onNewAnalysis: () => void
}

// A new sub-component for the initial, empty state view
function InitialUploadZone({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background p-12 text-center">
      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold text-foreground mb-2">Start a New Analysis</h2>
      <p className="text-muted-foreground mb-6">Upload regulatory documents to begin.</p>
      <button
        onClick={onUploadClick}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        <Upload className="h-5 w-5" />
        Upload Documents
      </button>
    </div>
  );
}

export default function Workspace({ state, data, onUpload, onNewAnalysis }: WorkspaceProps) {
  const [activeFile, setActiveFile] = useState<any>(null)
  const [pinnedSnippets, setPinnedSnippets] = useState<any[]>([])
  const [chatContext, setChatContext] = useState<string>("")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)

  const handlePinSnippet = (snippet: any) => {
    setPinnedSnippets((prev) => {
      const exists = prev.find((s) => s.id === snippet.id)
      return exists ? prev.filter((s) => s.id !== snippet.id) : [...prev, snippet]
    })
  }

  const handleAddToChatContext = (text: string) => setChatContext(text)

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company)
    setEvidenceModalOpen(true)
  }

  // Renders the content of the central panel based on the current state
  const renderMainPanel = () => {
    switch(state) {
      case "processing":
        return <ProcessingUI />;
      case "results":
        return <ResultsDashboard data={data} onCompanySelect={handleCompanySelect} />;
      case "error":
        // You can create a more detailed error component here
        return <div className="p-8 text-center text-red-500">Analysis Failed. Please start a new analysis.</div>;
      case "empty":
      default:
        return <InitialUploadZone onUploadClick={() => setUploadModalOpen(true)} />;
    }
  }

  const mockFiles = [
    { id: "1", name: "EU_AI_Regulation_2024.pdf", type: "pdf", timestamp: new Date(Date.now() - 3600000), status: "processed", evidenceCount: 12, importance: 9.5 },
    { id: "2", name: "White_House_Executive_Order.pdf", type: "pdf", timestamp: new Date(Date.now() - 7200000), status: state === 'processing' ? 'processing' : 'processed', evidenceCount: 0, importance: 8.2 },
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
          <ScrollArea className="h-full"> {/* <-- WRAP IN SCROLL AREA */}
            {renderMainPanel()}
          </ScrollArea>
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