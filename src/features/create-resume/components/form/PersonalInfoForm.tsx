import { Camera, User, X } from "lucide-react"

import { cn } from "@/lib/utils/cn"
import type { ResumeData } from "@/lib/interface/createResume"

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/40"

interface Props {
  data: Pick<ResumeData, "name" | "email" | "phone" | "location" | "title" | "summary" | "photo">
  accentColor: string
  onChange: <K extends keyof ResumeData>(key: K, val: ResumeData[K]) => void
}

export function PersonalInfoForm({ data, accentColor, onChange }: Props) {
  return (
    <div className="card-glass p-6">
      <div className="mb-4 flex items-center gap-2">
        <User className="h-4 w-4 text-rose-500" />
        <h2 className="text-sm font-semibold text-foreground">Personal Information</h2>
      </div>

      {/* Photo upload */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative">
          <div
            className="h-20 w-20 overflow-hidden rounded-full border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-rose-300"
            style={data?.photo ? { borderStyle: "solid", borderColor: accentColor } : {}}
          >
            {data?.photo ? (
              <img src={data.photo} alt="profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-muted-foreground">
                <Camera className="h-5 w-5" />
                <span className="text-[9px]">Photo</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = (ev) => onChange("photo", ev.target?.result as string)
              reader.readAsDataURL(file)
            }}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Profile Photo</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP · optional</p>
          {data.photo && (
            <button
              onClick={() => onChange("photo", "")}
              className="mt-1.5 flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className={inputCls}
          placeholder="Full name *"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Professional title"
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Email"
          type="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Phone"
          value={data.phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
        <input
          className={cn(inputCls, "sm:col-span-2")}
          placeholder="Location (e.g. Jakarta, Indonesia)"
          value={data.location}
          onChange={(e) => onChange("location", e.target.value)}
        />
      </div>
      <textarea
        className={cn(inputCls, "mt-3 resize-y")}
        rows={3}
        placeholder="Professional summary…"
        value={data.summary}
        onChange={(e) => onChange("summary", e.target.value)}
      />
    </div>
  )
}
