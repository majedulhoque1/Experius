import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
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

const SIDEBAR_COLLAPSED_KEY = 'experius-admin-sidebar-collapsed'

export function Shell() {
  const { signOut, user } = useAuth()
  const [navOpen, setNavOpen] = useState(false)
  // Desktop remembers the choice across visits (a dense-data habit, set once
  // and kept); mobile always starts closed since it's a drawer over content,
  // not a layout the visitor tunes for the session.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1')
  const location = useLocation()

  // A drawer left open across a navigation would cover the page it just
  // routed to; closing it on path change is what makes it feel like nav,
  // not a modal the user has to dismiss twice.
  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('nav-locked', navOpen)
    return () => document.body.classList.remove('nav-locked')
  }, [navOpen])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  return (
    <div className={'shell' + (collapsed ? ' sidebar-collapsed' : '')}>
      <div
        className={'side-backdrop' + (navOpen ? ' show' : '')}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />
      <aside className={'side' + (navOpen ? ' open' : '')}>
        <div className="side-mark">
          <span className="side-mark-text">EXPERIUS</span>
          <button
            type="button"
            className="side-collapse-toggle"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d={collapsed ? 'M5 3.5 9 7l-4 3.5' : 'M9 3.5 5 7l4 3.5'}
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
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
        <div className="topbar">
          <button
            type="button"
            className="topbar-toggle"
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
              {navOpen ? (
                <path d="M4.5 4.5 14.5 14.5M14.5 4.5 4.5 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2.5 5.5h14M2.5 9.5h14M2.5 13.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
          <span className="topbar-mark">EXPERIUS</span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
