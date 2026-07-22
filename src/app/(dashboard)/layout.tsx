import type { ReactNode } from "react"

import Image from "next/image"
import Link from "next/link"

import { CurrentYear } from "@/components/CurrentYear"
import { MobileNav } from "@/components/MobileNav"
import { NavLinks } from "@/components/NavLinks"
import { TrackPageView } from "@/components/TrackPageView"
import { AppProvider } from "@/providers/AppProvider"
import { QueryProvider } from "@/providers/QueryProvider"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <QueryProvider>
        <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#FAF7F4" }}>
          {/* ── Nav ── */}
          <header
            className="sticky top-0 z-50 border-b backdrop-blur-md"
            style={{ backgroundColor: "#FAF7F4CC", borderColor: "#EDE3DB" }}
          >
            <div className="mx-auto flex min-h-10 max-w-6xl items-center justify-between px-6">
              {/* Logo — clearly visible on cream bg */}
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="AI Resume Builder"
                  width={260}
                  height={156}
                  className="h-[150px] w-auto bg-transparent object-contain"
                  priority
                />
              </Link>

              {/* Desktop nav links */}
              <NavLinks />

              {/* Right-side actions */}
              <div className="flex items-center gap-2">
                {/* Desktop CTA */}
                <Link
                  href="#upload"
                  className="hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 md:inline-flex"
                  style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
                >
                  Analyze Resume
                </Link>

                {/* Mobile hamburger — renders its own drawer */}
                <MobileNav />
              </div>
            </div>
          </header>

          <TrackPageView />

          {/* ── Page content ── */}
          <main className="flex-1">{children}</main>

          {/* ── Footer ── */}
          <footer className="border-t py-2" style={{ backgroundColor: "#FAF7F4", borderColor: "#EDE3DB" }}>
            <div className="mx-auto max-w-6xl px-6">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <Image
                  src="/logo.png"
                  alt="AI Resume Builder"
                  width={260}
                  height={150}
                  className="h-[100px] w-auto bg-transparent object-contain"
                  priority
                />
                <p className="text-xs" style={{ color: "#A07B6E" }}>
                  Powered by AI Builder Pluvia · © <CurrentYear /> AI Resume Builder. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </QueryProvider>
    </AppProvider>
  )
}
