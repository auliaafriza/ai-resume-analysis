"use client"

import { useState } from "react"

import { AlertCircle, Loader2, Sparkles, X } from "lucide-react"

import type { ResumeData } from "@/lib/interface/createResume"

interface Props {
  lang?: "en" | "id"
  onGenerated: (data: Partial<ResumeData>) => void
  onClose: () => void
}

const PLACEHOLDER_EN = `Example:
My name is Budi Santoso. I'm a software engineer with 4 years of experience in React, TypeScript, and Node.js. I worked at Tokopedia as a frontend engineer for 2 years and before that at a startup called Kudo for 1.5 years. I graduated from Universitas Indonesia in Computer Science in 2019. I'm based in Jakarta and looking for a Senior Frontend Engineer role.`

const PLACEHOLDER_ID = `Contoh:
Nama saya Budi Santoso. Saya adalah software engineer dengan 4 tahun pengalaman di React, TypeScript, dan Node.js. Saya pernah bekerja di Tokopedia sebagai frontend engineer selama 2 tahun dan sebelumnya di startup bernama Kudo selama 1,5 tahun. Saya lulus dari Universitas Indonesia jurusan Ilmu Komputer tahun 2019. Saya berbasis di Jakarta dan mencari posisi Senior Frontend Engineer.`

const T = {
  en: {
    title: "Generate with AI",
    subtitle: "Describe yourself and let AI build your resume",
    descLabel: "Tell us about yourself",
    descHint: "Include: your name, experience, companies worked at, education, skills, and target role.",
    roleLabel: "Target role (optional)",
    rolePlaceholder: "e.g. Senior Product Manager",
    langLabel: "Resume language",
    generate: "Generate Resume",
    generating: "Generating…",
    errorPrefix: "Error: ",
    successNote: "Review and edit the generated content below.",
    tip: "Tip: The more detail you provide, the better the result.",
  },
  id: {
    title: "Generate dengan AI",
    subtitle: "Ceritakan tentang dirimu, AI akan buat CVnya",
    descLabel: "Ceritakan tentang dirimu",
    descHint: "Sertakan: nama, pengalaman kerja, perusahaan, pendidikan, skill, dan posisi yang dituju.",
    roleLabel: "Posisi yang dituju (opsional)",
    rolePlaceholder: "mis. Senior Product Manager",
    langLabel: "Bahasa resume",
    generate: "Generate Resume",
    generating: "Sedang membuat…",
    errorPrefix: "Error: ",
    successNote: "Periksa dan edit konten yang sudah digenerate.",
    tip: "Tips: Semakin detail informasi yang kamu berikan, semakin baik hasilnya.",
  },
}

export function GenerateWithAIModal({ lang = "en", onGenerated, onClose }: Props) {
  const [description, setDescription] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [resumeLang, setResumeLang] = useState(lang)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const t = T[lang]
  const charCount = description.length

  const handleGenerate = async () => {
    if (!description.trim()) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), targetRole, language: resumeLang }),
      })

      const json = await res.json() as { resume?: Partial<ResumeData>; error?: string }

      if (!res.ok || json.error) {
        setError(json.error ?? "Something went wrong")
        return
      }

      if (json.resume) {
        // Ensure each experience/education has a valid id (fallback)
        const resume = json.resume
        if (resume.experiences) {
          resume.experiences = resume.experiences.map((e) => ({
            ...e,
            id: e.id || crypto.randomUUID(),
            bullets: Array.isArray(e.bullets) ? e.bullets : [],
            current: e.current ?? false,
            end: e.end ?? "",
          }))
        }
        if (resume.educations) {
          resume.educations = resume.educations.map((e) => ({
            ...e,
            id: e.id || crypto.randomUUID(),
          }))
        }
        if (!Array.isArray(resume.skills)) resume.skills = []

        onGenerated(resume)
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ border: "1px solid #EDE3DB" }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6 pb-4"
          style={{ background: "linear-gradient(135deg, #FDF0F0 0%, #FAF7F4 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #E8856A, #C5527A)" }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{t.title}</h2>
              <p className="text-xs text-gray-500">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">{t.descLabel}</label>
            <textarea
              rows={7}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={lang === "id" ? PLACEHOLDER_ID : PLACEHOLDER_EN}
              className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/30"
              disabled={loading}
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] text-gray-400">{t.descHint}</p>
              <span className={`text-[11px] ${charCount < 50 ? "text-red-400" : "text-gray-400"}`}>
                {charCount} chars
              </span>
            </div>
          </div>

          {/* Target role */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">{t.roleLabel}</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder={t.rolePlaceholder}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/30"
              disabled={loading}
            />
          </div>

          {/* Language */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">{t.langLabel}</label>
            <div className="flex gap-2">
              {(["en", "id"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setResumeLang(l)}
                  disabled={loading}
                  className="flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-all"
                  style={
                    resumeLang === l
                      ? { borderColor: "#C5527A", color: "#C5527A", backgroundColor: "#FDF0F0" }
                      : { borderColor: "#E5E7EB", color: "#6B7280", backgroundColor: "#F9FAFB" }
                  }
                >
                  {l === "en" ? "🇬🇧 English" : "🇮🇩 Bahasa Indonesia"}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-xs text-red-700">{t.errorPrefix}{error}</p>
            </div>
          )}

          {/* Tip */}
          <p className="text-[11px] text-gray-400">{t.tip}</p>
        </div>

        {/* Footer */}
        <div className="border-t p-4" style={{ borderColor: "#EDE3DB" }}>
          <button
            onClick={handleGenerate}
            disabled={loading || description.trim().length < 20}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.generating}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t.generate}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
