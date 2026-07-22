"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { FileText, FolderOpen, Menu, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NAV_LINKS } from "@/components/navConfig"

// Map each nav item to a decorative icon
const LINK_ICONS = {
  "/resume-review": FileText,
  "/create-resume": FolderOpen,
  "/cover-letter": Sparkles,
} as Record<string, React.ComponentType<{ className?: string }>>

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Needed to avoid SSR mismatch — portal can only target document.body client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      {/* ── Hamburger button (mobile only) ─────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:bg-white/80 md:hidden z-10"
        style={{ borderColor: "#EDE3DB", backgroundColor: "white" }}
      >
        <Menu className="h-5 w-5" style={{ color: "#8B5E52" }} />
      </button>

      {/*
        Portal: backdrop + drawer rendered at <body> level.
        This escapes the header's backdrop-filter stacking context, which would
        otherwise make `fixed` children position themselves relative to the
        header element instead of the viewport.
      */}
      {mounted &&
        createPortal(
          <>
            {/* ── Backdrop ─────────────────────────────────────────────────── */}
            <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className={[
                "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
              ].join(" ")}
            />

            {/* ── Slide-in drawer ──────────────────────────────────────────── */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className={[
                "fixed inset-y-0 right-0 z-[70] flex w-[280px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out",
                open ? "translate-x-0" : "translate-x-full",
              ].join(" ")}
            >
              {/* Drawer header */}
              <div
                className="flex shrink-0 items-center justify-between border-b px-5 py-4"
                style={{ borderColor: "#EDE3DB", backgroundColor: "#FAF7F4" }}
              >
                <p className="text-sm font-bold tracking-wide" style={{ color: "#2D1B15" }}>
                  Menu
                </p>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links — flex-1 + min-h-0 so it fills remaining space and scrolls */}
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 min-h-0">
                {NAV_LINKS.map(({ label, href, match }) => {
                  const isActive = pathname === match || pathname.startsWith(match + "/")
                  const Icon = LINK_ICONS[match]

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors"
                      style={
                        isActive
                          ? { backgroundColor: "#FDF0F0", color: "#C5527A", fontWeight: 700 }
                          : { color: "#8B5E52" }
                      }
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      {label}
                      {isActive && (
                        <span
                          className="ml-auto h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: "#C5527A" }}
                        />
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* Divider */}
              <div className="mx-4 shrink-0 border-t" style={{ borderColor: "#EDE3DB" }} />

              {/* CTA */}
              <div className="shrink-0 p-4">
                <Link
                  href="/resume-review#upload"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
                >
                  <FileText className="h-4 w-4" />
                  Analyze Resume
                </Link>
              </div>

              {/* Version tag */}
              <p className="shrink-0 pb-6 text-center text-[10px]" style={{ color: "#C4A99E" }}>
                AI Resume Builder
              </p>
            </div>
          </>,
          document.body,
        )}
    </>
  )
}
