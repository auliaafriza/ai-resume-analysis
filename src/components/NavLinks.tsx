"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { label: "How it works", href: "/resume-review#how-it-works", match: "/resume-review" },
  { label: "Features", href: "/resume-review#features", match: "/resume-review" },
  { label: "Create Resume", href: "/create-resume", match: "/create-resume" },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {LINKS.map(({ label, href, match }) => {
        const isActive = pathname === match || pathname.startsWith(match + "/")
        return (
          <Link
            key={href}
            href={href}
            className="text-sm transition-colors"
            style={{
              color: "#8B5E52",
              fontWeight: isActive ? 700 : 400,
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
