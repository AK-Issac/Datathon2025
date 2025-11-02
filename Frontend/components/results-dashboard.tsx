"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import CompanyTable from "./company-table"
import { TrendingUp, TrendingDown } from "lucide-react"

// --- Interface des Props ---
// 'data' peut être 'any' (pour le JSON d'AWS) ou 'null' pendant le chargement.
interface ResultsDashboardProps {
  data: any
  onCompanySelect: (company: any) => void
}

// --- NOUVEAU: Composant Skeleton Loader ---
// Affiche une version "fantôme" de l'interface pendant que les données chargent.
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-3/4 rounded-lg bg-muted" />
        <div className="h-4 w-1/2 rounded-lg bg-muted" />
      </div>

      {/* Score Card Skeleton */}
      <div className="rounded-lg bg-muted h-36 w-full" />
      
      {/* Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg bg-muted h-60 w-full" />
        <div className="rounded-lg bg-muted h-60 w-full" />
        <div className="rounded-lg bg-muted h-60 w-full" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg bg-muted h-96 w-full" />
    </div>
  )
}

// --- Composant Principal du Tableau de Bord ---
export default function ResultsDashboard({ data, onCompanySelect }: ResultsDashboardProps) {
  
  // --- 1. GESTION DE L'ÉTAT DE CHARGEMENT ---
  // Si 'data' est null (parce que le polling n'est pas terminé),
  // afficher le skeleton loader au lieu de planter.
  if (!data) {
    return <DashboardSkeleton />;
  }

  // --- 2. DÉSTRUCTURATION SÉCURISÉE DES DONNÉES ---
  // On utilise des valeurs par défaut (ex: '|| []') pour s'assurer que le composant
  // ne plantera jamais, même si une partie des données est manquante dans la réponse d'AWS.
  const impactScore = data.portfolio_impact_score || 0;
  const topWinners = data.top_winners || [];
  const topLosers = data.top_losers || [];
  const sectorData = data.sector_distribution || [];
  const allCompaniesData = data.all_companies || [...topWinners, ...topLosers]; // Fallback si 'all_companies' n'existe pas

  // Adapter les données de secteur pour le graphique (couleurs, etc.)
  const chartSectorData = sectorData.map((sector: any, index: number) => ({
    ...sector,
    fill: `hsl(var(--chart-${index + 1}))`
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Section d'En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Analysis Results</h2>
        <p className="text-muted-foreground">
          Document: {data.fileName || "N/A"} • Processed on {new Date(data.uploadedAt || Date.now()).toLocaleDateString()}
        </p>
      </div>

      {/* Score d'Impact Global */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Portfolio Impact Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${impactScore > 0 ? "text-green-500" : "text-red-500"}`}>{impactScore.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This score reflects the estimated overall impact of the regulation on the S&P 500 portfolio.
          </p>
        </CardContent>
      </Card>

      {/* Grille des Résumés & Graphiques */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Gagnants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Winners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topWinners.length > 0 ? topWinners.map((item: any) => (
              <button
                key={item.ticker}
                onClick={() => onCompanySelect(item)}
                className="w-full space-y-1 rounded-lg p-2 text-left hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{item.ticker}</span>
                  <span className="text-sm font-semibold text-green-600">+{item.impact.toFixed(1)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{item.company}</div>
              </button>
            )) : <p className="text-sm text-muted-foreground">No significant positive impacts found.</p>}
          </CardContent>
        </Card>

        {/* Top Perdants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topLosers.length > 0 ? topLosers.map((item: any) => (
              <button
                key={item.ticker}
                onClick={() => onCompanySelect(item)}
                className="w-full space-y-1 rounded-lg p-2 text-left hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{item.ticker}</span>
                  <span className="text-sm font-semibold text-red-600">{item.impact.toFixed(1)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{item.company}</div>
              </button>
            )) : <p className="text-sm text-muted-foreground">No significant negative impacts found.</p>}
          </CardContent>
        </Card>

        {/* Risque par Secteur */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sector Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              {chartSectorData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={chartSectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartSectorData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                </PieChart>
              ) : <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No sector data available.</div>}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau Complet des Entreprises */}
      <CompanyTable companies={allCompaniesData} onCompanySelect={onCompanySelect} />
    </div>
  )
}