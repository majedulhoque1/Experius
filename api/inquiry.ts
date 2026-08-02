import { handleInquiry, type InquiryStore, type InquiryRow } from '../lib/inquiry/handler.js'
import { hashIp } from '../lib/examination/limits.js'

/* Thin adapter, same shape as api/examine.ts. Logic lives in lib/inquiry. */

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
}

class SupabaseInquiryStore implements InquiryStore {
  private url = process.env.SUPABASE_URL!
  private key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  constructor() {
    if (!this.url || !this.key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set')
  }
  private headers() {
    return {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'User-Agent': 'experius-inquiry/1',
    }
  }
  async countRecent(ipHash: string, sinceISO: string) {
    // ip_hash lives inside `details` (jsonb) — the kit's contract has no
    // dedicated column for it. PostgREST's ->> operator filters on the key directly.
    const q = `${this.url}/rest/v1/inquiries?select=id&details->>ip_hash=eq.${ipHash}&created_at=gte.${sinceISO}`
    const res = await fetch(q, { headers: { ...this.headers(), Prefer: 'count=exact' } })
    if (!res.ok) throw new Error(`countRecent ${res.status}`)
    const total = res.headers.get('content-range')?.split('/')[1]
    return total && total !== '*' ? Number(total) : (await res.json()).length
  }
  async record(row: InquiryRow) {
    const res = await fetch(`${this.url}/rest/v1/inquiries`, {
      method: 'POST',
      headers: { ...this.headers(), Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    })
    if (!res.ok) throw new Error(`record ${res.status} ${await res.text()}`)
  }
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  let payload: Record<string, unknown>
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : ((req.body ?? {}) as Record<string, unknown>)
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid json' })
  }

  const fwd = req.headers['x-forwarded-for']
  const ip =
    (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '0.0.0.0'

  let store: InquiryStore
  try {
    store = new SupabaseInquiryStore()
  } catch {
    // No store configured is a real outage, not a validation problem — say so
    // and hand back the mailto rather than accepting into a void.
    const { validate, mailtoFor } = await import('../lib/inquiry/handler')
    const { fields, value } = validate({ ...payload, ip } as never)
    if (Object.keys(fields).length) return res.status(400).json({ ok: false, error: 'invalid', fields })
    console.warn('[inquiry] no store configured — enquiry not persisted')
    return res.status(503).json({ ok: false, error: 'unavailable', mailto: mailtoFor(value) })
  }

  const result = await handleInquiry(
    {
      ...payload,
      ip,
      referrer: (req.headers.referer as string) ?? null,
      utm: typeof payload.utm === 'string' ? payload.utm.slice(0, 200) : null,
    } as never,
    store,
    hashIp,
  )

  if (result.internal?.row) {
    void notify(result.internal.row).catch((err) =>
      console.error('[inquiry] notify failed', String(err)),
    )
  }

  res.setHeader('Cache-Control', 'no-store')
  res.status(result.status).json(result.body)
}

async function notify(row: InquiryRow) {
  const text = [
    `${row.name} <${row.email}>`,
    row.details.business ? row.details.business : '',
    '',
    row.message,
    '',
    row.details.utm ? `Source: ${row.details.utm}` : '',
    row.details.referrer ? `Referrer: ${row.details.referrer}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[inquiry] RESEND_API_KEY not set — notification not sent:\n' + text)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.BRIEF_FROM ?? 'enquiries@experius.xyz',
      to: process.env.BRIEF_TO ?? 'hello@experius.xyz',
      reply_to: row.email,
      subject: `Enquiry — ${row.name}${row.details.business ? ' · ' + row.details.business : ''}`,
      text,
    }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}`)
}
