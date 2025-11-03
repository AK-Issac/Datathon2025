// components/summary-viewer.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SummaryViewerProps {
  summaryData: any;
}

export default function SummaryViewer({ summaryData }: SummaryViewerProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Rapport d'Analyse Brut (Summary JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[75vh] overflow-y-auto bg-muted/50 p-4 rounded-lg">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(summaryData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}