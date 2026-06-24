"use client"

import React from "react"

import type { ResumeData } from "@/lib/interface/createResume"

interface PreviewProps {
  data: ResumeData
  bgColor: string
  accentColor: string
}

function ExecutivePreview({ data, bgColor, accentColor }: PreviewProps) {
  return (
    <div className="min-h-[900px] text-[11px]" style={{ fontFamily: "Georgia, serif", backgroundColor: bgColor }}>
      <div className="flex items-center gap-5 p-6 pb-4" style={{ background: "#1a1a1a" }}>
        {data.photo && (
          <div
            className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2"
            style={{ borderColor: accentColor }}
          >
            <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-white">{data.name || "Your Name"}</h1>
          <p className="mt-0.5 text-sm" style={{ color: accentColor }}>
            {data.title || "Executive Title"}
          </p>
          <p className="mt-1 text-[10px] text-gray-400">
            {[data.email, data.phone, data.location].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <div className="flex">
        <div className="flex-1 border-r border-gray-100 p-5">
          {data.summary && (
            <div className="mb-4">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Executive Summary
              </p>
              <p className="text-[10px] leading-relaxed text-gray-600">{data.summary}</p>
            </div>
          )}
          {data.experiences.length > 0 && (
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Career History
              </p>
              {data.experiences.map((e) => (
                <div key={e.id} className="mb-3">
                  <p className="font-bold text-gray-800">{e.role}</p>
                  <p className="text-[10px]" style={{ color: accentColor }}>
                    {e.company} · {e.start}
                    {e.current ? "–Present" : e.end ? `–${e.end}` : ""}
                  </p>
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <p key={i} className="pl-2 text-[10px] text-gray-600 before:mr-1 before:content-['▸']">
                      {b}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-[35%] p-5">
          {data.educations.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Education
              </p>
              {data.educations.map((e) => (
                <div key={e.id} className="mb-2">
                  <p className="text-[10px] font-bold text-gray-800">{e.degree}</p>
                  <p className="text-[10px] text-gray-400">{e.institution}</p>
                  <p className="text-[9px] text-gray-400">
                    {e.field} · {e.year}
                  </p>
                </div>
              ))}
            </div>
          )}
          {data.skills.length > 0 && (
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                Competencies
              </p>
              {data.skills.map((s) => (
                <p
                  key={s}
                  className="mb-0.5 text-[10px] text-gray-600 before:mr-1 before:text-[8px] before:content-['◆']"
                >
                  {s}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExecutivePreview
