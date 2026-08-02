import { chromium } from 'playwright'

/*
  Renders scripts/og-card.html to the social card. The filename is versioned
  because scrapers cache an og:image for a very long time — bump the number
  and the meta tags rather than overwriting, or half the internet keeps
  showing the old one.

  Needs the dev server up so the card can load the real stylesheet:
    npm run dev && node scripts/make-og.mjs
*/

const BASE = process.env.SITE_URL || 'http://localhost:5174'
const OUT = 'public/og-experius-v2.png'

try {
  const probe = await fetch(BASE + '/')
  if (!probe.ok) throw new Error('status ' + probe.status)
} catch (err) {
  console.error(`\n✗ nothing serving at ${BASE} (${err.message}). Run: npm run dev\n`)
  process.exit(1)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
const page = await ctx.newPage()
await page.goto(BASE + '/scripts/og-card.html', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)

// Assert the webfonts actually loaded — a card that silently falls back to
// Georgia is worse than no card, because nobody looks at it again.
const serifLoaded = await page.evaluate(() => document.fonts.check('400 78px Spectral'))
const uiLoaded = await page.evaluate(() => document.fonts.check('600 19px Archivo'))
if (!serifLoaded || !uiLoaded) {
  console.error(`✗ webfonts did not load (Spectral=${serifLoaded} Archivo=${uiLoaded})`)
  process.exit(1)
}

await page.locator('.card').screenshot({ path: OUT })
await browser.close()
console.log(`✓ ${OUT} — 1200x630`)
