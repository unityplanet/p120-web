-- P-120 Security Pass / Public submission abuse hardening v1
-- Applied to Supabase project p120-research on 2026-09-05.
-- No secrets. No measurement/scoring changes.

alter table public.p120_submissions
  add constraint p120_submissions_locale_allowed
    check (locale in ('ru','en')),
  add constraint p120_submissions_coverage_upper_bound
    check (coverage_total between 1 and 400),
  add constraint p120_submissions_payload_size_limit
    check (octet_length(payload::text) <= 524288),
  add constraint p120_submissions_payload_schema_match
    check ((payload ->> 'schema') = schema_version),
  add constraint p120_submissions_payload_coverage_object
    check (
      jsonb_typeof(payload -> 'coverage') = 'object'
      and (payload #>> '{coverage,answered}') ~ '^[0-9]+$'
      and (payload #>> '{coverage,total}') ~ '^[0-9]+$'
      and (payload #>> '{coverage,answered}')::integer = coverage_answered
      and (payload #>> '{coverage,total}')::integer = coverage_total
    ),
  add constraint p120_submissions_payload_responses_object
    check (jsonb_typeof(payload -> 'responses') = 'object'),
  add constraint p120_submissions_payload_response_records_array
    check (jsonb_typeof(payload -> 'response_records') = 'array');

comment on constraint p120_submissions_payload_size_limit on public.p120_submissions is
  'Server-side abuse guard. Browser client currently enforces a smaller limit; database rejects oversized direct REST inserts.';

comment on constraint p120_submissions_coverage_upper_bound on public.p120_submissions is
  'Bounded to support current and planned P-120 operational forms while limiting arbitrary public insert abuse.';
