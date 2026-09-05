-- P-120 FOUNDER ALPHA-01 PASS 1E.2
-- Exact Runtime Authority Reconciliation & Browser E2E Readiness closure.
-- Governance/operational closure only. No scientific, measurement, scoring or item-content changes.
do $$
declare
  v_resource public.p120_resources%rowtype;
  v_founder_count integer;
  v_run_entitlement_count integer;
  v_storage_size bigint;
begin
  select * into v_resource
  from public.p120_resources
  where resource_key='founder-alpha-core-v1'
  for update;

  if not found then raise exception 'fa01_resource_missing'; end if;
  if v_resource.release_state <> 'INTERNAL_ALPHA' or v_resource.run_type <> 'FOUNDER_ALPHA' then raise exception 'fa01_resource_authority_mismatch'; end if;
  if v_resource.is_launchable is distinct from true then raise exception 'fa01_resource_not_launchable'; end if;

  -- PASS 1E.2 runtime authority is the validated respondent-render correction build.
  if v_resource.runtime_build_sha <> '88a19227e18469793f578e75e5efad84e2a8bbd5' then raise exception 'fa01_runtime_authority_sha_mismatch'; end if;
  if v_resource.base_runtime_sha256 <> 'f9861b3fcda1213073fc1fea245ca913776e2e0dc75ca1dcf54515d3a1f963c2' then raise exception 'fa01_base_runtime_sha_mismatch'; end if;
  if v_resource.base_instrument_sha256 <> 'a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49' then raise exception 'fa01_base_instrument_sha_mismatch'; end if;
  if v_resource.content_sha256 <> 'baadd454bf6dad5078ebab23620685dca5278f95cda7ec3118ae2227626c4354' then raise exception 'fa01_package_file_sha_mismatch'; end if;
  if v_resource.metadata->>'extension_payload_sha256' <> '004ef39cd280b6fade611da15393763609d0a766c5e48a3f39216609651722b6' then raise exception 'fa01_extension_payload_sha_mismatch'; end if;

  if coalesce((v_resource.metadata->>'base_frozen_item_count')::int,0) <> 180 then raise exception 'fa01_base_item_count_mismatch'; end if;
  if coalesce((v_resource.metadata->>'extension_main_item_count')::int,0) <> 73 then raise exception 'fa01_extension_item_count_mismatch'; end if;
  if coalesce((v_resource.metadata->>'main_item_count')::int,0) <> 253 then raise exception 'fa01_main_item_count_mismatch'; end if;
  if v_resource.metadata->>'rpe_mode' <> 'DEFERRED' then raise exception 'fa01_rpe_mode_mismatch'; end if;
  if v_resource.metadata->>'life_main_temporal_mode' <> 'T3' then raise exception 'fa01_life_temporal_mode_mismatch'; end if;
  if coalesce((v_resource.metadata->>'candidate_scoring')::boolean,true) <> false then raise exception 'fa01_candidate_scoring_must_be_false'; end if;

  if v_resource.metadata->>'respondent_render_correction_qa' <> 'PASS' then raise exception 'fa01_respondent_render_qa_missing'; end if;
  if v_resource.metadata->>'respondent_render_correction_qa_method' <> 'EXACT_ADAPTER_SRCDOC_PLAYWRIGHT_DIAGNOSTIC' then raise exception 'fa01_browser_qa_method_mismatch'; end if;
  if v_resource.metadata->>'respondent_render_correction_qa_run' <> '33963862587' then raise exception 'fa01_browser_qa_run_mismatch'; end if;
  if v_resource.metadata->>'production_pages_deployment' <> 'PASS' then raise exception 'fa01_pages_deployment_not_pass'; end if;
  if v_resource.metadata->>'storage_post_upload_verification' <> 'PASS' then raise exception 'fa01_storage_verification_missing'; end if;
  if v_resource.metadata->>'scientific_measurement_delta' <> 'NONE' then raise exception 'fa01_scientific_measurement_delta_detected'; end if;

  if v_resource.storage_bucket <> 'p120-internal-resources' then raise exception 'fa01_storage_bucket_mismatch'; end if;
  if v_resource.storage_object_path <> 'founder-alpha/fa01-ru-01/p120-fa01-extension-package-v1.0.json' then raise exception 'fa01_storage_path_mismatch'; end if;
  select (metadata->>'size')::bigint into v_storage_size
  from storage.objects
  where bucket_id=v_resource.storage_bucket and name=v_resource.storage_object_path;
  if v_storage_size is distinct from 176174 then raise exception 'fa01_storage_object_size_mismatch'; end if;

  select count(*) into v_founder_count
  from public.p120_profiles
  where role='FOUNDER_ADMIN' and status='ACTIVE';
  if v_founder_count <> 1 then raise exception 'fa01_active_founder_count_mismatch'; end if;

  select count(*) into v_run_entitlement_count
  from public.p120_entitlements e
  join public.p120_profiles p on p.user_id=e.user_id
  where p.role='FOUNDER_ADMIN' and p.status='ACTIVE'
    and e.resource_id=v_resource.resource_id
    and e.effect='ALLOW' and e.access_level in ('RUN','MANAGE') and e.status='ACTIVE'
    and (e.valid_from is null or e.valid_from<=now())
    and (e.valid_until is null or e.valid_until>now());
  if v_run_entitlement_count < 1 then raise exception 'fa01_founder_run_entitlement_missing'; end if;

  update public.p120_resources
  set metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
        'pass1e2_status','PASS',
        'pass1e2_closed_at',to_jsonb(now()),
        'browser_e2e_readiness','PASS',
        'browser_e2e_qa_run','33963862587',
        'browser_e2e_render_item_count',253,
        'browser_e2e_render_module_count',9,
        'db_e2e_readiness','PASS',
        'db_e2e_method','ROLLBACK_ONLY_AUTH_ANON_AUTH_LIFECYCLE',
        'human_go','AUTHORIZED',
        'implementation_status','HUMAN_GO_AUTHORIZED',
        'next_gate','FA01-RU-01_FOUNDER_EXECUTION_EVIDENCE_CAPTURE',
        'pass1e2_runtime_authority_commit','88a19227e18469793f578e75e5efad84e2a8bbd5',
        'pass1e2_scientific_measurement_delta','NONE',
        'first_human_action','REAL_FOUNDER_RENDER_RETEST_AND_NEW_SESSION',
        'real_founder_render_retest_required',true
      )
  where resource_id=v_resource.resource_id
  returning * into v_resource;

  insert into public.p120_access_audit(
    actor_kind,actor_user_id,auth_session_id,action,entity_type,entity_id,previous_state,new_state,reason
  ) values(
    'SYSTEM',null,null,'RESOURCE_PASS1E2_CLOSED','RESOURCE',v_resource.resource_id,
    jsonb_build_object('pass1e2_status',null,'implementation_status','FOUNDER_E2E_IN_PROGRESS'),
    jsonb_build_object(
      'pass1e2_status','PASS',
      'browser_e2e_readiness','PASS',
      'db_e2e_readiness','PASS',
      'human_go','AUTHORIZED',
      'runtime_build_sha',v_resource.runtime_build_sha,
      'content_sha256',v_resource.content_sha256,
      'next_gate','FA01-RU-01_FOUNDER_EXECUTION_EVIDENCE_CAPTURE'
    ),
    'FOUNDER ALPHA-01 PASS 1E.2 closed after exact runtime authority reconciliation, Playwright respondent-render QA, protected package verification, Founder access/entitlement verification, and rollback-only persistence lifecycle E2E. First human action remains real Founder render retest in a new session.'
  );
end $$;
