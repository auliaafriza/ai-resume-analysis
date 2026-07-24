"use client"

import { useRef, useState } from "react"

import { FileText, UploadCloud, X } from "lucide-react"

import { cn } from "@/lib/utils/cn"

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const ACCEPTED_EXT = ".pdf,.doc,.docx"
const MAX_SIZE_MB = 5

interface ResumeUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  error?: string
}

export function ResumeUpload({ file, onFileChange, error }: Readonly<ResumeUploadProps>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)

  function validate(f: File): boolean {
    setSizeError(null)
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setSizeError("Only PDF or Word (.doc / .docx) files are accepted.")
      return false
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setSizeError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`)
      return false
    }
    return true
  }

  function handleFile(f: File) {
    if (validate(f)) onFileChange(f)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    e.target.value = "" // allow re-selecting same file
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const displayError = sizeError ?? error

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Resume / CV <span className="text-destructive">*</span>
      </label>

      {file ? (
        /* ── Selected file pill ── */
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file?.name ?? ""}</p>
            <p className="text-xs text-muted-foreground">{file?.size ? (file?.size / 1024).toFixed(0) : 0} KB</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onFileChange(null)
              setSizeError(null)
            }}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : displayError
                ? "border-destructive bg-destructive/5"
                : "border-border bg-muted/20 hover:border-primary/60 hover:bg-muted/40",
          )}
        >
          <UploadCloud className={cn("h-8 w-8", displayError ? "text-destructive" : "text-muted-foreground")} />
          <p className="text-sm font-medium text-foreground">
            Drop your file here, or <span className="text-primary underline">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">PDF, DOC, DOCX — up to {MAX_SIZE_MB} MB</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept={ACCEPTED_EXT} className="hidden" onChange={onInputChange} />

      {displayError && <p className="text-xs text-destructive">{displayError}</p>}
    </div>
  )
}
