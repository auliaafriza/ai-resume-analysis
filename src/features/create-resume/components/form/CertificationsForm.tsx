import { Award, ExternalLink, Plus, Trash2 } from "lucide-react"

import type { Certification } from "@/lib/interface/createResume"
import { cn } from "@/lib/utils/cn"

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/40"

interface Props {
  certifications: Certification[]
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Certification>) => void
  onRemove: (id: string) => void
}

export function CertificationsForm({ certifications, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div className="card-glass p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-rose-500" />
          <h2 className="text-sm font-semibold text-foreground">Certifications</h2>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {certifications && certifications.length ? (
        certifications.map((cert, idx) => (
          <div key={cert.id} className={cn("rounded-xl border border-border/60 p-4", idx > 0 && "mt-4")}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Certification {idx + 1}</span>
              <button
                onClick={() => onRemove(cert.id)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className={cn(inputCls, "sm:col-span-2")}
                placeholder="Certification name (e.g. AWS Solutions Architect)"
                value={cert.name}
                onChange={(e) => onUpdate(cert.id, { name: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Issuing organization"
                value={cert.issuer}
                onChange={(e) => onUpdate(cert.id, { issuer: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Date (e.g. Jun 2023)"
                value={cert.date}
                onChange={(e) => onUpdate(cert.id, { date: e.target.value })}
              />
              <div className="relative sm:col-span-2">
                <ExternalLink className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cn(inputCls, "pl-9")}
                  placeholder="Credential URL (optional)"
                  value={cert.url}
                  onChange={(e) => onUpdate(cert.id, { url: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">No certifications added yet.</p>
      )}
    </div>
  )
}
