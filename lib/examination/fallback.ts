import { QUESTIONS, indicatedModules } from './questions'

/*
  The AI-off path.

  The examination is the site's conversion device, so it must never depend on a
  third-party API being reachable. This module computes everything the current
  prototype already shows — verdict, gauge, indicated modules — with no network
  call at all. The generated map is layered on top as an enhancement; when
  generation fails, the visitor still gets a complete, useful result and is
  simply invited to the meeting for the full map.
*/

const VERDICTS = [
  {
    v: 'No marks yet. Tick what is true and the file opens itself.',
    d: 'Every item above is a seam between two tools. Businesses do not fail at the tasks — they fail at the joins, where information has to be carried across by a person who is also doing something else.',
  },
  {
    v: 'One seam showing.',
    d: 'A single join is survivable, and it is also the cheapest moment to close it. Left alone, one manual handover is what every larger mess grows out of — because the next tool you buy will be joined the same way.',
  },
  {
    v: 'Two joins carried by hand.',
    d: 'Two is where the pattern starts. Nobody notices the cost yet because it is spread across the week in three-minute pieces, which is exactly why it never gets fixed.',
  },
  {
    v: 'Structural drag. Three joins, all manual.',
    d: 'At three, the business has a shape: work moves, but only because somebody keeps pushing it. Growth from here multiplies the pushing rather than the profit.',
  },
  {
    v: 'The seams are now the job.',
    d: "Four marks means a meaningful part of somebody's week is spent moving information between tools that could be reading from the same record. That time is not recoverable by working harder.",
  },
  {
    v: 'You are the integration layer.',
    d: 'Five marks and the system holding this business together is a person. It works — until they are ill, busy, or leave. This is the point at which more marketing makes things measurably worse.',
  },
  {
    v: 'Serious. The business runs on memory.',
    d: 'Six joins carried by hand means outcomes depend on who remembered what. Nothing here is a discipline problem; it is a structure problem, and no amount of effort will out-run it.',
  },
  {
    v: 'Critical. Growth would hurt you right now.',
    d: 'Seven marks. Every new customer arrives into a corridor that already leaks. The correct order is to close the joins first — then spend on getting more people into it.',
  },
  {
    v: 'All eight. Start with the map, not the build.',
    d: 'This is not unusual and it is not a judgement — it is what happens when a business grows by adding a tool each time it hits a wall. It also means the first fix is worth more here than anywhere else.',
  },
]

export type Severity = 'mild' | 'moderate' | 'serious' | 'critical'

export function severityOf(n: number): Severity {
  if (n <= 2) return 'mild'
  if (n <= 4) return 'moderate'
  if (n <= 6) return 'serious'
  return 'critical'
}

/** Everything the examination shows without any model call. */
export function deterministicResult(markedIds: string[]) {
  const valid = markedIds.filter((id) => QUESTIONS.some((q) => q.id === id))
  const n = Math.min(valid.length, VERDICTS.length - 1)
  return {
    marked: valid.length,
    total: QUESTIONS.length,
    verdict: VERDICTS[n].v,
    detail: VERDICTS[n].d,
    severity: severityOf(valid.length),
    indicated: indicatedModules(valid),
  }
}

export { VERDICTS }
