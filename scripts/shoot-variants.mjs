import { chromium } from 'playwright'
import { mkdirSync, readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

/*
  Shoots every design-samples/v*.html at desktop and mobile, reports console
  errors, and flags horizontal overflow — the failure that screenshots alone
  hide because fullPage widens to fit the overflow instead of showing a scrollbar.
*/

const dir = resolve('design-samples')
const out = '.shots/variants'
mkdirSync(out, { recursive: true })

const files = readdirSync(dir)
  .filter((f) => /^v\d/.test(f) && f.endsWith('.html'))
  .sort()

const browser = await chromium.launch()
const problems = []

for (const f of files) {
  const name = f.replace('.html', '')
  for (const [tag, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    page.on('console', (m) => {
      if (m.type() === 'error') problems.push(`${name} ${tag} CONSOLE: ${m.text()}`)
    })
    page.on('pageerror', (e) => problems.push(`${name} ${tag} PAGEERROR: ${e.message}`))

    await page.goto(pathToFileURL(resolve(dir, f)).href, { waitUntil: 'networkidle' })
    // Scroll the whole page so IntersectionObserver reveals fire, then return.
    // behavior:'instant' is required — these pages set scroll-behavior:smooth on
    // <html>, which turns window.scrollTo into an animation that each successive
    // call retargets, so the page never actually moves.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
    await page.waitForTimeout(1600)

    // A screenshot of un-revealed content looks like a design with holes in it.
    const stuck = await page.evaluate(() =>
      [...document.querySelectorAll('[data-r]:not(.in)')].map(
        (e) => (e.className || e.tagName) + ' | ' + e.textContent.trim().slice(0, 45),
      ),
    )
    if (stuck.length) problems.push(`${name} ${tag} STUCK REVEALS (${stuck.length}): ${stuck[0]}`)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    if (overflow > 2) problems.push(`${name} ${tag} OVERFLOW: ${overflow}px horizontal`)

    await page.screenshot({ path: `${out}/${name}-${tag}.png`, fullPage: true })
    console.log('shot', name, tag, overflow > 2 ? `⚠ overflow ${overflow}px` : '')
    await ctx.close()
  }
}

// V4's examination is the whole concept — prove it actually computes.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(pathToFileURL(resolve(dir, 'v4-dossier.html')).href, { waitUntil: 'networkidle' })
  // Click the label text, which is how a person actually marks the form —
  // the input itself is intentionally invisible.
  await page.locator('#exam').scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  const rows = page.locator('#qs .q')
  for (const i of [0, 1, 3, 4, 6]) await rows.nth(i).locator('span.t').click()
  await page.waitForTimeout(500)
  const state = await page.evaluate(() => ({
    counter: document.getElementById('counter').textContent,
    verdict: document.getElementById('verdict').textContent,
    gauge: document.getElementById('gauge').style.width,
    chips: [...document.querySelectorAll('#chips .chip')].map((c) => c.textContent),
  }))
  console.log('\nV4 examination after 5 marks:', JSON.stringify(state, null, 2))
  await page.locator('#exam').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${out}/v4-dossier-exam-active.png` })
  await ctx.close()
}

await browser.close()

console.log('\n' + (problems.length ? '⚠ PROBLEMS:\n' + problems.join('\n') : '✓ no console errors, no overflow'))
