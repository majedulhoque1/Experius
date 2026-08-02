import { PageHeader } from '../components/layout/PageHeader'
import { IndexList } from '../components/case/IndexList'
import { Section, Note } from '../components/doc/Section'
import { projects } from '../content/case-studies'

export default function Projects() {
  return (
    <>
      <PageHeader
        label="Selected work"
        title="Systems in the wild."
        lead="Real businesses, real architectures, and honest numbers — including the ones we do not have yet."
      />

      <div className="sheet">
        <IndexList items={projects} />
      </div>

      <div className="mt-[var(--spacing-section)]">
        <Section folio="§" label="On the numbers" title="Why our figures look unusual.">
          <p className="col-text mt-8 text-ink-2">
            Most agency case studies open with a percentage nobody can source. On every
            page here each figure carries a footnote saying exactly where it came from —
            read from a live database, true by construction, reasoned from what we know,
            or not yet known at all.
          </p>
          <Note>
            Where a system has not run long enough to say anything meaningful, the page
            says so and gives the date we will come back and measure. There is no
            &ldquo;estimated&rdquo; category, deliberately.
          </Note>
        </Section>
      </div>
    </>
  )
}
