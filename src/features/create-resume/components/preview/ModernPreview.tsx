"use client"

import React from "react"

import { Mail, MapPin, Phone } from "lucide-react"

import type { ResumeData } from "@/lib/interface/createResume"

interface PreviewProps {
  data: ResumeData
  bgColor: string
  accentColor: string
  fontFamily?: string
}

const ModernPreview = ({ data, bgColor, accentColor, fontFamily }: PreviewProps) => {
  return (
    <div
      className="flex h-full min-h-[900px] text-[11px] leading-tight"
      style={{ fontFamily: fontFamily ?? "Georgia, serif", backgroundColor: bgColor }}
    >
      {/* Sidebar */}
      <div className="w-[35%] shrink-0 p-5" style={{ background: accentColor, color: "#fff" }}>
        <div className="mb-4 h-16 w-16 overflow-hidden rounded-full bg-white/20">
          {data.photo ? (
            <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
              {data.name ? data.name[0] : "?"}
            </div>
          )}
        </div>
        <h1 className="mb-0.5 text-lg font-bold leading-snug">{data.name || "Your Name"}</h1>
        <p className="mb-4 text-[10px] opacity-80">{data.title || "Professional Title"}</p>
        <div className="mb-4 space-y-1.5 text-[10px] opacity-90">
          {data.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              {data.email}
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              {data.phone}
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {data.location}
            </div>
          )}
        </div>
        {data.skills?.length > 0 ? (
          <div>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest opacity-70">Skills</p>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((s) => (
                <span key={s} className="rounded-full bg-white/20 px-2 py-0.5 text-[9px]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {/* Main */}
      <div className="flex-1 p-5">
        {data?.summary ? (
          <div className="mb-4">
            <p
              className="mb-1.5 border-b-2 pb-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Summary
            </p>
            <p className="text-[10px] leading-relaxed text-gray-600">{data.summary}</p>
          </div>
        ) : null}
        {data.experiences?.length > 0 ? (
          <div className="mb-4">
            <p
              className="mb-1.5 border-b-2 pb-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Experience
            </p>
            {data.experiences.map((e) => (
              <div key={e.id} className="mb-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{e?.role ?? "Role"}</p>
                    <p className="text-[10px] text-gray-500">{e?.company ?? ""}</p>
                  </div>
                  <p className="shrink-0 text-[9px] text-gray-400">
                    {e?.start ?? ""}
                    {e?.start && (e?.current ? " – Present" : e?.end ? ` – ${e.end}` : "")}
                  </p>
                </div>
                {e?.bullets?.filter(Boolean).map((b, i) => (
                  <p key={i} className="mt-0.5 pl-2 text-[10px] text-gray-600 before:mr-1 before:content-['•']">
                    {b}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ) : null}
        {data.educations?.length > 0 ? (
          <div className="mb-4">
            <p
              className="mb-1.5 border-b-2 pb-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Education
            </p>
            {data.educations.map((e) => (
              <div key={e.id} className="mb-2">
                <div className="flex justify-between">
                  <p className="font-bold text-gray-800">
                    {e?.degree ?? ""} {e?.field && `in ${e.field}`}
                  </p>
                  <p className="text-[9px] text-gray-400">{e?.year ?? ""}</p>
                </div>
                <p className="text-[10px] text-gray-500">{e?.institution ?? ""}</p>
              </div>
            ))}
          </div>
        ) : null}
        {data.certifications?.length > 0 ? (
          <div className="mb-4">
            <p
              className="mb-1.5 border-b-2 pb-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Certifications
            </p>
            {data.certifications.map((c) => (
              <div key={c.id} className="mb-2">
                <p className="font-bold text-gray-800">{c?.name ?? ""}</p>
                <p className="text-[10px] text-gray-500">
                  {c?.issuer ?? ""}
                  {c?.date && ` · ${c.date}`}
                </p>
              </div>
            ))}
          </div>
        ) : null}
        {data.projects?.length > 0 ? (
          <div>
            <p
              className="mb-1.5 border-b-2 pb-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Projects
            </p>
            {data.projects.map((p) => (
              <div key={p.id} className="mb-2.5">
                <p className="font-bold text-gray-800">{p?.name ?? ""}</p>
                <p className="text-[10px] leading-relaxed text-gray-600">{p?.description ?? ""}</p>
                {p.tech?.length > 0 ? (
                  <p className="mt-0.5 text-[9px]" style={{ color: accentColor }}>
                    {p.tech.join(" · ")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ModernPreview
