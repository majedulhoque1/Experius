import { useSubmissions, type Submission, type SubmissionStatus } from '@/hooks/useSubmissions'
import { StatusBadge } from '@/components/StatusBadge'

const TONE: Record<SubmissionStatus, 'blue' | 'amber' | 'gray'> = {
  new: 'blue',
  contacted: 'amber',
  closed: 'gray',
}

function business(s: Submission): string | null {
  const v = s.details?.business
  return typeof v === 'string' ? v : null
}

export function Submissions() {
  const { submissions, isLoading, setStatus, remove, convertToContact } = useSubmissions()

  return (
    <div>
      <div className="page-head">
        <h1>Submissions</h1>
        <p>Contact form + consultation requests.</p>
      </div>

      {isLoading ? (
        <div className="loading">Loading…</div>
      ) : submissions.length === 0 ? (
        <div className="empty">No submissions yet.</div>
      ) : (
        <div className="table-scroll">
          <table className="kit-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Type</th>
                <th>From</th>
                <th>Message</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td data-label="When" style={{ whiteSpace: 'nowrap', color: 'var(--ink-3)' }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td data-label="Type">{s.type}</td>
                  <td data-label="From">
                    <div>
                      <b>{s.name}</b>
                    </div>
                    <div style={{ color: 'var(--ink-3)', fontSize: '.8rem' }}>{s.email}{s.phone ? ` · ${s.phone}` : ''}</div>
                    {business(s) && <div style={{ color: 'var(--ink-3)', fontSize: '.8rem' }}>{business(s)}</div>}
                  </td>
                  <td data-label="Message" style={{ maxWidth: '22rem' }}>{s.message}</td>
                  <td data-label="Status">
                    <StatusBadge label={s.status} tone={TONE[s.status]} />
                  </td>
                  <td>
                    <div className="row-actions">
                      {s.status !== 'contacted' && (
                        <button className="btn small" onClick={() => setStatus({ id: s.id, status: 'contacted' })}>
                          Mark contacted
                        </button>
                      )}
                      {s.status !== 'closed' && (
                        <button className="btn small" onClick={() => setStatus({ id: s.id, status: 'closed' })}>
                          Close
                        </button>
                      )}
                      <button className="btn small" onClick={() => convertToContact(s)}>To CRM</button>
                      <button className="btn small danger" onClick={() => remove(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
