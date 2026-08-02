import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { PILLARS, PILLAR_ORDER } from '../../content/pillars'
import { MODULES } from '../../content/types'
import { SystemDiagram } from './SystemDiagram'

gsap.registerPlugin(ScrollTrigger)

/*
  The method, set as three numbered entries with a figure that tracks the
  argument — the way a plate in a printed report stays alongside the passage
  discussing it. The figure is `position: sticky` in its own column, so no
  pin-spacer and nothing to collapse.

  The order is the argument: automation comes last, because automating an
  undefined process only makes the mess arrive faster.
*/

export function Pillars() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const triggers = PILLAR_ORDER.map((_, i) =>
        ScrollTrigger.create({
          trigger: `[data-pillar="${i}"]`,
          start: 'top 62%',
          end: 'bottom 62%',
          onToggle: (self) => self.isActive && setActive(i),
        }),
      )
      return () => triggers.forEach((t) => t.kill())
    },
    { scope: root },
  )

  return (
    <div ref={root} className="mt-16 grid gap-x-14 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="order-2 lg:order-1">
        {PILLAR_ORDER.map((key, i) => {
          const p = PILLARS[key]
          return (
            <article
              key={key}
              data-pillar={i}
              className="rule-top-soft py-12 first:border-t-0 first:pt-0 lg:py-16"
            >
              <div className="flex items-baseline gap-5">
                <span className="type-folio">{p.index}</span>
                <h3 className="type-h2 text-ink">{p.name}</h3>
              </div>

              <p className="type-lead col-text mt-6 text-ink">{p.claim}</p>
              <p className="col-text mt-5 text-ink-2">{p.body}</p>

              <p className="type-label mt-8 flex flex-wrap gap-x-6 gap-y-2 text-ink-3">
                {p.modules.map((m) => (
                  <span key={m}>{MODULES[m]}</span>
                ))}
              </p>
            </article>
          )
        })}
      </div>

      {/* The plate. Sticky beside the passage it illustrates. */}
      <figure className="order-1 mb-12 lg:order-2 lg:mb-0">
        <div className="lg:sticky lg:top-28">
          <div className="border border-rule bg-paper-2 p-6">
            <SystemDiagram state={active as 0 | 1 | 2} />
          </div>
          <figcaption className="type-note mt-4 flex gap-3">
            <span className="shrink-0 font-semibold text-ink-2">Fig. 1</span>
            <span>
              {active === 0 && 'Before: six tools, no shared record.'}
              {active === 1 && 'After structure: one spine, one record per client.'}
              {active === 2 && 'After automation: the routine paths run unattended.'}
            </span>
          </figcaption>
        </div>
      </figure>
    </div>
  )
}
