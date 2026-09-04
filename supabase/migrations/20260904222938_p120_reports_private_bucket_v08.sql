-- P-120 Engine Data Standard v0.8 — private report storage binding
-- Additive storage setup equivalent to supabase/scripts/setup_storage.ts.
insert into storage.buckets(id,name,public,allowed_mime_types)
values('p120-reports','p120-reports',false,array['application/pdf'])
on conflict(id) do update
set public=false,
    allowed_mime_types=excluded.allowed_mime_types;
