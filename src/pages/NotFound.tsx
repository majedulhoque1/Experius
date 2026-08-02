import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'

export default function NotFound() {
  return (
    <PageHeader
      label="404"
      title="That page isn't part of the system."
      lead="The link may be old, or the page may have moved."
    >
      <Link to="/" className="type-label link-underline mt-9 inline-block text-ink">
        Back to the beginning
      </Link>
    </PageHeader>
  )
}
