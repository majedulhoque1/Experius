import type { CaseStudy } from '../types'

/*
  Built for XEN Developments Ltd and running on their live data, which is why
  there is no open demo link — the system holds a real developer's finances.
  Facts below come from the repository: 36 tables, the route table in
  src/App.tsx, and the xen-ai-agent edge function.

  No commercial figures appear here. The numbers in that database are the
  client's, not ours to publish.
*/

export const constructionOs: CaseStudy = {
  slug: 'construction-os',
  kind: 'product',
  clientName: 'Construction OS',
  clientKind: 'Cash-flow and project control for property developers',
  status: 'live',
  year: '2026',
  summary:
    'Where the money actually went, tracked to the individual flat — cash flow, phase budgets, sales ledgers and retention in one system instead of twelve spreadsheets.',
  demo: {
    url: '',
    kind: 'walkthrough',
    label: 'Walkthrough on request — the live system holds a client\'s real finances',
  },

  intro:
    'A property developer runs several projects at once, each with its own floors, flats, phases, contractors and payment schedules. Construction OS was built for XEN Developments to answer one question reliably: on any given day, where has the money gone and what is still owed.',

  problem: {
    narrative:
      'Development finance lives in spreadsheets until it becomes unmanageable. Costs sit in one file, flat sales in another, contractor retention in a third, and loans in someone\'s head. Nothing reconciles, so the only honest answer to "how is this project doing" is a week of manual work — by which time the answer has changed.',
    painPoints: [
      'Costs, sales and loans tracked in separate, unreconciled files',
      'No reliable view of budget versus actual at phase level',
      'Contractor retention and month-end close done by hand',
      'Site managers had no way to record work from the field',
    ],
  },

  solution: {
    narrative:
      'One ledger, allocated all the way down. Every cash-flow entry can be attributed to a project, floor, flat, phase and category, so budget-versus-actual is a query rather than an afternoon. Flat sales carry their own instalment ledger and post inflow entries automatically, which means the sales side and the cash side cannot drift apart. Site managers get their own lighter interface for logging work and materials from a phone.',
    modulesUsed: ['analytics-dashboards', 'workflow-automation', 'ai-chatbots', 'smart-booking-crm'],
    moduleDetails: {
      'analytics-dashboards':
        'Cash-flow, phase budget, client dues and flat-sale summaries built as database views, plus a Gantt timeline across projects.',
      'workflow-automation':
        'Flat-sale ledger rows post their own inflow vouchers, and an overdue-payment notification service raises alerts without anyone running a report.',
      'ai-chatbots':
        'A data-aware assistant that answers questions across eight tables of live project data rather than from a scripted FAQ.',
      'smart-booking-crm':
        'Clients, payment plans, dues and receipts held per flat, so a buyer\'s position is one record rather than a reconstruction.',
    },
    architecture: [
      { id: 'setup', label: 'Project setup', module: 'smart-booking-crm', feeds: ['cashflow', 'sales'] },
      { id: 'cashflow', label: 'Cash-flow ledger', module: 'analytics-dashboards', feeds: ['reports'] },
      { id: 'sales', label: 'Flat sales + instalments', module: 'smart-booking-crm', feeds: ['cashflow'] },
      { id: 'alerts', label: 'Overdue alerts', module: 'workflow-automation' },
      { id: 'agent', label: 'Data assistant', module: 'ai-chatbots' },
      { id: 'reports', label: 'Budget vs actual', module: 'analytics-dashboards' },
    ],
  },

  results: {
    narrative:
      'The system is live and in daily use, and its commercial numbers belong to the client rather than to us — so what we can show is the shape of it. Thirty-six tables and eleven reporting views covering cash flow, sales, loans, retention and month-end close, with every row scoped to an organisation and protected at the database level rather than in the interface.',
    metrics: [
      {
        status: 'architectural',
        value: '36',
        label: 'Tables covering cash flow, sales, loans, retention and close',
        provenance: 'Supabase migration set',
      },
      {
        status: 'architectural',
        value: '11',
        label: 'Reporting views, including flat-sale and contractor-retention ledgers',
        provenance: 'Database view definitions',
      },
      {
        status: 'architectural',
        value: 'Flat-level',
        label: 'Finest grain a cost can be attributed to',
        provenance: 'cashflow_allocations keys to project, floor, flat and phase',
      },
      {
        status: 'architectural',
        value: '2',
        label: 'Role-specific interfaces — owner and site manager, including mobile',
        provenance: 'Separate admin and manager route trees',
      },
    ],
  },

  conclusion:
    'Budget-versus-actual stopped being a monthly reconstruction and became something you can look at. The developer\'s reporting is now a query against one ledger rather than a negotiation between several spreadsheets.',

  pullQuotes: [
    {
      text: 'The sales ledger posts its own cash entries. That single decision is why the money side and the sales side can no longer quietly disagree.',
      attribution: 'EXPERIUS build notes',
      source: 'internal-build-note',
    },
  ],
}
