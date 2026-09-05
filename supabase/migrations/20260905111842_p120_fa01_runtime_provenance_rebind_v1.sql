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
  if v_before.is_launchable then raise exception 'resource_must_be_on_hold'; end if;
  if v_before.runtime_build_sha <> '563176ed7c31e98d8c150458499c8e157deff0be' then raise exception 'runtime_build_authority_drift'; end if;
  if v_before.base_runtime_sha256 <> 'a102ebe769ac22a15b9de26a489eeaef395ede164514078b58c7a55c60502492' then raise exception 'unexpected_old_runtime_sha'; end if;
  if v_before.base_instrument_sha256 <> 'a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49' then raise exception 'base_instrument_authority_drift'; end if;
  if v_before.content_sha256 <> 'fe034b6ed71822977f4d777e12a00b6f887e0561f653276593e919534bde601c' then raise exception 'unexpected_old_package_sha'; end if;
  if v_before.metadata->>'extension_payload_sha256' <> '004ef39cd280b6fade611da15393763609d0a766c5e48a3f39216609651722b6' then raise exception 'extension_payload_authority_drift'; end if;

  update public.p120_resources
  set base_runtime_sha256='f9861b3fcda1213073fc1fea245ca913776e2e0dc75ca1dcf54515d3a1f963c2',
      content_sha256='ed63f00e94d00eeeec5af12463daf91a6f9018646f2458225d25a067dbd7a8dc',
      metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
        'authority_state','PROVENANCE_REBOUND_QA_PENDING',
        'package_file_sha256','ed63f00e94d00eeeec5af12463daf91a6f9018646f2458225d25a067dbd7a8dc',
        'package_bytes',176174,
        'storage_post_upload_verification','PASS',
        'storage_verified_at',now(),
        'runtime_provenance_reconciliation','PRESENTATION_ONLY_CANONICAL_SOURCE_DRIFT',
        'previous_base_runtime_sha256','a102ebe769ac22a15b9de26a489eeaef395ede164514078b58c7a55c60502492',
        'canonical_system_main_sha','2f6418c0aff4fe18ef472268a5dfdf4ccbaa2d31',
        'canonical_system_blob_sha','ad95e98eeb8b6ec228ed221d54fdc31d550caf6e',
        'canonical_system_runtime_sha256','f9861b3fcda1213073fc1fea245ca913776e2e0dc75ca1dcf54515d3a1f963c2',
        'canonical_instrument_sha256','a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49',
        'provenance_rebind_at',now()
      ),
      is_launchable=false
  where resource_id=v_before.resource_id
  returning * into v_after;

  insert into public.p120_access_audit(
    actor_kind, action, entity_type, entity_id, previous_state, new_state, reason
  ) values (
    'SYSTEM','RESOURCE_PROVENANCE_REBOUND','RESOURCE',v_before.resource_id,
    jsonb_build_object('is_launchable',v_before.is_launchable,'base_runtime_sha256',v_before.base_runtime_sha256,'base_instrument_sha256',v_before.base_instrument_sha256,'content_sha256',v_before.content_sha256,'authority_state',v_before.metadata->>'authority_state'),
    jsonb_build_object('is_launchable',v_after.is_launchable,'base_runtime_sha256',v_after.base_runtime_sha256,'base_instrument_sha256',v_after.base_instrument_sha256,'content_sha256',v_after.content_sha256,'authority_state',v_after.metadata->>'authority_state'),
    'P120 Runtime Provenance Reconciliation: presentation-only canonical /system/ drift rebound; scientific/measurement authority unchanged; QA required before launch'
  );
end $$;
