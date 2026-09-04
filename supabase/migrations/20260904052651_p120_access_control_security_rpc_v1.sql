-- P-120 PASS 1C / RLS + controlled RPC authority.
create or replace function public.p120_current_auth_session_id()
returns uuid language sql stable set search_path = pg_catalog, public as $$ select nullif(auth.jwt()->>'session_id','')::uuid $$;

create or replace function public.p120_is_active_user(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = pg_catalog, public, auth as $$
  select exists(select 1 from public.p120_profiles p where p.user_id=p_user_id and p.status='ACTIVE')
$$;

create or replace function public.p120_is_founder(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = pg_catalog, public, auth as $$
  select exists(select 1 from public.p120_profiles p where p.user_id=p_user_id and p.status='ACTIVE' and p.role='FOUNDER_ADMIN')
$$;

create or replace function public.p120_access_rank(p_level text)
returns integer language sql immutable set search_path = pg_catalog, public as $$
  select case p_level when 'VIEW' then 1 when 'RUN' then 2 when 'MANAGE' then 3 else 0 end
$$;

create or replace function public.p120_can_access_resource(p_resource_id uuid,p_required_level text default 'VIEW')
returns boolean language plpgsql stable security definer set search_path = pg_catalog, public, auth as $$
declare v_uid uuid:=auth.uid(); v_state text; v_required integer:=public.p120_access_rank(p_required_level); v_user_decision text; v_group_decision text;
begin
  if v_uid is null or v_required=0 or not public.p120_is_active_user(v_uid) then return false; end if;
  select release_state into v_state from public.p120_resources where resource_id=p_resource_id;
  if v_state is null then return false; end if;
  if v_state='DISABLED' and v_required>=2 then return false; end if;
  if public.p120_is_founder(v_uid) then return true; end if;
  if v_state='PUBLIC' then return true; end if;
  with recursive chain as (
    select r.resource_id,r.parent_resource_id,0 depth from public.p120_resources r where r.resource_id=p_resource_id
    union all select p.resource_id,p.parent_resource_id,c.depth+1 from public.p120_resources p join chain c on c.parent_resource_id=p.resource_id
  ), candidates as (
    select e.effect,case when e.resource_id is null then 1000000 else c.depth end specificity
    from public.p120_entitlements e left join chain c on c.resource_id=e.resource_id
    where e.user_id=v_uid and e.group_id is null and e.status='ACTIVE'
      and (e.valid_from is null or e.valid_from<=now()) and (e.valid_until is null or e.valid_until>now())
      and public.p120_access_rank(e.access_level)>=v_required and (e.resource_id is null or c.resource_id is not null)
  ) select effect into v_user_decision from candidates order by specificity asc,case effect when 'DENY' then 0 else 1 end limit 1;
  if v_user_decision is not null then return v_user_decision='ALLOW'; end if;
  with recursive chain as (
    select r.resource_id,r.parent_resource_id,0 depth from public.p120_resources r where r.resource_id=p_resource_id
    union all select p.resource_id,p.parent_resource_id,c.depth+1 from public.p120_resources p join chain c on c.parent_resource_id=p.resource_id
  ), my_groups as (
    select gm.group_id from public.p120_access_group_members gm join public.p120_access_groups g on g.group_id=gm.group_id where gm.user_id=v_uid and gm.status='ACTIVE' and g.status='ACTIVE'
  ), candidates as (
    select e.effect,case when e.resource_id is null then 1000000 else c.depth end specificity
    from public.p120_entitlements e join my_groups mg on mg.group_id=e.group_id left join chain c on c.resource_id=e.resource_id
    where e.status='ACTIVE' and (e.valid_from is null or e.valid_from<=now()) and (e.valid_until is null or e.valid_until>now())
      and public.p120_access_rank(e.access_level)>=v_required and (e.resource_id is null or c.resource_id is not null)
  ) select effect into v_group_decision from candidates order by specificity asc,case effect when 'DENY' then 0 else 1 end limit 1;
  return coalesce(v_group_decision='ALLOW',false);
end;
$$;

create or replace function public.p120_write_audit(p_action text,p_entity_type text,p_entity_id uuid,p_previous jsonb,p_new jsonb,p_reason text default null,p_actor_kind text default 'USER')
returns uuid language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_id uuid;
begin
  if p_actor_kind='USER' and auth.uid() is null then raise exception 'authentication_required'; end if;
  insert into public.p120_access_audit(actor_kind,actor_user_id,auth_session_id,action,entity_type,entity_id,previous_state,new_state,reason)
  values(p_actor_kind,case when p_actor_kind='USER' then auth.uid() else null end,case when p_actor_kind='USER' then public.p120_current_auth_session_id() else null end,p_action,p_entity_type,p_entity_id,p_previous,p_new,p_reason)
  returning audit_id into v_id; return v_id;
end;
$$;

create or replace function public.p120_create_assessment_session(p_resource_id uuid,p_locale text,p_environment text default 'PRODUCTION',p_link_mode text default 'NEW',p_access_group_id uuid default null)
returns public.p120_assessment_sessions language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_resource public.p120_resources%rowtype; v_session public.p120_assessment_sessions%rowtype;
begin
  if auth.uid() is null or not public.p120_can_access_resource(p_resource_id,'RUN') then raise exception 'access_denied'; end if;
  if p_locale not in ('ru','en') or p_environment not in ('PRODUCTION','STAGING') or p_link_mode not in ('NEW','EXISTING_LOCAL') then raise exception 'invalid_session_parameters'; end if;
  select * into v_resource from public.p120_resources where resource_id=p_resource_id for share;
  if not found or not v_resource.is_launchable or v_resource.release_state='DISABLED' then raise exception 'resource_not_launchable'; end if;
  if v_resource.run_type not in ('FOUNDER_ALPHA','PILOT') then raise exception 'invalid_run_type'; end if;
  if p_access_group_id is not null and not exists(select 1 from public.p120_access_group_members gm where gm.group_id=p_access_group_id and gm.user_id=auth.uid() and gm.status='ACTIVE') and not public.p120_is_founder() then raise exception 'group_access_denied'; end if;
  insert into public.p120_assessment_sessions(user_id,resource_id,access_group_id,run_type,environment,locale,release_version,content_sha256,link_mode,status)
  values(auth.uid(),p_resource_id,p_access_group_id,v_resource.run_type,p_environment,p_locale,v_resource.release_version,v_resource.content_sha256,p_link_mode,'CREATED') returning * into v_session;
  return v_session;
end;
$$;

create or replace function public.p120_attach_participant(p_session_id uuid,p_participant_id text)
returns public.p120_assessment_sessions language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_session public.p120_assessment_sessions%rowtype;
begin
  if p_participant_id !~ '^P120-[A-Z0-9]{6}$' then raise exception 'invalid_participant_id'; end if;
  select * into v_session from public.p120_assessment_sessions where session_id=p_session_id and user_id=auth.uid() for update;
  if not found then raise exception 'session_not_found'; end if;
  if v_session.status not in ('CREATED','IN_PROGRESS') then raise exception 'session_not_attachable'; end if;
  if v_session.participant_id is not null and v_session.participant_id<>p_participant_id then raise exception 'participant_already_bound'; end if;
  update public.p120_assessment_sessions set participant_id=p_participant_id,status='IN_PROGRESS',started_at=coalesce(started_at,now()) where session_id=p_session_id returning * into v_session;
  return v_session;
end;
$$;

create or replace function public.p120_bind_submission(p_session_id uuid,p_participant_id text,p_payload_sha256 text)
returns public.p120_assessment_sessions language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_session public.p120_assessment_sessions%rowtype; v_submission uuid;
begin
  if p_participant_id !~ '^P120-[A-Z0-9]{6}$' or p_payload_sha256 !~ '^[a-f0-9]{64}$' then raise exception 'invalid_binding_data'; end if;
  select * into v_session from public.p120_assessment_sessions where session_id=p_session_id and user_id=auth.uid() for update;
  if not found then raise exception 'session_not_found'; end if;
  if v_session.participant_id is null or v_session.participant_id<>p_participant_id then raise exception 'participant_mismatch'; end if;
  if v_session.status not in ('IN_PROGRESS','SUBMITTED') then raise exception 'session_not_bindable'; end if;
  select submission_id into v_submission from public.p120_submissions where participant_id=p_participant_id and payload_sha256=p_payload_sha256 order by received_at desc limit 1;
  if v_submission is null then raise exception 'submission_not_found'; end if;
  if exists(select 1 from public.p120_assessment_sessions where submission_id=v_submission and session_id<>p_session_id) then raise exception 'submission_already_bound'; end if;
  update public.p120_assessment_sessions set submission_id=v_submission,payload_sha256=p_payload_sha256,status='SUBMITTED',submitted_at=coalesce(submitted_at,now()) where session_id=p_session_id returning * into v_session;
  return v_session;
end;
$$;

create or replace function public.p120_admin_set_resource_state(p_resource_id uuid,p_new_state text,p_reason text default null)
returns public.p120_resources language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_old public.p120_resources%rowtype; v_new public.p120_resources%rowtype;
begin
  if not public.p120_is_founder() then raise exception 'founder_admin_required'; end if;
  if p_new_state not in ('PUBLIC','INTERNAL_ALPHA','PILOT','DISABLED') then raise exception 'invalid_release_state'; end if;
  select * into v_old from public.p120_resources where resource_id=p_resource_id for update; if not found then raise exception 'resource_not_found'; end if;
  update public.p120_resources set release_state=p_new_state where resource_id=p_resource_id returning * into v_new;
  perform public.p120_write_audit('RESOURCE_STATE_CHANGE','RESOURCE',p_resource_id,to_jsonb(v_old),to_jsonb(v_new),p_reason); return v_new;
end;
$$;

create or replace function public.p120_admin_set_profile_access(p_user_id uuid,p_role text,p_status text,p_reason text default null)
returns public.p120_profiles language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_old public.p120_profiles%rowtype; v_new public.p120_profiles%rowtype;
begin
  if not public.p120_is_founder() then raise exception 'founder_admin_required'; end if;
  if p_role not in ('FOUNDER_ADMIN','INTERNAL_USER') or p_status not in ('PENDING','ACTIVE','DISABLED') then raise exception 'invalid_profile_access'; end if;
  select * into v_old from public.p120_profiles where user_id=p_user_id for update; if not found then raise exception 'profile_not_found'; end if;
  if v_old.user_id=auth.uid() and (p_role<>'FOUNDER_ADMIN' or p_status<>'ACTIVE') then raise exception 'founder_self_lockout_prohibited'; end if;
  update public.p120_profiles set role=p_role,status=p_status where user_id=p_user_id returning * into v_new;
  perform public.p120_write_audit('PROFILE_ACCESS_CHANGE','PROFILE',p_user_id,to_jsonb(v_old),to_jsonb(v_new),p_reason); return v_new;
end;
$$;

create or replace function public.p120_admin_grant_entitlement(p_user_id uuid default null,p_group_id uuid default null,p_resource_id uuid default null,p_effect text default 'ALLOW',p_access_level text default 'RUN',p_valid_from timestamptz default null,p_valid_until timestamptz default null,p_reason text default null)
returns public.p120_entitlements language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_ent public.p120_entitlements%rowtype;
begin
  if not public.p120_is_founder() then raise exception 'founder_admin_required'; end if;
  if ((p_user_id is not null)::int+(p_group_id is not null)::int)<>1 then raise exception 'exactly_one_principal_required'; end if;
  if p_effect not in ('ALLOW','DENY') or p_access_level not in ('VIEW','RUN','MANAGE') then raise exception 'invalid_entitlement'; end if;
  if p_valid_until is not null and p_valid_from is not null and p_valid_until<=p_valid_from then raise exception 'invalid_validity_window'; end if;
  update public.p120_entitlements set status='REVOKED',revoked_at=now(),revoked_by=auth.uid() where status='ACTIVE' and user_id is not distinct from p_user_id and group_id is not distinct from p_group_id and resource_id is not distinct from p_resource_id and access_level=p_access_level;
  insert into public.p120_entitlements(user_id,group_id,resource_id,effect,access_level,status,valid_from,valid_until,granted_by,reason)
  values(p_user_id,p_group_id,p_resource_id,p_effect,p_access_level,'ACTIVE',p_valid_from,p_valid_until,auth.uid(),p_reason) returning * into v_ent;
  perform public.p120_write_audit('ENTITLEMENT_GRANTED','ENTITLEMENT',v_ent.entitlement_id,null,to_jsonb(v_ent),p_reason); return v_ent;
end;
$$;

create or replace function public.p120_admin_revoke_entitlement(p_entitlement_id uuid,p_reason text default null)
returns public.p120_entitlements language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_old public.p120_entitlements%rowtype; v_new public.p120_entitlements%rowtype;
begin
  if not public.p120_is_founder() then raise exception 'founder_admin_required'; end if;
  select * into v_old from public.p120_entitlements where entitlement_id=p_entitlement_id for update; if not found then raise exception 'entitlement_not_found'; end if;
  update public.p120_entitlements set status='REVOKED',revoked_at=coalesce(revoked_at,now()),revoked_by=coalesce(revoked_by,auth.uid()) where entitlement_id=p_entitlement_id returning * into v_new;
  perform public.p120_write_audit('ENTITLEMENT_REVOKED','ENTITLEMENT',p_entitlement_id,to_jsonb(v_old),to_jsonb(v_new),p_reason); return v_new;
end;
$$;

create or replace function public.p120_admin_set_group_membership(p_group_id uuid,p_user_id uuid,p_status text default 'ACTIVE',p_reason text default null)
returns public.p120_access_group_members language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_old jsonb; v_new public.p120_access_group_members%rowtype;
begin
  if not public.p120_is_founder() then raise exception 'founder_admin_required'; end if;
  if p_status not in ('ACTIVE','REVOKED') then raise exception 'invalid_membership_status'; end if;
  select to_jsonb(gm) into v_old from public.p120_access_group_members gm where gm.group_id=p_group_id and gm.user_id=p_user_id;
  insert into public.p120_access_group_members(group_id,user_id,status,revoked_at) values(p_group_id,p_user_id,p_status,case when p_status='REVOKED' then now() else null end)
  on conflict(group_id,user_id) do update set status=excluded.status,revoked_at=excluded.revoked_at returning * into v_new;
  perform public.p120_write_audit(case when p_status='ACTIVE' then 'GROUP_MEMBER_ADDED' else 'GROUP_MEMBER_REVOKED' end,'GROUP',p_group_id,v_old,to_jsonb(v_new),p_reason); return v_new;
end;
$$;

alter table public.p120_profiles enable row level security;
alter table public.p120_resources enable row level security;
alter table public.p120_access_groups enable row level security;
alter table public.p120_access_group_members enable row level security;
alter table public.p120_entitlements enable row level security;
alter table public.p120_assessment_sessions enable row level security;
alter table public.p120_access_audit enable row level security;

revoke all on public.p120_profiles,public.p120_resources,public.p120_access_groups,public.p120_access_group_members,public.p120_entitlements,public.p120_assessment_sessions,public.p120_access_audit from anon,authenticated;
grant select on public.p120_profiles,public.p120_resources,public.p120_access_groups,public.p120_access_group_members,public.p120_entitlements,public.p120_assessment_sessions,public.p120_access_audit to authenticated;

create policy p120_profiles_select on public.p120_profiles for select to authenticated using(user_id=auth.uid() or public.p120_is_founder());
create policy p120_resources_select on public.p120_resources for select to authenticated using(public.p120_is_founder() or release_state='PUBLIC' or public.p120_can_access_resource(resource_id,'VIEW'));
create policy p120_groups_select on public.p120_access_groups for select to authenticated using(public.p120_is_founder() or exists(select 1 from public.p120_access_group_members gm where gm.group_id=p120_access_groups.group_id and gm.user_id=auth.uid() and gm.status='ACTIVE'));
create policy p120_group_members_select on public.p120_access_group_members for select to authenticated using(public.p120_is_founder() or user_id=auth.uid());
create policy p120_entitlements_select on public.p120_entitlements for select to authenticated using(public.p120_is_founder() or user_id=auth.uid() or (group_id is not null and exists(select 1 from public.p120_access_group_members gm where gm.group_id=p120_entitlements.group_id and gm.user_id=auth.uid() and gm.status='ACTIVE')));
create policy p120_assessment_sessions_select on public.p120_assessment_sessions for select to authenticated using(user_id=auth.uid());
create policy p120_access_audit_select on public.p120_access_audit for select to authenticated using(public.p120_is_founder());

revoke all on function public.p120_current_auth_session_id() from public;
revoke all on function public.p120_is_active_user(uuid) from public;
revoke all on function public.p120_is_founder(uuid) from public;
revoke all on function public.p120_access_rank(text) from public;
revoke all on function public.p120_can_access_resource(uuid,text) from public;
revoke all on function public.p120_write_audit(text,text,uuid,jsonb,jsonb,text,text) from public;
revoke all on function public.p120_create_assessment_session(uuid,text,text,text,uuid) from public;
revoke all on function public.p120_attach_participant(uuid,text) from public;
revoke all on function public.p120_bind_submission(uuid,text,text) from public;
revoke all on function public.p120_admin_set_resource_state(uuid,text,text) from public;
revoke all on function public.p120_admin_set_profile_access(uuid,text,text,text) from public;
revoke all on function public.p120_admin_grant_entitlement(uuid,uuid,uuid,text,text,timestamptz,timestamptz,text) from public;
revoke all on function public.p120_admin_revoke_entitlement(uuid,text) from public;
revoke all on function public.p120_admin_set_group_membership(uuid,uuid,text,text) from public;

grant execute on function public.p120_is_active_user(uuid),public.p120_is_founder(uuid),public.p120_can_access_resource(uuid,text),public.p120_create_assessment_session(uuid,text,text,text,uuid),public.p120_attach_participant(uuid,text),public.p120_bind_submission(uuid,text,text),public.p120_admin_set_resource_state(uuid,text,text),public.p120_admin_set_profile_access(uuid,text,text,text),public.p120_admin_grant_entitlement(uuid,uuid,uuid,text,text,timestamptz,timestamptz,text),public.p120_admin_revoke_entitlement(uuid,text),public.p120_admin_set_group_membership(uuid,uuid,text,text) to authenticated;
