"use client"

import { useEffect, useRef, useState } from "react"

import {
  AlertCircle,
  Check,
  ClipboardCopy,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  Upload,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils/cn"
import { timeAgo, useLocalDraft } from "@/lib/useLocalDraft"

// ── i18n ──────────────────────────────────────────────────────────────────────

const T = {
  en: {
    title: "Cover Letter Generator",
    subtitle: "Upload your resume + paste the job description → get a tailored cover letter in seconds",
    resumeTab: "Upload File",
    pasteTab: "Paste Text",
    resumeLabel: "Your Resume",
    pasteLabel: "Paste resume text",
    pastePlaceholder: "Paste your resume content here…",
    dropLabel: "Drag & drop or click to upload",
    dropSub: "PDF or Word (.docx) — max 5 MB",
    companyLabel: "Company Name",
    companyPlaceholder: "e.g. Google",
    roleLabel: "Job Title / Role",
    rolePlaceholder: "e.g. Senior Product Manager",
    jdLabel: "Job Description",
    jdPlaceholder: "Paste the full job description here. The more detail, the better the cover letter.",
    toneLabel: "Tone",
    tones: {
      professional: "Professional",
      enthusiastic: "Enthusiastic",
      concise: "Concise",
      creative: "Creative",
    },
    langLabel: "Output Language",
    generate: "Generate Cover Letter",
    generating: "Generating…",
    outputTitle: "Your Cover Letter",
    outputPlaceholder: "Your personalized cover letter will appear here once generated.",
    words: "words",
    copy: "Copy",
    copied: "Copied!",
    download: "Download .txt",
    errorPrefix: "Error: ",
    fileError: "Only PDF or Word (.docx) files are supported.",
    sizeError: "File size must be under 5 MB.",
    resumeRequired: "Please upload your resume or paste your resume text.",
    draftRestored: "Draft restored",
    draftSaved: "Saved",
    draftBanner: "You have a saved draft. Restore it to continue where you left off.",
    draftRestore: "Restore",
    draftDiscard: "Discard",
    draftFileNote: "File attachment is not saved — please re-upload your resume.",
  },
  id: {
    title: "Generator Cover Letter",
    subtitle: "Upload CV + tempel deskripsi pekerjaan → dapatkan cover letter yang personal dalam hitungan detik",
    resumeTab: "Upload File",
    pasteTab: "Tempel Teks",
    resumeLabel: "CV Kamu",
    pasteLabel: "Tempel teks CV",
    pastePlaceholder: "Tempel isi CV kamu di sini…",
    dropLabel: "Seret & lepas atau klik untuk upload",
    dropSub: "PDF atau Word (.docx) — maks 5 MB",
    companyLabel: "Nama Perusahaan",
    companyPlaceholder: "mis. Google",
    roleLabel: "Posisi / Jabatan",
    rolePlaceholder: "mis. Senior Product Manager",
    jdLabel: "Deskripsi Pekerjaan",
    jdPlaceholder: "Tempel deskripsi pekerjaan lengkap di sini. Semakin detail, semakin bagus hasilnya.",
    toneLabel: "Gaya Penulisan",
    tones: {
      professional: "Profesional",
      enthusiastic: "Antusias",
      concise: "Ringkas",
      creative: "Kreatif",
    },
    langLabel: "Bahasa Output",
    generate: "Generate Cover Letter",
    generating: "Sedang membuat…",
    outputTitle: "Cover Letter Kamu",
    outputPlaceholder: "Cover letter personal kamu akan muncul di sini setelah di-generate.",
    words: "kata",
    copy: "Salin",
    copied: "Tersalin!",
    download: "Download .txt",
    errorPrefix: "Error: ",
    fileError: "Hanya file PDF atau Word (.docx) yang didukung.",
    sizeError: "Ukuran file harus di bawah 5 MB.",
    resumeRequired: "Silakan upload CV atau tempel teks CV kamu.",
    draftRestored: "Draft dipulihkan",
    draftSaved: "Tersimpan",
    draftBanner: "Kamu punya draft tersimpan. Pulihkan untuk melanjutkan dari mana kamu berhenti.",
    draftRestore: "Pulihkan",
    draftDiscard: "Buang",
    draftFileNote: "File lampiran tidak tersimpan — upload ulang CV kamu.",
  },
}

type Lang = "en" | "id"
type Tone = "professional" | "enthusiastic" | "concise" | "creative"
type InputMode = "upload" | "paste"

// ── Style constants ───────────────────────────────────────────────────────────

const FONTS: { id: string; label: string; family: string; category: "sans" | "serif" }[] = [
  { id: "georgia",      label: "Georgia",      family: "Georgia, serif",              category: "serif" },
  { id: "merriweather", label: "Merriweather", family: "'Merriweather', serif",       category: "serif" },
  { id: "playfair",     label: "Playfair",     family: "'Playfair Display', serif",   category: "serif" },
  { id: "inter",        label: "Inter",        family: "'Inter', sans-serif",         category: "sans"  },
  { id: "lato",         label: "Lato",         family: "'Lato', sans-serif",          category: "sans"  },
  { id: "raleway",      label: "Raleway",      family: "'Raleway', sans-serif",       category: "sans"  },
]

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700" +
  "&family=Lato:wght@400;700" +
  "&family=Raleway:wght@400;500;600;700" +
  "&family=Playfair+Display:wght@400;600;700" +
  "&family=Merriweather:wght@400;700" +
  "&display=swap"

const DEFAULT_FONT_ID = "georgia"

const COVER_ACCENT_PRESETS = [
  { label: "Navy",      value: "#1E3A5F" },
  { label: "Charcoal",  value: "#333333" },
  { label: "Rose",      value: "#C5527A" },
  { label: "Forest",    value: "#166534" },
  { label: "Teal",      value: "#0F766E" },
  { label: "Slate",     value: "#475569" },
  { label: "Gold",      value: "#8B6914" },
  { label: "Burgundy",  value: "#7F1D1D" },
]

const DEFAULT_OUTPUT_ACCENT = "#1E3A5F"

// ── Constants ─────────────────────────────────────────────────────────────────

const TONES: Tone[] = ["professional", "enthusiastic", "concise", "creative"]

const TONE_DESC: Record<Tone, { en: string; id: string }> = {
  professional: { en: "Formal & polished", id: "Formal & rapi" },
  enthusiastic: { en: "Warm & energetic", id: "Hangat & bersemangat" },
  concise: { en: "Short & direct", id: "Singkat & langsung" },
  creative: { en: "Distinctive & bold", id: "Unik & berkesan" },
}

const ACCENT = "#C5527A"
const ACCENT_LIGHT = "#FDF0F0"
const BORDER = "#EDE3DB"
const BG = "#FAF7F4"

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border bg-white p-6"
      style={{ borderColor: BORDER }}
    >
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#8B5E52" }}>
      {children}
    </label>
  )
}

const inputCls =
  "w-full rounded-xl border px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors"
const inputStyle = {
  borderColor: "#E5E7EB",
  backgroundColor: "#F9FAFB",
}

// ── Style sub-components ──────────────────────────────────────────────────────

function FontRow({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#8B5E52" }}>Font</p>
      <div className="flex flex-wrap gap-2">
        {FONTS.map((f) => (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={cn(
              "rounded-lg border-2 px-3 py-1.5 text-xs transition-all",
              value === f.id
                ? "border-rose-400 bg-white shadow-sm"
                : "border-transparent bg-gray-100 hover:border-rose-200",
            )}
            style={{ fontFamily: f.family }}
          >
            {f.label}
            <span className="ml-1 text-[9px] opacity-40">{f.category === "serif" ? "Serif" : "Sans"}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function AccentRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#8B5E52" }}>Accent Color</p>
      <div className="flex flex-wrap items-center gap-2">
        {COVER_ACCENT_PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            title={p.label}
            className={cn(
              "h-7 w-7 rounded-full border-2 transition-all hover:scale-110",
              value === p.value ? "scale-110 border-rose-400 shadow-md" : "border-transparent",
            )}
            style={{ backgroundColor: p.value }}
          />
        ))}
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded-full border-2 border-gray-200 p-0.5"
            title="Custom"
          />
          <span className="font-mono text-[11px] text-gray-400">{value}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function CoverLetterPage() {
  const [lang, setLang] = useState<Lang>("en")
  const [mode, setMode] = useState<InputMode>("upload")

  // File upload state
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Paste state
  const [pasteText, setPasteText] = useState("")

  // Job details
  const [company, setCompany] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")

  // Options
  const [tone, setTone] = useState<Tone>("professional")

  // Style options
  const [fontId, setFontId] = useState(DEFAULT_FONT_ID)
  const [outputAccent, setOutputAccent] = useState(DEFAULT_OUTPUT_ACCENT)

  // Output state
  const [coverLetter, setCoverLetter] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  // ── Google Fonts loader ────────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById("cover-letter-google-fonts")) return
    const link = document.createElement("link")
    link.id = "cover-letter-google-fonts"
    link.rel = "stylesheet"
    link.href = GOOGLE_FONTS_URL
    document.head.appendChild(link)
  }, [])

  // ── Draft persistence ──────────────────────────────────────────────────────
  const [showRestoreBanner, setShowRestoreBanner] = useState(false)

  const { hasDraft, savedAt, scheduleSave, loadDraft, clearDraft } =
    useLocalDraft<{
      lang: Lang
      mode: InputMode
      pasteText: string
      company: string
      jobTitle: string
      jobDescription: string
      tone: Tone
      fontId: string
      outputAccent: string
      coverLetter: string
    }>("ai-resume-builder:cover-letter-draft")

  // Show restore banner on mount if draft exists
  useEffect(() => {
    if (hasDraft) setShowRestoreBanner(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save on every relevant state change (file excluded — not serialisable)
  useEffect(() => {
    scheduleSave({ lang, mode, pasteText, company, jobTitle, jobDescription, tone, fontId, outputAccent, coverLetter })
  }, [lang, mode, pasteText, company, jobTitle, jobDescription, tone, fontId, outputAccent, coverLetter, scheduleSave])

  const handleRestoreDraft = () => {
    const draft = loadDraft()
    if (!draft) return
    setLang(draft.lang)
    setMode(draft.mode)
    setPasteText(draft.pasteText)
    setCompany(draft.company)
    setJobTitle(draft.jobTitle)
    setJobDescription(draft.jobDescription)
    setTone(draft.tone)
    setFontId(draft.fontId ?? DEFAULT_FONT_ID)
    setOutputAccent(draft.outputAccent ?? DEFAULT_OUTPUT_ACCENT)
    setCoverLetter(draft.coverLetter)
    setShowRestoreBanner(false)
  }

  const handleDiscardDraft = () => {
    clearDraft()
    setShowRestoreBanner(false)
  }

  const t = T[lang]
  const wordCount = coverLetter.trim() ? coverLetter.trim().split(/\s+/).length : 0
  const fontFamily = (FONTS.find((f) => f.id === fontId) ?? FONTS[0]).family

  // ── File handlers ──────────────────────────────────────────────────────────

  const validateAndSetFile = (f: File) => {
    setError("")
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]
    if (!allowed.includes(f.type)) {
      setError(t.fileError)
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError(t.sizeError)
      return
    }
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSetFile(dropped)
  }

  // ── Generate ───────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setError("")

    if (mode === "upload" && !file) {
      setError(t.resumeRequired)
      return
    }
    if (mode === "paste" && !pasteText.trim()) {
      setError(t.resumeRequired)
      return
    }

    setLoading(true)
    setCoverLetter("")

    try {
      let res: Response

      if (mode === "upload" && file) {
        const form = new FormData()
        form.append("file", file)
        form.append("company", company)
        form.append("jobTitle", jobTitle)
        form.append("jobDescription", jobDescription)
        form.append("tone", tone)
        form.append("language", lang)
        res = await fetch("/api/cover-letter", { method: "POST", body: form })
      } else {
        res = await fetch("/api/cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: pasteText,
            company,
            jobTitle,
            jobDescription,
            tone,
            language: lang,
          }),
        })
      }

      const json = (await res.json()) as { coverLetter?: string; error?: string }

      if (!res.ok || json.error) {
        setError(json.error ?? "Something went wrong")
        return
      }

      setCoverLetter(json.coverLetter ?? "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setLoading(false)
    }
  }

  // ── Copy / download ────────────────────────────────────────────────────────

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const slug = (company || "company").toLowerCase().replace(/\s+/g, "-")
    const role = (jobTitle || "role").toLowerCase().replace(/\s+/g, "-")
    a.download = `cover-letter-${slug}-${role}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* ── Page header ── */}
      <div className="border-b px-6 py-10" style={{ borderColor: BORDER, background: "linear-gradient(180deg, #FDF0F0 0%, #FAF7F4 100%)" }}>
        <div className="mx-auto max-w-5xl text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-md"
            style={{ background: "linear-gradient(135deg, #E8856A, #C5527A)" }}
          >
            <FileText className="h-7 w-7 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight" style={{ color: "#2D1B15" }}>
            {t.title}
          </h1>
          <p className="mx-auto max-w-xl text-sm" style={{ color: "#A07B6E" }}>
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* ── Language toggle ── */}
      <div className="flex justify-center py-4">
        <div
          className="flex gap-1 rounded-xl border p-1"
          style={{ borderColor: BORDER, backgroundColor: "white" }}
        >
          {(["en", "id"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="rounded-lg px-5 py-1.5 text-sm font-medium transition-all"
              style={
                lang === l
                  ? { backgroundColor: ACCENT, color: "white" }
                  : { color: "#A07B6E" }
              }
            >
              {l === "en" ? "🇬🇧 EN" : "🇮🇩 ID"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Restore draft banner ── */}
      {showRestoreBanner && (
        <div className="border-b px-4 py-3" style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}>
          <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm" style={{ color: "#92400E" }}>
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>{t.draftBanner}</p>
                {/* Remind user that file uploads aren't persisted */}
                <p className="mt-0.5 opacity-70">{t.draftFileNote}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={handleRestoreDraft}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#D97706" }}
              >
                {t.draftRestore}
              </button>
              <button
                onClick={handleDiscardDraft}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-amber-100"
                style={{ color: "#92400E" }}
              >
                {t.draftDiscard}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_480px]">
          {/* ── Left: Form ── */}
          <div className="space-y-5">

            {/* Resume input */}
            <SectionCard>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                {t.resumeLabel}
              </p>

              {/* Mode tabs */}
              <div
                className="mb-4 flex gap-1 rounded-xl border p-1"
                style={{ borderColor: BORDER, backgroundColor: BG }}
              >
                {(["upload", "paste"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
                    style={
                      mode === m
                        ? { backgroundColor: "white", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                        : { color: "#A07B6E" }
                    }
                  >
                    {m === "upload" ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Upload className="h-3.5 w-3.5" /> {t.resumeTab}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> {t.pasteTab}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {mode === "upload" ? (
                /* Drop zone */
                <div
                  className="relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors"
                  style={{
                    borderColor: isDragging ? ACCENT : "#E5E7EB",
                    backgroundColor: isDragging ? ACCENT_LIGHT : "#F9FAFB",
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: ACCENT_LIGHT }}
                      >
                        <FileText className="h-5 w-5" style={{ color: ACCENT }} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        className="ml-2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        onClick={(e) => { e.stopPropagation(); setFile(null) }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: ACCENT_LIGHT }}
                      >
                        <Upload className="h-6 w-6" style={{ color: ACCENT }} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">{t.dropLabel}</p>
                      <p className="mt-1 text-xs text-gray-400">{t.dropSub}</p>
                    </>
                  )}
                </div>
              ) : (
                /* Paste text */
                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={t.pastePlaceholder}
                  className={inputCls + " resize-y"}
                  style={{ ...inputStyle, focusBorderColor: ACCENT } as React.CSSProperties}
                />
              )}
            </SectionCard>

            {/* Job details */}
            <SectionCard>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                Job Details
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>{t.companyLabel}</Label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={t.companyPlaceholder}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <Label>{t.roleLabel}</Label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder={t.rolePlaceholder}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label>{t.jdLabel}</Label>
                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder={t.jdPlaceholder}
                  className={inputCls + " resize-y"}
                  style={inputStyle}
                />
              </div>
            </SectionCard>

            {/* Tone */}
            <SectionCard>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                {t.toneLabel}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TONES.map((tn) => (
                  <button
                    key={tn}
                    onClick={() => setTone(tn)}
                    className="rounded-xl border-2 p-3 text-left transition-all"
                    style={
                      tone === tn
                        ? { borderColor: ACCENT, backgroundColor: ACCENT_LIGHT }
                        : { borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }
                    }
                  >
                    <p
                      className="text-xs font-semibold capitalize"
                      style={{ color: tone === tn ? ACCENT : "#374151" }}
                    >
                      {t.tones[tn]}
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: tone === tn ? "#D4697A" : "#9CA3AF" }}>
                      {TONE_DESC[tn][lang]}
                    </p>
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Style: Font + Accent Color */}
            <SectionCard>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                Style
              </p>
              <div className="space-y-4">
                <FontRow value={fontId} onChange={setFontId} />
                <AccentRow value={outputAccent} onChange={setOutputAccent} />
              </div>
            </SectionCard>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl border p-3.5"
                style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" }}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-xs text-red-700">{t.errorPrefix}{error}</p>
              </div>
            )}

            {/* Draft saved chip */}
            {savedAt && (
              <div className="flex items-center justify-between rounded-xl border px-3.5 py-2.5"
                style={{ borderColor: "#D1FAE5", backgroundColor: "#F0FDF4" }}>
                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "#059669" }}>
                  <Save className="h-3.5 w-3.5" />
                  {t.draftSaved} {timeAgo(savedAt)}
                </div>
                <button
                  onClick={handleDiscardDraft}
                  title="Clear draft"
                  className="rounded p-1 opacity-50 transition-opacity hover:opacity-100"
                  style={{ color: "#059669" }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.generating}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t.generate}
                </>
              )}
            </button>
          </div>

          {/* ── Right: Output ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div
              className="overflow-hidden rounded-2xl border bg-white"
              style={{ borderColor: BORDER, borderTop: `3px solid ${outputAccent}` }}
            >
              {/* Output header */}
              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{ borderColor: BORDER, background: `linear-gradient(135deg, ${outputAccent}18 0%, #FAF7F4 100%)` }}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" style={{ color: outputAccent }} />
                  <p className="text-sm font-semibold" style={{ color: "#2D1B15" }}>{t.outputTitle}</p>
                </div>
                {coverLetter && (
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${outputAccent}18`, color: outputAccent }}>
                    {wordCount} {t.words}
                  </span>
                )}
              </div>

              {/* Output body */}
              <div className="min-h-[360px] p-5">
                {loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" style={{ color: outputAccent }} />
                      <p className="mt-3 text-sm text-gray-400">{t.generating}</p>
                    </div>
                  </div>
                ) : coverLetter ? (
                  <div
                    className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800"
                    style={{ fontFamily, lineHeight: "1.75" }}
                  >
                    {coverLetter}
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div
                        className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: "#F3F4F6" }}
                      >
                        <FileText className="h-7 w-7 text-gray-300" />
                      </div>
                      <p className="max-w-[200px] text-center text-sm text-gray-400">{t.outputPlaceholder}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {coverLetter && (
                <div
                  className="flex gap-2 border-t p-4"
                  style={{ borderColor: BORDER }}
                >
                  <button
                    onClick={handleCopy}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all hover:opacity-80"
                    style={
                      copied
                        ? { borderColor: "#10B981", color: "#10B981", backgroundColor: "#F0FDF4" }
                        : { borderColor: BORDER, color: "#8B5E52", backgroundColor: "white" }
                    }
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                    {copied ? t.copied : t.copy}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: outputAccent }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t.download}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
