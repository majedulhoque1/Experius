/*
  Reduced motion must SET the resting state, not merely skip the animation.
  Every reveal on this site starts hidden — [data-r] at opacity 0, .rise > span
  translated fully out of its own mask, the logomark's five strokes at opacity 0
  — and is brought back by a class or an animation. If prefers-reduced-motion
  only shortens the transition, those elements never arrive and the visitor gets
  a blank page.

  This asserts every one of them is actually visible with motion reduced.
  Start the server first:  npm run dev
*/
import { chromium } from 'playwright'

const BASE = process.env.SITE_URL ?? 'http://localhost:5174'
const paths = ['/', '/projects', '/products', '/case-studies', '/about', '/contact', '/case?id=angel-foundation']

try {
  const probe = await fetch(BASE + '/')
  if (!probe.ok) throw new Error('status ' + probe.status)
} catch (err) {
  console.error(`\n✗ nothing serving at ${BASE} (${err.message}). Run: npm run dev\n`)
  process.exit(1)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: 'reduce',
})
const page = await ctx.newPage()
let bad = 0

for (const p of paths) {
  await page.goto(BASE + p, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  const r = await page.evaluate(() => {
    const faded = (el) => Number(getComputedStyle(el).opacity) < 0.9
    const moved = (el) => {
      const t = getComputedStyle(el).transform
      if (!t || t === 'none') return false
      const m = t.match(/matrix\(([^)]+)\)/)
      if (!m) return false
      const parts = m[1].split(',').map(Number)
      return Math.abs(parts[5]) > 2
    }
    const reveals = [...document.querySelectorAll('[data-r]')]
    const lines = [...document.querySelectorAll('.rise > span')]
    const strokes = [...document.querySelectorAll('.filemark svg path')]
    return {
      reveals: reveals.length,
      revealsHidden: reveals.filter(faded).length,
      lines: lines.length,
      linesHidden: lines.filter(moved).length,
      strokes: strokes.length,
      strokesHidden: strokes.filter(faded).length,
    }
  })

  const hidden = r.revealsHidden + r.linesHidden + r.strokesHidden
  console.log(
    `${p.padEnd(30)} reveals=${String(r.reveals).padStart(3)} lines=${String(r.lines).padStart(2)}` +
      ` strokes=${String(r.strokes).padStart(2)}  hidden=${hidden}`,
  )
  if (hidden > 0) {
    bad++
    if (r.revealsHidden) console.log(`   ✗ ${r.revealsHidden} [data-r] still at opacity 0`)
    if (r.linesHidden) console.log(`   ✗ ${r.linesHidden} .rise line still translated out of its mask`)
    if (r.strokesHidden) console.log(`   ✗ ${r.strokesHidden} logomark stroke still at opacity 0`)
  }
}

await browser.close()
console.log('\n' + (bad ? `⚠ ${bad} page(s) hide content with motion reduced` : '✓ nothing hidden with motion reduced'))
process.exit(bad ? 1 : 0)
