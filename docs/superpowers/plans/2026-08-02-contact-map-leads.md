# Contact Page IA, Map Discoverability & Leads Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make "Book a call" land on a calendar instead of a form, make the leak-map offer visible before a visitor starts clicking, let a visitor describe their own problem in free text if none of the 8 checklist statements fit, and give the admin panel a view of completed map submissions.

**Architecture:** Four independently testable slices against the existing EXPERIUS static site + admin React app: (1) reorder two existing sections in `contact.html`, (2) extend the shared `examination()`/`leakMap()` widget in `assets/site.js` with a teaser line and a free-text field, threaded through the existing `lib/examination/` pipeline into a new `other_pain` column, (3) a Supabase migration adding that column plus an admin-read RLS policy, (4) a new `Leads` page in the admin app mirroring the existing `Submissions` page's hook/table pattern.

**Tech Stack:** Vanilla JS (`assets/site.js`, no bundler), TypeScript (`lib/examination/`, Vercel functions), Postgres/Supabase (self-hosted), React + TanStack Query + react-router-dom (admin app).

---

### Task 1: Reorder the contact page

**Files:**
- Modify: `contact.html:64-132`

- [ ] **Step 1: Swap the inquiry-form and booking sections, and fix their eyebrow labels**

The two sections are adjacent. Replace this block (currently: inquiry form, then booking):

```html
  <!-- ── The inquiry form ─────────────────────────────────────────── -->
  <section id="enquire">
    <div class="wrap">
      <div class="sec-head">
        <div><span class="sec-num">Start here</span></div>
        <div>
          <h2 class="d2 col" data-r>Tell us what is going wrong.</h2>
          <p class="lead col" data-r style="margin-top:1rem">
            A few sentences is enough. We read every one, and you will hear back from
            Majedul — not an assistant, not an autoresponder.
          </p>
        </div>
      </div>

      <form class="enquiry" data-inquiry novalidate>
        <div class="enq-grid">
          <label class="enq-field">
            <span>Your name</span>
            <input type="text" name="name" autocomplete="name" placeholder="Rafiq Hasan" required>
            <em data-err="name"></em>
          </label>
          <label class="enq-field">
            <span>Email</span>
            <input type="email" name="email" autocomplete="email" placeholder="you@yourpractice.com" required>
            <em data-err="email"></em>
          </label>
        </div>
        <label class="enq-field">
          <span>Clinic, charity or business <i>optional</i></span>
          <input type="text" name="business" autocomplete="organization" placeholder="Clinic, charity, jeweller&hellip;">
        </label>
        <label class="enq-field">
          <span>What is going wrong?</span>
          <textarea name="message" rows="5" required
            placeholder="Enquiries arrive on Facebook and the desk answers them in the evening. Half the time nobody follows up."></textarea>
          <em data-err="message"></em>
        </label>

        <!-- Honeypot: hidden from people, irresistible to bots. -->
        <label class="enq-trap" aria-hidden="true" tabindex="-1">
          Website<input type="text" name="website" tabindex="-1" autocomplete="off">
        </label>

        <div class="enq-foot">
          <button class="act red" type="submit">Send it &rarr;</button>
          <span class="enq-note">No list, no sequence. We reply or we do not — nothing else happens.</span>
        </div>
        <div class="enq-status" data-status hidden></div>
      </form>
    </div>
  </section>

  <!-- ── Book directly against real availability ─────────────────── -->
  <section id="book">
    <div class="wrap">
      <div class="sec-head">
        <div><span class="sec-num">Or book directly</span></div>
        <div>
          <h2 class="d2 col" data-r>Pick a time yourself.</h2>
          <p class="lead col" data-r style="margin-top:1rem">
            This calendar reads and writes against the same database our own booking system
            runs on for clients — the slot you take is actually held, not a form that
            emails us your preference.
          </p>
        </div>
      </div>
      <div data-r data-book></div>
    </div>
  </section>
```

with the sections swapped and the eyebrow labels updated so "Or write to us" correctly follows "Start here" (currently both say things that only make sense in the old order):

```html
  <!-- ── Book directly against real availability ─────────────────── -->
  <section id="book">
    <div class="wrap">
      <div class="sec-head">
        <div><span class="sec-num">Start here</span></div>
        <div>
          <h2 class="d2 col" data-r>Pick a time yourself.</h2>
          <p class="lead col" data-r style="margin-top:1rem">
            This calendar reads and writes against the same database our own booking system
            runs on for clients — the slot you take is actually held, not a form that
            emails us your preference.
          </p>
        </div>
      </div>
      <div data-r data-book></div>
    </div>
  </section>

  <!-- ── The inquiry form ─────────────────────────────────────────── -->
  <section id="enquire">
    <div class="wrap">
      <div class="sec-head">
        <div><span class="sec-num">Or write to us</span></div>
        <div>
          <h2 class="d2 col" data-r>Tell us what is going wrong.</h2>
          <p class="lead col" data-r style="margin-top:1rem">
            A few sentences is enough. We read every one, and you will hear back from
            Majedul — not an assistant, not an autoresponder.
          </p>
        </div>
      </div>

      <form class="enquiry" data-inquiry novalidate>
        <div class="enq-grid">
          <label class="enq-field">
            <span>Your name</span>
            <input type="text" name="name" autocomplete="name" placeholder="Rafiq Hasan" required>
            <em data-err="name"></em>
          </label>
          <label class="enq-field">
            <span>Email</span>
            <input type="email" name="email" autocomplete="email" placeholder="you@yourpractice.com" required>
            <em data-err="email"></em>
          </label>
        </div>
        <label class="enq-field">
          <span>Clinic, charity or business <i>optional</i></span>
          <input type="text" name="business" autocomplete="organization" placeholder="Clinic, charity, jeweller&hellip;">
        </label>
        <label class="enq-field">
          <span>What is going wrong?</span>
          <textarea name="message" rows="5" required
            placeholder="Enquiries arrive on Facebook and the desk answers them in the evening. Half the time nobody follows up."></textarea>
          <em data-err="message"></em>
        </label>

        <!-- Honeypot: hidden from people, irresistible to bots. -->
        <label class="enq-trap" aria-hidden="true" tabindex="-1">
          Website<input type="text" name="website" tabindex="-1" autocomplete="off">
        </label>

        <div class="enq-foot">
          <button class="act red" type="submit">Send it &rarr;</button>
          <span class="enq-note">No list, no sequence. We reply or we do not — nothing else happens.</span>
        </div>
        <div class="enq-status" data-status hidden></div>
      </form>
    </div>
  </section>
```

- [ ] **Step 2: Verify in a browser**

Run: `npm run dev` (from repo root, if not already running), then use Playwright to navigate to `http://localhost:5174/contact` and take a snapshot.

Expected: the accessibility tree shows the "Pick a time yourself." heading and the `book-day` buttons appearing directly after the hero card, before "Tell us what is going wrong."

- [ ] **Step 3: Commit**

No git repository exists in this project (confirmed via `git status` → "fatal: not a git repository"). Skip this step — there is no version control to commit to. If a repository is initialized later, commit `contact.html` with message: `reorder contact page so the calendar leads`.

---

### Task 2: Map teaser line + free-text field in the shared examination widget

**Files:**
- Modify: `assets/site.js:354-408` (the `examination` function)
- Modify: `assets/site.js:418-638` (the `leakMap` function)

- [ ] **Step 1: Add the teaser line and the free-text field to `examination()`**

Replace the `examination` function:

```javascript
  function examination(host) {
    var E = S.exam
    host.innerHTML =
      // These sit on the dark bar, so they need their own light-on-dark styles —
      // the generic .typed label is dark ink and would vanish here.
      '<div class="exam-head"><span class="lbl">Examine your business — 8 questions</span>' +
      '<span class="count" id="counter">0 of 8 marked</span></div>' +
      '<div class="exam-body"><div id="qs">' +
      E.questions
        .map(function (q) {
          return (
            '<label class="q"><input type="checkbox" data-qid="' + q.id + '" data-mod="' + q.mod + '">' +
            '<span class="box"></span><span class="t">' + q.t + '</span></label>'
          )
        })
        .join('') +
      '</div><aside class="finding"><span class="typed">Preliminary finding</span>' +
      '<div class="gauge"><i id="gauge"></i></div>' +
      '<p class="verdict" id="verdict"></p><p class="detail" id="detail"></p>' +
      '<div class="indicated" id="indicated" hidden><span class="typed">Indicated modules</span>' +
      '<div class="chips" id="chips"></div></div></aside></div>' +
      '<div class="exam-foot"><span class="typed">Nothing is submitted or stored — this runs entirely in your browser.</span></div>'

    var boxes = [].slice.call(host.querySelectorAll('#qs input'))
    var verdict = host.querySelector('#verdict')
    var detail = host.querySelector('#detail')
    var gauge = host.querySelector('#gauge')
    var counter = host.querySelector('#counter')
    var chips = host.querySelector('#chips')
    var indicated = host.querySelector('#indicated')

    function update() {
      var marked = boxes.filter(function (b) { return b.checked })
      var n = marked.length
      var mods = []
      marked.forEach(function (b) { if (mods.indexOf(b.dataset.mod) === -1) mods.push(b.dataset.mod) })

      verdict.textContent = E.verdicts[n].v
      detail.textContent = E.verdicts[n].d
      gauge.style.width = (n / 8) * 100 + '%'
      counter.textContent = n + ' of 8 marked'

      if (!n) { indicated.hidden = true; chips.innerHTML = ''; return }
      indicated.hidden = false
      chips.innerHTML = mods
        .map(function (m, i) {
          return '<span class="chip" style="animation-delay:' + i * 45 + 'ms">' + m + '</span>'
        })
        .join('')
    }
    boxes.forEach(function (b) { b.addEventListener('change', update) })
    update()

    leakMap(host, boxes)
  }
```

with:

```javascript
  function examination(host) {
    var E = S.exam
    host.innerHTML =
      // These sit on the dark bar, so they need their own light-on-dark styles —
      // the generic .typed label is dark ink and would vanish here.
      '<div class="exam-head"><span class="lbl">Examine your business — 8 questions</span>' +
      '<span class="count" id="counter">0 of 8 marked</span></div>' +
      '<p class="exam-teaser">Tick what is true — mark enough of these and we will draw you ' +
      'a free one-page map of where the work leaks.</p>' +
      '<div class="exam-body"><div id="qs">' +
      E.questions
        .map(function (q) {
          return (
            '<label class="q"><input type="checkbox" data-qid="' + q.id + '" data-mod="' + q.mod + '">' +
            '<span class="box"></span><span class="t">' + q.t + '</span></label>'
          )
        })
        .join('') +
      '<div class="examother"><label for="examOther">Something else entirely?</label>' +
      '<textarea id="examOther" rows="2" placeholder="Tell us in your own words — e.g. we&#8217;re ' +
      'drowning in WhatsApp messages and nobody owns them."></textarea></div>' +
      '</div><aside class="finding"><span class="typed">Preliminary finding</span>' +
      '<div class="gauge"><i id="gauge"></i></div>' +
      '<p class="verdict" id="verdict"></p><p class="detail" id="detail"></p>' +
      '<div class="indicated" id="indicated" hidden><span class="typed">Indicated modules</span>' +
      '<div class="chips" id="chips"></div></div></aside></div>' +
      '<div class="exam-foot"><span class="typed">Nothing is submitted or stored — this runs entirely in your browser.</span></div>'

    var boxes = [].slice.call(host.querySelectorAll('#qs input'))
    var otherEl = host.querySelector('#examOther')
    var verdict = host.querySelector('#verdict')
    var detail = host.querySelector('#detail')
    var gauge = host.querySelector('#gauge')
    var counter = host.querySelector('#counter')
    var chips = host.querySelector('#chips')
    var indicated = host.querySelector('#indicated')

    function otherText() {
      return (otherEl.value || '').trim()
    }

    function update() {
      var marked = boxes.filter(function (b) { return b.checked })
      var n = marked.length
      var mods = []
      marked.forEach(function (b) { if (mods.indexOf(b.dataset.mod) === -1) mods.push(b.dataset.mod) })

      if (!n && otherText()) {
        verdict.textContent = 'Got it — you can also tick anything above that is true.'
        detail.textContent = 'The map below will work from what you just told us, even with ' +
          'nothing ticked. Marking a statement too gives it more to go on.'
      } else {
        verdict.textContent = E.verdicts[n].v
        detail.textContent = E.verdicts[n].d
      }
      gauge.style.width = (n / 8) * 100 + '%'
      counter.textContent = n + ' of 8 marked'

      if (!n) { indicated.hidden = true; chips.innerHTML = ''; return }
      indicated.hidden = false
      chips.innerHTML = mods
        .map(function (m, i) {
          return '<span class="chip" style="animation-delay:' + i * 45 + 'ms">' + m + '</span>'
        })
        .join('')
    }
    boxes.forEach(function (b) { b.addEventListener('change', update) })
    otherEl.addEventListener('input', update)
    update()

    leakMap(host, boxes, otherEl)
  }
```

- [ ] **Step 2: Thread `otherEl` through `leakMap` and gate visibility + payloads on it**

Replace the start of `leakMap` (the signature and the `marked` helper) — this text:

```javascript
  function leakMap(host, boxes) {
    var stage = document.createElement('div')
    stage.className = 'mapstage'
    host.parentNode.insertBefore(stage, host.nextSibling)

    var marked = function () {
      return boxes.filter(function (b) { return b.checked }).map(function (b) { return b.dataset.qid })
    }
```

with:

```javascript
  function leakMap(host, boxes, otherEl) {
    var stage = document.createElement('div')
    stage.className = 'mapstage'
    host.parentNode.insertBefore(stage, host.nextSibling)

    var marked = function () {
      return boxes.filter(function (b) { return b.checked }).map(function (b) { return b.dataset.qid })
    }
    var otherPain = function () {
      return (otherEl.value || '').trim()
    }
```

- [ ] **Step 3: Send `otherPain` on both API calls**

Replace:

```javascript
    function askFollowUps() {
      var ids = marked()
      if (!ids.length) return
      busy('Reading your answers&hellip;')
      post({ stage: 'followups', markedIds: ids }).then(function (res) {
```

with:

```javascript
    function askFollowUps() {
      var ids = marked()
      if (!ids.length && !otherPain()) return
      busy('Reading your answers&hellip;')
      post({ stage: 'followups', markedIds: ids, otherPain: otherPain() }).then(function (res) {
```

Replace:

```javascript
    function drawMap(ids, answers, name, email) {
      busy('Drawing your map&hellip;')
      post({ stage: 'map', markedIds: ids, followUps: answers, name: name, email: email }).then(function (res) {
```

with:

```javascript
    function drawMap(ids, answers, name, email) {
      busy('Drawing your map&hellip;')
      post({ stage: 'map', markedIds: ids, followUps: answers, name: name, email: email, otherPain: otherPain() })
        .then(function (res) {
```

(Note the trailing `.then(` moves to its own line because the `post({...})` call no longer fits on one line — keep the rest of that function body, including its closing `})` and `.catch(...)`, unchanged; only the opening of the chain changes.)

- [ ] **Step 4: Reveal the map stage from free text too**

Replace:

```javascript
    function sync() { stage.hidden = marked().length === 0 }
    boxes.forEach(function (b) { b.addEventListener('change', sync) })
    offer()
    sync()
```

with:

```javascript
    function sync() { stage.hidden = marked().length === 0 && !otherPain() }
    boxes.forEach(function (b) { b.addEventListener('change', sync) })
    otherEl.addEventListener('input', sync)
    offer()
    sync()
```

- [ ] **Step 5: Add minimal CSS for `.exam-teaser` and `.examother`**

**Files:** Modify: `assets/site.css` (find the existing `.exam-head`/`.exam-body`/`.q` rules and add nearby — exact line numbers depend on current file state, so locate by searching for `.exam-head` first)

Add (adjust color/spacing tokens to match whatever custom properties the surrounding `.exam-*` rules already use — read the 20 lines around `.exam-head` before writing this so the values are consistent, not copied blind):

```css
.exam-teaser {
  margin: 0 0 1rem;
  font-size: .95rem;
  opacity: .85;
}
.examother {
  margin-top: .75rem;
  padding-top: .75rem;
  border-top: 1px dashed currentColor;
}
.examother label {
  display: block;
  margin-bottom: .35rem;
  font-size: .85rem;
  opacity: .8;
}
.examother textarea {
  width: 100%;
  font: inherit;
  padding: .5rem .6rem;
  resize: vertical;
}
```

- [ ] **Step 6: Verify in a browser**

Run the dev server, navigate to `/contact`, and:
1. Confirm the teaser line ("Tick what is true...") renders above the checklist.
2. Type text into the "Something else entirely?" textarea without checking any box.
3. Confirm the map offer ("Want the map now?") becomes visible.
4. Confirm the verdict text reads "Got it — you can also tick anything above that is true." instead of "No marks yet."
5. Check the browser's network tab (or Playwright's `browser_network_requests`) after clicking "Draw my map" — confirm the POST body to `/api/examine` includes `"otherPain"`.

- [ ] **Step 7: Commit**

Skip — no git repository (see Task 1 Step 3). If one exists later: `git add assets/site.js assets/site.css && git commit -m "add map teaser and free-text pain-point field to the examination widget"`.

---

### Task 3: Thread `otherPain` through the backend generation pipeline

**Files:**
- Modify: `lib/examination/prompt.ts`
- Modify: `lib/examination/generate.ts`
- Modify: `lib/examination/handler.ts`
- Modify: `lib/examination/limits.ts`
- Modify: `api/examine.ts`
- Modify: `scripts/serve.ts`
- Modify: `scripts/test-examine.ts`

- [ ] **Step 1: Write the failing checks in `scripts/test-examine.ts`**

These test the prompt-building functions directly (pure functions, no network call needed) plus the handler's sanitization of `otherPain`. Add a new block right after the existing `── Input sanitisation ──` block (after its closing `}` around line 71), before the `── Degraded paths ──` block:

```typescript
console.log('\n── Free-text pain point ──────────────────────────────────────')
{
  const { buildFollowUpPrompt, buildMapPrompt } = await import('../lib/examination/prompt')

  const withText = buildFollowUpPrompt(['q1'], 'We are drowning in WhatsApp messages.')
  check('otherPain appears in the follow-up prompt', withText.includes('We are drowning in WhatsApp messages.'))

  const withoutText = buildFollowUpPrompt(['q1'])
  check('follow-up prompt omits the block when otherPain is absent', !withoutText.includes('their own words'))

  const mapWithText = buildMapPrompt({ markedIds: [], otherPain: 'Only free text, no boxes ticked.' })
  check('map prompt carries otherPain even with zero marked ids', mapWithText.includes('Only free text, no boxes ticked.'))

  const store = new MemoryStore()
  const res = await handleExamine(
    { stage: 'followups', markedIds: [], otherPain: '  needs trimming  ', ip },
    store,
  )
  check('follow-ups are not gated by identity when only otherPain is given', res.body.degraded !== 'identity', String(res.body.degraded))
}
```

- [ ] **Step 2: Run the checks to confirm they fail**

Run: `npx tsx scripts/test-examine.ts`
Expected: FAIL on the new checks — `buildFollowUpPrompt` and `buildMapPrompt` don't yet accept `otherPain`, and `handleExamine`'s `ExamineRequest` type doesn't have the field (this will actually be a TypeScript compile error at this point, which is the correct failure mode before Step 3).

- [ ] **Step 3: Add `otherPain` to `lib/examination/prompt.ts`**

Replace:

```typescript
export type ExaminationInput = {
  /** Ids of the statements they marked true. */
  markedIds: string[]
  /** Optional free-text answers to the generated follow-ups. */
  followUps?: { question: string; answer: string }[]
}

function markedBlock(markedIds: string[]): string {
  const marked = QUESTIONS.filter((q) => markedIds.includes(q.id))
  const unmarked = QUESTIONS.filter((q) => !markedIds.includes(q.id))
  const fmt = (list: Question[]) =>
    list.length ? list.map((q) => `- ${q.text}`).join('\n') : '- (none)'

  return `They marked these as TRUE of their business (${marked.length} of ${QUESTIONS.length}):
${fmt(marked)}

They left these UNMARKED — treat these joins as working:
${fmt(unmarked)}`
}

/** The user turn for the map + brief generation. Varies per visitor. */
export function buildMapPrompt(input: ExaminationInput): string {
  const followUps = input.followUps?.filter((f) => f.answer.trim())
  const followUpBlock = followUps?.length
    ? `\n\nThey also answered:\n${followUps
        .map((f) => `Q: ${f.question}\nA: ${f.answer.trim()}`)
        .join('\n\n')}`
    : '\n\nThey did not answer the follow-up questions. Work from the marks alone and say so in `unknowns`.'

  return `${markedBlock(input.markedIds)}${followUpBlock}

Write their map, and a short internal brief for the EXPERIUS co-founder who will take the call.`
}

/** The user turn for generating adaptive follow-ups. */
export function buildFollowUpPrompt(markedIds: string[]): string {
  return `${markedBlock(markedIds)}

Write two or three short follow-up questions that would most improve the map you are about to write for them.

Ask about things their marks imply but do not establish — volume, timing, who currently does the carrying, what they have already tried. Each question must be answerable in one sentence by somebody who runs the business and is not thinking hard about it.

Do not ask for their budget. Do not ask anything you could reasonably infer from the marks you already have. Do not ask two questions in one.`
}
```

with:

```typescript
export type ExaminationInput = {
  /** Ids of the statements they marked true. */
  markedIds: string[]
  /** Optional free-text answers to the generated follow-ups. */
  followUps?: { question: string; answer: string }[]
  /** Optional free-text description of their situation, in their own words. */
  otherPain?: string
}

function markedBlock(markedIds: string[]): string {
  const marked = QUESTIONS.filter((q) => markedIds.includes(q.id))
  const unmarked = QUESTIONS.filter((q) => !markedIds.includes(q.id))
  const fmt = (list: Question[]) =>
    list.length ? list.map((q) => `- ${q.text}`).join('\n') : '- (none)'

  return `They marked these as TRUE of their business (${marked.length} of ${QUESTIONS.length}):
${fmt(marked)}

They left these UNMARKED — treat these joins as working:
${fmt(unmarked)}`
}

function otherPainBlock(otherPain?: string): string {
  const text = otherPain?.trim()
  return text ? `\n\nThey also described their situation in their own words:\n"${text}"` : ''
}

/** The user turn for the map + brief generation. Varies per visitor. */
export function buildMapPrompt(input: ExaminationInput): string {
  const followUps = input.followUps?.filter((f) => f.answer.trim())
  const followUpBlock = followUps?.length
    ? `\n\nThey also answered:\n${followUps
        .map((f) => `Q: ${f.question}\nA: ${f.answer.trim()}`)
        .join('\n\n')}`
    : '\n\nThey did not answer the follow-up questions. Work from the marks alone and say so in `unknowns`.'

  return `${markedBlock(input.markedIds)}${followUpBlock}${otherPainBlock(input.otherPain)}

Write their map, and a short internal brief for the EXPERIUS co-founder who will take the call.`
}

/** The user turn for generating adaptive follow-ups. */
export function buildFollowUpPrompt(markedIds: string[], otherPain?: string): string {
  return `${markedBlock(markedIds)}${otherPainBlock(otherPain)}

Write two or three short follow-up questions that would most improve the map you are about to write for them.

Ask about things their marks imply but do not establish — volume, timing, who currently does the carrying, what they have already tried. Each question must be answerable in one sentence by somebody who runs the business and is not thinking hard about it.

Do not ask for their budget. Do not ask anything you could reasonably infer from the marks you already have. Do not ask two questions in one.`
}
```

Also update `SYSTEM_PROMPT`'s opening line so it acknowledges free text (this string stays static across every request — no interpolation — so prompt caching is unaffected). Replace:

```typescript
export const SYSTEM_PROMPT = `You write diagnostic maps for EXPERIUS, a firm that builds the operating systems service businesses run on.

A visitor has just marked which of eight statements are true of their business. Your job is to turn those marks into the one-page map EXPERIUS promises: where their work leaks, which step costs the most, and what it would be worth finding out.
```

with:

```typescript
export const SYSTEM_PROMPT = `You write diagnostic maps for EXPERIUS, a firm that builds the operating systems service businesses run on.

A visitor has just marked which of eight statements are true of their business, and optionally described their own situation in their own words. Your job is to turn those marks — and anything they wrote — into the one-page map EXPERIUS promises: where their work leaks, which step costs the most, and what it would be worth finding out.
```

- [ ] **Step 4: Add `otherPain` to `generateFollowUps` in `lib/examination/generate.ts`**

Replace:

```typescript
/** Two or three questions tailored to what they marked. */
export async function generateFollowUps(
  markedIds: string[],
): Promise<{ data: FollowUps; usage: Usage }> {
  const res = await client().messages.parse({
    model: MODEL,
    max_tokens: 2000,
    // Stable prefix → cached. The visitor's marks go in the user turn, after it.
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    output_config: { format: zodOutputFormat(FollowUps) },
    messages: [{ role: 'user', content: buildFollowUpPrompt(markedIds) }],
  })
  if (!res.parsed_output) throw new Error('follow-up generation returned no parsed output')
  return { data: res.parsed_output, usage: usageOf(res) }
}
```

with:

```typescript
/** Two or three questions tailored to what they marked. */
export async function generateFollowUps(
  markedIds: string[],
  otherPain?: string,
): Promise<{ data: FollowUps; usage: Usage }> {
  const res = await client().messages.parse({
    model: MODEL,
    max_tokens: 2000,
    // Stable prefix → cached. The visitor's marks go in the user turn, after it.
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    output_config: { format: zodOutputFormat(FollowUps) },
    messages: [{ role: 'user', content: buildFollowUpPrompt(markedIds, otherPain) }],
  })
  if (!res.parsed_output) throw new Error('follow-up generation returned no parsed output')
  return { data: res.parsed_output, usage: usageOf(res) }
}
```

- [ ] **Step 5: Add `otherPain` to `ExaminationRow` in `lib/examination/limits.ts`**

Replace:

```typescript
export type ExaminationRow = {
  ip_hash: string
  /** Volunteered in exchange for the map. Confidential — publish aggregates only. */
  name: string | null
  email: string | null
  marked_ids: string[]
  marked_count: number
  follow_ups: { question: string; answer: string }[] | null
  indicated: string[]
  severity: string
  referrer: string | null
  utm: string | null
  cost_usd: number
  generated: boolean
}
```

with:

```typescript
export type ExaminationRow = {
  ip_hash: string
  /** Volunteered in exchange for the map. Confidential — publish aggregates only. */
  name: string | null
  email: string | null
  marked_ids: string[]
  marked_count: number
  follow_ups: { question: string; answer: string }[] | null
  /** Free-text description of their situation, in their own words. Confidential, same as name/email. */
  other_pain: string | null
  indicated: string[]
  severity: string
  referrer: string | null
  utm: string | null
  cost_usd: number
  generated: boolean
}
```

- [ ] **Step 6: Add `otherPain` to `ExamineRequest` and thread it through `handleExamine` in `lib/examination/handler.ts`**

Replace:

```typescript
export type ExamineRequest = {
  stage: 'followups' | 'map'
  markedIds: string[]
  followUps?: { question: string; answer: string }[]
  /** Required to draw the map — it is emailed to them. */
  name?: string
  email?: string
  ip: string
  referrer?: string | null
  utm?: string | null
}
```

with:

```typescript
export type ExamineRequest = {
  stage: 'followups' | 'map'
  markedIds: string[]
  followUps?: { question: string; answer: string }[]
  /** Free-text description of their situation, when the 8 statements don't fit. */
  otherPain?: string
  /** Required to draw the map — it is emailed to them. */
  name?: string
  email?: string
  ip: string
  referrer?: string | null
  utm?: string | null
}
```

Add a sanitizer next to `sanitizeFollowUps` (after its closing `}`, before `export async function handleExamine`):

```typescript
function sanitizeOtherPain(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const text = v.trim().slice(0, 500)
  return text.length ? text : null
}
```

In `handleExamine`, replace:

```typescript
  const markedIds = validMarkedIds(req.markedIds)
  const followUps = sanitizeFollowUps(req.followUps)
  const deterministic = deterministicResult(markedIds)
  const name = validName(req.name)
  const email = validEmail(req.email)
```

with:

```typescript
  const markedIds = validMarkedIds(req.markedIds)
  const followUps = sanitizeFollowUps(req.followUps)
  const otherPain = sanitizeOtherPain(req.otherPain)
  const deterministic = deterministicResult(markedIds)
  const name = validName(req.name)
  const email = validEmail(req.email)
```

Replace:

```typescript
  let usage: Usage = { input: 0, output: 0, cacheRead: 0 }
  try {
    if (req.stage === 'followups') {
      const { data, usage: u } = await generateFollowUps(markedIds)
      usage = u
      // Follow-ups are an intermediate step — recorded for cost, not as a
      // completed examination, so they don't pollute the research dataset.
      await recordQuietly(store, {
        ip_hash: ipHash,
        name: null,
        email: null,
        marked_ids: markedIds,
        marked_count: markedIds.length,
        follow_ups: null,
        indicated: deterministic.indicated,
        severity: deterministic.severity,
        referrer: req.referrer ?? null,
        utm: req.utm ?? null,
        cost_usd: costOf(u),
        generated: false,
      })
      return ok({ followUps: data.questions })
    }

    const { data, usage: u } = await generateMap({ markedIds, followUps })
    usage = u
    await recordQuietly(store, {
      ip_hash: ipHash,
      name,
      email,
      marked_ids: markedIds,
      marked_count: markedIds.length,
      follow_ups: followUps.length ? followUps : null,
      indicated: deterministic.indicated,
      severity: deterministic.severity,
      referrer: req.referrer ?? null,
      utm: req.utm ?? null,
      cost_usd: costOf(u),
      generated: true,
    })
```

with:

```typescript
  let usage: Usage = { input: 0, output: 0, cacheRead: 0 }
  try {
    if (req.stage === 'followups') {
      const { data, usage: u } = await generateFollowUps(markedIds, otherPain ?? undefined)
      usage = u
      // Follow-ups are an intermediate step — recorded for cost, not as a
      // completed examination, so they don't pollute the research dataset.
      await recordQuietly(store, {
        ip_hash: ipHash,
        name: null,
        email: null,
        marked_ids: markedIds,
        marked_count: markedIds.length,
        follow_ups: null,
        other_pain: otherPain,
        indicated: deterministic.indicated,
        severity: deterministic.severity,
        referrer: req.referrer ?? null,
        utm: req.utm ?? null,
        cost_usd: costOf(u),
        generated: false,
      })
      return ok({ followUps: data.questions })
    }

    const { data, usage: u } = await generateMap({ markedIds, followUps, otherPain: otherPain ?? undefined })
    usage = u
    await recordQuietly(store, {
      ip_hash: ipHash,
      name,
      email,
      marked_ids: markedIds,
      marked_count: markedIds.length,
      follow_ups: followUps.length ? followUps : null,
      other_pain: otherPain,
      indicated: deterministic.indicated,
      severity: deterministic.severity,
      referrer: req.referrer ?? null,
      utm: req.utm ?? null,
      cost_usd: costOf(u),
      generated: true,
    })
```

- [ ] **Step 7: Update the two hand-built `ExaminationRow` literals in `scripts/test-examine.ts`**

These are in the existing "Rate limit" and "Spend cap" blocks (search for `follow_ups: null, indicated: []` — there are two occurrences). Add `other_pain: null,` to each, e.g. replace:

```typescript
      ip_hash: h, name: null, email: null, marked_ids: [], marked_count: 0, follow_ups: null, indicated: [],
      severity: 'mild', referrer: null, utm: null, cost_usd: 0.01, generated: true,
```

with:

```typescript
      ip_hash: h, name: null, email: null, marked_ids: [], marked_count: 0, follow_ups: null, other_pain: null, indicated: [],
      severity: 'mild', referrer: null, utm: null, cost_usd: 0.01, generated: true,
```

and the equivalent line in the spend-cap block (same shape, `ip_hash: 'someone-else'`).

- [ ] **Step 8: Thread `otherPain` through `api/examine.ts`**

Replace:

```typescript
  const stage = payload.stage === 'map' ? 'map' : 'followups'
  const input: ExamineRequest = {
    stage,
    markedIds: (payload.markedIds as string[]) ?? [],
    followUps: payload.followUps as ExamineRequest['followUps'],
    // The handler validates these; passing them through is all this layer does.
    name: typeof payload.name === 'string' ? payload.name : undefined,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    ip: clientIp(req),
    referrer: header(req, 'referer'),
    utm: typeof payload.utm === 'string' ? payload.utm.slice(0, 200) : null,
  }
```

with:

```typescript
  const stage = payload.stage === 'map' ? 'map' : 'followups'
  const input: ExamineRequest = {
    stage,
    markedIds: (payload.markedIds as string[]) ?? [],
    followUps: payload.followUps as ExamineRequest['followUps'],
    // The handler validates these; passing them through is all this layer does.
    otherPain: typeof payload.otherPain === 'string' ? payload.otherPain.slice(0, 500) : undefined,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    ip: clientIp(req),
    referrer: header(req, 'referer'),
    utm: typeof payload.utm === 'string' ? payload.utm.slice(0, 200) : null,
  }
```

Also surface it in the internal brief email. Replace:

```typescript
  const lines = [
    `Severity: ${brief.severity} · ${input.markedIds.length}/8 marked`,
    `Likely segment: ${brief.likelySegment}`,
    '',
    brief.summary,
    '',
    `Open with: ${brief.openingQuestion}`,
    '',
    brief.signals.length ? `Signals:\n${brief.signals.map((s) => `- ${s}`).join('\n')}` : '',
    brief.redFlags.length ? `Red flags:\n${brief.redFlags.map((s) => `- ${s}`).join('\n')}` : '',
    input.utm ? `\nSource: ${input.utm}` : '',
  ]
```

with:

```typescript
  const lines = [
    `Severity: ${brief.severity} · ${input.markedIds.length}/8 marked`,
    `Likely segment: ${brief.likelySegment}`,
    '',
    brief.summary,
    '',
    input.otherPain ? `In their own words: "${input.otherPain}"\n` : '',
    `Open with: ${brief.openingQuestion}`,
    '',
    brief.signals.length ? `Signals:\n${brief.signals.map((s) => `- ${s}`).join('\n')}` : '',
    brief.redFlags.length ? `Red flags:\n${brief.redFlags.map((s) => `- ${s}`).join('\n')}` : '',
    input.utm ? `\nSource: ${input.utm}` : '',
  ]
```

- [ ] **Step 9: Thread `otherPain` through the local dev server in `scripts/serve.ts`**

Replace:

```typescript
    const payload = JSON.parse((await body(req)) || '{}')
    const input: ExamineRequest = {
      stage: payload.stage === 'map' ? 'map' : 'followups',
      markedIds: payload.markedIds ?? [],
      followUps: payload.followUps,
      name: payload.name,
      email: payload.email,
      ip: req.socket.remoteAddress ?? '127.0.0.1',
      referrer: (req.headers.referer as string) ?? null,
      utm: typeof payload.utm === 'string' ? payload.utm.slice(0, 200) : null,
    }
```

with:

```typescript
    const payload = JSON.parse((await body(req)) || '{}')
    const input: ExamineRequest = {
      stage: payload.stage === 'map' ? 'map' : 'followups',
      markedIds: payload.markedIds ?? [],
      followUps: payload.followUps,
      otherPain: typeof payload.otherPain === 'string' ? payload.otherPain.slice(0, 500) : undefined,
      name: payload.name,
      email: payload.email,
      ip: req.socket.remoteAddress ?? '127.0.0.1',
      referrer: (req.headers.referer as string) ?? null,
      utm: typeof payload.utm === 'string' ? payload.utm.slice(0, 200) : null,
    }
```

- [ ] **Step 10: Run the checks to confirm they pass**

Run: `npx tsx scripts/test-examine.ts`
Expected: `✓ all checks passed` — including the four new checks from Step 1. Without `ANTHROPIC_API_KEY` set, the "Generation (live)" section is skipped, which is fine; the new checks don't require it since `buildFollowUpPrompt`/`buildMapPrompt` are pure functions and the identity-gate check exercises `handleExamine`'s non-AI path.

- [ ] **Step 11: Type-check**

Run: `node scripts/audit-type.mjs` (or check what this project's type-check entry point actually is — confirm by reading `package.json`'s scripts first; there's no bare `tsc` script, so use the one listed, `npm run audit:type`)
Expected: no new type errors.

- [ ] **Step 12: Commit**

Skip — no git repository (see Task 1 Step 3).

---

### Task 4: Supabase migration — `other_pain`, `handled_at`, admin-read policy

**Files:**
- Create: `supabase/0003_examinations_admin.sql`

- [ ] **Step 1: Write the migration**

```sql
-- ═══════════════════════════════════════════════════════════════════════
-- Adds admin visibility into completed examinations (map leads) and a
-- free-text column for visitors whose situation doesn't fit the 8
-- statements. Writes to `examinations` remain service-role only — this
-- migration only opens a read path for logged-in admins, mirroring the
-- has_role pattern already used by user_roles / useIsAdmin in the admin
-- panel (confirmed live via this project's own PostgREST instance: the
-- has_role(_user_id uuid, _role app_role) RPC and user_roles table
-- already exist).
-- ═══════════════════════════════════════════════════════════════════════

alter table public.examinations add column if not exists other_pain text;
alter table public.examinations add column if not exists handled_at timestamptz;

comment on column public.examinations.other_pain is
  'Free-text description of the visitor''s situation, in their own words. Confidential, same handling as name/email.';
comment on column public.examinations.handled_at is
  'Set by an admin once this lead has been followed up. Worked, not workflow — see inquiries.handled_at for the same pattern.';

create policy "admins can read examinations"
  on public.examinations
  for select
  using (public.has_role(auth.uid(), 'admin'));
```

- [ ] **Step 2: Apply the migration manually**

There is no automated migration runner or direct Postgres connection available in this environment (no `psql`, no connection string beyond the PostgREST service-role key — confirmed during investigation). Apply this file's contents via the Supabase Studio SQL editor for the self-hosted instance at the URL in `.env.local` (`SUPABASE_URL`), using an account with sufficient privilege. After applying, verify with:

```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'examinations'
  and column_name in ('other_pain', 'handled_at');
-- expect 2 rows

select policyname from pg_policies
where schemaname = 'public' and tablename = 'examinations';
-- expect "admins can read examinations" alongside no pre-existing policies
```

- [ ] **Step 3: Verify from the repo**

Run (from repo root, using the same OpenAPI-introspection approach used during investigation):

```bash
SUPA_URL="http://supabasekong-n1o2j37ithw1b8tqicmw7y43.76.13.179.219.sslip.io"
SUPA_KEY="$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2)"
curl -s "$SUPA_URL/rest/v1/" -H "apikey: $SUPA_KEY" | node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
console.log(Object.keys(d.definitions.examinations.properties));
"
```

Expected: the printed list includes `other_pain` and `handled_at`.

- [ ] **Step 4: Commit**

Skip — no git repository (see Task 1 Step 3).

---

### Task 5: Admin "Leads" page

**Files:**
- Create: `admin/src/hooks/useExaminations.ts`
- Create: `admin/src/pages/Leads.tsx`
- Modify: `admin/src/App.tsx`
- Modify: `admin/src/components/Shell.tsx`

- [ ] **Step 1: Write `useExaminations.ts`**

Mirrors `admin/src/hooks/useSubmissions.ts`'s structure.

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Examination {
  id: string
  created_at: string
  name: string | null
  email: string | null
  marked_ids: string[]
  marked_count: number
  follow_ups: { question: string; answer: string }[] | null
  other_pain: string | null
  indicated: string[]
  severity: 'mild' | 'moderate' | 'serious' | 'critical'
  referrer: string | null
  utm: string | null
  handled_at: string | null
}

export function useExaminations() {
  const qc = useQueryClient()
  const inv = () => qc.invalidateQueries({ queryKey: ['examinations'] })

  const { data: examinations = [], isLoading } = useQuery({
    queryKey: ['examinations'],
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('examinations')
        .select(
          'id,created_at,name,email,marked_ids,marked_count,follow_ups,other_pain,indicated,severity,referrer,utm,handled_at',
        )
        .eq('generated', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Examination[]
    },
  })

  const markHandled = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) return
      const { error } = await supabase
        .from('examinations')
        .update({ handled_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: inv,
  })

  const convertToContact = useMutation({
    mutationFn: async (e: Examination) => {
      if (!supabase) return
      const { error } = await supabase.from('contacts').insert({
        name: e.name,
        phone: null,
        email: e.email,
        details: { source: 'examination', examination_id: e.id, marked_count: e.marked_count, severity: e.severity },
        notes: e.other_pain,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })

  return {
    examinations,
    isLoading,
    markHandled: markHandled.mutateAsync,
    convertToContact: convertToContact.mutateAsync,
  }
}
```

- [ ] **Step 2: Write `Leads.tsx`**

Mirrors `admin/src/pages/Submissions.tsx`'s table structure, using the existing `StatusBadge` and `Modal` components for the severity badge and the follow-up/free-text detail view.

```tsx
import { useState } from 'react'
import { useExaminations, type Examination } from '@/hooks/useExaminations'
import { StatusBadge } from '@/components/StatusBadge'
import { Modal } from '@/components/Modal'

const SEVERITY_TONE: Record<Examination['severity'], 'blue' | 'amber' | 'gray' | 'red'> = {
  mild: 'gray',
  moderate: 'blue',
  serious: 'amber',
  critical: 'red',
}

export function Leads() {
  const { examinations, isLoading, markHandled, convertToContact } = useExaminations()
  const [detail, setDetail] = useState<Examination | null>(null)

  return (
    <div>
      <div className="page-head">
        <h1>Leads</h1>
        <p>Completed leak-map submissions — gated behind name and email.</p>
      </div>

      {isLoading ? (
        <div className="loading">Loading…</div>
      ) : examinations.length === 0 ? (
        <div className="empty">No leads yet.</div>
      ) : (
        <table className="kit-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Lead</th>
              <th>Severity</th>
              <th>Marked</th>
              <th>Indicated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {examinations.map((e) => (
              <tr key={e.id}>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--ink-3)' }}>
                  {new Date(e.created_at).toLocaleDateString()}
                </td>
                <td>
                  <div>
                    <b>{e.name}</b>
                  </div>
                  <div style={{ color: 'var(--ink-3)', fontSize: '.8rem' }}>{e.email}</div>
                </td>
                <td>
                  <StatusBadge label={e.severity} tone={SEVERITY_TONE[e.severity]} />
                </td>
                <td>{e.marked_count}/8</td>
                <td style={{ maxWidth: '18rem' }}>{e.indicated.join(', ')}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn small" onClick={() => setDetail(e)}>
                      Details
                    </button>
                    {!e.handled_at && (
                      <button className="btn small" onClick={() => markHandled(e.id)}>
                        Mark contacted
                      </button>
                    )}
                    <button className="btn small" onClick={() => convertToContact(e)}>
                      To CRM
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name ?? ''}
        description={detail?.email ?? undefined}
        footer={<button className="btn small" onClick={() => setDetail(null)}>Close</button>}
      >
        {detail?.other_pain && (
          <p>
            <b>In their own words:</b> {detail.other_pain}
          </p>
        )}
        {(detail?.follow_ups ?? []).map((f, i) => (
          <p key={i}>
            <b>{f.question}</b>
            <br />
            {f.answer}
          </p>
        ))}
        {!detail?.other_pain && !(detail?.follow_ups ?? []).length && <p>No follow-up detail recorded.</p>}
      </Modal>
    </div>
  )
}
```

- [ ] **Step 3: Add the route in `admin/src/App.tsx`**

Replace:

```tsx
import { Submissions } from '@/pages/Submissions'
```

with:

```tsx
import { Submissions } from '@/pages/Submissions'
import { Leads } from '@/pages/Leads'
```

Replace:

```tsx
              <Route path="submissions" element={<Submissions />} />
```

with:

```tsx
              <Route path="submissions" element={<Submissions />} />
              <Route path="leads" element={<Leads />} />
```

- [ ] **Step 4: Add the nav entry in `admin/src/components/Shell.tsx`**

Replace:

```typescript
const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/bookings', label: 'Bookings', end: false },
  { to: '/crm', label: 'CRM', end: false },
  { to: '/submissions', label: 'Submissions', end: false },
  { to: '/availability', label: 'Availability', end: false },
  { to: '/analytics', label: 'Analytics', end: false },
  { to: '/settings', label: 'Settings', end: false },
]
```

with:

```typescript
const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/bookings', label: 'Bookings', end: false },
  { to: '/crm', label: 'CRM', end: false },
  { to: '/submissions', label: 'Submissions', end: false },
  { to: '/leads', label: 'Leads', end: false },
  { to: '/availability', label: 'Availability', end: false },
  { to: '/analytics', label: 'Analytics', end: false },
  { to: '/settings', label: 'Settings', end: false },
]
```

- [ ] **Step 5: Build the admin app**

Run: `cd admin && npm run build`
Expected: `tsc -b && vite build` completes with no TypeScript errors. This is the primary automated verification available here — there is no test framework in `admin/` (confirmed: `package.json` scripts are only `dev`/`build`/`preview`).

- [ ] **Step 6: Manual verification (requires the Task 4 migration applied + an admin login)**

This step cannot be completed by an automated worker without real credentials and the migration live — flag it back to the user rather than marking it done silently:

1. Confirm Task 4's migration has been applied (see Task 4 Step 3).
2. Log into the admin panel at `/admin` with an account that has the `admin` role in `user_roles`.
3. Navigate to `/admin/leads`.
4. Submit a real examination on `/contact` (through to the final "map" stage, with a real name/email) to produce at least one row with `generated = true`.
5. Confirm it appears in the Leads table, "Mark contacted" clears after clicking, and "Details" shows the follow-up Q&A and/or free-text answer.

- [ ] **Step 7: Commit**

Skip — no git repository (see Task 1 Step 3).

---

---

### Task 6: Switch the examine backend from Anthropic direct to OpenRouter

The user provided an `OPENROUTER_API_KEY` (in `docs/.env`) and confirmed the switch, then chose **`anthropic/claude-haiku-4.5`** over the recommended `anthropic/claude-opus-5` after seeing real OpenRouter pricing (haiku-4.5: $1/$5 per MTok vs. opus-5: $5/$25). Confirmed live against OpenRouter's model catalog before writing any code:

- `anthropic/claude-haiku-4.5` supports `response_format` (`structured_outputs: true`) and `reasoning` (no `reasoning_effort` sub-parameter, unlike opus-5 — pass `reasoning: {effort: ...}` only).
- Prompt caching is supported for this model via OpenRouter's Anthropic pass-through (`cache_control` on a message content block), **but** Claude Haiku 4.5's minimum cacheable prompt length is 4,096 tokens (per OpenRouter's docs) — the current `SYSTEM_PROMPT` is well under that, so the `cache_control` marker is added for correctness/future-proofing but will not actually produce a cache hit at the prompt's current length. Not a bug — noted so nobody investigates a `cache_read_input_tokens`-equivalent field showing zero and assumes something is broken.
- Structured output: use `response_format: {type: 'json_schema', json_schema: {name, strict: true, schema}}` (OpenAI-compatible shape, confirmed via OpenRouter's structured-outputs docs), with the JSON Schema produced by Zod v4's built-in `z.toJSONSchema()` (confirmed current API — no separate import, no `zod-to-json-schema` package needed). None of the three schemas in `lib/examination/schema.ts` (`LeakMap`, `LeadBrief`, `FollowUps`) use `.optional()` fields, so `z.toJSONSchema()`'s output already satisfies OpenAI strict mode's "every property in `required`" rule with no post-processing.

**Files:**
- Modify: `package.json` (swap dependency)
- Modify: `lib/examination/generate.ts` (full rewrite of the client/call logic; `MODEL`, `generationAvailable`, `Usage`, `costOf`, `generateFollowUps`, `generateMap` all stay as the module's public surface — same names, same signatures other people depend on)
- Modify: `scripts/test-examine.ts` (env var check)

- [ ] **Step 1: Swap the dependency**

In `package.json`, replace:

```json
    "@anthropic-ai/sdk": "^0.115.0",
```

with:

```json
    "openai": "^4.104.0",
```

(Keep the surrounding lines and alphabetical-ish ordering as-is otherwise — just this one line changes. Verify `^4.104.0` is reasonable by checking `npm view openai version` before running install, since a pinned version guess here should be confirmed, not assumed.)

Run: `npm install`
Expected: `openai` appears in `node_modules/`, `@anthropic-ai/sdk` is removed (nothing else in the repo imports it — confirmed via `grep -r "@anthropic-ai/sdk" --include=*.ts --include=*.tsx` returning only `lib/examination/generate.ts`, which this task rewrites).

- [ ] **Step 2: Rewrite `lib/examination/generate.ts`**

Replace the entire file with:

```typescript
import OpenAI from 'openai'
import { z } from 'zod'
import { ExaminationResult, FollowUps } from './schema'
import {
  SYSTEM_PROMPT,
  buildMapPrompt,
  buildFollowUpPrompt,
  type ExaminationInput,
} from './prompt'

/*
  The only place that talks to the model.

  Routed through OpenRouter (an OpenAI-compatible endpoint) rather than
  Anthropic directly, on `anthropic/claude-haiku-4.5` — confirmed live on
  OpenRouter's model catalog to support `response_format` structured outputs
  and `reasoning`, at $1/$5 per MTok versus $5/$25 for Opus 5 direct.

  `response_format` + Zod's `z.toJSONSchema()` gives the same "cannot arrive
  in a shape the site doesn't know how to render" guarantee the old
  `messages.parse()` + `zodOutputFormat` pairing gave on the Anthropic SDK —
  we still validate the parsed JSON against the same Zod schema before
  returning it, so a malformed generation fails here rather than halfway
  down a template.

  `cache_control` on the system message is OpenRouter's pass-through of
  Anthropic's explicit prompt-caching syntax — not part of the OpenAI wire
  format, hence the type assertions. At this prompt's current length it sits
  under Claude Haiku 4.5's 4,096-token minimum cacheable prompt, so it has no
  effect yet; kept for when the prompt grows past that, or the model changes.
*/

export const MODEL = 'anthropic/claude-haiku-4.5'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

type CacheableTextPart = { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }

let cached: OpenAI | null = null
function client(): OpenAI {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set')
  }
  // Reused across warm invocations so the connection isn't rebuilt per request.
  cached ??= new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: OPENROUTER_BASE_URL })
  return cached
}

/** True when generation is possible at all. Callers fall back when false. */
export function generationAvailable(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY)
}

export type Usage = { input: number; output: number; cacheRead: number }

function usageOf(u: OpenAI.CompletionUsage | undefined): Usage {
  return {
    input: u?.prompt_tokens ?? 0,
    output: u?.completion_tokens ?? 0,
    cacheRead: (u?.prompt_tokens_details as { cached_tokens?: number } | undefined)?.cached_tokens ?? 0,
  }
}

async function generate<T>(
  userPrompt: string,
  schemaName: string,
  schema: z.ZodType<T>,
  effort?: 'low' | 'medium' | 'high',
): Promise<{ data: T; usage: Usage }> {
  const systemPart: CacheableTextPart = {
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' },
  }
  const body = {
    model: MODEL,
    messages: [
      { role: 'system' as const, content: [systemPart] },
      { role: 'user' as const, content: userPrompt },
    ],
    response_format: {
      type: 'json_schema' as const,
      json_schema: { name: schemaName, strict: true, schema: z.toJSONSchema(schema) },
    },
    ...(effort ? { reasoning: { effort } } : {}),
  }
  // OpenRouter-specific fields (`cache_control`, `reasoning`) aren't part of
  // the upstream OpenAI type surface — the cast below is that gap, not a
  // shortcut around request validation.
  const res = await client().chat.completions.create(
    body as unknown as OpenAI.ChatCompletionCreateParamsNonStreaming,
  )
  const content = res.choices[0]?.message?.content
  if (!content) throw new Error(`${schemaName} generation returned no content`)
  const data = schema.parse(JSON.parse(content))
  return { data, usage: usageOf(res.usage) }
}

/** Two or three questions tailored to what they marked. */
export function generateFollowUps(
  markedIds: string[],
  otherPain?: string,
): Promise<{ data: FollowUps; usage: Usage }> {
  return generate(buildFollowUpPrompt(markedIds, otherPain), 'follow_ups', FollowUps)
}

/**
 * The map and the internal brief, in one call — the brief costs almost nothing
 * once the model has already reasoned about their answers.
 */
export function generateMap(
  input: ExaminationInput,
): Promise<{ data: ExaminationResult; usage: Usage }> {
  return generate(buildMapPrompt(input), 'examination_result', ExaminationResult, 'medium')
}

/** Published per-MTok rates for MODEL (OpenRouter, anthropic/claude-haiku-4.5), for the spend cap. Update on model change. */
const RATE = { input: 1 / 1_000_000, output: 5 / 1_000_000, cacheRead: 0.1 / 1_000_000 }

export function costOf(u: Usage): number {
  return u.input * RATE.input + u.output * RATE.output + u.cacheRead * RATE.cacheRead
}
```

- [ ] **Step 3: Update the env-var check in `scripts/test-examine.ts`**

This script's doc comment and behavior both key off whether generation is available — it already calls `generationAvailable()` from `lib/examination/generate`, which now checks `OPENROUTER_API_KEY` instead of `ANTHROPIC_API_KEY`, so the *logic* needs no change. Only the comment at the top of the file is now inaccurate. Replace:

```typescript
  · No ANTHROPIC_API_KEY  → verifies the degraded path, the deterministic
    result, input sanitisation, and the limits. This is the mode that matters
    most: it proves the conversion device works with AI switched off.

  · Key present           → additionally generates real follow-ups and a real
    map, validates them against the schema, and prints them for reading, with
    the measured cost.
```

with:

```typescript
  · No OPENROUTER_API_KEY → verifies the degraded path, the deterministic
    result, input sanitisation, and the limits. This is the mode that matters
    most: it proves the conversion device works with AI switched off.

  · Key present           → additionally generates real follow-ups and a real
    map, validates them against the schema, and prints them for reading, with
    the measured cost.
```

- [ ] **Step 4: Run the test script against the live model**

Run: `OPENROUTER_API_KEY=$(grep OPENROUTER_API_KEY docs/.env | cut -d= -f2) npx tsx scripts/test-examine.ts`

Expected: `✓ all checks passed`, including the "Generation (live)" section this time (skipped in Task 3's run since no key was set) — it should print real follow-up questions and a real generated map. Read the printed map for a sanity check: no invented numbers in the `arithmetic` formulas (the script already asserts this mechanically via the `digitsInFormulas` check), 3–6 trace steps, 2+ unknowns.

If this fails with an error from OpenRouter (e.g. a 400 on `response_format` or `reasoning`), read the error body before changing anything — OpenRouter's error responses for this endpoint describe exactly which field was rejected, and the fix is almost certainly in the request-shape assumptions from Step 2's design notes above, not in the Zod schemas or prompts (those are unchanged from Task 3).

- [ ] **Step 5: Type-check**

Run: `npm run audit:type`
Expected: no new type errors. If `OpenAI.CompletionUsage` or `OpenAI.ChatCompletionCreateParamsNonStreaming` aren't the exact exported type names in the installed `openai` version, the compiler error will name the actual export — fix the import/type name from that error rather than guessing a replacement.

- [ ] **Step 6: Deployment env var**

`api/examine.ts` and `scripts/serve.ts` don't need code changes for this (they don't reference `ANTHROPIC_API_KEY` directly — only `lib/examination/generate.ts` did, and that's rewritten above). But when this ships to Vercel, `OPENROUTER_API_KEY` needs to be set there as an environment variable — `ANTHROPIC_API_KEY` was never confirmed to be set there either (this repo has no evidence of a live Vercel project yet, per the design doc), so this is a note for whenever deployment happens, not an action to take now.

- [ ] **Step 7: Commit**

Skip — no git repository (see Task 1 Step 3).

---

## Notes for whoever executes this

- **No git repository exists in this project** (`git status` → "fatal: not a git repository"). Every "Commit" step above is therefore a no-op — do not attempt `git init` or any git command unless the user explicitly asks for one first.
- **Task 4's migration requires manual application** — no automated path was found (no `psql`, no direct Postgres connection string, no SQL-exec RPC exposed via PostgREST). Do not attempt blind TCP connections to the production database to "find" a working port.
- **Task 6 (OpenRouter switch) is confirmed and scoped** — model is `anthropic/claude-haiku-4.5`, chosen by the user after seeing real pricing. Do not second-guess this back to Opus 5 or another model mid-implementation; if Step 4's live test reveals a real quality problem with the generated maps (not just an API-shape bug), stop and flag it rather than silently swapping models.
- **Do not attempt the production HTTPS/deployment fix** as part of this plan — flagged as a separate, real blocker (self-hosted Supabase is HTTP-only; no matching Vercel project found in the connected account) but explicitly out of scope per the approved design.
