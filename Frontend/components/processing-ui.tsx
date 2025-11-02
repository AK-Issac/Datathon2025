"use client"

import { useEffect, useState } from "react"

const stages = [
  { name: "Extracting Text", duration: 2 },
  { name: "Chunking Document", duration: 2 },
  { name: "Summarizing Chunks", duration: 3 },
  { name: "Identifying Companies", duration: 2 },
  { name: "Calculating Impact Scores", duration: 3 },
  { name: "Generating Report", duration: 2 },
]

export default function ProcessingUI() {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + Math.random() * 10
        }
        return 100
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= (currentStage + 1) * (100 / stages.length) && currentStage < stages.length - 1) {
      setCurrentStage((prev) => prev + 1)
    }
  }, [progress])

  return (
    <div className="flex items-center justify-center p-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-2xl font-semibold">Processing Document</h2>
          <p className="mt-2 text-muted-foreground">Analyzing regulatory content and calculating portfolio impact...</p>
        </div>

        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{stage.name}</span>
                {index < currentStage && <span className="text-xs text-green-600">Complete</span>}
                {index === currentStage && <span className="text-xs text-primary">In progress</span>}
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all duration-300 ${
                    index < currentStage
                      ? "w-full bg-green-600"
                      : index === currentStage
                        ? "w-full bg-primary"
                        : "w-0 bg-muted"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Overall Progress</span>
            <span className="text-xs font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
