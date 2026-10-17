import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, FileText, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../hooks/useReports'
import { supabase } from '../lib/supabase'
import ReportCard from '../components/ReportCard'
import { CardSkeletons, EmptyState, PageHeader, errorBox, ghostBtn, primaryBtn } from '../components/ui'

export default function MyReportsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const submitted = Boolean((location.state as { submitted?: boolean } | null)?.submitted)
  const { reports, loading, error, reload } = useReports({ mineOf: user?.id, enabled: Boolean(user), live: true })

  const remove = async (id: string) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return
    const { error: err } = await supabase.from('reports').delete().eq('id', id)
    if (err) window.alert(err.message)
    else void reload()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Your activity"
        title="My reports"
        subtitle="Track the review status of everything you have reported."
        right={
          <Link to="/report" className={primaryBtn}>
            <Plus className="h-5 w-5" /> New report
          </Link>
        }
      />

      {submitted && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-[2.5rem] bg-emerald-50 px-6 py-5 font-bold text-emerald-800 ring-1 ring-emerald-200"
        >
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
          <span>Report sent. A responder will review it soon. You can follow its status here.</span>
        </div>
      )}

      {error && <div className={`mb-5 ${errorBox}`}>{error}</div>}

      {loading ? (
        <CardSkeletons />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="You have not reported anything yet"
          hint="If something is happening near you, send a report so responders can act."
          action={
            <Link to="/report" className={primaryBtn}>
              Report an incident
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              footer={
                r.status === 'pending' ? (
                  <button onClick={() => remove(r.id)} className={`${ghostBtn} w-full text-rose-600`}>
                    <Trash2 className="h-4 w-4" /> Delete pending report
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
