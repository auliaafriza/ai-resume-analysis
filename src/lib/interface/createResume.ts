
// ── Types ─────────────────────────────────────────────────────────────────────

export interface Experience {
  id: string
  company: string
  role: string
  start: string
  end: string
  current: boolean
  bullets: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  year: string
}

export interface ResumeData {
  name: string
  email: string
  phone: string
  location: string
  title: string
  summary: string
  photo: string   // base64 data URL
  experiences: Experience[]
  educations: Education[]
  skills: string[]
}

export type Template = "modern" | "classic" | "minimal" | "executive"

