import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { LOGOMARK_PARTS } from './Logomark'

/*
  The hero's signature motion: the monogram arrives as five disconnected
  pieces and assembles itself. That is the company thesis stated as an
  interaction rather than a paragraph — scattered parts becoming one system.

  The bars slide in from the left, the triangles converge from above and
  below, and everything settles onto the 45° grid the mark is built from.
*/

type Props = { className?: string }

const ENTRY: Record<keyof typeof LOGOMARK_PARTS, { x?: number; y?: number }> = {
  barTop: { x: -120 },
  barMid: { x: -180 },
  barBottom: { x: -120 },
  triTop: { y: -140 },
  triBottom: { y: 140 },
}

export function AssemblingMark({ className }: Props) {
  const root = useRef<SVGSVGElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Reduced motion still needs the resting state SET, not merely skipped,
      // or the mark stays invisible forever.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-part]', { opacity: 1, x: 0, y: 0 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

        Object.entries(ENTRY).forEach(([part, from], i) => {
          tl.fromTo(
            `[data-part="${part}"]`,
            { ...from, opacity: 0 },
            { x: 0, y: 0, opacity: 1, duration: 1.1 },
            i * 0.08,
          )
        })

        return () => tl.kill()
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <svg
      ref={root}
      viewBox="0 0 507 366"
      fill="currentColor"
      className={className}
      role="img"
      aria-label="EXPERIUS"
    >
      <title>EXPERIUS</title>
      {Object.entries(LOGOMARK_PARTS).map(([name, d]) => (
        <path key={name} d={d} data-part={name} opacity={0} />
      ))}
    </svg>
  )
}
