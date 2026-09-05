do $$
declare
  v_before public.p120_resources%rowtype;
  v_after public.p120_resources%rowtype;
  v_storage_size bigint;
  v_failed_session public.p120_assessment_sessions%rowtype;
begin
  select * into v_before
  from public.p120_resources
  where resource_key='founder-alpha-core-v1'
  for update;

  if not found then raise exception 'founder_alpha_resource_missing'; end if;
  if v_before.is_launchable then raise exception 'resource_expected_qa_hold'; end if;
  if v_before.runtime_build_sha <> '563176ed7c31e98d8c150458499c8e157deff0be' then raise exception 'runtime_build_authority_drift'; end if;
  if v_before.base_runtime_sha256 <> 'f9861b3fcda1213073fc1fea245ca913776e2e0dc75ca1dcf54515d3a1f963c2' then raise exception 'rebound_runtime_sha_mismatch'; end if;
  if v_before.base_instrument_sha256 <> 'a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49' then raise exception 'canonical_instrument_authority_drift'; end if;
  if v_before.content_sha256 <> 'ed63f00e94d00eeeec5af12463daf91a6f9018646f2458225d25a067dbd7a8dc' then raise exception 'rebound_package_sha_mismatch'; end if;
  if v_before.metadata->>'extension_payload_sha256' <> '004ef39cd280b6fade611da15393763609d0a766c5e48a3f39216609651722b6' then raise exception 'extension_payload_authority_drift'; end if;
  if v_before.metadata->>'canonical_system_main_sha' <> '2f6418c0aff4fe18ef472268a5dfdf4ccbaa2d31' then raise exception 'main_authority_metadata_mismatch'; end if;
  if v_before.metadata->>'canonical_system_blob_sha' <> 'ad95e98eeb8b6ec228ed221d54fdc31d550caf6e' then raise exception 'system_blob_authority_metadata_mismatch'; end if;
  if v_before.metadata->>'storage_post_upload_verification' <> 'PASS' then raise exception 'storage_readback_verification_missing'; end if;

  select (metadata->>'size')::bigint into v_storage_size
  from storage.objects
  where bucket_id=v_before.storage_bucket and name=v_before.storage_object_path;
  if coalesce(v_storage_size,0) <> 176174 then raise exception 'storage_object_size_mismatch'; end if;

  select * into v_failed_session
  from public.p120_assessment_sessions
  where session_id='e8ec9146-d52c-42ba-a896-7fffa8919bfb';
  if not found then raise exception 'controlled_failure_session_missing'; end if;
  if v_failed_session.status <> 'CREATED' or v_failed_session.started_at is not null or v_failed_session.submitted_at is not null or v_failed_session.submission_id is not null then raise exception 'controlled_failure_session_mutated'; end if;
  if v_failed_session.base_runtime_sha256 <> 'a102ebe769ac22a15b9de26a489eeaef395ede164514078b58c7a55c60502492' or v_failed_session.content_sha256 <> 'fe034b6ed71822977f4d777e12a00b6f887e0561f653276593e919534bde601c' then raise exception 'controlled_failure_snapshot_mutated'; end if;

  update public.p120_resources
  set is_launchable=true,
      metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
        'authority_state','RUNTIME_PROVENANCE_RECONCILED_LAUNCH_ENABLED',
        'runtime_provenance_reconciliation_qa','PASS',
        'runtime_provenance_reconciliation_qa_at',now(),
        'exact_build_qa','PASS',
        'provenance_only_rebind',true,
        'scientific_measurement_delta','NONE',
        'controlled_failure_session_preserved','e8ec9146-d52c-42ba-a896-7fffa8919bfb'
      )
  where resource_id=v_before.resource_id
  returning * into v_after;

  insert into public.p120_access_audit(
    actor_kind, action, entity_type, entity_id, previous_state, new_state, reason
  ) values (
    'SYSTEM','RESOURCE_PROVENANCE_QA_ACTIVATED','RESOURCE',v_before.resource_id,
    jsonb_build_object('is_launchable',v_before.is_launchable,'base_runtime_sha256',v_before.base_runtime_sha256,'base_instrument_sha256',v_before.base_instrument_sha256,'content_sha256',v_before.content_sha256,'authority_state',v_before.metadata->>'authority_state'),
    jsonb_build_object('is_launchable',v_after.is_launchable,'base_runtime_sha256',v_after.base_runtime_sha256,'base_instrument_sha256',v_after.base_instrument_sha256,'content_sha256',v_after.content_sha256,'authority_state',v_after.metadata->>'authority_state'),
    'P120 Runtime Provenance Reconciliation QA PASS: presentation-only rebind activated; prior failed session preserved; new Founder session required'
  );
end $$;
