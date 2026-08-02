import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logomark } from '../brand/Logomark'

/*
  Masthead and colophon, set like a document rather than an app shell.
  No GSAP in here — anything imported into shared chrome lands in every
  route's bundle.
*/

const NAV = [
  { to: '/projects', label: 'Work' },
  { to: '/products', label: 'Products' },
  { to: '/personal-brand', label: 'Personal Brand' },
  { to: '/partnership', label: 'Partnership' },
  { to: '/about', label: 'About' },
]

function Masthead() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/92 backdrop-blur-md">
      <div className="sheet flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3" aria-label="EXPERIUS — home">
          <Logomark className="h-4 w-auto text-ink" title="EXPERIUS" />
          <span className="type-label text-ink">Experius</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'type-label transition-colors duration-300',
                  isActive ? 'text-accent' : 'text-ink-2 hover:text-ink',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/contact" className="type-label link-underline text-ink">
            Book a call
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="type-label text-ink lg:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <div
        className={[
          'grid overflow-hidden transition-[grid-template-rows] duration-500 lg:hidden',
          'ease-[var(--ease-out-quart)]',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="min-h-0">
          <nav className="sheet flex flex-col border-t border-rule-soft py-4">
            {[...NAV, { to: '/contact', label: 'Book a call' }].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'type-h3 border-b border-rule-soft py-3.5 transition-colors',
                    isActive ? 'text-accent' : 'text-ink hover:text-accent',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

function Colophon() {
  return (
    <footer className="mt-[var(--spacing-section)] bg-reverse text-reverse-fg">
      <div className="sheet py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logomark className="h-7 w-auto text-reverse-fg" title="EXPERIUS" />
            <p className="type-lead mt-7 max-w-sm text-reverse-fg">
              We build the operating system a service business runs on — then stay on to
              keep improving it.
            </p>
            <p className="type-label mt-8 text-reverse-fg-2">
              Strategize · Systemize · Automate
            </p>
          </div>

          <nav aria-label="Sitemap">
            <p className="type-label text-reverse-fg-2">Contents</p>
            <ul className="mt-6 space-y-3">
              {[...NAV, { to: '/contact', label: 'Contact' }].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-small text-reverse-fg transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="type-label text-reverse-fg-2">Correspondence</p>
            <ul className="mt-6 space-y-3 text-small">
              <li>
                <a
                  href="mailto:hello@experius.xyz"
                  className="text-reverse-fg transition-colors hover:text-accent"
                >
                  hello@experius.xyz
                </a>
              </li>
              <li className="text-reverse-fg-2">Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-reverse-rule pt-6 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="type-label text-reverse-fg-2">© {new Date().getFullYear()} Experius</p>
          <p className="type-label text-reverse-fg-2">
            Set in Newsreader &amp; Archivo · Built on the system we sell
          </p>
        </div>
      </div>
    </footer>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Masthead />
      <main id="main">{children}</main>
      <Colophon />
    </>
  )
}
