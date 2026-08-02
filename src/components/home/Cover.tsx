import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

/*
  The cover of the document. Everything here is type — a title, a standfirst,
  an imprint line — set the way a report's title page is set, with the rule
  under it doing the work a hero image would normally do.
*/

const TITLE = ['The system', 'your business', 'runs on.']

export function Cover() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-animate]', { opacity: 1, y: 0 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
        tl.fromTo('[data-animate="imprint"]', { opacity: 0 }, { opacity: 1, duration: 0.7 })
          .fromTo(
            '[data-animate="line"]',
            { yPercent: 105 },
            { yPercent: 0, duration: 1.15, stagger: 0.075 },
            0.05,
          )
          .fromTo(
            '[data-animate="rule"]',
            { scaleX: 0 },
            { scaleX: 1, duration: 1.1, transformOrigin: 'left center' },
            0.5,
          )
          .fromTo(
            '[data-animate="fade"]',
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.85, stagger: 0.09 },
            0.62,
          )
        return () => tl.kill()
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="sheet pt-[clamp(3.5rem,9vw,8rem)]">
      <p
        data-animate="imprint"
        className="type-label flex flex-wrap gap-x-5 gap-y-1 text-ink-3 opacity-0"
      >
        <span>Experius</span>
        <span aria-hidden className="text-accent">/</span>
        <span>Systems for service businesses</span>
        <span aria-hidden className="text-accent">/</span>
        <span>Dhaka</span>
      </p>

      <h1 className="type-title mt-9 text-ink">
        {TITLE.map((line, i) => (
          <span key={line} className="block overflow-hidden pb-[0.06em]">
            <span data-animate="line" className="block">
              {i === 2 ? (
                <>
                  runs <span className="italic text-accent">on.</span>
                </>
              ) : (
                line
              )}
            </span>
          </span>
        ))}
      </h1>

      <div
        data-animate="rule"
        className="mt-12 h-px w-full bg-ink origin-left"
        aria-hidden
      />

      <div className="mt-10 grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <p data-animate="fade" className="type-lead col-text text-ink-2 opacity-0">
          Most businesses don&rsquo;t have a growth problem. They have six tools that
          don&rsquo;t speak to each other, and an owner acting as the integration layer
          between them. We build the one system underneath — the website, the booking,
          the records, the automation, the numbers — and then we stay on and keep
          improving it.
        </p>

        <div data-animate="fade" className="opacity-0">
          <p className="type-note">
            This document sets out how we work, what we have built, and what the
            evidence currently shows — including where the evidence does not exist yet.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
            <Link to="/contact" className="type-label link-underline text-ink">
              Book a strategy call
            </Link>
            <Link to="/projects" className="type-label link-underline text-ink-2">
              Read the evidence
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
