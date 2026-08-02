import type { CaseStudy } from '../types'

/*
  Funnel figures were read directly from the live Noree Supabase project
  (analytics_events, ref lqxjwbzmsathjsulcnth) on 30 July 2026, covering
  12 June – 30 July 2026.

  The raw order count is deliberately not published. It is a young store and
  a single-digit absolute would misrepresent a system that is working exactly
  as instrumented — and it is the client's commercial data, not ours to
  broadcast. The ratios tell the true story and are the more useful number
  anyway. Nothing here is rounded up or estimated.
*/

export const noree: CaseStudy = {
  slug: 'noree-jewellery',
  kind: 'project',
  clientName: 'Noree Jewellery',
  clientKind: 'Founder-led jewellery brand',
  status: 'live',
  year: '2026',
  summary:
    'A jewellery storefront with its own order-to-invoice pipeline and first-party analytics — which is how we know exactly where it is losing sales.',
  demo: {
    url: 'https://noreejewellery.com',
    kind: 'live-site',
    label: 'Visit the live store',
  },

  intro:
    'Noree sells handmade jewellery direct to customers. The brand had product, photography and an audience. What it did not have was a shop that could take an order, invoice it, and tell anyone afterwards what had happened.',

  problem: {
    narrative:
      'Selling through social posts and direct messages works right up until it does not. Every order is a manual conversation, every invoice is written by hand, and — the expensive part — nothing is recorded. You cannot tell which pieces people actually look at, where they hesitate, or how many nearly bought and left, because none of it is written down anywhere.',
    painPoints: [
      'Orders arrived as DMs and had to be transcribed by hand',
      'Invoices were made manually, one at a time',
      'No record of what customers browsed or abandoned',
      'Product photography straight from the camera made pages slow to load',
    ],
  },

  solution: {
    narrative:
      'We built the storefront as a system rather than a catalogue: a real product database, an order flow that issues its own invoices, and — the part that matters most six months later — analytics owned by Noree rather than rented from a third party. Every product view and every add-to-cart is recorded in the brand\'s own database, which is what makes the results section below possible at all.',
    modulesUsed: [
      'intelligent-websites',
      'smart-booking-crm',
      'workflow-automation',
      'analytics-dashboards',
    ],
    moduleDetails: {
      'intelligent-websites':
        'A storefront over a structured catalogue — 138 products across 10 types, 7 categories and 3 collections, each with its own page rather than a shared grid.',
      'smart-booking-crm':
        'Orders are records, not messages. Each one carries its customer, its items and its status, and stays queryable afterwards.',
      'workflow-automation':
        'Placing an order fires a database trigger that renders a PDF invoice and emails it to the customer without anyone opening a laptop.',
      'analytics-dashboards':
        'A cookieless, first-party event stream — pageviews, product views, add-to-carts — written to Noree\'s own database and read back through an admin dashboard.',
    },
    architecture: [
      { id: 'store', label: 'Storefront', module: 'intelligent-websites', feeds: ['orders', 'analytics'] },
      { id: 'orders', label: 'Orders', module: 'smart-booking-crm', feeds: ['invoice'] },
      { id: 'invoice', label: 'Invoice + email', module: 'workflow-automation' },
      { id: 'analytics', label: 'First-party analytics', module: 'analytics-dashboards' },
    ],
  },

  results: {
    narrative:
      'Seven weeks of real trading data, and it points somewhere specific. Roughly a third of everyone who opens a product page adds it to their cart — that is a healthy number, and it means the photography, pricing and product pages are doing their job. The fall-off is entirely at the last step, between cart and completed order. That single gap is the whole of the next quarter\'s work, and the only reason anyone can see it is that the measurement was built in on day one rather than bolted on after someone asked how sales were going.',
    metrics: [
      {
        status: 'verified',
        value: '245',
        label: 'Unique visitors (12 Jun – 30 Jul 2026)',
        asOf: '2026-07-30',
        source: 'system',
      },
      {
        status: 'verified',
        value: '1,161',
        label: 'Pageviews recorded first-party',
        asOf: '2026-07-30',
        source: 'system',
      },
      {
        status: 'verified',
        value: '34%',
        label: 'Product views that became add-to-carts (51 of 152)',
        asOf: '2026-07-30',
        source: 'system',
      },
      {
        status: 'architectural',
        value: '138',
        label: 'Products live in a structured catalogue',
        provenance: 'Row count, products table',
      },
      {
        status: 'architectural',
        value: '94%',
        label: 'Image payload removed (179.8MB → 11.5MB)',
        provenance: 'Catalogue migrated to compressed WebP at upload time',
      },
      {
        status: 'pending',
        label: 'Checkout completion rate after the cart-abandonment work',
        note: 'The drop-off between cart and order is the identified problem, not yet the fixed one. Re-measured once the checkout changes ship.',
      },
    ],
  },

  conclusion:
    'The store works. More importantly, it reports on itself — so the next round of work is aimed at a specific measured gap rather than at a guess. That is the difference between a shop that was launched and a shop that is being run.',

  pullQuotes: [
    {
      text: 'A third of product views become carts. Almost none of those carts become orders. We would be guessing about both if the analytics had been an afterthought.',
      attribution: 'EXPERIUS build notes',
      source: 'internal-build-note',
    },
  ],

  metricsReviewDue: '2026-10-30',
}
