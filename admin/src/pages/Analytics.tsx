import { useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'

function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function Analytics() {
  const [from, setFrom] = useState(iso(new Date(Date.now() - 30 * 86_400_000)))
  const [to, setTo] = useState(iso(new Date()))
  const { data, isLoading, error } = useAnalytics({ from, to })

  return (
    <div>
      <div className="page-head">
        <h1>Analytics</h1>
        <p>First-party, server-inserted. No third-party tracker.</p>
      </div>

      <div className="toolbar">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span style={{ color: 'var(--ink-3)' }}>to</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {error && <p className="login-err">{(error as Error).message}</p>}
      {isLoading ? (
        <div className="loading">Loading…</div>
      ) : (
        <>
          <div className="stats">
            <div className="stat">
              <b>{data?.conversions?.book_consultation_views ?? 0}</b>
              <span>Booking page views</span>
            </div>
            <div className="stat">
              <b>{data?.conversions?.contact_views ?? 0}</b>
              <span>Contact page views</span>
            </div>
            <div className="stat">
              <b>{data?.conversions?.consultation_submissions ?? 0}</b>
              <span>Consultation requests</span>
            </div>
            <div className="stat">
              <b>{data?.conversions?.contact_submissions ?? 0}</b>
              <span>Contact submissions</span>
            </div>
          </div>

          <div className="day-group">
            <h3>Top pages</h3>
            {!data?.topPages.length ? (
              <p style={{ color: 'var(--ink-3)', fontSize: '.85rem' }}>No pageviews in this range yet.</p>
            ) : (
              <div className="table-scroll">
                <table className="kit-table">
                  <thead>
                    <tr>
                      <th>Path</th>
                      <th>Pageviews</th>
                      <th>Unique visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPages.map((p) => (
                      <tr key={p.path}>
                        <td data-label="Path">{p.path}</td>
                        <td data-label="Pageviews">{p.pageviews}</td>
                        <td data-label="Unique visitors">{p.unique_visitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="day-group">
            <h3>Sources</h3>
            {!data?.sources.length ? (
              <p style={{ color: 'var(--ink-3)', fontSize: '.85rem' }}>No traffic in this range yet.</p>
            ) : (
              <div className="table-scroll">
                <table className="kit-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Referrer host</th>
                      <th>Pageviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sources.map((s, i) => (
                      <tr key={i}>
                        <td data-label="Source" style={{ textTransform: 'capitalize' }}>{s.source}</td>
                        <td data-label="Referrer host">{s.referrer_host ?? '—'}</td>
                        <td data-label="Pageviews">{s.pageviews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="day-group">
            <h3>Countries</h3>
            {!data?.countries.length ? (
              <p style={{ color: 'var(--ink-3)', fontSize: '.85rem' }}>No traffic in this range yet.</p>
            ) : (
              <div className="table-scroll">
                <table className="kit-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Pageviews</th>
                      <th>Unique visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.countries.map((c) => (
                      <tr key={c.country}>
                        <td data-label="Country">{c.country}</td>
                        <td data-label="Pageviews">{c.pageviews}</td>
                        <td data-label="Unique visitors">{c.unique_visitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
