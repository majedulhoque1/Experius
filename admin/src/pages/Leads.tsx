import { Link } from 'react-router-dom'
import { useExaminations, type Examination } from '@/hooks/useExaminations'
import { StatusBadge } from '@/components/StatusBadge'

/*
  The list is a triage surface — who is waiting, how bad, how warm. Everything
  that takes more than a glance lives on the lead's own page rather than in a
  modal, so it can be linked, bookmarked and kept open during the call.
*/

const SEVERITY_TONE: Record<Examination['severity'], 'blue' | 'amber' | 'gray' | 'red'> = {
  mild: 'gray',
  moderate: 'blue',
  serious: 'amber',
  critical: 'red',
}

export function Leads() {
  const { examinations, isLoading, markHandled } = useExaminations()
  const waiting = examinations.filter((e) => !e.handled_at).length

  return (
    <div>
      <div className="page-head">
        <h1>Leads</h1>
        <p>
          Completed leak maps — every one of these gave a name and email to get it.
          {waiting > 0 && ` ${waiting} not yet contacted.`}
        </p>
      </div>

      {isLoading ? (
        <div className="loading">Loading…</div>
      ) : examinations.length === 0 ? (
        <div className="empty">
          No leads yet. They arrive when someone completes the examination on the site and asks
          for their map.
        </div>
      ) : (
        <div className="table-scroll">
          <table className="kit-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Lead</th>
                <th>Severity</th>
                <th>Marked</th>
                <th>Indicated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {examinations.map((e) => (
                <tr key={e.id}>
                  <td data-label="When" style={{ whiteSpace: 'nowrap', color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(e.created_at).toLocaleDateString()}
                  </td>
                  <td data-label="Lead">
                    <div>
                      <Link
                        to={`/leads/${e.id}`}
                        style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {e.name ?? 'Unnamed lead'}
                      </Link>
                    </div>
                    <div style={{ color: 'var(--ink-3)', fontSize: '.8rem' }}>{e.email}</div>
                  </td>
                  <td data-label="Severity">
                    <StatusBadge label={e.severity} tone={SEVERITY_TONE[e.severity]} />
                  </td>
                  <td data-label="Marked" style={{ fontVariantNumeric: 'tabular-nums' }}>{e.marked_count}/8</td>
                  <td data-label="Indicated" style={{ maxWidth: '18rem', color: 'var(--ink-3)' }}>{e.indicated.join(', ')}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn small" to={`/leads/${e.id}`}>
                        Open map
                      </Link>
                      {!e.handled_at && (
                        <button className="btn small" onClick={() => markHandled(e.id)}>
                          Mark contacted
                        </button>
                      )}
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
