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

// ── Feature cards data ──────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Analysis",
    desc: "Get comprehensive feedback on your resume in seconds, not hours.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: BadgeCheck,
    title: "ATS Scoring",
    desc: "Know exactly how your resume performs against applicant tracking systems.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Lightbulb,
    title: "Actionable Tips",
    desc: "Receive specific, prioritised suggestions to make your resume stand out.",
    color: "from-emerald-500 to-teal-500",
  },
]

const STEPS = [
  {
    num: "01",
    icon: Upload,
    title: "Upload your resume",
    desc: "Drop your PDF or Word file — we keep it private and never store it.",
  },
  {
    num: "02",
    icon: BrainCircuit,
    title: "Groq analyses it",
    desc: "Our AI reads every line, scoring clarity, relevance, impact, and ATS fit.",
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Get your report",
    desc: "Receive a detailed scorecard and a prioritised list of improvements.",
  },
]

const FAQS = [
  {
    q: "Is my resume stored anywhere?",
    a: "No. Your document is processed in memory and immediately discarded after analysis. We never save or share your data.",
  },
  {
    q: "Which file formats are supported?",
    a: "We accept PDF, DOC, and DOCX files up to 5 MB.",
  },
  {
    q: "What AI model powers the analysis?",
    a: "ResumeAI uses Groq — one of the most capable large language models available today.",
  },
  {
    q: "Can I add a job description for a more targeted review?",
    a: "Yes! Pasting the job description lets the AI score relevance and surface missing keywords specific to that role.",
  },
]

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

// ── Main page ────────────────────────────────────────────────────────────────

export function ResumeReviewPage() {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | undefined>()
  const [targetRole, setTargetRole] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<ReviewResponse | null>(null)

  const { mutate, isPending } = useMutationReview()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setFileError("Please upload your resume before submitting.")
      return
    }
    setFileError(undefined)

    const formData = new FormData()
    formData.append("file", file)
    if (targetRole) formData.append("targetRole", targetRole)
    if (jobDescription) formData.append("jobDescription", jobDescription)

    mutate(formData, {
      onSuccess: (data) => {
        if (data.data) {
          setResult(data.data)
          toast.success("Analysis complete!")
          setTimeout(() => {
            document.getElementById("result")?.scrollIntoView({ behavior: "smooth" })
          }, 100)
        }
      },
    })
  }

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="gradient-hero overflow-hidden pb-24 pt-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-medium text-rose-600">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by AI Builder Pluvia AI
          </div>

          {/* Headline */}
          <h1 className="mx-auto mb-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            Get AI feedback on <span className="gradient-text">your resume</span> in seconds
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            Upload your CV and receive an instant, detailed analysis — ATS score, strengths, weaknesses, and actionable
            improvements.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#upload"
              className="glow-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
            >
              Analyze my resume
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-secondary"
            >
              How it works
            </a>
          </div>

          {/* Social proof strip */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            {["No sign-up required", "Free to use", "Results in &lt;10 seconds", "Privacy-first"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-rose-400" />
                <span dangerouslySetInnerHTML={{ __html: t }} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">Why ResumeAI</p>
            <h2 className="text-3xl font-bold text-foreground">Everything you need to land the interview</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card-glass p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className={cn("mb-4 inline-flex rounded-xl bg-gradient-to-br p-3", color)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">Simple process</p>
            <h2 className="text-3xl font-bold text-foreground">Three steps to a stronger resume</h2>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line */}
            <div className="absolute left-1/2 top-8 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent md:block" />

            {STEPS.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="relative flex flex-col items-center text-center">
                <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-white shadow-sm">
                  <Icon className="h-6 w-6 text-rose-500" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #E8856A 0%, #C5527A 100%)" }}>
                    {num.slice(-1)}
                  </span>
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPLOAD + RESULT ──────────────────────────────────────────────── */}
      <section id="upload" className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">Get started</p>
            <h2 className="text-3xl font-bold text-foreground">Analyze your resume now</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No account needed. Results appear instantly on this page.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* ── Upload form ── */}
            <form onSubmit={handleSubmit} className="card-glass space-y-6 p-8">
              <ResumeUpload file={file} onFileChange={setFile} error={fileError} />

              {/* Target role */}
              <div className="space-y-1.5">
                <label htmlFor="targetRole" className="block text-sm font-medium text-foreground">
                  Target role <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Product Designer"
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                />
              </div>

              {/* Job description */}
              <div className="space-y-1.5">
                <label htmlFor="jobDescription" className="block text-sm font-medium text-foreground">
                  Job description <span className="text-muted-foreground">(optional — improves relevance score)</span>
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here…"
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
                    Analysing your resume…
                  </>
                ) : (
                  <>
                    <FileSearch className="h-4 w-4" />
                    Analyze resume
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
                    <p className="text-sm font-medium text-foreground">Your analysis will appear here</p>
                    <p className="mt-1 text-xs text-muted-foreground">Upload your resume on the left to get started</p>
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">Got questions?</p>
            <h2 className="text-3xl font-bold text-foreground">Frequently asked questions</h2>
          </div>
          <div className="card-glass divide-y divide-border/60 px-6">
            {FAQS.map((f) => (
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
            {/* Decorative blobs */}
            <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <h2 className="relative mb-3 text-3xl font-bold text-white md:text-4xl">Ready for a better resume?</h2>
            <p className="relative mb-8 text-rose-100">
              Get instant AI feedback and start landing more interviews today.
            </p>
            <a
              href="#upload"
              className="relative inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold shadow-md transition-all hover:scale-105 hover:shadow-lg"
              style={{ color: "#C5527A" }}
            >
              Analyze my resume for free
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
