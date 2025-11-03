// components/top-bar.tsx

"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Plus, Upload } from "lucide-react"

interface TopBarProps {
  onNewAnalysis: () => void
  onUpload: () => void
  state: string
}

export default function TopBar({ onNewAnalysis, onUpload, state }: TopBarProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">S3rpent</h1>
          <span className="text-xs text-muted-foreground">Regulatory Intelligence Platform</span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onUpload} variant="default" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
          {state !== "empty" && (
            <Button onClick={onNewAnalysis} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}