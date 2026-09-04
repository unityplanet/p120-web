-- P-120 PASS 1C / Baseline attestation.
-- Governance-only assertion of the pre-existing production intake contract.
do $$
declare
  v_rls boolean;
  v_policy_count integer;
  v_generated "char";
begin
  if to_regclass('public.p120_submissions') is null then
    raise exception 'P120 baseline attestation failed: public.p120_submissions missing';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='p120_submissions' and column_name='participant_id' and data_type='text') then
    raise exception 'P120 baseline attestation failed: participant_id contract mismatch';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='p120_submissions' and column_name='payload' and data_type='jsonb') then
    raise exception 'P120 baseline attestation failed: payload contract mismatch';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='p120_submissions' and column_name='payload_sha256' and data_type='text') then
    raise exception 'P120 baseline attestation failed: payload_sha256 contract mismatch';
  end if;
  select c.relrowsecurity into v_rls from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='p120_submissions';
  if coalesce(v_rls,false) is not true then raise exception 'P120 baseline attestation failed: RLS is not enabled'; end if;
  select count(*) into v_policy_count from pg_policies where schemaname='public' and tablename='p120_submissions' and policyname='p120_public_insert_only' and cmd='INSERT' and roles @> array['anon']::name[];
  if v_policy_count <> 1 then raise exception 'P120 baseline attestation failed: expected anon INSERT policy missing or duplicated'; end if;
  if not exists (select 1 from pg_indexes where schemaname='public' and tablename='p120_submissions' and indexname='p120_submissions_participant_payload_uidx') then
    raise exception 'P120 baseline attestation failed: participant/payload unique index missing';
  end if;
  select a.attgenerated into v_generated from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='p120_submissions' and a.attname='locale' and a.attnum>0 and not a.attisdropped;
  if coalesce(v_generated,'') <> 's' then raise exception 'P120 baseline attestation failed: locale generated column missing'; end if;
end $$;
