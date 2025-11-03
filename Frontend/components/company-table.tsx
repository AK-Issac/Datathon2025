// components/company-table.tsx

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

  // S'assurer que 'companies' est toujours un tableau
  const safeCompanies = Array.isArray(companies) ? companies : [];

  const filtered = safeCompanies
    .filter(
      (c) =>
        // --- C'EST LA CORRECTION DE SÉCURITÉ ---
        // On ajoute '?.' pour dire "n'essaie de faire toLowerCase que si c.ticker existe".
        c?.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c?.company?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "impact") {
        return (b.impact || 0) - (a.impact || 0); // Gérer le cas où 'impact' est manquant
      }
      return (a.ticker || "").localeCompare(b.ticker || ""); // Gérer le cas où 'ticker' est manquant
    })

  return (
    <Card>
      <CardHeader>
        {/* ... (le reste du composant ne change pas) ... */}
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
                  <td className="px-4 py-3 font-semibold">{company.ticker || 'N/A'}</td>
                  <td className="px-4 py-3">{company.company || 'N/A'}</td>
                  <td className={`px-4 py-3 font-semibold ${(company.impact || 0) > 0 ? "text-green-600" : "text-red-600"}`}>
                    {(company.impact || 0) > 0 ? "+" : ""}
                    {(company.impact || 0).toFixed(1)}
                  </td>
                  <td className="px-4 py-3">{company.change || 'N/A'}</td>
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