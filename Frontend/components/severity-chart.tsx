
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Label } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const chartConfig = {
  high: {
    label: "High",
    color: "#ef4444",
  },
  medium: {
    label: "Medium",
    color: "#f97316",
  },
  low: {
    label: "Low",
    color: "#facc15",
  },
}

const renderLegendContent = (props: any) => <ChartLegendContent {...props} className="text-white" />

export function SeverityChart({ data }: { data: Array<Record<string, number | string>> }) {
  return (
    <ChartContainer
      config={chartConfig}
  className="min-h-[200px] w-full [&_.recharts-cartesian-axis-label_text]:fill-white! [&_.recharts-cartesian-axis-tick_text]:fill-white!"
    >
      <BarChart data={data}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.15)" />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
          tick={{ fill: "#fff", fontSize: 12, fontWeight: 500 }}
        >
          <Label value="Document" position="insideBottom" offset={-6} fill="#fff" className="text-sm font-medium" />
        </XAxis>
        <YAxis
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
          tick={{ fill: "#fff", fontSize: 12, fontWeight: 500 }}
          width={48}
        >
          <Label value="Risk count" angle={-90} position="insideLeft" offset={8} fill="#fff" className="text-sm font-medium" />
        </YAxis>
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => value ?? 0} />} />
        <ChartLegend content={renderLegendContent} />
        <Bar dataKey="high" fill="var(--color-high)" radius={4} />
        <Bar dataKey="medium" fill="var(--color-medium)" radius={4} />
        <Bar dataKey="low" fill="var(--color-low)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
