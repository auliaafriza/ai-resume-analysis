"use client"

import { useState } from "react"

import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  ChevronDown,
  FileSearch,
  Lightbulb,
  Loader2,
  Sparkles,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { ResumeUpload } from "@/features/resume-review/components/ResumeUpload"
import { ReviewResult } from "@/features/resume-review/components/ReviewResult"
import { useMutationReview } from "@/features/resume-review/services/review/post"
import type { ReviewResponse } from "@/features/resume-review/types"
import { cn } from "@/lib/utils/cn"

// ── i18n ─────────────────────────────────────────────────────────────────────

type Lang = "en" | "id"

const T = {
  en: {
    badge: "Powered by AI Builder Pluvia AI",
    hero: { h1a: "Get AI feedback on", h1b: "your resume", h1c: "in seconds", sub: "Upload your CV and receive an instant, detailed analysis — ATS score, strengths, weaknesses, and actionable improvements.", cta: "Analyze my resume", howItWorks: "How it works" },
    proof: ["No sign-up required", "Free to use", "Results in <10 seconds", "Privacy-first"],
    featuresLabel: "Why ResumeAI",
    featuresTitle: "Everything you need to land the interview",
    features: [
      { title: "Instant Analysis", desc: "Get comprehensive feedback on your resume in seconds, not hours." },
      { title: "ATS Scoring", desc: "Know exactly how your resume performs against applicant tracking systems." },
      { title: "Actionable Tips", desc: "Receive specific, prioritised suggestions to make your resume stand out." },
    ],
    stepsLabel: "Simple process",
    stepsTitle: "Three steps to a stronger resume",
    steps: [
      { title: "Upload your resume", desc: "Drop your PDF or Word file — we keep it private and never store it." },
      { title: "AI analyses it", desc: "Our AI reads every line, scoring clarity, relevance, impact, and ATS fit." },
      { title: "Get your report", desc: "Receive a detailed scorecard and a prioritised list of improvements." },
    ],
    uploadLabel: "Get started",
    uploadTitle: "Analyze your resume now",
    uploadSub: "No account needed. Results appear instantly on this page.",
    role: "Target role",
    roleOptional: "(optional)",
    rolePlaceholder: "e.g. Senior Product Designer",
    jd: "Job description",
    jdOptional: "(optional — improves relevance score)",
    jdPlaceholder: "Paste the job description here…",
    analyze: "Analyze resume",
    analyzing: "Analysing your resume…",
    resultEmpty: "Your analysis will appear here",
    resultEmptySub: "Upload your resume on the left to get started",
    faqLabel: "Got questions?",
    faqTitle: "Frequently asked questions",
    faqs: [
      { q: "Is my resume stored anywhere?", a: "No. Your document is processed in memory and immediately discarded after analysis. We never save or share your data." },
      { q: "Which file formats are supported?", a: "We accept PDF, DOC, and DOCX files up to 5 MB." },
      { q: "What AI model powers the analysis?", a: "ResumeAI uses Groq — one of the most capable large language models available today." },
      { q: "Can I add a job description for a more targeted review?", a: "Yes! Pasting the job description lets the AI score relevance and surface missing keywords specific to that role." },
    ],
    ctaTitle: "Ready for a better resume?",
    ctaSub: "Get instant AI feedback and start landing more interviews today.",
    ctaBtn: "Analyze my resume for free",
    toastSuccess: "Analysis complete!",
    fileError: "Please upload your resume before submitting.",
    langToggle: "ID",
  },
  id: {
    badge: "Didukung oleh AI Builder Pluvia AI",
    hero: { h1a: "Dapatkan feedback AI untuk", h1b: "resume kamu", h1c: "dalam hitungan detik", sub: "Upload CV kamu dan dapatkan analisis mendalam secara instan — skor ATS, kekuatan, kelemahan, dan saran perbaikan.", cta: "Analisis resume saya", howItWorks: "Cara kerja" },
    proof: ["Tanpa daftar akun", "Gratis digunakan", "Hasil dalam <10 detik", "Privasi terjaga"],
    featuresLabel: "Kenapa ResumeAI",
    featuresTitle: "Semua yang kamu butuhkan untuk lolos interview",
    features: [
      { title: "Analisis Instan", desc: "Dapatkan feedback lengkap untuk resume kamu dalam hitungan detik." },
      { title: "Skor ATS", desc: "Ketahui seberapa baik resume kamu melewati sistem seleksi otomatis (ATS)." },
      { title: "Saran Praktis", desc: "Terima saran spesifik dan terurut agar resume kamu lebih menonjol." },
    ],
    stepsLabel: "Proses sederhana",
    stepsTitle: "Tiga langkah menuju resume yang lebih kuat",
    steps: [
      { title: "Upload resume kamu", desc: "Drag & drop file PDF atau Word — kami menjaga privasi dan tidak menyimpan data." },
      { title: "AI menganalisisnya", desc: "AI kami membaca setiap baris, menilai kejelasan, relevansi, dampak, dan kesesuaian ATS." },
      { title: "Terima laporanmu", desc: "Dapatkan scorecard lengkap beserta daftar perbaikan yang diprioritaskan." },
    ],
    uploadLabel: "Mulai sekarang",
    uploadTitle: "Analisis resume kamu sekarang",
    uploadSub: "Tanpa akun. Hasil langsung muncul di halaman ini.",
    role: "Target posisi",
    roleOptional: "(opsional)",
    rolePlaceholder: "mis. Senior Product Designer",
    jd: "Deskripsi pekerjaan",
    jdOptional: "(opsional — meningkatkan skor relevansi)",
    jdPlaceholder: "Tempel deskripsi pekerjaan di sini…",
    analyze: "Analisis resume",
    analyzing: "Sedang menganalisis resume kamu…",
    resultEmpty: "Hasil analisis akan muncul di sini",
    resultEmptySub: "Upload resume di sebelah kiri untuk memulai",
    faqLabel: "Ada pertanyaan?",
    faqTitle: "Pertanyaan yang sering ditanyakan",
    faqs: [
      { q: "Apakah resume saya disimpan?", a: "Tidak. Dokumen kamu diproses di memori dan langsung dihapus setelah analisis. Kami tidak pernah menyimpan atau membagikan data kamu." },
      { q: "Format file apa yang didukung?", a: "Kami menerima file PDF, DOC, dan DOCX hingga 5 MB." },
      { q: "Model AI apa yang digunakan?", a: "ResumeAI menggunakan Groq — salah satu model bahasa paling canggih yang tersedia saat ini." },
      { q: "Bisakah saya menambahkan deskripsi pekerjaan?", a: "Ya! Menempelkan deskripsi pekerjaan membantu AI menilai relevansi dan menemukan kata kunci yang hilang untuk posisi tersebut." },
    ],
    ctaTitle: "Siap untuk resume yang lebih baik?",
    ctaSub: "Dapatkan feedback AI instan dan mulai mendapatkan lebih banyak panggilan interview.",
    ctaBtn: "Analisis resume saya gratis",
    toastSuccess: "Analisis selesai!",
    fileError: "Silakan upload resume kamu sebelum mengirim.",
    langToggle: "EN",
  },
}

// ── FAQ accordion item ───────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        className="flex w-full items-center justify-between py-5 text-left text-sm font-medium text-foreground transition-colors hover:text-primary"
        onClick={() => setOpen((v) => !v)}
      >
        {q}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>}
    </div>
  )
}

// ── Lang toggle button ────────────────────────────────────────────────────────

function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      style={{ borderColor: "#EDE3DB" }}
      title="Toggle language"
    >
      <span className="text-base leading-none">{lang === "en" ? "🇮🇩" : "🇬🇧"}</span>
      {T[lang].langToggle}
    </button>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

const FEATURE_COLORS = ["from-amber-500 to-orange-500", "from-rose-500 to-pink-500", "from-emerald-500 to-teal-500"]
const FEATURE_ICONS = [Zap, BadgeCheck, Lightbulb]
const STEP_ICONS = [Upload, BrainCircuit, TrendingUp]

export function ResumeReviewPage() {
  const [lang, setLang] = useState<Lang>("en")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | undefined>()
  const [targetRole, setTargetRole] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<ReviewResponse | null>(null)

  const t = T[lang]
  const { mutate, isPending } = useMutationReview()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setFileError(t.fileError)
      return
    }
    setFileError(undefined)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("language", lang)
    if (targetRole) formData.append("targetRole", targetRole)
    if (jobDescription) formData.append("jobDescription", jobDescription)

    mutate(formData, {
      onSuccess: (data) => {
        if (data.data) {
          setResult(data.data)
          toast.success(t.toastSuccess)
          setTimeout(() => {
            document.getElementById("result")?.scrollIntoView({ behavior: "smooth" })
          }, 100)
        }
      },
    })
  }

  return (
    <>
      <LangToggle lang={lang} onToggle={() => setLang((l) => (l === "en" ? "id" : "en"))} />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="gradient-hero overflow-hidden pb-24 pt-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-medium text-rose-600">
            <Sparkles className="h-3.5 w-3.5" />
            {t.badge}
          </div>

          {/* Headline */}
          <h1 className="mx-auto mb-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            {t.hero.h1a} <span className="gradient-text">{t.hero.h1b}</span> {t.hero.h1c}
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">{t.hero.sub}</p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#upload"
              className="glow-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
            >
              {t.hero.cta}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-secondary"
            >
              {t.hero.howItWorks}
            </a>
          </div>

          {/* Social proof strip */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            {t.proof.map((text) => (
              <span key={text} className="flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-rose-400" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">{t.featuresLabel}</p>
            <h2 className="text-3xl font-bold text-foreground">{t.featuresTitle}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {t.features.map(({ title, desc }, i) => {
              const Icon = FEATURE_ICONS[i]
              return (
                <div key={title} className="card-glass p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className={cn("mb-4 inline-flex rounded-xl bg-gradient-to-br p-3", FEATURE_COLORS[i])}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">{t.stepsLabel}</p>
            <h2 className="text-3xl font-bold text-foreground">{t.stepsTitle}</h2>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="absolute left-1/2 top-8 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent md:block" />

            {t.steps.map(({ title, desc }, i) => {
              const Icon = STEP_ICONS[i]
              return (
                <div key={title} className="relative flex flex-col items-center text-center">
                  <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-white shadow-sm">
                    <Icon className="h-6 w-6 text-rose-500" />
                    <span
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #E8856A 0%, #C5527A 100%)" }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── UPLOAD + RESULT ──────────────────────────────────────────────── */}
      <section id="upload" className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">{t.uploadLabel}</p>
            <h2 className="text-3xl font-bold text-foreground">{t.uploadTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.uploadSub}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* ── Upload form ── */}
            <form onSubmit={handleSubmit} className="card-glass space-y-6 p-8">
              <ResumeUpload file={file} onFileChange={setFile} error={fileError} />

              {/* Target role */}
              <div className="space-y-1.5">
                <label htmlFor="targetRole" className="block text-sm font-medium text-foreground">
                  {t.role} <span className="text-muted-foreground">{t.roleOptional}</span>
                </label>
                <input
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder={t.rolePlaceholder}
                  maxLength={50}
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                />
              </div>

              {/* Job description */}
              <div className="space-y-1.5">
                <label htmlFor="jobDescription" className="block text-sm font-medium text-foreground">
                  {t.jd} <span className="text-muted-foreground">{t.jdOptional}</span>
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder={t.jdPlaceholder}
                  rows={5}
                  className="w-full resize-y rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="glow-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <FileSearch className="h-4 w-4" />
                    {t.analyze}
                  </>
                )}
              </button>
            </form>

            {/* ── Result panel ── */}
            <div id="result">
              {result ? (
                <ReviewResult result={result} />
              ) : (
                <div className="flex h-full min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border/60 bg-white/50 p-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.resultEmpty}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t.resultEmptySub}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">{t.faqLabel}</p>
            <h2 className="text-3xl font-bold text-foreground">{t.faqTitle}</h2>
          </div>
          <div className="card-glass divide-y divide-border/60 px-6">
            {t.faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-16 text-center shadow-xl"
            style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
          >
            <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <h2 className="relative mb-3 text-3xl font-bold text-white md:text-4xl">{t.ctaTitle}</h2>
            <p className="relative mb-8 text-rose-100">{t.ctaSub}</p>
            <a
              href="#upload"
              className="relative inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold shadow-md transition-all hover:scale-105 hover:shadow-lg"
              style={{ color: "#C5527A" }}
            >
              {t.ctaBtn}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
