-- P-120 WEB CR-FA01-001 / pin verified existing-runtime authority.
-- No protected package is activated; resource remains fail-closed and non-launchable.
update public.p120_resources
set
  runtime_build_sha = '563176ed7c31e98d8c150458499c8e157deff0be',
  base_runtime_sha256 = 'a102ebe769ac22a15b9de26a489eeaef395ede164514078b58c7a55c60502492',
  base_instrument_sha256 = 'a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49',
  metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
    'runtime_adapter','fa01-existing-runtime-adapter-v1',
    'runtime_authority_commit','563176ed7c31e98d8c150458499c8e157deff0be',
    'rpe_mode','DEFERRED',
    'life_main_temporal_mode','T3',
    'base_frozen_item_count',180,
    'extension_main_item_count',73,
    'main_item_count',253,
    'candidate_scoring',false,
    'authority_state','RUNTIME_PINNED_PACKAGE_UNBOUND'
  ),
  is_launchable = false
where resource_key='founder-alpha-core-v1'
  and run_type='FOUNDER_ALPHA'
  and release_state='INTERNAL_ALPHA';

do $$
begin
  if not exists(
    select 1 from public.p120_resources
    where resource_key='founder-alpha-core-v1'
      and runtime_build_sha='563176ed7c31e98d8c150458499c8e157deff0be'
      and base_runtime_sha256='a102ebe769ac22a15b9de26a489eeaef395ede164514078b58c7a55c60502492'
      and base_instrument_sha256='a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49'
      and is_launchable=false
      and storage_object_path is null
      and content_sha256 is null
  ) then raise exception 'founder_alpha_runtime_authority_pin_failed'; end if;
end $$;
