import { z } from 'zod'
import { MODULES } from './questions.js'

/*
  The output contract.

  Everything the model returns is constrained to these shapes. The important
  design decision is in `arithmetic`: the map hands the visitor a *formula they
  can compute themselves*, never a computed figure. A model cannot know this
  business's job value or enquiry volume, so it must not produce a number — the
  one thing that would break the provenance argument the whole site rests on.

  `unknowns` applies the same honesty to our own output: a five-minute form has
  limits, and the map says what they are rather than projecting confidence.
*/

const MODULE_ENUM = z.enum(MODULES)

export const TraceStep = z.object({
  step: z.string().describe("One step in this business's enquiry journey, in their words. A short phrase."),
  seam: z
    .string()
    .nullable()
    .describe(
      'What breaks between this step and the next — retyping, waiting, forgetting. ' +
        'Eight words or fewer. Null when the handover is clean.',
    ),
})

/*
  Deliberately tight. The site promises a *one-page* map, the diagram (the
  trace) is the thing worth looking at, and every field here is billed as
  output at 5x the input rate — so brevity is simultaneously the honest
  format, the cheaper one, and the one that stays clear of the token ceiling.
  Prose that pads the page costs money and buys nothing.

  Tightened after the 2026-08 copy audit: the map was rendering at ~350 words
  and four phone screens, which is not a page. `summary` and `costliest.why`
  are one sentence each now, and the two open ranges became fixed counts —
  the prompt already said "two is a ceiling, not a target", so the schema now
  agrees with it instead of leaving the model room to pad.

  These limits are ALSO stated in prompt.ts and re-checked in handler.ts.
  Change one, change all three.
*/
export const LeakMap = z.object({
  headline: z
    .string()
    .describe('One sentence naming the structural problem, 20 words or fewer. No preamble.'),
  summary: z.string().describe('ONE sentence explaining what their marks add up to.'),
  trace: z
    .array(TraceStep)
    .min(3)
    .max(5)
    .describe(
      'The path an enquiry takes through their business today, seams marked. This is the ' +
        'diagram and the centre of the map — keep each step to a short phrase, not a sentence.',
    ),
  costliest: z.object({
    step: z.string().describe('The single step that most likely costs the most. A short phrase.'),
    why: z
      .string()
      .describe('ONE sentence. State it as reasoning, not fact.'),
  }),
  arithmetic: z
    .array(
      z.object({
        label: z.string().describe('What this calculation would tell them. A short phrase.'),
        formula: z
          .string()
          .describe('A formula they can compute from their own records. Never a computed value.'),
        note: z.string().describe('One short sentence: where to find the inputs.'),
      }),
    )
    .min(1)
    .max(2)
    .describe('One calculation — the sharpest one. The renderer shows the first.'),
  indicated: z
    .array(
      z.object({
        module: MODULE_ENUM,
        because: z.string().describe('One short sentence naming which of their marks this addresses.'),
      }),
    )
    .min(1)
    .max(3)
    .describe('Modules in the order they would pay back.'),
  /*
    Upper bounds here are deliberately looser than what the prompt asks for and
    what the renderer shows. `relaxArrayBounds` in generate.ts strips every
    maxItems before the request goes out — the gateway 400s on the key — so no
    ceiling is ever enforced provider-side. It is only enforced here, on the way
    back, where a violation discards the whole reply. By that point the visitor
    has handed over their name and email and we have paid for the generation.

    So: ask for the tight count in the prompt, accept one extra in the schema,
    and cut in the renderer. Never lose a lead over an extra line.
  */
  unknowns: z
    .array(z.string())
    .min(2)
    .max(3)
    .describe('Two things this map cannot know from a short form. One short line each, specific.'),
})
export type LeakMap = z.infer<typeof LeakMap>

export const LeadBrief = z.object({
  summary: z.string().describe('Two sentences for the EXPERIUS team before the call.'),
  likelySegment: z
    .string()
    .describe('Best guess at industry or business type, or "unclear" when it is.'),
  severity: z.enum(['mild', 'moderate', 'serious', 'critical']),
  signals: z
    .array(z.string())
    .max(3)
    .describe('Fit, urgency or budget signals in their answers. One short line each.'),
  redFlags: z
    .array(z.string())
    .max(3)
    .describe('Reasons this might not be a good engagement. One short line each.'),
  openingQuestion: z
    .string()
    .describe('The single best question to open the call with, given what they said.'),
})
export type LeadBrief = z.infer<typeof LeadBrief>

/** One call returns both — the brief is nearly free once the map is generated. */
export const ExaminationResult = z.object({ map: LeakMap, brief: LeadBrief })
export type ExaminationResult = z.infer<typeof ExaminationResult>

export const FollowUps = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().describe('Short slug, lowercase, no spaces.'),
        question: z.string().describe('One specific question. Answerable in a sentence.'),
        placeholder: z.string().describe('Example answer shown as input placeholder text.'),
      }),
    )
    .min(2)
    .max(3),
})
export type FollowUps = z.infer<typeof FollowUps>
