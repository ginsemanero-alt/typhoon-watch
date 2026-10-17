import { CloudLightning, Droplets, Megaphone } from 'lucide-react'
import type { Advisory } from '../lib/types'
import { formatDateTime } from '../lib/format'
import { SignalBadge } from './Badges'

const kindIcon = {
  typhoon: CloudLightning,
  flood: Droplets,
  general: Megaphone,
}

const kindTone = {
  typhoon: 'bg-ink text-white',
  flood: 'bg-sky-600 text-white',
  general: 'bg-white text-ink ring-1 ring-black/5',
}

export default function AdvisoryCard({ advisory, actions }: { advisory: Advisory; actions?: React.ReactNode }) {
  const Icon = kindIcon[advisory.kind]
  const dark = advisory.kind !== 'general'

  return (
    <article className={`rounded-[3.5rem] p-8 shadow-sm sm:p-10 ${kindTone[advisory.kind]}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            dark ? 'bg-white/15' : 'bg-sky-100 text-sky-700'
          }`}
        >
          <Icon className="h-6 w-6" />
        </span>
        <span
          className={`rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider ${
            dark ? 'bg-white/15' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {advisory.kind}
        </span>
        {advisory.kind === 'typhoon' && <SignalBadge level={advisory.signal_level} />}
        {!advisory.is_active && (
          <span className="rounded-full bg-slate-400 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white">
            Archived
          </span>
        )}
      </div>
      <h3 className="mt-5 text-2xl font-black leading-tight sm:text-3xl">{advisory.title}</h3>
      {advisory.body && (
        <p className={`mt-3 whitespace-pre-line font-semibold ${dark ? 'text-white/80' : 'text-slate-600'}`}>
          {advisory.body}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className={`text-xs font-bold ${dark ? 'text-white/60' : 'text-slate-400'}`}>
          Posted {formatDateTime(advisory.created_at)}
        </span>
        {actions}
      </div>
    </article>
  )
}
