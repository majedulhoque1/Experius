import type { ModuleSlug, Pillar } from './types'

/*
  The three pillars and the six modules come from the founding whiteboard.
  Each module belongs to exactly one pillar — that mapping is what lets the
  site show six services without feeling like a six-item menu.
*/

export const PILLARS: Record<
  Pillar,
  { index: string; name: string; claim: string; body: string; modules: ModuleSlug[] }
> = {
  strategize: {
    index: '01',
    name: 'Strategize',
    claim: 'Find where the business actually leaks.',
    body:
      'Before anything gets built we map how work really moves — where enquiries arrive, where they stall, and which step quietly costs the most. Most businesses do not have a growth problem. They have a structure problem, and it is usually three steps upstream of where it hurts.',
    modules: ['intelligent-websites', 'content-ecosystems'],
  },
  systemize: {
    index: '02',
    name: 'Systemize',
    claim: 'Give the work one place to live.',
    body:
      'Scattered tools are the tax. We replace the spreadsheet-and-inbox arrangement with a single spine — one place enquiries land, one place the calendar lives, one record per client that every screen reads from. Structure first, because you cannot automate a process that is not defined.',
    modules: ['smart-booking-crm', 'analytics-dashboards'],
  },
  automate: {
    index: '03',
    name: 'Automate',
    claim: 'Then take the repetitive parts off your desk.',
    body:
      'With the spine in place, the routine work can run itself: follow-ups that fire without being remembered, notifications that reach the right person, assistants that answer at 2am in the customer\'s own language. Automation last, on purpose — done first, it just makes chaos faster.',
    modules: ['workflow-automation', 'ai-chatbots'],
  },
}

export const PILLAR_ORDER: Pillar[] = ['strategize', 'systemize', 'automate']

export const MODULE_DESCRIPTIONS: Record<ModuleSlug, string> = {
  'intelligent-websites':
    'A site engineered as the front door of an operating system, not a brochure that happens to have a contact form.',
  'ai-chatbots':
    'Assistants that qualify and route enquiries in your voice — and in Bangla when that is what the customer speaks.',
  'workflow-automation':
    'The cross-tool plumbing that removes the copy-paste work quietly draining your team every week.',
  'smart-booking-crm':
    'Real availability, real slot locking, one record per client — so nothing double-books and nothing goes missing.',
  'analytics-dashboards':
    'The numbers that decide something. Where enquiries come from, where they stall, what converts.',
  'content-ecosystems':
    'A publishing system that compounds, instead of campaigns that reset to zero every month.',
}
