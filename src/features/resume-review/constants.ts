export const RESUME_MAX_CHARS = 20_000
export const JOB_DESC_MAX_CHARS = 5_000

export const SCORE_LABEL: Record<string, string> = {
  clarity: "Clarity & Readability",
  relevance: "Relevance to Role",
  impact: "Impact & Achievements",
  format: "Formatting & Structure",
  keywords: "ATS Keywords",
}

export const SCORE_COLOR = (score: number) => {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}
