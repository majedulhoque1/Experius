import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Section, Note } from '../components/doc/Section'
import { Reveal } from '../components/motion/Reveal'
import { bySlug } from '../content/case-studies'

/*
  A vertical page, not a case study: entrepreneurs, coaches, trainers and
  creators who have an audience and are still selling to it by hand. Noree is
  the proof point rather than the subject.
*/

const AUDIENCE = [
  { who: 'Entrepreneurs', pain: 'Selling a real product through direct messages and a link in bio.' },
  { who: 'Business coaches', pain: 'Every booking is a conversation you have to finish yourself.' },
  { who: 'Trainers', pain: 'Programmes, payments and reminders all living in your own head.' },
  { who: 'Creators', pain: 'An audience you rent from a platform, and no record of who they are.' },
]

const STEPS = [
  {
    n: '01',
    title: 'You own the front door',
    body: 'A site and a storefront that belong to you, not to an algorithm that can change its mind overnight. Everything after this depends on it.',
  },
  {
    n: '02',
    title: 'Selling stops being manual',
    body: 'Orders and bookings become records rather than messages — each carrying its customer, its items and its status, and issuing its own invoice or confirmation without you typing anything.',
  },
  {
    n: '03',
    title: 'You find out what is actually happening',
    body: 'First-party analytics in your own database: what people look at, what they nearly buy, where they stop. Almost nobody has this, and it is what tells you where to spend the next month.',
  },
]

export default function PersonalBrand() {
  const noree = bySlug('noree-jewellery')

  return (
    <>
      <PageHeader
        label="Personal brand"
        title="An audience is not a business until it can buy from you."
        lead="For founders, coaches, trainers and creators who have already built the attention — and are still converting it by hand, one message at a time."
      />

      <div className="mt-[var(--spacing-section)]">
        <Section folio="01" label="Readership" title="Who this is for.">
          <dl className="mt-12">
            {AUDIENCE.map((a, i) => (
              <Reveal key={a.who} delay={i * 0.04}>
                <div className="rule-top-soft grid gap-x-8 gap-y-1.5 py-6 sm:grid-cols-[14rem_minmax(0,1fr)]">
                  <dt className="type-h3 text-ink">{a.who}</dt>
                  <dd className="text-ink-2">{a.pain}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Section>
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section
          folio="02"
          label="The finding"
          title="The problem is never the audience. It is everything after the click."
          standfirst="Personal brands are usually excellent at the hard part. The bottleneck is almost always the same three things — no owned storefront, a sales process running through a human inbox, and no data about either. Fix those in that order and the audience you already have converts better than a bigger one would."
        >
          <ol className="mt-14">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.05}>
                <li className="rule-top-soft grid gap-x-8 gap-y-3 py-8 sm:grid-cols-[4rem_minmax(0,1fr)]">
                  <span className="type-folio">{s.n}</span>
                  <div>
                    <h3 className="type-h3 text-ink">{s.title}</h3>
                    <p className="col-text mt-3 text-ink-2">{s.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </Section>
      </div>

      {noree && (
        <div className="mt-[var(--spacing-section)]">
          <Section
            folio="03"
            label="Evidence"
            title="A jewellery brand that now knows exactly where it loses a sale."
          >
            <Reveal>
              <p className="col-text mt-8 text-ink-2">
                Noree went from selling through direct messages to a storefront that
                invoices itself and reports on itself. Seven weeks in, the data says a
                third of product views become carts — and that almost none of those carts
                become completed orders. That is a specific, fixable problem, and it only
                exists as a sentence because the measurement was built in from the start.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <Link
                to="/projects/noree-jewellery"
                className="type-label link-underline mt-9 inline-block text-ink"
              >
                Read the Noree case study
              </Link>
            </Reveal>

            <Note>
              Order volumes are Noree&rsquo;s own commercial data and are not published
              here. The ratios are the useful figure in any case.
            </Note>
          </Section>
        </div>
      )}

      <div className="mt-[var(--spacing-section)]">
        <Section folio="04" label="Closing" title="Stop selling from your inbox.">
          <Reveal>
            <p className="type-lead col-text mt-8 text-ink-2">
              Bring the audience. We build the machine underneath it, and stay on to keep
              tuning it.
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
