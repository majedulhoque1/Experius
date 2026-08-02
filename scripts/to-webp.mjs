import { chromium } from 'playwright'
import { readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'

/*
  JPEG/PNG → WebP, using the Chromium that already ships with Playwright.

  The repo has no image toolchain and adding sharp pulls a platform binary for
  a job the browser can already do. Canvas encodes WebP natively, so this needs
  nothing that is not already installed.

    node scripts/to-webp.mjs shot.jpeg [more.png ...] [--quality 82] [--width 1600]

  Files land in public/shots/opt/ as <name>.webp, which is where build-site.mjs
  looks and the only copy that ships.
*/

const OUT = 'public/shots/opt'
const arg = (flag, dflt) => {
  const i = process.argv.indexOf(flag)
  return i > -1 ? Number(process.argv[i + 1]) : dflt
}
const QUALITY = arg('--quality', 82) / 100
const MAXW = arg('--width', 1600)

const files = process.argv.slice(2).filter((a) => /\.(jpe?g|png)$/i.test(a))
if (!files.length) {
  console.error('\n✗ nothing to convert. Pass one or more .jpeg/.png paths.\n')
  process.exit(1)
}
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage()
const report = []

for (const src of files) {
  try {
    const mime = /\.png$/i.test(src) ? 'image/png' : 'image/jpeg'
    const b64 = readFileSync(src).toString('base64')
    const out = join(OUT, basename(src).replace(/\.(jpe?g|png)$/i, '.webp'))

    const dataUrl = await page.evaluate(
      async ({ b64, mime, quality, maxw }) => {
        const img = new Image()
        img.src = `data:${mime};base64,${b64}`
        await img.decode()
        const scale = Math.min(1, maxw / img.naturalWidth)
        const c = document.createElement('canvas')
        c.width = Math.round(img.naturalWidth * scale)
        c.height = Math.round(img.naturalHeight * scale)
        const ctx = c.getContext('2d')
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, c.width, c.height)
        return c.toDataURL('image/webp', quality)
      },
      { b64, mime, quality: QUALITY, maxw: MAXW },
    )

    if (!dataUrl.startsWith('data:image/webp')) throw new Error('browser did not encode WebP')
    writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64'))
    const from = Math.round(statSync(src).size / 1024)
    const to = Math.round(statSync(out).size / 1024)
    report.push(`  ✓ ${basename(out).padEnd(30)} ${from}KB → ${to}KB`)
  } catch (e) {
    report.push(`  ✗ ${basename(src).padEnd(30)} ${e.message.split('\n')[0].slice(0, 60)}`)
  }
}

await browser.close()
console.log(report.join('\n'))
