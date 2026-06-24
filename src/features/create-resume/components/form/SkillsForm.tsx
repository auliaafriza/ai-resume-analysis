import { useState } from "react"

import { Plus, Tag } from "lucide-react"

import { cn } from "@/lib/utils/cn"

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/40"

interface Props {
  skills: string[]
  onChange: (skills: string[]) => void
}

export function SkillsForm({ skills, onChange }: Props) {
  const [input, setInput] = useState("")

  const add = () => {
    const s = input.trim()
    if (s && !skills.includes(s)) onChange([...skills, s])
    setInput("")
  }

  const remove = (skill: string) => onChange(skills.filter((s) => s !== skill))

  return (
    <div className="card-glass p-6">
      <div className="mb-4 flex items-center gap-2">
        <Tag className="h-4 w-4 text-rose-500" />
        <h2 className="text-sm font-semibold text-foreground">Skills</h2>
      </div>

      <div className="flex gap-2">
        <input
          className={cn(inputCls, "flex-1")}
          placeholder="e.g. React, Python, Project Management…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button
          onClick={add}
          className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
            >
              {s}
              <button onClick={() => remove(s)} className="ml-0.5 text-rose-400 hover:text-rose-600">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
