import { chromium } from 'playwright'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'

/*
  Captures the Angel Foundation admin panel — the actual product of that
  engagement, which the public-site screenshots cannot show.

  Two things make this different from scripts/capture-projects.mjs:

  1. It logs in. Credentials come from ANGEL_ADMIN_EMAIL / ANGEL_ADMIN_PASSWORD,
     falling back to the admin repo's .env.local. They are never printed.

  2. Every screen behind that login holds real families' data — names and phone
     numbers of parents of children with special needs. None of it may be
     published. Before each screenshot this script REDACTS: emails, phone-like
     digit runs, and the text of any element matching --redact. It then asserts
     that nothing matching a phone or email pattern survived, and refuses to
     write the file if anything did.

  Run --dry first. It reports the structure of each screen and writes nothing,
  so the redaction selectors can be aimed properly before any pixel is saved.

    node scripts/capture-angel-admin.mjs --dry
    node scripts/capture-angel-admin.mjs --redact ".booking-name,.lead-name"
*/

const BASE = process.env.ANGEL_ADMIN_URL || 'https://admin.angelfoundationbd.org'
const OUT = 'public/shots'
const DRY = process.argv.includes('--dry')
const redactSel = (() => {
  const i = process.argv.indexOf('--redact')
  return i > -1 ? process.argv[i + 1] : ''
})()

function creds() {
  let email = process.env.ANGEL_ADMIN_EMAIL
  let pass = process.env.ANGEL_ADMIN_PASSWORD
  const local = 'D:/EXPERIUS/Websites/angel-foundation-admin/.env.local'
  if ((!email || !pass) && existsSync(local)) {
    const env = readFileSync(local, 'utf8')
    const g = (k) => {
      const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'))
      return m ? m[1].trim().replace(/^["']|["']$/g, '') : null
    }
    email = email || g('ADMIN_EMAIL')
    pass = pass || g('ADMIN_PASSWORD')
  }
  if (!email || !pass) {
    console.error('\n✗ no credentials. Set ANGEL_ADMIN_EMAIL and ANGEL_ADMIN_PASSWORD.\n')
    process.exit(1)
  }
  return { email, pass }
}

/* The screens worth publishing: what the system does, not who is in it. */
const TARGETS = [
  ['bookings', '/bookings', 'Consultation bookings against real availability'],
  ['availability', '/availability', 'The weekly availability the public calendar reads from'],
  ['submissions', '/submissions', 'Enquiries arriving as records rather than inbox messages'],
  ['dashboard', '/', 'The dashboard the charity actually opens'],
]

const PHONE = /(?:\+?88)?0?1[3-9]\d[\s-]?\d{6,8}|\+?\d[\d\s-]{8,}\d/g
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/g

const { email, pass } = creds()
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const report = []

await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 })
const emailField = page.locator('input[type="email"], input[name="email"]').first()
if (await emailField.count()) {
  await emailField.fill(email)
  await page.locator('input[type="password"]').first().fill(pass)
  await page.locator('button[type="submit"]').first().click()
  await page.waitForTimeout(6000)
}
if (await page.locator('input[type="password"]').count()) {
  console.error('\n✗ still on the login screen — credentials rejected.\n')
  await browser.close()
  process.exit(1)
}
console.log('✓ signed in\n')

for (const [name, path, caption] of TARGETS) {
  const file = `${OUT}/angel-admin-${name}.jpg`
  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(3500)

    if (DRY) {
      const shape = await page.evaluate(() => ({
        heading: document.querySelector('h1,h2')?.textContent?.trim().slice(0, 60) ?? null,
        tables: document.querySelectorAll('table').length,
        rows: document.querySelectorAll('tr,[role="row"]').length,
        // Class names only — never the values inside them.
        cellClasses: [...new Set([...document.querySelectorAll('td,[role="cell"]')]
          .map((c) => c.className).filter(Boolean))].slice(0, 12),
      }))
      report.push(`  ${name.padEnd(14)} ${JSON.stringify(shape)}`)
      continue
    }

    const left = await page.evaluate(
      ({ sel, phoneSrc, emailSrc }) => {
        const phone = new RegExp(phoneSrc, 'g')
        const mail = new RegExp(emailSrc, 'g')
        if (sel) {
          for (const el of document.querySelectorAll(sel)) el.textContent = '——————'
        }
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        const nodes = []
        while (walk.nextNode()) nodes.push(walk.currentNode)
        for (const n of nodes) {
          n.nodeValue = n.nodeValue.replace(mail, 'name@example.com').replace(phone, '+880 1XXX XXXXXX')
        }
        for (const i of document.querySelectorAll('input,textarea')) {
          if (i.value) i.value = i.value.replace(mail, 'name@example.com').replace(phone, '+880 1XXX XXXXXX')
        }
        const text = document.body.innerText
        return { phones: (text.match(phone) || []).length, emails: (text.match(mail) || []).length }
      },
      { sel: redactSel, phoneSrc: PHONE.source, emailSrc: EMAIL.source },
    )

    // Refuse to write a file that still contains contact data.
    if (left.phones || left.emails) {
      report.push(`  ✗ ${name.padEnd(14)} NOT WRITTEN — ${left.phones} phone / ${left.emails} email still present`)
      continue
    }

    await page.screenshot({ path: file, type: 'jpeg', quality: 86 })
    report.push(`  ✓ ${name.padEnd(14)} ${Math.round(statSync(file).size / 1024)}KB  · ${caption}`)
  } catch (e) {
    report.push(`  ✗ ${name.padEnd(14)} ${e.message.split('\n')[0].slice(0, 70)}`)
  }
}

await browser.close()
console.log(report.join('\n'))
console.log(
  DRY
    ? '\ndry run — nothing written. Aim --redact at the name columns above, then run for real.'
    : '\nNow convert to WebP into public/shots/opt/ and add the entries to assets/data.js.',
)
