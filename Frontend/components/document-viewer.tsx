"use client"

import { useState, useRef } from "react"
import { Download, ExternalLink, RotateCcw, ChevronUp, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

interface File {
  id: string
  name: string
}

interface DocumentViewerProps {
  file: File
  onHighlight: (chunks: string[]) => void
  onAddToChat: (text: string) => void
  onPinSnippet: (snippet: any) => void
  pinnedSnippets: any[]
}

export default function DocumentViewer({
  file,
  onHighlight,
  onAddToChat,
  onPinSnippet,
  pinnedSnippets,
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const totalPages = 12
  const mockContent = `This is a simulated document viewer. In production, this would render actual PDF content with embedded highlighting, annotations, and full navigation capabilities.

Key regulatory requirements outlined in this document:

1. Data Protection Compliance
All organizations must implement end-to-end encryption for user data at rest and in transit. Encryption standards must meet NIST 800-53 guidelines minimum.

2. Audit and Compliance
Organizations must maintain audit logs for minimum 7 years. Quarterly compliance certifications are required for regulated entities.

3. Incident Response
Organizations must report security incidents within 24 hours of discovery to relevant authorities and affected parties.

4. Workforce Training
All personnel with access to regulated data must complete annual compliance training with documented completion.

5. Third-Party Management
All vendors and contractors must meet equivalent security and compliance standards through binding contractual obligations.

6. Technology Standards
Systems must support multi-factor authentication, role-based access control, and comprehensive audit logging capabilities.`

  const mockChunks = [
    {
      id: "chunk-1",
      text: "All organizations must implement end-to-end encryption for user data at rest and in transit.",
      page: 2,
      offset: [150, 220],
      confidence: 0.95,
    },
    {
      id: "chunk-2",
      text: "Organizations must maintain audit logs for minimum 7 years.",
      page: 3,
      offset: [300, 360],
      confidence: 0.92,
    },
    {
      id: "chunk-3",
      text: "Quarterly compliance certifications are required for regulated entities.",
      page: 3,
      offset: [365, 425],
      confidence: 0.88,
    },
  ]

  useKeyboardShortcuts([
    {
      key: "f",
      callback: () => {
        setShowSearch(!showSearch)
        setTimeout(() => searchInputRef.current?.focus(), 0)
      },
    },
    {
      key: "ArrowLeft",
      callback: () => setCurrentPage(Math.max(1, currentPage - 1)),
    },
    {
      key: "ArrowRight",
      callback: () => setCurrentPage(Math.min(totalPages, currentPage + 1)),
    },
    {
      key: "h",
      callback: () => onHighlight(mockChunks.map((c) => c.id)),
    },
  ])

  const highlightText = (text: string) => {
    if (!searchQuery) return text
    return text
      .split(new RegExp(`(${searchQuery})`, "gi"))
      .map((part, i) => (part.toLowerCase() === searchQuery.toLowerCase() ? `<mark>${part}</mark>` : part))
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelectedText(selection.toString())
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{file.name}</h2>
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="p-1 hover:bg-background rounded"
                aria-label="Previous page"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) =>
                  setCurrentPage(Math.min(totalPages, Math.max(1, Number.parseInt(e.target.value) || 1)))
                }
                className="w-8 text-center text-sm bg-transparent outline-none"
                aria-label="Current page number"
              />
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className="p-1 hover:bg-background rounded"
                aria-label="Next page"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <Button variant="ghost" size="sm" className="gap-2" aria-label="Download document">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" aria-label="Open in new window">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" aria-label="Re-run analysis">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Search Bar */}
          {showSearch && (
            <div className="sticky top-0 bg-background py-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search in document... (Press F to close)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Search document content"
                />
              </div>
            </div>
          )}

          {/* Document Content */}
          <div
            className="prose prose-invert max-w-none text-foreground leading-relaxed space-y-4"
            onMouseUp={handleTextSelection}
            role="main"
          >
            {mockContent.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-sm whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Mini Evidence Panel */}
          {mockChunks.length > 0 && (
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-3 text-sm">Extracted Evidence</h3>
              <div className="space-y-2">
                {mockChunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="rounded-lg border border-border bg-muted/50 p-3"
                    role="article"
                    aria-label={`Evidence snippet with ${(chunk.confidence * 100).toFixed(0)}% confidence`}
                  >
                    <p className="text-xs text-foreground italic mb-2">{chunk.text}</p>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        Page {chunk.page} • Confidence: {(chunk.confidence * 100).toFixed(0)}%
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => onAddToChat(chunk.text)}
                          aria-label={`Add to chat: ${chunk.text}`}
                        >
                          Add to chat
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 text-xs ${pinnedSnippets.find((s) => s.id === chunk.id) ? "bg-primary/20" : ""}`}
                          onClick={() => onPinSnippet(chunk)}
                          aria-label={pinnedSnippets.find((s) => s.id === chunk.id) ? "Unpin snippet" : "Pin snippet"}
                          aria-pressed={!!pinnedSnippets.find((s) => s.id === chunk.id)}
                        >
                          {pinnedSnippets.find((s) => s.id === chunk.id) ? "Pinned" : "Pin"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Selection Action Bar */}
      {selectedText && (
        <div className="border-t border-border bg-card px-4 py-2 flex items-center justify-between gap-2" role="status">
          <span className="text-xs text-muted-foreground truncate max-w-xs">"{selectedText}"</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToChat(selectedText)}
              aria-label="Ask AI about selected text"
            >
              Ask about selection
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedText("")} aria-label="Dismiss selection">
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts info */}
      <div className="sr-only">
        <p>Keyboard shortcuts: Press F to search, arrow keys to navigate pages, H to toggle highlights</p>
      </div>
    </div>
  )
}
