-- PASS 1E.1 exact private Storage binding after post-upload byte identity verification.
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
  if v_before.release_state <> 'INTERNAL_ALPHA' or v_before.run_type <> 'FOUNDER_ALPHA' then raise exception 'founder_alpha_resource_authority_mismatch'; end if;

  update public.p120_resources
  set
    storage_bucket='p120-internal-resources',
    storage_object_path='founder-alpha/fa01-ru-01/p120-fa01-extension-package-v1.0.json',
    content_sha256='fe034b6ed71822977f4d777e12a00b6f887e0561f653276593e919534bde601c',
    metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
      'package_id','P120-FA01-RU-01-EXTENSION',
      'package_version','v1.0',
      'package_file_sha256','fe034b6ed71822977f4d777e12a00b6f887e0561f653276593e919534bde601c',
      'extension_payload_sha256','004ef39cd280b6fade611da15393763609d0a766c5e48a3f39216609651722b6',
      'package_bytes',176174,
      'locale','ru',
      'base_frozen_item_count',180,
      'extension_main_item_count',73,
      'main_item_count',253,
      'rpe_mode','DEFERRED',
      'candidate_scoring',false,
      'life_main_temporal_mode','T3',
      'storage_post_upload_verification','PASS',
      'storage_verified_at',to_jsonb(now()),
      'implementation_status','EXACT_BUILD_QA_REQUIRED',
      'authority_state','PACKAGE_BOUND_LAUNCH_DISABLED'
    ),
    is_launchable=false
  where resource_id=v_before.resource_id
  returning * into v_after;

  insert into public.p120_access_audit(actor_kind,actor_user_id,auth_session_id,action,entity_type,entity_id,previous_state,new_state,reason)
  values(
    'SYSTEM',null,null,'RESOURCE_PACKAGE_BOUND','RESOURCE',v_after.resource_id,
    jsonb_build_object('storage_bucket',v_before.storage_bucket,'storage_object_path',v_before.storage_object_path,'content_sha256',v_before.content_sha256,'is_launchable',v_before.is_launchable),
    jsonb_build_object('storage_bucket',v_after.storage_bucket,'storage_object_path',v_after.storage_object_path,'content_sha256',v_after.content_sha256,'package_file_sha256',v_after.metadata->>'package_file_sha256','extension_payload_sha256',v_after.metadata->>'extension_payload_sha256','is_launchable',v_after.is_launchable),
    'PASS 1E.1 exact private Storage package binding after byte re-read verification'
  );
end $$;
