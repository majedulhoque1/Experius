# Contact page IA, map discoverability, and leads admin — design

Date: 2026-08-02

## Problem

Two visitor-facing features already exist in code but don't work as intended for a visitor:

1. **"Book a call"** (header CTA) links to `/contact`, but the booking calendar
   (`EX.bookingWidget`) is the third section on that page — after the hero and a
   full inquiry form. A visitor following that specific CTA has to scroll past a
   competing form to find the thing the button promised.
2. **The "leak map"** (`EX.examination` + the `leakMap()` flow in
   [assets/site.js](../../../assets/site.js)) never mentions "map" anywhere until
   a visitor has already ticked a checkbox — the offer is injected only after
   `marked().length > 0`. Nothing above the checklist frames why they're ticking
   boxes.

Additionally:

3. Visitors whose problem doesn't match any of the 8 fixed checklist statements
   have no way to describe it — the AI-generated map only ever works from
   `markedIds`.
4. There is no admin visibility into map submissions. The `examinations` table
   (where completed map leads land, gated behind name+email per
   `lib/examination/handler.ts`) has RLS enabled with zero policies — service-role
   only. The admin panel (`admin/src/pages/`) has Submissions/CRM/Bookings but
   nothing reads `examinations`.

## Confirmed via testing (not assumed)

- Ran the local dev server (`npm run dev`) and drove `/contact` with Playwright.
  The booking widget successfully calls the live self-hosted Supabase
  (`get_available_slots` RPC, 200 OK) and renders real dates — it works, it's
  just buried in page order.
- Checked the live Supabase instance's PostgREST OpenAPI schema directly
  (`GET /rest/v1/` with the service-role key). Confirmed:
  - `examinations` table matches `supabase/0001_examinations.sql` exactly.
  - `has_role(_user_id uuid, _role app_role)` RPC exists and already backs
    `admin/src/hooks/useIsAdmin.ts` via the `user_roles` table — this is the
    pattern to reuse for the new admin read policy.
  - `inquiries` table's live schema (`type, name, email, phone, message,
    language, status, details`) does **not** match
    `supabase/0002_inquiries.sql` (which has `business, message, referrer,
    utm, ip_hash, handled_at` and no `details`/`type`/`status`/`phone`
    columns). The live table is the booking-crm-kit's generic schema; `0002`
    was evidently never applied (`create table if not exists` no-op) and is
    stale. Not in scope to fix here — noted for awareness only.
- No "experius" project exists in the connected Vercel account, and
  `experius.xyz` currently 404s on every route except `/`. This build has not
  shipped to production yet, and the self-hosted Supabase URL is HTTP-only
  (`.env.local` flags it explicitly as not production-ready — no cert issued).
  Out of scope for this spec (confirmed with the user: they were testing
  locally, not production) but noted because it will silently break both
  features again via mixed-content blocking once deployed over HTTPS, unless
  addressed separately first.

## Design

### 1. Reorder `/contact.html`

Move `<section id="book">` (the calendar) to directly follow the hero
`pagehead` section, ahead of `<section id="enquire">` (the inquiry form).
New order: Hero → Book directly (calendar) → Tell us what is going wrong
(form) → Examination/map → Terms → Routes.

Pure HTML reorder. No JS changes — `EX.bookingWidget()` and `EX.examination()`
already work wherever their host elements sit; `window.PAGE` already calls
both.

### 2. Map discoverability + free-text pain point

Both changes live in the shared `examination(host)` function in
[assets/site.js](../../../assets/site.js) (~line 354), so they apply
everywhere the widget is mounted, not just `/contact`.

- **Upfront teaser.** Add a fixed line above the checklist, inside
  `.exam-head` or immediately before `.exam-body`: something naming the
  outcome up front (e.g. "Tick what's true — mark enough of these and we'll
  draw a free one-page map of where the work leaks"). Copy is mine to finalize
  at implementation time; no further approval needed for wording.

- **Free-text field.** Add a textarea below the 8 checkboxes: "Something else
  entirely? Tell us in your own words." Behaviour:
  - Typing in it (non-empty, trimmed) counts the same as ticking a box for the
    purposes of revealing the map offer — `leakMap()`'s `sync()` currently
    hides the map stage when `marked().length === 0`; it must also check the
    free-text value.
  - When 0 boxes are ticked but free text is present, `update()`'s verdict
    display must not show "No marks yet…" (`VERDICTS[0]`) — swap in a neutral
    client-side acknowledgement instead (no change to the shared
    `VERDICTS`/`data.js` array; this is presentation-only logic in
    `examination()`).
  - The indicated-modules chip row stays driven by checkbox marks only in the
    *deterministic* (no-AI) preview — free text cannot deterministically map
    to a module without a model call, which matches the existing "AI-off
    path never calls the model" design in `lib/examination/fallback.ts`. This
    is an accepted limitation, not a gap to fix.
  - Both `askFollowUps()` and `drawMap()` POST bodies gain the free-text value
    (call it `otherPain`), sent alongside `markedIds` on both the
    `stage: 'followups'` and `stage: 'map'` calls.

### 3. Thread free text through generation

- `lib/examination/handler.ts`: `ExamineRequest` gains `otherPain?: string`.
  Sanitize the same way as `sanitizeFollowUps` (trim, cap length — 500 chars).
  Pass through to `generateFollowUps` / `generateMap` and into the row passed
  to `recordQuietly` for both stages.
- `lib/examination/prompt.ts`: `ExaminationInput` gains `otherPain?: string`.
  `buildFollowUpPrompt` and `buildMapPrompt` append a block when present:
  ```
  They also described, in their own words:
  "<otherPain>"
  ```
  `SYSTEM_PROMPT` gets light rewording to acknowledge visitors may describe
  their situation in free text in addition to marking statements — the prompt
  text itself stays static across all requests (no interpolation), so the
  `cache_control: { type: 'ephemeral' }` prompt caching is unaffected.
- No schema.ts changes needed — `otherPain` is an input, not part of the
  model's structured output contract.

### 4. Admin Leads page

New migration `supabase/0003_examinations_admin.sql`:

```sql
alter table public.examinations add column if not exists other_pain text;
alter table public.examinations add column if not exists handled_at timestamptz;

create policy "admins can read examinations"
  on public.examinations
  for select
  using (public.has_role(auth.uid(), 'admin'));
```

Read-only policy — writes to `examinations` stay service-role-only (the
existing `api/examine.ts` path), matching the table's original "no public
insert path" rationale in `0001_examinations.sql`.

This migration must be applied manually via the Supabase Studio SQL editor —
no automated migration runner or direct Postgres connection is available in
this environment (confirmed: no `psql`, no connection string beyond the
service-role REST key). Same manual-apply precedent as prior migrations to
this project.

New files, mirroring the existing `Submissions.tsx` / `useSubmissions.ts`
pattern exactly:

- `admin/src/hooks/useExaminations.ts` — queries `examinations` where
  `generated = true` (excludes the anonymous, identity-less follow-up-stage
  cost-tracking rows described in `handler.ts`'s comments), ordered by
  `created_at desc`. Exposes a `markHandled` mutation (sets `handled_at`) and
  reuses the existing `convertToContact`-style insert into `contacts`.
- `admin/src/pages/Leads.tsx` — table: When · Lead (name/email) · Severity
  badge · Marked (n/8) · Indicated modules (chips) · Actions (Mark
  contacted, Convert to CRM). Row expansion or a modal (reusing
  `components/Modal.tsx`) shows the follow-up Q&A and `other_pain` text when
  present.
- `admin/src/App.tsx` / `admin/src/components/Shell.tsx`: new route + nav
  entry, labeled "Leads".

## Out of scope (confirmed with user or flagged, not acted on)

- Production deployment / DNS cutover / HTTPS for the self-hosted Supabase
  instance. Both features will break again via browser mixed-content
  blocking once deployed to `https://experius.xyz` against the current
  `http://` Supabase URL, until that's addressed separately.
- Fixing the stale `supabase/0002_inquiries.sql` vs. live `inquiries` schema
  mismatch.
- Changing the lead-gate order for the map (confirmed with user: keep
  follow-up questions free/anonymous, identity required only at the final
  map-generation stage — this already satisfies "no map without name and
  email").
