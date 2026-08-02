import { Link, Navigate, useParams } from 'react-router-dom'
import { bySlug } from '../content/case-studies'
import { MODULES } from '../content/types'
import { Figures } from '../components/case/Figures'
import { ArchitectureMap } from '../components/case/ArchitectureMap'
import { Section, Note } from '../components/doc/Section'
import { Reveal } from '../components/motion/Reveal'

const STATUS = {
  live: 'Live',
  'deploy-ready': 'Deploy-ready',
  'in-development': 'In development',
} as const

export default function CaseStudy() {
  const { slug } = useParams()
  const study = slug ? bySlug(slug) : undefined
  if (!study) return <Navigate to="/projects" replace />

  return (
    <article>
      {/* Title page */}
      <header className="sheet pt-[clamp(3rem,7vw,6rem)]">
        <p className="type-label flex flex-wrap gap-x-5 gap-y-1 text-ink-3">
          <span className="text-accent">{STATUS[study.status]}</span>
          <span aria-hidden>/</span>
          <span>{study.clientKind}</span>
          <span aria-hidden>/</span>
          <span>{study.year}</span>
        </p>

        <h1 className="type-title mt-8 text-ink">{study.clientName}</h1>

        <div className="mt-10 h-px w-full bg-ink" aria-hidden />

        <div className="mt-9 grid gap-x-14 gap-y-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <p className="type-lead col-text text-ink-2">{study.summary}</p>
          {study.demo && (
            <div>
              {study.demo.url ? (
                <a
                  href={study.demo.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="type-label link-underline text-ink"
                >
                  {study.demo.label}
                </a>
              ) : (
                <p className="type-note">{study.demo.label}</p>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="01" label="Introduction">
          <Reveal>
            <p className="type-lead col-text text-ink">{study.intro}</p>
          </Reveal>
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="02" label="The problem" title="What was going wrong.">
          <Reveal>
            <p className="col-text mt-8 text-ink-2">{study.problem.narrative}</p>
          </Reveal>
          <ul className="mt-10">
            {study.problem.painPoints.map((p, i) => (
              <Reveal key={p} delay={i * 0.04}>
                <li className="rule-top-soft flex gap-6 py-4">
                  <span className="type-label w-6 shrink-0 pt-1 text-accent">
                    {String.fromCharCode(97 + i)}
                  </span>
                  <span className="text-ink-2">{p}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="03" label="The build" title="What we built.">
          <Reveal>
            <p className="col-text mt-8 text-ink-2">{study.solution.narrative}</p>
          </Reveal>

          <ArchitectureMap nodes={study.solution.architecture} />

          <dl className="mt-14">
            {study.solution.modulesUsed.map((m, i) => (
              <Reveal key={m} delay={i * 0.04}>
                <div className="rule-top-soft grid gap-x-8 gap-y-2 py-7 sm:grid-cols-[14rem_minmax(0,1fr)]">
                  <dt className="type-h3 text-ink">{MODULES[m]}</dt>
                  <dd className="text-ink-2">{study.solution.moduleDetails[m]}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="04" label="Findings" title="What actually changed.">
          <Reveal>
            <p className="col-text mt-8 text-ink-2">{study.results.narrative}</p>
          </Reveal>
          <Figures metrics={study.results.metrics} />
          {study.metricsReviewDue && (
            <Note>
              These figures are due to be re-read on {study.metricsReviewDue}. Anything
              currently marked as not yet known will be replaced with a measurement, or
              with an explanation of why it could not be measured.
            </Note>
          )}
        </Section>
      </div>

      {study.pullQuotes.map((q) => (
        <aside key={q.text} className="sheet mt-[var(--spacing-section)]">
          <Reveal>
            <blockquote className="mx-auto max-w-3xl text-center">
              <p className="type-h2 text-ink">
                <span className="text-accent">&ldquo;</span>
                {q.text}
                <span className="text-accent">&rdquo;</span>
              </p>
              <footer className="type-label mt-7 text-ink-3">{q.attribution}</footer>
            </blockquote>
          </Reveal>
        </aside>
      ))}

      <div className="mt-[var(--spacing-section)]">
        <Section folio="05" label="Conclusion">
          <Reveal>
            <p className="type-lead col-text text-ink">{study.conclusion}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <Link
              to="/contact"
              className="type-label link-underline mt-10 inline-block text-ink"
            >
              Book a strategy call
            </Link>
          </Reveal>
        </Section>
      </div>
    </article>
  )
}
