import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

/*
  Shoots every page at desktop + mobile and asserts the things a screenshot
  cannot show you: console errors, horizontal overflow, scroll-reveals that
  never fired, broken internal links, and <img> that failed to load.

  Served over HTTP rather than file:// — the site uses root-absolute paths
  (/assets, /shots) and extensionless links, so file:// would resolve none of
  them and every assertion would be about a page that does not exist in
  production. Start the server first:  npm run dev

    node scripts/shoot-site.mjs             # every page
    node scripts/shoot-site.mjs /projects   # one page
*/

const BASE = process.env.SITE_URL || 'http://localhost:5174'
const out = '.shots/site'
mkdirSync(out, { recursive: true })

const PAGES = process.argv[2]
  ? [process.argv[2]]
  : [
      '/',
      '/projects',
      '/products',
      '/case-studies',
      '/about',
      '/contact',
      '/case?id=angel-foundation',
      '/case?id=noree',
      '/case?id=xendev',
      '/case?id=physio-os',
      '/case?id=construction-os',
    ]

try {
  const probe = await fetch(BASE + '/')
  if (!probe.ok) throw new Error('status ' + probe.status)
} catch (err) {
  console.error(`\n✗ nothing serving at ${BASE} (${err.message}). Run: npm run dev\n`)
  process.exit(1)
}

const browser = await chromium.launch()
const problems = []
const linkCache = new Map()

async function linkOk(href) {
  if (linkCache.has(href)) return linkCache.get(href)
  let ok = false
  try {
    ok = (await fetch(BASE + href, { method: 'GET' })).ok
  } catch {
    ok = false
  }
  linkCache.set(href, ok)
  return ok
}

for (const p of PAGES) {
  const name = (p === '/' ? 'home' : p.replace(/^\//, '')).replace(/[?=]/g, '-')

  for (const [tag, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    page.on('console', (m) => {
      if (m.type() === 'error') problems.push(`${name} ${tag} CONSOLE: ${m.text().slice(0, 110)}`)
    })
    page.on('pageerror', (e) => problems.push(`${name} ${tag} PAGEERROR: ${e.message.slice(0, 110)}`))

    const res = await page.goto(BASE + p, { waitUntil: 'networkidle' })
    if (!res || !res.ok()) problems.push(`${name} ${tag} HTTP ${res ? res.status() : 'no response'}`)

    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise((r) => setTimeout(r, 110))
      }
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
    await page.waitForTimeout(1500)

    const audit = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      stuck: [...document.querySelectorAll('[data-r]:not(.in)')].length,
      brokenImgs: [...document.images]
        .filter((i) => !i.complete || i.naturalWidth === 0)
        .map((i) => i.getAttribute('src')),
      emptyHosts: [
        '[data-tabs]', '[data-footer]', '[data-cabinet]', '[data-modules]', '[data-figures]',
        '[data-exam]', '[data-exhibits]', '[data-case]', '[data-icp]', '[data-live]', '[data-seams]',
      ].filter((s) => {
        const el = document.querySelector(s)
        return el && el.innerHTML.trim().length === 0
      }),
      /*
        A .rise line is masked by overflow:hidden, which clips sideways as
        well as down. An over-long display line therefore does not wrap or
        overflow the document — it silently loses its last few characters,
        and no page-level overflow check will ever see it.
      */
      clipped: [...document.querySelectorAll('.rise')]
        .filter((el) => el.scrollWidth - el.clientWidth > 1)
        .map((el) => el.textContent.trim().slice(0, 40)),
      links: [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && h.startsWith('/')),
    }))

    if (audit.overflow > 2) problems.push(`${name} ${tag} OVERFLOW ${audit.overflow}px`)
    if (audit.stuck) problems.push(`${name} ${tag} STUCK REVEALS: ${audit.stuck}`)
    if (audit.brokenImgs.length) problems.push(`${name} ${tag} BROKEN IMG: ${audit.brokenImgs.slice(0, 3).join(', ')}`)
    if (audit.emptyHosts.length) problems.push(`${name} ${tag} EMPTY RENDER HOST: ${audit.emptyHosts.join(', ')}`)
    if (audit.clipped.length) problems.push(`${name} ${tag} CLIPPED HEADLINE: "${audit.clipped.join('" / "')}"`)

    if (tag === 'desktop') {
      for (const href of [...new Set(audit.links)]) {
        if (!(await linkOk(href))) problems.push(`${name} DEAD LINK: ${href}`)
      }
      // Scroll past the fold and confirm the header actually reacts.
      await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }))
      await page.waitForTimeout(600)
      const head = await page.evaluate(() => {
        const t = document.querySelector('.tabs')
        const p = t && t.querySelector('.prog')
        return {
          tight: !!(t && t.classList.contains('tight')),
          scale: p ? getComputedStyle(p).transform : null,
        }
      })
      if (!head.tight) problems.push(`${name} MASTHEAD did not condense past the fold`)
      if (head.scale === 'none' || head.scale === null) {
        problems.push(`${name} READING RULE never advanced (transform: ${head.scale})`)
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await page.waitForTimeout(400)
    }

    await page.screenshot({ path: `${out}/${name}-${tag}.png`, fullPage: true })
    await ctx.close()
  }
  console.log('shot', p)
}

await browser.close()
console.log('\n' + (problems.length ? '⚠ PROBLEMS:\n' + [...new Set(problems)].join('\n') : '✓ all pages clean'))
process.exit(problems.length ? 1 : 0)
