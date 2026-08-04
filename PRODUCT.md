# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: clinic/practice owners and charity/care-organisation leads (Dhaka,
working globally) who are losing patients and donors — not to a competitor,
but to enquiries nobody answered (e.g. a Facebook message that sits unread
until evening). Their job: replace six disconnected tools (site, Messenger,
spreadsheets, paper records) with one connected system for bookings, records,
automation and numbers.

Secondary: founder-led personal brands. Real segment, but folded into
`projects.html#founder-led` rather than given its own nav destination or page
(`/personal-brand` 301s there).

Internal: EXPERIUS's own team uses the separate `admin/` app to manage client
projects, content and case-study data.

## Product Purpose

EXPERIUS builds the operating system a clinic or charity actually runs on —
site, bookings, records, automation and numbers as one structure — built once
and then improved every month under an ongoing retainer ("we stay on").
Success is fewer leaked enquiries/leads and one system replacing the six that
didn't talk to each other.

## Positioning

The free "Examine my business" AI diagnostic (the leak map, served via
`api/examine.ts` / `lib/examination/*`) is the wedge: it finds concretely
where a specific business's current setup leaks, before anything is sold.
From there the method is always the same order — Strategize (find where it
leaks) → Systemize (one place for the work) → Automate (off your desk).
Automation applied to an undefined process is called out explicitly as making
the mess arrive faster, not solving it. Neighbouring agencies sell tools or
automation directly; EXPERIUS's mechanism is diagnose-first with a real
per-business finding, then build the connected system, then stay on as a
retainer.

## Operating Context

Seven static marketing pages share three files: `assets/site.css` (the whole
design system), `assets/data.js` (all content, every metric with its
provenance), `assets/site.js` (chrome, the examination, the leak map,
motion). `case.html?id=…` is one template for every case file. `api/`
(`examine.ts`, `inquiry.ts`) are Vercel functions wrapping logic kept in
`lib/` for local testing. Deployed on Vercel; `scripts/build-site.mjs` → `dist/`.

Most visitors arrive and convert on a phone, not a desktop browser — this is
the dominant access pattern for both the marketing site and (per the
2026-08-04 request that triggered this session) the internal `admin/` app,
and neither is currently mobile-optimised.

## Capabilities and Constraints

- `src/` is a dead early React rewrite kept only for reference — never extend
  it; the live site is the static HTML/CSS/JS three-file system above.
- `admin/` is a separate Vite/React app with its own `package.json` and dev
  server; it is not a satellite of the marketing site's design system.
- Booking backend and full DNS-cutover status are not confirmed complete as
  of this writing — do not assume a live production booking flow exists
  without verifying current code/deploy state first.
- `shoot-site.mjs`, `audit-type.mjs`, and `check-reduced-motion.mjs` are
  enforced verification scripts (console errors, overflow, contrast, motion)
  and must keep passing after visual changes.

## Brand Commitments

Name: EXPERIUS. Tagline: "the operating system a clinic or charity runs on."
Location line: "Dhaka, working globally." Voice is direct and unhedged
("You are losing patients and donors. Not to a competitor. To the message
nobody answered last night."). The two flagship proof points, named
everywhere the "who this is for" claim is made, are Physio-OS and Angel
Foundation.

## Evidence on Hand

`case-studies.html` prints the complete client ledger (Physio-OS, Angel
Foundation, Noree, Xen, Construction OS, others) with every metric typed
`measured` / `construction` / `pending` — there is deliberately no
"estimated" category. Named absences are stated rather than implied: Noree's
raw order count, Xen's sales outcomes, Construction OS's screens are all
explicitly marked absent. Physio-OS is deploy-ready but has no practice
running it yet, and the site states that everywhere Physio-OS is mentioned
rather than implying otherwise. `public/shots/` holds real captures of the
live systems (`opt/` is the WebP set that ships) — never a fabricated or
placeholder screenshot.

## Product Principles

1. Never fabricate a figure, testimonial, or outcome. Type every metric
   measured/construction/pending and name what's absent instead of implying
   it — this overrides any pressure to make a case study look more finished.
2. Diagnose before building, build before automating. Strategize →
   Systemize → Automate, always in that order.
3. Ship the connected system once, then stay on. The monthly-retainer
   relationship is part of the product, not an upsell bolted onto a project.
4. Evidence carries the argument more than copy does — lead with the proof
   points, not adjectives.

## Accessibility & Inclusion

WCAG AA text contrast is a hard, enforced constraint, not a best-effort
target: `audit-type.mjs` measures computed size, weight and real contrast
per element against its nearest opaque ancestor, and every page currently
passes on every text style. Any visual change must keep it passing.

Mobile is the dominant real-world access path for both the marketing site
and the `admin/` app, and neither is currently optimised for it — treat
phone-width usability as a first-class requirement, not a breakpoint
afterthought.
