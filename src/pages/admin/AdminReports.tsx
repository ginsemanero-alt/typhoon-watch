import { useMemo, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Inbox,
  Loader2,
  MapPin,
  Phone,
  Save,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { useReports } from '../../hooks/useReports'
import { supabase } from '../../lib/supabase'
import { STATUSES, STATUS_STYLE, typeMeta } from '../../lib/constants'
import { downloadCsv, formatDateTime } from '../../lib/format'
import type { Report, ReportStatus } from '../../lib/types'
import { SeverityBadge, StatusBadge, TypeBadge } from '../../components/Badges'
import {
  CardSkeletons,
  EmptyState,
  PageHeader,
  chipClass,
  darkBtn,
  errorBox,
  ghostBtn,
  inputClass,
  primaryBtn,
  textareaClass,
} from '../../components/ui'

function ReportRow({ report, onChanged }: { report: Report; onChanged: () => void }) {
  const [open, setOpen] = useState(report.status === 'pending')
  const [status, setStatus] = useState<ReportStatus>(report.status)
  const [notes, setNotes] = useState(report.admin_notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = status !== report.status || notes.trim() !== (report.admin_notes ?? '')
  const TypeIcon = typeMeta(report.type).icon

  const save = async (nextStatus: ReportStatus = status) => {
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('reports')
      .update({ status: nextStatus, admin_notes: notes.trim() || null })
      .eq('id', report.id)
    setSaving(false)
    if (err) return setError(err.message)
    setStatus(nextStatus)
    onChanged()
  }

  const remove = async () => {
    if (!window.confirm('Permanently delete this report?')) return
    const { error: err } = await supabase.from('reports').delete().eq('id', report.id)
    if (err) return setError(err.message)
    onChanged()
  }

  return (
    <article className="overflow-hidden rounded-[3.5rem] bg-white shadow-sm ring-1 ring-black/5">
      <div className="grid gap-0 md:grid-cols-[14rem_1fr]">
        {report.photo_url ? (
          <img src={report.photo_url} alt={report.title} className="h-48 w-full object-cover md:h-full" loading="lazy" />
        ) : (
          <div className="flex h-32 items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 text-sky-300 md:h-full">
            <TypeIcon className="h-14 w-14" strokeWidth={1.5} />
          </div>
        )}

        <div className="p-6 sm:p-9">
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={report.severity} />
            <TypeBadge type={report.type} />
            <StatusBadge status={report.status} />
          </div>
          <h3 className="mt-3 text-xl font-black leading-tight sm:text-2xl">{report.title}</h3>
          {report.description && <p className="mt-2 font-semibold text-slate-600">{report.description}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {formatDateTime(report.created_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {report.profiles?.full_name || 'Unknown'}
            </span>
            {report.profiles?.phone && (
              <a href={`tel:${report.profiles.phone}`} className="inline-flex items-center gap-1.5 text-sky-700 hover:underline">
                <Phone className="h-3.5 w-3.5" /> {report.profiles.phone}
              </a>
            )}
            <a
              href={`https://www.openstreetmap.org/?mlat=${report.lat}&mlon=${report.lng}#map=17/${report.lat}/${report.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-700 hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" />
              {report.barangay || `${report.lat.toFixed(4)}, ${report.lng.toFixed(4)}`}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {report.status === 'pending' && (
              <>
                <button onClick={() => save('verified')} disabled={saving} className={primaryBtn}>
                  <Check className="h-4 w-4" /> Verify
                </button>
                <button onClick={() => save('rejected')} disabled={saving} className={`${ghostBtn} text-rose-600`}>
                  <X className="h-4 w-4" /> Reject
                </button>
              </>
            )}
            <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className={ghostBtn}>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {open ? 'Hide' : 'Manage'}
            </button>
          </div>

          {open && (
            <div className="mt-6 space-y-5 rounded-[2.5rem] bg-slate-50 p-5 sm:p-6">
              <div>
                <span className="mb-2 block px-2 text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      aria-pressed={status === s.value}
                      onClick={() => setStatus(s.value)}
                      className={`min-h-10 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition active:scale-95 ${
                        status === s.value ? `${STATUS_STYLE[s.value]} ring-4 ring-ink/10` : 'bg-white text-slate-500 ring-1 ring-black/5 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-2 block px-2 text-xs font-black uppercase tracking-widest text-slate-500">
                  Update shown to the reporter
                </span>
                <textarea
                  className={textareaClass}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Rescue team dispatched. Please stay on higher ground."
                />
              </div>
              {error && <p className="px-2 text-sm font-bold text-rose-600">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => save()} disabled={!dirty || saving} className={darkBtn}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save changes
                </button>
                <button onClick={remove} className={`${ghostBtn} text-rose-600`}>
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default function AdminReports() {
  const { reports, loading, error, reload } = useReports({ live: true })
  const [filter, setFilter] = useState<ReportStatus | 'all'>('pending')
  const [query, setQuery] = useState('')

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reports.length }
    for (const r of reports) c[r.status] = (c[r.status] ?? 0) + 1
    return c
  }, [reports])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reports.filter(
      (r) =>
        (filter === 'all' || r.status === filter) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.barangay.toLowerCase().includes(q) ||
          (r.profiles?.full_name ?? '').toLowerCase().includes(q)),
    )
  }, [reports, filter, query])

  const exportCsv = () =>
    downloadCsv(
      `typhoonwatch-reports-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((r) => ({
        id: r.id,
        date: r.created_at,
        type: typeMeta(r.type).label,
        severity: r.severity,
        status: r.status,
        title: r.title,
        description: r.description,
        barangay: r.barangay,
        latitude: r.lat,
        longitude: r.lng,
        reporter: r.profiles?.full_name ?? '',
        phone: r.profiles?.phone ?? '',
        responder_notes: r.admin_notes,
      })),
    )

  return (
    <div>
      <PageHeader
        eyebrow="Moderation"
        title="Reports"
        subtitle="Review new reports, verify them so they appear on the public map, and post updates."
        right={
          <button onClick={exportCsv} disabled={filtered.length === 0} className={ghostBtn}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="mb-6 space-y-4 rounded-[2.5rem] bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputClass} !pl-13`}
            placeholder="Search title, details, barangay or reporter…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          <button className={chipClass(filter === 'all')} onClick={() => setFilter('all')}>
            All ({counts.all ?? 0})
          </button>
          {STATUSES.map((s) => (
            <button key={s.value} className={chipClass(filter === s.value)} onClick={() => setFilter(s.value)}>
              {s.label} ({counts[s.value] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {error && <div className={`mb-5 ${errorBox}`}>{error}</div>}

      {loading ? (
        <CardSkeletons count={2} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing here" hint="No reports match this filter." />
      ) : (
        <div className="space-y-5">
          {filtered.map((r) => (
            <ReportRow key={r.id} report={r} onChanged={() => void reload()} />
          ))}
        </div>
      )}
    </div>
  )
}
