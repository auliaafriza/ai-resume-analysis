"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function TrackPageView() {
  const pathname = usePathname()

  useEffect(() => {
    // Fire-and-forget: don't block render
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: pathname,
        referrer: document.referrer || "",
        ua: navigator.userAgent,
      }),
    }).catch(() => {
      // silently ignore tracking errors
    })
  }, [pathname])

  return null
}
