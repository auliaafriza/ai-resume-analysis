import type { NextRequest} from "next/server";
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import type { VisitEntry } from "@/app/api/track/route"

const DATA_FILE = path.join(process.cwd(), "data", "analytics.json")

async function readData(): Promise<VisitEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8")
    return JSON.parse(raw) as VisitEntry[]
  } catch {
    return []
  }
}

function parseUA(ua: string) {
  const lower = ua.toLowerCase()
  let browser = "Other"
  let device = "Desktop"

  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    device = "Mobile"
  } else if (lower.includes("tablet") || lower.includes("ipad")) {
    device = "Tablet"
  }

  if (lower.includes("chrome") && !lower.includes("edge") && !lower.includes("opr")) browser = "Chrome"
  else if (lower.includes("firefox")) browser = "Firefox"
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari"
  else if (lower.includes("edge")) browser = "Edge"
  else if (lower.includes("opr") || lower.includes("opera")) browser = "Opera"

  return { browser, device }
}

function groupByDay(entries: VisitEntry[], days: number) {
  const result: Record<string, number> = {}
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    result[d.toISOString().slice(0, 10)] = 0
  }
  for (const e of entries) {
    const day = e.timestamp.slice(0, 10)
    if (day in result) result[day] = (result[day] ?? 0) + 1
  }
  return result
}

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password") ?? ""
  const expectedPw = process.env.ADMIN_PASSWORD ?? "admin123"
  if (password !== expectedPw) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const entries = await readData()
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)

  // ── Aggregates ──────────────────────────────────────────────────────────────

  const totalVisits = entries.length

  const todayVisits = entries.filter((e) => e.timestamp.startsWith(todayStr)).length

  const weekVisits = entries.filter((e) => new Date(e.timestamp) >= weekAgo).length

  const uniqueIPs = new Set(entries.map((e) => e.ip)).size

  // Page breakdown
  const pageCount: Record<string, number> = {}
  for (const e of entries) pageCount[e.page] = (pageCount[e.page] ?? 0) + 1
  const topPages = Object.entries(pageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }))

  // Daily chart — last 30 days
  const dailyChart = groupByDay(entries, 30)

  // Referrers
  const refCount: Record<string, number> = {}
  for (const e of entries) {
    if (!e.referrer) continue
    const host = (() => { try { return new URL(e.referrer).hostname } catch { return e.referrer } })()
    refCount[host] = (refCount[host] ?? 0) + 1
  }
  const topReferrers = Object.entries(refCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([ref, count]) => ({ ref, count }))

  // Browsers & devices
  const browserCount: Record<string, number> = {}
  const deviceCount: Record<string, number> = {}
  for (const e of entries) {
    const { browser, device } = parseUA(e.ua)
    browserCount[browser] = (browserCount[browser] ?? 0) + 1
    deviceCount[device] = (deviceCount[device] ?? 0) + 1
  }
  const browsers = Object.entries(browserCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))
  const devices = Object.entries(deviceCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  // Recent visits (last 50)
  const recent = entries.slice(0, 50).map((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    page: e.page,
    referrer: e.referrer,
    ip: e.ip.replace(/\.\d+$/, ".***"), // mask last octet
    ...parseUA(e.ua),
  }))

  return NextResponse.json({
    totalVisits,
    todayVisits,
    weekVisits,
    uniqueIPs,
    topPages,
    dailyChart,
    topReferrers,
    browsers,
    devices,
    recent,
  })
}
