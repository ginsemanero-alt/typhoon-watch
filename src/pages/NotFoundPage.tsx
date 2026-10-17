import { Link } from 'react-router-dom'
import { Tornado } from 'lucide-react'
import { EmptyState, primaryBtn } from '../components/ui'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={Tornado}
      title="That page blew away"
      hint="The page you are looking for does not exist."
      action={
        <Link to="/" className={primaryBtn}>
          Back to home
        </Link>
      }
    />
  )
}
