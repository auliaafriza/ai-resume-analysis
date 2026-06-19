"use client"

import React, { useRef, useState } from "react"

import { AlertCircle, CheckCircle2, ChevronRight, Lightbulb, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

import type { ReviewResponse } from "@/features/resume-review/types"
import { cn } from "@/lib/utils/cn"

// eslint-disable-next-line @typescript-eslint/no-require-imports
const html2pdf = typeof window !== "undefined" ? require("html2pdf.js") : null

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
  const printRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const strength =
    result?.strengths?.length > 0
      ? result.strengths
      : result?.kelebihan?.length > 0
        ? result.kelebihan
        : []
  const improvement = result?.improvements?.length > 0
    ? result.improvements
    : result?.perbaikan?.length > 0
      ? result.perbaikan
      : []
  const suggestion = result?.suggestions?.length > 0
    ? result.suggestions
    : result?.saran?.length > 0
      ? result.saran
      : []

  const waitForDownloadRender = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve())
      })
    })

  const createPdfSnapshot = (sourceNode: HTMLDivElement) => {
    // html2pdf is more stable when it renders from an isolated DOM tree instead of the live preview.
    const hiddenExportRoot = document.createElement("div")
    hiddenExportRoot.style.position = "fixed"
    hiddenExportRoot.style.inset = "0"
    hiddenExportRoot.style.zIndex = "-1"
    hiddenExportRoot.style.pointerEvents = "none"
    hiddenExportRoot.style.opacity = "0"
    hiddenExportRoot.style.overflow = "hidden"

    const pdfSnapshotNode = sourceNode.cloneNode(true) as HTMLDivElement
    hiddenExportRoot.appendChild(pdfSnapshotNode)
    document.body.appendChild(hiddenExportRoot)

    return {
      pdfSnapshotNode,
      disposePdfSnapshot: () => {
        hiddenExportRoot.remove()
      },
    }
  }

  const handleDownload = async () => {
    if (!printRef.current || !html2pdf) return

    setIsDownloading(true)
    await waitForDownloadRender()

    let disposePdfSnapshot: (() => void) | undefined

    try {
      const pdfSnapshot = createPdfSnapshot(printRef.current)
      const { pdfSnapshotNode, disposePdfSnapshot: disposeSnapshot } = pdfSnapshot
      disposePdfSnapshot = disposeSnapshot
      const date = new Date().toISOString().split("T")[0]

      await html2pdf()
        .from(pdfSnapshotNode)
        .set({
          margin: 0,
          filename: `Download Report Resume Analysis Pluvia - ${date}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          pagebreak: {
            mode: ["css", "legacy"],
          },
          html2canvas: { scale: 1, logging: false, useCORS: true },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        })
        .save()

      toast.success("Document downloaded")
    } finally {
      // Always remove the temporary export DOM so repeated downloads do not pile up hidden nodes.
      disposePdfSnapshot?.()
      setIsDownloading(false)
    }
  }

  return (
    <div className="card-glass">
      <div ref={printRef} className="space-y-5 p-8">
        {/* ── Overall score ── */}
        <div className="flex items-center gap-5 rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 to-white p-5">
          <div
            className={cn(
              "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl ring-4",
              ring,
              "bg-white",
            )}
          >
            <span className={cn("text-3xl font-bold leading-none", text)}>{result.overallScore}</span>
            <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">/ 100</span>
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-2">
              <span className={cn("text-sm font-bold", text)}>{scoreLabel(result.overallScore)}</span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                Overall Score
              </span>
            </div>
            <p className="text-sm leading-snug text-muted-foreground">{result.summary}</p>
          </div>
        </div>

        {/* ── Category breakdown ── */}
        {result.scores.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category Breakdown
            </p>
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
                    {s.comment && <p className="mt-0.5 text-[11px] text-muted-foreground">{s.comment}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Strengths ── */}
        {strength.length > 0 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Strengths
            </p>
            <ul className="space-y-1.5">
              {strength.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-emerald-800">
                  <ChevronRight className="mt-px h-3 w-3 shrink-0 text-emerald-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Improvements ── */}
        {improvement.length > 0 && (
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <AlertCircle className="h-3.5 w-3.5" />
              Areas to Improve
            </p>
            <ul className="space-y-1.5">
              {improvement.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-amber-800">
                  <ChevronRight className="mt-px h-3 w-3 shrink-0 text-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Suggestions ── */}
        {suggestion.length > 0 && (
          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
            <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
              <Lightbulb className="h-3.5 w-3.5" />
              Actionable Suggestions
            </p>
            <ol className="space-y-2">
              {suggestion.map((s, i) => (
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
      </div>

      <div className="p-8">
        <button
          onClick={() => handleDownload()}
          disabled={isDownloading}
          className="glow-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </>
          ) : (
            <>Download Report</>
          )}
        </button>

        {/* ── Footer badge ── */}
        <div className="flex items-center justify-end gap-1.5 pt-2 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-rose-400" />
          Analysed by Groq
        </div>
      </div>
    </div>
  )
}
