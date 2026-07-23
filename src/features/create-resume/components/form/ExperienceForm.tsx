import { Briefcase, Plus, Trash2 } from "lucide-react"

import type { Experience } from "@/lib/interface/createResume"
import { cn } from "@/lib/utils/cn"

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/40"

interface Props {
  experiences: Experience[]
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Experience>) => void
  onRemove: (id: string) => void
}

export function ExperienceForm({ experiences, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div className="card-glass p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-rose-500" />
          <h2 className="text-sm font-semibold text-foreground">Work Experience</h2>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {experiences && experiences.length ? (
        experiences.map((exp, idx) => (
          <div key={exp.id} className={cn("rounded-xl border border-border/60 p-4", idx > 0 && "mt-4")}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Position {idx + 1}</span>
              <button
                onClick={() => onRemove(exp.id)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className={inputCls}
                placeholder="Job title"
                value={exp.role}
                onChange={(e) => onUpdate(exp.id, { role: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Company"
                value={exp.company}
                onChange={(e) => onUpdate(exp.id, { company: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Start (e.g. Jan 2022)"
                value={exp.start}
                onChange={(e) => onUpdate(exp.id, { start: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  className={cn(inputCls, "flex-1")}
                  placeholder="End"
                  value={exp.end}
                  disabled={exp.current}
                  onChange={(e) => onUpdate(exp.id, { end: e.target.value })}
                />
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => onUpdate(exp.id, { current: e.target.checked, end: "" })}
                  />
                  Current
                </label>
              </div>
            </div>

            <div className="mt-2 space-y-1.5">
              <p className="text-xs text-muted-foreground">Key achievements / responsibilities</p>
              {exp && exp?.bullets && exp?.bullets.length
                ? exp?.bullets.map((b, bi) => (
                    <div key={bi} className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <input
                        className={cn(inputCls, "flex-1")}
                        placeholder="e.g. Increased revenue by 30%…"
                        value={b}
                        onChange={(e) => {
                          const bullets = [...exp.bullets]
                          bullets[bi] = e.target.value
                          onUpdate(exp.id, { bullets })
                        }}
                      />
                      {exp.bullets.length > 1 && (
                        <button
                          onClick={() => onUpdate(exp.id, { bullets: exp.bullets.filter((_, i) => i !== bi) })}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                : null}
              <button
                onClick={() => onUpdate(exp.id, { bullets: [...exp.bullets, ""] })}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600"
              >
                <Plus className="h-3 w-3" /> Add bullet
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No experience added yet. Click &ldquo;Add&rdquo; to start.
        </p>
      )}
    </div>
  )
}
