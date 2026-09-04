-- P-120 PASS 1D / SECURITY & RUNTIME QA red-team hardening.
-- Corrects PUBLIC/MANAGE semantics, DISABLED metadata visibility, disabled cohort provenance,
-- and prevents protected Alpha/Pilot launchable runtimes from being moved to PUBLIC.

create or replace function public.p120_can_access_resource(p_resource_id uuid,p_required_level text default 'VIEW')
returns boolean language plpgsql stable security definer set search_path = pg_catalog, public, auth as $$
declare v_uid uuid:=auth.uid(); v_state text; v_required integer:=public.p120_access_rank(p_required_level); v_user_decision text; v_group_decision text;
begin
  if v_uid is null or v_required=0 or not public.p120_is_active_user(v_uid) then return false; end if;
  select release_state into v_state from public.p120_resources where resource_id=p_resource_id;
  if v_state is null then return false; end if;
  if v_state='DISABLED' then return public.p120_is_founder(v_uid) and v_required=1; end if;
  if public.p120_is_founder(v_uid) then return true; end if;
  if v_state='PUBLIC' then return v_required<=2; end if;

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
    select gm.group_id from public.p120_access_group_members gm
    join public.p120_access_groups g on g.group_id=gm.group_id
    where gm.user_id=v_uid and gm.status='ACTIVE' and g.status='ACTIVE'
  ), candidates as (
    select e.effect,case when e.resource_id is null then 1000000 else c.depth end specificity
    from public.p120_entitlements e join my_groups mg on mg.group_id=e.group_id left join chain c on c.resource_id=e.resource_id
    where e.status='ACTIVE' and (e.valid_from is null or e.valid_from<=now()) and (e.valid_until is null or e.valid_until>now())
      and public.p120_access_rank(e.access_level)>=v_required and (e.resource_id is null or c.resource_id is not null)
  ) select effect into v_group_decision from candidates order by specificity asc,case effect when 'DENY' then 0 else 1 end limit 1;
  return coalesce(v_group_decision='ALLOW',false);
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
  if p_access_group_id is not null and not public.p120_is_founder() then
    if not exists(
      select 1 from public.p120_access_group_members gm
      join public.p120_access_groups g on g.group_id=gm.group_id
      where gm.group_id=p_access_group_id and gm.user_id=auth.uid() and gm.status='ACTIVE' and g.status='ACTIVE'
    ) then raise exception 'group_access_denied'; end if;
  end if;
  insert into public.p120_assessment_sessions(user_id,resource_id,access_group_id,run_type,environment,locale,release_version,content_sha256,link_mode,status)
  values(auth.uid(),p_resource_id,p_access_group_id,v_resource.run_type,p_environment,p_locale,v_resource.release_version,v_resource.content_sha256,p_link_mode,'CREATED') returning * into v_session;
  return v_session;
end;
$$;

create or replace function public.p120_admin_set_resource_state(p_resource_id uuid,p_new_state text,p_reason text default null)
returns public.p120_resources language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_old public.p120_resources%rowtype; v_new public.p120_resources%rowtype;
begin
  if not public.p120_is_founder() then raise exception 'founder_admin_required'; end if;
  if p_new_state not in ('PUBLIC','INTERNAL_ALPHA','PILOT','DISABLED') then raise exception 'invalid_release_state'; end if;
  select * into v_old from public.p120_resources where resource_id=p_resource_id for update;
  if not found then raise exception 'resource_not_found'; end if;
  if p_new_state='PUBLIC' and v_old.is_launchable and coalesce(v_old.run_type,'') in ('FOUNDER_ALPHA','PILOT') then raise exception 'protected_runtime_cannot_be_public'; end if;
  update public.p120_resources set release_state=p_new_state where resource_id=p_resource_id returning * into v_new;
  perform public.p120_write_audit('RESOURCE_STATE_CHANGE','RESOURCE',p_resource_id,to_jsonb(v_old),to_jsonb(v_new),p_reason);
  return v_new;
end;
$$;

revoke execute on function public.p120_can_access_resource(uuid,text),public.p120_create_assessment_session(uuid,text,text,text,uuid),public.p120_admin_set_resource_state(uuid,text,text) from anon;
grant execute on function public.p120_can_access_resource(uuid,text),public.p120_create_assessment_session(uuid,text,text,text,uuid),public.p120_admin_set_resource_state(uuid,text,text) to authenticated;
