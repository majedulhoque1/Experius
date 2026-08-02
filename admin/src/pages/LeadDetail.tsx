import { Link, useParams, useNavigate } from 'react-router-dom'
import { useExamination, useExaminations, type Examination } from '@/hooks/useExaminations'
import { StatusBadge } from '@/components/StatusBadge'

/*
  The lead, in the order you need it during a call.

  The rail carries the brief and their own words — glanced at repeatedly, so it
  stays put while the map scrolls. The main column carries the map exactly as
  the visitor received it, because the first thing they will say is "about that
  email" and you need to be looking at the same document they are.
*/

const SEVERITY_TONE: Record<Examination['severity'], 'blue' | 'amber' | 'gray' | 'red'> = {
  mild: 'gray',
  moderate: 'blue',
  serious: 'amber',
  critical: 'red',
}

/** Staggered so the page assembles in reading order rather than blinking in. */
const rise = (i: number) => ({ animationDelay: `${i * 70}ms` })

export function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { examination: lead, isLoading, error } = useExamination(id)
  const { markHandled, convertToContact } = useExaminations()

  if (isLoading) return <div className="loading">Loading lead…</div>

  if (error || !lead) {
    return (
      <div>
        <Link to="/leads" className="crumb">
          ← All leads
        </Link>
        <div className="empty">
          {error ? `Could not load this lead — ${error.message}` : 'That lead does not exist.'}
        </div>
      </div>
    )
  }

  const { map, brief } = lead

  return (
    <div>
      <Link to="/leads" className="crumb">
        ← All leads
      </Link>

      <header className="lead-head rise" style={rise(0)}>
        <div className="lead-id">
          <h1>{lead.name ?? 'Unnamed lead'}</h1>
          {lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}
          <div className="lead-facts">
            <StatusBadge label={lead.severity} tone={SEVERITY_TONE[lead.severity]} />
            <span className="fact">{lead.marked_count}/8 marked</span>
            <span className="fact">
              {new Date(lead.created_at).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            {lead.handled_at && <span className="fact">· contacted</span>}
            {lead.utm && <span className="fact">· {lead.utm}</span>}
          </div>
        </div>
        <div className="row-actions">
          {!lead.handled_at && (
            <button className="btn small" onClick={() => markHandled(lead.id)}>
              Mark contacted
            </button>
          )}
          <button
            className="btn small"
            onClick={async () => {
              await convertToContact(lead)
              navigate('/crm')
            }}
          >
            To CRM
          </button>
        </div>
      </header>

      <div className="lead-cols">
        <main>
          {map ? (
            <>
              <section className="lead-sec rise" style={rise(1)}>
                <h2>The map they were sent</h2>
                <p className="lead-headline">{map.headline}</p>
                <p className="lead-body">{map.summary}</p>
              </section>

              <section className="lead-sec rise" style={rise(2)}>
                <h2>How an enquiry moves today</h2>
                <ol className="trace">
                  {map.trace.map((t, i) => (
                    <li key={i}>
                      <span className="step">{t.step}</span>
                      {t.seam && <span className="seam">✕ {t.seam}</span>}
                    </li>
                  ))}
                </ol>
              </section>

              <section className="lead-sec rise" style={rise(3)}>
                <h2>Costliest step</h2>
                <p className="lead-headline" style={{ fontSize: '.95rem' }}>
                  {map.costliest.step}
                </p>
                <p className="lead-body">{map.costliest.why}</p>
              </section>

              <section className="lead-sec rise" style={rise(4)}>
                <h2>Arithmetic they were given</h2>
                <p className="lead-muted" style={{ marginBottom: '.9rem' }}>
                  Formulas, never figures — they run these against their own records.
                </p>
                {map.arithmetic.map((a, i) => (
                  <div className="sum" key={i}>
                    <b>{a.label}</b>
                    <code>{a.formula}</code>
                    <span>{a.note}</span>
                  </div>
                ))}
              </section>

              <section className="lead-sec rise" style={rise(5)}>
                <h2>What we said we would build, in order</h2>
                <ol className="trace">
                  {map.indicated.map((m, i) => (
                    <li key={i}>
                      <span className="step" style={{ fontWeight: 600 }}>
                        {m.module}
                      </span>
                      <span className="why">{m.because}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="lead-sec rise" style={rise(6)}>
                <h2>What the map could not know</h2>
                <ul className="plain">
                  {map.unknowns.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
                <p className="lead-muted" style={{ marginTop: '.7rem' }}>
                  These are the openings. Each one is a question they already know they cannot answer.
                </p>
              </section>
            </>
          ) : (
            <div className="empty">
              No map stored for this lead — it predates the map being kept, or generation degraded
              and the visitor saw the fallback instead.
            </div>
          )}
        </main>

        <aside className="lead-rail">
          {brief && (
            <div className="card accent rise" style={rise(1)}>
              <h2>Before you call</h2>
              <p className="lead-body">{brief.summary}</p>
              <p className="lead-muted">Likely {brief.likelySegment}</p>

              <h3 style={{ margin: '1rem 0 .35rem' }}>Open with</h3>
              <p className="lead-body" style={{ margin: 0 }}>
                {brief.openingQuestion}
              </p>

              {brief.signals.length > 0 && (
                <>
                  <h3>Signals</h3>
                  <ul className="plain">
                    {brief.signals.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </>
              )}

              {brief.redFlags.length > 0 && (
                <>
                  <h3>Red flags</h3>
                  <ul className="plain">
                    {brief.redFlags.map((s, i) => (
                      <li className="flag" key={i}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {lead.other_pain && (
            <div className="card rise" style={rise(2)}>
              <h2>In their own words</h2>
              <p className="lead-body" style={{ margin: 0, fontStyle: 'italic' }}>
                “{lead.other_pain}”
              </p>
            </div>
          )}

          {(lead.follow_ups ?? []).length > 0 && (
            <div className="card rise" style={rise(3)}>
              <h2>What they answered</h2>
              {(lead.follow_ups ?? []).map((f, i) => (
                <div className="qa" key={i}>
                  <b>{f.question}</b>
                  <span>{f.answer || <em>skipped</em>}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
