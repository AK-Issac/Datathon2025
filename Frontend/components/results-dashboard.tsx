"use client"

import { useMemo } from "react"
import { SeverityChart } from "./severity-chart"
import { RiskMatrixChart } from "./risk-matrix-chart"
import type { ReportRecord } from "@/lib/types"

type ImpactLevel = "high" | "moderate" | "low" | "unknown"

interface RiskMatrixData {
  points: Array<{
    id: string
    docLabel: string
    docIndex: number
    area: string
    areaIndex: number
    impactLevel: ImpactLevel
    bubbleSize: number
    description?: string
  }>
  docLabels: string[]
  areaLabels: string[]
}

const impactSizeScale: Record<ImpactLevel, number> = {
  high: 220,
  moderate: 160,
  low: 110,
  unknown: 90,
}

function unwrapAttribute(value: any): any {
  if (value === null || value === undefined) return value
  if (typeof value !== "object") return value
  if (Array.isArray(value)) return value.map(unwrapAttribute)

  if ("S" in value) return unwrapAttribute(value.S)
  if ("N" in value) {
    const numeric = Number(value.N)
    return Number.isFinite(numeric) ? numeric : value.N
  }
  if ("BOOL" in value) return Boolean(value.BOOL)
  if ("L" in value) return value.L.map(unwrapAttribute)

  const mapSource = "M" in value ? value.M : value
  const result: Record<string, any> = {}
  for (const [key, nested] of Object.entries(mapSource)) {
    result[key] = unwrapAttribute(nested)
  }
  return result
}

function normalizeImpactLevel(raw: unknown): ImpactLevel {
  if (typeof raw !== "string") return "unknown"
  const normalized = raw.trim().toLowerCase()
  if (!normalized) return "unknown"
  if (normalized.startsWith("high") || normalized.includes("severe")) return "high"
  if (normalized.startsWith("mod") || normalized.startsWith("mid") || normalized.includes("elev")) return "moderate"
  if (normalized.startsWith("low")) return "low"
  return "unknown"
}

function parseCount(snapshot: Record<string, any>, keys: string[]): number {
  for (const key of keys) {
    if (snapshot?.[key] !== undefined) {
      const value = snapshot[key]
      const candidate = unwrapAttribute(value)
      const numeric = Number(candidate)
      if (Number.isFinite(numeric)) return numeric
    }
  }
  return 0
}

function sanitizeLabel(label: string | undefined, fallback: string): string {
  if (!label || typeof label !== "string") return fallback
  const trimmed = label.trim()
  if (!trimmed) return fallback
  return trimmed.replace(/\.[^./\\\s]+$/, "")
}

function deriveDocumentLabel(report: ReportRecord, index: number): string {
  const data = unwrapAttribute(report.data)
  const metadata = data?.document_metadata
  const candidates = [
    unwrapAttribute(data?.document_title),
    unwrapAttribute(metadata?.short_name),
    unwrapAttribute(metadata?.title),
    unwrapAttribute(data?.document_name),
    report.name,
    report.id,
  ]
  const found = candidates.find((candidate) => typeof candidate === "string" && candidate.trim().length > 0)
  return sanitizeLabel(found as string | undefined, `Report ${index + 1}`)
}

function extractRiskMatrix(reports: ReportRecord[]): RiskMatrixData {
  const completedReports = reports.filter((report) => report.status === "results" && report.data)

  const docLabels = completedReports.map((report, index) => deriveDocumentLabel(report, index))
  const docIndexMap = new Map<string, number>()
  completedReports.forEach((report, index) => docIndexMap.set(report.id, index))

  const areaIndexMap = new Map<string, number>()
  const points: RiskMatrixData["points"] = []

  completedReports.forEach((report, reportIndex) => {
    const docIndex = docIndexMap.get(report.id) ?? reportIndex
    const docLabel = docLabels[docIndex] ?? `Report ${reportIndex + 1}`

    const data = unwrapAttribute(report.data)
    const candidateRisks = [
      data?.key_risks_actionable,
      data?.analysis_summary?.key_risks_actionable,
      data?.key_risks,
      data?.risk_register,
    ]

    let risks: any[] = []
    for (const candidate of candidateRisks) {
      const unwrapped = unwrapAttribute(candidate)
      if (Array.isArray(unwrapped) && unwrapped.length > 0) {
        risks = unwrapped
        break
      }
    }

    risks.forEach((risk, riskIndex) => {
      const normalizedRisk = unwrapAttribute(risk)
      const area = sanitizeLabel(
        normalizedRisk?.area ?? normalizedRisk?.risk_area ?? normalizedRisk?.category,
        `Area ${riskIndex + 1}`,
      )

      if (!areaIndexMap.has(area)) {
        areaIndexMap.set(area, areaIndexMap.size)
      }

      const impactLevel = normalizeImpactLevel(
        normalizedRisk?.estimated_financial_impact ??
          normalizedRisk?.financial_impact ??
          normalizedRisk?.impact_level ??
          normalizedRisk?.impact ??
          normalizedRisk?.severity,
      )

      points.push({
        id: `${report.id}-${riskIndex}`,
        docLabel,
        docIndex,
        area,
        areaIndex: areaIndexMap.get(area) ?? 0,
        impactLevel,
        bubbleSize: impactSizeScale[impactLevel],
        description:
          unwrapAttribute(normalizedRisk?.risk_narrative) ??
          unwrapAttribute(normalizedRisk?.description) ??
          undefined,
      })
    })
  })

  return {
    points,
    docLabels,
    areaLabels: Array.from(areaIndexMap.keys()),
  }
}

export default function ResultsDashboard({
  reports,
  activeFile,
}: {
  reports: ReportRecord[]
  activeFile: { id: string; name: string } | null
}) {
  const activeReport = useMemo(
    () => (activeFile ? reports.find((report) => report.id === activeFile.id && report.status === "results") ?? null : null),
    [activeFile, reports],
  )

  const severityData = useMemo(() => {
    if (!activeReport || !activeReport.data) return null
    const data = unwrapAttribute(activeReport.data)
    const snapshot = unwrapAttribute(data?.compliance_metric_snapshot) ?? {}
    const high = parseCount(snapshot, [
      "high_risk_count",
      "highRiskCount",
      "critical_risk_count",
      "criticalRiskCount",
      "high",
    ])
    const medium = parseCount(snapshot, [
      "mid_risk_count",
      "medium_risk_count",
      "midRiskCount",
      "mediumRiskCount",
      "medium",
    ])
    const low = parseCount(snapshot, ["low_risk_count", "lowRiskCount", "low"])

    return [
      {
        name: sanitizeLabel(activeFile?.name, deriveDocumentLabel(activeReport, reports.indexOf(activeReport))),
        high,
        medium,
        low,
      },
    ]
  }, [activeFile, activeReport, reports])

  const matrixData = useMemo(() => extractRiskMatrix(reports), [reports])

  return (
    <div className="space-y-8 p-6">
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Severity Breakdown</h2>
            <p className="text-sm text-muted-foreground">
              Compare high, medium, and low severity findings for the selected document.
            </p>
          </div>
        </div>
        {severityData ? (
          <div className="rounded-lg border border-border bg-card p-4">
            <SeverityChart data={severityData} />
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20">
            <p className="text-sm text-muted-foreground">Select a processed report to view its severity breakdown.</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Risk Area vs Document Matrix</h3>
          <p className="text-sm text-muted-foreground">
            Bubble size and colour reflect the estimated financial impact of each risk area across all processed documents.
          </p>
        </div>
        {matrixData.points.length > 0 ? (
          <div className="rounded-lg border border-border bg-card p-4">
            <RiskMatrixChart
              points={matrixData.points}
              docLabels={matrixData.docLabels}
              areaLabels={matrixData.areaLabels}
            />
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              No actionable risk areas detected yet. Upload additional reports to populate this matrix.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}