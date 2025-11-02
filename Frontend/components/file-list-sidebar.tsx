"use client"

import { useState } from "react"
import { Search, Upload, Plus, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface File {
  id: string
  name: string
  type: string
  timestamp: Date
  status: "processed" | "processing" | "failed"
  evidenceCount: number
  importance: number
}

interface FileListSidebarProps {
  files: File[]
  activeFile: File | null
  onFileSelect: (file: File) => void
  onUpload: (data: any) => void
}

export default function FileListSidebar({ files, activeFile, onFileSelect, onUpload }: FileListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"date" | "importance">("date")

  const filteredFiles = files
    .filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((file) => !filterStatus || file.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "date") return b.timestamp.getTime() - a.timestamp.getTime()
      return b.importance - a.importance
    })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; label: string }> = {
      processed: { bg: "bg-green-500/10", text: "text-green-700", label: "Processed" },
      processing: { bg: "bg-yellow-500/10", text: "text-yellow-700", label: "Processing" },
      failed: { bg: "bg-red-500/10", text: "text-red-700", label: "Failed" },
    }
    const variant = variants[status] || variants.processed
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded ${variant.bg} ${variant.text}`}>{variant.label}</span>
    )
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return "Yesterday"
    return `${days}d ago`
  }

  return (
    <div className="flex h-full flex-col border-r border-border bg-sidebar">
      {/* Header with Action Bar */}
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Analysis Title</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setFilterStatus(filterStatus === "processed" ? null : "processed")}
            className={`rounded px-2 py-1 ${filterStatus === "processed" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            Processed
          </button>
          <button
            onClick={() => setFilterStatus(filterStatus === "processing" ? null : "processing")}
            className={`rounded px-2 py-1 ${filterStatus === "processing" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            Processing
          </button>
          <button
            onClick={() => setSortBy(sortBy === "date" ? "importance" : "date")}
            className="rounded px-2 py-1 bg-muted text-muted-foreground"
          >
            {sortBy === "date" ? "By Date" : "By Importance"}
          </button>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {filteredFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => onFileSelect(file)}
              className={`w-full rounded-lg p-3 text-left transition-colors ${
                activeFile?.id === file.id
                  ? "bg-primary/10 border border-primary"
                  : "hover:bg-muted border border-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(file.timestamp)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {getStatusBadge(file.status)}
                    {file.evidenceCount > 0 && (
                      <span className="text-xs font-semibold text-primary">{file.evidenceCount} hits</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
