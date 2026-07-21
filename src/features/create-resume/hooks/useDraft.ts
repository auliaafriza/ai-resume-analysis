"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { ResumeData, Template } from "@/lib/interface/createResume"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DraftState {
  template: Template
  bgColor: string
  accentColor: string
  data: ResumeData
  savedAt: string // ISO string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DRAFT_KEY = "ai-resume-builder:draft"
const DEBOUNCE_MS = 1500

// ── Helpers ───────────────────────────────────────────────────────────────────

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

export function useDraft() {
  /** Set to true after mount — prevents auto-saving the blank initial state */
  const hasMountedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** The Date when the draft was last persisted to localStorage */
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  /** True if a draft exists in localStorage on first mount */
  const [hasDraft, setHasDraft] = useState(false)

  /** Tick every 30s to refresh the relative-time label */
  const [, setTick] = useState(0)

  useEffect(() => {
    try {
      setHasDraft(!!localStorage.getItem(DRAFT_KEY))
    } catch {
      // localStorage unavailable (private mode, etc.) — silently ignore
    }

    const interval = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  /** Read the draft from localStorage. Returns null if absent or malformed. */
  const loadDraft = useCallback((): DraftState | null => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return null
      return JSON.parse(raw) as DraftState
    } catch {
      return null
    }
  }, [])

  /**
   * Schedule a debounced save. Call this inside a useEffect that watches
   * the relevant state slices. The save is skipped on the very first render
   * (hasMountedRef guards against persisting the blank initial state).
   */
  const scheduleSave = useCallback(
    (state: Omit<DraftState, "savedAt">) => {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true
        return
      }

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        try {
          const draft: DraftState = { ...state, savedAt: new Date().toISOString() }
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
          setSavedAt(new Date())
          setHasDraft(true)
        } catch {
          // Quota exceeded (large photo) — silently skip
        }
      }, DEBOUNCE_MS)
    },
    [],
  )

  /** Remove the draft from localStorage and reset indicator state. */
  const clearDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {}
    setSavedAt(null)
    setHasDraft(false)
  }, [])

  return { loadDraft, scheduleSave, clearDraft, savedAt, hasDraft }
}
