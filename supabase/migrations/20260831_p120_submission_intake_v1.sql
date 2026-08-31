-- P-120 Submission Intake v1.0
-- Purpose: append-only pseudonymous storage for completed web response packages.
-- Sensitive-content rule: the public client may INSERT only. It may not SELECT, UPDATE or DELETE.

create extension if not exists pgcrypto;

create table if not exists public.p120_submissions (
  submission_id uuid primary key default gen_random_uuid(),
  participant_id text not null,
  schema_version text not null,
  form_version text,
  prototype_version text,
  status text not null default 'received',
  coverage_answered integer not null,
  coverage_total integer not null,
  payload_sha256 text not null,
  payload jsonb not null,
  client_completed_at timestamptz,
  received_at timestamptz not null default now(),

  constraint p120_submissions_participant_id_format
    check (participant_id ~ '^P120-[A-Z0-9]{6}$'),
  constraint p120_submissions_coverage_valid
    check (coverage_total > 0 and coverage_answered >= 0 and coverage_answered <= coverage_total),
  constraint p120_submissions_sha256_format
    check (payload_sha256 ~ '^[a-f0-9]{64}$'),
  constraint p120_submissions_payload_object
    check (jsonb_typeof(payload) = 'object'),
  constraint p120_submissions_payload_id_match
    check ((payload ->> 'participant_id') = participant_id),
  constraint p120_submissions_payload_pseudonymous
    check (coalesce((payload #>> '{privacy,pseudonymous_id_only}')::boolean, false) = true),
  constraint p120_submissions_no_added_direct_contact
    check (coalesce((payload #>> '{privacy,direct_name_email_phone_added_by_intake}')::boolean, false) = false),
  constraint p120_submissions_no_telemetry
    check (coalesce((payload #>> '{privacy,telemetry_included}')::boolean, true) = false)
);

create unique index if not exists p120_submissions_participant_payload_uidx
  on public.p120_submissions (participant_id, payload_sha256);

create index if not exists p120_submissions_participant_idx
  on public.p120_submissions (participant_id, received_at desc);

create index if not exists p120_submissions_received_idx
  on public.p120_submissions (received_at desc);

alter table public.p120_submissions enable row level security;

-- Least privilege for browser/public roles.
revoke all on table public.p120_submissions from anon, authenticated;
grant insert on table public.p120_submissions to anon;

-- Elevated server/admin access only. Supabase secret/service-role credentials must stay server-side.
grant select, insert, update, delete on table public.p120_submissions to service_role;

-- Recreate the single public policy deterministically.
drop policy if exists p120_public_insert_only on public.p120_submissions;
create policy p120_public_insert_only
  on public.p120_submissions
  for insert
  to anon
  with check (
    participant_id ~ '^P120-[A-Z0-9]{6}$'
    and schema_version = 'p120.web.raw-response-package.v1.0'
    and status = 'received'
    and coverage_total > 0
    and coverage_answered = coverage_total
    and (payload ->> 'participant_id') = participant_id
    and coalesce((payload #>> '{privacy,pseudonymous_id_only}')::boolean, false) = true
    and coalesce((payload #>> '{privacy,direct_name_email_phone_added_by_intake}')::boolean, false) = false
    and coalesce((payload #>> '{privacy,telemetry_included}')::boolean, true) = false
  );

comment on table public.p120_submissions is
  'P-120 controlled research intake. Append-only from public web client; no public read/update/delete policy.';
comment on column public.p120_submissions.payload is
  'Immutable raw web response package for downstream deterministic scoring. Missing fields must not be invented.';
