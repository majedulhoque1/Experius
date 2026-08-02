import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

/*
  Scroll reveal. Kept modest on purpose — 24px and one pass. Big travel
  distances read as a template effect rather than craft.

  `data-animate` is what the reduced-motion rule in brand.css targets, so the
  resting state is SET rather than merely un-animated. Without that, anyone
  browsing with reduced motion on sees an empty page.
*/

type Props = {
  children: ReactNode
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className }: Props) {
  const el = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(el.current, { opacity: 1, y: 0 })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tween = gsap.fromTo(
          el.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            delay,
            ease: 'power4.out',
            scrollTrigger: { trigger: el.current, start: 'top 88%', once: true },
          },
        )
        return () => tween.kill()
      })

      return () => mm.revert()
    },
    { scope: el },
  )

  /*
    No inline `opacity: 0`. GSAP's fromTo sets the hidden state itself on
    mount, so if the script fails to load the content simply renders visible
    instead of leaving a blank page behind an animation that never ran.
  */
  return (
    <div ref={el} data-animate className={className}>
      {children}
    </div>
  )
}
