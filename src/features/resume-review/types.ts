import { z } from "zod"

// ── Form schema ──────────────────────────────────────────────────────────────

export const ResumeReviewSchema = z.object({
  resumeText: z.string().min(50, "Resume must be at least 50 characters").max(20000, "Resume is too long (max 20 000 chars)"),
  jobDescription: z.string().max(5000, "Job description is too long (max 5 000 chars)").optional(),
  targetRole: z.string().max(100).optional(),
})

export type ResumeReviewFormState = z.infer<typeof ResumeReviewSchema>

// ── API payload / response ───────────────────────────────────────────────────

export interface ReviewRequest {
  resumeText: string
  jobDescription?: string
  targetRole?: string
}

export interface ReviewScore {
  category: string
  score: number // 0-100
  comment: string
}

export interface ReviewResponse {
  overallScore: number
  summary: string
  scores: ReviewScore[]
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  kelebihan: string[]
  perbaikan: string[]
  saran: string[]
}

// ── Service response envelope ────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  statusCode: number
  responseHeader: {
    statusCode: number
    error: string
    errorCode: string
    message: string
  }
}
