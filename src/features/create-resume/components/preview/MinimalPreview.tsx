"use client"

import React from "react"

import type { ResumeData } from "@/lib/interface/createResume"

interface PreviewProps {
  data: ResumeData
  bgColor: string
  accentColor: string
  fontFamily?: string
}

const MinimalPreview = ({ data, bgColor, accentColor, fontFamily }: PreviewProps) => {
  return (
    <div
      className="min-h-[900px] p-10 text-[11px]"
      style={{ fontFamily: fontFamily ?? "system-ui, sans-serif", backgroundColor: bgColor }}
    >
      <div className="mb-4 flex items-center gap-4">
        {data?.photo ? (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
            <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div>
          <h1 className="mb-0.5 text-2xl font-bold tracking-tight" style={{ color: accentColor }}>
            {data?.name ?? "Your Name"}
          </h1>
          {<p className="text-sm text-gray-400">{data?.title ?? ""}</p>}
        </div>
      </div>
      <p className="mb-6 text-[10px] text-gray-400">
        {[data?.email, data?.phone, data?.location].filter(Boolean).join("  ·  ")}
      </p>
      {data?.summary ? (
        <div className="mb-6">
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>
            About
          </p>
          <p className="text-[10px] leading-relaxed text-gray-600">{data.summary}</p>
        </div>
      ) : null}
      {data?.experiences?.length > 0 ? (
        <div className="mb-6">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>
            Experience
          </p>
          {data.experiences.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800">{e?.role ?? ""}</p>
                <p className="text-[9px] text-gray-400">
                  {e?.start ?? ""}
                  {e?.start && (e?.current ? "–now" : e?.end ? `–${e.end}` : "")}
                </p>
              </div>
              <p className="text-[10px] text-gray-400">{e?.company ?? ""}</p>
              {e?.bullets?.filter(Boolean).map((b, i) => (
                <p key={i} className="mt-0.5 text-[10px] text-gray-500">
                  — {b ?? ""}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : null}
      {data?.educations?.length > 0 ? (
        <div className="mb-6">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>
            Education
          </p>
          {data.educations.map((e) => (
            <div key={e.id} className="mb-1.5">
              <p className="font-semibold text-gray-800">
                {e?.degree ?? ""} {e?.field ?? ""}
              </p>
              <p className="text-[10px] text-gray-400">
                {e?.institution ?? ""} · {e?.year ?? ""}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {data?.certifications?.length > 0 ? (
        <div className="mb-6">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>
            Certifications
          </p>
          {data.certifications.map((c) => (
            <div key={c.id} className="mb-1.5">
              <p className="font-semibold text-gray-800">{c?.name ?? ""}</p>
              <p className="text-[10px] text-gray-400">{c?.issuer ?? ""}{c?.date && ` · ${c.date}`}</p>
            </div>
          ))}
        </div>
      ) : null}
      {data?.projects?.length > 0 ? (
        <div className="mb-6">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>
            Projects
          </p>
          {data.projects.map((p) => (
            <div key={p.id} className="mb-2.5">
              <p className="font-semibold text-gray-800">{p?.name ?? ""}</p>
              {p?.description && <p className="text-[10px] text-gray-500">— {p.description}</p>}
              {p?.tech?.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded px-1.5 py-0.5 text-[9px]"
                      style={{ border: `1px solid ${accentColor}40`, color: accentColor }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {data?.skills?.length > 0 ? (
        <div>
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <span
                key={s}
                className="rounded px-2 py-0.5 text-[10px]"
                style={{ border: `1px solid ${accentColor}40`, color: accentColor }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MinimalPreview
