import type { NextRequest} from "next/server";
import { NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" })
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"

const SYSTEM_PROMPT = `You are a professional resume writer. Generate a complete, realistic resume in JSON format based on the user's description.

Return ONLY valid JSON — no markdown fences, no explanation, no extra text. The JSON must match this exact schema:

{
  "name": "string",
  "title": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "string",
  "experiences": [
    {
      "id": "string (short unique id)",
      "company": "string",
      "role": "string",
      "start": "string (e.g. Jan 2020)",
      "end": "string (e.g. Dec 2022, or empty if current)",
      "current": false,
      "bullets": ["string", "string", "string"]
    }
  ],
  "educations": [
    {
      "id": "string (short unique id)",
      "institution": "string",
      "degree": "string",
      "field": "string",
      "year": "string"
    }
  ],
  "skills": ["string", "string"]
}

Rules:
- Write bullets starting with strong action verbs (Developed, Led, Increased, Designed, etc.)
- Quantify achievements whenever possible (%, numbers, scale)
- summary: 3-4 sentences, professional and compelling
- Include 2-4 experiences based on what the user describes; create plausible ones if not provided
- Include 1-2 educations
- Include 8-14 skills relevant to the role
- If user provides a name/email/phone/location, use it exactly; otherwise use placeholder-style values
- Generate all ids as short random alphanumeric strings (e.g. "exp1", "exp2", "edu1")
- Do NOT wrap output in markdown code blocks`

function buildPrompt(description: string, targetRole: string, language: string) {
  const langNote =
    language === "id"
      ? "IMPORTANT: Write all resume content in Bahasa Indonesia (professional Indonesian). Job titles and company names can stay in their original language."
      : "Write all resume content in professional English."

  const lines = [
    langNote,
    "",
    "=== USER DESCRIPTION ===",
    description,
  ]

  if (targetRole) {
    lines.push("", "=== TARGET ROLE ===", targetRole)
  }

  return lines.join("\n")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, targetRole = "", language = "en" } = body as {
      description: string
      targetRole?: string
      language?: string
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: "description required" }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(description, targetRole, language) },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    })

    const raw = completion.choices[0]?.message?.content ?? ""

    // Strip accidental markdown fences if model adds them
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: cleaned.slice(0, 300) },
        { status: 500 },
      )
    }

    return NextResponse.json({ resume: parsed })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
