/*
  Copy budgets, enforced.

  Before the 2026-08 audit the homepage ran to 2,005 words and 19 phone
  screens. A quarter of every page was "deck" copy — the 30-50 word paragraph
  wedged between a section headline and the content, restating the headline —
  and a tenth was the site explaining its own provenance rules in the middle
  of the reading flow.

  Both of those are habits, not accidents, so they grow back. This asserts
  they have not. Same shape as check-reduced-motion.mjs.

  Start the server first:  npm run dev
*/
import { chromium } from 'playwright'

const BASE = process.env.SITE_URL ?? 'http://localhost:5174'

/*
  Budget = what the page needs with zero duplication, measured after the cut,
  plus a little headroom for a genuinely new component. A page that wants more
  words than this needs a second page, not a bigger number here.

  Counts PROSE only. The /case-studies ledger is 22 rows of figure + source,
  which is the whole point of that page — a data table is not the thing this
  check exists to stop, so <table> is excluded from the total.
*/
const BUDGETS = {
  '/': 950,
  '/about': 430,
  '/projects': 580,
  '/products': 330,
  '/case-studies': 320,
  '/contact': 400,
  '/case?id=angel-foundation': 520,
  '/case?id=noree': 520,
}

/* A paragraph over 30 words is a deck paragraph wearing a disguise. A <dd> is
   a table cell — if it needs a sentence, it is not a table. */
const MAX_P_WORDS = 30
const MAX_DD_WORDS = 16

try {
  const probe = await fetch(BASE + '/')
  if (!probe.ok) throw new Error('status ' + probe.status)
} catch (err) {
  console.error(`\n✗ nothing serving at ${BASE} (${err.message}). Run: npm run dev\n`)
  process.exit(1)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

let failures = 0
const fail = (msg) => {
  failures++
  console.error('  ✗ ' + msg)
}

for (const [path, budget] of Object.entries(BUDGETS)) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })

  const r = await page.evaluate(
    ([maxP, maxDd]) => {
      const words = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length
      const main = document.querySelector('main')
      const over = (sel, cap) =>
        [...main.querySelectorAll(sel)]
          .map((el) => ({ n: words(el.innerText), text: el.innerText.trim().slice(0, 70) }))
          .filter((x) => x.n > cap)

      const tableWords = [...main.querySelectorAll('table')].reduce(
        (n, t) => n + words(t.innerText),
        0,
      )

      return {
        total: words(main.innerText) - tableWords,
        tableWords,
        // Footnote bodies are exempt: they are closed by default and are exactly
        // where long-form justification is supposed to live now.
        longP: over('p:not(.fnote-b p)', maxP),
        longDd: over('dd', maxDd),
      }
    },
    [MAX_P_WORDS, MAX_DD_WORDS],
  )

  const label = path.padEnd(28)
  const tbl = r.tableWords ? ` (+${r.tableWords} in tables)` : ''
  if (r.total > budget) {
    fail(`${label} ${r.total} prose words, budget ${budget} (+${r.total - budget})${tbl}`)
  } else {
    console.log(`  ✓ ${label} ${String(r.total).padStart(4)} / ${budget} words${tbl}`)
  }

  for (const p of r.longP) fail(`${label} <p> is ${p.n} words (max ${MAX_P_WORDS}): "${p.text}…"`)
  for (const d of r.longDd) fail(`${label} <dd> is ${d.n} words (max ${MAX_DD_WORDS}): "${d.text}…"`)
}

await browser.close()

if (failures) {
  console.error(`\n✗ ${failures} copy-budget failure${failures === 1 ? '' : 's'}.`)
  console.error('  Cut, or move the long-form into a <details class="fnote">.\n')
  process.exit(1)
}
console.log('\n✓ every page inside its copy budget\n')
