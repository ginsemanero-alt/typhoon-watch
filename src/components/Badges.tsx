import type { ReportStatus, ReportType, Severity } from '../lib/types'
import { SEVERITIES, SEVERITY_STYLE, SIGNAL_STYLE, STATUSES, STATUS_STYLE, typeMeta } from '../lib/constants'

const base =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider'

export function SeverityBadge({ severity }: { severity: Severity }) {
  const label = SEVERITIES.find((s) => s.value === severity)?.label ?? severity
  return (
    <span className={`${base} ${SEVERITY_STYLE[severity]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  )
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const label = STATUSES.find((s) => s.value === status)?.label ?? status
  return <span className={`${base} ${STATUS_STYLE[status]}`}>{label}</span>
}

export function TypeBadge({ type }: { type: ReportType }) {
  const m = typeMeta(type)
  const Icon = m.icon
  return (
    <span className={`${base} bg-ink/90 text-white`}>
      <Icon className="h-3.5 w-3.5" />
      {m.label}
    </span>
  )
}

export function SignalBadge({ level }: { level: number | null }) {
  if (level === null || level === undefined) return null
  return (
    <span className={`${base} ${SIGNAL_STYLE[level] ?? SIGNAL_STYLE[0]}`}>
      {level === 0 ? 'No signal' : `Wind Signal #${level}`}
    </span>
  )
}
