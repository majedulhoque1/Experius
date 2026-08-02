/*
  The EXPERIUS monogram, rebuilt as vector from the deployed raster
  (assets/experius-logo-C9hwnUDR.png, measured at 507x366).

  The shipped PNG is near-black artwork on transparency, which is all but
  invisible on the brand's own charcoal background. Redrawing it means the mark
  inherits `currentColor`, scales cleanly, and — because each part is its own
  path — can assemble from its pieces.

  Every edge is a 45° cut. That angle is the brand's signature and it is
  echoed by the `chamfer` utilities in brand.css.
*/

export type LogomarkProps = {
  className?: string
  title?: string
  /** Marks parts for GSAP to target when the mark assembles. */
  animated?: boolean
}

export const LOGOMARK_PARTS = {
  barTop: 'M0 0 H144 L216 72 H0 Z',
  barMid: 'M0 147 H291 L327 183 L291 219 H0 Z',
  barBottom: 'M0 293 H216 L144 365 H0 Z',
  triTop: 'M257 0 H504 L380.5 129 Z',
  triBottom: 'M257 365 H504 L380.5 237 Z',
} as const

export function Logomark({ className, title, animated = false }: LogomarkProps) {
  const partAttr = animated ? { 'data-logo-part': '' } : {}

  return (
    <svg
      viewBox="0 0 507 366"
      fill="currentColor"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {Object.entries(LOGOMARK_PARTS).map(([name, d]) => (
        <path key={name} d={d} data-part={name} {...partAttr} />
      ))}
    </svg>
  )
}

/** Monogram plus wordmark, for the header and footer. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <Logomark className="h-[0.78em] w-auto" title="EXPERIUS" />
      <span className="font-[var(--font-display)] text-[1em] font-bold tracking-[-0.02em]">
        EXPERIUS
      </span>
    </span>
  )
}
