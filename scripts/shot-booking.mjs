import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('http://localhost:5199/contact.html', { waitUntil: 'networkidle' })
await page.waitForSelector('.book-times', { timeout: 10000 }).catch(() => {})
await page.click('.book-day')
await page.waitForSelector('.book-time', { timeout: 5000 })
await page.locator('#book').scrollIntoViewIfNeeded()
await page.screenshot({
  path: 'C:/Users/ONECOM~1/AppData/Local/Temp/claude/d--EXPERIUS-EXPERIUS-XYZ/49080288-c1ea-4274-87be-c04e11f485ed/scratchpad/booking-widget-visual.png',
  clip: { x: 0, y: 0, width: 1280, height: 900 },
})
await browser.close()
console.log('done')
