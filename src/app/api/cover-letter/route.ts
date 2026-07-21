import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import mammoth from "mammoth"
import pdfParse from "pdf-parse"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" })
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"

// ── File parser ───────────────────────────────────────────────────────────────

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  if (file.type === "application/pdf") {
    const parsed = await pdfParse(buffer)
    return parsed.text
  }
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

// ── Prompt builders ───────────────────────────────────────────────────────────

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional:
    "Tone: Formal and polished. Use sophisticated vocabulary. Maintain executive-level professionalism throughout.",
  enthusiastic:
    "Tone: Warm and enthusiastic. Show genuine excitement about the opportunity. Be engaging and energetic while staying professional.",
  concise:
    "Tone: Crisp and direct. Use short sentences. Eliminate filler phrases. Get to the point quickly. Maximum 3 short paragraphs.",
  creative:
    "Tone: Distinctive and memorable. Open with an unexpected hook. Show personality while remaining appropriate for a business context.",
}

function buildSystemPrompt(tone: string, language: string): string {
  const toneNote = TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.professional
  const langNote =
    language === "id"
      ? "IMPORTANT: Write the entire cover letter in professional Bahasa Indonesia. Job titles, company names, and proper nouns can remain in their original language."
      : "Write the cover letter in professional English."

  return `You are an expert career coach and professional cover letter writer.

Your job: write a compelling, personalized cover letter based on the candidate's resume and the job they are applying to.

${langNote}
${toneNote}

Structure:
1. Opening paragraph — grab attention, state the role, briefly convey why this is a great fit
2. Body paragraph(s) — highlight 2-3 specific achievements or skills from the resume that match the job description; be concrete, reference numbers/impact where possible
3. Closing paragraph — express enthusiasm, request next steps, professional sign-off

Rules:
- Do NOT use generic phrases like "I am writing to express my interest" or "Please find my resume attached"
- Do NOT start with "I" — vary the opening
- Personalize to the company and role provided
- Keep it to 3–4 paragraphs, no more than 400 words
- Output ONLY the cover letter text — no subject line, no "Cover Letter:" header, no markdown formatting, no explanations
- Use proper paragraph breaks (double newline between paragraphs)
- End with a professional sign-off like "Sincerely," or "Best regards," followed by the candidate's name`
}

function buildUserPrompt(
  resumeText: string,
  company: string,
  jobTitle: string,
  jobDescription: string,
): string {
  const lines: string[] = ["=== CANDIDATE RESUME ===", resumeText.trim()]
  if (company) lines.push("", "=== TARGET COMPANY ===", company.trim())
  if (jobTitle) lines.push("", "=== TARGET ROLE ===", jobTitle.trim())
  if (jobDescription) lines.push("", "=== JOB DESCRIPTION ===", jobDescription.trim())
  return lines.join("\n")
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? ""
    let resumeText = ""
    let company = ""
    let jobTitle = ""
    let jobDescription = ""
    let tone = "professional"
    let language = "en"

    if (contentType.includes("multipart/form-data")) {
      // File upload path
      const form = await req.formData()
      const file = form.get("file") as File | null
      resumeText = (form.get("resumeText") as string) ?? ""
      company = (form.get("company") as string) ?? ""
      jobTitle = (form.get("jobTitle") as string) ?? ""
      jobDescription = (form.get("jobDescription") as string) ?? ""
      tone = (form.get("tone") as string) ?? "professional"
      language = (form.get("language") as string) ?? "en"

      if (file && file.size > 0) {
        resumeText = await extractText(file)
      }
    } else {
      // JSON path (paste text)
      const body = await req.json()
      resumeText = body.resumeText ?? ""
      company = body.company ?? ""
      jobTitle = body.jobTitle ?? ""
      jobDescription = body.jobDescription ?? ""
      tone = body.tone ?? "professional"
      language = body.language ?? "en"
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Resume content is required" }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(tone, language) },
        { role: "user", content: buildUserPrompt(resumeText, company, jobTitle, jobDescription) },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    })

    const coverLetter = completion.choices[0]?.message?.content?.trim() ?? ""

    if (!coverLetter) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 })
    }

    return NextResponse.json({ coverLetter })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
