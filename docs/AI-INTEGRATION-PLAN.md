# EXPERIUS — AI integration plan

Where AI belongs on experius.xyz, where it does not, and in what order to build it.
Written 2026-08-01 against the v6 site (`design-samples/v6-experius`).

---

## The constraint that shapes every decision

This site's entire commercial argument is **provenance**: every figure carries how
it is known, the pending ones are printed anyway, and what we cannot show is
named rather than omitted. That is the differentiator — and it is exactly what a
carelessly-placed language model destroys.

So one rule governs everything below:

> **AI may operate on the visitor's own input, or on EXPERIUS's own verified
> data. It may never generate a claim about a client, a number, or an outcome.**

The model writes sentences. The database writes figures. Anywhere those two get
mixed, the site loses the only thing that makes it different from every other
agency site.

A useful test before building any feature: *if this output were wrong, would a
visitor be able to tell?* If not, don't ship it.

---

## Where AI does NOT belong here

Naming these first, because the pull toward them is strong and each one costs
more than it returns.

| Not this | Why |
|---|---|
| **A chatbot bubble** | The generic move, and the one thing this site sells is that *the customer's* business should have one — not that we decorate ours with it. It also invites exactly the invented-claim failure above. |
| **AI-generated case studies or testimonials** | Terminal. The whole site is an argument that our numbers are real. |
| **AI hero imagery** | The site's visual asset is **real screenshots of running systems**. Replacing evidence with illustration is a straight downgrade. |
| **Runtime translation** | Bangla rendering is unreliable enough to be a brand risk (we have already been burned on this). Translate at build time, review by a human, ship static. |
| **"AI-powered" as a badge** | Every competitor says it. Our claim is *systems that measure themselves* — a stronger and rarer position. |
| **A feature whose output nobody can check** | See the test above. |

---

## The opportunity map

Ranked by revenue impact × brand fit ÷ effort.

### Tier 1 — build these

**1. The examination becomes adaptive, and produces the Leak Map.**

Today the 8 questions are fixed and the verdict is a canned lookup. Two upgrades:

- **Adaptive follow-ups.** After the visitor marks their boxes, ask 2–3 targeted
  follow-ups generated from what they ticked — "You said follow-ups depend on
  somebody remembering. Roughly how many enquiries a week?" Free-text, optional.
- **Generate the actual deliverable.** The site promises *"a one-page map of
  where the work leaks."* Right now that promise is only redeemable by booking a
  call. Generate a real draft of it from their answers, show it on screen, email
  a copy.

This is the highest-value AI use on the site because **it is the offer**, made
instant and self-serve. It also stays inside the honesty rule perfectly: it
reasons over *their* input and invents nothing about us.

The obvious objection — *doesn't that give away the meeting?* — cuts the other
way. The site already says "you keep the map whether or not you build with us."
This makes that promise true immediately instead of after a scheduling
negotiation, and a visitor holding a map with their own leak named on it is a far
warmer lead than one who filled in a form.

**2. The lead brief — same submission, second output, internal only.**

The visitor gets the map. The team gets a brief: likely industry, indicated
modules, which seams are worst, budget signals, red flags, and *the one question
to open the call with*. Optionally enriched by fetching their existing site or
Facebook page and reading what is already there.

This directly serves the stated constraint that capacity is limited by design —
the scarce resource is which engagements to take, and this is decision support
for exactly that. It is also dogfooding: the site becomes a working demo of the
qualification automation we sell.

### Tier 2 — build after Tier 1 is earning

**3. Ask the evidence.** A question box over `data.js` and the 22-row ledger:
*"Have you done anything for charities?"* → answers strictly from the corpus,
citing the case file it came from, and says "not in the record" when it isn't.
Grounded retrieval with citations, not a chatbot — no persona, no small talk, and
it cannot answer outside the corpus.

**4. Industry-shaped copy.** The running example is a clinic. For a jeweller,
a developer, or a physio practice it should be theirs. Generate the variants
**at build time**, have a human approve each, then select at runtime by UTM or
self-identification. Zero runtime inference, zero hallucination surface, and the
lead-gen playbook already segments by vertical — so the UTMs exist.

### Tier 3 — compounding, lower urgency

**5. Bangla.** The site claims Bangla-speaking assistants as a differentiator and
is currently English-only. AI-drafted translation, human-reviewed, shipped
static.

**6. Case-study drafting from real data.** When a new figure is read from a
client database, the model drafts the prose around it — but the number comes from
the query, never the model. This is the provenance model applied to authoring.

**7. The care plan, pointed at our own site.** Weekly: read the site's analytics,
summarise where visitors drop, which sections get skipped, what to change. Then
*publish it*. An agency that publishes its own site's weekly diagnostics —
including what's broken — is making the "no naked builds" argument in public
rather than asserting it.

### The strategic prize, almost free

Every completed examination is a **datapoint about what is actually broken in
service businesses**. After a few hundred, this is publishable original research:

> *"Of 340 businesses examined, 71% say follow-ups depend on somebody
> remembering to send them."*

Measured, sourced, ours, and nobody else has it. It feeds straight into the
provenance ledger as a `measured` row, it is genuine link-bait, and it costs
nothing beyond storing the answers we are already collecting. **Design the
schema for this from day one** — it is far more valuable than any individual
feature above, and it is lost forever if the answers aren't persisted.

---

## Phased plan

### Phase 0 — plumbing (before any feature)

- Supabase table `examinations`: anonymous **insert-only**, no read policy for the
  public key. Same pattern as the Noree first-party analytics.
- Store: the 8 marks, follow-up answers, indicated modules, UTM/referrer,
  timestamp. **No PII unless the visitor gives an email**, and then only with an
  explicit line saying what it is used for.
- One serverless function on Vercel as the only path to the model. The API key
  never reaches the browser.
- A hard per-IP rate limit and a monthly spend cap in code. A public endpoint
  that calls a paid API is an unbounded liability without one.

### Phase 1 — the Leak Map (the money feature)

Adaptive follow-ups → generated map → on-screen + emailed. Ship it behind the
existing examination so the fallback is the current canned verdict if the model
call fails. **The examination must keep working with AI switched off** — it is
the site's conversion device and cannot depend on a third-party API being up.

### Phase 2 — the lead brief

Same submission, second generation, delivered to the team by email or Telegram.
Nothing visitor-facing, so the risk is near zero and it can be iterated freely.

### Phase 3 — ask the evidence, industry variants

### Phase 4 — Bangla, weekly self-audit, published aggregate research

---

## Architecture

```
Browser (examination, no API key)
   │  POST /api/examine
   ▼
Vercel function  ──▶  Anthropic API (claude-opus-5)
   │                   · system prompt = EXPERIUS method + module definitions
   │                     (stable → prompt-cached)
   │                   · user turn = this visitor's marks + follow-ups
   │                   · structured output → typed map object, not free prose
   ├──▶ Supabase: insert the submission (the research dataset)
   └──▶ Resend: email the map to the visitor, brief to the team

n8n on the Coolify VPS  ──▶  weekly aggregate + self-audit jobs
```

Three notes on the choices:

- **Anthropic SDK directly** (`@anthropic-ai/sdk`), not a router. This is a
  TypeScript project, the SDK is typed, and structured outputs
  (`output_config.format`) let us get a *typed map object* back rather than prose
  we have to parse — which is what keeps the output inside a shape we control.
- **`claude-opus-5`** as the default. The map is the product; this is not the
  place to economise. Cheaper tiers are costed below if you want them —
  that's your call, not a default I should make quietly.
- **n8n on the VPS for scheduled work**, not Vercel cron — the Hobby plan caps
  crons at once per day, which we have already hit on another project.

---

## What it costs

Reasoned from published per-token pricing and estimated prompt sizes — **not
measured**. Same standard as the rest of the site: this is an `inference` figure
and should be re-costed against real usage before anyone relies on it.

Assume ~2,000 input tokens (system + answers) and ~1,200 output tokens per map.

| Model | Per map | 100 maps/month |
|---|---|---|
| `claude-opus-5` ($5/$25 per Mtok) | ~$0.04 | **~$4** |
| `claude-sonnet-5` ($3/$15, intro $2/$10 to 31 Aug) | ~$0.02 | ~$2 |
| `claude-haiku-4-5` ($1/$5) | ~$0.008 | ~$1 |

The headline: **this is affordable even at the current cash position.** The
system prompt is stable, so prompt caching brings the input side down further on
repeat calls. The real risk is not unit cost — it is an unmetered public endpoint,
which Phase 0's rate limit and spend cap exist to prevent.

---

## Risks and open decisions

| Risk | Mitigation |
|---|---|
| A generated map says something wrong about their business | It reasons only over their own answers, hedges where they didn't answer, and is labelled a draft from a 5-minute form — not a diagnosis. A co-founder reviews before the call regardless. |
| Model outage kills the conversion device | The examination works fully without AI. The map is an enhancement layered on top, never a dependency. |
| Public endpoint gets hammered | Per-IP rate limit + monthly spend cap in code, both from day one. |
| Collecting answers without consent | Insert-only table, no PII unless volunteered, explicit line about what the email is used for. Publishing aggregates only. |
| AI drifts into inventing EXPERIUS claims | The system prompt never contains client outcomes to repeat. Case facts stay in `data.js` and are only ever *retrieved* with citation, never *generated*. |

**Decisions that are yours, not mine:**

1. Does the Leak Map go out free and instant, or is it gated behind an email?
   (Free and instant is more on-brand and I'd recommend it; gating collects more
   leads. Genuinely a business call.)
2. Model tier — Opus 5 as planned, or step down to save ~$2/month.
3. Whether to publish the aggregate examination research under EXPERIUS's name
   once volume supports it.
