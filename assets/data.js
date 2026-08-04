/* ══════════════════════════════════════════════════════════════════════
   All site content in one place.

   Metrics carry a provenance status and there is deliberately no
   "estimated" case:
     measured     — read from a live system on a stated date
     construction — true because of how the thing is built
     pending      — instrumented, not yet meaningful; printed anyway

   Screenshots are real captures of the live systems (scripts/capture-projects.mjs).
   Where `shots` is empty the case study says why and shows architecture instead —
   a missing capture must never become a silent blank frame.
   ══════════════════════════════════════════════════════════════════════ */

window.SITE = {
  contact: { email: 'hello@experius.xyz', city: 'Dhaka, Bangladesh' },

  /* ── The six modules ─────────────────────────────────────────────
     Eight words each. The name does most of the work; the case files
     are where a module gets explained at length. */
  modules: [
    {
      id: 'intelligent-websites', n: '01', name: 'Intelligent Websites', phase: 'Strategize',
      desc: 'A front door that acts. Not a brochure.',
      dgm: 'site',
    },
    {
      id: 'content-ecosystems', n: '02', name: 'Content Ecosystems', phase: 'Strategize',
      desc: 'Publishing that compounds. Campaigns restart at zero.',
      dgm: 'content',
    },
    {
      id: 'smart-booking-crm', n: '03', name: 'Smart Booking & CRM', phase: 'Systemize',
      desc: 'Real availability, locked slots, one record per person.',
      dgm: 'booking',
    },
    {
      id: 'analytics-dashboards', n: '04', name: 'Analytics Dashboards', phase: 'Systemize',
      desc: 'Where enquiries come from, where they stall.',
      dgm: 'analytics',
    },
    {
      id: 'workflow-automation', n: '05', name: 'Workflow Automation', phase: 'Automate',
      desc: 'The copy-paste work, off your desk.',
      dgm: 'automation',
    },
    {
      id: 'ai-chatbots', n: '06', name: 'AI Chatbots', phase: 'Automate',
      desc: 'Answers at 2am, in your voice. Bangla too.',
      dgm: 'chatbot',
    },
  ],

  /*
    The core argument as a timeline: the same enquiry followed twice, with the
    clock running. The elapsed time is the punchline — it collapses from most of
    a day to about a minute, and the hand-off count goes to zero.

    Every `gap` is capped at six words on purpose. The clock and the hand-off
    count ARE the argument; a sentence underneath each one is commentary on a
    picture that already speaks.

    `clock` is the animated cell: the scroll-scrub counts it up from zero as the
    rows arrive. `to` is in the unit named by `unit` — minutes, or a plain count.

    Set in a clinic because that is who this is built for. The times are a
    worked example, not a measured client figure; that caveat is a footnote now
    rather than a paragraph, but it is still on the page.
  */
  seams: {
    today: {
      title: 'A clinic today',
      note: 'Six tools',
      rows: [
        { at: '9:41pm', step: 'A patient enquiry arrives', gap: 'Nobody sees it until morning.' },
        { at: '10:20am', step: 'The desk answers by message', gap: 'Retyped into the appointment book.' },
        { at: '10:34am', step: 'Appointment written into the diary', gap: 'Retyped again for the invoice.' },
        { at: '11:02am', step: 'Invoice typed by hand', gap: 'Nothing recorded. Nothing countable.' },
      ],
      clock: { label: 'Elapsed', to: 801, unit: 'min' },
      meta: [['Hand-offs', '4'], ['Recorded', 'Nothing']],
      out: 'Nobody can say what was lost.',
    },
    after: {
      title: 'The same clinic, one record',
      note: 'Same six, one spine',
      rows: [
        { at: '9:41pm', step: 'A patient enquiry arrives', gap: 'Answered at once. Bangla if needed.' },
        { at: '9:42pm', step: 'Booked against real availability', gap: 'Written once. Never retyped.' },
        { at: '9:42pm', step: 'Confirmation and invoice issued', gap: 'Fired from the same record.' },
        { at: '9:43pm', step: 'Recorded, and measurable', gap: 'Every step counted.' },
      ],
      clock: { label: 'Elapsed', to: 2, unit: 'min' },
      meta: [['Hand-offs', 'None'], ['Recorded', 'Every step']],
      out: 'Now you can name the leak.',
    },
  },

  /* Same device, pointed at a personal brand rather than a service business. */
  seamsBrand: {
    today: {
      title: 'The usual arrangement',
      note: 'Reach is fine',
      rows: [
        { at: 'Mon', step: '40 people message you', gap: 'Every one needs you, awake, now.' },
        { at: 'Mon 11pm', step: 'You answer eleven', gap: 'The other 29 wait.' },
        { at: 'Tue', step: 'Six more the next day', gap: 'The moment they decided has passed.' },
        { at: 'Next week', step: '23 still sitting there', gap: 'They bought elsewhere.' },
      ],
      clock: { label: 'Answered', to: 17, unit: 'count', suffix: ' of 40' },
      meta: [['On a list you own', 'None'], ['Reached', '40']],
      out: 'The launch that goes well is the one you cannot service.',
    },
    after: {
      title: 'What we build instead',
      note: 'Same reach, caught',
      rows: [
        { at: 'Mon', step: '40 people arrive on a page', gap: 'It takes bookings. It takes money.' },
        { at: 'Mon', step: 'They book or buy on the spot', gap: 'Real availability, 2am, without you.' },
        { at: 'Mon', step: 'The assistant handles the rest', gap: 'Your eleven usual questions, your voice.' },
        { at: 'Always', step: 'Everyone lands on a list you own', gap: 'The rest arrives as a record.' },
      ],
      clock: { label: 'Answered', to: 40, unit: 'count', suffix: ' of 40' },
      meta: [['On a list you own', 'All 40'], ['Reached', '40']],
      out: 'An audience you can name is owned. One you cannot is rented.',
    },
  },

  /* ── The examination ───────────────────────────────────────────────
     The wording of these eight is mirrored server-side in
     lib/examination/questions.ts and checked by
     scripts/check-examination-sync.ts. Edit both or neither. */
  exam: {
    questions: [
      { id: 'q1', t: 'The same customer detail gets typed into more than one place.', mod: 'Smart Booking & CRM' },
      { id: 'q2', t: 'Enquiries arrive after hours and wait until morning — or longer.', mod: 'AI Chatbots' },
      { id: 'q3', t: 'Bookings are confirmed by hand, over messages or phone.', mod: 'Smart Booking & CRM' },
      { id: 'q4', t: "Nobody can say where last month's customers actually came from.", mod: 'Analytics Dashboards' },
      { id: 'q5', t: 'Follow-ups depend on somebody remembering to send them.', mod: 'Workflow Automation' },
      { id: 'q6', t: 'The website cannot do anything except be looked at.', mod: 'Intelligent Websites' },
      { id: 'q7', t: 'Invoices, records or reports are assembled manually each time.', mod: 'Workflow Automation' },
      { id: 'q8', t: 'Marketing restarts from zero every month with nothing compounding.', mod: 'Content Ecosystems' },
    ],
    /* One verdict per mark count. Each detail line is capped at ~20 words:
       the escalation from 0 to 8 carries the drama, not the prose. */
    verdicts: [
      { v: 'Nothing marked yet.',
        d: 'Each statement is a join between two tools. Businesses fail at the joins, not the tasks.' },
      { v: 'One seam showing.',
        d: 'One manual handover is survivable, and cheapest to close now. The next tool you buy joins the same way.' },
      { v: 'Two joins carried by hand.',
        d: 'Two is where the pattern starts. The cost arrives in three-minute pieces, so nobody notices it.' },
      { v: 'Structural drag. Three joins.',
        d: 'The business has a shape now: work moves because somebody keeps pushing it. Growth multiplies the pushing.' },
      { v: 'The seams are now the job.',
        d: "A real part of somebody's week goes on moving information between tools. Working harder does not get it back." },
      { v: 'You are the integration layer.',
        d: 'A person is holding this together. It works until they are ill, busy or gone. More marketing makes it worse.' },
      { v: 'Serious. The business runs on memory.',
        d: 'Outcomes depend on who remembered what. That is a structure problem, and effort will not out-run it.' },
      { v: 'Critical. Growth would hurt you now.',
        d: 'Every new customer arrives into a corridor that already leaks. Close the joins first, then buy traffic.' },
      { v: 'All eight. Start with the map.',
        d: 'This is what happens when a business adds a tool at every wall. The first fix is worth the most here.' },
    ],
  },

  /* ── Case studies ──────────────────────────────────────────────────
     Order is the argument: the two files closest to who this is built
     for lead, and the letters follow the order rather than fighting it.

     `project` and `product` are the whole cabinet — the home rail, the
     evidence index, the full ledger and the prev/next inside a case file
     all run through them, so every system stays in both.

     `clientFiles` and `founderLed` are how /projects *groups* them.
     Noree is a founder-led brand rather than a general client project,
     so it belongs in that section and not in the client-project list.
     Its letter (B) travels with the file wherever the file appears — the
     letters are stable references, not a per-page sequence. */
  order: {
    project: ['angel-foundation', 'noree', 'xendev'],
    product: ['physio-os', 'construction-os'],
    clientFiles: ['angel-foundation', 'xendev'],
    founderLed: ['noree'],
  },

  /*
    Case copy budget, applied to all five:
      summary      one line — it is a card, not a paragraph
      narrative    40 words maximum, each of the three
      pains        under 10 words each
      details dd   under 15 words each
      withheld     rendered as a footnote, not a block of body copy
    The quotes stay at full length. They are the one place on a case file
    where a sentence is allowed to take its time.
  */
  cases: {
    'angel-foundation': {
      slug: 'angel-foundation', kind: 'project', letter: 'A',
      name: 'Angel Foundation', clientKind: 'Charity · children with special needs',
      status: 'Live', year: '2026', url: 'https://www.angelfoundationbd.org', urlLabel: 'angelfoundationbd.org',
      summary: 'Intake moved off a Facebook inbox. Bookings now run around the clock.',
      headlineFig: { v: '24/7', l: 'unattended intake' },
      shots: [
        { src: 'angel-home.webp', label: 'angelfoundationbd.org', cap: 'English and Bangla. A parent at 11pm can act.' },
        { src: 'angel-booking.webp', label: 'angelfoundationbd.org/consultations', cap: 'Three consultation types, bookable against real availability.' },
        /* The admin panel is the actual product of this engagement: the public
           site is only the front door. Personal details are blurred in these
           captures — the screens are real, the families in them stay private. */
        { src: 'angel-admin-availability.webp', label: 'admin · Availability', cap: 'The weekly windows the public calendar reads from.' },
        { src: 'angel-admin-bookings.webp', label: 'admin · Bookings', cap: 'Bookings on a calendar the charity works from. Names blurred.' },
        { src: 'angel-admin-submissions.webp', label: 'admin · Submissions', cap: 'Every enquiry is a record with a status. Details blurred.' },
      ],
      mobile: 'angel-mobile.webp',
      headline: 'Intake that does not depend on who is watching the inbox.',
      intro: 'Angel Foundation supports children with special needs. Its entire intake — the first contact a worried parent makes — ran through a Facebook inbox.',
      problem: {
        narrative: 'A parent who has just noticed something different about their child does not send a second message. Miss the first one and that family is gone.',
        pains: [
          'First contact arrived in a social inbox',
          'Response depended on who was looking',
          'No availability to book against',
          'Sensitive family data in the wrong channel',
        ],
      },
      solution: {
        narrative: 'Its own booking system, with real availability and slot locking. Privacy enforced at the database, not promised in a policy. The site runs in English and Bangla.',
        details: [
          ['Intelligent Websites', 'Bilingual site. Booking a consultation is on every page.'],
          ['Smart Booking & CRM', 'Three consultation types, real availability, slot locking.'],
          ['Workflow Automation', 'A notification outbox and SMS. Bookings reach a person.'],
          ['Content Ecosystems', 'Early-intervention guidance as a structured library.'],
        ],
      },
      results: {
        narrative: 'Angel Foundation sits on an account our tooling cannot read, so these figures are architectural. By construction: a 2am booking is a record, with a slot and a notification.',
        metrics: [
          { s: 'construction', v: '24/7', l: 'Consultation intake with nobody watching an inbox', src: 'Self-serve booking, live' },
          { s: 'construction', v: '3', l: 'Consultation types bookable against real availability', src: 'Booking configuration' },
          { s: 'construction', v: '2', l: 'Languages served on the public site — English and Bangla', src: 'Site configuration' },
          { s: 'pending', v: '—', l: 'Booking volume and source mix', src: 'Analytics env vars outstanding' },
        ],
      },
      withheld: 'Nothing here is claimed as measured. Production analytics is instrumented but not yet reporting, so it is listed above as pending.',
      quote: { text: 'A parent who has just noticed something is different does not send a second message. Intake that depends on somebody watching an inbox is not intake.', attrib: 'EXPERIUS build notes' },
      conclusion: 'The charity owns its front door. Next: switch the pending figures on.',
    },

    noree: {
      slug: 'noree', kind: 'project', letter: 'B',
      name: 'Noree Jewellery', clientKind: 'Founder-led jewellery brand',
      status: 'Live', year: '2026', url: 'https://noreejewellery.com', urlLabel: 'noreejewellery.com',
      summary: 'A storefront with its own invoice pipeline and analytics. We know where it loses a sale.',
      headlineFig: { v: '34%', l: 'of product views became carts' },
      shots: [
        { src: 'noree-home.webp', label: 'noreejewellery.com', cap: 'The storefront. A third of product views become carts.' },
        { src: 'noree-shop.webp', label: 'noreejewellery.com/shop', cap: '138 products across 10 types, each with its own page.' },
        { src: 'noree-scroll.webp', label: 'noreejewellery.com', cap: 'Every image compressed to WebP at upload. 94% smaller.' },
      ],
      mobile: 'noree-mobile.webp',
      headline: 'A shop that reports on itself.',
      intro: 'Noree sells handmade jewellery direct. It had product, photography and an audience. It had no shop that could take an order, invoice it, and report on it.',
      problem: {
        narrative: 'Selling through posts and DMs works until it does not. Every order is a conversation, every invoice is handwritten, and nothing is recorded. You cannot see where people hesitate.',
        pains: [
          'Orders arrived as DMs, transcribed by hand',
          'Invoices made by hand, one at a time',
          'No record of what customers browsed or abandoned',
          'Camera-resolution photography made pages slow',
        ],
      },
      solution: {
        narrative: 'The storefront is a system: a product database, an order flow that issues its own invoices, and analytics Noree owns rather than rents.',
        details: [
          ['Intelligent Websites', '138 products across 10 types, 7 categories, 3 collections. Each has its own page.'],
          ['Smart Booking & CRM', 'Orders are records, not messages. Each carries its customer, items and status.'],
          ['Workflow Automation', 'An order fires a trigger that renders a PDF invoice and emails it.'],
          ['Analytics Dashboards', 'A cookieless first-party event stream, written to Noree\'s own database.'],
        ],
      },
      results: {
        narrative: 'Seven weeks of trading data, pointing somewhere specific. A third of product views become carts. The fall-off is entirely between cart and completed order.',
        metrics: [
          { s: 'measured', v: '1,161', l: 'Pageviews recorded first-party', src: 'Live database · 30 Jul 2026' },
          { s: 'measured', v: '245', l: 'Unique visitors, 12 Jun – 30 Jul 2026', src: 'Live database · 30 Jul 2026' },
          { s: 'measured', v: '34%', l: 'Product views that became add-to-carts (51 of 152)', src: 'Live database · 30 Jul 2026' },
          { s: 'construction', v: '138', l: 'Products live in a structured catalogue', src: 'Row count, products table' },
          { s: 'construction', v: '94%', l: 'Image payload removed — 179.8MB to 11.5MB', src: 'WebP compression at upload' },
          { s: 'pending', v: '—', l: 'Checkout completion after the cart-abandonment work', src: 'Re-measure Oct 2026' },
        ],
      },
      withheld: 'The raw order count is not published. A single-digit absolute would misrepresent a young store working as instrumented, and it is the client\'s data. The ratio is more useful anyway.',
      quote: { text: 'A third of product views become carts. Almost none of those carts become orders. We would be guessing about both if the analytics had been an afterthought.', attrib: 'EXPERIUS build notes' },
      conclusion: 'The store works, and it reports on itself. The next round of work aims at a measured gap rather than a guess.',
    },

    xendev: {
      slug: 'xendev', kind: 'project', letter: 'C',
      name: 'Xen Developments', clientKind: 'Property developer · Jolshiri, Dhaka',
      status: 'Live', year: '2026', url: 'https://xendevltd-web.vercel.app', urlLabel: 'xendevltd-web.vercel.app',
      summary: 'A development that takes its own site-visit bookings, on an admin panel that holds the record.',
      headlineFig: { v: '1', l: 'record per enquiry, end to end' },
      shots: [
        { src: 'xendev-home.webp', label: 'xendevltd-web.vercel.app', cap: 'The featured development. A site visit books from the hero.' },
        { src: 'xendev-scroll.webp', label: 'xendevltd-web.vercel.app', cap: 'Real renders, floor detail, amenities. Buyers decide on evidence.' },
      ],
      mobile: 'xendev-mobile.webp',
      headline: 'A high-ticket enquiry is too expensive to lose in a phone log.',
      intro: 'Xen Developments sells apartments at Jolshiri Abashon. One property enquiry can be worth a year of most businesses. It was arriving as a phone call somebody wrote down.',
      problem: {
        narrative: 'Every enquiry is high value, the decision runs for months, and follow-up is the whole game. When enquiries live in a call log, nobody knows which project a buyer asked about or when they were last contacted.',
        pains: [
          'Site-visit requests arrived by phone, into a handset',
          'No availability — every visit was negotiated',
          'No record of which project an enquiry was about',
          'Months-long follow-up depended on memory',
        ],
      },
      solution: {
        narrative: 'The site takes site-visit bookings and callbacks directly, against configured availability, with the project carried on the record. Behind it sits an admin panel: bookings, availability, submissions and a simple CRM.',
        details: [
          ['Intelligent Websites', 'One action — book a visit — with the renders a buyer needs to take it.'],
          ['Smart Booking & CRM', 'Bookings and callbacks writing to one record, with an admin panel behind it.'],
          ['Workflow Automation', 'Notifications on new bookings, so an enquiry reaches a person warm.'],
        ],
      },
      results: {
        narrative: 'This system is instrumented, but its analytics sits on an account our tooling cannot read, so these figures are architectural. By construction: an enquiry is now a record with a project attached and a history.',
        metrics: [
          { s: 'construction', v: '2', l: 'Enquiry routes — site-visit booking and callback request', src: 'Booking configuration' },
          { s: 'construction', v: '4', l: 'Admin surfaces: bookings, availability, submissions, CRM', src: 'Admin route table' },
          { s: 'construction', v: '1', l: 'Record per enquiry, carrying its project and its history', src: 'Schema, bookings table' },
          { s: 'pending', v: '—', l: 'Enquiry volume and visit-to-sale conversion', src: 'Client-held analytics' },
        ],
      },
      withheld: 'Sales outcomes belong to the developer. Nothing on this page is claimed as measured.',
      quote: { text: 'In property the follow-up is the product. A system that forgets which project someone asked about has already lost the sale.', attrib: 'EXPERIUS build notes' },
      conclusion: 'The developer\'s enquiries have a spine. Next is the sales lens — flats tracked through to sale on the same record.',
    },

    'physio-os': {
      slug: 'physio-os', kind: 'product', letter: 'D',
      name: 'Physio-OS', clientKind: 'EXPERIUS product · deploy-ready',
      status: 'Ready', year: '2026', url: 'https://physio-os-ten.vercel.app', urlLabel: 'physio-os-ten.vercel.app',
      summary: 'Scheduling, patient records and recall for physiotherapy practices. Built once, as a product.',
      headlineFig: { v: '3', l: 'clinic problems, one spine' },
      shots: [
        /* Describes what the screen is, not whose data is in it — the page
           claims no operating figures, and this caption must not either. */
        { src: 'physio-os-patients.webp', label: 'Physio-OS · Patients', cap: 'One record per patient: contact, diagnosis, therapist, status. Details blurred.' },
      ],
      mobile: 'physio-os-mobile.webp',
      headline: 'A problem that recurs deserves a system, not another bespoke build.',
      intro: 'Every physiotherapy practice we mapped had the same three problems in a different order: the diary, the patient record, and getting people back. Physio-OS is that pattern, built once.',
      problem: {
        narrative: 'Clinics lose money between appointments. A patient finishes treatment, nobody follows up, and the six-week recall happens never. The diary is paper, the history is a folder, and the front desk is the integration.',
        pains: [
          'A paper diary only one person can read at a time',
          'Patient history separate from the schedule that generates it',
          'Recall depending on somebody remembering a name',
          'Every clinic paying to build the same system',
        ],
      },
      solution: {
        narrative: 'Scheduling, patient records and recall on one spine, with secure access for practitioners and patients. Building it as a product means the tenth clinic gets the accumulated fixes of the first nine.',
        details: [
          ['Smart Booking & CRM', 'Real availability, one record per patient. Diary and history are one object.'],
          ['Workflow Automation', 'Recall that fires from the record, not from memory.'],
          ['Analytics Dashboards', 'Attendance, retention and the recall gap.'],
        ],
      },
      results: {
        narrative: 'Deploy-ready and awaiting its first practice, so it has no operating figures and none are claimed. The figures below describe what is built.',
        metrics: [
          { s: 'construction', v: '3', l: 'Clinic problems on one spine: diary, record, recall', src: 'Product scope' },
          { s: 'construction', v: '2', l: 'Access roles — practitioner and patient', src: 'Auth configuration' },
          { s: 'pending', v: '—', l: 'Attendance and recall figures', src: 'Awaiting first practice' },
          { s: 'pending', v: '—', l: 'Retention against pre-system baseline', src: 'Awaiting first practice' },
        ],
      },
      withheld: 'Deploy-ready is not proven. There are no operating figures because there are no operations yet.',
      quote: { text: 'The tenth clinic should get the accumulated fixes of the first nine. That is the whole argument for building a product instead of a tenth bespoke system.', attrib: 'EXPERIUS build notes' },
      conclusion: 'Built and waiting. We are looking for a first practice — and the measured figures that come with it.',
    },

    'construction-os': {
      slug: 'construction-os', kind: 'product', letter: 'E',
      name: 'Construction OS', clientKind: 'EXPERIUS product · in use',
      status: 'In use', year: '2026', url: null, urlLabel: null,
      summary: 'Where the money went, traced to the individual flat. Cash flow, budgets and sales on one record.',
      headlineFig: { v: '1', l: 'ledger across every phase' },
      shots: [
        /* Real screens, not a demo — which is why every figure is blurred.
           This is a developer's actual cash-flow and sales ledger; the
           interface is the evidence, the numbers stay theirs. */
        { src: 'construction-os-dashboard.webp', label: 'Admin · Dashboard', cap: 'Cash flow, phase budgets and dues on one screen. Figures blurred.' },
        { src: 'construction-os-sales.webp', label: 'Admin · Flat Sales', cap: 'Revenue traced to the flat: buyer, agreement, received, due. Blurred.' },
        { src: 'construction-os-manager.webp', label: 'Manager · Cashflow', cap: 'The field-entry side: a day-book ledger, keyboard-first.' },
      ],
      mobile: 'construction-os-mobile.webp',
      headline: 'Four spreadsheets that disagree by the end of every month.',
      intro: 'Construction OS began as a client problem and became a product. Every developer we spoke to had the same one: nobody could say where the money went without a week of reconciliation.',
      problem: {
        narrative: 'A development runs on phases, each with its own budget, commitments and sales. In separate spreadsheets every one is right alone and wrong together. Month-end takes days to answer and is stale on arrival.',
        pains: [
          'Cash flow, budgets and sales in separate files',
          'No way to trace cost or revenue to a flat',
          'Month-end reconciliation by hand, out of date on arrival',
          'Decisions made on the last number somebody trusted',
        ],
      },
      solution: {
        narrative: 'One ledger. Cash flow, phase budgets and sales read from the same records, and every entry traces to the flat it belongs to. The margin question stops being an archaeology project.',
        details: [
          ['Analytics Dashboards', 'Cash flow, phase budget and sales read from one record set.'],
          ['Smart Booking & CRM', 'Flat-level sale tracking, so revenue attaches to the unit the costs do.'],
          ['Workflow Automation', 'Entries propagate to every view, which removes month-end reconciliation.'],
        ],
      },
      results: {
        narrative: 'Construction OS holds a client\'s commercial data, so there are no measured figures here and there will not be. Everything below describes how the system is built.',
        metrics: [
          { s: 'construction', v: '1', l: 'Ledger serving cash flow, phase budgets and sales', src: 'Schema' },
          { s: 'construction', v: 'Flat', l: 'The level cost and revenue are traced to', src: 'Schema, per-unit records' },
          { s: 'construction', v: '0', l: 'Month-end reconciliation steps between systems', src: 'Single source of record' },
          { s: 'pending', v: '—', l: 'A public demo instance with synthetic data', src: 'Deploy fix scheduled' },
        ],
      },
      withheld: 'The screens are the real system. Every currency figure and buyer name is blurred at the source before capture.',
      quote: { text: 'Four spreadsheets that are each correct and collectively wrong is the most expensive filing system in construction.', attrib: 'EXPERIUS build notes' },
      conclusion: 'In use, on a real project. Next is a demo instance on synthetic data.',
    },
  },
}
