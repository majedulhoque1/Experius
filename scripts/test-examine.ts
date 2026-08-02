/*
  Exercises the full examination path without a server.

  Runs in two modes automatically:

  · No OPENROUTER_API_KEY → verifies the degraded path, the deterministic
    result, input sanitisation, and the limits. This is the mode that matters
    most: it proves the conversion device works with AI switched off.

  · Key present           → additionally generates real follow-ups and a real
    map, validates them against the schema, and prints them for reading, with
    the measured cost.

  Run: npx tsx scripts/test-examine.ts
*/

/* Same loader as scripts/serve.ts. Every env read downstream is lazy (inside
   functions, not at module scope), so this still lands before anything asks
   for a key despite ESM hoisting the imports above it. */
try {
  process.loadEnvFile('.env.local')
} catch {
  // Absent is fine — the suite has a full no-key mode.
}

import { handleExamine } from '../lib/examination/handler'
import { MemoryStore, RATE_LIMIT, hashIp } from '../lib/examination/limits'
import { generationAvailable } from '../lib/examination/generate'
import { QUESTIONS, indicatedModules } from '../lib/examination/questions'
import { deterministicResult } from '../lib/examination/fallback'

let failures = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`  ✓ ${name}`)
  } else {
    failures++
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`)
  }
}

const ip = '203.0.113.7'
const SAMPLE = ['q1', 'q2', 'q5', 'q7']
/* The map stage is gated on identity, so any test targeting a *later* gate
   (limits, spend, errors) must get past this one first. */
const ID = { name: 'Rafiq Hasan', email: 'rafiq@example.com' }

console.log('\n── Deterministic core (no network) ───────────────────────────')
{
  const r = deterministicResult(SAMPLE)
  check('counts marks', r.marked === 4)
  check('severity scales', r.severity === 'moderate', r.severity)
  check('verdict is non-empty', r.verdict.length > 10)
  check(
    'indicated modules deduped',
    r.indicated.length === new Set(r.indicated).size,
    r.indicated.join(', '),
  )
  check(
    'indicated ordered Strategize→Systemize→Automate',
    JSON.stringify(r.indicated) === JSON.stringify(indicatedModules(SAMPLE)),
  )
  const empty = deterministicResult([])
  check('zero marks is a valid state', empty.marked === 0 && empty.severity === 'mild')
  const all = deterministicResult(QUESTIONS.map((q) => q.id))
  check('all eight marks is critical', all.severity === 'critical')
}

console.log('\n── Input sanitisation ────────────────────────────────────────')
{
  const store = new MemoryStore()
  const res = await handleExamine(
    // Junk ids, duplicates, and a non-string all get dropped. Deliberately no
    // identity: sanitisation happens before the gate, so withholding it proves
    // the same thing without paying for a generation to do it.
    { stage: 'map', markedIds: ['q1', 'q1', 'nope', '<script>', 'q3'] as string[], ip },
    store,
  )
  check('unknown ids dropped', res.body.deterministic.marked === 2, String(res.body.deterministic.marked))
  check('duplicates collapsed', res.body.deterministic.marked === 2)
  check('never returns the brief to the client', !('brief' in res.body))
}

console.log('\n── Free-text pain point ──────────────────────────────────────')
{
  const { buildFollowUpPrompt, buildMapPrompt } = await import('../lib/examination/prompt')

  const withText = buildFollowUpPrompt(['q1'], 'We are drowning in WhatsApp messages.')
  check('otherPain appears in the follow-up prompt', withText.includes('We are drowning in WhatsApp messages.'))

  const withoutText = buildFollowUpPrompt(['q1'])
  check('follow-up prompt omits the block when otherPain is absent', !withoutText.includes('their own words'))

  const mapWithText = buildMapPrompt({ markedIds: [], otherPain: 'Only free text, no boxes ticked.' })
  check('map prompt carries otherPain even with zero marked ids', mapWithText.includes('Only free text, no boxes ticked.'))

  const store = new MemoryStore()
  const res = await handleExamine(
    { stage: 'followups', markedIds: [], otherPain: '  needs trimming  ', ip },
    store,
  )
  check('follow-ups are not gated by identity when only otherPain is given', res.body.degraded !== 'identity', String(res.body.degraded))
}

console.log('\n── Degraded paths ────────────────────────────────────────────')
{
  // Every degrade reason is reachable without spending: identity short-circuits
  // before the key is even read, and a dead limits backend fails closed. The one
  // paid path is exercised once, at the end, on purpose.
  const gated = await handleExamine({ stage: 'map', markedIds: SAMPLE, ip }, new MemoryStore())
  check('always 200 — never an error page', gated.status === 200)
  check('deterministic result always present', !!gated.body.deterministic.verdict)
  check('no map on a degraded path', gated.body.map === undefined)
  check('the reason is reported for the log', typeof gated.body.degraded === 'string')
}

console.log('\n── Identity gate ─────────────────────────────────────────────')
{
  const store = new MemoryStore()
  const none = await handleExamine({ stage: 'map', markedIds: SAMPLE, ip }, store)
  check('map refused without name/email', none.body.degraded === 'identity', String(none.body.degraded))
  check('the free verdict is still returned', !!none.body.deterministic.verdict)

  const bad = await handleExamine(
    { stage: 'map', markedIds: SAMPLE, name: 'A', email: 'not-an-email', ip },
    store,
  )
  check('rejects a malformed email', bad.body.degraded === 'identity', String(bad.body.degraded))

  // The gate has to run before anything billable, or it isn't a gate. Measured
  // before the follow-ups call below, and on a store that has seen nothing but
  // gated requests: follow-ups are billable by design, so counting them here
  // would make this assert the opposite of what it means to.
  const spend = await store.monthSpendUsd()
  check('a gated request costs nothing', spend === 0, '$' + spend)

  const f = await handleExamine({ stage: 'followups', markedIds: SAMPLE, ip }, new MemoryStore())
  check('follow-ups are not gated', f.body.degraded !== 'identity', String(f.body.degraded))
}

console.log('\n── Rate limit ────────────────────────────────────────────────')
{
  const store = new MemoryStore()
  const h = hashIp(ip)
  for (let i = 0; i < RATE_LIMIT.maxPerWindow; i++) {
    await store.record({
      ip_hash: h, name: null, email: null, marked_ids: [], marked_count: 0, follow_ups: null, other_pain: null, indicated: [],
      severity: 'mild', referrer: null, utm: null, cost_usd: 0.01, generated: true,
    })
  }
  const res = await handleExamine({ stage: 'map', markedIds: SAMPLE, ...ID, ip }, store)
  const expected = generationAvailable() ? 'rate' : 'unavailable'
  check(`blocks after ${RATE_LIMIT.maxPerWindow} in the window`, res.body.degraded === expected, String(res.body.degraded))
  check('blocked visitor still gets a result', !!res.body.deterministic.verdict)

  // Identity withheld so this stops at the gate rather than generating — the
  // claim under test is only that it is not stopped by *rate*.
  const other = await handleExamine({ stage: 'map', markedIds: SAMPLE, ip: '198.51.100.2' }, store)
  check('limit is per visitor, not global', other.body.degraded !== 'rate', String(other.body.degraded))
}

console.log('\n── Spend cap ─────────────────────────────────────────────────')
{
  const store = new MemoryStore()
  await store.record({
    ip_hash: 'someone-else', name: null, email: null, marked_ids: [], marked_count: 0, follow_ups: null, other_pain: null, indicated: [],
    severity: 'mild', referrer: null, utm: null, cost_usd: 999, generated: true,
  })
  const res = await handleExamine({ stage: 'map', markedIds: SAMPLE, ...ID, ip }, store)
  const expected = generationAvailable() ? 'budget' : 'unavailable'
  check('cap is global, not per visitor', res.body.degraded === expected, String(res.body.degraded))
}

console.log('\n── Limits backend failure ────────────────────────────────────')
{
  const broken = {
    countRecent: async () => { throw new Error('down') },
    monthSpendUsd: async () => { throw new Error('down') },
    record: async () => {},
  }
  const res = await handleExamine({ stage: 'map', markedIds: SAMPLE, ...ID, ip }, broken)
  const expected = generationAvailable() ? 'error' : 'unavailable'
  check('fails closed — does not spend when limits are unreadable', res.body.degraded === expected, String(res.body.degraded))
}

if (!generationAvailable()) {
  console.log('\n── Generation ────────────────────────────────────────────────')
  console.log('  ⚠ skipped: OPENROUTER_API_KEY not set.')
  console.log('    Set it and re-run to exercise the model path end to end.')
} else {
  console.log('\n── Generation (live) ─────────────────────────────────────────')
  const store = new MemoryStore()

  const f = await handleExamine({ stage: 'followups', markedIds: SAMPLE, ip }, store)
  check('follow-ups generated', !!f.body.followUps?.length, String(f.body.degraded))
  check('2–3 follow-ups', (f.body.followUps?.length ?? 0) >= 2 && (f.body.followUps?.length ?? 0) <= 3)
  for (const q of f.body.followUps ?? []) console.log(`    Q: ${q.question}`)

  const answers = (f.body.followUps ?? []).map((q) => ({
    question: q.question,
    answer: 'About fifteen a week, and I handle all of them myself in the evening.',
  }))

  const m = await handleExamine(
    {
      stage: 'map', markedIds: SAMPLE, followUps: answers,
      ...ID, ip: '198.51.100.9',
    },
    store,
  )
  const map = m.body.map
  check('map generated', !!map, String(m.body.degraded))
  check('brief generated internally', !!m.internal?.brief)
  check('brief withheld from client body', !('brief' in m.body))
  check('identity carried on the internal channel', m.internal?.email === 'rafiq@example.com')

  if (map) {
    check('trace has 3–6 steps', map.trace.length >= 3 && map.trace.length <= 6)
    check('names unknowns', map.unknowns.length >= 2)
    check('indicated modules are all real', map.indicated.every((i) => QUESTIONS.some((q) => q.module === i.module)))

    /*
      The honesty rule, checked mechanically: the arithmetic must hand over a
      formula, not a computed figure about their business.

      Bare `\d{2,}` was wrong — it failed on "× 52" and "÷ 60", which are the
      number of weeks in a year and minutes in an hour, not claims about the
      visitor. Calendar and percentage constants are legitimate inside a
      formula; anything else numeric is a figure the model invented.
    */
    const TIME_CONSTANTS = new Set(['7', '12', '24', '30', '31', '52', '60', '100', '365'])
    const invented = map.arithmetic.flatMap((a) =>
      (a.formula.match(/\d+/g) ?? []).filter((n) => !TIME_CONSTANTS.has(n)).map((n) => `${n} in "${a.formula}"`),
    )
    check('arithmetic gives formulas, not invented figures', invented.length === 0, invented.join(' | '))

    console.log('\n    ── The map ──')
    console.log(`    ${map.headline}\n`)
    console.log(`    ${map.summary}\n`)
    for (const t of map.trace) {
      console.log(`      → ${t.step}`)
      if (t.seam) console.log(`        ✕ ${t.seam}`)
    }
    console.log(`\n    Costliest: ${map.costliest.step}`)
    console.log(`      ${map.costliest.why}`)
    console.log('\n    Arithmetic:')
    for (const a of map.arithmetic) console.log(`      ${a.label}: ${a.formula}`)
    console.log('\n    Unknowns:')
    for (const u of map.unknowns) console.log(`      · ${u}`)
    console.log('\n    ── The brief (internal) ──')
    console.log(`    ${m.internal?.brief.summary}`)
    console.log(`    Open with: ${m.internal?.brief.openingQuestion}`)
  }

  const spend = await store.monthSpendUsd()
  console.log(`\n    Measured cost for this run: $${spend.toFixed(4)}`)
}

console.log(`\n${failures ? `⚠ ${failures} check(s) failed` : '✓ all checks passed'}\n`)
process.exit(failures ? 1 : 0)
