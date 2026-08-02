import type { Metric } from '../../content/types'

/*
  Metrics set as figures with real footnotes.

  The provenance model is the whole point of these pages: a number read from
  a live database, a fact that is true by construction, a reasoned inference
  and a number we do not have yet are different kinds of claim. In a badged
  card layout that distinction reads as decoration. Set as a printed table
  with sources collected underneath, it reads as scholarship — which is the
  argument we are actually making.
*/

const KIND: Record<Metric['status'], string> = {
  verified: 'Measured',
  architectural: 'By construction',
  inference: 'Inferred',
  pending: 'Not yet known',
}

function sourceLine(m: Metric): string {
  switch (m.status) {
    case 'verified': {
      const origin =
        m.source === 'public-marketing-claim'
          ? 'Published by the client'
          : m.source === 'client'
            ? 'Reported by the client'
            : 'Read from the live system'
      return `${origin}, ${m.asOf}.`
    }
    case 'architectural':
      return `${m.provenance}.`
    default:
      return `${m.note}`
  }
}

export function Figures({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="mt-14">
      <dl className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m, i) => {
          const hasValue = m.status === 'verified' || m.status === 'architectural'
          return (
            <div key={m.label} className="rule-top-soft py-7">
              <dt className="type-label text-ink-3">{KIND[m.status]}</dt>
              <dd>
                <span
                  className={[
                    'type-figure mt-4 block text-[clamp(2.25rem,3.6vw,3.25rem)]',
                    hasValue ? 'text-ink' : 'text-ink-4',
                  ].join(' ')}
                >
                  {hasValue ? m.value : '—'}
                  <sup className="ml-1.5 font-sans text-accent">{i + 1}</sup>
                </span>
                <span className="mt-4 block text-small text-ink-2">{m.label}</span>
              </dd>
            </div>
          )
        })}
      </dl>

      <ol className="rule-top mt-10 pt-6">
        {metrics.map((m, i) => (
          <li key={m.label} className="type-note flex gap-3 py-1.5">
            <span className="w-4 shrink-0 text-accent">{i + 1}</span>
            <span>{sourceLine(m)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
