import type { ReactNode } from 'react'
import { Reveal } from '../motion/Reveal'

/*
  A numbered section of the document. The folio sits in the margin column and
  the content runs in the text column — hierarchy comes from position on the
  page rather than from a box drawn around it.
*/

export function Section({
  folio,
  label,
  title,
  standfirst,
  children,
  className,
}: {
  folio?: string
  label?: string
  title?: ReactNode
  standfirst?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <section className={`sheet rule-top pt-[var(--spacing-rule)] ${className ?? ''}`}>
      <div className="ruled">
        <div className="flex items-baseline gap-4 lg:flex-col lg:gap-3">
          {folio && <span className="type-folio">{folio}</span>}
          {label && <span className="type-label pt-1 text-ink-3">{label}</span>}
        </div>

        {/* min-w-0 so a wide child (a scrolling figure) can't stretch the column. */}
        <div className="min-w-0">
          {title && (
            <Reveal>
              <h2 className="type-h1 col-text text-ink">{title}</h2>
            </Reveal>
          )}
          {standfirst && (
            <Reveal delay={0.06}>
              <p className="type-lead col-text mt-6 text-ink-2">{standfirst}</p>
            </Reveal>
          )}
          {children}
        </div>
      </div>
    </section>
  )
}

/** A marginal annotation — the aside a careful reader wants. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="type-note col-text mt-8 border-l border-accent pl-5">{children}</p>
  )
}

/** A figure with a numbered caption, as in a printed report. */
export function Figure({
  n,
  caption,
  children,
}: {
  n: string
  caption: string
  children: ReactNode
}) {
  return (
    <figure className="mt-12">
      {children}
      <figcaption className="type-note mt-5 flex gap-3 border-t border-rule-soft pt-4">
        <span className="shrink-0 font-semibold text-ink-2">Fig. {n}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  )
}
