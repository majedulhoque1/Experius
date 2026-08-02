/*
  Case-study content model.

  The metric union is the honesty mechanism. EXPERIUS has very little
  production telemetry yet, and the temptation on an agency site is to invent
  plausible-sounding numbers. Making "we don't have this yet" a first-class
  variant means an unproven figure cannot be typed as a proven one — the
  compiler refuses. There is deliberately no "estimated" or "projected" case.
*/

export const MODULES = {
  'intelligent-websites': 'Intelligent Websites',
  'ai-chatbots': 'AI Chatbots',
  'workflow-automation': 'Workflow Automation',
  'smart-booking-crm': 'Smart Booking & CRM',
  'analytics-dashboards': 'Analytics Dashboards',
  'content-ecosystems': 'Content Ecosystems',
} as const

export type ModuleSlug = keyof typeof MODULES

export type Pillar = 'strategize' | 'systemize' | 'automate'

export type Metric =
  /** Read from a live system, or stated by the client. Carries its own date. */
  | {
      status: 'verified'
      value: string
      label: string
      asOf: string
      source: 'system' | 'client' | 'public-marketing-claim'
    }
  /** True by construction — provable by reading the code, not by measuring. */
  | {
      status: 'architectural'
      value: string
      label: string
      provenance: string
    }
  /** Reasoned from what we know, and labelled as reasoning in the UI. */
  | { status: 'inference'; label: string; note: string }
  /** Instrumented but not yet meaningful. Renders as a pending reading. */
  | { status: 'pending'; label: string; note: string }

export type PullQuote = {
  text: string
  attribution: string
  source: 'client' | 'internal-build-note' | 'public-marketing-claim'
}

export type ArchitectureNode = {
  id: string
  label: string
  module: ModuleSlug
  /** Node ids this one feeds. Drives the generated architecture diagram. */
  feeds?: string[]
}

export type CaseStudy = {
  slug: string
  kind: 'project' | 'product'
  clientName: string
  clientKind: string
  status: 'live' | 'deploy-ready' | 'in-development'
  year: string
  summary: string
  /** Optional external link, plus how safe it is to send a stranger there. */
  demo?: { url: string; kind: 'live-site' | 'sandbox' | 'walkthrough'; label: string }

  intro: string
  problem: { narrative: string; painPoints: string[] }
  solution: {
    narrative: string
    modulesUsed: ModuleSlug[]
    moduleDetails: Partial<Record<ModuleSlug, string>>
    architecture: ArchitectureNode[]
  }
  results: { narrative: string; metrics: Metric[] }
  conclusion: string
  pullQuotes: PullQuote[]

  relatedSlug?: string
  /** Date to revisit and replace pending metrics with measured ones. */
  metricsReviewDue?: string
}

export type ComingSoon = {
  slug: string
  kind: 'product'
  clientName: string
  clientKind: string
  status: 'coming-soon'
  summary: string
}

export const isComingSoon = (e: CaseStudy | ComingSoon): e is ComingSoon =>
  e.status === 'coming-soon'
