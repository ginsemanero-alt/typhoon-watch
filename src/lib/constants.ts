import { CloudLightning, Construction, LifeBuoy, MapPin, Mountain, TreePine, Waves, Wind, ZapOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AdvisoryKind, ReportStatus, ReportType, Severity } from './types'

/**
 * Default map view. This is San Jose, Occidental Mindoro.
 * Change it to your own municipality / city.
 */
export const MAP_CENTER: [number, number] = [12.3528, 121.0675]
export const MAP_ZOOM = 12

export const REPORT_TYPES: { value: ReportType; label: string; icon: LucideIcon }[] = [
  { value: 'typhoon_damage', label: 'Typhoon damage', icon: CloudLightning },
  { value: 'flood', label: 'Flooding', icon: Waves },
  { value: 'landslide', label: 'Landslide', icon: Mountain },
  { value: 'storm_surge', label: 'Storm surge', icon: Wind },
  { value: 'fallen_tree', label: 'Fallen tree / debris', icon: TreePine },
  { value: 'power_outage', label: 'Power outage', icon: ZapOff },
  { value: 'road_blocked', label: 'Road blocked', icon: Construction },
  { value: 'missing_stranded', label: 'Missing / stranded', icon: LifeBuoy },
  { value: 'other', label: 'Other', icon: MapPin },
]

export const typeMeta = (t: ReportType) =>
  REPORT_TYPES.find((x) => x.value === t) ?? REPORT_TYPES[REPORT_TYPES.length - 1]

export const SEVERITIES: { value: Severity; label: string; hint: string }[] = [
  { value: 'low', label: 'Low', hint: 'Minor, no immediate danger' },
  { value: 'moderate', label: 'Moderate', hint: 'Needs attention soon' },
  { value: 'high', label: 'High', hint: 'Serious, people affected' },
  { value: 'critical', label: 'Critical', hint: 'Life-threatening, urgent' },
]

export const SEVERITY_STYLE: Record<Severity, string> = {
  low: 'bg-emerald-500 text-white',
  moderate: 'bg-amber-400 text-amber-950',
  high: 'bg-orange-500 text-white',
  critical: 'bg-red-600 text-white',
}

export const SEVERITY_HEX: Record<Severity, string> = {
  low: '#10b981',
  moderate: '#f59e0b',
  high: '#f97316',
  critical: '#dc2626',
}

export const STATUSES: { value: ReportStatus; label: string }[] = [
  { value: 'pending', label: 'Pending review' },
  { value: 'verified', label: 'Verified' },
  { value: 'responding', label: 'Responding' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
]

export const STATUS_STYLE: Record<ReportStatus, string> = {
  pending: 'bg-slate-200 text-slate-700',
  verified: 'bg-sky-500 text-white',
  responding: 'bg-violet-600 text-white',
  resolved: 'bg-emerald-600 text-white',
  rejected: 'bg-rose-100 text-rose-700',
}

export const STATUS_HEX: Record<ReportStatus, string> = {
  pending: '#94a3b8',
  verified: '#0ea5e9',
  responding: '#7c3aed',
  resolved: '#059669',
  rejected: '#fb7185',
}

export const ADVISORY_KINDS: { value: AdvisoryKind; label: string }[] = [
  { value: 'typhoon', label: 'Typhoon' },
  { value: 'flood', label: 'Flood' },
  { value: 'general', label: 'General' },
]

/** Tropical Cyclone Wind Signal colors (1 = lowest, 5 = highest). */
export const SIGNAL_STYLE: Record<number, string> = {
  0: 'bg-slate-200 text-slate-700',
  1: 'bg-sky-500 text-white',
  2: 'bg-yellow-300 text-yellow-950',
  3: 'bg-orange-500 text-white',
  4: 'bg-red-600 text-white',
  5: 'bg-fuchsia-700 text-white',
}
