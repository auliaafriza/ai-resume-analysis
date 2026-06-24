import { GraduationCap, Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils/cn"
import type { Education } from "@/lib/interface/createResume"

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/40"

interface Props {
  educations: Education[]
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Education>) => void
  onRemove: (id: string) => void
}

export function EducationForm({ educations, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div className="card-glass p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-rose-500" />
          <h2 className="text-sm font-semibold text-foreground">Education</h2>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {educations.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No education added yet.</p>
      )}

      {educations.map((edu, idx) => (
        <div key={edu.id} className={cn("rounded-xl border border-border/60 p-4", idx > 0 && "mt-4")}>
          <div className="mb-3 flex justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Education {idx + 1}</span>
            <button
              onClick={() => onRemove(edu.id)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className={cn(inputCls, "sm:col-span-2")}
              placeholder="Institution name"
              value={edu.institution}
              onChange={(e) => onUpdate(edu.id, { institution: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Degree (e.g. Bachelor's)"
              value={edu.degree}
              onChange={(e) => onUpdate(edu.id, { degree: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Field of study"
              value={edu.field}
              onChange={(e) => onUpdate(edu.id, { field: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Graduation year"
              value={edu.year}
              onChange={(e) => onUpdate(edu.id, { year: e.target.value })}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
