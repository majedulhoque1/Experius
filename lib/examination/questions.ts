/*
  Canonical definition of the examination.

  The v6 prototype carries its own copy in
  `assets/data.js` because it runs without a bundler.
  `scripts/check-examination-sync.mjs` asserts the two stay identical — drift
  between them would mean the map is generated from different questions than the
  visitor answered.
*/

export const MODULES = [
  'Intelligent Websites',
  'Content Ecosystems',
  'Smart Booking & CRM',
  'Analytics Dashboards',
  'Workflow Automation',
  'AI Chatbots',
] as const

export type ModuleName = (typeof MODULES)[number]

export const PHASE_OF: Record<ModuleName, 'Strategize' | 'Systemize' | 'Automate'> = {
  'Intelligent Websites': 'Strategize',
  'Content Ecosystems': 'Strategize',
  'Smart Booking & CRM': 'Systemize',
  'Analytics Dashboards': 'Systemize',
  'Workflow Automation': 'Automate',
  'AI Chatbots': 'Automate',
}

export type Question = {
  /** Stable id — persisted, so never renumber. Append only. */
  id: string
  text: string
  module: ModuleName
}

export const QUESTIONS: Question[] = [
  { id: 'q1', text: 'The same customer detail gets typed into more than one place.', module: 'Smart Booking & CRM' },
  { id: 'q2', text: 'Enquiries arrive after hours and wait until morning — or longer.', module: 'AI Chatbots' },
  { id: 'q3', text: 'Bookings are confirmed by hand, over messages or phone.', module: 'Smart Booking & CRM' },
  { id: 'q4', text: "Nobody can say where last month's customers actually came from.", module: 'Analytics Dashboards' },
  { id: 'q5', text: 'Follow-ups depend on somebody remembering to send them.', module: 'Workflow Automation' },
  { id: 'q6', text: 'The website cannot do anything except be looked at.', module: 'Intelligent Websites' },
  { id: 'q7', text: 'Invoices, records or reports are assembled manually each time.', module: 'Workflow Automation' },
  { id: 'q8', text: 'Marketing restarts from zero every month with nothing compounding.', module: 'Content Ecosystems' },
]

export const MAX_MARKS = QUESTIONS.length

/** Modules indicated by a set of marked question ids, in payback order. */
export function indicatedModules(markedIds: string[]): ModuleName[] {
  const order: Record<string, number> = { Strategize: 0, Systemize: 1, Automate: 2 }
  const set = new Set<ModuleName>()
  for (const id of markedIds) {
    const q = QUESTIONS.find((x) => x.id === id)
    if (q) set.add(q.module)
  }
  return [...set].sort((a, b) => order[PHASE_OF[a]] - order[PHASE_OF[b]])
}
