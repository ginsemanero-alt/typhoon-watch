import { Radio } from 'lucide-react'
import { useAdvisories } from '../hooks/useAdvisories'
import AdvisoryCard from '../components/AdvisoryCard'
import { EmptyState, PageHeader, Skeleton, errorBox } from '../components/ui'

export default function AdvisoriesPage() {
  const { advisories, loading, error } = useAdvisories()

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Official updates"
        title="Advisories"
        subtitle="Typhoon wind signals, flood warnings and announcements posted by local responders."
      />

      {error && <div className={`mb-5 ${errorBox}`}>{error}</div>}

      {loading ? (
        <div className="space-y-5" role="status" aria-label="Loading">
          <Skeleton className="h-56 !rounded-[3.5rem]" />
          <Skeleton className="h-56 !rounded-[3.5rem]" />
        </div>
      ) : advisories.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No active advisories"
          hint="You will see typhoon signals and warnings here as soon as responders post them."
        />
      ) : (
        <div className="space-y-5">
          {advisories.map((a) => (
            <AdvisoryCard key={a.id} advisory={a} />
          ))}
        </div>
      )}
    </div>
  )
}
