"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// ── Time helper ───────────────────────────────────────────────────────────────

export function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 10) return "just now"
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface LocalDraftControls<T> {
  /** True if a draft exists in localStorage on first mount. */
  hasDraft: boolean
  /** Date of last successful save, or null before the first save. */
  savedAt: Date | null
  /** Schedule a debounced save. Skip the very first call (initial render guard). */
  scheduleSave: (data: T) => void
  /** Load the draft from localStorage. Returns null if absent / malformed. */
  loadDraft: () => T | null
  /** Delete the draft and reset indicator state. */
  clearDraft: () => void
}

/**
 * Generic debounced-save hook for any serialisable state.
 *
 * @param storageKey  localStorage key (must be unique per feature)
 * @param debounceMs  Save delay after the last state change (default 1 500 ms)
 */
export function useLocalDraft<T>(
  storageKey: string,
  debounceMs = 1_500,
): LocalDraftControls<T> {
  const hasMountedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [, setTick] = useState(0) // refreshes relative-time label every 30 s

  // Detect existing draft on mount + start tick
  useEffect(() => {
    try {
      setHasDraft(!!localStorage.getItem(storageKey))
    } catch {
      // localStorage unavailable (private mode, storage quota, etc.)
    }
    const iv = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(iv)
  }, [storageKey])

  const loadDraft = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }, [storageKey])

  const scheduleSave = useCallback(
    (data: T) => {
      // Skip the initial render so we don't overwrite an existing draft
      // with the blank default state before the user has made any change.
      if (!hasMountedRef.current) {
        hasMountedRef.current = true
        return
      }

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(data))
          setSavedAt(new Date())
          setHasDraft(true)
        } catch {
          // Quota exceeded — silently ignore
        }
      }, debounceMs)
    },
    [storageKey, debounceMs],
  )

  const clearDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    try {
      localStorage.removeItem(storageKey)
    } catch {}
    setSavedAt(null)
    setHasDraft(false)
  }, [storageKey])

  return { hasDraft, savedAt, scheduleSave, loadDraft, clearDraft }
}
