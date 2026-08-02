import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Section, Note } from '../components/doc/Section'
import { Reveal } from '../components/motion/Reveal'

const PHASES = [
  {
    n: '01',
    title: 'Strategy',
    when: 'Week one',
    body: 'We map how the work actually moves through your business — not how the org chart says it does. You keep the map whether or not you build with us.',
    gets: ['An operational map', 'The bottleneck, named', 'A build order'],
  },
  {
    n: '02',
    title: 'Build',
    when: 'Weeks two to six, typically',
    body: 'The system goes in, starting with whichever module removes the most manual work first. It launches instrumented, so it is measuring itself from day one.',
    gets: ['The system, live', 'Your team trained on it', 'Measurement switched on'],
  },
  {
    n: '03',
    title: 'Care',
    when: 'Ongoing — and this is the actual product',
    body: 'Every month the numbers get read, the friction gets removed and the automations get tightened. This is where a build stops being a cost and starts compounding.',
    gets: ['Monthly review against real data', 'Fixes and improvements', 'The system kept current'],
  },
]

export default function Partnership() {
  return (
    <>
      <PageHeader
        label="Terms of engagement"
        title="We build it. Then we stay and keep it working."
        lead="No naked builds. Every system we hand over has a care plan attached, because a launch is the worst that system will ever be."
      />

      <div className="mt-[var(--spacing-section)]">
        <Section folio="01" label="The incentive" title="Most agencies are paid to leave.">
          <Reveal>
            <p className="type-lead col-text mt-8 text-ink">
              The incentive is to ship something that looks finished, invoice, and move
              on — and the client discovers eighteen months later that nobody ever checked
              whether it worked.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="col-text mt-6 text-ink-2">
              We would rather be paid to stay, because that is the only arrangement where
              our interests and yours point in the same direction. If the system stops
              earning, we stop keeping the client.
            </p>
          </Reveal>
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="02" label="The arc" title="Three phases, one of them permanent.">
          <ol className="mt-14">
            {PHASES.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.05}>
                <li className="rule-top-soft grid gap-x-8 gap-y-4 py-10 lg:grid-cols-[4rem_minmax(0,1fr)_16rem]">
                  <span className="type-folio">{p.n}</span>

                  <div>
                    <h3 className="type-h2 text-ink">{p.title}</h3>
                    <p className="type-label mt-2 text-accent">{p.when}</p>
                    <p className="col-text mt-5 text-ink-2">{p.body}</p>
                  </div>

                  <ul className="space-y-2 lg:pt-2">
                    {p.gets.map((g) => (
                      <li key={g} className="type-note border-t border-rule-soft pt-2">
                        {g}
                      </li>
                    ))}
                  </ul>
                </li>
              </Reveal>
            ))}
          </ol>
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="03" label="Fees" title="What it costs.">
          <Reveal>
            <div className="col-text mt-8 space-y-5 text-ink-2">
              <p>
                Priced per business, because a four-room clinic and a property developer
                do not need the same system and should not pay the same for one.
              </p>
              <p>
                What is fixed is the shape: a one-time build, then a monthly care plan
                that is mandatory rather than optional. You get a number on the first
                call, once we know what we would actually be building.
              </p>
            </div>
          </Reveal>
          <Note>
            If a one-off build with no ongoing relationship is what you want, we are
            genuinely the wrong people — and we will say so on the first call rather than
            at the final invoice.
          </Note>
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="04" label="Closing" title="Start with the map.">
          <Reveal>
            <p className="type-lead col-text mt-8 text-ink-2">
              The first call is a strategy conversation, not a pitch. You leave with the
              bottleneck named whether or not you build with us.
            </p>
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
    </>
  )
}
