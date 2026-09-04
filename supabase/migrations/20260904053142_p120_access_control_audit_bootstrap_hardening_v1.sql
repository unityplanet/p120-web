-- P-120 PASS 1C / Audit completeness + one-time Founder bootstrap authority.
create or replace function public.p120_admin_grant_entitlement(
  p_user_id uuid default null,p_group_id uuid default null,p_resource_id uuid default null,p_effect text default 'ALLOW',p_access_level text default 'RUN',p_valid_from timestamptz default null,p_valid_until timestamptz default null,p_reason text default null
)
returns public.p120_entitlements language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_ent public.p120_entitlements%rowtype; v_old public.p120_entitlements%rowtype; v_revoked public.p120_entitlements%rowtype;
begin
  if not public.p120_is_founder() then raise exception 'founder_admin_required'; end if;
  if ((p_user_id is not null)::int+(p_group_id is not null)::int)<>1 then raise exception 'exactly_one_principal_required'; end if;
  if p_effect not in ('ALLOW','DENY') or p_access_level not in ('VIEW','RUN','MANAGE') then raise exception 'invalid_entitlement'; end if;
  if p_valid_until is not null and p_valid_from is not null and p_valid_until<=p_valid_from then raise exception 'invalid_validity_window'; end if;
  for v_old in
    select * from public.p120_entitlements
    where status='ACTIVE' and user_id is not distinct from p_user_id and group_id is not distinct from p_group_id
      and resource_id is not distinct from p_resource_id and access_level=p_access_level
    for update
  loop
    update public.p120_entitlements set status='REVOKED',revoked_at=now(),revoked_by=auth.uid()
      where entitlement_id=v_old.entitlement_id returning * into v_revoked;
    perform public.p120_write_audit('ENTITLEMENT_REPLACED','ENTITLEMENT',v_old.entitlement_id,to_jsonb(v_old),to_jsonb(v_revoked),p_reason);
  end loop;
  insert into public.p120_entitlements(user_id,group_id,resource_id,effect,access_level,status,valid_from,valid_until,granted_by,reason)
  values(p_user_id,p_group_id,p_resource_id,p_effect,p_access_level,'ACTIVE',p_valid_from,p_valid_until,auth.uid(),p_reason) returning * into v_ent;
  perform public.p120_write_audit('ENTITLEMENT_GRANTED','ENTITLEMENT',v_ent.entitlement_id,null,to_jsonb(v_ent),p_reason);
  return v_ent;
end;
$$;
revoke execute on function public.p120_admin_grant_entitlement(uuid,uuid,uuid,text,text,timestamptz,timestamptz,text) from anon;
grant execute on function public.p120_admin_grant_entitlement(uuid,uuid,uuid,text,text,timestamptz,timestamptz,text) to authenticated;

create or replace function public.p120_bootstrap_founder(p_user_id uuid,p_reason text default 'Initial Founder bootstrap')
returns public.p120_profiles language plpgsql security definer set search_path = pg_catalog, public, auth as $$
declare v_old public.p120_profiles%rowtype; v_new public.p120_profiles%rowtype;
begin
  if exists(select 1 from public.p120_profiles where role='FOUNDER_ADMIN' and status='ACTIVE') then raise exception 'active_founder_already_exists'; end if;
  select * into v_old from public.p120_profiles where user_id=p_user_id for update;
  if not found then raise exception 'profile_not_found'; end if;
  update public.p120_profiles set role='FOUNDER_ADMIN',status='ACTIVE' where user_id=p_user_id returning * into v_new;
  insert into public.p120_access_audit(actor_kind,actor_user_id,auth_session_id,action,entity_type,entity_id,previous_state,new_state,reason)
  values('SYSTEM',null,null,'FOUNDER_BOOTSTRAP','PROFILE',p_user_id,to_jsonb(v_old),to_jsonb(v_new),p_reason);
  return v_new;
end;
$$;
revoke all on function public.p120_bootstrap_founder(uuid,text) from public,anon,authenticated;
grant execute on function public.p120_bootstrap_founder(uuid,text) to service_role;
