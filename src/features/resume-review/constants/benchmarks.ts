export type Industry = "tech" | "finance" | "marketing" | "healthcare" | "creative" | "consulting"

export interface IndustryBenchmark {
  label: string
  labelId: string
  emoji: string
  overall: number
  scores: Record<string, number>
}

// Average scores based on industry hiring standards
export const BENCHMARKS: Record<Industry, IndustryBenchmark> = {
  tech: {
    label: "Tech & Engineering",
    labelId: "Teknologi & Engineering",
    emoji: "💻",
    overall: 74,
    scores: {
      "Clarity & Readability": 73,
      "Relevance to Role": 76,
      "Impact & Achievements": 69,
      "Formatting & Structure": 75,
      "ATS Keywords": 78,
    },
  },
  finance: {
    label: "Finance & Banking",
    labelId: "Keuangan & Perbankan",
    emoji: "💼",
    overall: 72,
    scores: {
      "Clarity & Readability": 75,
      "Relevance to Role": 73,
      "Impact & Achievements": 70,
      "Formatting & Structure": 78,
      "ATS Keywords": 71,
    },
  },
  marketing: {
    label: "Marketing & Creative",
    labelId: "Marketing & Kreatif",
    emoji: "📣",
    overall: 68,
    scores: {
      "Clarity & Readability": 72,
      "Relevance to Role": 69,
      "Impact & Achievements": 64,
      "Formatting & Structure": 70,
      "ATS Keywords": 67,
    },
  },
  healthcare: {
    label: "Healthcare & Medical",
    labelId: "Kesehatan & Medis",
    emoji: "🏥",
    overall: 70,
    scores: {
      "Clarity & Readability": 71,
      "Relevance to Role": 74,
      "Impact & Achievements": 63,
      "Formatting & Structure": 76,
      "ATS Keywords": 68,
    },
  },
  creative: {
    label: "Design & UX",
    labelId: "Desain & UX",
    emoji: "🎨",
    overall: 65,
    scores: {
      "Clarity & Readability": 70,
      "Relevance to Role": 66,
      "Impact & Achievements": 61,
      "Formatting & Structure": 67,
      "ATS Keywords": 63,
    },
  },
  consulting: {
    label: "Consulting & Strategy",
    labelId: "Konsultasi & Strategi",
    emoji: "📊",
    overall: 76,
    scores: {
      "Clarity & Readability": 77,
      "Relevance to Role": 75,
      "Impact & Achievements": 73,
      "Formatting & Structure": 79,
      "ATS Keywords": 74,
    },
  },
}

export const INDUSTRY_OPTIONS = Object.entries(BENCHMARKS).map(([key, val]) => ({
  value: key as Industry,
  label: val.label,
  labelId: val.labelId,
  emoji: val.emoji,
}))
