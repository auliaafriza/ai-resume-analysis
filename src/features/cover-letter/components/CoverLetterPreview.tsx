"use client"

import React from "react"

// ── Types ─────────────────────────────────────────────────────────────────────

export type CoverLetterTemplateId = "simple" | "modern" | "creative" | "professional"

export interface CoverLetterPreviewProps {
  template: CoverLetterTemplateId
  text: string
  fontFamily: string
  accentColor: string
  company?: string
  jobTitle?: string
  yourName?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function paras(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function today() {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

// hex → rgba helper for tinting
function hexAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Template 1: Simple ────────────────────────────────────────────────────────
// Content-first. Thin accent stripe, meta row, clean body.
// Best for: students, versatile industries, speed.

function SimpleTemplate({ text, fontFamily, accentColor, company, jobTitle, yourName }: CoverLetterPreviewProps) {
  const ps = paras(text)
  return (
    <div className="min-h-[560px] bg-white px-10 py-9 text-[12px] text-gray-800" style={{ fontFamily }}>
      {/* Accent stripe */}
      <div className="mb-7 h-[3px] w-full" style={{ backgroundColor: accentColor }} />

      {/* Meta row */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          {yourName && <p className="text-[11px] text-gray-400">{yourName}</p>}
          {company && <p className="text-[12px] font-semibold text-gray-800">{company}</p>}
          {jobTitle && <p className="text-[11px] text-gray-400">{jobTitle}</p>}
        </div>
        <p className="shrink-0 text-[11px] text-gray-400">{today()}</p>
      </div>

      {/* Separator */}
      <div className="mb-6 h-px bg-gray-100" />

      {/* Body */}
      <div className="space-y-4">
        {ps.map((p, i) => (
          <p key={i} className="text-gray-700" style={{ lineHeight: "1.85" }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}

// ── Template 2: Modern ────────────────────────────────────────────────────────
// Two-column: narrow accent sidebar with meta + decorative shape; wide body.
// Best for: tech, marketing, IT, start-ups.

function ModernTemplate({ text, fontFamily, accentColor, company, jobTitle, yourName }: CoverLetterPreviewProps) {
  const ps = paras(text)
  return (
    <div className="flex min-h-[560px] bg-white text-[12px] text-gray-800" style={{ fontFamily }}>
      {/* Sidebar */}
      <div
        className="relative flex w-[30%] shrink-0 flex-col justify-between overflow-hidden px-5 py-8"
        style={{ backgroundColor: accentColor }}
      >
        {/* Decorative circle top-right */}
        <div
          className="absolute -right-6 -top-6 h-20 w-20 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        />
        {/* Decorative circle bottom-left */}
        <div
          className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        />

        {/* Meta */}
        <div className="relative z-10">
          {yourName && (
            <p className="mb-1 text-sm font-bold uppercase tracking-widest text-white">{yourName}</p>
          )}
          <div className="mb-2 h-[2px] w-6 bg-white/60" />
          {jobTitle && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/70">{jobTitle}</p>
          )}
          {company && <p className="text-[13px] font-bold leading-snug text-white">{company}</p>}
        </div>

        {/* Date at bottom */}
        <p className="relative z-10 text-[10px] text-white/50">{today()}</p>
      </div>

      {/* Body */}
      <div className="flex-1 px-8 py-8">
        {/* Top accent line */}
        <div className="mb-6 flex gap-1">
          <div className="h-1 w-8 rounded-full" style={{ backgroundColor: accentColor }} />
          <div className="h-1 w-3 rounded-full" style={{ backgroundColor: hexAlpha(accentColor, 0.3) }} />
        </div>

        <div className="space-y-4">
          {ps.map((p, i) => (
            <p key={i} className="text-gray-700" style={{ lineHeight: "1.85" }}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Template 3: Creative ──────────────────────────────────────────────────────
// Bold full-width header with decorative circles, white body below.
// Best for: design, film, art, media, content creation.

function CreativeTemplate({ text, fontFamily, accentColor, company, jobTitle, yourName }: CoverLetterPreviewProps) {
  const ps = paras(text)
  return (
    <div className="min-h-[560px] bg-white text-[12px] text-gray-800" style={{ fontFamily }}>
      {/* Bold header */}
      <div className="relative overflow-hidden px-10 py-8" style={{ backgroundColor: accentColor }}>
        {/* Decorative circles */}
        <div
          className="absolute -right-8 -top-8 h-32 w-32 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
        />
        <div
          className="absolute -bottom-4 right-16 h-16 w-16 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        />
        <div
          className="absolute bottom-2 right-4 h-8 w-8 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        />

        {/* Header content */}
        <div className="relative z-10">
          {yourName && (
            <p className="mb-1.5 text-sm font-bold uppercase tracking-[0.2em] text-white">{yourName}</p>
          )}
          {jobTitle && (
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">{jobTitle}</p>
          )}
          {company && <p className="text-[22px] font-bold leading-tight text-white">{company}</p>}
        </div>
      </div>

      {/* Thin accent underline */}
      <div className="h-[3px]" style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }} />

      {/* Date + body */}
      <div className="px-10 py-7">
        <p className="mb-5 text-[10px] text-gray-400">{today()}</p>
        <div className="space-y-4">
          {ps.map((p, i) => (
            <p key={i} className="text-gray-700" style={{ lineHeight: "1.85" }}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Template 4: Professional ──────────────────────────────────────────────────
// Formal business letter — structured header, double rule, "Re:" line.
// Best for: finance, law, medicine, education, business.

function ProfessionalTemplate({ text, fontFamily, accentColor, company, jobTitle, yourName }: CoverLetterPreviewProps) {
  const ps = paras(text)
  return (
    <div className="min-h-[560px] bg-white px-10 py-9 text-[12px] text-gray-800" style={{ fontFamily }}>
      {/* Formal header */}
      <div className="mb-5 flex items-start justify-between gap-6">
        {/* Left: company block */}
        <div>
          {yourName && (
            <p className="text-[14px] font-bold text-gray-900" style={{ letterSpacing: "0.01em" }}>
              {yourName}
            </p>
          )}
          {company && (
            <p className="text-[14px] font-bold text-gray-900" style={{ letterSpacing: "0.01em" }}>
              {company}
            </p>
          )}
          {jobTitle && <p className="mt-0.5 text-[11px] text-gray-500">{jobTitle}</p>}
        </div>
        {/* Right: date block */}
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-gray-400">{today()}</p>
        </div>
      </div>

      {/* Double rule */}
      <div className="mb-1 h-[2px]" style={{ backgroundColor: accentColor }} />
      <div className="mb-5 h-px" style={{ backgroundColor: hexAlpha(accentColor, 0.25) }} />

      {/* Re: line */}
      {jobTitle && (
        <p className="mb-5 text-[11px] font-semibold text-gray-600">
          <span style={{ color: accentColor }}>Re:</span> Application for {jobTitle}
          {company ? ` at ${company}` : ""}
        </p>
      )}

      {/* Body */}
      <div className="space-y-4">
        {ps.map((p, i) => (
          <p key={i} className="text-gray-700" style={{ lineHeight: "1.85" }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

const TEMPLATE_MAP: Record<CoverLetterTemplateId, React.ComponentType<CoverLetterPreviewProps>> = {
  simple: SimpleTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
  professional: ProfessionalTemplate,
}

export function CoverLetterPreview(props: CoverLetterPreviewProps) {
  const Template = TEMPLATE_MAP[props.template] ?? SimpleTemplate
  return <Template {...props} />
}
