import { chromium } from 'playwright'

/*
  Measures what the page actually renders: computed size, weight and real
  contrast ratio against the nearest opaque ancestor background.

  WCAG AA is 4.5:1 for body text and 3:1 for large text (>=18.66px bold or
  >=24px). Passing that is the floor, not the goal — this also flags anything
  under 14px, because small tracked-out monospace reads badly long before it
  fails a contrast formula.
*/

const BASE = process.env.SITE_URL || 'http://localhost:5174'
const page_ = process.argv[2] || '/'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto(BASE + page_, { waitUntil: 'networkidle' })
await page.evaluate(async () => {
  const step = window.innerHeight * 0.8
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: 'instant' })
    await new Promise((r) => setTimeout(r, 90))
  }
  window.scrollTo({ top: 0, behavior: 'instant' })
})
await page.waitForTimeout(1200)

const rows = await page.evaluate(() => {
  const lum = (c) => {
    const [r, g, b] = c.map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 4).map(Number)
  const bgOf = (el) => {
    let n = el
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor)
      const a = c.length === 4 ? c[3] : 1
      if (a > 0.9) return c.slice(0, 3)
      n = n.parentElement
    }
    return [255, 255, 255]
  }

  const seen = new Map()
  document.querySelectorAll('p,h1,h2,h3,h4,li,dd,dt,span,a,td,th,label').forEach((el) => {
    const txt = el.textContent.trim()
    if (!txt || txt.length < 12) return
    if (el.querySelector('p,h1,h2,h3,li,dd')) return // container, not a text node
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') return
    const fg = parse(cs.color).slice(0, 3)
    const bg = bgOf(el)
    const L1 = lum(fg), L2 = lum(bg)
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
    const px = parseFloat(cs.fontSize)
    const key = el.className + '|' + Math.round(px) + '|' + cs.fontWeight
    if (seen.has(key)) return
    seen.set(key, {
      sel: (el.tagName.toLowerCase() + '.' + String(el.className || '').split(' ')[0]).slice(0, 30),
      px: +px.toFixed(1),
      weight: cs.fontWeight,
      ratio: +ratio.toFixed(2),
      sample: txt.slice(0, 32).replace(/\s+/g, ' '),
    })
  })
  return [...seen.values()]
})

const large = (r) => r.px >= 24 || (r.px >= 18.66 && Number(r.weight) >= 700)
const fails = rows.filter((r) => r.ratio < (large(r) ? 3 : 4.5))
const tiny = rows.filter((r) => r.px < 14)

console.log(`\n${page_} — ${rows.length} distinct text styles\n`)
rows
  .sort((a, b) => a.ratio - b.ratio)
  .slice(0, 12)
  .forEach((r) =>
    console.log(
      `  ${String(r.ratio).padStart(6)}:1  ${String(r.px).padStart(5)}px w${r.weight}  ${r.sel.padEnd(30)} "${r.sample}"`,
    ),
  )

console.log('\n' + (fails.length ? `⚠ ${fails.length} FAIL WCAG AA` : '✓ every text style passes WCAG AA'))
fails.forEach((r) => console.log(`   ${r.ratio}:1 ${r.px}px ${r.sel} "${r.sample}"`))
console.log(tiny.length ? `⚠ ${tiny.length} style(s) under 14px` : '✓ nothing under 14px')
tiny.forEach((r) => console.log(`   ${r.px}px ${r.sel} "${r.sample}"`))

await browser.close()
