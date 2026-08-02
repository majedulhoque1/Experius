-- ═══════════════════════════════════════════════════════════════════════
-- The examination dataset.
--
-- This table is the strategic asset, not the feature: every completed
-- examination is a datapoint on what is actually broken in service businesses.
-- At volume it becomes publishable original research ("of N businesses
-- examined, X% say follow-ups depend on somebody remembering"), which is a
-- `measured` row for the provenance ledger that no competitor has.
--
-- Which is why the schema exists before the feature ships: answers not
-- persisted from day one are lost permanently.
--
-- Privacy posture: this table DOES hold PII. The map is gated behind a name and
-- email, so both are stored. The IP is stored only as a salted hash, and only so
-- that repeat submissions can be counted for rate limiting.
--
-- Free-text answers are the visitor's own words about their business. Treat the
-- whole row as confidential: publish aggregates only, never a row, and never a
-- quote that could identify a business. The views at the bottom exist so that
-- publishing means reading them rather than the table.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.examinations (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- Volunteered in exchange for the map. Null on follow-up-stage rows, which
  -- are recorded for cost accounting before identity is collected.
  name          text,
  email         text,

  -- Which of the eight statements they marked. Ids are stable and append-only
  -- (see lib/examination/questions.ts) so historical rows stay comparable.
  marked_ids    text[]      not null default '{}',
  marked_count  int         not null default 0,

  -- Generated follow-ups and their answers, when given. [{question, answer}]
  follow_ups    jsonb,

  indicated     text[]      not null default '{}',
  severity      text        not null,

  -- Attribution, for segmenting the research by where the visitor came from.
  referrer      text,
  utm           text,

  -- Rate limiting and the durable spend cap.
  ip_hash       text        not null,
  cost_usd      numeric(10,6) not null default 0,
  generated     boolean     not null default false,

  constraint marked_count_range check (marked_count between 0 and 8),
  constraint severity_known check (severity in ('mild','moderate','serious','critical'))
);

create index if not exists examinations_created_at_idx on public.examinations (created_at desc);
-- Composite: the rate-limit query filters on both columns together.
create index if not exists examinations_ip_window_idx on public.examinations (ip_hash, created_at desc);
-- Partial: only completed examinations have an email, and that is the lead list.
create index if not exists examinations_email_idx on public.examinations (email) where email is not null;

alter table public.examinations enable row level security;

-- No policies are defined, deliberately.
--
-- With RLS on and zero policies, anon and authenticated roles can do nothing at
-- all. The only access is via the service-role key, which is used exclusively
-- by the server-side endpoint. The browser never touches this table — unlike
-- the analytics pattern used elsewhere, there is no anon INSERT policy here,
-- because a public insert path would let anyone poison the research dataset.

comment on table public.examinations is
  'One row per examination submission. Server-side writes only (service role). '
  'The aggregate is intended for publication; individual rows are not.';

-- ── Aggregate view, for the published research ────────────────────────
-- Shaped so that publishing means reading this, never the raw rows.
create or replace view public.examination_stats as
select
  count(*)                                            as submissions,
  round(avg(marked_count)::numeric, 2)                as avg_marked,
  count(*) filter (where severity in ('serious','critical')) as serious_or_worse,
  min(created_at)                                     as first_at,
  max(created_at)                                     as last_at
from public.examinations
where generated = true;

-- Per-statement frequency: the actual research output.
create or replace view public.examination_question_frequency as
select
  q                                       as question_id,
  count(*)                                as marked_by,
  round(100.0 * count(*) / nullif((select count(*) from public.examinations where generated), 0), 1) as pct
from public.examinations, unnest(marked_ids) as q
where generated = true
group by q
order by marked_by desc;
