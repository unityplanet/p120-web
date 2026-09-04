-- PASS 1E.1 exact build QA activation after private Storage byte verification and deployer scrub.
do $$
declare
  v_before public.p120_resources%rowtype;
  v_after public.p120_resources%rowtype;
  v_size bigint;
begin
  select * into v_before from public.p120_resources where resource_key='founder-alpha-core-v1' for update;
  if not found then raise exception 'founder_alpha_resource_missing'; end if;
  if v_before.release_state <> 'INTERNAL_ALPHA' or v_before.run_type <> 'FOUNDER_ALPHA' then raise exception 'founder_alpha_resource_authority_mismatch'; end if;
  if v_before.storage_bucket <> 'p120-internal-resources' then raise exception 'storage_bucket_mismatch'; end if;
  if v_before.storage_object_path <> 'founder-alpha/fa01-ru-01/p120-fa01-extension-package-v1.0.json' then raise exception 'storage_path_mismatch'; end if;
  if v_before.content_sha256 <> 'fe034b6ed71822977f4d777e12a00b6f887e0561f653276593e919534bde601c' then raise exception 'package_sha_mismatch'; end if;
  if v_before.runtime_build_sha <> '563176ed7c31e98d8c150458499c8e157deff0be' then raise exception 'runtime_build_mismatch'; end if;
  if v_before.base_runtime_sha256 <> 'a102ebe769ac22a15b9de26a489eeaef395ede164514078b58c7a55c60502492' then raise exception 'base_runtime_sha_mismatch'; end if;
  if v_before.base_instrument_sha256 <> 'a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49' then raise exception 'base_instrument_sha_mismatch'; end if;
  if v_before.metadata->>'extension_payload_sha256' <> '004ef39cd280b6fade611da15393763609d0a766c5e48a3f39216609651722b6' then raise exception 'payload_sha_mismatch'; end if;
  if coalesce((v_before.metadata->>'main_item_count')::int,0) <> 253 or coalesce((v_before.metadata->>'base_frozen_item_count')::int,0) <> 180 or coalesce((v_before.metadata->>'extension_main_item_count')::int,0) <> 73 then raise exception 'item_count_authority_mismatch'; end if;
  if v_before.metadata->>'rpe_mode' <> 'DEFERRED' or coalesce((v_before.metadata->>'candidate_scoring')::boolean,true) <> false or v_before.metadata->>'life_main_temporal_mode' <> 'T3' then raise exception 'alpha_mode_authority_mismatch'; end if;
  if v_before.metadata->>'storage_post_upload_verification' <> 'PASS' then raise exception 'storage_verification_missing'; end if;
  select (metadata->>'size')::bigint into v_size from storage.objects where bucket_id=v_before.storage_bucket and name=v_before.storage_object_path;
  if v_size is distinct from 176174 then raise exception 'storage_object_size_mismatch'; end if;
  if exists(select 1 from pg_extension where extname='http') then raise exception 'temporary_http_extension_not_scrubbed'; end if;

  update public.p120_resources
  set is_launchable=true,
      metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
        'exact_build_qa','PASS',
        'exact_build_qa_at',to_jsonb(now()),
        'implementation_status','FOUNDER_PROVISIONING_REQUIRED',
        'authority_state','EXACT_BUILD_QA_PASS_LAUNCH_ENABLED'
      )
  where resource_id=v_before.resource_id
  returning * into v_after;

  insert into public.p120_access_audit(actor_kind,actor_user_id,auth_session_id,action,entity_type,entity_id,previous_state,new_state,reason)
  values('SYSTEM',null,null,'RESOURCE_EXACT_BUILD_ACTIVATED','RESOURCE',v_after.resource_id,
    jsonb_build_object('is_launchable',v_before.is_launchable,'authority_state',v_before.metadata->>'authority_state'),
    jsonb_build_object('is_launchable',v_after.is_launchable,'authority_state',v_after.metadata->>'authority_state','runtime_build_sha',v_after.runtime_build_sha,'content_sha256',v_after.content_sha256,'payload_sha256',v_after.metadata->>'extension_payload_sha256'),
    'PASS 1E.1 exact build QA gate passed; Founder provisioning required before human run');
end $$;
