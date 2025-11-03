// components/workspace.tsx

"use client"

import { useMemo, useState } from "react"
import TopBar from "./top-bar"
import FileListSidebar from "./file-list-sidebar"
import ChatAssistant from "./chat-assistant"
import UploadModal from "./upload-modal"
import ProcessingUI from "./processing-ui"
import ResultsDashboard from "./results-dashboard"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload } from "lucide-react"

import { ReportRecord } from "@/lib/types"

interface WorkspaceProps {
  reports: ReportRecord[]
  activeReportId: string | null
  onSelectReport: (reportId: string) => void
  onUpload: (files: File[]) => void
  onNewAnalysis: () => void
}

function mapStatusToSidebar(status: ReportStatus): "processed" | "processing" | "failed" {
  if (status === "results") return "processed"
  if (status === "processing") return "processing"
  return "failed"
}

type SidebarFile = {
  id: string
  name: string
  type: string
  timestamp: Date
  status: "processed" | "processing" | "failed"
  evidenceCount: number
  importance: number
}

function InitialUploadZone({ onUploadClick, hasReports }: { onUploadClick: () => void; hasReports: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background p-12 text-center">
      <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-2 text-2xl font-semibold text-foreground">Start a New Analysis</h2>
      <p className="mb-6 text-muted-foreground">
        {hasReports ? "Select an existing report from the sidebar or upload more documents." : "Upload regulatory documents to begin."}
      </p>
      <button
        onClick={onUploadClick}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Upload className="h-5 w-5" />
        Upload Documents
      </button>
    </div>
  )
}

export default function Workspace({ reports, activeReportId, onSelectReport, onUpload, onNewAnalysis }: WorkspaceProps) {
  const [pinnedSnippets, setPinnedSnippets] = useState<any[]>([])
  const [chatContext] = useState<string>("")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const filesForSidebar = useMemo<SidebarFile[]>(() => {
    return reports.map((report) => ({
      id: report.id,
      name: report.name,
      type: "report",
      timestamp: new Date(report.uploadedAt),
      status: mapStatusToSidebar(report.status),
      evidenceCount: report.data?.all_companies?.length ?? 0,
      importance: Math.abs(report.data?.portfolio_impact_score ?? 0),
    }))
  }, [reports])

  const activeReport = useMemo(() => reports.find((report) => report.id === activeReportId) ?? null, [reports, activeReportId])
  const activeFile = useMemo(() => filesForSidebar.find((file) => file.id === activeReportId) ?? null, [filesForSidebar, activeReportId])

  const workspaceState: "empty" | "processing" | "results" | "error" = (() => {
    if (!activeReport) return "empty"
    if (activeReport.status === "processing") return "processing"
    if (activeReport.status === "results") return "results"
    return "error"
  })()

  console.log("Workspace State:", { activeReport, workspaceState });

  const topBarState = activeReport ? workspaceState : reports.length > 0 ? "results" : "empty"

  const handlePinSnippet = (snippet: any) => {
    setPinnedSnippets((prev) => {
      const exists = prev.find((s) => s.id === snippet.id)
      return exists ? prev.filter((s) => s.id !== snippet.id) : [...prev, snippet]
    })
  }

  const renderMainPanel = () => {
    switch (workspaceState) {
      case "processing":
        return <ProcessingUI />
      case "results":
        return <ResultsDashboard reports={reports} activeFile={activeFile} />
      case "error":
        return (
          <div className="p-8 text-center text-red-500">
            {activeReport?.error || "Analysis failed. Please start a new analysis."}
          </div>
        )
      case "empty":
      default:
        return <InitialUploadZone onUploadClick={() => setUploadModalOpen(true)} hasReports={reports.length > 0} />
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        onNewAnalysis={() => {
          onNewAnalysis()
          setUploadModalOpen(true)
        }}
        onUpload={() => setUploadModalOpen(true)}
        state={topBarState}
      />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <FileListSidebar
            files={filesForSidebar}
            activeFile={activeFile}
            onFileSelect={(file) => onSelectReport(file.id)}
            onUpload={onUpload}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <ScrollArea className="h-full">
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
    </div>
  )
}