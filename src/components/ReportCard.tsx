import { Clock, MapPin } from 'lucide-react'
import type { Report } from '../lib/types'
import { typeMeta } from '../lib/constants'
import { timeAgo } from '../lib/format'
import { SeverityBadge, StatusBadge, TypeBadge } from './Badges'

export default function ReportCard({ report, footer }: { report: Report; footer?: React.ReactNode }) {
  const TypeIcon = typeMeta(report.type).icon

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[3.5rem] bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg">
      {report.photo_url ? (
        <img src={report.photo_url} alt={report.title} className="h-44 w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 text-sky-300">
          <TypeIcon className="h-16 w-16" strokeWidth={1.5} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-7">
        <div className="flex flex-wrap gap-2">
          <SeverityBadge severity={report.severity} />
          <TypeBadge type={report.type} />
          <StatusBadge status={report.status} />
        </div>
        <h3 className="mt-4 line-clamp-2 text-xl font-black leading-tight sm:text-2xl">{report.title}</h3>
        <p className="mt-2 line-clamp-3 min-h-[4.5rem] font-semibold text-slate-600">
          {report.description || 'No additional details provided.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {report.barangay || `${report.lat.toFixed(4)}, ${report.lng.toFixed(4)}`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {timeAgo(report.created_at)}
          </span>
        </div>
        {report.admin_notes && (
          <div className="mt-5 rounded-[2rem] bg-sky-50 px-5 py-4 text-sm font-semibold text-sky-900">
            <span className="mb-1 block text-xs font-black uppercase tracking-widest text-sky-600">
              Update from responders
            </span>
            {report.admin_notes}
          </div>
        )}
        {footer && <div className="mt-auto pt-5">{footer}</div>}
      </div>
    </article>
  )
}
