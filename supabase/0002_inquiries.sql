-- ═══════════════════════════════════════════════════════════════════════
-- Inquiries from the contact form.
--
-- Server-side writes only, same posture as `examinations`: RLS on with no
-- policies, so anon and authenticated can do nothing and the only access is the
-- service-role key held by the endpoint. A public insert path would let anyone
-- fill the inbox.
--
-- Holds PII by definition. Nothing here is ever published, aggregated or not.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  name        text not null,
  email       text not null,
  business    text,
  message     text not null,

  referrer    text,
  utm         text,
  ip_hash     text not null,

  -- Worked, not workflow: enough to see what still needs a reply without
  -- pretending this table is a CRM. The real pipeline lives in the booking kit.
  handled_at  timestamptz,

  constraint message_not_empty check (length(btrim(message)) >= 10),
  constraint email_shaped check (position('@' in email) > 1)
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_ip_window_idx on public.inquiries (ip_hash, created_at desc);
-- Partial index over the only query the admin view runs constantly.
create index if not exists inquiries_unhandled_idx on public.inquiries (created_at desc)
  where handled_at is null;

alter table public.inquiries enable row level security;

comment on table public.inquiries is
  'Contact-form submissions. Service-role writes only. Never published.';
