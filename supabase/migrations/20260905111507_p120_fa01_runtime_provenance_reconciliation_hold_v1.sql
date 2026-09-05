do $$
declare
  v_before public.p120_resources%rowtype;
  v_after public.p120_resources%rowtype;
begin
  select * into v_before
  from public.p120_resources
  where resource_key='founder-alpha-core-v1'
  for update;

  if not found then raise exception 'founder_alpha_resource_missing'; end if;
  if v_before.runtime_build_sha <> '563176ed7c31e98d8c150458499c8e157deff0be' then raise exception 'runtime_build_authority_drift'; end if;
  if v_before.base_runtime_sha256 <> 'a102ebe769ac22a15b9de26a489eeaef395ede164514078b58c7a55c60502492' then raise exception 'unexpected_pre_reconciliation_runtime_sha'; end if;
  if v_before.base_instrument_sha256 <> 'a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49' then raise exception 'base_instrument_authority_drift'; end if;
  if v_before.content_sha256 <> 'fe034b6ed71822977f4d777e12a00b6f887e0561f653276593e919534bde601c' then raise exception 'unexpected_pre_reconciliation_package_sha'; end if;

  update public.p120_resources
  set is_launchable=false,
      metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
        'authority_state','RUNTIME_PROVENANCE_RECONCILIATION_HOLD',
        'provenance_reconciliation_at',now(),
        'provenance_reconciliation_reason','canonical /system/ raw-byte drift after presentation-only PASS 2.1 changes; fail-closed rebind in progress'
      )
  where resource_id=v_before.resource_id
  returning * into v_after;

  insert into public.p120_access_audit(
    actor_kind, action, entity_type, entity_id, previous_state, new_state, reason
  ) values (
    'SYSTEM','RESOURCE_PROVENANCE_HOLD','RESOURCE',v_before.resource_id,
    jsonb_build_object('is_launchable',v_before.is_launchable,'base_runtime_sha256',v_before.base_runtime_sha256,'content_sha256',v_before.content_sha256,'authority_state',v_before.metadata->>'authority_state'),
    jsonb_build_object('is_launchable',v_after.is_launchable,'base_runtime_sha256',v_after.base_runtime_sha256,'content_sha256',v_after.content_sha256,'authority_state',v_after.metadata->>'authority_state'),
    'P120 Runtime Provenance Reconciliation: fail-closed hold before provenance-only package/resource rebind'
  );
end $$;
