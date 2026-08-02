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
  the parsed JSON is still validated against the same Zod schema before it is
  returned, so a malformed generation fails here rather than halfway down a
  template.

  `cache_control` on the system message is OpenRouter's pass-through of
  Anthropic's explicit prompt-caching syntax — not part of the OpenAI wire
  format, hence the type assertions below. At this prompt's current length it
  sits under Claude Haiku 4.5's 4,096-token minimum cacheable prompt, so it
  has no effect yet; kept for when the prompt grows past that, or the model
  changes to one with a lower minimum.
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

/**
 * Anthropic's structured-output schema subset (enforced identically whether
 * OpenRouter routes to Anthropic direct, Bedrock, or Azure — confirmed by
 * triggering the same rejection from all three) rejects `minItems`/`maxItems`
 * on array types unless the value is 0 or 1: "For 'array' type, 'minItems'
 * values other than 0 or 1 are not supported". Every array field in
 * `schema.ts` uses `.min()/.max()` for exactly this kind of bound (2-3
 * follow-ups, 3-6 trace steps, etc.), so the schema sent in the request has
 * to drop those bounds. The bounds themselves aren't lost — `schema.parse()`
 * still enforces the full Zod schema against the parsed response afterward,
 * so a reply that ignores the prompt's stated count still fails here rather
 * than shipping malformed.
 */
function relaxArrayBounds(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(relaxArrayBounds)
  if (node === null || typeof node !== 'object') return node
  const obj = node as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if ((key === 'minItems' || key === 'maxItems') && typeof value === 'number' && value > 1) continue
    out[key] = relaxArrayBounds(value)
  }
  return out
}

async function generate<T>(
  userPrompt: string,
  schemaName: string,
  schema: z.ZodType<T>,
  maxTokens: number,
  effort?: 'low' | 'medium' | 'high',
): Promise<{ data: T; usage: Usage }> {
  const systemPart: CacheableTextPart = {
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' },
  }
  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system' as const, content: [systemPart] },
      { role: 'user' as const, content: userPrompt },
    ],
    response_format: {
      type: 'json_schema' as const,
      json_schema: { name: schemaName, strict: true, schema: relaxArrayBounds(z.toJSONSchema(schema)) },
    },
    ...(effort ? { reasoning: { effort } } : {}),
  }
  // OpenRouter-specific fields (`cache_control`, `reasoning`) aren't part of
  // the upstream OpenAI type surface — the cast below is that gap, not a
  // shortcut around request validation.
  const res = await client().chat.completions.create(
    body as unknown as OpenAI.ChatCompletionCreateParamsNonStreaming,
  )
  // OpenRouter substitutes an error envelope for `choices` entirely on upstream
  // failures — provider outage, moderation, insufficient credit — so indexing
  // into it unguarded turns a legible gateway message into a bare TypeError.
  const content = res.choices?.[0]?.message?.content
  if (!content) {
    const gateway = (res as unknown as { error?: { message?: string; code?: number } }).error
    if (gateway?.message) {
      throw new Error(
        `${schemaName} generation refused by gateway: ${gateway.message}` +
          (gateway.code ? ` (${gateway.code})` : ''),
      )
    }
    /*
      Empty content with finish_reason 'length' means it ran out of budget
      mid-JSON — the structured-output path returns nothing rather than partial
      JSON, so without naming the reason here this surfaces as a mystery. Report
      the budget alongside it: the fix is almost always maxTokens, not the prompt.
    */
    const finish = res.choices?.[0]?.finish_reason
    const used = res.usage?.completion_tokens
    throw new Error(
      `${schemaName} generation returned no content ` +
        `(finish_reason=${finish ?? 'unknown'}, completion_tokens=${used ?? '?'}, maxTokens=${maxTokens})`,
    )
  }
  const data = schema.parse(JSON.parse(content))
  const u = res.usage
  const usage: Usage = {
    input: u?.prompt_tokens ?? 0,
    output: u?.completion_tokens ?? 0,
    cacheRead: (u?.prompt_tokens_details as { cached_tokens?: number } | undefined)?.cached_tokens ?? 0,
  }
  return { data, usage }
}

/** Two or three questions tailored to what they marked. */
export function generateFollowUps(
  markedIds: string[],
  otherPain?: string,
): Promise<{ data: FollowUps; usage: Usage }> {
  return generate(buildFollowUpPrompt(markedIds, otherPain), 'follow_ups', FollowUps, 2000)
}

/**
 * The map and the internal brief, in one call — the brief costs almost nothing
 * once the model has already worked through their answers.
 *
 * No `reasoning` effort, and 4k rather than 8k. Measured on the previous
 * settings: 5,138 output tokens per map, of which 2,160 were reasoning the
 * visitor never sees, for 7,840 total against an 8,000 ceiling — 98% of budget,
 * which is why long generations were coming back with empty content. Output
 * bills at 5x input, so those invisible tokens were ~40% of the cost of every
 * map. The task is fully specified by the schema and the length rules in the
 * prompt; it does not need to think out loud to fill it in.
 */
export function generateMap(
  input: ExaminationInput,
): Promise<{ data: ExaminationResult; usage: Usage }> {
  return generate(buildMapPrompt(input), 'examination_result', ExaminationResult, 4000)
}

/** Published per-MTok rates for MODEL (OpenRouter, anthropic/claude-haiku-4.5), for the spend cap. Update on model change. */
const RATE = { input: 1 / 1_000_000, output: 5 / 1_000_000, cacheRead: 0.1 / 1_000_000 }

export function costOf(u: Usage): number {
  return u.input * RATE.input + u.output * RATE.output + u.cacheRead * RATE.cacheRead
}
