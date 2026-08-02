/*
  Screenshot harness. "It builds" is not verification — every page gets looked
  at on desktop and mobile before it counts as done.

  The page is scrolled to the bottom first so scroll-triggered reveals have
  actually fired; otherwise a full-page capture shows a mostly empty document.
  Pinned/sticky sections are also captured as viewport shots at set scroll
  fractions, since a full-page image can only ever show a sticky element once.

  Usage: node scripts/shoot.mjs [prefix] [path] [--stops=0.3,0.5]
*/
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const prefix = process.argv[2] ?? 'home'
const path = (process.argv[3] ?? '/').replace(/^([^/])/, '/$1')
const stopArg = process.argv.find((a) => a.startsWith('--stops='))
const stops = stopArg ? stopArg.split('=')[1].split(',').map(Number) : []

const base = process.env.BASE ?? 'http://localhost:5173'
const out = '.shots'
mkdirSync(out, { recursive: true })

const VIEWS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch()
const problems = []

for (const v of VIEWS) {
  const ctx = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: 1,
  })
  const page = await ctx.newPage()
  page.on('console', (m) => m.type() === 'error' && problems.push(`[${v.name}] ${m.text()}`))
  page.on('pageerror', (e) => problems.push(`[${v.name}] ${e.message}`))

  await page.goto(base + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // Viewport shots at scroll fractions — the only way to see a pinned section.
  for (const s of stops) {
    await page.evaluate((f) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({ top: max * f, behavior: 'instant' })
    }, s)
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${out}/${prefix}-${v.name}-at${Math.round(s * 100)}.png` })
  }

  // Walk the whole page so every scroll-triggered reveal has run.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 110))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(700)

  await page.screenshot({ path: `${out}/${prefix}-${v.name}.png`, fullPage: true })

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (overflow > 0) problems.push(`[${v.name}] horizontal overflow: ${overflow}px`)

  /*
    scrollWidth alone is not enough: an ancestor with `overflow: hidden` will
    clip a too-wide child silently, so the document reports no overflow while
    the user sees a headline cut off mid-word. Measure elements directly.
  */
  const clipped = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    return [...document.querySelectorAll('h1, h2, h3, p, a, li, button')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.right > vw + 1
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}: "${(el.textContent ?? '').trim().slice(0, 40)}"`)
  })
  clipped.forEach((c) => problems.push(`[${v.name}] clipped past viewport — ${c}`))

  // Anything left invisible after a full scroll is a reveal that never fired.
  const stuck = await page.evaluate(() =>
    [...document.querySelectorAll('[data-animate]')].filter(
      (el) => Number(getComputedStyle(el).opacity) < 0.9,
    ).length,
  )
  if (stuck > 0) problems.push(`[${v.name}] ${stuck} element(s) stuck hidden after scroll`)

  console.log(`${v.name}: captured (overflow ${overflow}px, stuck ${stuck})`)
  await ctx.close()
}

await browser.close()
console.log(problems.length ? '\nPROBLEMS:\n  ' + problems.join('\n  ') : '\nclean')
