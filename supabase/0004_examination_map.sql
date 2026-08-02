-- ═══════════════════════════════════════════════════════════════════════
-- Persists the two generated artefacts the pipeline was throwing away.
--
-- Until now the map was emailed to the visitor and the brief was emailed to
-- Majedul, and neither was stored — so the admin panel could show that a
-- lead existed but never what they were actually told. That makes the Leads
-- table unusable for its one job: walking into the call knowing what the
-- visitor already has in their inbox.
--
-- jsonb rather than text: both are validated against a Zod schema before
-- they reach here (lib/examination/schema.ts), so the shape is known and
-- worth keeping queryable — severity counts, most-indicated modules, and
-- which seams recur across leads are all aggregate questions we will want
-- to ask later without reparsing prose.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.examinations add column if not exists map jsonb;
alter table public.examinations add column if not exists brief jsonb;

comment on column public.examinations.map is
  'The leak map this visitor was shown and emailed. Shape: lib/examination/schema.ts LeakMap.';
comment on column public.examinations.brief is
  'Internal read on the lead — severity, signals, red flags, opening question. Shape: lib/examination/schema.ts LeadBrief. Never exposed to the visitor; admin-read only, same as the rest of this table.';

-- Leads are read newest-first and filtered to generated rows (see
-- useExaminations). Without this the admin list is a sequential scan that
-- gets slower with every submission.
create index if not exists examinations_generated_created_idx
  on public.examinations (created_at desc)
  where generated;
