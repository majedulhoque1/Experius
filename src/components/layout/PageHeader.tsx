import type { ReactNode } from 'react'

/** Title page for an inner document. */
export function PageHeader({
  label,
  title,
  lead,
  children,
}: {
  label: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="sheet pt-[clamp(3rem,7vw,6rem)]">
      <p className="type-label text-ink-3">{label}</p>
      <h1 className="type-title mt-7 text-ink">{title}</h1>
      <div className="mt-10 h-px w-full bg-ink" aria-hidden />
      {lead && <p className="type-lead col-text mt-9 text-ink-2">{lead}</p>}
      {children}
    </header>
  )
}
