"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import CompanyTable from "./company-table"
import { Bot, AlertTriangle, Loader2 } from "lucide-react"

// --- SOUS-COMPOSANT POUR L'AFFICHAGE DE LA STRATÉGIE ---
// Ce composant interne gère le formatage de la réponse du LLM stratège.
function StrategyAnalysis({ strategy }: { strategy: any }) {
  // Gère l'état de chargement (quand les données ne sont pas encore arrivées)
  if (!strategy) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Génération de l'analyse stratégique par l'IA...
      </div>
    );
  }

  // Gère l'état d'erreur (si l'appel au LLM a échoué)
  if (strategy.error) {
     return (
      <div className="flex items-center gap-3 text-sm text-red-500 p-4">
        <AlertTriangle className="h-4 w-4" />
        {strategy.error}
      </div>
    );
  }

  // Fonction pour colorer le niveau de risque
  const getRiskColor = (level: string) => {
    if (level?.toLowerCase().includes('élevé')) return 'text-red-500';
    if (level?.toLowerCase().includes('modéré')) return 'text-yellow-500';
    return 'text-green-500';
  }

  // Affiche les données si la génération a réussi
  return (
    <div className="space-y-6 p-4">
      {strategy.scenarios && (
        <section>
          <h3 className="text-base font-semibold mb-2">Scénarios Simulés</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {strategy.scenarios.map((s: any, i: number) => (
              <Card key={i} className={s.type === 'pessimiste' ? 'border-red-500/50' : 'border-green-500/50'}>
                <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm capitalize">{s.type}</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2"><p>{s.description}</p><p className="text-xs text-muted-foreground"><strong>Impact Portefeuille:</strong> {s.impact_portefeuille}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {strategy.risk_assessment && (
        <section>
          <h3 className="text-base font-semibold mb-2">Évaluation des Risques</h3>
          <div className="space-y-2">
            {strategy.risk_assessment.map((r: any, i: number) => (
              <div key={i} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                <div className="space-y-1"><p className="font-medium text-sm">{r.domaine}</p><p className="text-xs text-muted-foreground">Secteurs: {r.secteurs_affectes}</p></div>
                <span className={`font-bold text-sm capitalize ${getRiskColor(r.niveau)}`}>{r.niveau}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {strategy.recommended_actions && (
        <section>
          <h3 className="text-base font-semibold mb-2">Actions Recommandées</h3>
          <div className="space-y-2">
            {strategy.recommended_actions.map((a: any, i: number) => (
              <Card key={i}><CardContent className="p-4 text-sm"><p className="font-semibold mb-1">Pour: {a.entreprises_concernees}</p><p className="text-muted-foreground">{a.actions_proposees}</p></CardContent></Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}


// --- COMPOSANT PRINCIPAL DU TABLEAU DE BORD ---
interface ResultsDashboardProps {
  summaryData: any;
  strategyData: any;
  onCompanySelect: (company: any) => void;
}

export default function ResultsDashboard({ summaryData, strategyData, onCompanySelect }: ResultsDashboardProps) {
  // Le composant attend que `summaryData` soit disponible pour s'afficher.
  // La logique de chargement initial est gérée par le composant parent `workspace.tsx`.
  if (!summaryData) {
    return null; // ou un skeleton loader si on préfère
  }

  // Utiliser des valeurs par défaut pour éviter les erreurs si les données sont partielles
  const companies = summaryData.all_companies || summaryData.key_risks_actionable || [];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        
        {/* 1. CARTE DU RAPPORT BRUT (SUMMARY) */}
        <Card>
          <CardHeader>
            <CardTitle>Rapport d'Analyse Brut</CardTitle>
            <p className="text-sm text-muted-foreground">Ceci est le résultat factuel et structuré de l'analyse du document par l'IA.</p>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto bg-muted/50 p-4 rounded-lg">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(summaryData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 2. CARTE DE L'ANALYSE STRATÉGIQUE DE L'IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Analyse Stratégique de l'IA
            </CardTitle>
            <p className="text-sm text-muted-foreground">Ceci est l'interprétation et les recommandations générées par le LLM stratège.</p>
          </CardHeader>
          <CardContent>
            <StrategyAnalysis strategy={strategyData} />
          </CardContent>
        </Card>
        
        <Separator />

        {/* 3. TABLEAU DES ENTREPRISES AFFECTÉES */}
        <CompanyTable companies={companies} onCompanySelect={onCompanySelect} />

      </div>
    </ScrollArea>
  );
}