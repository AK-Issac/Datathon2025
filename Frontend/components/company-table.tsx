"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface CompanyTableProps {
  companies: any[]
  onCompanySelect: (company: any) => void
}

export default function CompanyTable({ companies, onCompanySelect }: CompanyTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"impact" | "ticker">("impact")

  const filtered = companies
    .filter(
      (c) =>
        c.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "impact") {
        return b.impact - a.impact
      }
      return a.ticker.localeCompare(b.ticker)
    })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Affected Companies</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold">Ticker</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold hover:text-primary"
                  onClick={() => setSortBy(sortBy === "impact" ? "ticker" : "impact")}
                >
                  Impact Score {sortBy === "impact" && "↓"}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Est. Change</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => (
                <tr key={company.ticker} className="border-b border-border hover:bg-muted">
                  <td className="px-4 py-3 font-semibold">{company.ticker}</td>
                  <td className="px-4 py-3">{company.company}</td>
                  <td className={`px-4 py-3 font-semibold ${company.impact > 0 ? "text-green-600" : "text-red-600"}`}>
                    {company.impact > 0 ? "+" : ""}
                    {company.impact.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">{company.change}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => onCompanySelect(company)} className="text-sm text-primary hover:underline">
                      View Evidence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
