import type { CaseStudy } from '../types'

/*
  Angel Foundation's Supabase project sits on a different account to the one
  our management token can reach, so no live figures were available when this
  was written. Every claim below is therefore either architectural — provable
  by reading the shipped code — or explicitly labelled as inference. The
  "1,000 children" figure is the Foundation's own public claim and is marked
  as such rather than presented as something our system measured.
*/

export const angelFoundation: CaseStudy = {
  slug: 'angel-foundation',
  kind: 'project',
  clientName: 'Angel Foundation',
  clientKind: 'Special-needs childrens charity, Dhaka',
  status: 'live',
  year: '2026',
  summary:
    'A charity whose entire intake ran through a Facebook inbox now takes consultation bookings itself, around the clock, without exposing a single family\'s details.',
  demo: {
    url: 'https://www.angelfoundationbd.org',
    kind: 'live-site',
    label: 'Visit the live site',
  },

  intro:
    'Angel Foundation For Children With Special Needs was founded in 2010 by Ms. Selina Ahmed. It provides special education, speech and language therapy, occupational therapy and physiotherapy to children across Dhaka, and says it has served over a thousand families in that time.',

  problem: {
    narrative:
      'The Foundation\'s reach had outgrown the way it handled enquiries. A parent looking for help found a Facebook page, sent a message, and then waited — for someone to notice, to check a paper diary, and to write back. Every consultation booked was a conversation somebody had to remember to finish, and none of it was recorded anywhere that could be counted, reported on, or handed to a colleague.',
    painPoints: [
      'Enquiries arrived in a social inbox with no queue and no owner',
      'Appointments lived in a diary rather than a system anyone could check',
      'Nothing was recorded, so nothing could be reported to funders',
      'Every website change needed a developer',
    ],
  },

  solution: {
    narrative:
      'We built the Foundation a spine: one place where content, enquiries and appointments all live, and which their own staff can operate without calling us. The booking flow was the delicate part. Families disclose sensitive circumstances when they ask for help, so availability is exposed through security-definer database functions that return only whether a slot is free — never who holds it, never anybody else\'s details.',
    modulesUsed: [
      'intelligent-websites',
      'smart-booking-crm',
      'workflow-automation',
      'analytics-dashboards',
      'content-ecosystems',
    ],
    moduleDetails: {
      'intelligent-websites':
        'A public site whose every section — services, events, training, milestones, facilities, success stories — is content the Foundation edits itself.',
      'smart-booking-crm':
        'Self-service consultation booking with real availability. Requests arrive as pending and are confirmed by staff, so the calendar is never taken out of their hands.',
      'workflow-automation':
        'Booking events write to a notification outbox that feeds an SMS gateway and a Telegram alert, so a new request reaches a human without anyone refreshing a page.',
      'analytics-dashboards':
        'Self-hosted, cookieless analytics: traffic, sources, top pages and conversions, kept in the Foundation\'s own database.',
      'content-ecosystems':
        'A blog, family testimonials and a categorised content library, all editable from the same admin.',
    },
    architecture: [
      { id: 'site', label: 'Public site', module: 'intelligent-websites', feeds: ['booking', 'analytics'] },
      { id: 'booking', label: 'Consultation booking', module: 'smart-booking-crm', feeds: ['outbox', 'admin'] },
      { id: 'outbox', label: 'Notification outbox', module: 'workflow-automation' },
      { id: 'admin', label: 'Admin + CRM', module: 'smart-booking-crm' },
      { id: 'analytics', label: 'First-party analytics', module: 'analytics-dashboards' },
      { id: 'cms', label: 'Content library', module: 'content-ecosystems', feeds: ['site'] },
    ],
  },

  results: {
    narrative:
      'The site went live recently enough that it would be dishonest to quote traffic or booking volumes — so we are not going to. What can be said precisely is what changed structurally: a parent can now book a consultation at eleven at night without waiting for an inbox to be read, staff have thirteen admin screens where they previously had a social inbox and a diary, and the Foundation owns a record of its own demand for the first time. The numbers will be published here once there are enough months of them to mean something.',
    metrics: [
      {
        status: 'architectural',
        value: '24/7',
        label: 'Consultation requests accepted, without staff present',
        provenance: 'Public booking flow backed by database-level slot locking',
      },
      {
        status: 'architectural',
        value: '13',
        label: 'Admin screens replacing an inbox and a paper diary',
        provenance: 'Admin route table: dashboard, bookings, availability, CRM, submissions, content, categories, blog, programs, team, families, analytics, settings',
      },
      {
        status: 'architectural',
        value: '0',
        label: 'Family details exposed by the public availability API',
        provenance: 'Availability served by security-definer functions returning free/busy only',
      },
      {
        status: 'verified',
        value: '1,000+',
        label: 'Children served since 2010 — the Foundation\'s own published figure',
        asOf: '2026-07-30',
        source: 'public-marketing-claim',
      },
      {
        status: 'inference',
        label: 'No formal booking or enquiry system existed beforehand',
        note: 'Not stated in any handover document. Inferred from the Foundation\'s prior public presence being a Facebook page, and from the project brief treating booking as newly introduced.',
      },
      {
        status: 'pending',
        label: 'Booking volume, response time and enquiry-to-consultation rate',
        note: 'Instrumented from launch. First meaningful reading due once roughly a quarter of data exists.',
      },
    ],
  },

  conclusion:
    'A charity that was reachable only during office hours, through a channel nobody owned, now has a front door that is open all the time and a record of everyone who knocks. The interesting numbers do not exist yet — but for the first time they are being collected.',

  pullQuotes: [
    {
      text: 'Families disclose difficult things when they ask for help. The booking system was built so the website can show that a slot is free without ever revealing who is in the next one.',
      attribution: 'EXPERIUS build notes',
      source: 'internal-build-note',
    },
  ],

  metricsReviewDue: '2026-10-01',
}
