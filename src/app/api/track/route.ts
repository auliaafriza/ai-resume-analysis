import type { NextRequest} from "next/server";
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"

const DATA_FILE = path.join(process.cwd(), "data", "analytics.json")
const MAX_ENTRIES = 10_000 // cap file size

export interface VisitEntry {
  id: string
  timestamp: string
  page: string
  referrer: string
  ua: string
  ip: string
}

async function readData(): Promise<VisitEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8")
    return JSON.parse(raw) as VisitEntry[]
  } catch {
    return []
  }
}

async function writeData(entries: VisitEntry[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { page, referrer, ua } = body as { page?: string; referrer?: string; ua?: string }

    if (!page) return NextResponse.json({ ok: false }, { status: 400 })

    // Skip admin pings
    if (page.startsWith("/admin")) return NextResponse.json({ ok: true })

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown"

    const entry: VisitEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      page,
      referrer: referrer ?? "",
      ua: ua ?? "",
      ip,
    }

    const entries = await readData()
    entries.unshift(entry)
    if (entries.length > MAX_ENTRIES) entries.splice(MAX_ENTRIES)
    await writeData(entries)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
