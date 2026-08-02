import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { AssemblingMark } from '../brand/AssemblingMark'
import { MODULES } from '../../content/types'

/*
  Statement hero. There is no photography on this site by design, so the
  composition has to carry itself on type, the 45° brand geometry and motion.

  The masked line-reveal requires each line to be `whitespace-nowrap` inside
  its own overflow-hidden wrapper — if the line is allowed to wrap, the mask
  clips the wrong box and letters get sliced.
*/

const LINES = ['The system your', 'business runs on.']

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-animate]', { opacity: 1, y: 0 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

        tl.fromTo('[data-animate="overline"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 })
          .fromTo(
            '[data-animate="line"]',
            { yPercent: 108 },
            { yPercent: 0, duration: 1.15, stagger: 0.09 },
            0.1,
          )
          .fromTo(
            '[data-animate="claim"]',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.9 },
            0.7,
          )
          .fromTo(
            '[data-animate="lead"]',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.9 },
            0.82,
          )
          .fromTo(
            '[data-animate="cta"]',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 },
            0.94,
          )
          .fromTo(
            '[data-animate="strip"]',
            { opacity: 0 },
            { opacity: 1, duration: 1 },
            1.1,
          )

        return () => tl.kill()
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      className="relative flex min-h-[calc(100svh-4.5rem)] flex-col justify-between overflow-hidden pt-[clamp(3rem,9vw,7rem)]"
    >
      {/* Faint 45° field — the brand angle used as atmosphere, not decoration. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, var(--color-fg) 0 1px, transparent 1px 84px)',
        }}
      />

      <div className="container-x relative grid flex-1 items-center gap-y-14 lg:grid-cols-[1.35fr_1fr] lg:gap-x-16">
        <div>
          <p data-animate="overline" className="type-label text-fg-4 opacity-0">
            Strategize <span className="text-accent">—</span> Systemize{' '}
            <span className="text-accent">—</span> Automate
          </p>

          {/*
            Each line is masked by its own overflow-hidden wrapper and slid up
            from below. The inner span must NOT be `whitespace-nowrap`: the
            mask has no fixed height, so it grows with a wrapped line and the
            reveal still works — whereas nowrap forces the heading wider than
            a phone viewport and silently clips it mid-word.
          */}
          <h1 className="type-display mt-7 text-fg">
            {LINES.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <span data-animate="line" className="block">
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p
            data-animate="claim"
            className="type-h3 mt-6 text-accent opacity-0"
          >
            Built once. Improved every month.
          </p>

          <p
            data-animate="lead"
            className="type-lead measure mt-7 text-fg-2 opacity-0"
          >
            EXPERIUS builds the website, booking, CRM, automation and analytics a
            service business actually operates on — as one connected system rather
            than six tools that don&rsquo;t speak. Then we stay on, because a system
            nobody tends stops earning inside a year.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              data-animate="cta"
              to="/contact"
              className="chamfer bg-accent px-7 py-4 type-label text-white opacity-0 transition-colors duration-300 hover:bg-accent-hi"
            >
              Book a strategy call
            </Link>
            <Link
              data-animate="cta"
              to="/projects"
              className="chamfer hairline px-7 py-4 type-label text-fg-2 opacity-0 transition-colors duration-300 hover:border-hairline-hi hover:text-fg"
            >
              See the work
            </Link>
          </div>
        </div>

        {/* Width is constrained on the wrapper, not the SVG — the mark sits in
            a fluid grid column and would otherwise run past the container. */}
        <div className="relative hidden w-full max-w-[22rem] justify-self-center lg:block">
          <AssemblingMark className="h-auto w-full text-fg-4" />
        </div>
      </div>

      {/* Instrument strip: the six modules as a readout, previewing what follows. */}
      <div
        data-animate="strip"
        className="relative mt-12 border-t border-hairline opacity-0"
      >
        {/* Each item carries its own leading tick, so a wrapped line never
            begins with an orphaned separator. */}
        <ul className="container-x flex flex-wrap items-center gap-x-8 gap-y-2.5 py-5">
          {Object.values(MODULES).map((label) => (
            <li key={label} className="type-label flex items-center gap-2.5 text-fg-4">
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 bg-accent/60"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
              />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
