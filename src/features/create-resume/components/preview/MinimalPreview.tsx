"use client"

import React from "react"

import type { ResumeData } from "@/lib/interface/createResume"

interface PreviewProps {
  data: ResumeData
  bgColor: string
  accentColor: string
}

const MinimalPreview = ({ data, bgColor, accentColor }: PreviewProps) => {
  return (
    <div
      className="min-h-[900px] p-10 text-[11px]"
      style={{ fontFamily: "system-ui, sans-serif", backgroundColor: bgColor }}
    >
      <div className="mb-4 flex items-center gap-4">
        {data.photo && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
            <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
          </div>
        )}
        <div>
          <h1 className="mb-0.5 text-2xl font-bold tracking-tight" style={{ color: accentColor }}>
            {data.name || "Your Name"}
          </h1>
          {data.title && <p className="text-sm text-gray-400">{data.title}</p>}
        </div>
      </div>
      <p className="mb-6 text-[10px] text-gray-400">
        {[data.email, data.phone, data.location].filter(Boolean).join("  ·  ")}
      </p>
      {data.summary && (
        <div className="mb-6">
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>
            About
          </p>
          <p className="text-[10px] leading-relaxed text-gray-600">{data.summary}</p>
        </div>
      )}
      {data.experiences.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>
            Experience
          </p>
          {data.experiences.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800">{e.role}</p>
                <p className="text-[9px] text-gray-400">
                  {e.start}
                  {e.start && (e.current ? "–now" : e.end ? `–${e.end}` : "")}
                </p>
              </div>
              <p className="text-[10px] text-gray-400">{e.company}</p>
              {e.bullets.filter(Boolean).map((b, i) => (
                <p key={i} className="mt-0.5 text-[10px] text-gray-500">
                  — {b}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
      {data.educations.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: accentColor }}>
            Education
          </p>
          {data.educations.map((e) => (
            <div key={e.id} className="mb-1.5">
              <p className="font-semibold text-gray-800">
                {e.degree} {e.field}
              </p>
              <p className="text-[10px] text-gray-400">
                {e.institution} · {e.year}
              </p>
            </div>
          ))}
        </div>
      )}
      {data.skills.length > 0 && (
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
      )}
    </div>
  )
}

export default MinimalPreview
