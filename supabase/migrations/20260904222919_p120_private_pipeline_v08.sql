-- P-120 Engine Data Standard v0.8 — canonical private persistence + job orchestration
-- ADDITIVE. Run only after live inventory reconciliation reports safe_to_apply=true.
-- The p120_private schema is intentionally not required to be exposed through PostgREST/Data API.

create schema if not exists p120_private;
revoke all on schema p120_private from public, anon, authenticated;

create table if not exists p120_private.subjects (
 subject_ref text primary key check(subject_ref like 'SUBJ-%'), status text not null default 'ACTIVE', created_at timestamptz not null default now());
create table if not exists p120_private.assessments (
 assessment_id text primary key check(assessment_id like 'ASM-%'), subject_ref text not null references p120_private.subjects(subject_ref),
 state text not null, revision integer not null default 1 check(revision>=1), operational_form_version text not null default '1.3', export_schema_version text not null default '1.0',
 report_mode text not null, language text not null check(language in ('ru','en')), scope_context jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists p120_private.consent_records (
 consent_id text primary key check(consent_id like 'CNS-%'), subject_ref text not null references p120_private.subjects(subject_ref),
 consent_type text not null, policy_version text not null, decision text not null, recorded_at timestamptz not null default now());
create table if not exists p120_private.response_snapshots (
 snapshot_id text primary key check(snapshot_id like 'RSP-%'), assessment_id text not null references p120_private.assessments(assessment_id),
 subject_ref text not null references p120_private.subjects(subject_ref), revision integer not null, response_record jsonb not null,
 raw_payload_sha256 char(64) not null, content_sha256 char(64) not null unique, stripped_fields jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(), unique(assessment_id,revision));
create table if not exists p120_private.pipeline_jobs (
 job_id text primary key check(job_id like 'JOB-%'), assessment_id text not null references p120_private.assessments(assessment_id),
 snapshot_id text not null references p120_private.response_snapshots(snapshot_id), job_identity_sha256 char(64) not null unique,
 idempotency_key text not null unique, request_sha256 char(64) not null, state text not null check(state in ('QUEUED','RUNNING','RETRY_WAIT','COMPLETED','FAILED','DEAD_LETTER')),
 stage text not null, attempts integer not null default 0, next_attempt_at timestamptz null, lease_owner text null, lease_expires_at timestamptz null,
 last_error_code text null, last_error_detail text null, created_at timestamptz not null default now(), started_at timestamptz null, completed_at timestamptz null);

create table if not exists p120_private.measurement_results (
 result_id text primary key check(result_id like 'RES-%'), job_id text not null unique references p120_private.pipeline_jobs(job_id), assessment_id text not null,
 snapshot_id text not null, engine_version text not null, ruleset_sha256 char(64) not null, artifact_json jsonb not null, content_sha256 char(64) not null unique, created_at timestamptz not null default now());
create table if not exists p120_private.calculation_trace_sets (
 trace_set_id text primary key check(trace_set_id like 'CTS-%'), result_id text not null unique references p120_private.measurement_results(result_id),
 artifact_json jsonb not null, content_sha256 char(64) not null unique, created_at timestamptz not null default now());
create table if not exists p120_private.evidence_graphs (
 evidence_graph_id text primary key check(evidence_graph_id like 'EG-%'), result_id text not null unique references p120_private.measurement_results(result_id),
 artifact_json jsonb not null, content_sha256 char(64) not null unique, created_at timestamptz not null default now());
create table if not exists p120_private.claim_ledgers (
 claim_ledger_id text primary key check(claim_ledger_id like 'CL-%'), evidence_graph_id text not null unique references p120_private.evidence_graphs(evidence_graph_id),
 artifact_json jsonb not null, content_sha256 char(64) not null unique, created_at timestamptz not null default now());
create table if not exists p120_private.analytical_plans (
 analytical_plan_id text primary key check(analytical_plan_id like 'ANP-%'), claim_ledger_id text not null unique references p120_private.claim_ledgers(claim_ledger_id),
 report_mode text not null, artifact_json jsonb not null, content_sha256 char(64) not null unique, created_at timestamptz not null default now());
create table if not exists p120_private.report_plans (
 report_plan_id text primary key check(report_plan_id like 'RPL-%'), analytical_plan_id text not null unique references p120_private.analytical_plans(analytical_plan_id),
 language text not null check(language in ('ru','en')), artifact_json jsonb not null, content_sha256 char(64) not null unique, created_at timestamptz not null default now());

-- v0.7 report-release tables, canonicalized into the same private schema.
create table if not exists p120_private.report_packages (
 report_package_id text primary key check(report_package_id like 'RPK-%'), assessment_id text not null, subject_ref text not null, report_mode text not null,
 language text not null check(language in ('ru','en')), release_state text not null, report_package jsonb not null, content_sha256 char(64) not null unique,
 source_version_bundle jsonb not null, immutable boolean not null default true check(immutable=true), created_at timestamptz not null default now());
create table if not exists p120_private.semantic_alignment_runs (
 alignment_run_id text primary key check(alignment_run_id like 'SAR-%'), report_package_id text not null references p120_private.report_packages(report_package_id),
 layer text not null check(layer in ('human_language','literary')), provider text not null, model text not null, input_sha256 char(64) not null, output_sha256 char(64) not null,
 overall_verdict text not null check(overall_verdict in ('aligned','ambiguous','overreach','contradiction')), result_json jsonb not null, created_at timestamptz not null default now(),
 unique(report_package_id,layer,input_sha256,model));
create table if not exists p120_private.report_release_decisions (
 release_decision_id text primary key check(release_decision_id like 'RLD-%'), report_package_id text not null references p120_private.report_packages(report_package_id),
 decision_state text not null, publication_authorization text not null check(publication_authorization in ('FULL','EXPERT_ONLY','NO_PUBLICATION')),
 gate_snapshot jsonb not null, content_sha256 char(64) not null unique, immutable boolean not null default true check(immutable=true), created_at timestamptz not null default now());
create table if not exists p120_private.render_handoffs (
 render_handoff_id text primary key check(render_handoff_id like 'RHO-%'), release_decision_id text not null references p120_private.report_release_decisions(release_decision_id),
 renderer_profile_id text not null, channel text not null check(channel in ('web','pdf')), language text not null check(language in ('ru','en')), theme text not null,
 handoff_json jsonb not null, content_sha256 char(64) not null unique, created_at timestamptz not null default now());
create table if not exists p120_private.render_artifacts (
 artifact_id text primary key check(artifact_id like 'ART-%'), render_handoff_id text not null references p120_private.render_handoffs(render_handoff_id),
 storage_bucket text not null default 'p120-reports', storage_path text not null, mime_type text not null, byte_sha256 char(64) not null, byte_size bigint not null check(byte_size>=0),
 created_at timestamptz not null default now(), unique(storage_bucket,storage_path));
create table if not exists p120_private.client_access_tokens (
 token_id text primary key check(token_id like 'CAT-%'), assessment_id text not null references p120_private.assessments(assessment_id), token_sha256 char(64) not null unique,
 purpose text not null check(purpose in ('STATUS_REPORT','PDF_DOWNLOAD')), expires_at timestamptz null, revoked_at timestamptz null, created_at timestamptz not null default now());
create table if not exists p120_private.audit_events (
 event_id text primary key check(event_id like 'AUD-%'), occurred_at timestamptz not null default now(), actor_type text not null, actor_ref text not null,
 event_type text not null, object_type text not null, object_ref text not null, outcome text not null, metadata jsonb not null default '{}'::jsonb);

create index if not exists idx_p120_jobs_claim on p120_private.pipeline_jobs(state,next_attempt_at,created_at);
create index if not exists idx_p120_jobs_assessment on p120_private.pipeline_jobs(assessment_id,created_at desc);
create index if not exists idx_p120_tokens_assessment on p120_private.client_access_tokens(assessment_id,created_at desc);
create index if not exists idx_p120_render_release on p120_private.render_handoffs(release_decision_id,channel);

-- RLS defense in depth. Browser roles receive no table grants or policies.
do $$ declare r record; begin
 for r in select tablename from pg_tables where schemaname='p120_private' loop
   execute format('alter table p120_private.%I enable row level security',r.tablename);
 end loop;
end $$;
revoke all on all tables in schema p120_private from public,anon,authenticated;
revoke all on all sequences in schema p120_private from public,anon,authenticated;
alter default privileges in schema p120_private revoke all on tables from public,anon,authenticated;
alter default privileges in schema p120_private revoke all on sequences from public,anon,authenticated;
grant usage on schema p120_private to service_role;
grant select,insert on all tables in schema p120_private to service_role;
grant update on p120_private.pipeline_jobs to service_role;
grant update on p120_private.assessments to service_role;
grant update(revoked_at) on p120_private.client_access_tokens to service_role;

create or replace function p120_private.reject_immutable_mutation() returns trigger language plpgsql security invoker set search_path='' as $$
begin raise exception 'P120_IMMUTABLE_OBJECT'; end $$;

do $$ declare t text; begin
 foreach t in array array['response_snapshots','measurement_results','calculation_trace_sets','evidence_graphs','claim_ledgers','analytical_plans','report_plans','report_packages','semantic_alignment_runs','report_release_decisions','render_handoffs','render_artifacts','audit_events'] loop
   if not exists(select 1 from pg_trigger where tgname='p120_immutable_'||t) then
     execute format('create trigger %I before update or delete on p120_private.%I for each row execute function p120_private.reject_immutable_mutation()', 'p120_immutable_'||t,t);
   end if;
 end loop;
end $$;

-- Server-only ingress RPC. It does not accept raw direct identifiers: Edge sanitises before call.
create or replace function public.p120_rpc_create_job(
 p_subject_ref text,p_assessment_id text,p_snapshot_id text,p_job_id text,p_response_record jsonb,p_raw_payload_sha256 text,p_content_sha256 text,
 p_report_mode text,p_language text,p_scope_context jsonb,p_idempotency_key text,p_request_sha256 text,p_job_identity_sha256 text,
 p_access_token_id text,p_access_token_sha256 text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare existing record;
begin
 select * into existing from p120_private.pipeline_jobs where idempotency_key=p_idempotency_key;
 if found then
   if existing.request_sha256<>p_request_sha256 then raise exception 'P120_IDEMPOTENCY_CONFLICT'; end if;
   -- A retry receives a fresh opaque access token; persist its hash so the token returned by the Edge Function is valid.
   insert into p120_private.client_access_tokens(token_id,assessment_id,token_sha256,purpose,expires_at)
   values(p_access_token_id,existing.assessment_id,p_access_token_sha256,'STATUS_REPORT',now()+interval '30 days')
   on conflict(token_sha256) do nothing;
   return jsonb_build_object('job_id',existing.job_id,'assessment_id',existing.assessment_id,'state',existing.state,'reused',true);
 end if;
 insert into p120_private.subjects(subject_ref) values(p_subject_ref) on conflict(subject_ref) do nothing;
 insert into p120_private.assessments(assessment_id,subject_ref,state,revision,operational_form_version,export_schema_version,report_mode,language,scope_context)
 values(p_assessment_id,p_subject_ref,'SUBMITTED',1,'1.3','1.0',p_report_mode,p_language,coalesce(p_scope_context,'{}'::jsonb));
 insert into p120_private.response_snapshots(snapshot_id,assessment_id,subject_ref,revision,response_record,raw_payload_sha256,content_sha256,stripped_fields)
 values(p_snapshot_id,p_assessment_id,p_subject_ref,1,p_response_record,p_raw_payload_sha256,p_content_sha256,coalesce(p_response_record->'stripped_fields','[]'::jsonb));
 insert into p120_private.pipeline_jobs(job_id,assessment_id,snapshot_id,job_identity_sha256,idempotency_key,request_sha256,state,stage)
 values(p_job_id,p_assessment_id,p_snapshot_id,p_job_identity_sha256,p_idempotency_key,p_request_sha256,'QUEUED','INGRESS');
 insert into p120_private.client_access_tokens(token_id,assessment_id,token_sha256,purpose,expires_at)
 values(p_access_token_id,p_assessment_id,p_access_token_sha256,'STATUS_REPORT',now()+interval '30 days');
 insert into p120_private.audit_events(event_id,actor_type,actor_ref,event_type,object_type,object_ref,outcome,metadata)
 values('AUD-'||substr(md5(random()::text||clock_timestamp()::text),1,20),'SERVICE','EDGE:p120-submit','PIPELINE_JOB_CREATED','pipeline_job',p_job_id,'SUCCESS',jsonb_build_object('snapshot_sha256',p_content_sha256));
 return jsonb_build_object('job_id',p_job_id,'assessment_id',p_assessment_id,'state','QUEUED','reused',false);
end $$;

-- Opaque-token status RPC returns only job state + already release-controlled visible render handoff.
create or replace function public.p120_rpc_job_status(p_token_sha256 text) returns jsonb language plpgsql security definer set search_path='' as $$
declare aid text; j record; rh jsonb; art record;
begin
 select assessment_id into aid from p120_private.client_access_tokens where token_sha256=p_token_sha256 and revoked_at is null and (expires_at is null or expires_at>now()) order by created_at desc limit 1;
 if aid is null then raise exception 'P120_ACCESS_TOKEN_INVALID'; end if;
 select * into j from p120_private.pipeline_jobs where assessment_id=aid order by created_at desc limit 1;
 select h.handoff_json into rh from p120_private.render_handoffs h join p120_private.report_release_decisions d on d.release_decision_id=h.release_decision_id join p120_private.report_packages p on p.report_package_id=d.report_package_id where p.assessment_id=aid and h.channel='web' and d.publication_authorization in ('FULL','EXPERT_ONLY') order by h.created_at desc limit 1;
 select a.* into art from p120_private.render_artifacts a join p120_private.render_handoffs h on h.render_handoff_id=a.render_handoff_id join p120_private.report_release_decisions d on d.release_decision_id=h.release_decision_id join p120_private.report_packages p on p.report_package_id=d.report_package_id where p.assessment_id=aid and a.mime_type='application/pdf' order by a.created_at desc limit 1;
 return jsonb_build_object('assessment_id',aid,'job_id',j.job_id,'state',j.state,'stage',j.stage,'attempts',j.attempts,'error_code',j.last_error_code,'report',rh,'pdf_storage_bucket',art.storage_bucket,'pdf_storage_path',art.storage_path);
end $$;

revoke all on function public.p120_rpc_create_job(text,text,text,text,jsonb,text,text,text,text,jsonb,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.p120_rpc_job_status(text) from public,anon,authenticated;
grant execute on function public.p120_rpc_create_job(text,text,text,text,jsonb,text,text,text,text,jsonb,text,text,text,text,text) to service_role;
grant execute on function public.p120_rpc_job_status(text) to service_role;
