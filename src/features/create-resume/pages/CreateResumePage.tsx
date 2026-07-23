"use client"

import { useEffect, useRef, useState } from "react"

import { ArrowLeft, Download, Eye, Loader2, RotateCcw, Save, Sparkles, X } from "lucide-react"
import Link from "next/link"

import { GenerateWithAIModal } from "@/features/create-resume/components/GenerateWithAIModal"
import { CertificationsForm } from "@/features/create-resume/components/form/CertificationsForm"
import { EducationForm } from "@/features/create-resume/components/form/EducationForm"
import { ExperienceForm } from "@/features/create-resume/components/form/ExperienceForm"
import { PersonalInfoForm } from "@/features/create-resume/components/form/PersonalInfoForm"
import { ProjectsForm } from "@/features/create-resume/components/form/ProjectsForm"
import { SkillsForm } from "@/features/create-resume/components/form/SkillsForm"
import { timeAgo, useDraft } from "@/features/create-resume/hooks/useDraft"
import type { Certification, Education, Experience, Project, ResumeData, Template } from "@/lib/interface/createResume"
import { cn } from "@/lib/utils/cn"

import ClassicPreview from "../components/preview/ClassicPreview"
import ExecutivePreview from "../components/preview/ExecutivePreview"
import MinimalPreview from "../components/preview/MinimalPreview"
import ModernPreview from "../components/preview/ModernPreview"

// ── Fonts ─────────────────────────────────────────────────────────────────────

const FONTS: { id: string; label: string; family: string; category: "sans" | "serif" }[] = [
  { id: "inter",        label: "Inter",        family: "'Inter', sans-serif",         category: "sans"  },
  { id: "lato",         label: "Lato",         family: "'Lato', sans-serif",          category: "sans"  },
  { id: "raleway",      label: "Raleway",      family: "'Raleway', sans-serif",       category: "sans"  },
  { id: "georgia",      label: "Georgia",      family: "Georgia, serif",              category: "serif" },
  { id: "playfair",     label: "Playfair",     family: "'Playfair Display', serif",   category: "serif" },
  { id: "merriweather", label: "Merriweather", family: "'Merriweather', serif",       category: "serif" },
]

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700" +
  "&family=Lato:wght@400;700" +
  "&family=Raleway:wght@400;500;600;700" +
  "&family=Playfair+Display:wght@400;600;700" +
  "&family=Merriweather:wght@400;700" +
  "&display=swap"

const DEFAULT_FONT_ID = "inter"

// ── Constants ─────────────────────────────────────────────────────────────────

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
  certifications: [],
  projects: [],
  skills: [],
}

const TEMPLATES: { id: Template; label: string; desc: string; accent: string }[] = [
  { id: "modern", label: "Modern", desc: "Clean sidebar, bold header, rose accent", accent: "#C5527A" },
  { id: "classic", label: "Classic", desc: "Traditional layout, navy tones, timeless", accent: "#1E3A5F" },
  { id: "minimal", label: "Minimal", desc: "Ultra-clean, lots of white space", accent: "#333333" },
  { id: "executive", label: "Executive", desc: "Two-column, gold accents, prestige feel", accent: "#8B6914" },
]

const TEMPLATE_DEFAULT_ACCENT: Record<Template, string> = {
  modern: "#C5527A",
  classic: "#1E3A5F",
  minimal: "#333333",
  executive: "#8B6914",
}

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

// ── Preview components ─────────────────────────────────────────────────────────

interface PreviewProps {
  data: ResumeData
  bgColor: string
  accentColor: string
  fontFamily?: string
}

const PREVIEW_MAP: Record<Template, React.ComponentType<PreviewProps>> = {
  modern: ModernPreview,
  classic: ClassicPreview,
  minimal: MinimalPreview,
  executive: ExecutivePreview,
}

// ── Color swatch helper ────────────────────────────────────────────────────────

function ColorPicker({
  label,
  presets,
  value,
  onChange,
}: {
  label: string
  presets: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-500">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            title={p.label}
            className={cn(
              "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
              value === p.value ? "scale-110 border-rose-400 shadow-md" : "border-border",
            )}
            style={{ backgroundColor: p.value }}
          />
        ))}
        <div className="relative flex items-center">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded-full border-2 border-border p-0.5"
            title="Custom"
          />
          <span className="ml-2 text-xs text-muted-foreground">Custom</span>
        </div>
        <span className="rounded-lg border border-border bg-white px-2.5 py-1 font-mono text-xs text-muted-foreground">
          {value}
        </span>
      </div>
    </div>
  )
}

// ── Font picker helper ────────────────────────────────────────────────────────

function FontPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-500">Font</p>
      <div className="flex flex-wrap gap-2">
        {FONTS.map((f) => (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            title={f.category === "serif" ? "Serif" : "Sans-serif"}
            className={cn(
              "rounded-xl border-2 px-4 py-2 text-sm transition-all",
              value === f.id
                ? "border-rose-400 bg-white shadow-md"
                : "border-border bg-white/60 hover:border-rose-200",
            )}
            style={{ fontFamily: f.family }}
          >
            {f.label}
            <span className="ml-1.5 text-[9px] font-normal opacity-40">
              {f.category === "serif" ? "Serif" : "Sans"}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function CreateResumePage() {
  const [template, setTemplate] = useState<Template>("modern")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [accentColor, setAccentColor] = useState(TEMPLATE_DEFAULT_ACCENT.modern)
  const [fontId, setFontId] = useState(DEFAULT_FONT_ID)
  const [data, setData] = useState<ResumeData>(BLANK)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showRestoreBanner, setShowRestoreBanner] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)      // desktop sticky preview
  const printTargetRef = useRef<HTMLDivElement>(null)  // off-screen mobile print target

  // ── Google Fonts loader ────────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById("resume-google-fonts")) return
    const link = document.createElement("link")
    link.id = "resume-google-fonts"
    link.rel = "stylesheet"
    link.href = GOOGLE_FONTS_URL
    document.head.appendChild(link)
  }, [])

  // ── Draft persistence ──────────────────────────────────────────────────────
  const { loadDraft, scheduleSave, clearDraft, savedAt, hasDraft } = useDraft()

  // On mount: show restore banner if a draft exists
  useEffect(() => {
    if (hasDraft) setShowRestoreBanner(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once — hasDraft is stable after first check

  // Auto-save on every meaningful state change (debounced 1.5s)
  useEffect(() => {
    scheduleSave({ template, bgColor, accentColor, fontId, data })
  }, [template, bgColor, accentColor, fontId, data, scheduleSave])

  const handleRestoreDraft = () => {
    const draft = loadDraft()
    if (!draft) return
    setTemplate(draft.template)
    setBgColor(draft.bgColor)
    setAccentColor(draft.accentColor)
    setFontId(draft.fontId ?? DEFAULT_FONT_ID)
    setData(draft.data)
    setShowRestoreBanner(false)
  }

  const handleDiscardDraft = () => {
    clearDraft()
    setShowRestoreBanner(false)
  }

  // ── Generic field setter
  const set = <K extends keyof ResumeData>(key: K, val: ResumeData[K]) => setData((d) => ({ ...d, [key]: val }))

  // ── Handle AI-generated resume data
  const handleGenerated = (generated: Partial<ResumeData>) => {
    setData((prev) => ({
      ...prev,
      ...generated,
      // preserve photo if already uploaded
      photo: prev.photo || generated.photo || "",
    }))
  }

  // ── Experience helpers
  const addExp = () =>
    set("experiences", [
      ...data.experiences,
      { id: crypto.randomUUID(), company: "", role: "", start: "", end: "", current: false, bullets: [""] },
    ])
  const updateExp = (id: string, patch: Partial<Experience>) =>
    set(
      "experiences",
      data.experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    )
  const removeExp = (id: string) =>
    set(
      "experiences",
      data.experiences.filter((e) => e.id !== id),
    )

  // ── Education helpers
  const addEdu = () =>
    set("educations", [
      ...data.educations,
      { id: crypto.randomUUID(), institution: "", degree: "", field: "", year: "" },
    ])
  const updateEdu = (id: string, patch: Partial<Education>) =>
    set(
      "educations",
      data.educations.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    )
  const removeEdu = (id: string) =>
    set(
      "educations",
      data.educations.filter((e) => e.id !== id),
    )

  // ── Certification helpers
  const addCert = () =>
    set("certifications", [
      ...data.certifications,
      { id: crypto.randomUUID(), name: "", issuer: "", date: "", url: "" },
    ])
  const updateCert = (id: string, patch: Partial<Certification>) =>
    set(
      "certifications",
      data.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    )
  const removeCert = (id: string) =>
    set(
      "certifications",
      data.certifications.filter((c) => c.id !== id),
    )

  // ── Project helpers
  const addProject = () =>
    set("projects", [
      ...data.projects,
      { id: crypto.randomUUID(), name: "", description: "", url: "", tech: [] },
    ])
  const updateProject = (id: string, patch: Partial<Project>) =>
    set(
      "projects",
      data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    )
  const removeProject = (id: string) =>
    set(
      "projects",
      data.projects.filter((p) => p.id !== id),
    )

  // ── PDF download
  const handleDownload = async () => {
    // On desktop the sticky preview is visible; on mobile use the off-screen print target
    const node =
      typeof window !== "undefined" && window.innerWidth >= 1024
        ? previewRef.current
        : printTargetRef.current
    if (!node) return
    setIsDownloading(true)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const html2pdf = typeof window !== "undefined" ? require("html2pdf.js") : null
    if (!html2pdf) {
      setIsDownloading(false)
      return
    }
    try {
      await html2pdf()
        .from(node)
        .set({
          margin: 0,
          filename: `${data.name || "resume"}-${template}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save()
    } finally {
      setIsDownloading(false)
    }
  }

  const fontFamily = (FONTS.find((f) => f.id === fontId) ?? FONTS[0]).family
  const Preview = PREVIEW_MAP[template]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF7F4" }}>
      {/* ── Header ── */}
      <div className="border-b px-4 py-3 sm:px-6 sm:py-4" style={{ borderColor: "#EDE3DB" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          {/* Left */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/resume-review"
              className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <span className="hidden text-muted-foreground sm:block">/</span>
            <h1 className="hidden truncate text-sm font-semibold text-foreground sm:block">Create Resume</h1>
          </div>

          {/* Right */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Draft saved chip — icon-only on mobile */}
            {savedAt ? (
              <div
                className="flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium sm:gap-1.5 sm:px-2.5"
                style={{ borderColor: "#D1FAE5", backgroundColor: "#F0FDF4", color: "#059669" }}
              >
                <Save className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">Saved {timeAgo(savedAt)}</span>
                <button
                  onClick={handleDiscardDraft}
                  title="Clear draft"
                  className="rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null}

            {/* Generate with AI — label hidden on xs */}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all hover:opacity-90 sm:px-4 sm:py-2.5"
              style={{ borderColor: "#C5527A", color: "#C5527A", backgroundColor: "#FDF0F0" }}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Generate with AI</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Download — label hidden on xs */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60 sm:px-5 sm:py-2.5"
              style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 shrink-0" />}
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Restore draft banner ── */}
      {showRestoreBanner ? (
        <div
          className="border-b px-4 py-3 sm:px-6"
          style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: "#92400E" }}>
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span>
                You have a saved draft.{" "}
                <strong>Restore it</strong> to continue where you left off.
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={handleRestoreDraft}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#D97706" }}
              >
                Restore draft
              </button>
              <button
                onClick={handleDiscardDraft}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-amber-100"
                style={{ color: "#92400E" }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* ── Template picker ── */}
        <div className="mb-6 sm:mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-500">Choose Template</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTemplate(t.id)
                  setAccentColor(TEMPLATE_DEFAULT_ACCENT[t.id])
                }}
                className={cn(
                  "rounded-xl border-2 p-3 text-left transition-all sm:p-4",
                  template === t.id
                    ? "border-rose-400 bg-white shadow-md"
                    : "border-border bg-white/60 hover:border-rose-200",
                )}
              >
                <div className="mb-1.5 h-1 w-6 rounded-full sm:w-8" style={{ background: t.accent }} />
                <p className="text-xs font-semibold text-foreground sm:text-sm">{t.label}</p>
                <p className="mt-0.5 line-clamp-1 hidden text-xs text-muted-foreground sm:block">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Color pickers ── */}
        <div className="mb-6 grid gap-5 sm:mb-8 sm:grid-cols-2 sm:gap-6">
          <ColorPicker label="Background Color" presets={BG_PRESETS} value={bgColor} onChange={setBgColor} />
          <ColorPicker label="Accent Color / Text Color" presets={ACCENT_PRESETS} value={accentColor} onChange={setAccentColor} />
        </div>

        {/* ── Font picker ── */}
        <div className="mb-6 sm:mb-8">
          <FontPicker value={fontId} onChange={setFontId} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_480px]">
          {/* ── Form sections — extra bottom padding on mobile for floating button ── */}
          <div className="space-y-5 pb-28 sm:space-y-6 lg:pb-0">
            <PersonalInfoForm data={data} accentColor={accentColor} onChange={set} />
            <ExperienceForm experiences={data?.experiences ?? []} onAdd={addExp} onUpdate={updateExp} onRemove={removeExp} />
            <EducationForm educations={data?.educations ?? []} onAdd={addEdu} onUpdate={updateEdu} onRemove={removeEdu} />
            <CertificationsForm certifications={data?.certifications ?? []} onAdd={addCert} onUpdate={updateCert} onRemove={removeCert} />
            <ProjectsForm projects={data?.projects ?? []} onAdd={addProject} onUpdate={updateProject} onRemove={removeProject} />
            <SkillsForm skills={data?.skills ?? []} onChange={(skills) => set("skills", skills)} />
          </div>

          {/* ── Live preview — desktop only ── */}
          <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-500">Live Preview</p>
            <div className="overflow-hidden rounded-2xl border shadow-lg" style={{ borderColor: "#EDE3DB" }}>
              <div ref={previewRef} style={{ backgroundColor: bgColor }}>
                <Preview data={data} bgColor={bgColor} accentColor={accentColor} fontFamily={fontFamily} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: off-screen print target (always in DOM, used by html2pdf on mobile) ── */}
      <div
        aria-hidden="true"
        className="lg:hidden"
        style={{ position: "fixed", left: "-9999px", top: 0, width: "480px", pointerEvents: "none", zIndex: -1 }}
      >
        <div ref={printTargetRef} style={{ backgroundColor: bgColor }}>
          <Preview data={data} bgColor={bgColor} accentColor={accentColor} fontFamily={fontFamily} />
        </div>
      </div>

      {/* ── Mobile: floating "Preview" button ── */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="fixed bottom-6 right-4 z-30 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-xl transition-all hover:opacity-90 active:scale-95 lg:hidden"
        style={{ background: "linear-gradient(135deg, #E8856A 0%, #C5527A 100%)" }}
      >
        <Eye className="h-4 w-4" />
        Preview
      </button>

      {/* ── Mobile: full-screen preview overlay ── */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          {/* Overlay header */}
          <div
            className="flex shrink-0 items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "#EDE3DB", backgroundColor: "#FAF7F4" }}
          >
            <p className="text-sm font-semibold text-gray-800">Resume Preview</p>
            <button
              onClick={() => setShowMobilePreview(false)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable preview */}
          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            <div className="overflow-x-auto rounded-2xl border shadow-lg" style={{ borderColor: "#EDE3DB" }}>
              <div style={{ minWidth: "360px", backgroundColor: bgColor }}>
                <Preview data={data} bgColor={bgColor} accentColor={accentColor} fontFamily={fontFamily} />
              </div>
            </div>
          </div>

          {/* Overlay footer — download button */}
          <div className="shrink-0 border-t p-4" style={{ borderColor: "#EDE3DB", backgroundColor: "#FAF7F4" }}>
            <button
              onClick={async () => { await handleDownload(); setShowMobilePreview(false) }}
              disabled={isDownloading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* ── Generate with AI modal ── */}
      {showGenerateModal && (
        <GenerateWithAIModal
          onGenerated={handleGenerated}
          onClose={() => setShowGenerateModal(false)}
        />
      )}
    </div>
  )
}
