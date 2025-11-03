// components/strategy-panel.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, AlertTriangle } from "lucide-react"

// Sous-composant pour afficher la stratégie (ne change pas)
function StrategyAnalysis({ strategy }: { strategy: any }) {
  // ... (code de ce composant, comme dans la réponse précédente)
  const getRiskColor = (level: string) => {
    if (level?.toLowerCase().includes('élevé')) return 'text-red-500';
    if (level?.toLowerCase().includes('modéré')) return 'text-yellow-500';
    return 'text-green-500';
  }
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-base font-semibold mb-2">Scénarios Simulés</h3>
        <div className="grid grid-cols-1 gap-4">
          {strategy.scenarios?.map((s: any, i: number) => (
            <Card key={i} className={s.type === 'pessimiste' ? 'border-red-500/50' : 'border-green-500/50'}>
              <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm capitalize">{s.type}</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2"><p>{s.description}</p><p className="text-xs text-muted-foreground"><strong>Impact Portefeuille:</strong> {s.impact_portefeuille}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-base font-semibold mb-2">Évaluation des Risques</h3>
        <div className="space-y-2">
          {strategy.risk_assessment?.map((r: any, i: number) => (
            <div key={i} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <div className="space-y-1"><p className="font-medium text-sm">{r.domaine}</p><p className="text-xs text-muted-foreground">Secteurs: {r.secteurs_affectes}</p></div>
              <span className={`font-bold text-sm capitalize ${getRiskColor(r.niveau)}`}>{r.niveau}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-base font-semibold mb-2">Actions Recommandées</h3>
        <div className="space-y-2">
          {strategy.recommended_actions?.map((a: any, i: number) => (
            <Card key={i}><CardContent className="p-4 text-sm"><p className="font-semibold mb-1">Pour: {a.entreprises_concernees}</p><p className="text-muted-foreground">{a.actions_proposees}</p></CardContent></Card>
          ))}
        </div>
      </section>
    </div>
  )
}


interface StrategyPanelProps {
  strategyData: any;
}

export default function StrategyPanel({ strategyData }: StrategyPanelProps) {
  // --- NOUVELLE LOGIQUE D'AFFICHAGE CONDITIONNEL ---
  const renderContent = () => {
    // Cas 1: Les données ne sont pas encore arrivées (chargement)
    if (!strategyData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <Bot className="h-8 w-8 text-primary animate-pulse mb-4" />
          <p className="text-sm font-semibold">Génération de l'analyse stratégique...</p>
          <p className="text-xs text-muted-foreground">L'IA est en train de formuler des recommandations.</p>
        </div>
      )
    }
    
    // Cas 2: Il y a eu une erreur lors de la génération
    if (strategyData.error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-sm font-semibold">Erreur de Génération</p>
          <p className="text-xs text-muted-foreground">{strategyData.error}</p>
        </div>
      )
    }

    // Cas 3: Succès, les données sont là
    return <StrategyAnalysis strategy={strategyData} />;
  }
  
  return (
    <div className="flex h-full flex-col border-l border-border bg-sidebar">
       <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h2 className="text-base font-semibold">Analyse Stratégique de l'IA</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  )
}