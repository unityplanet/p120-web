-- P-120 Submission Locale v1
-- Adds a queryable language field derived from the immutable raw payload.
-- Safe to apply before or after the client locale patch: historical rows without locale remain NULL.

alter table public.p120_submissions
  add column if not exists locale text
  generated always as (payload ->> 'locale') stored;

create index if not exists p120_submissions_locale_received_idx
  on public.p120_submissions (locale, received_at desc);

comment on column public.p120_submissions.locale is
  'Respondent-facing web locale derived from immutable payload: ru or en. NULL only for legacy submissions captured before locale instrumentation.';
