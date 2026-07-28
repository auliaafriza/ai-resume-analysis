"use client"

import { useEffect, useRef, useState } from "react"

import {
  AlertCircle,
  Check,
  ClipboardCopy,
  Clock,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  Upload,
  X,
} from "lucide-react"

import { CoverLetterPreview, type CoverLetterTemplateId } from "@/features/cover-letter/components/CoverLetterPreview"
import { timeAgo, useLocalDraft } from "@/lib/useLocalDraft"
import { cn } from "@/lib/utils/cn"

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
    yourName: "Your Name",
    yourNamePlaceholder: "e.g. John Doe",
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
    download: "Download PDF",
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
    yourName: "Nama Anda",
    yourNamePlaceholder: "contoh: John Doe",
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
    download: "Download PDF",
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
  { id: "georgia", label: "Georgia", family: "Georgia, serif", category: "serif" },
  { id: "merriweather", label: "Merriweather", family: "'Merriweather', serif", category: "serif" },
  { id: "playfair", label: "Playfair", family: "'Playfair Display', serif", category: "serif" },
  { id: "inter", label: "Inter", family: "'Inter', sans-serif", category: "sans" },
  { id: "lato", label: "Lato", family: "'Lato', sans-serif", category: "sans" },
  { id: "raleway", label: "Raleway", family: "'Raleway', sans-serif", category: "sans" },
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
  { label: "Navy", value: "#1E3A5F" },
  { label: "Charcoal", value: "#333333" },
  { label: "Rose", value: "#C5527A" },
  { label: "Forest", value: "#166534" },
  { label: "Teal", value: "#0F766E" },
  { label: "Slate", value: "#475569" },
  { label: "Gold", value: "#8B6914" },
  { label: "Burgundy", value: "#7F1D1D" },
]

const DEFAULT_OUTPUT_ACCENT = "#1E3A5F"

// ── Template constants ────────────────────────────────────────────────────────

const COVER_TEMPLATES: { id: CoverLetterTemplateId; label: string; desc: string }[] = [
  { id: "simple", label: "Simple", desc: "Content-first · versatile" },
  { id: "modern", label: "Modern", desc: "Sidebar · clean lines" },
  { id: "creative", label: "Creative", desc: "Bold header · decorative" },
  { id: "professional", label: "Professional", desc: "Formal · structured" },
]

const DEFAULT_TEMPLATE: CoverLetterTemplateId = "simple"

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
    <div className="rounded-2xl border bg-white p-6" style={{ borderColor: BORDER }}>
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
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#8B5E52" }}>
        Font
      </p>
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
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#8B5E52" }}>
        Accent Color
      </p>
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

  const [dataCoverLetter, setDataCoverLetter] = useState({
    yourName: "",
    company: "",
    jobTitle: "",
    jobDescription: "",
  })

  // Options
  const [tone, setTone] = useState<Tone>("professional")

  // Style options
  const [fontId, setFontId] = useState(DEFAULT_FONT_ID)
  const [outputAccent, setOutputAccent] = useState(DEFAULT_OUTPUT_ACCENT)
  const [templateId, setTemplateId] = useState<CoverLetterTemplateId>(DEFAULT_TEMPLATE)

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
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [draftMeta, setDraftMeta] = useState<{
    company: string
    jobTitle: string
    snippet: string
    lang: Lang
  } | null>(null)

  const { savedAt, scheduleSave, clearDraft } = useLocalDraft<{
    lang: Lang
    mode: InputMode
    pasteText: string
    yourName: string
    company: string
    jobTitle: string
    jobDescription: string
    tone: Tone
    fontId: string
    outputAccent: string
    templateId: CoverLetterTemplateId
    coverLetter: string
  }>("ai-resume-builder:cover-letter-draft")

  // On mount: peek at localStorage directly (avoids hasDraft timing issues)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ai-resume-builder:cover-letter-draft")
      if (raw) {
        const parsed = JSON.parse(raw) as {
          company?: string
          jobTitle?: string
          coverLetter?: string
          lang?: Lang
        }
        setDraftMeta({
          company: parsed.company ?? "",
          jobTitle: parsed.jobTitle ?? "",
          snippet: parsed.coverLetter?.slice(0, 160) ?? "",
          lang: parsed.lang ?? "en",
        })
        if (parsed.company || parsed.jobTitle || parsed.coverLetter) {
          setShowDraftModal(true)
        }
      }
    } catch {
      // localStorage unavailable / malformed
    }
  }, [])

  // Auto-save on every relevant state change (file excluded — not serialisable)
  useEffect(() => {
    scheduleSave({
      lang,
      mode,
      pasteText,
      yourName: dataCoverLetter.yourName,
      company: dataCoverLetter.company,
      jobTitle: dataCoverLetter.jobTitle,
      jobDescription: dataCoverLetter.jobDescription,
      tone,
      fontId,
      outputAccent,
      templateId,
      coverLetter,
    })
  }, [lang, mode, pasteText, dataCoverLetter, tone, fontId, outputAccent, templateId, coverLetter, scheduleSave])

  const handleRestoreDraft = () => {
    // Read directly from localStorage so we always get the freshest copy,
    // regardless of when the hook's loadDraft closure was created.
    let draft: Record<string, unknown> | null = null
    try {
      const raw = localStorage.getItem("ai-resume-builder:cover-letter-draft")
      if (raw) draft = JSON.parse(raw) as Record<string, unknown>
    } catch {
      /* ignore */
    }
    if (!draft) return

    // Apply fallbacks for every field — handles old draft formats where some
    // fields didn't exist yet (which causes silent undefined → crash bugs).
    setLang((draft.lang as Lang) ?? "en")
    setMode((draft.mode as InputMode) ?? "upload")
    setPasteText((draft.pasteText as string) ?? "")
    setDataCoverLetter({
      yourName: (draft.yourName as string) ?? "",
      company: (draft.company as string) ?? "",
      jobTitle: (draft.jobTitle as string) ?? "",
      jobDescription: (draft.jobDescription as string) ?? "",
    })
    setTone((draft.tone as Tone) ?? "professional")
    setFontId((draft.fontId as string) ?? DEFAULT_FONT_ID)
    setOutputAccent((draft.outputAccent as string) ?? DEFAULT_OUTPUT_ACCENT)
    setTemplateId((draft.templateId as CoverLetterTemplateId) ?? DEFAULT_TEMPLATE)
    setCoverLetter((draft.coverLetter as string) ?? "")
    setShowDraftModal(false)
    setDraftMeta(null)
  }

  const handleDiscardDraft = () => {
    clearDraft()
    setShowDraftModal(false)
    setDraftMeta(null)
  }

  const t = T[lang]
  const wordCount = coverLetter.trim() ? coverLetter.trim().split(/\s+/).length : 0
  const fontFamily = (FONTS.find((f) => f.id === fontId) ?? FONTS[0]).family

  // ── File handlers ──────────────────────────────────────────────────────────

  const validateAndSetFile = (f: File) => {
    setError("")
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ]
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
        form.append("yourName", dataCoverLetter.yourName)
        form.append("company", dataCoverLetter.company)
        form.append("jobTitle", dataCoverLetter.jobTitle)
        form.append("jobDescription", dataCoverLetter.jobDescription)
        form.append("tone", tone)
        form.append("language", lang)
        res = await fetch("/api/cover-letter", { method: "POST", body: form })
      } else {
        res = await fetch("/api/cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: pasteText,
            yourName: dataCoverLetter.yourName,
            company: dataCoverLetter.company,
            jobTitle: dataCoverLetter.jobTitle,
            jobDescription: dataCoverLetter.jobDescription,
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

  const handleDownload = async () => {
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })

    const margin  = 22
    const pageW   = 210
    const pageH   = 297
    const contentW = pageW - margin * 2

    // ── Accent color → RGB ───────────────────────────────────────
    const hex = outputAccent.replace("#", "")
    const cr = parseInt(hex.slice(0, 2), 16)
    const cg = parseInt(hex.slice(2, 4), 16)
    const cb = parseInt(hex.slice(4, 6), 16)
    // Light variant (accent mixed 70% toward white) for secondary elements
    const lr = Math.round(cr + (255 - cr) * 0.7)
    const lg = Math.round(cg + (255 - cg) * 0.7)
    const lb = Math.round(cb + (255 - cb) * 0.7)

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    })
    const { yourName, company, jobTitle } = dataCoverLetter
    const paragraphs = coverLetter.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)

    // ── Helper: render body paragraphs ───────────────────────────
    const addBody = (startY: number, x: number, maxW: number) => {
      let y = startY
      doc.setTextColor(65, 65, 65)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9.5)
      for (const para of paragraphs) {
        const lines = doc.splitTextToSize(para, maxW)
        if (y + lines.length * 5.3 > 282) {
          doc.addPage()
          y = 20
        }
        doc.text(lines, x, y)
        y += lines.length * 5.3 + 4.5
      }
    }

    // ────────────────────────────────────────────────────────────
    // SIMPLE — stripe + meta row + separator + body
    // ────────────────────────────────────────────────────────────
    if (templateId === "simple") {
      // Accent stripe
      doc.setFillColor(cr, cg, cb)
      doc.rect(0, 0, pageW, 1.8, "F")

      // Left meta block
      let metaY = 18
      if (yourName) {
        doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(150, 150, 150)
        doc.text(yourName, margin, metaY);  metaY += 5
      }
      if (company) {
        doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(25, 25, 25)
        doc.text(company, margin, metaY);   metaY += 5.5
      }
      if (jobTitle) {
        doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(150, 150, 150)
        doc.text(jobTitle, margin, metaY)
      }
      // Date right-aligned
      doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(150, 150, 150)
      doc.text(dateStr, pageW - margin, 18, { align: "right" })

      // Thin separator
      const sepY = Math.max(metaY + 6, 36)
      doc.setDrawColor(215, 215, 215).setLineWidth(0.3)
      doc.line(margin, sepY, pageW - margin, sepY)

      addBody(sepY + 8, margin, contentW)

    // ────────────────────────────────────────────────────────────
    // MODERN — colored sidebar + body with accent dots
    // ────────────────────────────────────────────────────────────
    } else if (templateId === "modern") {
      const sideW  = Math.round(pageW * 0.3)  // ≈ 63 mm
      const bodyX  = sideW + 9
      const bodyW  = pageW - sideW - 9 - 10

      // Sidebar background (full page)
      doc.setFillColor(cr, cg, cb)
      doc.rect(0, 0, sideW, pageH, "F")

      // Decorative circles (semi-transparent white)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc.setGState(new (doc as any).GState({ "fill-opacity": 0.12 }))
        doc.setFillColor(255, 255, 255)
        doc.circle(sideW - 6, 6, 11, "F")
        doc.circle(-3, pageH - 15, 14, "F")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc.setGState(new (doc as any).GState({ "fill-opacity": 1 }))
      } catch { /* fallback — older jsPDF without GState */ }

      // Sidebar text
      let sY = 22
      if (yourName) {
        doc.setFont("helvetica", "bold").setFontSize(7).setTextColor(255, 255, 255)
        doc.text(yourName.toUpperCase(), 6, sY, { maxWidth: sideW - 10 });  sY += 7
      }
      // Short white divider
      doc.setDrawColor(255, 255, 255).setLineWidth(0.7)
      doc.line(6, sY, 20, sY);  sY += 5
      if (jobTitle) {
        doc.setFont("helvetica", "normal").setFontSize(6.5).setTextColor(220, 220, 220)
        const jtLines = doc.splitTextToSize(jobTitle.toUpperCase(), sideW - 12)
        doc.text(jtLines, 6, sY);  sY += jtLines.length * 4.5 + 3
      }
      if (company) {
        doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(255, 255, 255)
        const coLines = doc.splitTextToSize(company, sideW - 12)
        doc.text(coLines, 6, sY)
      }
      // Date at sidebar bottom
      doc.setFont("helvetica", "normal").setFontSize(6.5).setTextColor(185, 185, 185)
      doc.text(dateStr, 6, pageH - 14, { maxWidth: sideW - 10 })

      // Body — two accent dots at top
      doc.setFillColor(cr, cg, cb)
      doc.circle(bodyX, 20, 2, "F")
      doc.setFillColor(lr, lg, lb)
      doc.circle(bodyX + 6.5, 20, 1.3, "F")

      addBody(28, bodyX, bodyW)

    // ────────────────────────────────────────────────────────────
    // CREATIVE — bold full-width header + gradient line + body
    // ────────────────────────────────────────────────────────────
    } else if (templateId === "creative") {
      const headerH = 38

      // Header background
      doc.setFillColor(cr, cg, cb)
      doc.rect(0, 0, pageW, headerH, "F")

      // Decorative circles
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc.setGState(new (doc as any).GState({ "fill-opacity": 0.10 }))
        doc.setFillColor(255, 255, 255)
        doc.circle(pageW - 8, -8, 16, "F")
        doc.circle(pageW - 26, headerH + 4, 8, "F")
        doc.circle(pageW - 10, headerH - 3, 4, "F")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc.setGState(new (doc as any).GState({ "fill-opacity": 1 }))
      } catch { /* fallback */ }

      // Header text
      let hY = 14
      if (yourName) {
        doc.setFont("helvetica", "bold").setFontSize(7.5).setTextColor(255, 255, 255)
        doc.text(yourName.toUpperCase(), margin, hY);  hY += 5.5
      }
      if (jobTitle) {
        doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(210, 210, 210)
        doc.text(jobTitle.toUpperCase(), margin, hY);  hY += 5
      }
      if (company) {
        doc.setFont("helvetica", "bold").setFontSize(17).setTextColor(255, 255, 255)
        const coLines = doc.splitTextToSize(company, pageW - margin * 2 - 20)
        doc.text(coLines, margin, hY)
      }

      // Gradient accent underline (approximated with partial fill)
      doc.setFillColor(cr, cg, cb)
      doc.rect(0, headerH, pageW * 0.55, 1.8, "F")
      doc.setFillColor(lr, lg, lb)
      doc.rect(pageW * 0.55, headerH, pageW * 0.25, 1.8, "F")

      // Date
      let bodyY = headerH + 12
      doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(140, 140, 140)
      doc.text(dateStr, margin, bodyY);  bodyY += 7

      addBody(bodyY, margin, contentW)

    // ────────────────────────────────────────────────────────────
    // PROFESSIONAL — formal header + double rule + Re: line
    // ────────────────────────────────────────────────────────────
    } else {
      let hY = 20
      if (yourName) {
        doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(15, 15, 15)
        doc.text(yourName, margin, hY);  hY += 6
      }
      if (company) {
        doc.setFont("helvetica", "bold").setFontSize(yourName ? 11 : 13).setTextColor(15, 15, 15)
        doc.text(company, margin, hY);   hY += 5
      }
      if (jobTitle) {
        doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(120, 120, 120)
        doc.text(jobTitle, margin, hY)
      }
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(120, 120, 120)
      doc.text(dateStr, pageW - margin, 20, { align: "right" })

      // Double rule: thick accent + thin light-accent
      const ruleY = Math.max(hY + 7, 34)
      doc.setFillColor(cr, cg, cb)
      doc.rect(margin, ruleY, contentW, 0.8, "F")
      doc.setFillColor(lr, lg, lb)
      doc.rect(margin, ruleY + 1.3, contentW, 0.4, "F")

      // "Re:" line
      let bodyY = ruleY + 8
      if (jobTitle || company) {
        doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(cr, cg, cb)
        const reLabel = "Re: "
        doc.text(reLabel, margin, bodyY)
        const labelW = doc.getTextWidth(reLabel)
        const reText = `Application for ${jobTitle ?? ""}${company ? ` at ${company}` : ""}`
        doc.setFont("helvetica", "normal").setTextColor(60, 60, 60)
        doc.text(reText, margin + labelW, bodyY, { maxWidth: contentW - labelW })
        bodyY += 9
      }

      addBody(bodyY, margin, contentW)
    }

    // ── Save ──────────────────────────────────────────────────────
    const nameSlug = (yourName || "cover-letter").toLowerCase().replace(/\s+/g, "-")
    const coSlug   = (company   || "company")     .toLowerCase().replace(/\s+/g, "-")
    const roleSlug = (jobTitle  || "role")         .toLowerCase().replace(/\s+/g, "-")
    doc.save(`cover-letter-${nameSlug}-${coSlug}-${roleSlug}.pdf`)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* ── Page header ── */}
      <div
        className="border-b px-6 py-10"
        style={{ borderColor: BORDER, background: "linear-gradient(180deg, #FDF0F0 0%, #FAF7F4 100%)" }}
      >
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
        <div className="flex gap-1 rounded-xl border p-1" style={{ borderColor: BORDER, backgroundColor: "white" }}>
          {(["en", "id"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="rounded-lg px-5 py-1.5 text-sm font-medium transition-all"
              style={lang === l ? { backgroundColor: ACCENT, color: "white" } : { color: "#A07B6E" }}
            >
              {l === "en" ? "🇬🇧 EN" : "🇮🇩 ID"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Draft restore modal ── */}
      {showDraftModal && draftMeta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div
              className="flex items-center gap-3 border-b px-5 py-4"
              style={{ borderColor: "#FDE68A", backgroundColor: "#FFFBEB" }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#FEF3C7" }}
              >
                <RotateCcw className="h-5 w-5" style={{ color: "#D97706" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#92400E" }}>
                  {draftMeta.lang === "id" ? "Draft Tersimpan" : "Saved Draft Found"}
                </p>
                <div className="mt-0.5 flex items-center gap-1" style={{ color: "#B45309" }}>
                  <Clock className="h-3 w-3" />
                  <p className="text-[11px]">
                    {draftMeta.lang === "id" ? "Lanjutkan dari mana kamu berhenti?" : "Continue where you left off?"}
                  </p>
                </div>
              </div>
            </div>

            {/* Draft preview */}
            <div className="px-5 py-4">
              {(draftMeta.company || draftMeta.jobTitle) && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {draftMeta.company && (
                    <span
                      className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                      style={{ backgroundColor: "#F3F4F6", color: "#374151" }}
                    >
                      {draftMeta.company}
                    </span>
                  )}
                  {draftMeta.jobTitle && (
                    <span
                      className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                      style={{ backgroundColor: "#FDF0F0", color: ACCENT }}
                    >
                      {draftMeta.jobTitle}
                    </span>
                  )}
                </div>
              )}
              {draftMeta.snippet ? (
                <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                  {draftMeta.snippet}
                  {draftMeta.snippet.length >= 160 ? "…" : ""}
                </p>
              ) : (
                <p className="text-xs italic" style={{ color: "#9CA3AF" }}>
                  {draftMeta.lang === "id"
                    ? "Form tersimpan, belum ada cover letter."
                    : "Form data saved, no cover letter yet."}
                </p>
              )}
              <p className="mt-3 text-[11px]" style={{ color: "#9CA3AF" }}>
                {draftMeta.lang === "id"
                  ? "⚠️ File upload tidak tersimpan — upload ulang CV kamu."
                  : "⚠️ File attachments aren't saved — please re-upload your resume."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t px-5 py-4" style={{ borderColor: "#F3F4F6" }}>
              <button
                onClick={handleRestoreDraft}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {draftMeta.lang === "id" ? "Pulihkan Draft" : "Restore Draft"}
              </button>
              <button
                onClick={handleDiscardDraft}
                className="flex flex-1 items-center justify-center rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: "#E5E7EB", color: "#6B7280" }}
              >
                {draftMeta.lang === "id" ? "Mulai Baru" : "Start Fresh"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Template picker ── */}
      <div className="border-b px-6 py-5" style={{ borderColor: BORDER, backgroundColor: "white" }}>
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
            Template
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {COVER_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setTemplateId(tpl.id)}
                className={cn(
                  "rounded-xl border-2 p-3 text-left transition-all",
                  templateId === tpl.id
                    ? "border-rose-400 bg-rose-50 shadow-sm"
                    : "border-transparent bg-gray-50 hover:border-rose-200",
                )}
              >
                {/* Mini template thumbnail */}
                <div className="mb-2 h-10 w-full overflow-hidden rounded-md border border-gray-100 bg-white">
                  {/* Simple: full-width accent stripe → meta row → lines */}
                  {tpl.id === "simple" && (
                    <div className="h-full p-1.5">
                      <div className="mb-1 h-0.5 w-full rounded" style={{ backgroundColor: outputAccent }} />
                      <div className="mb-1 flex justify-between">
                        <div className="h-1 w-8 rounded bg-gray-300" />
                        <div className="h-1 w-5 rounded bg-gray-200" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="h-0.5 w-full rounded bg-gray-200" />
                        <div className="h-0.5 w-5/6 rounded bg-gray-200" />
                        <div className="h-0.5 w-full rounded bg-gray-200" />
                      </div>
                    </div>
                  )}
                  {/* Modern: colored sidebar + body */}
                  {tpl.id === "modern" && (
                    <div className="flex h-full">
                      <div className="relative w-[30%] overflow-hidden p-1.5" style={{ backgroundColor: outputAccent }}>
                        <div className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-white/10" />
                        <div className="mt-1 h-1 w-5 rounded bg-white/70" />
                        <div className="mt-0.5 h-0.5 w-4 rounded bg-white/40" />
                      </div>
                      <div className="flex-1 space-y-0.5 p-1.5">
                        <div className="h-0.5 w-full rounded bg-gray-200" />
                        <div className="h-0.5 w-4/5 rounded bg-gray-200" />
                        <div className="h-0.5 w-full rounded bg-gray-200" />
                        <div className="h-0.5 w-3/4 rounded bg-gray-200" />
                      </div>
                    </div>
                  )}
                  {/* Creative: bold full-width accent header + body */}
                  {tpl.id === "creative" && (
                    <div className="h-full">
                      <div className="relative overflow-hidden px-2 py-1.5" style={{ backgroundColor: outputAccent }}>
                        <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/10" />
                        <div className="h-1.5 w-10 rounded bg-white/80" />
                        <div className="mt-0.5 h-0.5 w-6 rounded bg-white/40" />
                      </div>
                      <div className="space-y-0.5 p-1.5">
                        <div className="h-0.5 w-full rounded bg-gray-200" />
                        <div className="h-0.5 w-5/6 rounded bg-gray-200" />
                        <div className="h-0.5 w-full rounded bg-gray-200" />
                      </div>
                    </div>
                  )}
                  {/* Professional: structured header + double rule + body */}
                  {tpl.id === "professional" && (
                    <div className="h-full p-1.5">
                      <div className="mb-0.5 flex justify-between">
                        <div className="h-1 w-8 rounded bg-gray-400" />
                        <div className="h-0.5 w-5 rounded bg-gray-300" />
                      </div>
                      <div className="mb-0.5 h-0.5 w-full rounded" style={{ backgroundColor: outputAccent }} />
                      <div className="mb-1 h-px w-full rounded" style={{ backgroundColor: `${outputAccent}44` }} />
                      <div className="space-y-0.5">
                        <div className="h-0.5 w-full rounded bg-gray-200" />
                        <div className="h-0.5 w-5/6 rounded bg-gray-200" />
                        <div className="h-0.5 w-full rounded bg-gray-200" />
                      </div>
                    </div>
                  )}
                </div>
                <p className={cn("text-xs font-semibold", templateId === tpl.id ? "text-rose-600" : "text-gray-700")}>
                  {tpl.label}
                </p>
                <p className="mt-0.5 hidden text-[10px] text-gray-400 sm:block">{tpl.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

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
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
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
                        <p className="text-sm font-semibold text-gray-800">{file?.name ?? ""}</p>
                        <p className="text-xs text-gray-400">{file?.size ? (file.size / 1024).toFixed(0) : 0} KB</p>
                      </div>
                      <button
                        className="ml-2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                        }}
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

            {/* Personal Information & Job details */}
            <SectionCard>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                Job Details
              </p>
              <div className="grid grid-cols-1 gap-3 pb-1">
                <div>
                  <Label>{t.yourName}</Label>
                  <input
                    type="text"
                    value={dataCoverLetter.yourName}
                    onChange={(e) => setDataCoverLetter({ ...dataCoverLetter, yourName: e.target.value })}
                    placeholder={t.yourNamePlaceholder}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>{t.companyLabel}</Label>
                  <input
                    type="text"
                    value={dataCoverLetter.company}
                    onChange={(e) => setDataCoverLetter({ ...dataCoverLetter, company: e.target.value })}
                    placeholder={t.companyPlaceholder}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <Label>{t.roleLabel}</Label>
                  <input
                    type="text"
                    value={dataCoverLetter.jobTitle}
                    onChange={(e) => setDataCoverLetter({ ...dataCoverLetter, jobTitle: e.target.value })}
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
                  value={dataCoverLetter.jobDescription}
                  onChange={(e) => setDataCoverLetter({ ...dataCoverLetter, jobDescription: e.target.value })}
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
                    <p className="text-xs font-semibold capitalize" style={{ color: tone === tn ? ACCENT : "#374151" }}>
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
                <p className="text-xs text-red-700">
                  {t.errorPrefix}
                  {error}
                </p>
              </div>
            )}

            {/* Draft saved chip */}
            {savedAt && (
              <div
                className="flex items-center justify-between rounded-xl border px-3.5 py-2.5"
                style={{ borderColor: "#D1FAE5", backgroundColor: "#F0FDF4" }}
              >
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
                style={{
                  borderColor: BORDER,
                  background: `linear-gradient(135deg, ${outputAccent}18 0%, #FAF7F4 100%)`,
                }}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" style={{ color: outputAccent }} />
                  <p className="text-sm font-semibold" style={{ color: "#2D1B15" }}>
                    {t.outputTitle}
                  </p>
                </div>
                {coverLetter && (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: `${outputAccent}18`, color: outputAccent }}
                  >
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
                  <CoverLetterPreview
                    template={templateId}
                    text={coverLetter}
                    fontFamily={fontFamily}
                    accentColor={outputAccent}
                    company={dataCoverLetter.company}
                    jobTitle={dataCoverLetter.jobTitle}
                    yourName={dataCoverLetter.yourName}
                  />
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
                <div className="flex gap-2 border-t p-4" style={{ borderColor: BORDER }}>
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
