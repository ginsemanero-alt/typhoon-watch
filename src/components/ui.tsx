import type { ReactNode } from 'react'
import { CloudSun, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const inputClass =
  'w-full rounded-full border-2 border-slate-200 bg-white px-6 py-3.5 font-semibold text-ink outline-none transition placeholder:font-medium placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'

export const textareaClass =
  'w-full rounded-[2rem] border-2 border-slate-200 bg-white px-6 py-4 font-semibold text-ink outline-none transition placeholder:font-medium placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'

export const primaryBtn =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-500 px-7 py-3 font-black text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'

export const darkBtn =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-7 py-3 font-black text-white transition hover:bg-storm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'

export const ghostBtn =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-2.5 font-black text-ink transition hover:border-ink active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'

/** Filter / segmented chip used on the map and admin pages. */
export const chipClass = (active: boolean) =>
  `inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition active:scale-95 ${
    active ? 'bg-ink text-white shadow' : 'bg-white text-slate-600 ring-1 ring-black/5 hover:bg-slate-100'
  }`

export const errorBox =
  'rounded-[2rem] bg-rose-50 px-6 py-4 font-bold text-rose-700 ring-1 ring-rose-200'

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 font-bold text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[2rem] bg-slate-200/70 ${className}`} />
}

/** Placeholder grid shown while report cards load. */
export function CardSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[3.5rem] bg-white shadow-sm ring-1 ring-black/5">
          <Skeleton className="h-44 !rounded-none" />
          <div className="space-y-3 p-8">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 !rounded-full" />
              <Skeleton className="h-6 w-24 !rounded-full" />
            </div>
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon = CloudSun,
  title,
  hint,
  action,
}: {
  icon?: LucideIcon
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-[3.5rem] border-2 border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center sm:px-8">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        <Icon className="h-8 w-8" />
      </span>
      <h3 className="mt-5 text-2xl font-black">{title}</h3>
      {hint && <p className="mx-auto mt-2 max-w-md font-semibold text-slate-500">{hint}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
      <div className="min-w-0">
        {eyebrow && (
          <span className="inline-block rounded-full bg-sky-100 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-sky-700">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl font-semibold text-slate-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-black tracking-tight sm:text-4xl">{title}</h2>
      {action}
    </div>
  )
}

export function StatCard({
  label,
  value,
  tone = 'bg-white text-ink',
  icon: Icon,
}: {
  label: string
  value: ReactNode
  tone?: string
  icon?: LucideIcon
}) {
  return (
    <div className={`rounded-[3.5rem] p-7 shadow-sm ring-1 ring-black/5 sm:p-8 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-widest opacity-75">{label}</span>
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className="mt-4 text-5xl font-black tracking-tight">{value}</div>
    </div>
  )
}

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3 px-2">
      <span className="text-sm font-black uppercase tracking-wider text-slate-600">{children}</span>
      {hint && <span className="text-xs font-semibold text-slate-400">{hint}</span>}
    </div>
  )
}
