"use client"

import React from "react"

import type { ResumeData } from "@/lib/interface/createResume"

interface PreviewProps {
  data: ResumeData
  bgColor: string
  accentColor: string
}

const ClassicPreview = ({ data, bgColor, accentColor }: PreviewProps) => {
  return (
    <div
      className="min-h-[900px] p-8 text-[11px] leading-tight"
      style={{ fontFamily: "Times New Roman, serif", backgroundColor: bgColor }}
    >
      <div className="mb-4 border-b-2 pb-3 text-center" style={{ borderColor: accentColor }}>
        {data.photo && (
          <div
            className="mx-auto mb-2 h-16 w-16 overflow-hidden rounded-full border-2"
            style={{ borderColor: accentColor }}
          >
            <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
          </div>
        )}
        <h1 className="text-xl font-bold uppercase tracking-widest" style={{ color: accentColor }}>
          {data?.name ?? "Your Name"}
        </h1>
        <p className="mt-0.5 text-[10px] text-gray-500">
          {[data?.email, data?.phone, data?.location].filter(Boolean).join(" · ")}
        </p>
        {data?.title && <p className="mt-0.5 text-[10px] font-semibold text-gray-600">{data?.title ?? "-"}</p>}
      </div>
      {data.summary && (
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            Professional Summary
          </p>
          <p className="text-[10px] leading-relaxed text-gray-600">{data?.summary ?? "-"}</p>
        </div>
      )}
      {data.experiences.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            Experience
          </p>
          {data.experiences.map((e) => (
            <div key={e.id} className="mb-2">
              <div className="flex justify-between">
                <p className="font-bold text-gray-800">{e?.role ?? "-"}</p>
                <p className="text-[9px] text-gray-400">
                  {e?.start ?? "-"}
                  {e?.start && (e?.current ? " – Present" : e?.end ? ` – ${e?.end}` : "")}
                </p>
              </div>
              <p className="text-[10px] italic text-gray-500">{e?.company ?? "-"}</p>
              {e?.bullets?.filter(Boolean).map((b, i) => (
                <p key={i} className="pl-3 text-[10px] text-gray-600 before:mr-1 before:content-['•']">
                  {b}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
      {data.educations.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            Education
          </p>
          {data.educations.map((e) => (
            <div key={e.id} className="mb-1.5 flex justify-between">
              <div>
                <p className="font-bold text-gray-800">
                  {e?.degree ?? "-"} {e?.field ?? "-"}
                </p>
                <p className="text-[10px] text-gray-500">{e?.institution ?? "-"}</p>
              </div>
              <p className="text-[9px] text-gray-400">{e?.year ?? "-"}</p>
            </div>
          ))}
        </div>
      )}
      {data.certifications.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            Certifications
          </p>
          {data.certifications.map((c) => (
            <div key={c.id} className="mb-1 flex justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-800">{c.name}</p>
                <p className="text-[10px] italic text-gray-500">{c.issuer}</p>
              </div>
              {c.date && <p className="text-[9px] text-gray-400">{c.date}</p>}
            </div>
          ))}
        </div>
      )}
      {data.projects.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            Projects
          </p>
          {data.projects.map((p) => (
            <div key={p.id} className="mb-2">
              <p className="text-[10px] font-bold text-gray-800">{p.name}</p>
              {p.description && <p className="text-[10px] text-gray-600">{p.description}</p>}
              {p.tech.length > 0 && <p className="text-[9px]" style={{ color: accentColor }}>{p.tech.join(", ")}</p>}
            </div>
          ))}
        </div>
      )}
      {data.skills.length > 0 && (
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            Skills
          </p>
          <p className="text-[10px] text-gray-600">{data.skills.join(" · ")}</p>
        </div>
      )}
    </div>
  )
}

export default ClassicPreview
