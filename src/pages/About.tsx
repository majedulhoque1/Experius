import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Section } from '../components/doc/Section'
import { Reveal } from '../components/motion/Reveal'

/* Majedul is CO-FOUNDER — never "Founder". */

const POSITIONS = [
  {
    title: 'Automation goes last',
    body: 'Automating a process nobody has defined only makes the mess arrive faster. Structure first, always — the least glamorous part of the pitch and the reason the rest works.',
  },
  {
    title: 'Measurement is not a phase two',
    body: 'A system that cannot report on itself cannot be improved, and "we will add analytics later" means never. Everything we ship is instrumented before it launches.',
  },
  {
    title: 'We say the awkward thing early',
    body: 'If a module will not pay for itself, or the real problem is a process rather than software, that belongs on the first call and not in the final invoice.',
  },
  {
    title: 'Numbers carry their source',
    body: 'Every figure on this site has a footnote — measured, true by construction, inferred, or not yet known. Where we do not have the number, it says so.',
  },
]

export default function About() {
  return (
    <>
      <PageHeader
        label="About"
        title="A systems company, working out of Dhaka."
        lead="We build the operational spine service businesses run on — and we are unusually interested in the boring parts, because that is where the money leaks."
      />

      <div className="mt-[var(--spacing-section)]">
        <Section folio="01" label="Background">
          <Reveal>
            <div className="col-text mt-8 space-y-6 text-ink-2">
              <p className="type-lead text-ink">
                EXPERIUS was started by Majedul Hoque, co-founder, after enough years of
                watching good businesses buy software that did not talk to anything else
                they owned.
              </p>
              <p>
                A website here, a booking tool there, a spreadsheet holding the whole
                thing together, and an owner acting as the integration layer between all
                three. The tools were rarely the problem. The gaps between them always
                were.
              </p>
              <p>
                The work itself is mostly unglamorous: deciding where a record should
                live, which step should be automatic, and what actually needs to be
                counted. Done properly it disappears — the owner simply notices they have
                stopped doing something they used to do every day.
              </p>
              <p>
                We are based in Dhaka and build for businesses here and abroad. The
                clinics, charities, developers and founder-led brands we work with have
                one thing in common: they had outgrown the way they were running, and
                knew it.
              </p>
            </div>
          </Reveal>
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="02" label="Positions" title="Four things we will argue for.">
          <dl className="mt-12">
            {POSITIONS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.04}>
                <div className="rule-top-soft grid gap-x-8 gap-y-2 py-7 sm:grid-cols-[16rem_minmax(0,1fr)]">
                  <dt className="type-h3 text-ink">{p.title}</dt>
                  <dd className="text-ink-2">{p.body}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="03" label="Closing" title="Tell us what is slowing you down.">
          <Reveal>
            <Link
              to="/contact"
              className="type-label link-underline mt-9 inline-block text-ink"
            >
              Book a strategy call
            </Link>
          </Reveal>
        </Section>
      </div>
    </>
  )
}
