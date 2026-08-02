import { Link } from 'react-router-dom'
import type { CaseStudy } from '../../content/types'
import { MODULES } from '../../content/types'
import { Reveal } from '../motion/Reveal'

/*
  Work and products are listed as an index — a numbered entry, a title, a
  description and the modules involved, separated by rules. No cards: the
  page is a table of contents, and reads faster for it.
*/

const STATUS = {
  live: 'Live',
  'deploy-ready': 'Deploy-ready',
  'in-development': 'In development',
} as const

export function IndexList({ items }: { items: CaseStudy[] }) {
  return (
    <ol className="mt-14">
      {items.map((c, i) => (
        <Reveal key={c.slug} delay={i * 0.05}>
          <li className="rule-top">
            <Link
              to={`${c.kind === 'product' ? '/products' : '/projects'}/${c.slug}`}
              className="group ruled py-10 lg:py-12"
            >
              <div className="flex items-baseline gap-4 lg:flex-col lg:gap-3">
                <span className="type-folio">{String(i + 1).padStart(2, '0')}</span>
                <span className="type-label pt-1 text-accent">{STATUS[c.status]}</span>
              </div>

              <div>
                <h2 className="type-h1 text-ink transition-colors duration-300 group-hover:text-accent">
                  {c.clientName}
                </h2>
                <p className="type-lead col-text mt-5 text-ink-2">{c.summary}</p>

                <p className="type-label mt-8 flex flex-wrap gap-x-6 gap-y-2 text-ink-3">
                  <span className="text-ink-2">{c.clientKind}</span>
                  {c.solution.modulesUsed.map((m) => (
                    <span key={m}>{MODULES[m]}</span>
                  ))}
                </p>
              </div>
            </Link>
          </li>
        </Reveal>
      ))}
    </ol>
  )
}
