"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EvidenceModalProps {
  isOpen: boolean
  onClose: () => void
  company: any
}

export default function EvidenceModal({ isOpen, onClose, company }: EvidenceModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-card">
        {/* Header */}
        <div className="sticky top-0 border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{company.ticker}</h2>
            <p className="text-sm text-muted-foreground">{company.company}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          {/* AI Reasoning */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Impact Score</h3>
              <div className="mt-2 text-3xl font-bold text-primary">
                {company.impact > 0 ? "+" : ""}
                {company.impact.toFixed(1)}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Estimated P&L Impact: {Math.abs(company.impact * 15).toFixed(0)}bp
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Score Components</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between rounded-lg bg-muted p-2">
                  <span>Sign Factor</span>
                  <span className="font-semibold">{company.impact > 0 ? "Positive" : "Negative"}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-muted p-2">
                  <span>Portfolio Weight</span>
                  <span className="font-semibold">2.3%</span>
                </div>
                <div className="flex justify-between rounded-lg bg-muted p-2">
                  <span>Resilience Factor</span>
                  <span className="font-semibold">0.85</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">AI Reasoning</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This company is {company.impact > 0 ? "positively" : "negatively"} affected by the regulatory changes
                due to its core operations in the affected sectors. The impact calculation factors in market weight,
                financial resilience, and direct exposure to the regulatory measure.
              </p>
            </div>
          </div>

          {/* Source Evidence */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Evidence from Directive</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
                <p className="italic text-muted-foreground leading-relaxed">
                  "Companies operating in the technology sector shall comply with new data protection requirements
                  effective January 1, 2024, including enhanced encryption standards and quarterly compliance audits."
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Chunk ID: 3-42 • Page 5 • Offset: 1205-1389</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Evidence from Company Filings</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
                <p className="italic text-muted-foreground leading-relaxed">
                  "Our technology infrastructure team has already initiated upgrades to meet anticipated regulatory
                  requirements, with estimated capex of $45M over the next 18 months."
                </p>
                <p className="mt-2 text-xs text-muted-foreground">10-Q Filing • Q3 2023 • MD&A Section</p>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent" onClick={() => alert("Would open PDF viewer")}>
              View Source Document
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/50 px-6 py-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => alert("Evidence saved!")}>Save to Report</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
