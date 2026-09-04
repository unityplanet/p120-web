-- P-120 WEB CR-FA01-001 / Founder Alpha existing-runtime integration foundation.
-- Additive runtime/provenance/feedback metadata only. No measurement/scoring/raw-intake mutation.

alter table public.p120_resources
  add column if not exists runtime_build_sha text,
  add column if not exists base_runtime_sha256 text,
  add column if not exists base_instrument_sha256 text;

alter table public.p120_resources
  add constraint p120_resources_runtime_build_sha_format check (runtime_build_sha is null or runtime_build_sha ~ '^[a-f0-9]{40}$'),
  add constraint p120_resources_base_runtime_sha256_format check (base_runtime_sha256 is null or base_runtime_sha256 ~ '^[a-f0-9]{64}$'),
  add constraint p120_resources_base_instrument_sha256_format check (base_instrument_sha256 is null or base_instrument_sha256 ~ '^[a-f0-9]{64}$'),
  add constraint p120_founder_alpha_launch_authority check (
    run_type is distinct from 'FOUNDER_ALPHA' or is_launchable=false or (
      release_state='INTERNAL_ALPHA' and runtime_build_sha is not null and base_runtime_sha256 is not null and base_instrument_sha256 is not null
      and storage_bucket is not null and storage_object_path is not null and content_sha256 is not null
    )
  );

alter table public.p120_assessment_sessions
  add column if not exists runtime_build_sha text,
  add column if not exists base_runtime_sha256 text,
  add column if not exists base_instrument_sha256 text,
  add column if not exists source_manifest_sha256 text,
  add column if not exists source_manifest jsonb,
  add column if not exists alpha_mode_version text,
  add column if not exists parent_session_id uuid references public.p120_assessment_sessions(session_id) on delete restrict,
  add column if not exists event_reference_id uuid,
  add column if not exists temporal_mode text not null default 'MAIN';

alter table public.p120_assessment_sessions
  add constraint p120_assessment_runtime_build_sha_format check (runtime_build_sha is null or runtime_build_sha ~ '^[a-f0-9]{40}$'),
  add constraint p120_assessment_base_runtime_sha256_format check (base_runtime_sha256 is null or base_runtime_sha256 ~ '^[a-f0-9]{64}$'),
  add constraint p120_assessment_base_instrument_sha256_format check (base_instrument_sha256 is null or base_instrument_sha256 ~ '^[a-f0-9]{64}$'),
  add constraint p120_assessment_source_manifest_sha256_format check (source_manifest_sha256 is null or source_manifest_sha256 ~ '^[a-f0-9]{64}$'),
  add constraint p120_assessment_source_manifest_object check (source_manifest is null or jsonb_typeof(source_manifest)='object'),
  add constraint p120_assessment_temporal_mode check (temporal_mode in ('MAIN','T0','T1')),
  add constraint p120_assessment_life_link_shape check (
    (temporal_mode='MAIN' and parent_session_id is null and event_reference_id is null)
    or (temporal_mode in ('T0','T1') and parent_session_id is not null and event_reference_id is not null)
  );

create index if not exists p120_assessment_sessions_parent_idx on public.p120_assessment_sessions(parent_session_id,created_at desc) where parent_session_id is not null;

create table public.p120_alpha_response_meta (
  session_id uuid not null references public.p120_assessment_sessions(session_id) on delete restrict,
  item_id text not null check (length(item_id) between 1 and 128),
  module_id text not null check (length(module_id) between 1 and 128),
  response_state text not null check (response_state in ('ANSWERED','NOT_APPLICABLE','NO_EXPERIENCE','PREFER_NOT_ANSWER','UNKNOWN','SKIPPED','NOT_PRESENTED','TECHNICAL_MISSING')),
  scope_class text check (scope_class is null or (length(scope_class) between 1 and 64 and scope_class ~ '^[A-Za-z0-9_:-]+$')),
  temporal_mode text check (temporal_mode is null or temporal_mode in ('MAIN','T3','T0','T1')),
  eligibility_state text check (eligibility_state is null or eligibility_state in ('ELIGIBLE','INELIGIBLE','UNKNOWN','NOT_ASSESSED')),
  route_decision text check (route_decision is null or route_decision in ('PRESENTED','NOT_PRESENTED','DEFERRED','SKIPPED')),
  source_version text check (source_version is null or length(source_version)<=128),
  source_sha256 text check (source_sha256 is null or source_sha256 ~ '^[a-f0-9]{64}$'),
  presented_at timestamptz,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(session_id,item_id)
);
comment on table public.p120_alpha_response_meta is 'Founder Alpha response-state/provenance metadata only. Source-native response values are prohibited from this table.';
create index p120_alpha_response_meta_module_idx on public.p120_alpha_response_meta(session_id,module_id);
create trigger p120_alpha_response_meta_set_updated_at before update on public.p120_alpha_response_meta for each row execute function public.p120_set_updated_at();

create table public.p120_founder_feedback (
  feedback_id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.p120_assessment_sessions(session_id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  scope text not null check (scope in ('ITEM','MODULE','SESSION')),
  item_id text,
  module_id text,
  category text not null check (category in ('WORDING','USABILITY','SCIENTIFIC','EMOTIONAL','TECHNICAL','OTHER')),
  severity text not null check (severity in ('NOTE','LOW','MEDIUM','HIGH','BLOCKER')),
  note text not null check (length(note) between 1 and 4000),
  proposed_action text check (proposed_action is null or length(proposed_action)<=2000),
  created_at timestamptz not null default now(),
  check ((scope='ITEM' and item_id is not null) or scope<>'ITEM')
);
comment on table public.p120_founder_feedback is 'Founder reviewer annotations kept separate from measurement responses and raw submission payloads.';
create index p120_founder_feedback_session_idx on public.p120_founder_feedback(session_id,created_at desc);

alter table public.p120_alpha_response_meta enable row level security;
alter table public.p120_founder_feedback enable row level security;
revoke all on public.p120_alpha_response_meta,public.p120_founder_feedback from anon,authenticated;
grant select on public.p120_alpha_response_meta,public.p120_founder_feedback to authenticated;
create policy p120_alpha_response_meta_select on public.p120_alpha_response_meta for select to authenticated using (exists(select 1 from public.p120_assessment_sessions s where s.session_id=p120_alpha_response_meta.session_id and s.user_id=auth.uid()));
create policy p120_founder_feedback_select on public.p120_founder_feedback for select to authenticated using (user_id=auth.uid() and exists(select 1 from public.p120_assessment_sessions s where s.session_id=p120_founder_feedback.session_id and s.user_id=auth.uid()));

create or replace function public.p120_create_assessment_session(p_resource_id uuid,p_locale text,p_environment text default 'PRODUCTION',p_link_mode text default 'NEW',p_access_group_id uuid default null)
returns public.p120_assessment_sessions language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare v_resource public.p120_resources%rowtype;v_session public.p120_assessment_sessions%rowtype;
begin
  if auth.uid() is null or not public.p120_can_access_resource(p_resource_id,'RUN') then raise exception 'access_denied'; end if;
  if p_locale not in ('ru','en') or p_environment not in ('PRODUCTION','STAGING') or p_link_mode not in ('NEW','EXISTING_LOCAL') then raise exception 'invalid_session_parameters'; end if;
  select * into v_resource from public.p120_resources where resource_id=p_resource_id for share;
  if not found or not v_resource.is_launchable or v_resource.release_state='DISABLED' then raise exception 'resource_not_launchable'; end if;
  if v_resource.run_type not in ('FOUNDER_ALPHA','PILOT') then raise exception 'invalid_run_type'; end if;
  if v_resource.run_type='FOUNDER_ALPHA' and p_locale<>'ru' then raise exception 'founder_alpha_ru_only'; end if;
  if v_resource.run_type='FOUNDER_ALPHA' and (v_resource.runtime_build_sha is null or v_resource.base_runtime_sha256 is null or v_resource.base_instrument_sha256 is null or v_resource.storage_bucket is null or v_resource.storage_object_path is null or v_resource.content_sha256 is null) then raise exception 'founder_alpha_authority_incomplete'; end if;
  if p_access_group_id is not null and not public.p120_is_founder() and not exists(select 1 from public.p120_access_group_members gm join public.p120_access_groups g on g.group_id=gm.group_id where gm.group_id=p_access_group_id and gm.user_id=auth.uid() and gm.status='ACTIVE' and g.status='ACTIVE') then raise exception 'group_access_denied'; end if;
  insert into public.p120_assessment_sessions(user_id,resource_id,access_group_id,run_type,environment,locale,release_version,content_sha256,runtime_build_sha,base_runtime_sha256,base_instrument_sha256,alpha_mode_version,link_mode,status,temporal_mode)
  values(auth.uid(),p_resource_id,p_access_group_id,v_resource.run_type,p_environment,p_locale,v_resource.release_version,v_resource.content_sha256,v_resource.runtime_build_sha,v_resource.base_runtime_sha256,v_resource.base_instrument_sha256,case when v_resource.run_type='FOUNDER_ALPHA' then 'fa01-existing-runtime-adapter-v1' else null end,p_link_mode,'CREATED','MAIN') returning * into v_session;
  return v_session;
end;$$;

create or replace function public.p120_bind_runtime_provenance(p_session_id uuid,p_runtime_build_sha text,p_base_runtime_sha256 text,p_base_instrument_sha256 text,p_source_manifest_sha256 text,p_source_manifest jsonb,p_alpha_mode_version text)
returns public.p120_assessment_sessions language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare v_session public.p120_assessment_sessions%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if p_runtime_build_sha !~ '^[a-f0-9]{40}$' or p_base_runtime_sha256 !~ '^[a-f0-9]{64}$' or p_base_instrument_sha256 !~ '^[a-f0-9]{64}$' or p_source_manifest_sha256 !~ '^[a-f0-9]{64}$' then raise exception 'invalid_provenance_hash'; end if;
  if jsonb_typeof(p_source_manifest)<>'object' or octet_length(p_source_manifest::text)>65536 then raise exception 'invalid_source_manifest'; end if;
  if p_source_manifest ?| array['items','responses','response_values','feedback','candidate_wording'] then raise exception 'source_manifest_contains_protected_payload'; end if;
  if p_alpha_mode_version is null or length(p_alpha_mode_version)>96 then raise exception 'invalid_alpha_mode_version'; end if;
  select * into v_session from public.p120_assessment_sessions where session_id=p_session_id and user_id=auth.uid() for update;
  if not found then raise exception 'session_not_found'; end if;
  if v_session.run_type<>'FOUNDER_ALPHA' or v_session.locale<>'ru' then raise exception 'not_founder_alpha_ru_session'; end if;
  if v_session.status not in ('CREATED','IN_PROGRESS') then raise exception 'session_not_bindable'; end if;
  if v_session.runtime_build_sha is null or v_session.runtime_build_sha<>p_runtime_build_sha then raise exception 'runtime_build_sha_mismatch'; end if;
  if v_session.base_runtime_sha256 is null or v_session.base_runtime_sha256<>p_base_runtime_sha256 then raise exception 'base_runtime_sha256_mismatch'; end if;
  if v_session.base_instrument_sha256 is null or v_session.base_instrument_sha256<>p_base_instrument_sha256 then raise exception 'base_instrument_sha256_mismatch'; end if;
  if v_session.source_manifest_sha256 is not null and v_session.source_manifest_sha256<>p_source_manifest_sha256 then raise exception 'source_manifest_drift'; end if;
  update public.p120_assessment_sessions set source_manifest_sha256=p_source_manifest_sha256,source_manifest=p_source_manifest,alpha_mode_version=p_alpha_mode_version where session_id=p_session_id returning * into v_session;
  return v_session;
end;$$;

create or replace function public.p120_sync_alpha_response_meta(p_session_id uuid,p_records jsonb)
returns integer language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare v_session public.p120_assessment_sessions%rowtype;v_rec jsonb;v_count integer:=0;v_item text;v_module text;v_state text;v_scope text;v_temporal text;v_eligibility text;v_route text;v_source_version text;v_source_sha text;v_presented timestamptz;v_answered timestamptz;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if jsonb_typeof(p_records)<>'array' or jsonb_array_length(p_records)>400 then raise exception 'invalid_metadata_records'; end if;
  select * into v_session from public.p120_assessment_sessions where session_id=p_session_id and user_id=auth.uid() and run_type='FOUNDER_ALPHA' for share;
  if not found then raise exception 'session_not_found'; end if;
  if v_session.status not in ('CREATED','IN_PROGRESS','SUBMITTED') then raise exception 'session_metadata_closed'; end if;
  for v_rec in select value from jsonb_array_elements(p_records) loop
    if jsonb_typeof(v_rec)<>'object' then raise exception 'invalid_metadata_record'; end if;
    if v_rec ?| array['value','response_value','answer','selected_value','choice_value','raw_response','note'] then raise exception 'response_value_prohibited_in_metadata'; end if;
    v_item:=btrim(coalesce(v_rec->>'item_id',''));v_module:=btrim(coalesce(v_rec->>'module_id',''));v_state:=coalesce(v_rec->>'response_state','NOT_PRESENTED');v_scope:=nullif(v_rec->>'scope_class','');v_temporal:=nullif(v_rec->>'temporal_mode','');v_eligibility:=nullif(v_rec->>'eligibility_state','');v_route:=nullif(v_rec->>'route_decision','');v_source_version:=nullif(v_rec->>'source_version','');v_source_sha:=nullif(lower(v_rec->>'source_sha256'),'');
    if length(v_item) not between 1 and 128 or length(v_module) not between 1 and 128 then raise exception 'invalid_item_identity'; end if;
    if v_state not in ('ANSWERED','NOT_APPLICABLE','NO_EXPERIENCE','PREFER_NOT_ANSWER','UNKNOWN','SKIPPED','NOT_PRESENTED','TECHNICAL_MISSING') then raise exception 'invalid_response_state'; end if;
    if v_scope is not null and (length(v_scope)>64 or v_scope !~ '^[A-Za-z0-9_:-]+$') then raise exception 'invalid_scope_class'; end if;
    if v_temporal is not null and v_temporal not in ('MAIN','T3','T0','T1') then raise exception 'invalid_temporal_mode'; end if;
    if v_eligibility is not null and v_eligibility not in ('ELIGIBLE','INELIGIBLE','UNKNOWN','NOT_ASSESSED') then raise exception 'invalid_eligibility_state'; end if;
    if v_route is not null and v_route not in ('PRESENTED','NOT_PRESENTED','DEFERRED','SKIPPED') then raise exception 'invalid_route_decision'; end if;
    if v_source_sha is not null and v_source_sha !~ '^[a-f0-9]{64}$' then raise exception 'invalid_source_sha256'; end if;
    begin v_presented:=(v_rec->>'presented_at')::timestamptz;exception when others then v_presented:=null;end;
    begin v_answered:=(v_rec->>'answered_at')::timestamptz;exception when others then v_answered:=null;end;
    insert into public.p120_alpha_response_meta(session_id,item_id,module_id,response_state,scope_class,temporal_mode,eligibility_state,route_decision,source_version,source_sha256,presented_at,answered_at)
    values(p_session_id,v_item,v_module,v_state,v_scope,v_temporal,v_eligibility,v_route,left(v_source_version,128),v_source_sha,v_presented,v_answered)
    on conflict(session_id,item_id) do update set module_id=excluded.module_id,response_state=excluded.response_state,scope_class=excluded.scope_class,temporal_mode=excluded.temporal_mode,eligibility_state=excluded.eligibility_state,route_decision=excluded.route_decision,source_version=excluded.source_version,source_sha256=excluded.source_sha256,presented_at=coalesce(public.p120_alpha_response_meta.presented_at,excluded.presented_at),answered_at=excluded.answered_at;
    v_count:=v_count+1;
  end loop;return v_count;
end;$$;

create or replace function public.p120_save_founder_feedback(p_session_id uuid,p_scope text,p_item_id text,p_module_id text,p_category text,p_severity text,p_note text,p_proposed_action text default null)
returns public.p120_founder_feedback language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare v_feedback public.p120_founder_feedback%rowtype;
begin
  if not public.p120_is_founder() then raise exception 'founder_admin_required'; end if;
  if not exists(select 1 from public.p120_assessment_sessions where session_id=p_session_id and user_id=auth.uid() and run_type='FOUNDER_ALPHA') then raise exception 'session_not_found'; end if;
  if p_scope not in ('ITEM','MODULE','SESSION') then raise exception 'invalid_feedback_scope'; end if;
  if p_scope='ITEM' and nullif(btrim(p_item_id),'') is null then raise exception 'item_id_required'; end if;
  if p_category not in ('WORDING','USABILITY','SCIENTIFIC','EMOTIONAL','TECHNICAL','OTHER') then raise exception 'invalid_feedback_category'; end if;
  if p_severity not in ('NOTE','LOW','MEDIUM','HIGH','BLOCKER') then raise exception 'invalid_feedback_severity'; end if;
  if nullif(btrim(p_note),'') is null or length(p_note)>4000 or (p_proposed_action is not null and length(p_proposed_action)>2000) then raise exception 'invalid_feedback_text'; end if;
  insert into public.p120_founder_feedback(session_id,user_id,scope,item_id,module_id,category,severity,note,proposed_action) values(p_session_id,auth.uid(),p_scope,nullif(btrim(p_item_id),''),nullif(btrim(p_module_id),''),p_category,p_severity,btrim(p_note),nullif(btrim(p_proposed_action),'')) returning * into v_feedback;
  return v_feedback;
end;$$;

create or replace function public.p120_create_life_event_session(p_parent_session_id uuid,p_resource_id uuid,p_temporal_mode text,p_event_reference_id uuid)
returns public.p120_assessment_sessions language plpgsql security definer set search_path=pg_catalog,public,auth as $$
declare v_parent public.p120_assessment_sessions%rowtype;v_resource public.p120_resources%rowtype;v_session public.p120_assessment_sessions%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if p_temporal_mode not in ('T0','T1') or p_event_reference_id is null then raise exception 'invalid_life_event_parameters'; end if;
  select * into v_parent from public.p120_assessment_sessions where session_id=p_parent_session_id and user_id=auth.uid() and run_type='FOUNDER_ALPHA' and temporal_mode='MAIN' for share;if not found then raise exception 'parent_session_not_found';end if;
  if not public.p120_can_access_resource(p_resource_id,'RUN') then raise exception 'access_denied';end if;
  select * into v_resource from public.p120_resources where resource_id=p_resource_id for share;
  if not found or not v_resource.is_launchable or v_resource.release_state='DISABLED' or v_resource.run_type<>'FOUNDER_ALPHA' then raise exception 'resource_not_launchable';end if;
  if coalesce(v_resource.metadata->>'alpha_session_kind','')<>'LIFE_EVENT' then raise exception 'not_life_event_resource';end if;
  if v_resource.runtime_build_sha is null or v_resource.base_runtime_sha256 is null or v_resource.base_instrument_sha256 is null or v_resource.content_sha256 is null then raise exception 'founder_alpha_authority_incomplete';end if;
  insert into public.p120_assessment_sessions(user_id,resource_id,run_type,environment,locale,release_version,content_sha256,runtime_build_sha,base_runtime_sha256,base_instrument_sha256,alpha_mode_version,link_mode,status,parent_session_id,event_reference_id,temporal_mode)
  values(auth.uid(),p_resource_id,'FOUNDER_ALPHA',v_parent.environment,'ru',v_resource.release_version,v_resource.content_sha256,v_resource.runtime_build_sha,v_resource.base_runtime_sha256,v_resource.base_instrument_sha256,'fa01-existing-runtime-adapter-v1','NEW','CREATED',p_parent_session_id,p_event_reference_id,p_temporal_mode) returning * into v_session;
  return v_session;
end;$$;

revoke all on function public.p120_bind_runtime_provenance(uuid,text,text,text,text,jsonb,text) from public,anon;
revoke all on function public.p120_sync_alpha_response_meta(uuid,jsonb) from public,anon;
revoke all on function public.p120_save_founder_feedback(uuid,text,text,text,text,text,text,text) from public,anon;
revoke all on function public.p120_create_life_event_session(uuid,uuid,text,uuid) from public,anon;
grant execute on function public.p120_bind_runtime_provenance(uuid,text,text,text,text,jsonb,text) to authenticated;
grant execute on function public.p120_sync_alpha_response_meta(uuid,jsonb) to authenticated;
grant execute on function public.p120_save_founder_feedback(uuid,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.p120_create_life_event_session(uuid,uuid,text,uuid) to authenticated;
