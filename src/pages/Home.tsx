import { Link } from 'react-router-dom'
import { Cover } from '../components/home/Cover'
import { Pillars } from '../components/home/Pillars'
import { Section, Note } from '../components/doc/Section'
import { Reveal } from '../components/motion/Reveal'
import { MODULES, type ModuleSlug } from '../content/types'
import { MODULE_DESCRIPTIONS } from '../content/pillars'
import { caseStudies } from '../content/case-studies'

const moduleKeys = Object.keys(MODULES) as ModuleSlug[]

/*
  The document runs: cover, the finding, the method, the instruments, the
  evidence, the argument for staying, and a closing. Rhythm is varied by
  changing measure and ground — a reversed section punctuates the middle —
  rather than by alternating card grids.
*/

function Instruments() {
  return (
    <Section
      folio="03"
      label="Instruments"
      title="Six modules, one machine."
      standfirst="You can start with one and add the rest. They are designed as parts of the same system — the booking form writes to the record the dashboard reads from, and the automation fires off that same record."
    >
      {/* An index, not a card grid: rules and hanging numbers. */}
      <dl className="mt-14">
        {moduleKeys.map((key, i) => (
          <Reveal key={key} delay={i * 0.04}>
            <div className="rule-top-soft grid gap-x-8 gap-y-2 py-7 sm:grid-cols-[3rem_14rem_minmax(0,1fr)]">
              <dt className="type-label pt-1.5 text-accent sm:col-start-1">
                {String(i + 1).padStart(2, '0')}
              </dt>
              <dt className="type-h3 text-ink sm:col-start-2">{MODULES[key]}</dt>
              <dd className="text-ink-2 sm:col-start-3">{MODULE_DESCRIPTIONS[key]}</dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </Section>
  )
}

function Evidence() {
  return (
    <Section
      folio="04"
      label="Evidence"
      title="What the record shows."
      standfirst="Four systems, live or ready. Every figure on the pages behind these links says where it came from — measured, true by construction, reasoned, or not yet known."
    >
      <ol className="mt-14">
        {caseStudies.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.05}>
            <li className="rule-top-soft py-8">
              <Link
                to={`${c.kind === 'product' ? '/products' : '/projects'}/${c.slug}`}
                className="group grid gap-x-8 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
              >
                <div>
                  <h3 className="type-h2 text-ink transition-colors duration-300 group-hover:text-accent">
                    {c.clientName}
                  </h3>
                  <p className="col-text mt-3 text-ink-2">{c.summary}</p>
                </div>
                <span className="type-label shrink-0 text-ink-3 transition-colors group-hover:text-accent">
                  {c.clientKind}
                </span>
              </Link>
            </li>
          </Reveal>
        ))}
      </ol>

      <Note>
        Angel Foundation and Construction OS run on figures that are true by
        construction rather than measured, because those systems are either too new or
        hold a client&rsquo;s commercial data. Both pages say so on the page rather than
        in the small print.
      </Note>
    </Section>
  )
}

function Argument() {
  return (
    <section className="mt-[var(--spacing-section)] bg-reverse py-[clamp(4.5rem,9vw,9rem)] text-reverse-fg">
      <div className="sheet">
        <div className="ruled">
          <span className="type-label text-reverse-fg-2">The argument</span>

          <div>
            <Reveal>
              <h2 className="type-h1 col-text text-reverse-fg">
                A launch is the worst the system will ever be.
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="col-text mt-9 space-y-6 text-reverse-fg-2">
                <p>
                  On the day it goes live, a system has no data. Nobody knows yet which
                  step loses people, which message gets ignored, or which report the
                  owner actually opens. Everything useful is learned afterwards.
                </p>
                <p>
                  Which is why most agencies are structured badly for you: they are paid
                  to leave. Ship something that looks finished, invoice, move on — and
                  eighteen months later nobody has checked whether it worked.
                </p>
                <p className="type-lead text-reverse-fg">
                  We would rather be paid to stay. Every build ships with a care plan
                  attached, and the months after launch are when it earns back what it
                  cost.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <Link
                to="/partnership"
                className="type-label link-underline mt-10 inline-block text-reverse-fg"
              >
                How the partnership works
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function Closing() {
  return (
    <Section folio="05" label="Closing" className="mt-[var(--spacing-section)]">
      <Reveal>
        <h2 className="type-h1 col-text text-ink">
          Start with the map, not the build.
        </h2>
      </Reveal>
      <Reveal delay={0.06}>
        <p className="type-lead col-text mt-7 text-ink-2">
          The first conversation is a working session, not a pitch. We map how the work
          actually moves through your business and name the bottleneck — and you keep
          that map whether or not you build anything with us.
        </p>
      </Reveal>
      <Reveal delay={0.12}>
        <Link
          to="/contact"
          className="type-label link-underline mt-10 inline-block text-ink"
        >
          Book a strategy call
        </Link>
      </Reveal>
    </Section>
  )
}

export default function Home() {
  return (
    <>
      <Cover />

      <div className="mt-[var(--spacing-section)]">
        <Section
          folio="01"
          label="The finding"
          title="The problem is almost never the thing that hurts."
          standfirst="A clinic loses bookings and assumes it needs more marketing. In fact the front desk is retyping the same patient into three places, and the enquiry that arrived at nine at night was never seen at all. The leak is three steps upstream of where it is felt."
        >
          <Note>
            We have yet to open an engagement where the presenting complaint turned out
            to be the actual constraint.
          </Note>
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section
          folio="02"
          label="The method"
          title="Strategize, systemize, automate — strictly in that order."
        >
          <Pillars />
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Instruments />
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Evidence />
      </div>

      <Argument />
      <Closing />
    </>
  )
}
