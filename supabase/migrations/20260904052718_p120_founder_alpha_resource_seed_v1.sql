-- P-120 PASS 1C / Founder Alpha placeholder resource.
-- Intentionally non-launchable until an exact protected package path + SHA-256 are bound.
with ins as (
  insert into public.p120_resources(resource_key,resource_type,title,release_state,release_version,run_type,runtime_key,is_launchable,metadata)
  values('founder-alpha-core-v1','PACKAGE','P-120 Founder Alpha — Core Package','INTERNAL_ALPHA','FA-P1','FOUNDER_ALPHA','founder-alpha-runtime-v1',false,jsonb_build_object('implementation_status','PACKAGE_BINDING_REQUIRED','source','PASS 1C'))
  on conflict(resource_key) do update set
    title=excluded.title,
    release_state=excluded.release_state,
    release_version=excluded.release_version,
    run_type=excluded.run_type,
    runtime_key=excluded.runtime_key,
    is_launchable=false,
    metadata=excluded.metadata,
    updated_at=now()
  returning *
)
insert into public.p120_access_audit(actor_kind,action,entity_type,entity_id,previous_state,new_state,reason)
select 'SYSTEM','RESOURCE_SEEDED','RESOURCE',resource_id,null,to_jsonb(ins),'Founder Alpha placeholder resource created non-launchable until protected package hash/path binding is completed.' from ins;
