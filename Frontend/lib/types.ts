
export type ReportStatus = "processing" | "results" | "error"

export interface ReportRecord {
  id: string
  name: string
  uploadedAt: string
  status: ReportStatus
  data: any | null
  error?: string
}
