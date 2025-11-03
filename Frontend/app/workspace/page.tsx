// app/workspace/page.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import Workspace, { type ReportRecord } from "@/components/workspace"
import { uploadAndStartAnalysis, checkAnalysisStatus } from "@/lib/apiService"

type PollingRegistry = Record<string, number>

export default function WorkspacePage() {
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [activeReportId, setActiveReportId] = useState<string | null>(null)
  const pollingRefs = useRef<PollingRegistry>({})

  const startPolling = (reportId: string) => {
    if (pollingRefs.current[reportId]) return

    const intervalId = window.setInterval(async () => {
      try {
        const statusResponse = await checkAnalysisStatus(reportId)
        const normalizedStatus = String(statusResponse?.status || "").toUpperCase()

        if (normalizedStatus === "COMPLETE") {
          const payload = statusResponse?.data ?? null;
          // Only stop polling if status is COMPLETE AND data is actually present
          if (!payload || Object.keys(payload).length === 0) {
            console.log("Analysis complete, but data is empty. Continuing to poll...");
            return; // Continue polling if data is empty
          }

          setReports((prev) =>
            prev.map((report) => {
              if (report.id !== reportId) return report

              const enrichedPayload = {
                    ...payload,
                    fileName: payload.fileName ?? report.name,
                    uploadedAt: payload.uploadedAt ?? report.uploadedAt,
                  }

              console.log("Updated Report Object:", {
                ...report,
                status: "results",
                data: enrichedPayload,
                uploadedAt: enrichedPayload?.uploadedAt ?? report.uploadedAt,
              });
              return {
                ...report,
                status: "results",
                data: enrichedPayload,
                uploadedAt: enrichedPayload?.uploadedAt ?? report.uploadedAt,
              }
            })
          )

          window.clearInterval(intervalId)
          delete pollingRefs.current[reportId]
          return
        }

        if (normalizedStatus === "FAILED" || normalizedStatus === "ERROR") {
          setReports((prev) =>
            prev.map((report) =>
              report.id === reportId
                ? {
                    ...report,
                    status: "error",
                    error: statusResponse?.error || "Analysis failed.",
                  }
                : report
            )
          )

          window.clearInterval(intervalId)
          delete pollingRefs.current[reportId]
        }
      } catch (error) {
        console.error("Error during polling:", error)
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status: "error",
                  error: error instanceof Error ? error.message : "Unknown error during analysis.",
                }
              : report
          )
        )

        window.clearInterval(intervalId)
        delete pollingRefs.current[reportId]
      }
    }, 10000)

    pollingRefs.current[reportId] = intervalId
  }

  const initiateAnalysisForFile = async (file: File) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const newReport: ReportRecord = {
      id: uniqueId,
      name: file.name,
      uploadedAt: new Date().toISOString(),
      status: "processing",
      data: null,
    }
    console.log("New Report Object:", newReport)

    setReports((prev) => [newReport, ...prev])
    setActiveReportId(uniqueId)

    try {
      await uploadAndStartAnalysis(file, uniqueId)
      startPolling(uniqueId)
    } catch (error) {
      console.error("Error during upload:", error)
      setReports((prev) =>
        prev.map((report) =>
          report.id === uniqueId
            ? {
                ...report,
                status: "error",
                error: error instanceof Error ? error.message : "Failed to upload file.",
              }
            : report
        )
      )
      alert(error instanceof Error ? error.message : "An unknown error occurred.")
    }
  }

  const handleUpload = async (files: File[]) => {
    if (!files.length) return

    for (const file of files) {
      await initiateAnalysisForFile(file)
    }
  }

  const handleNewAnalysis = () => {
    setActiveReportId(null)
  }

  useEffect(() => {
    return () => {
      Object.values(pollingRefs.current).forEach((intervalId) => window.clearInterval(intervalId))
      pollingRefs.current = {}
    }
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Workspace
        reports={reports}
        activeReportId={activeReportId}
        onSelectReport={setActiveReportId}
        onUpload={handleUpload}
        onNewAnalysis={handleNewAnalysis}
      />
    </main>
  )
}