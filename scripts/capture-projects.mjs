import { chromium } from 'playwright'
import { mkdirSync, statSync } from 'node:fs'

/*
  Captures real screenshots of the live client and product systems so the case
  studies show the actual thing. JPEG at 2x: sharp when displayed at 600–900px
  CSS width, a fraction of the weight of a 2880px PNG.

  Failures are reported loudly and never written as a file — a missing capture
  must not quietly become a blank frame on the site. Construction OS is
  deliberately absent: its deploy renders empty and it holds a client's
  commercial data, so the case study shows its architecture instead and says so.
*/

const TARGETS = [
  {
    slug: 'noree',
    shots: [
      ['home', 'https://noreejewellery.com', 0],
      ['shop', 'https://noreejewellery.com/shop', 0],
      ['scroll', 'https://noreejewellery.com', 1.7],
    ],
    mobile: 'https://noreejewellery.com',
  },
  {
    slug: 'angel',
    shots: [
      ['home', 'https://www.angelfoundationbd.org', 0],
      ['booking', 'https://www.angelfoundationbd.org/consultations', 0],
      ['scroll', 'https://www.angelfoundationbd.org', 1.7],
    ],
    mobile: 'https://www.angelfoundationbd.org',
  },
  {
    slug: 'xendev',
    shots: [
      ['home', 'https://xendevltd-web.vercel.app', 0],
      ['scroll', 'https://xendevltd-web.vercel.app', 1.7],
    ],
    mobile: 'https://xendevltd-web.vercel.app',
  },
  {
    slug: 'physio-os',
    shots: [['home', 'https://physio-os.vercel.app', 0]],
    mobile: 'https://physio-os.vercel.app',
  },
]

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

mkdirSync('public/shots', { recursive: true })
const browser = await chromium.launch()
const report = []

async function shoot(ctx, url, scrollBy, path) {
  const page = await ctx.newPage()
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 })
    await page.waitForTimeout(4000)
    if (scrollBy) {
      await page.evaluate(
        (m) => window.scrollTo({ top: window.innerHeight * m, behavior: 'instant' }),
        scrollBy,
      )
      await page.waitForTimeout(2500)
    }
    const empty = await page.evaluate(() => document.body.innerText.trim().length < 40)
    if (empty) throw new Error('page rendered empty')
    await page.screenshot({ path, type: 'jpeg', quality: 86 })
    const kb = Math.round(statSync(path).size / 1024)
    report.push(`  ✓ ${path.split('/').pop().padEnd(24)} ${res.status()}  ${kb}KB`)
  } catch (e) {
    report.push(`  ✗ ${path.split('/').pop().padEnd(24)} ${e.message.split('\n')[0].slice(0, 60)}`)
  }
  await page.close()
}

for (const t of TARGETS) {
  report.push(t.slug)
  const desk = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    userAgent: UA,
  })
  for (const [name, url, scrollBy] of t.shots) {
    await shoot(desk, url, scrollBy, `public/shots/${t.slug}-${name}.jpg`)
  }
  await desk.close()

  const mob = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    userAgent: UA,
    isMobile: true,
    hasTouch: true,
  })
  await shoot(mob, t.mobile, 0, `public/shots/${t.slug}-mobile.jpg`)
  await mob.close()
}

await browser.close()
console.log('\n' + report.join('\n'))
