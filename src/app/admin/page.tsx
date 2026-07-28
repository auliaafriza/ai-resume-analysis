"use client"

import { useEffect, useState } from "react"

import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Eye,
  Globe,
  Layout,
  Lock,
  Monitor,
  RefreshCw,
  Smartphone,
  TrendingUp,
  Users,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalVisits: number
  todayVisits: number
  weekVisits: number
  uniqueIPs: number
  topPages: { page: string; count: number }[]
  dailyChart: Record<string, number>
  topReferrers: { ref: string; count: number }[]
  browsers: { name: string; count: number }[]
  devices: { name: string; count: number }[]
  recent: {
    id: string
    timestamp: string
    page: string
    referrer: string
    ip: string
    browser: string
    device: string
  }[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })
}

function shortDay(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
}

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/resume-review": "Resume Review",
  "/create-resume": "Create Resume",
}

function pageName(p: string) {
  return PAGE_LABELS[p] ?? p
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  color: string
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: "#EDE3DB" }}>
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-xl p-2" style={{ backgroundColor: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value ? value.toLocaleString() : ""}</p>
      <p className="mt-0.5 text-xs text-gray-400">{sub ?? ""}</p>
    </div>
  )
}

function BarRow({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 truncate text-xs text-gray-600" title={label}>{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right text-xs font-semibold text-gray-700">{count}</span>
    </div>
  )
}

function MiniBarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
  const max = Math.max(...entries.map(([, v]) => v), 1)

  return (
    <div className="flex h-32 items-end gap-0.5 overflow-x-auto pb-1">
      {entries.map(([day, val]) => {
        const h = Math.max(4, Math.round((val / max) * 112))
        const isToday = day === new Date().toISOString().slice(0, 10)
        return (
          <div key={day} className="group relative flex flex-1 flex-col items-center justify-end gap-1" style={{ minWidth: 10 }}>
            <div
              className="w-full rounded-t transition-all"
              style={{
                height: h,
                backgroundColor: isToday ? "#C5527A" : "#E8856A55",
                minHeight: 4,
              }}
            />
            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded bg-gray-800 px-2 py-1 text-[10px] text-white shadow group-hover:block whitespace-nowrap z-10">
              {shortDay(day)}: {val}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Login screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const res = await fetch("/api/analytics", { headers: { "x-admin-password": pw } })
    setLoading(false)
    if (res.ok) onLogin(pw)
    else setError(true)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6" style={{ backgroundColor: "#FAF7F4" }}>
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-2xl p-4 shadow-sm" style={{ background: "linear-gradient(135deg, #E8856A, #C5527A)" }}>
          <Lock className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Admin Analytics</h1>
        <p className="text-sm text-gray-500">Masukkan password untuk lanjut</p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <input
          type="password"
          placeholder="Admin password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40"
          autoFocus
        />
        {error && <p className="text-center text-xs text-red-500">Password salah. Coba lagi.</p>}
        <button
          type="submit"
          disabled={loading || !pw}
          className="rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #E8856A 0%, #D4697A 50%, #C5527A 100%)" }}
        >
          {loading ? "Checking…" : "Masuk"}
        </button>
      </form>
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchData = async (pw: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/analytics", { headers: { "x-admin-password": pw } })
      if (res.ok) {
        setData(await res.json())
        setLastRefresh(new Date())
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (pw: string) => {
    setPassword(pw)
    fetchData(pw)
  }

  // Auto-refresh every 60s
  useEffect(() => {
    if (!password) return
    const id = setInterval(() => fetchData(password), 60_000)
    return () => clearInterval(id)
  }, [password])

  if (!password) return <LoginScreen onLogin={handleLogin} />

  const accent = "#C5527A"
  const coral = "#E8856A"

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF7F4" }}>
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 shadow-sm" style={{ borderColor: "#EDE3DB" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2" style={{ background: "linear-gradient(135deg, #E8856A, #C5527A)" }}>
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Traffic Analytics</h1>
              <p className="text-xs text-gray-400">
                {lastRefresh ? `Refreshed ${lastRefresh.toLocaleTimeString("id-ID")}` : "Loading…"}
              </p>
            </div>
          </div>
          <button
            onClick={() => password && fetchData(password)}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {!data ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-rose-400" />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Eye} label="Total Kunjungan" value={data?.totalVisits ?? 0} sub="Semua waktu" color={accent} />
            <StatCard icon={Calendar} label="Hari Ini" value={data?.todayVisits ?? 0} sub={new Date().toLocaleDateString("id-ID")} color={coral} />
            <StatCard icon={TrendingUp} label="7 Hari Terakhir" value={data?.weekVisits ?? 0} sub="Kunjungan minggu ini" color="#0F766E" />
            <StatCard icon={Users} label="Unique Visitors" value={data?.uniqueIPs ?? 0} sub="Berdasarkan IP" color="#7C3AED" />
          </div>

          {/* ── Daily chart ── */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#EDE3DB" }}>
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-gray-800">Kunjungan 30 Hari Terakhir</h2>
              <span className="ml-auto text-xs text-gray-400">
                <span className="inline-block mr-1 h-2 w-3 rounded-full" style={{ backgroundColor: accent }} /> Hari ini
                <span className="ml-3 inline-block mr-1 h-2 w-3 rounded-full" style={{ backgroundColor: "#E8856A55" }} /> Lainnya
              </span>
            </div>
            <MiniBarChart data={data?.dailyChart} />
            {/* X-axis labels: show every ~5th */}
            <div className="mt-1 flex overflow-x-auto">
              {Object.keys(data?.dailyChart || {}).map((day, i) => (
                <div key={day} className="flex-1 text-center" style={{ minWidth: 10 }}>
                  {i % 5 === 0 && (
                    <span className="text-[9px] text-gray-400">{new Date(day).getDate()}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Pages + Referrers ── */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#EDE3DB" }}>
              <div className="mb-4 flex items-center gap-2">
                <Layout className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-gray-800">Top Halaman</h2>
              </div>
              <div className="space-y-3">
                {data?.topPages.length === 0
                  ? <p className="text-xs text-gray-400">Belum ada data.</p>
                  : data.topPages.map((p) => (
                      <BarRow
                        key={p.page}
                        label={pageName(p.page)}
                        count={p.count}
                        max={data.topPages[0]?.count ?? 1}
                        color={accent}
                      />
                    ))
                }
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#EDE3DB" }}>
              <div className="mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-gray-800">Top Referrers</h2>
              </div>
              <div className="space-y-3">
                {data?.topReferrers?.length === 0
                  ? <p className="text-xs text-gray-400">Tidak ada referrer (direct traffic).</p>
                  : data?.topReferrers.map((r) => (
                      <BarRow
                        key={r.ref}
                        label={r.ref}
                        count={r.count}
                        max={data.topReferrers[0]?.count ?? 1}
                        color={coral}
                      />
                    ))
                }
              </div>
            </div>
          </div>

          {/* ── Browser + Device ── */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#EDE3DB" }}>
              <div className="mb-4 flex items-center gap-2">
                <Monitor className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-gray-800">Browser</h2>
              </div>
              <div className="space-y-3">
                {data?.browsers && data?.browsers.length ? data?.browsers.map((b) => (
                  <BarRow
                    key={b.name}
                    label={b.name}
                    count={b.count}
                    max={data.browsers[0]?.count ?? 1}
                    color="#0F766E"
                  />
                )) : null}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#EDE3DB" }}>
              <div className="mb-4 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-gray-800">Device</h2>
              </div>
              <div className="space-y-3">
                {data.devices.map((d) => (
                  <BarRow
                    key={d.name}
                    label={d.name}
                    count={d.count}
                    max={data.devices[0]?.count ?? 1}
                    color="#7C3AED"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Recent visits table ── */}
          <div className="rounded-2xl border bg-white shadow-sm" style={{ borderColor: "#EDE3DB" }}>
            <div className="flex items-center gap-2 border-b px-6 py-4" style={{ borderColor: "#EDE3DB" }}>
              <Clock className="h-4 w-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-gray-800">Kunjungan Terbaru</h2>
              <span className="ml-auto text-xs text-gray-400">{data.recent.length} entri</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50 text-left" style={{ borderColor: "#EDE3DB" }}>
                    <th className="px-4 py-3 font-semibold text-gray-500">Waktu</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Halaman</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Browser</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Device</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">IP</th>
                    <th className="px-4 py-3 font-semibold text-gray-500">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recent.map((v) => (
                    <tr key={v.id} className="hover:bg-rose-50/30">
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-400">{formatDate(v.timestamp)}</td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 font-medium text-rose-700">
                          {pageName(v.page)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{v.browser}</td>
                      <td className="px-4 py-2.5 text-gray-600">{v.device}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-400">{v.ip}</td>
                      <td className="max-w-[180px] truncate px-4 py-2.5 text-gray-400">{v.referrer || "—"}</td>
                    </tr>
                  ))}
                  {data.recent.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        Belum ada kunjungan tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
