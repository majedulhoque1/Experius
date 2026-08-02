import { chromium } from 'playwright'
import { mkdirSync, readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const dir = resolve('design-samples')
mkdirSync('.shots', { recursive: true })
const files = readdirSync(dir).filter((f) => f.endsWith('.html'))
const browser = await chromium.launch()

for (const f of files) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(pathToFileURL(resolve(dir, f)).href, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.screenshot({
    path: `.shots/sample-${f.replace('.html', '')}.png`,
    fullPage: true,
  })
  console.log('shot', f)
  await ctx.close()
}

await browser.close()
