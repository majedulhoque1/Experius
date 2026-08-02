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

  /* ── Who this company is built for ─────────────────────────────────
     Two segments, not a list of industries we would accept work from.
     Each carries the running system that stands behind it — and the
     clinic card says plainly that its system has no practice on it yet,
     because "deploy-ready" is not the same as "proven". */
  icp: [
    {
      id: 'clinics', n: '01', name: 'Clinics & practices', tag: 'Deploy-ready',
      shot: 'physio-os-patients.webp', shotAlt: 'The Physio-OS patient list',
      lead:
        'A practice loses money in three places and none of them is marketing: the diary, ' +
        'the patient record, and getting people to come back.',
      fails: [
        'A diary only one person can read at a time, in a book or on a phone',
        'Patient history kept apart from the schedule that generates it',
        'Recall depending on somebody remembering a name in the right week',
        'Enquiries arriving after clinic hours and waiting until morning',
      ],
      proof: {
        v: 'Physio-OS', l: 'the clinic spine, built once — deploy-ready, awaiting its first practice',
        href: 'case.html?id=physio-os',
      },
    },
    {
      id: 'care', n: '02', name: 'Charities & care organisations', tag: 'Live',
      shot: 'angel-home.webp', shotAlt: 'The Angel Foundation site',
      lead:
        'The first contact a worried family makes is the most fragile one you will ever get. ' +
        'An inbox is not intake: it has no record, no availability and no owner.',
      fails: [
        'First contact arriving in a social inbox, with no record behind it',
        'Response depending entirely on who was looking, and when',
        'Nothing to book against, so every appointment is negotiated by message',
        'Sensitive family information sitting in a channel never built to hold it',
      ],
      proof: {
        v: 'Angel Foundation', l: 'consultation intake running around the clock, live since 2026',
        href: 'case.html?id=angel-foundation',
      },
    },
  ],

  /* ── The six modules ───────────────────────────────────────────── */
  modules: [
    {
      id: 'intelligent-websites', n: '01', name: 'Intelligent Websites', phase: 'Strategize',
      desc: 'The front door of an operating system, not a brochure that happens to have a contact form.',
      dgm: 'site',
    },
    {
      id: 'content-ecosystems', n: '02', name: 'Content Ecosystems', phase: 'Strategize',
      desc: 'A publishing system that compounds, instead of campaigns that reset to zero every month.',
      dgm: 'content',
    },
    {
      id: 'smart-booking-crm', n: '03', name: 'Smart Booking & CRM', phase: 'Systemize',
      desc: 'Real availability, real slot locking, one record per patient or client — so nothing double-books and nothing goes missing.',
      dgm: 'booking',
    },
    {
      id: 'analytics-dashboards', n: '04', name: 'Analytics Dashboards', phase: 'Systemize',
      desc: 'The numbers that decide something. Where enquiries come from, where they stall, what converts.',
      dgm: 'analytics',
    },
    {
      id: 'workflow-automation', n: '05', name: 'Workflow Automation', phase: 'Automate',
      desc: 'The cross-tool plumbing that removes the copy-paste work quietly draining your front desk every week.',
      dgm: 'automation',
    },
    {
      id: 'ai-chatbots', n: '06', name: 'AI Chatbots', phase: 'Automate',
      desc: 'Assistants that qualify and route enquiries in your voice — and in Bangla when that is what the caller speaks.',
      dgm: 'chatbot',
    },
  ],

  /*
    The core argument as a timeline: the same enquiry followed twice, with the
    clock running. The elapsed time is the punchline — it collapses from most of
    a day to about a minute, and the hand-off count goes to zero.

    Set in a clinic because that is who this is built for. The times are a
    worked example, not a measured client figure, and the panel says so.
    Everything else on this site carries provenance; this has to as well.
  */
  seams: {
    today: {
      title: 'A clinic today',
      note: 'Six tools',
      rows: [
        { at: '9:41pm', step: 'A patient enquiry arrives', gap: 'Nobody sees it until morning. Some are never answered at all.' },
        { at: '10:20am', step: 'The front desk answers by message', gap: 'Their details are retyped into the appointment book.' },
        { at: '10:34am', step: 'Appointment written into the diary', gap: 'Retyped a second time to make the invoice.' },
        { at: '11:02am', step: 'Invoice typed up by hand', gap: 'Nothing is recorded, so nothing can be counted.' },
      ],
      meta: [['Elapsed', '13h 21m'], ['Hand-offs', '4, by the desk'], ['Recorded', 'Nothing']],
      out: 'Nobody can say how many enquiries arrived, or where they were lost.',
    },
    after: {
      title: 'The same clinic, one record',
      note: 'Same six, one spine',
      rows: [
        { at: '9:41pm', step: 'A patient enquiry arrives', gap: 'The assistant answers immediately — in Bangla if that is the language.' },
        { at: '9:42pm', step: 'Booked against real availability', gap: 'Written once. Nothing is retyped, by anyone.' },
        { at: '9:42pm', step: 'Confirmation and invoice issued', gap: 'Fired from the same record the booking created.' },
        { at: '9:43pm', step: 'Recorded, and measurable', gap: 'Every step counted, so the leak has somewhere to show up.' },
      ],
      meta: [['Elapsed', '2 minutes'], ['Hand-offs', 'None'], ['Recorded', 'Every step']],
      out: 'You can name the step that loses patients — and fix that one.',
    },
  },

  /* Same device, pointed at a personal brand rather than a service business. */
  seamsBrand: {
    today: {
      title: 'The usual arrangement',
      note: 'Reach is fine',
      rows: [
        { at: 'Mon', step: 'A post does well. Forty people message.', gap: 'Every one of them needs you personally, awake, at that moment.' },
        { at: 'Mon 11pm', step: 'You answer eleven', gap: 'The other twenty-nine wait.' },
        { at: 'Tue', step: 'Six more the next day', gap: 'By now the moment they decided has passed.' },
        { at: 'Next week', step: 'Twenty-three still sitting there', gap: 'A reasonable question you never saw. They bought elsewhere.' },
      ],
      meta: [['Reached', '40 people'], ['Answered', '17'], ['On a list you own', 'None']],
      out: 'The launch that goes well is the one you cannot service.',
    },
    after: {
      title: 'What we build instead',
      note: 'Same reach, caught',
      rows: [
        { at: 'Mon', step: 'A post does well. Forty people arrive.', gap: 'They land on a page that can take bookings and take money.' },
        { at: 'Mon', step: 'They book or buy on the spot', gap: 'Against real availability, at 2am, without you.' },
        { at: 'Mon', step: 'The assistant handles the rest', gap: 'Your eleven usual questions, answered in your voice.' },
        { at: 'Always', step: 'Everyone is on a list you own', gap: 'Anything it cannot handle arrives as a record, not a notification.' },
      ],
      meta: [['Reached', '40 people'], ['Answered', 'All of them'], ['On a list you own', 'All of them']],
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
    verdicts: [
      { v: 'No marks yet. Tick what is true and the file opens itself.',
        d: 'Every item above is a seam between two tools. Businesses do not fail at the tasks — they fail at the joins, where information has to be carried across by a person who is also doing something else.' },
      { v: 'One seam showing.',
        d: 'A single join is survivable, and it is also the cheapest moment to close it. Left alone, one manual handover is what every larger mess grows out of — because the next tool you buy will be joined the same way.' },
      { v: 'Two joins carried by hand.',
        d: 'Two is where the pattern starts. Nobody notices the cost yet because it is spread across the week in three-minute pieces, which is exactly why it never gets fixed.' },
      { v: 'Structural drag. Three joins, all manual.',
        d: 'At three, the business has a shape: work moves, but only because somebody keeps pushing it. Growth from here multiplies the pushing rather than the profit.' },
      { v: 'The seams are now the job.',
        d: "Four marks means a meaningful part of somebody's week is spent moving information between tools that could be reading from the same record. That time is not recoverable by working harder." },
      { v: 'You are the integration layer.',
        d: 'Five marks and the system holding this business together is a person. It works — until they are ill, busy, or leave. This is the point at which more marketing makes things measurably worse.' },
      { v: 'Serious. The business runs on memory.',
        d: 'Six joins carried by hand means outcomes depend on who remembered what. Nothing here is a discipline problem; it is a structure problem, and no amount of effort will out-run it.' },
      { v: 'Critical. Growth would hurt you right now.',
        d: 'Seven marks. Every new customer arrives into a corridor that already leaks. The correct order is to close the joins first — then spend on getting more people into it.' },
      { v: 'All eight. Start with the map, not the build.',
        d: 'This is not unusual and it is not a judgement — it is what happens when a business grows by adding a tool each time it hits a wall. It also means the first fix is worth more here than anywhere else.' },
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

  cases: {
    'angel-foundation': {
      slug: 'angel-foundation', kind: 'project', letter: 'A',
      name: 'Angel Foundation', clientKind: 'Charity · children with special needs',
      status: 'Live', year: '2026', url: 'https://www.angelfoundationbd.org', urlLabel: 'angelfoundationbd.org',
      summary: 'A charity whose entire intake ran through a Facebook inbox now takes its own consultation bookings, around the clock.',
      headlineFig: { v: '24/7', l: 'unattended intake' },
      shots: [
        { src: 'angel-home.webp', label: 'angelfoundationbd.org', cap: 'The public site, in English and Bangla. A worried parent arriving at 11pm can act immediately.' },
        { src: 'angel-booking.webp', label: 'angelfoundationbd.org/consultations', cap: 'Three consultation types, each bookable against real availability — no message, no waiting for office hours.' },
        /* The admin panel is the actual product of this engagement: the public
           site is only the front door. Personal details are blurred in these
           captures — the screens are real, the families in them stay private. */
        { src: 'angel-admin-availability.webp', label: 'admin · Availability', cap: 'The weekly windows the public booking calendar reads from. This is why the site can offer a real slot instead of a contact form.' },
        { src: 'angel-admin-bookings.webp', label: 'admin · Bookings', cap: 'Bookings landing on a calendar the charity works from. Names are blurred here; the screen is otherwise untouched.' },
        { src: 'angel-admin-submissions.webp', label: 'admin · Submissions', cap: 'Every enquiry arrives as a record with a status, not a message in an inbox. Names, numbers and the free-text concern are blurred.' },
      ],
      mobile: 'angel-mobile.webp',
      headline: 'Intake that does not depend on who is watching the inbox.',
      intro: 'Angel Foundation supports children with special needs and their families. Its entire intake — the first, most fragile contact a worried parent makes — ran through a Facebook inbox, which meant it ran through whoever happened to be looking at it.',
      problem: {
        narrative: 'A parent who has just noticed something different about their child does not send a second message. If the first one is missed, or answered three days later, that family is gone — and nobody ever finds out. An inbox is not intake: it has no record, no availability, no ownership and no way of knowing what was lost.',
        pains: [
          'Every first contact arrived in a social inbox with no record',
          'Response depended entirely on who was looking, and when',
          'No availability to book against — everything was negotiated by message',
          'Sensitive family information sat in a channel never designed to hold it',
        ],
      },
      solution: {
        narrative: 'We gave the charity its own booking system with real availability and slot locking, so a parent can act at the moment they decide to. Privacy is enforced at the database through security-definer functions rather than promised in a policy, and notifications reach a named person through an outbox rather than a hope. The public site runs in English and Bangla.',
        details: [
          ['Intelligent Websites', 'A bilingual public site where the primary action — booking a consultation — is available on every page, not buried in a contact form.'],
          ['Smart Booking & CRM', 'Three consultation types bookable against real availability, with slot locking so two families cannot take the same slot.'],
          ['Workflow Automation', 'A notification outbox and SMS function, so a new booking reaches a real person without anyone refreshing a screen.'],
          ['Content Ecosystems', 'Early-intervention guidance published as a structured library, which is what a parent searching at midnight actually needs.'],
        ],
      },
      results: {
        narrative: 'Angel Foundation runs on a different infrastructure account from the one our tooling can read, so this case study carries architectural figures rather than measured ones — and says so on the page rather than in the small print. What is true by construction is that intake no longer depends on attention: a booking made at 2am on a Friday is a record, with a slot, with a notification, before anyone has read anything.',
        metrics: [
          { s: 'construction', v: '24/7', l: 'Consultation intake with nobody watching an inbox', src: 'Self-serve booking, live' },
          { s: 'construction', v: '3', l: 'Consultation types bookable against real availability', src: 'Booking configuration' },
          { s: 'construction', v: '2', l: 'Languages served on the public site — English and Bangla', src: 'Site configuration' },
          { s: 'pending', v: '—', l: 'Booking volume and source mix', src: 'Analytics env vars outstanding' },
        ],
      },
      withheld: 'Angel Foundation sits on a separate infrastructure account our local tooling cannot reach, so nothing here is claimed as measured. Production analytics is instrumented but not yet reporting — it is listed as pending above rather than quietly omitted.',
      quote: { text: 'A parent who has just noticed something is different does not send a second message. Intake that depends on somebody watching an inbox is not intake.', attrib: 'EXPERIUS build notes' },
      conclusion: 'The charity now owns its front door. The next round of work is switching the pending figures on, so the same honesty that governs this page can be applied to the outcomes.',
    },

    noree: {
      slug: 'noree', kind: 'project', letter: 'B',
      name: 'Noree Jewellery', clientKind: 'Founder-led jewellery brand',
      status: 'Live', year: '2026', url: 'https://noreejewellery.com', urlLabel: 'noreejewellery.com',
      summary: 'A storefront with its own order-to-invoice pipeline and first-party analytics — which is how we know exactly where it loses a sale.',
      headlineFig: { v: '34%', l: 'of product views became carts' },
      shots: [
        { src: 'noree-home.webp', label: 'noreejewellery.com', cap: 'The storefront. Photography and product pages are doing their job — a third of views become carts.' },
        { src: 'noree-shop.webp', label: 'noreejewellery.com/shop', cap: '138 products across 10 types, 7 categories and 3 collections — each with its own page, not a shared grid.' },
        { src: 'noree-scroll.webp', label: 'noreejewellery.com', cap: 'Every image compressed to WebP at upload time, which is where the 94% payload reduction came from.' },
      ],
      mobile: 'noree-mobile.webp',
      headline: 'A shop that reports on itself.',
      intro: 'Noree sells handmade jewellery direct to customers. The brand had product, photography and an audience. What it did not have was a shop that could take an order, invoice it, and tell anyone afterwards what had happened.',
      problem: {
        narrative: 'Selling through social posts and direct messages works right up until it does not. Every order is a manual conversation, every invoice is written by hand, and — the expensive part — nothing is recorded. You cannot tell which pieces people actually look at, where they hesitate, or how many nearly bought and left, because none of it is written down anywhere.',
        pains: [
          'Orders arrived as DMs and had to be transcribed by hand',
          'Invoices were made manually, one at a time',
          'No record of what customers browsed or abandoned',
          'Product photography straight from the camera made pages slow to load',
        ],
      },
      solution: {
        narrative: 'We built the storefront as a system rather than a catalogue: a real product database, an order flow that issues its own invoices, and — the part that matters most six months later — analytics owned by Noree rather than rented from a third party. Every product view and every add-to-cart is recorded in the brand\'s own database, which is what makes the results section below possible at all.',
        details: [
          ['Intelligent Websites', 'A storefront over a structured catalogue — 138 products across 10 types, 7 categories and 3 collections, each with its own page rather than a shared grid.'],
          ['Smart Booking & CRM', 'Orders are records, not messages. Each one carries its customer, its items and its status, and stays queryable afterwards.'],
          ['Workflow Automation', 'Placing an order fires a database trigger that renders a PDF invoice and emails it to the customer without anyone opening a laptop.'],
          ['Analytics Dashboards', 'A cookieless, first-party event stream — pageviews, product views, add-to-carts — written to Noree\'s own database and read back through an admin dashboard.'],
        ],
      },
      results: {
        narrative: 'Seven weeks of real trading data, and it points somewhere specific. Roughly a third of everyone who opens a product page adds it to their cart — that is a healthy number, and it means the photography, pricing and product pages are doing their job. The fall-off is entirely at the last step, between cart and completed order. That single gap is the whole of the next quarter\'s work, and the only reason anyone can see it is that the measurement was built in on day one rather than bolted on after someone asked how sales were going.',
        metrics: [
          { s: 'measured', v: '1,161', l: 'Pageviews recorded first-party', src: 'Live database · 30 Jul 2026' },
          { s: 'measured', v: '245', l: 'Unique visitors, 12 Jun – 30 Jul 2026', src: 'Live database · 30 Jul 2026' },
          { s: 'measured', v: '34%', l: 'Product views that became add-to-carts (51 of 152)', src: 'Live database · 30 Jul 2026' },
          { s: 'construction', v: '138', l: 'Products live in a structured catalogue', src: 'Row count, products table' },
          { s: 'construction', v: '94%', l: 'Image payload removed — 179.8MB to 11.5MB', src: 'WebP compression at upload' },
          { s: 'pending', v: '—', l: 'Checkout completion after the cart-abandonment work', src: 'Re-measure Oct 2026' },
        ],
      },
      withheld: 'The raw order count is deliberately not published. It is a young store, a single-digit absolute would misrepresent a system working exactly as instrumented, and it is the client\'s commercial data — not ours to broadcast. The ratio is the more useful number anyway.',
      quote: { text: 'A third of product views become carts. Almost none of those carts become orders. We would be guessing about both if the analytics had been an afterthought.', attrib: 'EXPERIUS build notes' },
      conclusion: 'The store works. More importantly, it reports on itself — so the next round of work is aimed at a specific measured gap rather than at a guess. That is the difference between a shop that was launched and a shop that is being run.',
    },

    xendev: {
      slug: 'xendev', kind: 'project', letter: 'C',
      name: 'Xen Developments', clientKind: 'Property developer · Jolshiri, Dhaka',
      status: 'Live', year: '2026', url: 'https://xendevltd-web.vercel.app', urlLabel: 'xendevltd-web.vercel.app',
      summary: 'A lakeside development that takes its own site-visit bookings, with an admin panel that holds availability, submissions and the client record.',
      headlineFig: { v: '1', l: 'record per enquiry, end to end' },
      shots: [
        { src: 'xendev-home.webp', label: 'xendevltd-web.vercel.app', cap: 'The featured development. A site visit can be booked from the hero — the primary action, not a footer link.' },
        { src: 'xendev-scroll.webp', label: 'xendevltd-web.vercel.app', cap: 'Real renders, floor detail and amenities. High-ticket property is decided on evidence, so the page carries it.' },
      ],
      mobile: 'xendev-mobile.webp',
      headline: 'A high-ticket enquiry is too expensive to lose in a phone log.',
      intro: 'Xen Developments sells apartments at Jolshiri Abashon. In property, a single enquiry can be worth more than a year of most businesses\' customers — and it was arriving as a phone call that somebody wrote down.',
      problem: {
        narrative: 'The economics of property make the leak brutal. Every enquiry is high value, the decision cycle runs for months, and follow-up is the entire game. When enquiries live in a call log and a personal phone, there is no way to know which project a buyer asked about, when they were last contacted, or how many went cold while somebody meant to call back.',
        pains: [
          'Site-visit requests arrived by phone and lived in somebody\'s handset',
          'No availability — every visit was arranged by negotiation',
          'No record of which project an enquiry was actually about',
          'Follow-up over a months-long decision depended on memory',
        ],
      },
      solution: {
        narrative: 'The site takes site-visit bookings and callback requests directly, against configured availability, with the project carried on the record so nobody has to ask again. Behind it sits an admin panel with bookings, availability, submissions and a simple CRM — the same booking-and-records spine we apply across every engagement, fitted to a developer\'s sales cycle.',
        details: [
          ['Intelligent Websites', 'A development site built around one action — book a visit — with the renders and floor detail a high-ticket buyer needs in order to take it.'],
          ['Smart Booking & CRM', 'Site-visit booking and callback enquiry writing to one record, with an admin panel for bookings, availability, submissions and client history.'],
          ['Workflow Automation', 'Notifications on new bookings, so a high-value enquiry reaches a person while it is still warm.'],
        ],
      },
      results: {
        narrative: 'This system is instrumented but its analytics sits on an infrastructure account our tooling cannot read, so the figures below are architectural rather than measured. What is true by construction: an enquiry now becomes a record with a project attached and a history that survives whoever took the call.',
        metrics: [
          { s: 'construction', v: '2', l: 'Enquiry routes — site-visit booking and callback request', src: 'Booking configuration' },
          { s: 'construction', v: '4', l: 'Admin surfaces: bookings, availability, submissions, CRM', src: 'Admin route table' },
          { s: 'construction', v: '1', l: 'Record per enquiry, carrying its project and its history', src: 'Schema, bookings table' },
          { s: 'pending', v: '—', l: 'Enquiry volume and visit-to-sale conversion', src: 'Client-held analytics' },
        ],
      },
      withheld: 'Sales outcomes belong to the developer and are not ours to publish. Nothing on this page is claimed as measured.',
      quote: { text: 'In property the follow-up is the product. A system that forgets which project someone asked about has already lost the sale.', attrib: 'EXPERIUS build notes' },
      conclusion: 'The developer\'s enquiries now have a spine. The obvious next step is the sales lens — tracking flats through to sale on the same record — which is scoped and waiting.',
    },

    'physio-os': {
      slug: 'physio-os', kind: 'product', letter: 'D',
      name: 'Physio-OS', clientKind: 'EXPERIUS product · deploy-ready',
      status: 'Ready', year: '2026', url: 'https://physio-os-ten.vercel.app', urlLabel: 'physio-os-ten.vercel.app',
      summary: 'Scheduling, patient records and recall for physiotherapy practices — built as a product because the same clinic problem kept arriving in different clothes.',
      headlineFig: { v: '3', l: 'clinic problems, one spine' },
      shots: [
        /* Describes what the screen is, not whose data is in it — the page
           claims no operating figures, and this caption must not either. */
        { src: 'physio-os-patients.webp', label: 'Physio-OS · Patients', cap: 'One record per patient: contact, diagnosis, assigned therapist and status on a single row, filterable by where they are in a course of treatment. Personal and clinical details are blurred.' },
      ],
      mobile: 'physio-os-mobile.webp',
      headline: 'A problem that recurs deserves a system, not another bespoke build.',
      intro: 'Every physiotherapy practice we mapped had the same three problems in a different order: the diary, the patient record, and getting people to come back. Physio-OS is that pattern built once, properly.',
      problem: {
        narrative: 'Clinics lose money in the gap between appointments. A patient finishes a course of treatment, nobody follows up, and the recall that should have happened at six weeks happens never. Meanwhile the diary is a paper book, the patient history is in a folder, and the front desk is the only integration between them.',
        pains: [
          'Appointments in a paper diary that only one person can read at a time',
          'Patient history separate from the schedule that generates it',
          'Recall depending entirely on somebody remembering a name',
          'Every clinic paying to have the same system built from scratch',
        ],
      },
      solution: {
        narrative: 'Scheduling, patient records and recall on one spine, with secure access for practitioners and patients. Building it as a product rather than a bespoke engagement means the tenth clinic gets the accumulated fixes of the first nine — which is the entire argument for productising a recurring problem.',
        details: [
          ['Smart Booking & CRM', 'Real availability and one record per patient, so the diary and the history are the same object.'],
          ['Workflow Automation', 'Recall that fires from the record rather than from memory.'],
          ['Analytics Dashboards', 'Attendance, retention and the recall gap — the numbers a practice owner can actually act on.'],
        ],
      },
      results: {
        narrative: 'Physio-OS is deploy-ready and awaiting its first practice, so it has no operating figures and none are claimed. The figures below describe what is built.',
        metrics: [
          { s: 'construction', v: '3', l: 'Clinic problems on one spine: diary, record, recall', src: 'Product scope' },
          { s: 'construction', v: '2', l: 'Access roles — practitioner and patient', src: 'Auth configuration' },
          { s: 'pending', v: '—', l: 'Attendance and recall figures', src: 'Awaiting first practice' },
          { s: 'pending', v: '—', l: 'Retention against pre-system baseline', src: 'Awaiting first practice' },
        ],
      },
      withheld: 'Deploy-ready is not the same as proven, and this page does not pretend otherwise. There are no operating figures because there are no operations yet.',
      quote: { text: 'The tenth clinic should get the accumulated fixes of the first nine. That is the whole argument for building a product instead of a tenth bespoke system.', attrib: 'EXPERIUS build notes' },
      conclusion: 'The system is built and waiting. We are looking for a first practice to run it properly — and to generate the measured figures this page currently cannot show.',
    },

    'construction-os': {
      slug: 'construction-os', kind: 'product', letter: 'E',
      name: 'Construction OS', clientKind: 'EXPERIUS product · in use',
      status: 'In use', year: '2026', url: null, urlLabel: null,
      summary: 'Where the money actually went, traced to the individual flat — cash flow, phase budgets and sales ledgers reading from one record.',
      headlineFig: { v: '1', l: 'ledger across every phase' },
      shots: [
        /* Real screens, not a demo — which is why every figure is blurred.
           This is a developer's actual cash-flow and sales ledger; the
           interface is the evidence, the numbers stay theirs. */
        { src: 'construction-os-dashboard.webp', label: 'Admin · Dashboard', cap: 'Cash flow, phase budgets and outstanding dues on one screen. Every figure is blurred — this is a real developer\'s ledger, not a demo.' },
        { src: 'construction-os-sales.webp', label: 'Admin · Flat Sales', cap: 'Revenue traced to the individual flat: buyer, agreement, received and due on one row. Buyer names and amounts blurred.' },
        { src: 'construction-os-manager.webp', label: 'Manager · Cashflow', cap: 'The field-entry side: a day-book ledger with account balances, built for keyboard-first data entry against a live project.' },
      ],
      mobile: 'construction-os-mobile.webp',
      headline: 'Four spreadsheets that disagree by the end of every month.',
      intro: 'Construction OS began as a client problem and became an EXPERIUS product, because the same problem kept arriving from every developer we spoke to: nobody could answer where the money had gone without a week of reconciliation.',
      problem: {
        narrative: 'A development runs on phases, and each phase has its own budget, its own commitments and its own sales against it. When those live in separate spreadsheets, every one of them is right on its own and wrong together. The month-end question — are we ahead or behind, and on which flat — takes days to answer and is stale by the time it is answered.',
        pains: [
          'Cash flow, phase budgets and sales tracked in separate files',
          'No way to trace cost or revenue down to an individual flat',
          'Month-end reconciliation done by hand, and out of date on arrival',
          'Decisions made on the last number somebody happened to trust',
        ],
      },
      solution: {
        narrative: 'One ledger. Cash flow, phase budgets and the sales ledger read from the same records, and every entry can be traced to the flat it belongs to. Because the sales side and the cost side finally sit in one place, the margin question stops being an archaeology project.',
        details: [
          ['Analytics Dashboards', 'Cash flow, phase budget and sales positions read from one record set rather than reconciled between files.'],
          ['Smart Booking & CRM', 'Flat-level sale tracking, so revenue attaches to the same unit the costs do.'],
          ['Workflow Automation', 'Entries propagate to every view that depends on them, which is what removes the month-end reconciliation entirely.'],
        ],
      },
      results: {
        narrative: 'Construction OS holds a client\'s commercial data, so there are no measured figures here and there will not be. Everything below is true by construction — it is a description of how the system is built, which is a claim we can stand behind without publishing anything that belongs to somebody else.',
        metrics: [
          { s: 'construction', v: '1', l: 'Ledger serving cash flow, phase budgets and sales', src: 'Schema' },
          { s: 'construction', v: 'Flat', l: 'The level cost and revenue are traced to', src: 'Schema, per-unit records' },
          { s: 'construction', v: '0', l: 'Month-end reconciliation steps between systems', src: 'Single source of record' },
          { s: 'pending', v: '—', l: 'A public demo instance with synthetic data', src: 'Deploy fix scheduled' },
        ],
      },
      withheld: 'The screens above are the real system, not a demo — every currency figure and buyer name is blurred at the source before capture. We will show how the ledger is built; we will not publish what it says about somebody else\'s money.',
      quote: { text: 'Four spreadsheets that are each correct and collectively wrong is the most expensive filing system in construction.', attrib: 'EXPERIUS build notes' },
      conclusion: 'The product is in use, on a real project. The next milestone is a demo instance on synthetic data, so the figures can be seen rather than only described.',
    },
  },
}
