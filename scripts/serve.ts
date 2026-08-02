import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { handleExamine, type ExamineRequest } from '../lib/examination/handler'
import { handleInquiry, type InquiryStore, type InquiryRow } from '../lib/inquiry/handler'
import { hashIp } from '../lib/examination/limits'
import { generationAvailable } from '../lib/examination/generate'

/*
  Static server for the prototype, plus a live /api/examine route so the
  examination can be demonstrated end to end locally — the same handler the
  Vercel function wraps, so what you see here is what ships.

  Opening the HTML by double-click works for the static pages, but an IDE
  preview pane that roots itself elsewhere silently fails to find
  assets/site.css and renders the page unstyled. Use this instead.
*/

/*
  Load .env.local before anything reads process.env.

  Without this the server starts perfectly happily with no keys, every
  examination returns `degraded: 'unavailable'`, and the site quietly shows the
  "book the first meeting" fallback instead of a map — which looks like a
  product decision rather than a missing environment variable. Failing to find
  the file is fine (production supplies real env vars); failing silently to
  read one that exists is not, so the outcome is printed at startup.
*/
try {
  process.loadEnvFile('.env.local')
} catch {
  // No .env.local — expected on Vercel, where env comes from the platform.
}

const ROOT = resolve('.')
const PORT = Number(process.argv[2] || 5174)

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function body(req: IncomingMessage): Promise<string> {
  return new Promise((res, rej) => {
    let data = ''
    req.on('data', (c) => {
      data += c
      // Cap the body so a large POST can't exhaust memory.
      if (data.length > 64_000) rej(new Error('body too large'))
    })
    req.on('end', () => res(data))
    req.on('error', rej)
  })
}

async function examine(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'content-type': 'application/json' })
    return res.end(JSON.stringify({ error: 'method not allowed' }))
  }
  try {
    const payload = JSON.parse((await body(req)) || '{}')
    const input: ExamineRequest = {
      stage: payload.stage === 'map' ? 'map' : 'followups',
      markedIds: payload.markedIds ?? [],
      followUps: payload.followUps,
      otherPain: typeof payload.otherPain === 'string' ? payload.otherPain.slice(0, 500) : undefined,
      name: payload.name,
      email: payload.email,
      ip: req.socket.remoteAddress ?? '127.0.0.1',
      referrer: (req.headers.referer as string) ?? null,
      utm: typeof payload.utm === 'string' ? payload.utm.slice(0, 200) : null,
    }
    const result = await handleExamine(input)
    if (result.internal?.brief) {
      console.log('\n── internal brief (would be emailed) ──')
      console.log('  ' + result.internal.brief.summary)
      console.log('  Open with: ' + result.internal.brief.openingQuestion + '\n')
    }
    res.writeHead(result.status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    res.end(JSON.stringify(result.body))
  } catch (err) {
    console.error('[api/examine]', err)
    res.writeHead(400, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'bad request' }))
  }
}

/* In-memory store so the form can be exercised locally without Supabase. */
const localInquiries: (InquiryRow & { at: number })[] = []
const localStore: InquiryStore = {
  async record(row) {
    localInquiries.push({ ...row, at: Date.now() })
    console.log('\n-- inquiry received (local, not persisted) --')
    console.log(`  ${row.name} <${row.email}>${row.details.business ? ' | ' + row.details.business : ''}`)
    console.log('  ' + row.message.replace(/\n/g, '\n  ') + '\n')
  },
  async countRecent(ipHash, sinceISO) {
    const since = Date.parse(sinceISO)
    return localInquiries.filter((r) => r.details.ip_hash === ipHash && r.at >= since).length
  },
}

async function inquiry(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'content-type': 'application/json' })
    return res.end(JSON.stringify({ ok: false, error: 'method not allowed' }))
  }
  try {
    const payload = JSON.parse((await body(req)) || '{}')
    const result = await handleInquiry(
      {
        ...payload,
        ip: req.socket.remoteAddress ?? '127.0.0.1',
        referrer: (req.headers.referer as string) ?? null,
      },
      localStore,
      hashIp,
    )
    res.writeHead(result.status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    res.end(JSON.stringify(result.body))
  } catch (err) {
    console.error('[api/inquiry]', err)
    res.writeHead(400, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: false, error: 'bad request' }))
  }
}

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0])

  if (url === '/api/examine') return examine(req, res)
  if (url === '/api/inquiry') return inquiry(req, res)

  /*
    admin/ is a separate Vite+React app — its source needs a JSX/TS transform
    this static server can't do. Serving admin/index.html directly (matching
    it as a plain directory index) hands the browser a raw <script src=
    "/src/main.tsx">, which loads as application/octet-stream and gets
    blocked by strict MIME checking: a blank page with no console error
    explaining why. So /admin is served from the built dist/admin instead —
    run `npm run build` after touching admin/, or `cd admin && npm run dev`
    for live-reloading admin work on its own port.
  */
  if (url === '/admin' || url.startsWith('/admin/')) {
    const adminDist = join(ROOT, 'dist/admin')
    if (!existsSync(join(adminDist, 'index.html'))) {
      res.writeHead(404, { 'content-type': 'text/plain' })
      return res.end('dist/admin not built yet — run `npm run build`, or use `cd admin && npm run dev` directly.')
    }
    const rel = url.slice('/admin'.length) || '/'
    let file = join(adminDist, rel)
    try {
      if (statSync(file).isDirectory()) file = join(file, 'index.html')
    } catch {
      file = join(adminDist, 'index.html') // client-side route (e.g. /admin/bookings) — same fallback as the Vercel rewrite
    }
    res.writeHead(200, {
      'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-cache',
    })
    return createReadStream(file).pipe(res)
  }

  // This now serves the repo root, which holds .env.local. Never hand out a
  // dotfile, even locally — a screen-share is enough to leak a key.
  if (/(^|[/\\])\./.test(url)) {
    res.writeHead(403, { 'content-type': 'text/plain' })
    return res.end('403')
  }

  // normalize() collapses ../ so a request cannot escape ROOT
  const safe = normalize(url).replace(/^(\.\.[/\\])+/, '')
  /*
    The site asks for /shots/x.webp. In production the build copies the
    optimised captures to dist/shots; here they are served straight out of
    public/shots/opt so there is only ever one copy of an image in the repo.
  */
  let file = safe.startsWith('/shots/') || safe.startsWith('\\shots\\')
    ? join(ROOT, 'public/shots/opt', safe.slice(7))
    : join(ROOT, safe)
  /*
    Candidates in the order the build resolves them:
      1. the path as written, or its index.html if it is a directory
      2. public/<path> — the build copies public/ contents to the output root
      3. <path>.html — Vercel's cleanUrls serves /projects from projects.html,
         so local and production resolve the site's links identically
  */
  const found = [file, join(ROOT, 'public', safe), file + '.html'].find((cand) => {
    try {
      return statSync(cand).isDirectory() ? statSync(join(cand, 'index.html')).isFile() : true
    } catch {
      return false
    }
  })
  if (!found) {
    res.writeHead(404, { 'content-type': 'text/plain' })
    return res.end('404 ' + url)
  }
  file = statSync(found).isDirectory() ? join(found, 'index.html') : found

  res.writeHead(200, {
    'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-cache',
  })
  createReadStream(file).pipe(res)
}).listen(PORT, () => {
  console.log('serving ' + ROOT + '\n')
  console.log('  Site      http://localhost:' + PORT + '/')
  console.log(
    '  Examination generation: ' +
      (generationAvailable()
        ? 'LIVE — OPENROUTER_API_KEY loaded, maps will generate'
        : 'OFF — no OPENROUTER_API_KEY in .env.local, so the site will show the ' +
          '"book the first meeting" fallback instead of a map'),
  )
})
