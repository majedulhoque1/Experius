import { chromium } from 'playwright'

const errors = []
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

await page.goto('http://localhost:5199/contact.html', { waitUntil: 'networkidle' })

await page.waitForSelector('.book-days', { timeout: 10000 })
const dayCount = await page.$$eval('.book-day', (els) => els.length)
console.log('1. days with open slots:', dayCount)
if (dayCount < 1) throw new Error('no bookable days rendered')

await page.click('.book-day')
await page.waitForSelector('.book-time', { timeout: 5000 })
const timeCount = await page.$$eval('.book-time', (els) => els.length)
console.log('2. times shown:', timeCount)
if (timeCount < 1) throw new Error('no time chips rendered after picking a day')

await page.click('.book-time')
await page.waitForSelector('[data-book-form]', { timeout: 5000 })
console.log('3. details form shown')

const bookForm = page.locator('[data-book-form]')
await bookForm.locator('[name=name]').fill('Nadia Islam')
await bookForm.locator('[name=phone]').fill('+8801955000111')
await bookForm.locator('[name=business]').fill('Islam Orthodontics')
await bookForm.locator('[name=concern]').fill('Playwright end-to-end booking verification.')
await bookForm.locator('button[type=submit]').click()

await page.waitForSelector('.enq-status.good', { timeout: 10000 })
const successText = await page.textContent('.enq-status.good')
console.log('4. success:', successText.trim())
console.log('console errors:', errors.length ? JSON.stringify(errors) : 'none')

await page.screenshot({ path: 'C:/Users/ONECOM~1/AppData/Local/Temp/claude/d--EXPERIUS-EXPERIUS-XYZ/49080288-c1ea-4274-87be-c04e11f485ed/scratchpad/public-booking.png' })

await browser.close()
console.log('DONE')
