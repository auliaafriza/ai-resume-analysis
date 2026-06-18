"use client"

import { AlertCircle, CheckCircle2, ChevronRight, Lightbulb, Sparkles } from "lucide-react"

import type { ReviewResponse } from "@/features/resume-review/types"
import { cn } from "@/lib/utils/cn"

interface ReviewResultProps {
  result: ReviewResponse
}

function scoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-600", bar: "bg-emerald-500", ring: "ring-emerald-200" }
  if (score >= 60) return { text: "text-amber-600", bar: "bg-amber-500", ring: "ring-amber-200" }
  return { text: "text-red-500", bar: "bg-red-500", ring: "ring-red-200" }
}

function scoreLabel(score: number) {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Good"
  if (score >= 55) return "Fair"
  return "Needs work"
}

export function ReviewResult({ result }: Readonly<ReviewResultProps>) {
  const { text, ring } = scoreColor(result.overallScore)

  return (
    <div className="card-glass space-y-5 p-8">
      {/* ── Overall score ── */}
      <div className="flex items-center gap-5 rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 to-white p-5">
        <div className={cn("flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl ring-4", ring, "bg-white")}>
          <span className={cn("text-3xl font-bold leading-none", text)}>{result.overallScore}</span>
          <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">/ 100</span>
        </div>
        <div className="min-w-0">
          <div className="mb-0.5 flex items-center gap-2">
            <span className={cn("text-sm font-bold", text)}>{scoreLabel(result.overallScore)}</span>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">Overall Score</span>
          </div>
          <p className="text-sm leading-snug text-muted-foreground">{result.summary}</p>
        </div>
      </div>

      {/* ── Category breakdown ── */}
      {result.scores.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Breakdown</p>
          <div className="space-y-3">
            {result.scores.map((s) => {
              const c = scoreColor(s.score)
              return (
                <div key={s.category}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{s.category}</span>
                    <span className={cn("text-xs font-bold", c.text)}>{s.score}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", c.bar)}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  {s.comment && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{s.comment}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Strengths ── */}
      {result.strengths.length > 0 && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Strengths
          </p>
          <ul className="space-y-1.5">
            {result.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-xs text-emerald-800">
                <ChevronRight className="mt-px h-3 w-3 shrink-0 text-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Improvements ── */}
      {result.improvements.length > 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Areas to Improve
          </p>
          <ul className="space-y-1.5">
            {result.improvements.map((s) => (
              <li key={s} className="flex items-start gap-2 text-xs text-amber-800">
                <ChevronRight className="mt-px h-3 w-3 shrink-0 text-amber-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Suggestions ── */}
      {result.suggestions.length > 0 && (
        <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <Lightbulb className="h-3.5 w-3.5" />
            Actionable Suggestions
          </p>
          <ol className="space-y-2">
            {result.suggestions.map((s, i) => (
              <li key={s} className="flex items-start gap-2 text-xs text-rose-800">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-200 text-[9px] font-bold text-rose-700">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Footer badge ── */}
      <div className="flex items-center justify-end gap-1.5 pt-1 text-[11px] text-muted-foreground">
        <Sparkles className="h-3 w-3 text-rose-400" />
        Analysed by Groq
      </div>
    </div>
  )
}
