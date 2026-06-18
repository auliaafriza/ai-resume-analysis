import { NextResponse } from "next/server"
import Groq from "groq-sdk"
import mammoth from "mammoth"
import pdfParse from "pdf-parse"

import type { ApiResponse, ReviewResponse } from "@/features/resume-review/types"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" })
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildSuccess(data: ReviewResponse): ApiResponse<ReviewResponse> {
  return {
    data,
    statusCode: 200,
    responseHeader: { statusCode: 200, error: "", errorCode: "", message: "ok" },
  }
}

function buildError(message: string, statusCode = 500): ApiResponse<null> {
  return {
    data: null,
    statusCode,
    responseHeader: { statusCode, error: message, errorCode: "REVIEW_ERROR", message },
  }
}

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())

  if (file.type === "application/pdf") {
    const parsed = await pdfParse(buffer)
    return parsed.text
  }

  // Word (.doc / .docx)
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

function buildUserPrompt(resumeText: string, targetRole?: string, jobDescription?: string): string {
  const lines: string[] = ["=== RESUME ===", resumeText]
  if (targetRole) lines.push("", "=== TARGET ROLE ===", targetRole)
  if (jobDescription) lines.push("", "=== JOB DESCRIPTION ===", jobDescription)
  return lines.join("\n")
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert resume reviewer and career coach with 15 years of experience in talent acquisition across tech, finance, and consulting.

When given a resume, return ONLY a valid JSON object (no markdown, no prose outside the JSON) with this exact shape:

{
  "overallScore": <integer 0-100>,
  "summary": "<2–3 sentence executive summary of the resume>",
  "scores": [
    { "category": "Clarity & Readability", "score": <0-100>, "comment": "<one sentence>" },
    { "category": "Relevance to Role",     "score": <0-100>, "comment": "<one sentence>" },
    { "category": "Impact & Achievements", "score": <0-100>, "comment": "<one sentence>" },
    { "category": "Formatting & Structure","score": <0-100>, "comment": "<one sentence>" },
    { "category": "ATS Keywords",          "score": <0-100>, "comment": "<one sentence>" }
  ],
  "strengths":    ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "suggestions":  ["<tip 1>", "<tip 2>", "<tip 3>", "<tip 4>", "<tip 5>"]
}

Be honest, specific, and constructive. Never fabricate information not in the resume.`

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const targetRole = (formData.get("targetRole") as string | null) ?? undefined
    const jobDescription = (formData.get("jobDescription") as string | null) ?? undefined

    if (!(file instanceof File)) {
      return NextResponse.json(buildError("No file uploaded.", 400), { status: 400 })
    }

    const resumeText = await extractText(file)

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        buildError("Could not extract enough text from the file. Please try a different format.", 422),
        { status: 422 },
      )
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(resumeText, targetRole, jobDescription) },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    })

    const raw = completion.choices[0]?.message?.content ?? ""

    // Strip accidental markdown fences
    const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
    const review = JSON.parse(jsonText) as ReviewResponse

    return NextResponse.json(buildSuccess(review))
  } catch (err) {
    console.error("[review] POST error:", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json(buildError(message), { status: 500 })
  }
}
