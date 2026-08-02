import { handleExamine, type ExamineRequest } from '../lib/examination/handler'

/*
  Thin adapter. All logic lives in lib/examination/handler.ts so it can be
  exercised without a server (see scripts/test-examine.ts).

  This file is the only place the API key is reachable from — it never leaves
  the server, and the browser calls this endpoint instead.
*/

// Minimal structural types so this doesn't depend on @vercel/node being installed.
type Req = {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
  socket?: { remoteAddress?: string }
}
type Res = {
  status: (code: number) => Res
  json: (body: unknown) => void
  setHeader: (k: string, v: string) => void
  end: () => void
}

function clientIp(req: Req): string {
  const fwd = req.headers['x-forwarded-for']
  const raw = Array.isArray(fwd) ? fwd[0] : fwd
  // x-forwarded-for is a chain; the first entry is the original client.
  return raw?.split(',')[0]?.trim() || req.socket?.remoteAddress || '0.0.0.0'
}

function header(req: Req, name: string): string | null {
  const v = req.headers[name]
  return (Array.isArray(v) ? v[0] : v) ?? null
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  let payload: Record<string, unknown>
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : ((req.body ?? {}) as Record<string, unknown>)
  } catch {
    res.status(400).json({ error: 'invalid json' })
    return
  }

  const stage = payload.stage === 'map' ? 'map' : 'followups'
  const input: ExamineRequest = {
    stage,
    markedIds: (payload.markedIds as string[]) ?? [],
    followUps: payload.followUps as ExamineRequest['followUps'],
    // The handler validates these; passing them through is all this layer does.
    otherPain: typeof payload.otherPain === 'string' ? payload.otherPain.slice(0, 500) : undefined,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    ip: clientIp(req),
    referrer: header(req, 'referer'),
    utm: typeof payload.utm === 'string' ? payload.utm.slice(0, 200) : null,
  }

  const result = await handleExamine(input)

  if (result.internal) {
    // Fire-and-forget both sends. The visitor already has their map on screen —
    // a mail failure must not turn a successful generation into an error.
    const { brief, map, name, email } = result.internal
    void deliverBrief(brief, input).catch((err) =>
      console.error('[examine] brief delivery failed', String(err)),
    )
    void deliverMap(map, name, email).catch((err) =>
      console.error('[examine] map delivery failed', String(err)),
    )
  }

  // Never cache a per-visitor generation at the edge.
  res.setHeader('Cache-Control', 'no-store')
  res.status(result.status).json(result.body)
}

/**
 * Sends the internal brief to Majedul. Resend is the intended transport; until
 * RESEND_API_KEY exists this logs instead of silently dropping it, so a missing
 * env var is visible rather than invisible.
 */
async function deliverBrief(
  brief: { summary: string; likelySegment: string; severity: string; openingQuestion: string; signals: string[]; redFlags: string[] },
  input: ExamineRequest,
) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.BRIEF_TO ?? 'hello@experius.xyz'
  const lines = [
    `Severity: ${brief.severity} · ${input.markedIds.length}/8 marked`,
    `Likely segment: ${brief.likelySegment}`,
    '',
    brief.summary,
    '',
    input.otherPain ? `In their own words: "${input.otherPain}"\n` : '',
    `Open with: ${brief.openingQuestion}`,
    '',
    brief.signals.length ? `Signals:\n${brief.signals.map((s) => `- ${s}`).join('\n')}` : '',
    brief.redFlags.length ? `Red flags:\n${brief.redFlags.map((s) => `- ${s}`).join('\n')}` : '',
    input.utm ? `\nSource: ${input.utm}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  if (!key) {
    console.warn('[examine] RESEND_API_KEY not set — brief not sent:\n' + lines)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.BRIEF_FROM ?? 'examination@experius.xyz',
      to,
      subject: `Examination — ${brief.severity}, ${input.markedIds.length}/8 — ${brief.likelySegment}`,
      text: lines,
    }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
}

/**
 * Sends the visitor their own copy. Plain text on purpose: it survives every
 * client, it is forwardable, and a map that arrives as a broken HTML template
 * would undercut the argument the map itself is making.
 */
async function deliverMap(
  map: {
    headline: string
    summary: string
    trace: { step: string; seam: string | null }[]
    costliest: { step: string; why: string }
    arithmetic: { label: string; formula: string; note: string }[]
    indicated: { module: string; because: string }[]
    unknowns: string[]
  },
  name: string,
  email: string,
) {
  const text = [
    `${name},`,
    '',
    map.headline,
    '',
    map.summary,
    '',
    'HOW AN ENQUIRY MOVES THROUGH YOUR BUSINESS TODAY',
    ...map.trace.flatMap((t) => [`  ${t.step}`, t.seam ? `    x  ${t.seam}` : '']).filter(Boolean),
    '',
    'THE STEP THAT MOST LIKELY COSTS THE MOST',
    `  ${map.costliest.step}`,
    `  ${map.costliest.why}`,
    '',
    'WHAT IT WOULD BE WORTH FINDING OUT',
    '  We cannot know your numbers, so these are yours to run.',
    ...map.arithmetic.flatMap((a) => [`  ${a.label}`, `    ${a.formula}`, `    ${a.note}`]),
    '',
    'WHAT WE WOULD BUILD, IN THIS ORDER',
    ...map.indicated.map((i, n) => `  ${n + 1}. ${i.module} — ${i.because}`),
    '',
    'WHAT THIS MAP CANNOT KNOW',
    ...map.unknowns.map((u) => `  ? ${u}`),
    '',
    'Eight questions is a narrow window. The first meeting is where these get',
    'answered — ninety minutes, no slides, and you keep the map either way.',
    '',
    // A link to the calendar, not a reply: the slot is held the moment they take
    // it, rather than waiting on us to read an inbox.
    'Pick a time here and it is held straight away:',
    '  https://experius.xyz/contact#book',
    '',
    'Or reply to this email and we will find one.',
    '',
    '— EXPERIUS',
  ].join('\n')

  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn(`[examine] RESEND_API_KEY not set — map for ${email} not sent`)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAP_FROM ?? 'EXPERIUS <hello@experius.xyz>',
      to: email,
      subject: 'Your map — where the work leaks',
      text,
    }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
}
