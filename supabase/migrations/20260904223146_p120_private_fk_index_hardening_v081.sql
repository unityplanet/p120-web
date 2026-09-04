-- P-120 Engine Data Standard v0.8.1 — additive FK index hardening.
-- No scientific, scoring, interpretation, privacy, RLS or release-authority behavior changes.

create index if not exists idx_p120_assessments_subject_ref
  on p120_private.assessments(subject_ref);

create index if not exists idx_p120_consent_records_subject_ref
  on p120_private.consent_records(subject_ref);

create index if not exists idx_p120_jobs_snapshot
  on p120_private.pipeline_jobs(snapshot_id);

create index if not exists idx_p120_render_artifacts_handoff
  on p120_private.render_artifacts(render_handoff_id);

create index if not exists idx_p120_release_report_package
  on p120_private.report_release_decisions(report_package_id);

create index if not exists idx_p120_snapshots_subject_ref
  on p120_private.response_snapshots(subject_ref);
