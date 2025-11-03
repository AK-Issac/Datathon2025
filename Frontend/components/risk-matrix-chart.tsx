"use client"

import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Scatter,
  Cell,
} from "recharts"
import { useMemo } from "react"

const impactColors: Record<string, string> = {
  high: "#ef4444",
  moderate: "#f97316",
  low: "#facc15",
  unknown: "#94a3b8",
}

const impactLabels: Record<string, string> = {
  high: "High impact",
  moderate: "Moderate impact",
  low: "Low impact",
  unknown: "Unspecified",
}

interface RiskMatrixPoint {
  id: string
  docLabel: string
  docIndex: number
  area: string
  areaIndex: number
  impactLevel: "high" | "moderate" | "low" | "unknown"
  bubbleSize: number
  description?: string
}

interface RiskMatrixChartProps {
  points: RiskMatrixPoint[]
  docLabels: string[]
  areaLabels: string[]
}

export function RiskMatrixChart({ points, docLabels, areaLabels }: RiskMatrixChartProps) {
  const legendItems = useMemo(
    () =>
      ["high", "moderate", "low", "unknown"].map((key) => ({
        key,
        color: impactColors[key],
        label: key === "unknown" ? "No impact recorded" : impactLabels[key],
      })),
    [],
  )

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 32, right: 40, left: 24, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
          <XAxis
            type="number"
            dataKey="docIndex"
            ticks={docLabels.map((_, idx) => idx)}
            tickFormatter={(value: number) => docLabels[value] ?? value}
            domain={[-0.5, docLabels.length - 0.5]}
            tick={{ fill: "#fff", fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.3)" }}
            label={{ value: "Document", position: "insideBottom", offset: -24, fill: "#fff", fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="areaIndex"
            ticks={areaLabels.map((_, idx) => idx)}
            tickFormatter={(value: number) => areaLabels[value] ?? value}
            domain={[-0.5, areaLabels.length - 0.5]}
            tick={{ fill: "#fff", fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.3)" }}
            label={{ value: "Risk area", angle: -90, position: "insideLeft", fill: "#fff", fontSize: 12 }}
          />
          <ZAxis type="number" dataKey="bubbleSize" range={[80, 240]} />
          <Tooltip
            cursor={{ strokeDasharray: "4 4" }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null
              const point = payload[0].payload as RiskMatrixPoint
              const impact = impactLabels[point.impactLevel] ?? point.impactLevel
              return (
                <div className="rounded-md border border-border bg-background/95 p-3 text-xs shadow-lg">
                  <p className="font-medium text-foreground">{point.area}</p>
                  <p className="text-muted-foreground">Document: {point.docLabel}</p>
                  <p className="text-muted-foreground">Impact: {impact}</p>
                  {point.description && (
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{point.description}</p>
                  )}
                </div>
              )
            }}
          />
          <Scatter data={points} shape="circle">
            {points.map((point) => (
              <Cell key={point.id} fill={impactColors[point.impactLevel]} fillOpacity={0.9} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center gap-4 text-xs text-white">
        {legendItems.map((item) => (
          <span key={item.key} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
