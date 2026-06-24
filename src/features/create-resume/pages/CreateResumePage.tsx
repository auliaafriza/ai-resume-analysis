"use client"

import { useRef, useState } from "react"

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Camera,
  Download,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils/cn"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Experience {
  id: string
  company: string
  role: string
  start: string
  end: string
  current: boolean
  bullets: string[]
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  year: string
}

interface ResumeData {
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

type Template = "modern" | "classic" | "minimal" | "executive"


// ── Blank data ────────────────────────────────────────────────────────────────

const BLANK: ResumeData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  title: "",
  summary: "",
  photo: "",
  experiences: [],
  educations: [],
  skills: [],
}

const TEMPLATES: { id: Template; label: string; desc: string; accent: string }[] = [
  { id: "modern", label: "Modern", desc: "Clean sidebar, bold header, rose accent", accent: "#C5527A" },
  { id: "classic", label: "Classic", desc: "Traditional layout, navy tones, timeless", accent: "#1E3A5F" },
  { id: "minimal", label: "Minimal", desc: "Ultra-clean, lots of white space", accent: "#333333" },
  { id: "executive", label: "Executive", desc: "Two-column, gold accents, prestige feel", accent: "#8B6914" },
]

// ── Preview components ────────────────────────────────────────────────────────

function ModernPreview({ data, bgColor, accentColor }: { data: ResumeData; bgColor: string; accentColor: string }) {
  return (
    <div className="flex h-full min-h-[900px] text-[11px] leading-tight" style={{ fontFamily: "Georgia, serif", backgroundColor: bgColor }}>
      {/* Sidebar */}
      <div className="w-[35%] shrink-0 p-5" style={{ background: accentColor, color: "#fff" }}>
        <div className="mb-4 h-16 w-16 overflow-hidden rounded-full bg-white/20">
          {data.photo
            ? <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
            : <div className="flex h-full w-full items-center justify-center text-2xl font-bold">{data.name ? data.name[0] : "?"}</div>
          }
        </div>
        <h1 className="mb-0.5 text-lg font-bold leading-snug">{data.name || "Your Name"}</h1>
        <p className="mb-4 text-[10px] opacity-80">{data.title || "Professional Title"}</p>
        <div className="mb-4 space-y-1.5 text-[10px] opacity-90">
          {data.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{data.email}</div>}
          {data.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{data.phone}</div>}
          {data.location && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{data.location}</div>}
        </div>
        {data.skills.length > 0 && (
          <div>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest opacity-70">Skills</p>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((s) => <span key={s} className="rounded-full bg-white/20 px-2 py-0.5 text-[9px]">{s}</span>)}
            </div>
          </div>
        )}
      </div>
      {/* Main */}
      <div className="flex-1 p-5">
        {data.summary && (
          <div className="mb-4">
            <p className="mb-1.5 border-b-2 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: accentColor, color: accentColor }}>Summary</p>
            <p className="text-[10px] leading-relaxed text-gray-600">{data.summary}</p>
          </div>
        )}
        {data.experiences.length > 0 && (
          <div className="mb-4">
            <p className="mb-1.5 border-b-2 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: accentColor, color: accentColor }}>Experience</p>
            {data.experiences.map((e) => (
              <div key={e.id} className="mb-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{e.role || "Role"}</p>
                    <p className="text-[10px] text-gray-500">{e.company}</p>
                  </div>
                  <p className="text-[9px] text-gray-400 shrink-0">{e.start}{e.start && (e.current ? " – Present" : e.end ? ` – ${e.end}` : "")}</p>
                </div>
                {e.bullets.filter(Boolean).map((b, i) => <p key={i} className="mt-0.5 pl-2 text-[10px] text-gray-600 before:content-['•'] before:mr-1">{b}</p>)}
              </div>
            ))}
          </div>
        )}
        {data.educations.length > 0 && (
          <div>
            <p className="mb-1.5 border-b-2 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: accentColor, color: accentColor }}>Education</p>
            {data.educations.map((e) => (
              <div key={e.id} className="mb-2">
                <div className="flex justify-between">
                  <p className="font-bold text-gray-800">{e.degree} {e.field && `in ${e.field}`}</p>
                  <p className="text-[9px] text-gray-400">{e.year}</p>
                </div>
                <p className="text-[10px] text-gray-500">{e.institution}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ClassicPreview({ data, bgColor, accentColor }: { data: ResumeData; bgColor: string; accentColor: string }) {
  return (
    <div className="min-h-[900px] p-8 text-[11px] leading-tight" style={{ fontFamily: "Times New Roman, serif", backgroundColor: bgColor }}>
      <div className="mb-4 border-b-2 pb-3 text-center" style={{ borderColor: accentColor }}>
        {data.photo && (
          <div className="mx-auto mb-2 h-16 w-16 overflow-hidden rounded-full border-2" style={{ borderColor: accentColor }}>
            <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
          </div>
        )}
        <h1 className="text-xl font-bold uppercase tracking-widest" style={{ color: accentColor }}>{data.name || "Your Name"}</h1>
        <p className="mt-0.5 text-[10px] text-gray-500">{[data.email, data.phone, data.location].filter(Boolean).join(" · ")}</p>
        {data.title && <p className="mt-0.5 text-[10px] font-semibold text-gray-600">{data.title}</p>}
      </div>
      {data.summary && <div className="mb-3"><p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>Professional Summary</p><p className="text-[10px] leading-relaxed text-gray-600">{data.summary}</p></div>}
      {data.experiences.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>Experience</p>
          {data.experiences.map((e) => (
            <div key={e.id} className="mb-2">
              <div className="flex justify-between"><p className="font-bold text-gray-800">{e.role}</p><p className="text-[9px] text-gray-400">{e.start}{e.start && (e.current ? " – Present" : e.end ? ` – ${e.end}` : "")}</p></div>
              <p className="italic text-[10px] text-gray-500">{e.company}</p>
              {e.bullets.filter(Boolean).map((b, i) => <p key={i} className="pl-3 text-[10px] text-gray-600 before:content-['•'] before:mr-1">{b}</p>)}
            </div>
          ))}
        </div>
      )}
      {data.educations.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>Education</p>
          {data.educations.map((e) => (
            <div key={e.id} className="mb-1.5 flex justify-between"><div><p className="font-bold text-gray-800">{e.degree} {e.field}</p><p className="text-[10px] text-gray-500">{e.institution}</p></div><p className="text-[9px] text-gray-400">{e.year}</p></div>
          ))}
        </div>
      )}
      {data.skills.length > 0 && <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>Skills</p><p className="text-[10px] text-gray-600">{data.skills.join(" · ")}</p></div>}
    </div>
  )
}

function MinimalPreview({ data, bgColor, accentColor }: { data: ResumeData; bgColor: string; accentColor: string }) {
  return (
    <div className="min-h-[900px] p-10 text-[11px]" style={{ fontFamily: "system-ui, sans-serif", backgroundColor: bgColor }}>
      <div className="mb-4 flex items-center gap-4">
        {data.photo && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
            <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
          </div>
        )}
        <div>
          <h1 className="mb-0.5 text-2xl font-bold tracking-tight" style={{ color: accentColor }}>{data.name || "Your Name"}</h1>
          {data.title && <p className="text-sm text-gray-400">{data.title}</p>}
        </div>
      </div>
      <p className="mb-6 text-[10px] text-gray-400">{[data.email, data.phone, data.location].filter(Boolean).join("  ·  ")}</p>
      {data.summary && <div className="mb-6"><p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>About</p><p className="text-[10px] leading-relaxed text-gray-600">{data.summary}</p></div>}
      {data.experiences.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Experience</p>
          {data.experiences.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between"><p className="font-semibold text-gray-800">{e.role}</p><p className="text-[9px] text-gray-400">{e.start}{e.start && (e.current ? "–now" : e.end ? `–${e.end}` : "")}</p></div>
              <p className="text-[10px] text-gray-400">{e.company}</p>
              {e.bullets.filter(Boolean).map((b, i) => <p key={i} className="mt-0.5 text-[10px] text-gray-500">— {b}</p>)}
            </div>
          ))}
        </div>
      )}
      {data.educations.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Education</p>
          {data.educations.map((e) => (
            <div key={e.id} className="mb-1.5"><p className="font-semibold text-gray-800">{e.degree} {e.field}</p><p className="text-[10px] text-gray-400">{e.institution} · {e.year}</p></div>
          ))}
        </div>
      )}
      {data.skills.length > 0 && <div><p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Skills</p><div className="flex flex-wrap gap-1.5">{data.skills.map((s) => <span key={s} className="rounded px-2 py-0.5 text-[10px]" style={{ border: `1px solid ${accentColor}40`, color: accentColor }}>{s}</span>)}</div></div>}
    </div>
  )
}

function ExecutivePreview({ data, bgColor, accentColor }: { data: ResumeData; bgColor: string; accentColor: string }) {
  return (
    <div className="min-h-[900px] text-[11px]" style={{ fontFamily: "Georgia, serif", backgroundColor: bgColor }}>
      <div className="flex items-center gap-5 p-6 pb-4" style={{ background: "#1a1a1a" }}>
        {data.photo && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: accentColor }}>
            <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-white">{data.name || "Your Name"}</h1>
          <p className="mt-0.5 text-sm" style={{ color: accentColor }}>{data.title || "Executive Title"}</p>
          <p className="mt-1 text-[10px] text-gray-400">{[data.email, data.phone, data.location].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <div className="flex">
        <div className="flex-1 border-r border-gray-100 p-5">
          {data.summary && <div className="mb-4"><p className="mb-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>Executive Summary</p><p className="text-[10px] leading-relaxed text-gray-600">{data.summary}</p></div>}
          {data.experiences.length > 0 && (
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>Career History</p>
              {data.experiences.map((e) => (
                <div key={e.id} className="mb-3">
                  <p className="font-bold text-gray-800">{e.role}</p>
                  <p className="text-[10px]" style={{ color: accentColor }}>{e.company} · {e.start}{e.current ? "–Present" : e.end ? `–${e.end}` : ""}</p>
                  {e.bullets.filter(Boolean).map((b, i) => <p key={i} className="pl-2 text-[10px] text-gray-600 before:content-['▸'] before:mr-1">{b}</p>)}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-[35%] p-5">
          {data.educations.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>Education</p>
              {data.educations.map((e) => (
                <div key={e.id} className="mb-2"><p className="font-bold text-gray-800 text-[10px]">{e.degree}</p><p className="text-[10px] text-gray-400">{e.institution}</p><p className="text-[9px] text-gray-400">{e.field} · {e.year}</p></div>
              ))}
            </div>
          )}
          {data.skills.length > 0 && (
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>Competencies</p>
              {data.skills.map((s) => <p key={s} className="mb-0.5 text-[10px] text-gray-600 before:content-['◆'] before:mr-1 before:text-[8px]" style={{ "--tw-content": "'◆'" } as React.CSSProperties}>{s}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Color palettes ────────────────────────────────────────────────────────────

const BG_PRESETS = [
  { label: "White", value: "#ffffff" },
  { label: "Cream", value: "#FAF7F4" },
  { label: "Warm Gray", value: "#F5F4F2" },
  { label: "Blush", value: "#FDF0F0" },
  { label: "Mint", value: "#F0FAF5" },
  { label: "Sky", value: "#F0F6FD" },
  { label: "Lavender", value: "#F4F0FD" },
  { label: "Lemon", value: "#FDFAF0" },
]

const ACCENT_PRESETS = [
  { label: "Rose", value: "#C5527A" },
  { label: "Coral", value: "#E8856A" },
  { label: "Navy", value: "#1E3A5F" },
  { label: "Charcoal", value: "#333333" },
  { label: "Gold", value: "#8B6914" },
  { label: "Teal", value: "#0F766E" },
  { label: "Plum", value: "#7C3AED" },
  { label: "Forest", value: "#166534" },
  { label: "Slate", value: "#475569" },
  { label: "Brick", value: "#B45309" },
]

const TEMPLATE_DEFAULT_ACCENT: Record<Template, string> = {
  modern: "#C5527A",
  classic: "#1E3A5F",
  minimal: "#333333",
  executive: "#8B6914",
}

const PREVIEW_MAP = { modern: ModernPreview, classic: ClassicPreview, minimal: MinimalPreview, executive: ExecutivePreview }

// ── Main page ─────────────────────────────────────────────────────────────────

export function CreateResumePage() {
  const [template, setTemplate] = useState<Template>("modern")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [accentColor, setAccentColor] = useState(TEMPLATE_DEFAULT_ACCENT.modern)
  const [data, setData] = useState<ResumeData>(BLANK)
  const [skillInput, setSkillInput] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const set = <K extends keyof ResumeData>(key: K, val: ResumeData[K]) =>
    setData((d) => ({ ...d, [key]: val }))

  // ── Experience helpers
  const addExp = () =>
    set("experiences", [...data.experiences, { id: crypto.randomUUID(), company: "", role: "", start: "", end: "", current: false, bullets: [""] }])
  const updateExp = (id: string, patch: Partial<Experience>) =>
    set("experiences", data.experiences.map((e) => e.id === id ? { ...e, ...patch } : e))
  const removeExp = (id: string) => set("experiences", data.experiences.filter((e) => e.id !== id))

  // ── Education helpers
  const addEdu = () =>
    set("educations", [...data.educations, { id: crypto.randomUUID(), institution: "", degree: "", field: "", year: "" }])
  const updateEdu = (id: string, patch: Partial<Education>) =>
    set("educations", data.educations.map((e) => e.id === id ? { ...e, ...patch } : e))
  const removeEdu = (id: string) => set("educations", data.educations.filter((e) => e.id !== id))

  // ── Skills
  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !data.skills.includes(s)) set("skills", [...data.skills, s])
    setSkillInput("")
  }

  // ── PDF download
  const handleDownload = async () => {
    if (!previewRef.current) return
    setIsDownloading(true)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const html2pdf = (typeof window !== "undefined") ? require("html2pdf.js") : null
    if (!html2pdf) { setIsDownloading(false); return }
    try {
      await html2pdf().from(previewRef.current).set({
        margin: 0,
        filename: `${data.name || "resume"}-${template}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).save()
    } finally {
      setIsDownloading(false)
    }
  }

  const inputCls = "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/40"
  const Preview = PREVIEW_MAP[template]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF7F4" }}>
      {/* Header */}
      <div className="border-b px-6 py-4" style={{ borderColor: "#EDE3DB" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/resume-review" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />Back
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-sm font-semibold text-foreground">Create Resume</h1>
          </div>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Template picker */}
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-500">Choose Template</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTemplate(t.id); setAccentColor(TEMPLATE_DEFAULT_ACCENT[t.id]) }}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all",
                  template === t.id ? "border-rose-400 bg-white shadow-md" : "border-border bg-white/60 hover:border-rose-200"
                )}
              >
                <div className="mb-1.5 h-1 w-8 rounded-full" style={{ background: t.accent }} />
                <p className="text-sm font-semibold text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Color pickers: bg + accent side by side */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          {/* Background color */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-500">Background Color</p>
            <div className="flex flex-wrap items-center gap-2">
              {BG_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setBgColor(p.value)}
                  title={p.label}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
                    bgColor === p.value ? "border-rose-400 shadow-md scale-110" : "border-border"
                  )}
                  style={{ backgroundColor: p.value }}
                />
              ))}
              <div className="relative flex items-center">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-full border-2 border-border p-0.5"
                  title="Custom"
                />
                <span className="ml-2 text-xs text-muted-foreground">Custom</span>
              </div>
              <span className="rounded-lg border border-border bg-white px-2.5 py-1 font-mono text-xs text-muted-foreground">{bgColor}</span>
            </div>
          </div>

          {/* Accent / text color */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-500">Accent Color / Text Color</p>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setAccentColor(p.value)}
                  title={p.label}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
                    accentColor === p.value ? "border-rose-400 shadow-md scale-110" : "border-border"
                  )}
                  style={{ backgroundColor: p.value }}
                />
              ))}
              <div className="relative flex items-center">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-full border-2 border-border p-0.5"
                  title="Custom"
                />
                <span className="ml-2 text-xs text-muted-foreground">Custom</span>
              </div>
              <span className="rounded-lg border border-border bg-white px-2.5 py-1 font-mono text-xs text-muted-foreground">{accentColor}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_480px]">
          {/* ── Form ── */}
          <div className="space-y-6">
            {/* Personal info */}
            <div className="card-glass p-6">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-foreground">Personal Information</h2>
              </div>

              {/* Photo upload */}
              <div className="mb-4 flex items-center gap-4">
                <div className="relative">
                  <div
                    className="h-20 w-20 overflow-hidden rounded-full border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-rose-300"
                    style={data.photo ? { borderStyle: "solid", borderColor: accentColor } : {}}
                  >
                    {data.photo
                      ? <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-muted-foreground">
                          <Camera className="h-5 w-5" />
                          <span className="text-[9px]">Photo</span>
                        </div>
                    }
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = (ev) => set("photo", ev.target?.result as string)
                      reader.readAsDataURL(file)
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP · optional</p>
                  {data.photo && (
                    <button
                      onClick={() => set("photo", "")}
                      className="mt-1.5 flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input className={inputCls} placeholder="Full name *" value={data.name} onChange={(e) => set("name", e.target.value)} />
                <input className={inputCls} placeholder="Professional title" value={data.title} onChange={(e) => set("title", e.target.value)} />
                <input className={inputCls} placeholder="Email" type="email" value={data.email} onChange={(e) => set("email", e.target.value)} />
                <input className={inputCls} placeholder="Phone" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
                <input className={cn(inputCls, "sm:col-span-2")} placeholder="Location (e.g. Jakarta, Indonesia)" value={data.location} onChange={(e) => set("location", e.target.value)} />
              </div>
              <textarea
                className={cn(inputCls, "mt-3 resize-y")}
                rows={3}
                placeholder="Professional summary…"
                value={data.summary}
                onChange={(e) => set("summary", e.target.value)}
              />
            </div>

            {/* Experience */}
            <div className="card-glass p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-rose-500" />
                  <h2 className="text-sm font-semibold text-foreground">Work Experience</h2>
                </div>
                <button onClick={addExp} className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              {data.experiences.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No experience added yet. Click Add to start.</p>
              )}
              {data.experiences.map((exp, idx) => (
                <div key={exp.id} className={cn("rounded-xl border border-border/60 p-4", idx > 0 && "mt-4")}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Position {idx + 1}</span>
                    <button onClick={() => removeExp(exp.id)} className="rounded-lg p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input className={inputCls} placeholder="Job title" value={exp.role} onChange={(e) => updateExp(exp.id, { role: e.target.value })} />
                    <input className={inputCls} placeholder="Company" value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })} />
                    <input className={inputCls} placeholder="Start (e.g. Jan 2022)" value={exp.start} onChange={(e) => updateExp(exp.id, { start: e.target.value })} />
                    <div className="flex items-center gap-2">
                      <input className={cn(inputCls, "flex-1")} placeholder="End" value={exp.end} disabled={exp.current} onChange={(e) => updateExp(exp.id, { end: e.target.value })} />
                      <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                        <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, { current: e.target.checked, end: "" })} />
                        Current
                      </label>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs text-muted-foreground">Key achievements / responsibilities</p>
                    {exp.bullets.map((b, bi) => (
                      <div key={bi} className="flex items-center gap-2">
                        <span className="text-muted-foreground">•</span>
                        <input
                          className={cn(inputCls, "flex-1")}
                          placeholder="e.g. Increased revenue by 30%…"
                          value={b}
                          onChange={(e) => {
                            const bullets = [...exp.bullets]
                            bullets[bi] = e.target.value
                            updateExp(exp.id, { bullets })
                          }}
                        />
                        {exp.bullets.length > 1 && (
                          <button onClick={() => updateExp(exp.id, { bullets: exp.bullets.filter((_, i) => i !== bi) })} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => updateExp(exp.id, { bullets: [...exp.bullets, ""] })} className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600">
                      <Plus className="h-3 w-3" /> Add bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="card-glass p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-rose-500" />
                  <h2 className="text-sm font-semibold text-foreground">Education</h2>
                </div>
                <button onClick={addEdu} className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              {data.educations.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No education added yet.</p>
              )}
              {data.educations.map((edu, idx) => (
                <div key={edu.id} className={cn("rounded-xl border border-border/60 p-4", idx > 0 && "mt-4")}>
                  <div className="mb-3 flex justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Education {idx + 1}</span>
                    <button onClick={() => removeEdu(edu.id)} className="rounded-lg p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input className={cn(inputCls, "sm:col-span-2")} placeholder="Institution name" value={edu.institution} onChange={(e) => updateEdu(edu.id, { institution: e.target.value })} />
                    <input className={inputCls} placeholder="Degree (e.g. Bachelor's)" value={edu.degree} onChange={(e) => updateEdu(edu.id, { degree: e.target.value })} />
                    <input className={inputCls} placeholder="Field of study" value={edu.field} onChange={(e) => updateEdu(edu.id, { field: e.target.value })} />
                    <input className={inputCls} placeholder="Graduation year" value={edu.year} onChange={(e) => updateEdu(edu.id, { year: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="card-glass p-6">
              <div className="mb-4 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-foreground">Skills</h2>
              </div>
              <div className="flex gap-2">
                <input
                  className={cn(inputCls, "flex-1")}
                  placeholder="e.g. React, Python, Project Management…"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <button onClick={addSkill} className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {data.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.skills.map((s) => (
                    <span key={s} className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                      {s}
                      <button onClick={() => set("skills", data.skills.filter((x) => x !== s))} className="ml-0.5 text-rose-400 hover:text-rose-600">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Preview ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-500">Live Preview</p>
            <div className="overflow-hidden rounded-2xl border shadow-lg" style={{ borderColor: "#EDE3DB" }}>
              <div ref={previewRef} style={{ backgroundColor: bgColor }}>
                <Preview data={data} bgColor={bgColor} accentColor={accentColor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
