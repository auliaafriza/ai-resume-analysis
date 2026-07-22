
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

export interface Certification {
  id: string
  name: string       // e.g. "AWS Solutions Architect"
  issuer: string     // e.g. "Amazon Web Services"
  date: string       // e.g. "Jun 2023"
  url: string        // optional credential link
}

export interface Project {
  id: string
  name: string
  description: string
  url: string        // optional live/GitHub link
  tech: string[]     // tech stack tags
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
  certifications: Certification[]
  projects: Project[]
  skills: string[]
}

export type Template = "modern" | "classic" | "minimal" | "executive"
