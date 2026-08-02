import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execSync } from 'node:child_process'

/*
  The site is seven static pages over three shared files, so the build is a
  copy rather than a bundle — there is nothing here a bundler would improve,
  and a build step you can read in one screen is a build step that does not
  surprise you at 2am.

  What it does add is the check a copy cannot do on its own: every screenshot
  referenced in data.js has to exist in the output. A missing capture silently
  becoming a blank frame is the exact failure this site argues against.
*/

const ROOT = resolve('.')
const OUT = join(ROOT, 'dist')

const PAGES = [
  'index.html',
  'projects.html',
  'products.html',
  'case-studies.html',
  'case.html',
  'about.html',
  'contact.html',
]

/* Captures are authored as JPEG in public/shots and optimised to WebP in
   public/shots/opt. Only the optimised set ships, flattened to /shots. */
const SHOTS_SRC = join(ROOT, 'public/shots/opt')

const fail = (msg) => {
  console.error('\n✗ build: ' + msg + '\n')
  process.exit(1)
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

for (const page of PAGES) {
  if (!existsSync(join(ROOT, page))) fail(`missing page ${page}`)
  cpSync(join(ROOT, page), join(OUT, page))
}

if (!existsSync(join(ROOT, 'assets/site.css'))) fail('missing assets/site.css')
cpSync(join(ROOT, 'assets'), join(OUT, 'assets'), { recursive: true })

if (!existsSync(SHOTS_SRC)) fail('missing public/shots/opt — run scripts/capture-projects.mjs')
cpSync(SHOTS_SRC, join(OUT, 'shots'), { recursive: true })

/* Everything loose in public/ lands at the output root: favicon, social card,
   robots, and whatever else gets dropped in there later. */
for (const e of readdirSync(join(ROOT, 'public'), { withFileTypes: true })) {
  if (e.isFile()) cpSync(join(ROOT, 'public', e.name), join(OUT, e.name))
}
if (!existsSync(join(OUT, 'favicon.svg'))) fail('missing public/favicon.svg')

/* The admin app is a separate Vite project (its own package.json, its own
   deps) so it's built independently and the output dropped at dist/admin —
   served from the same domain at /admin rather than a subdomain. */
const ADMIN = join(ROOT, 'admin')
/* Vercel installs dependencies for the root package.json only, so in CI
   admin/node_modules does not exist and `npm run build` there dies on a
   missing vite. Install when it is absent — skipped locally, where it already
   exists, so a local build stays fast. `npm ci` rather than `install` because
   admin/package-lock.json is committed and CI should honour it exactly. */
if (!existsSync(join(ADMIN, 'node_modules'))) {
  console.log('admin/node_modules missing — installing');
  execSync('npm ci', { cwd: ADMIN, stdio: 'inherit' })
}
execSync('npm run build', { cwd: ADMIN, stdio: 'inherit' })
cpSync(join(ADMIN, 'dist'), join(OUT, 'admin'), { recursive: true })

/* Every shot the content references must have landed in the output. */
const data = readFileSync(join(ROOT, 'assets/data.js'), 'utf8')
const referenced = [...new Set([...data.matchAll(/['"]([\w-]+\.webp)['"]/g)].map((m) => m[1]))]
const shipped = new Set(readdirSync(join(OUT, 'shots')))
const missing = referenced.filter((f) => !shipped.has(f))
if (missing.length) fail(`data.js references screenshots that were not built: ${missing.join(', ')}`)

const bytes = (dir) =>
  readdirSync(dir, { withFileTypes: true }).reduce(
    (n, e) => n + (e.isDirectory() ? bytes(join(dir, e.name)) : statSync(join(dir, e.name)).size),
    0,
  )

console.log(
  `✓ built ${PAGES.length} pages, ${referenced.length} screenshots, ` +
    `${(bytes(OUT) / 1024 / 1024).toFixed(2)} MB → dist/`,
)
