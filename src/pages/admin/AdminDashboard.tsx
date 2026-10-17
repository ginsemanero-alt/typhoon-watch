import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, CheckCircle2, ClipboardList, Hourglass, Siren } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useReports } from '../../hooks/useReports'
import { REPORT_TYPES, SEVERITIES, SEVERITY_HEX, STATUSES, STATUS_HEX } from '../../lib/constants'
import { PageHeader, Skeleton, StatCard } from '../../components/ui'

function ChartCard({ title, children, empty }: { title: string; children: ReactNode; empty?: boolean }) {
  return (
    <section className="rounded-[3.5rem] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10">
      <h2 className="mb-5 text-xl font-black tracking-tight">{title}</h2>
      <div className="h-72">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[2rem] bg-slate-50 text-slate-400">
            <BarChart3 className="h-8 w-8" />
            <p className="text-sm font-bold">No data yet</p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  )
}

const tooltipStyle = {
  borderRadius: 20,
  border: 'none',
  boxShadow: '0 10px 30px rgba(11,31,58,0.18)',
  fontWeight: 700,
}

export default function AdminDashboard() {
  const { reports, loading } = useReports({ live: true })

  const stats = useMemo(() => {
    const pending = reports.filter((r) => r.status === 'pending').length
    const resolved = reports.filter((r) => r.status === 'resolved').length
    const openCritical = reports.filter(
      (r) => r.severity === 'critical' && !['resolved', 'rejected'].includes(r.status),
    ).length
    const handled = reports.filter((r) => r.status !== 'rejected').length
    const rate = handled === 0 ? 0 : Math.round((resolved / handled) * 100)
    return { total: reports.length, pending, resolved, openCritical, rate }
  }, [reports])

  const byType = useMemo(
    () =>
      REPORT_TYPES.map((t) => ({
        name: t.label,
        count: reports.filter((r) => r.type === t.value).length,
      }))
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count),
    [reports],
  )

  const byStatus = useMemo(
    () =>
      STATUSES.map((s) => ({
        name: s.label,
        value: reports.filter((r) => r.status === s.value).length,
        color: STATUS_HEX[s.value],
      })).filter((d) => d.value > 0),
    [reports],
  )

  const bySeverity = useMemo(
    () =>
      SEVERITIES.map((s) => ({
        name: s.label,
        count: reports.filter((r) => r.severity === s.value).length,
        color: SEVERITY_HEX[s.value],
      })),
    [reports],
  )

  const byBarangay = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of reports) {
      const key = r.barangay.trim() || 'Unspecified'
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [reports])

  const trend = useMemo(() => {
    const days: { key: string; label: string; count: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      days.push({
        key: d.toDateString(),
        label: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
        count: 0,
      })
    }
    for (const r of reports) {
      const k = new Date(r.created_at).toDateString()
      const slot = days.find((d) => d.key === k)
      if (slot) slot.count += 1
    }
    return days
  }, [reports])

  if (loading)
    return (
      <div className="space-y-8" role="status" aria-label="Loading dashboard">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 !rounded-[3.5rem]" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 !rounded-[3.5rem]" />
          ))}
        </div>
      </div>
    )

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Live numbers from every report submitted to your area."
        right={
          stats.pending > 0 ? (
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-black text-amber-950 shadow-lg shadow-amber-400/40 transition hover:bg-amber-300 active:scale-95"
            >
              {stats.pending} waiting for review <ArrowRight className="h-4 w-4" />
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total reports" value={stats.total} tone="bg-ink text-white" icon={ClipboardList} />
        <StatCard label="Needs review" value={stats.pending} tone="bg-amber-400 text-amber-950" icon={Hourglass} />
        <StatCard label="Open critical" value={stats.openCritical} tone="bg-red-600 text-white" icon={Siren} />
        <StatCard label="Resolution rate" value={`${stats.rate}%`} tone="bg-emerald-600 text-white" icon={CheckCircle2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Reports in the last 14 days">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700 }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 700 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="count"
                name="Reports"
                stroke="#0ea5e9"
                strokeWidth={4}
                fill="url(#trendFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By status" empty={byStatus.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={3}
                stroke="none"
              >
                {byStatus.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By incident type" empty={byType.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byType} layout="vertical" margin={{ left: 20, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fontWeight: 700 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 11, fontWeight: 700 }}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="count" name="Reports" fill="#0b1f3a" radius={[0, 16, 16, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By severity">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySeverity} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 800 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 700 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="count" name="Reports" radius={[16, 16, 0, 0]}>
                {bySeverity.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard title="Most affected barangays" empty={byBarangay.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBarangay} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="count" name="Reports" fill="#0ea5e9" radius={[16, 16, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
