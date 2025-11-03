"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

const stages = [
  { name: "Extracting Text", duration: 4 },
  { name: "Chunking Document", duration: 5 },
  { name: "Summarizing Chunks", duration: 6 },
  { name: "Identifying Companies", duration: 5 },
  { name: "Calculating Impact Scores", duration: 6 },
  { name: "Generating Report", duration: 7 },
]

const cadenceMessages = [
  {
    title: "Warming up the AI...",
    body: "Our digital brains are firing up to tackle your complex documents. Almost there!",
  },
  {
    title: "Teaching the robots to read...",
    body: "We're helping our AI understand every nuance of your regulatory filings. Patience, young padawan.",
  },
  {
    title: "Brewing some digital coffee...",
    body: "This analysis is intense! Our servers are working hard, fueled by virtual caffeine.",
  },
  {
    title: "Consulting the digital oracle...",
    body: "Asking the AI the deep questions about your documents. The answers are coming!",
  },
  {
    title: "Untangling the regulatory spaghetti...",
    body: "Navigating the intricate web of rules and regulations. It's a delicious challenge!",
  },
  {
    title: "Polishing the insights...",
    body: "Refining the raw data into sparkling, actionable intelligence. Almost ready for prime time!",
  },
]

const ProcessingTimeAlert = () => (
  <Alert className="border-amber-400/60 bg-amber-100/40 text-amber-900">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Document Parsing in Progress</AlertTitle>
    <AlertDescription>
      Document parsing can take several minutes. Please be patient; we'll notify you when results are ready.
    </AlertDescription>
  </Alert>
);

export default function ProcessingUI() {
  const [activeMessageIndex, setActiveMessageIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % cadenceMessages.length)
    }, 6500)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="flex h-full items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-5xl space-y-6 text-center">
        <ProcessingTimeAlert />

        <div className="space-y-4 rounded-xl border border-border bg-card/50 p-6 shadow-sm mx-auto max-w-lg">
          <div>
            <h3 className="text-lg font-semibold">What's happening behind the scenes...</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Aura cycles through deeper analysis steps while you wait.
            </p>
          </div>
          <div className="space-y-3">
            <div
              className="rounded-lg border p-4 transition-all duration-300 border-primary/60 bg-primary/10 text-foreground shadow-sm"
            >
              <p className="text-sm font-semibold text-foreground">
                {cadenceMessages[activeMessageIndex].title}
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                {cadenceMessages[activeMessageIndex].body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
