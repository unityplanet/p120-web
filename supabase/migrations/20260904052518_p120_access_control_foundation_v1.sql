-- P-120 PASS 1C / Access-control foundation.
-- Adds identity metadata, resources, groups, entitlements, assessment sessions and audit.
-- Does not modify P-120 measurement/scoring/respondent-item authorities.

create table public.p120_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  login_email text,
  role text not null default 'INTERNAL_USER' check (role in ('FOUNDER_ADMIN','INTERNAL_USER')),
  status text not null default 'PENDING' check (status in ('PENDING','ACTIVE','DISABLED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.p120_profiles is 'P-120 application identity profile. Supabase Auth remains identity authority; role/status are server-controlled authorization metadata.';
create unique index p120_profiles_login_email_uidx on public.p120_profiles (lower(login_email)) where login_email is not null;

create table public.p120_resources (
  resource_id uuid primary key default gen_random_uuid(),
  resource_key text not null unique check (resource_key ~ '^[a-z0-9][a-z0-9._-]{2,127}$'),
  resource_type text not null check (resource_type in ('MODULE','RELEASE','PACKAGE','MODE')),
  parent_resource_id uuid references public.p120_resources(resource_id) on delete restrict,
  title text not null,
  release_state text not null check (release_state in ('PUBLIC','INTERNAL_ALPHA','PILOT','DISABLED')),
  release_version text,
  run_type text check (run_type is null or run_type in ('FOUNDER_ALPHA','PILOT','PUBLIC')),
  runtime_key text,
  storage_bucket text,
  storage_object_path text,
  content_sha256 text check (content_sha256 is null or content_sha256 ~ '^[a-f0-9]{64}$'),
  is_launchable boolean not null default false,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_resource_id is null or parent_resource_id <> resource_id),
  check ((storage_bucket is null and storage_object_path is null) or (storage_bucket is not null and storage_object_path is not null))
);
comment on table public.p120_resources is 'Data-driven P-120 resource registry. Static routes are not an authorization boundary.';
create index p120_resources_parent_idx on public.p120_resources(parent_resource_id);
create index p120_resources_state_idx on public.p120_resources(release_state, is_launchable);

create table public.p120_access_groups (
  group_id uuid primary key default gen_random_uuid(),
  group_key text not null unique check (group_key ~ '^[a-z0-9][a-z0-9._-]{2,127}$'),
  group_type text not null check (group_type in ('INTERNAL_GROUP','PILOT_COHORT')),
  title text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','DISABLED')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata)='object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.p120_access_group_members (
  group_id uuid not null references public.p120_access_groups(group_id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','REVOKED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (group_id, user_id)
);
create index p120_access_group_members_user_idx on public.p120_access_group_members(user_id, status);

create table public.p120_entitlements (
  entitlement_id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete restrict,
  group_id uuid references public.p120_access_groups(group_id) on delete restrict,
  resource_id uuid references public.p120_resources(resource_id) on delete restrict,
  effect text not null check (effect in ('ALLOW','DENY')),
  access_level text not null check (access_level in ('VIEW','RUN','MANAGE')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','REVOKED')),
  valid_from timestamptz,
  valid_until timestamptz,
  granted_by uuid references auth.users(id) on delete set null,
  revoked_by uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  check ((user_id is not null)::int + (group_id is not null)::int = 1),
  check (valid_until is null or valid_from is null or valid_until > valid_from)
);
comment on table public.p120_entitlements is 'P-120 user/group entitlements. NULL resource_id denotes global scope. Same-scope DENY takes precedence over ALLOW.';
create index p120_entitlements_user_idx on public.p120_entitlements(user_id, status);
create index p120_entitlements_group_idx on public.p120_entitlements(group_id, status);
create index p120_entitlements_resource_idx on public.p120_entitlements(resource_id, status);
create unique index p120_entitlements_active_scope_uidx on public.p120_entitlements (
  coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(resource_id, '00000000-0000-0000-0000-000000000000'::uuid),
  access_level
) where status='ACTIVE';

create table public.p120_assessment_sessions (
  session_id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete restrict,
  participant_id text check (participant_id is null or participant_id ~ '^P120-[A-Z0-9]{6}$'),
  resource_id uuid not null references public.p120_resources(resource_id) on delete restrict,
  access_group_id uuid references public.p120_access_groups(group_id) on delete restrict,
  run_type text not null check (run_type in ('FOUNDER_ALPHA','PILOT')),
  environment text not null default 'PRODUCTION' check (environment in ('PRODUCTION','STAGING')),
  locale text not null check (locale in ('ru','en')),
  release_version text,
  content_sha256 text check (content_sha256 is null or content_sha256 ~ '^[a-f0-9]{64}$'),
  link_mode text not null default 'NEW' check (link_mode in ('NEW','EXISTING_LOCAL')),
  status text not null default 'CREATED' check (status in ('CREATED','IN_PROGRESS','SUBMITTED','ABANDONED')),
  submission_id uuid references public.p120_submissions(submission_id) on delete restrict,
  payload_sha256 text check (payload_sha256 is null or payload_sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  check (status <> 'SUBMITTED' or (submission_id is not null and payload_sha256 is not null and participant_id is not null))
);
comment on table public.p120_assessment_sessions is 'P-120 application/research run metadata. Distinct from auth.sessions and contains no scoring or interpretation data.';
create unique index p120_assessment_sessions_participant_uidx on public.p120_assessment_sessions(participant_id) where participant_id is not null;
create unique index p120_assessment_sessions_submission_uidx on public.p120_assessment_sessions(submission_id) where submission_id is not null;
create index p120_assessment_sessions_user_idx on public.p120_assessment_sessions(user_id, created_at desc);
create index p120_assessment_sessions_resource_idx on public.p120_assessment_sessions(resource_id, created_at desc);

create table public.p120_access_audit (
  audit_id uuid primary key default gen_random_uuid(),
  actor_kind text not null check (actor_kind in ('USER','SYSTEM')),
  actor_user_id uuid references auth.users(id) on delete set null,
  auth_session_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  previous_state jsonb,
  new_state jsonb,
  reason text,
  occurred_at timestamptz not null default now(),
  check (previous_state is null or jsonb_typeof(previous_state)='object'),
  check (new_state is null or jsonb_typeof(new_state)='object')
);
comment on table public.p120_access_audit is 'Append-only P-120 access-control audit log. Browser clients cannot write directly.';
create index p120_access_audit_time_idx on public.p120_access_audit(occurred_at desc);
create index p120_access_audit_entity_idx on public.p120_access_audit(entity_type, entity_id, occurred_at desc);

create or replace function public.p120_set_updated_at()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin new.updated_at := now(); return new; end;
$$;
create trigger p120_profiles_set_updated_at before update on public.p120_profiles for each row execute function public.p120_set_updated_at();
create trigger p120_resources_set_updated_at before update on public.p120_resources for each row execute function public.p120_set_updated_at();
create trigger p120_access_groups_set_updated_at before update on public.p120_access_groups for each row execute function public.p120_set_updated_at();
create trigger p120_access_group_members_set_updated_at before update on public.p120_access_group_members for each row execute function public.p120_set_updated_at();
create trigger p120_assessment_sessions_set_updated_at before update on public.p120_assessment_sessions for each row execute function public.p120_set_updated_at();

create or replace function public.p120_handle_auth_user_profile()
returns trigger language plpgsql security definer set search_path = pg_catalog, public, auth as $$
begin
  insert into public.p120_profiles(user_id, login_email, role, status)
  values (new.id, new.email, 'INTERNAL_USER', 'PENDING')
  on conflict (user_id) do update set login_email=excluded.login_email;
  return new;
end;
$$;
create trigger p120_auth_user_profile_insert after insert on auth.users for each row execute function public.p120_handle_auth_user_profile();
create trigger p120_auth_user_profile_email_sync after update of email on auth.users for each row when (old.email is distinct from new.email) execute function public.p120_handle_auth_user_profile();

revoke all on function public.p120_handle_auth_user_profile() from public;
revoke all on function public.p120_set_updated_at() from public;
