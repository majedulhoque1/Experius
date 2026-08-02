import { chromium } from 'playwright'

const errors = []
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

await page.goto('http://localhost:5181/', { waitUntil: 'networkidle' })
if (!page.url().includes('/login')) throw new Error('did not redirect to /login when unauthenticated')

await page.fill('#email', 'majedulhoqueofficial@gmail.com')
await page.fill('#password', 'Majed123')
await page.click('button[type=submit]')
await page.waitForURL('http://localhost:5181/', { timeout: 8000 })
console.log('login OK')

// ── Dashboard ──
await page.waitForFunction(() => {
  const els = document.querySelectorAll('.stat b')
  return els.length === 5 && Array.from(els).every((e) => e.textContent && !e.textContent.includes('—'))
}, { timeout: 10000 })
console.log('Dashboard OK:', await page.$$eval('.stat', (els) => els.map((e) => e.textContent?.trim())))

// ── Bookings ──
await page.click('a[href="/bookings"]')
await page.waitForSelector('.window-row', { timeout: 8000 })
let bookingText = await page.textContent('.window-row')
console.log('Bookings OK, first row:', bookingText.trim())
// confirm the pending test booking
const confirmBtn = page.locator('.window-row button', { hasText: 'Confirm' }).first()
if (await confirmBtn.count()) {
  await confirmBtn.click()
  await page.waitForFunction(() => document.querySelector('.badge')?.textContent === 'confirmed', { timeout: 8000 })
  console.log('Bookings: confirm write OK')
}

// ── CRM ──
await page.click('a[href="/crm"]')
await page.waitForSelector('table.kit-table', { timeout: 8000 })
const crmRows = await page.$$eval('table.kit-table tbody tr', (rows) => rows.length)
console.log('CRM OK, rows:', crmRows)
if (crmRows < 1) throw new Error('expected at least 1 contact (auto-created by request_booking)')

// ── Submissions ──
await page.click('a[href="/submissions"]')
await page.waitForTimeout(1200)
const subBodyText = await page.textContent('body')
console.log('Submissions body snapshot:', subBodyText.replace(/\s+/g, ' ').slice(0, 400))
console.log('Submissions console errors so far:', errors.length ? JSON.stringify(errors) : 'none')
await page.screenshot({ path: 'C:/Users/ONECOM~1/AppData/Local/Temp/claude/d--EXPERIUS-EXPERIUS-XYZ/49080288-c1ea-4274-87be-c04e11f485ed/scratchpad/admin-submissions-debug.png' })
const subRows = await page.$$eval('table.kit-table tbody tr', (rows) => rows.length).catch(() => -1)
console.log('Submissions OK, rows:', subRows)
if (subRows < 1) throw new Error('expected at least 1 submission')
await page.locator('table.kit-table button', { hasText: 'Mark contacted' }).first().click()
await page.waitForFunction(() => document.querySelector('.badge')?.textContent === 'contacted', { timeout: 8000 })
console.log('Submissions: status write OK')

// ── Availability ──
await page.click('a[href="/availability"]')
await page.waitForSelector('.window-row', { timeout: 8000 })
const windowCount = await page.$$eval('.window-row', (els) => els.length)
console.log('Availability OK, windows:', windowCount)
if (windowCount !== 10) throw new Error('expected 10 seeded windows, got ' + windowCount)
// reversible write: toggle first window off then back on
const toggleBtn = page.locator('.window-row .btn.small').first()
await toggleBtn.click()
await page.waitForTimeout(600)
await toggleBtn.click()
console.log('Availability: toggle write OK')

// ── Analytics ──
await page.click('a[href="/analytics"]')
await page.waitForSelector('.stats', { timeout: 8000 })
await page.waitForTimeout(800)
const analyticsBody = await page.textContent('body')
if (analyticsBody.includes('undefined') ) throw new Error('Analytics rendered "undefined"')
console.log('Analytics OK')

// ── Settings ──
await page.click('a[href="/settings"]')
await page.waitForSelector('.field input', { timeout: 8000 })
const tzValue = await page.inputValue('.field input')
console.log('Settings OK, timezone field:', tzValue)
if (tzValue !== 'Asia/Dhaka') throw new Error('expected Asia/Dhaka, got ' + tzValue)

console.log('console errors across all screens:', errors.length ? JSON.stringify(errors) : 'none')

await page.screenshot({ path: 'C:/Users/ONECOM~1/AppData/Local/Temp/claude/d--EXPERIUS-EXPERIUS-XYZ/49080288-c1ea-4274-87be-c04e11f485ed/scratchpad/admin-bookings.png' })

await browser.close()
console.log('DONE - all checks passed')
