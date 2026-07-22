"use client"

import { useState } from "react"

import { ExternalLink, FolderGit2, Plus, Trash2, X } from "lucide-react"

import type { Project } from "@/lib/interface/createResume"
import { cn } from "@/lib/utils/cn"

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/40"

// ── Tech tag input (self-contained) ──────────────────────────────────────────

function TechTagInput({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (updated: string[]) => void
}) {
  const [input, setInput] = useState("")

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput("")
  }

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700"
          >
            {tag}
            <button
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-rose-400 hover:text-rose-600"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={inputCls}
          placeholder="e.g. React, TypeScript, Node.js"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              addTag()
            }
          }}
        />
        <button
          onClick={addTag}
          disabled={!input.trim()}
          className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-40"
        >
          Add
        </button>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">Press Enter or comma to add a tag</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  projects: Project[]
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Project>) => void
  onRemove: (id: string) => void
}

export function ProjectsForm({ projects, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div className="card-glass p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-rose-500" />
          <h2 className="text-sm font-semibold text-foreground">Projects</h2>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {projects.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No projects added yet. Click &ldquo;Add&rdquo; to showcase your work.
        </p>
      )}

      {projects.map((proj, idx) => (
        <div key={proj.id} className={cn("rounded-xl border border-border/60 p-4", idx > 0 && "mt-4")}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Project {idx + 1}</span>
            <button
              onClick={() => onRemove(proj.id)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <input
              className={inputCls}
              placeholder="Project name"
              value={proj.name}
              onChange={(e) => onUpdate(proj.id, { name: e.target.value })}
            />

            <textarea
              rows={2}
              className={cn(inputCls, "resize-none")}
              placeholder="Brief description — what it does, your role, and impact"
              value={proj.description}
              onChange={(e) => onUpdate(proj.id, { description: e.target.value })}
            />

            <div className="relative">
              <ExternalLink className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                className={cn(inputCls, "pl-9")}
                placeholder="Live URL or GitHub link (optional)"
                value={proj.url}
                onChange={(e) => onUpdate(proj.id, { url: e.target.value })}
              />
            </div>

            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Tech stack</p>
              <TechTagInput
                tags={proj.tech}
                onChange={(tech) => onUpdate(proj.id, { tech })}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
