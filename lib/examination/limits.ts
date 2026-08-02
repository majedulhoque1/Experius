import { createHash } from 'node:crypto'

/*
  Guardrails for a public endpoint that spends money.

  Two separate protections, because they fail differently:

  · Rate limit — stops one visitor (or one script) burning the budget.
  · Monthly spend cap — stops *everyone together* doing it. This is the one that
    actually bounds the liability, and it must be durable: an in-memory counter
    resets on every cold start, which on serverless is often.

  Both read through a store so the durable implementation can be swapped in.
  The in-memory store is for local development only and says so.
*/

export const RATE_LIMIT = { maxPerWindow: 5, windowMinutes: 60 }
export const MONTHLY_SPEND_CAP_USD = 25

export type ExaminationRow = {
  ip_hash: string
  /** Volunteered in exchange for the map. Confidential — publish aggregates only. */
  name: string | null
  email: string | null
  marked_ids: string[]
  marked_count: number
  follow_ups: { question: string; answer: string }[] | null
  /** Free-text description of their situation, in their own words. Confidential, same as name/email. */
  other_pain: string | null
  indicated: string[]
  severity: string
  referrer: string | null
  utm: string | null
  cost_usd: number
  generated: boolean
  /**
   * The map the visitor was shown and emailed, and our internal read on them.
   * Both are already schema-validated by the time they get here. Null on the
   * follow-ups stage and on any degraded path, which is why `generated` stays
   * the flag the admin list filters on rather than testing these for null.
   */
  map?: unknown
  brief?: unknown
}

export interface UsageStore {
  /** Submissions from this visitor since the given instant. */
  countRecent(ipHash: string, sinceISO: string): Promise<number>
  /** Total spend for the current calendar month, in USD. */
  monthSpendUsd(): Promise<number>
  record(row: ExaminationRow): Promise<void>
}

/**
 * Hash the IP rather than storing it — we need to count repeat submissions, not
 * to know who anyone is. The salt keeps the hashes from being reversible via a
 * rainbow table of the IPv4 space, which is small enough to enumerate.
 */
export function hashIp(ip: string, salt = process.env.EXAMINATION_SALT ?? ''): string {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

/** Local development only — resets on every cold start, so it caps nothing in production. */
export class MemoryStore implements UsageStore {
  private rows: (ExaminationRow & { at: number })[] = []
  async countRecent(ipHash: string, sinceISO: string) {
    const since = Date.parse(sinceISO)
    return this.rows.filter((r) => r.ip_hash === ipHash && r.at >= since).length
  }
  async monthSpendUsd() {
    const start = new Date()
    start.setUTCDate(1)
    start.setUTCHours(0, 0, 0, 0)
    return this.rows
      .filter((r) => r.at >= start.getTime())
      .reduce((sum, r) => sum + r.cost_usd, 0)
  }
  async record(row: ExaminationRow) {
    this.rows.push({ ...row, at: Date.now() })
  }
}

/** Durable store. Uses the service-role key, so it must only ever run server-side. */
export class SupabaseStore implements UsageStore {
  constructor(
    private url = process.env.SUPABASE_URL!,
    private key = process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ) {
    if (!this.url || !this.key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set')
  }

  private headers() {
    return {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      // Supabase's REST layer rejects requests without a UA from some networks.
      'User-Agent': 'experius-examination/1',
    }
  }

  async countRecent(ipHash: string, sinceISO: string) {
    const q = `${this.url}/rest/v1/examinations?select=id&ip_hash=eq.${ipHash}&created_at=gte.${sinceISO}`
    const res = await fetch(q, { headers: { ...this.headers(), Prefer: 'count=exact' } })
    if (!res.ok) throw new Error(`countRecent failed: ${res.status}`)
    // content-range comes back as "0-4/5"; the total is what we want.
    const total = res.headers.get('content-range')?.split('/')[1]
    return total && total !== '*' ? Number(total) : (await res.json()).length
  }

  async monthSpendUsd() {
    const start = new Date()
    start.setUTCDate(1)
    start.setUTCHours(0, 0, 0, 0)
    const q = `${this.url}/rest/v1/examinations?select=cost_usd&created_at=gte.${start.toISOString()}`
    const res = await fetch(q, { headers: this.headers() })
    if (!res.ok) throw new Error(`monthSpendUsd failed: ${res.status}`)
    const rows: { cost_usd: number }[] = await res.json()
    return rows.reduce((sum, r) => sum + (r.cost_usd ?? 0), 0)
  }

  async record(row: ExaminationRow) {
    const res = await fetch(`${this.url}/rest/v1/examinations`, {
      method: 'POST',
      headers: { ...this.headers(), Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    })
    if (!res.ok) throw new Error(`record failed: ${res.status} ${await res.text()}`)
  }
}

export function defaultStore(): UsageStore {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? new SupabaseStore()
    : new MemoryStore()
}

export type LimitVerdict = { ok: true } | { ok: false; reason: 'rate' | 'budget' }

export async function checkLimits(store: UsageStore, ipHash: string): Promise<LimitVerdict> {
  const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString()
  const [recent, spend] = await Promise.all([store.countRecent(ipHash, since), store.monthSpendUsd()])
  if (recent >= RATE_LIMIT.maxPerWindow) return { ok: false, reason: 'rate' }
  if (spend >= MONTHLY_SPEND_CAP_USD) return { ok: false, reason: 'budget' }
  return { ok: true }
}
