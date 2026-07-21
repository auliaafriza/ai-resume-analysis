"use client"

import { useEffect, useRef, useState } from "react"

import { ArrowLeft, Download, Loader2, RotateCcw, Save, Sparkles, X } from "lucide-react"
import Link from "next/link"

import { GenerateWithAIModal } from "@/features/create-resume/components/GenerateWithAIModal"
import { EducationForm } from "@/features/create-resume/components/form/EducationForm"
import { ExperienceForm } from "@/features/create-resume/components/form/ExperienceForm"
import { PersonalInfoForm } from "@/features/create-resume/components/form/PersonalInfoForm"
import { SkillsForm } from "@/features/create-resume/components/form/SkillsForm"
import { timeAgo, useDraft } from "@/features/create-resume/hooks/useDraft"
import type { Education, Experience, ResumeData, Template } from "@/lib/interface/createResume"
import { cn } from "@/lib/utils/cn"

import ClassicPreview from "../components/preview/ClassicPreview"
import ExecutivePreview from "../components/preview/ExecutivePreview"
import MinimalPreview from "../components/preview/MinimalPreview"
import ModernPreview from "../components/preview/ModernPreview"

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

// ── Main page ──────────────────────────────────────────────────────────────────

export function CreateResumePage() {
  const [template, setTemplate] = useState<Template>("modern")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [accentColor, setAccentColor] = useState(TEMPLATE_DEFAULT_ACCENT.modern)
  const [data, setData] = useState<ResumeData>(BLANK)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showRestoreBanner, setShowRestoreBanner] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // ── Draft persistence ──────────────────────────────────────────────────────
  const { loadDraft, scheduleSave, clearDraft, savedAt, hasDraft } = useDraft()

  // On mount: show restore banner if a draft exists
  useEffect(() => {
    if (hasDraft) setShowRestoreBanner(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once — hasDraft is stable after first check

  // Auto-save on every meaningful state change (debounced 1.5s)
  useEffect(() => {
    scheduleSave({ template, bgColor, accentColor, data })
  }, [template, bgColor, accentColor, data, scheduleSave])

  const handleRestoreDraft = () => {
    const draft = loadDraft()
    if (!draft) return
    setTemplate(draft.template)
    setBgColor(draft.bgColor)
    setAccentColor(draft.accentColor)
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

  // ── PDF download
  const handleDownload = async () => {
    if (!previewRef.current) return
    setIsDownloading(true)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const html2pdf = typeof window !== "undefined" ? require("html2pdf.js") : null
    if (!html2pdf) {
      setIsDownloading(false)
      return
    }
    try {
      await html2pdf()
        .from(previewRef.current)
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

  const Preview = PREVIEW_MAP[template]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF7F4" }}>
      {/* ── Header ── */}
      <div className="border-b px-6 py-4" style={{ borderColor: "#EDE3DB" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/resume-review"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-sm font-semibold text-foreground">Create Resume</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Draft saved indicator */}
            {savedAt && (
              <div
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium"
                style={{ borderColor: "#D1FAE5", backgroundColor: "#F0FDF4", color: "#059669" }}
              >
                <Save className="h-3 w-3" />
                <span>Saved {timeAgo(savedAt)}</span>
                <button
                  onClick={handleDiscardDraft}
                  title="Clear draft"
                  className="ml-0.5 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
              style={{ borderColor: "#C5527A", color: "#C5527A", backgroundColor: "#FDF0F0" }}
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </button>
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
      </div>

      {/* ── Restore draft banner ── */}
      {showRestoreBanner && (
        <div
          className="border-b px-6 py-3"
          style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-sm" style={{ color: "#92400E" }}>
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span>
                You have an unsaved draft.{" "}
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
      )}

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ── Template picker ── */}
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-500">Choose Template</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTemplate(t.id)
                  setAccentColor(TEMPLATE_DEFAULT_ACCENT[t.id])
                }}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all",
                  template === t.id
                    ? "border-rose-400 bg-white shadow-md"
                    : "border-border bg-white/60 hover:border-rose-200",
                )}
              >
                <div className="mb-1.5 h-1 w-8 rounded-full" style={{ background: t.accent }} />
                <p className="text-sm font-semibold text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Color pickers ── */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          <ColorPicker label="Background Color" presets={BG_PRESETS} value={bgColor} onChange={setBgColor} />
          <ColorPicker label="Accent Color / Text Color" presets={ACCENT_PRESETS} value={accentColor} onChange={setAccentColor} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_480px]">
          {/* ── Form sections ── */}
          <div className="space-y-6">
            <PersonalInfoForm data={data} accentColor={accentColor} onChange={set} />
            <ExperienceForm experiences={data.experiences} onAdd={addExp} onUpdate={updateExp} onRemove={removeExp} />
            <EducationForm educations={data.educations} onAdd={addEdu} onUpdate={updateEdu} onRemove={removeEdu} />
            <SkillsForm skills={data.skills} onChange={(skills) => set("skills", skills)} />
          </div>

          {/* ── Live preview ── */}
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
