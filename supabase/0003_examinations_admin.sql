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
