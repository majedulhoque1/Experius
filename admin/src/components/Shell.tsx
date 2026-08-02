import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/*
  Grouped by what the work *is*, not alphabetically. Pipeline is ordered the
  way a stranger actually moves through the business — they examine (Leads),
  or they write in (Submissions), then they take a slot (Bookings), then they
  become someone we have a history with (CRM). Reading the nav top to bottom
  should teach you the funnel.
*/
const NAV: { label: string; items: { to: string; label: string; end?: boolean }[] }[] = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', end: true },
      { to: '/analytics', label: 'Analytics' },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { to: '/leads', label: 'Leads' },
      { to: '/submissions', label: 'Submissions' },
      { to: '/bookings', label: 'Bookings' },
      { to: '/crm', label: 'CRM' },
    ],
  },
  {
    label: 'Setup',
    items: [
      { to: '/availability', label: 'Availability' },
      { to: '/settings', label: 'Settings' },
    ],
  },
]

export function Shell() {
  const { signOut, user } = useAuth()
  return (
    <div className="shell">
      <aside className="side">
        <div className="side-mark">EXPERIUS</div>
        <nav className="side-nav" aria-label="Sections">
          {NAV.map((group) => (
            <div className="side-group" key={group.label}>
              {/* Labelled rather than decorative, so the grouping reaches a
                  screen reader the same way it reaches the eye. */}
              <div className="side-group-label" id={`nav-${group.label}`}>
                {group.label}
              </div>
              <div className="side-group-items" role="group" aria-labelledby={`nav-${group.label}`}>
                {group.items.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {n.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <div style={{ fontSize: '.78rem', color: 'var(--ink-3)', marginBottom: '.5rem' }}>{user?.email}</div>
          <div className="side-foot-row">
            {/* Same reasoning as the login page: leaving the SPA needs a real
                anchor, not a router Link. */}
            <a href="/">View site ↗</a>
            <button onClick={() => signOut()}>Sign out</button>
          </div>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
