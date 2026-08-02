/*
  The inquiry form.

  Same discipline as the examination: validated server-side, degrades to
  something useful rather than an error, and never silently swallows a
  submission. The failure mode that matters here is the one this whole company
  argues against — a contact form that quietly loses the enquiry. So when the
  store is unreachable the response says so plainly and hands back a mailto the
  visitor can use without retyping anything.
*/

export type InquiryRequest = {
  name?: unknown
  email?: unknown
  business?: unknown
  message?: unknown
  /** Honeypot — a real person never fills this in. */
  website?: unknown
  ip: string
  referrer?: string | null
  utm?: string | null
}

/*
  Row shape matches booking-crm-kit's canonical `public.inquiries` table
  (contract/migrations/0004), not a site-specific schema — the kit's table
  won on a naming collision with an earlier, narrower version of this file.
  business/referrer/utm/ip_hash have no dedicated columns in the kit's
  contract, so they live in `details`, exactly as the kit's own comment
  describes that column's purpose: client-specific fields, no schema change.
*/
export type InquiryRow = {
  type: 'contact'
  name: string
  email: string
  phone: null
  message: string
  language: 'en'
  details: {
    business: string | null
    referrer: string | null
    utm: string | null
    ip_hash: string
  }
}

export type InquiryResponse = {
  status: number
  body:
    | { ok: true }
    | { ok: false; error: 'invalid'; fields: Record<string, string> }
    | { ok: false; error: 'unavailable'; mailto: string }
  internal?: { row: InquiryRow }
}

export interface InquiryStore {
  record(row: InquiryRow): Promise<void>
  countRecent(ipHash: string, sinceISO: string): Promise<number>
}

const LIMITS = { maxPerWindow: 3, windowMinutes: 60 }

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : ''
}

export function validate(req: InquiryRequest) {
  const fields: Record<string, string> = {}
  const name = str(req.name, 120)
  const email = str(req.email, 320)
  const business = str(req.business, 200)
  // Preserve newlines in the message — it is prose, not a field.
  const message = typeof req.message === 'string' ? req.message.trim().slice(0, 4000) : ''

  if (name.length < 2) fields.name = 'Tell us who you are.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fields.email = 'That email does not look right.'
  if (message.length < 10) fields.message = 'A sentence or two about what is going wrong.'

  return { fields, value: { name, email, business: business || null, message } }
}

/** A mailto that carries everything they typed, so a failure costs them nothing. */
export function mailtoFor(v: { name: string; business: string | null; message: string }): string {
  const body = [v.message, '', `— ${v.name}${v.business ? `, ${v.business}` : ''}`].join('\n')
  return (
    'mailto:hello@experius.xyz?subject=' +
    encodeURIComponent('Enquiry from ' + v.name) +
    '&body=' +
    encodeURIComponent(body)
  )
}

export async function handleInquiry(
  req: InquiryRequest,
  store: InquiryStore,
  hashIp: (ip: string) => string,
): Promise<InquiryResponse> {
  // Bots fill every field they find. Accept silently so they don't learn.
  if (str(req.website, 200)) return { status: 200, body: { ok: true } }

  const { fields, value } = validate(req)
  if (Object.keys(fields).length) {
    return { status: 400, body: { ok: false, error: 'invalid', fields } }
  }

  const ipHash = hashIp(req.ip)
  try {
    const since = new Date(Date.now() - LIMITS.windowMinutes * 60_000).toISOString()
    if ((await store.countRecent(ipHash, since)) >= LIMITS.maxPerWindow) {
      // Rate-limited is not a reason to lose the message — hand back the mailto.
      return { status: 429, body: { ok: false, error: 'unavailable', mailto: mailtoFor(value) } }
    }

    const row: InquiryRow = {
      type: 'contact',
      name: value.name,
      email: value.email,
      phone: null,
      message: value.message,
      language: 'en',
      details: {
        business: value.business,
        referrer: req.referrer ?? null,
        utm: req.utm ?? null,
        ip_hash: ipHash,
      },
    }
    await store.record(row)
    return { status: 200, body: { ok: true }, internal: { row } }
  } catch (err) {
    console.error('[inquiry] store failed', String(err))
    // The one failure this company exists to remove: never pretend it worked.
    return { status: 503, body: { ok: false, error: 'unavailable', mailto: mailtoFor(value) } }
  }
}
