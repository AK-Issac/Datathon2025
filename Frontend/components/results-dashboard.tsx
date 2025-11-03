"use client"

import { SeverityChart } from "./severity-chart"
import { ReportRecord } from "@/lib/types"

export default function ResultsDashboard({ reports, activeFile }: { reports: ReportRecord[], activeFile: any }) {
  if (!activeFile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select a file to view its risk analysis.</p>
      </div>
    )
  }

  const activeReport = reports.find(report => report.id === activeFile.id);

  if (!activeReport || !activeReport.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No data available for the selected file.</p>
      </div>
    )
  }

  const chartData = [
    {
      name: activeFile.name,
      high: activeReport.data?.compliance_metric_snapshot?.high_risk_count || 0.1,
      medium: activeReport.data?.compliance_metric_snapshot?.mid_risk_count || 0.1,
      low: activeReport.data?.compliance_metric_snapshot?.low_risk_count || 0.1,
    },
  ]

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Risk Analysis for {activeFile.name}</h2>
      <SeverityChart data={chartData} />
    </div>
  )
}