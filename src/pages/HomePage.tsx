import { Link } from 'react-router-dom'
import { Activity, ArrowRight, Camera, CheckCircle2, CloudSun, MapPinned, ShieldCheck, Siren } from 'lucide-react'
import { useReports } from '../hooks/useReports'
import { useAdvisories } from '../hooks/useAdvisories'
import AdvisoryCard from '../components/AdvisoryCard'
import ReportCard from '../components/ReportCard'
import { CardSkeletons, EmptyState, SectionHeading, StatCard } from '../components/ui'

const PUBLIC_STATUSES = ['verified', 'responding', 'resolved'] as const

const STEPS = [
  {
    icon: Camera,
    title: 'Snap and describe',
    text: 'Choose the type of incident, add a photo and tell us what is happening.',
    tone: 'bg-sky-100 text-sky-700',
  },
  {
    icon: MapPinned,
    title: 'Pin the location',
    text: 'Use your phone GPS or tap the map so responders know exactly where to go.',
    tone: 'bg-amber-100 text-amber-800',
  },
  {
    icon: ShieldCheck,
    title: 'Verified and tracked',
    text: 'Local responders review the report, then post updates until it is resolved.',
    tone: 'bg-emerald-100 text-emerald-800',
  },
]

export default function HomePage() {
  const { reports, loading } = useReports({ statuses: [...PUBLIC_STATUSES], live: true })
  const { advisories } = useAdvisories()

  const active = reports.filter((r) => r.status !== 'resolved')
  const critical = active.filter((r) => r.severity === 'critical' || r.severity === 'high').length
  const resolved = reports.filter((r) => r.status === 'resolved').length
  const topAdvisory = advisories.find((a) => a.kind === 'typhoon') ?? advisories[0]

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-ink via-storm to-sky-700 px-6 py-12 text-white shadow-2xl sm:px-14 sm:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-widest">
            <span className="pulse-dot relative h-2 w-2 rounded-full bg-emerald-400 text-emerald-400" />
            Live community reporting
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            See it. <span className="text-sky-300">Report it.</span> Get help faster.
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold text-sky-100/90 sm:text-lg">
            Report typhoon damage, flooding and stranded families with a photo and your exact location.
            Responders verify each report and keep its status up to date.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/report"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-red-600 px-8 py-3 text-base font-black shadow-lg shadow-red-600/40 transition hover:bg-red-500 active:scale-95 sm:text-lg"
            >
              <Siren className="h-5 w-5" /> Report an incident
            </Link>
            <Link
              to="/map"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white/15 px-8 py-3 text-base font-black backdrop-blur transition hover:bg-white/25 active:scale-95 sm:text-lg"
            >
              <MapPinned className="h-5 w-5" /> View live map
            </Link>
          </div>
        </div>
      </section>

      {/* Top advisory */}
      {topAdvisory && (
        <section>
          <AdvisoryCard advisory={topAdvisory} />
          <div className="mt-3 text-right">
            <Link
              to="/advisories"
              className="inline-flex items-center gap-1 text-sm font-black text-sky-700 hover:underline"
            >
              All advisories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="grid gap-5 sm:grid-cols-3" aria-label="Current numbers">
        <StatCard
          label="Active incidents"
          value={loading ? '–' : active.length}
          tone="bg-ink text-white"
          icon={Activity}
        />
        <StatCard
          label="High / critical"
          value={loading ? '–' : critical}
          tone="bg-red-600 text-white"
          icon={Siren}
        />
        <StatCard
          label="Resolved"
          value={loading ? '–' : resolved}
          tone="bg-emerald-600 text-white"
          icon={CheckCircle2}
        />
      </section>

      {/* How it works */}
      <section>
        <SectionHeading title="How it works" />
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text, tone }, i) => (
            <div key={title} className="rounded-[3.5rem] bg-white p-8 shadow-sm ring-1 ring-black/5 sm:p-9">
              <div className="flex items-center justify-between">
                <span className={`flex h-14 w-14 items-center justify-center rounded-full ${tone}`}>
                  <Icon className="h-7 w-7" />
                </span>
                <span className="text-5xl font-black text-slate-100">{i + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-2 font-semibold text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent reports */}
      <section>
        <SectionHeading
          title="Latest verified reports"
          action={
            <Link
              to="/map"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-black text-sky-700 hover:underline"
            >
              See on map <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        {loading ? (
          <CardSkeletons />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={CloudSun}
            title="No verified incidents right now"
            hint="When residents report problems and responders verify them, they will show up here."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.slice(0, 6).map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
