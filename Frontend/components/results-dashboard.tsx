"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import CompanyTable from "./company-table"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ResultsDashboardProps {
  data: any
  onCompanySelect: (company: any) => void
}

export default function ResultsDashboard({ data, onCompanySelect }: ResultsDashboardProps) {
  const mockImpactScore = 8.5
  const mockTopWinners = [
    { ticker: "TSLA", company: "Tesla", impact: 12.5, change: "+2.1%" },
    { ticker: "NVDA", company: "NVIDIA", impact: 9.8, change: "+1.8%" },
    { ticker: "GOOGL", company: "Alphabet", impact: 7.2, change: "+1.2%" },
  ]

  const mockTopLosers = [
    { ticker: "F", company: "Ford", impact: -8.3, change: "-1.5%" },
    { ticker: "GM", company: "General Motors", impact: -7.1, change: "-1.2%" },
    { ticker: "XOM", company: "ExxonMobil", impact: -5.9, change: "-0.9%" },
  ]

  const mockSectorData = [
    { name: "Technology", value: 32, fill: "hsl(var(--chart-1))" },
    { name: "Energy", value: 28, fill: "hsl(var(--chart-2))" },
    { name: "Healthcare", value: 20, fill: "hsl(var(--chart-3))" },
    { name: "Finance", value: 15, fill: "hsl(var(--chart-4))" },
    { name: "Other", value: 5, fill: "hsl(var(--chart-5))" },
  ]

  const mockCompanyData = [
    ...mockTopWinners.map((w) => ({ ...w, category: "Winner" })),
    ...mockTopLosers.map((l) => ({ ...l, category: "Loser" })),
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Analysis Results</h2>
        <p className="text-muted-foreground">
          Document: {data.fileName} • Uploaded {new Date(data.uploadedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Overall Impact Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Portfolio Impact Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{mockImpactScore}</span>
            <span className="text-lg text-muted-foreground">/10</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This regulation is expected to have a significant impact on the S&P 500 portfolio.
          </p>
        </CardContent>
      </Card>

      {/* Summary & Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Winners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Winners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockTopWinners.map((item) => (
              <button
                key={item.ticker}
                onClick={() =>
                  onCompanySelect({
                    ...item,
                    evidence: "Sample evidence snippet...",
                  })
                }
                className="w-full space-y-1 rounded-lg p-2 text-left hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{item.ticker}</span>
                  <span className="text-sm text-green-600">+{item.impact.toFixed(1)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{item.company}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockTopLosers.map((item) => (
              <button
                key={item.ticker}
                onClick={() =>
                  onCompanySelect({
                    ...item,
                    evidence: "Sample evidence snippet...",
                  })
                }
                className="w-full space-y-1 rounded-lg p-2 text-left hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{item.ticker}</span>
                  <span className="text-sm text-red-600">{item.impact.toFixed(1)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{item.company}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Sector Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sector Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mockSectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mockSectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Full Company Table */}
      <CompanyTable companies={mockCompanyData} onCompanySelect={onCompanySelect} />
    </div>
  )
}
