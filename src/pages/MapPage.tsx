import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, MapPin, MapPinOff, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../hooks/useReports'
import { REPORT_TYPES, SEVERITIES, typeMeta } from '../lib/constants'
import type { ReportStatus, ReportType, Severity } from '../lib/types'
import ReportMap, { MapLegend } from '../components/ReportMap'
import { PageHeader, Skeleton, chipClass, errorBox, ghostBtn } from '../components/ui'
import { SeverityBadge, StatusBadge } from '../components/Badges'
import { timeAgo } from '../lib/format'

const PUBLIC: ReportStatus[] = ['verified', 'responding', 'resolved']
const ADMIN_VISIBLE: ReportStatus[] = ['pending', 'verified', 'responding', 'resolved']

export default function MapPage() {
  const { isAdmin } = useAuth()
  const { reports, loading, error } = useReports({
    statuses: isAdmin ? ADMIN_VISIBLE : PUBLIC,
    live: true,
  })

  const [severity, setSeverity] = useState<Severity | 'all'>('all')
  const [type, setType] = useState<ReportType | 'all'>('all')
  const [hideResolved, setHideResolved] = useState(true)

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (severity === 'all' || r.severity === severity) &&
          (type === 'all' || r.type === type) &&
          (!hideResolved || r.status !== 'resolved'),
      ),
    [reports, severity, type, hideResolved],
  )

  return (
    <div>
      <PageHeader
        eyebrow="Live"
        title="Incident map"
        subtitle="Verified reports from your community. The map updates automatically when responders change a status."
        right={
          <Link to="/report" className={ghostBtn}>
            <Plus className="h-4 w-4" /> Report an incident
          </Link>
        }
      />

      <div className="mb-6 space-y-3 rounded-[2.5rem] bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          <button className={chipClass(severity === 'all')} onClick={() => setSeverity('all')}>
            All severity
          </button>
          {SEVERITIES.map((s) => (
            <button
              key={s.value}
              className={chipClass(severity === s.value)}
              onClick={() => setSeverity(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          <button className={chipClass(type === 'all')} onClick={() => setType('all')}>
            All types
          </button>
          {REPORT_TYPES.map((t) => {
            const Icon = t.icon
            return (
              <button key={t.value} className={chipClass(type === t.value)} onClick={() => setType(t.value)}>
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <MapLegend />
          <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wider">
            <input
              type="checkbox"
              checked={hideResolved}
              onChange={(e) => setHideResolved(e.target.checked)}
              className="h-4 w-4 accent-sky-500"
            />
            Hide resolved
          </label>
        </div>
      </div>

      {error && <div className={`mb-5 ${errorBox}`}>{error}</div>}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]" role="status" aria-label="Loading map">
          <Skeleton className="h-[26rem] !rounded-[3.5rem] lg:h-[40rem]" />
          <Skeleton className="hidden h-[40rem] !rounded-[3.5rem] lg:block" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <ReportMap reports={filtered} className="h-[26rem] sm:h-[32rem] lg:h-[40rem]" />

          <aside className="max-h-[32rem] space-y-3 overflow-y-auto rounded-[3.5rem] bg-white p-4 shadow-sm ring-1 ring-black/5 lg:max-h-[40rem] lg:p-5">
            <h2 className="px-3 pt-2 text-sm font-black uppercase tracking-widest text-slate-500">
              {filtered.length} incident{filtered.length === 1 ? '' : 's'}
            </h2>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
                <MapPinOff className="h-8 w-8 text-slate-300" />
                <p className="font-semibold text-slate-400">Nothing matches these filters.</p>
              </div>
            )}
            {filtered.map((r) => {
              const TypeIcon = typeMeta(r.type).icon
              return (
                <div
                  key={r.id}
                  className="rounded-[2rem] bg-slate-50 p-5 transition hover:bg-sky-50"
                >
                  <div className="flex flex-wrap gap-1.5">
                    <SeverityBadge severity={r.severity} />
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-3 flex items-start gap-2 font-black leading-tight">
                    <TypeIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                    <span>{r.title}</span>
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-400">
                    {r.barangay && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {r.barangay}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(r.created_at)}
                    </span>
                  </p>
                </div>
              )
            })}
          </aside>
        </div>
      )}
    </div>
  )
}
