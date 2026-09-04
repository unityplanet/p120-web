-- P-120 PASS 1C / Private internal resource delivery.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('p120-internal-resources','p120-internal-resources',false,5242880,array['application/json'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy p120_internal_resources_read
on storage.objects for select to authenticated
using (
  bucket_id='p120-internal-resources'
  and exists (
    select 1 from public.p120_resources r
    where r.storage_bucket=storage.objects.bucket_id
      and r.storage_object_path=storage.objects.name
      and r.is_launchable=true
      and r.release_state<>'DISABLED'
      and public.p120_can_access_resource(r.resource_id,'RUN')
  )
);
revoke insert,update,delete on storage.objects from authenticated;
