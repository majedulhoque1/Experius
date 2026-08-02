import { PageHeader } from '../components/layout/PageHeader'
import { IndexList } from '../components/case/IndexList'
import { Section } from '../components/doc/Section'
import { Reveal } from '../components/motion/Reveal'
import { comingSoon, products } from '../content/case-studies'

export default function Products() {
  return (
    <>
      <PageHeader
        label="Products"
        title="Systems we already own."
        lead="Operating systems we have built once, proven, and can stand up again for a business like yours in weeks rather than months."
      />

      <div className="sheet">
        <IndexList items={products} />

        {comingSoon.map((p) => (
          <Reveal key={p.slug}>
            {/* Nothing invented for something that does not exist yet. */}
            <div className="ruled rule-top py-10 lg:py-12">
              <div className="flex items-baseline gap-4 lg:flex-col lg:gap-3">
                <span className="type-folio text-ink-4">
                  {String(products.length + 1).padStart(2, '0')}
                </span>
                <span className="type-label pt-1 text-ink-4">In development</span>
              </div>
              <div>
                <h2 className="type-h1 text-ink-4">{p.clientName}</h2>
                <p className="type-lead col-text mt-5 text-ink-3">{p.summary}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="§" label="Provenance" title="Why these exist.">
          <p className="col-text mt-8 text-ink-2">
            Every one of these started as a client build. When the same problem turned up
            a third time we stopped rebuilding it and turned it into a product — which is
            why a system that would normally take months can be running for you in weeks,
            configured and themed rather than written from scratch.
          </p>
        </Section>
      </div>
    </>
  )
}
