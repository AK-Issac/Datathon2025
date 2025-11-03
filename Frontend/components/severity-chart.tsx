
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

export function SeverityChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => (value === 0.1 ? 0 : value)} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="high" fill="var(--color-high)" radius={4} />
        <Bar dataKey="medium" fill="var(--color-medium)" radius={4} />
        <Bar dataKey="low" fill="var(--color-low)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
