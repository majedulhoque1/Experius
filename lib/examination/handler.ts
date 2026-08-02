import { QUESTIONS } from './questions.js'
import { deterministicResult } from './fallback.js'
import { generateFollowUps, generateMap, generationAvailable, costOf, type Usage } from './generate.js'
import {
  checkLimits,
  defaultStore,
  hashIp,
  type UsageStore,
  type ExaminationRow,
} from './limits.js'
import type { ExaminationResult, FollowUps } from './schema.js'

/*
  Framework-agnostic orchestration, so the whole path can be exercised from a
  test script without a server. `api/examine.ts` is a thin adapter over this.

  The governing behaviour: the deterministic result is computed first and
  returned no matter what. Generation is layered on top and every failure path —
  no key, rate limited, over budget, model error, malformed output — degrades to
  that result rather than to an error page. The examination is the site's
  conversion device; it does not get to break because a third party is down.
*/

export type ExamineRequest = {
  stage: 'followups' | 'map'
  markedIds: string[]
  followUps?: { question: string; answer: string }[]
  /** Free-text description of their situation, when the 8 statements don't fit. */
  otherPain?: string
  /** Required to draw the map — it is emailed to them. */
  name?: string
  email?: string
  ip: string
  referrer?: string | null
  utm?: string | null
}

export type ExamineResponse = {
  status: number
  /** Serialized to the visitor. */
  body: {
    deterministic: ReturnType<typeof deterministicResult>
    followUps?: FollowUps['questions']
    map?: ExaminationResult['map']
    /** Why generation didn't happen, when it didn't. Shown to nobody; logged. */
    degraded?: 'unavailable' | 'rate' | 'budget' | 'error' | 'identity'
  }
  /**
   * Never serialized. The brief rides out of the same generation call that
   * produced the map — regenerating it would double the cost — but it is our
   * read on the visitor and must not be returned to them.
   */
  internal?: {
    brief: ExaminationResult['brief']
    map: ExaminationResult['map']
    name: string
    email: string
  }
}

function validMarkedIds(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  const known = new Set(QUESTIONS.map((q) => q.id))
  // Dedupe and drop anything not in the canonical list — the ids are persisted
  // as a research dataset, so junk must not get in.
  return [...new Set(input.filter((x): x is string => typeof x === 'string' && known.has(x)))]
}

/*
  Deliberately permissive. This is a lead form, not an auth system — the cost of
  rejecting a real address that happens to look unusual is far higher than the
  cost of accepting a fake one, which simply never receives the email.
*/
function validEmail(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const email = v.trim().slice(0, 320)
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null
}

function validName(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const name = v.trim().replace(/\s+/g, ' ').slice(0, 120)
  return name.length >= 2 ? name : null
}

function sanitizeOtherPain(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const text = v.trim().slice(0, 500)
  return text.length ? text : null
}

function sanitizeFollowUps(input: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(input)) return []
  return input
    .filter(
      (f): f is { question: string; answer: string } =>
        !!f && typeof f.question === 'string' && typeof f.answer === 'string',
    )
    .slice(0, 3)
    .map((f) => ({ question: f.question.slice(0, 300), answer: f.answer.slice(0, 1000) }))
}

export async function handleExamine(
  req: ExamineRequest,
  store: UsageStore = defaultStore(),
): Promise<ExamineResponse> {
  const markedIds = validMarkedIds(req.markedIds)
  const followUps = sanitizeFollowUps(req.followUps)
  const otherPain = sanitizeOtherPain(req.otherPain)
  const deterministic = deterministicResult(markedIds)
  const name = validName(req.name)
  const email = validEmail(req.email)

  const ok = (
    extra: Partial<ExamineResponse['body']> = {},
    internal?: ExamineResponse['internal'],
  ): ExamineResponse => ({ status: 200, body: { deterministic, ...extra }, internal })

  // Check identity before the key, the limits, or any spend — a visitor who
  // hasn't given a name and email must never cost us a generation.
  if (req.stage === 'map' && (!name || !email)) return ok({ degraded: 'identity' })

  if (!generationAvailable()) return ok({ degraded: 'unavailable' })

  const ipHash = hashIp(req.ip)
  let verdict
  try {
    verdict = await checkLimits(store, ipHash)
  } catch {
    // A limits backend that is down must not open the gate on a paid endpoint.
    return ok({ degraded: 'error' })
  }
  if (!verdict.ok) return ok({ degraded: verdict.reason })

  let usage: Usage = { input: 0, output: 0, cacheRead: 0 }
  try {
    if (req.stage === 'followups') {
      const { data, usage: u } = await generateFollowUps(markedIds, otherPain ?? undefined)
      usage = u
      // Follow-ups are an intermediate step — recorded for cost, not as a
      // completed examination, so they don't pollute the research dataset.
      await recordQuietly(store, {
        ip_hash: ipHash,
        name: null,
        email: null,
        marked_ids: markedIds,
        marked_count: markedIds.length,
        follow_ups: null,
        other_pain: otherPain,
        indicated: deterministic.indicated,
        severity: deterministic.severity,
        referrer: req.referrer ?? null,
        utm: req.utm ?? null,
        cost_usd: costOf(u),
        generated: false,
      })
      return ok({ followUps: data.questions })
    }

    const { data, usage: u } = await generateMap({ markedIds, followUps, otherPain: otherPain ?? undefined })
    usage = u
    await recordQuietly(store, {
      ip_hash: ipHash,
      name,
      email,
      marked_ids: markedIds,
      marked_count: markedIds.length,
      follow_ups: followUps.length ? followUps : null,
      other_pain: otherPain,
      indicated: deterministic.indicated,
      severity: deterministic.severity,
      referrer: req.referrer ?? null,
      utm: req.utm ?? null,
      cost_usd: costOf(u),
      generated: true,
      // Kept, not just emailed. Mail can bounce, be filtered, or be deleted —
      // the admin panel is the durable copy of what this visitor was told.
      map: data.map,
      brief: data.brief,
    })
    return ok(
      { map: data.map },
      { brief: data.brief, map: data.map, name: name!, email: email! },
    )
  } catch (err) {
    console.error('[examine] generation failed', { stage: req.stage, err: String(err), usage })
    return ok({ degraded: 'error' })
  }
}

/** Persistence must never take the response down with it. */
async function recordQuietly(store: UsageStore, row: ExaminationRow) {
  try {
    await store.record(row)
  } catch (err) {
    console.error('[examine] record failed', String(err))
  }
}

