# P-120 Submission Intake v1.0

## Status

Frontend intake layer and append-only database schema are implemented in the production repository. The existing manual JSON handoff remains the fail-safe path.

The central store is intentionally **not activated with placeholder credentials**. Activation requires a dedicated Supabase project and its **Project URL + publishable key**. A Supabase secret/service-role key must never be committed to this public repository.

## Runtime flow

1. Participant completes the current P-120 web flow.
2. The browser keeps the existing `P120-XXXXXX` Participant ID.
3. `p120-submission-intake-v1.0.js` builds the pseudonymous raw response package.
4. The client validates complete scored-item coverage and computes a SHA-256 fingerprint for idempotency.
5. The browser performs an INSERT-only HTTPS request to `public.p120_submissions` through Supabase Data API.
6. On success, a local submission receipt is stored and the respondent sees confirmation that the Participant ID is enough to locate the submission.
7. If the network/database cannot confirm persistence, the existing JSON download/share handoff remains available.

No scoring happens in the browser intake layer. No Technical Keys are added to the public client.

## Database security model

Migration: `supabase/migrations/20260831_p120_submission_intake_v1.sql`

The migration creates `public.p120_submissions` with:

- UUID submission key;
- Participant ID;
- form/prototype/schema versions;
- coverage metadata;
- SHA-256 payload fingerprint;
- immutable raw JSON payload;
- client completion and server receipt timestamps.

Row Level Security is enabled. The public `anon` role receives **INSERT only**. It receives no SELECT, UPDATE or DELETE permission/policy. Elevated read access is reserved for server/admin credentials.

The table rejects payloads that do not match the P-120 Participant ID format or that claim to include telemetry/direct contact data through the intake layer.

## Activation

Create a dedicated Supabase project (EU region is preferable for the European research deployment), then run the migration in the Supabase SQL editor.

After the migration succeeds, edit only `p120-submission-config-v1.0.js`:

```js
window.P120_SUBMISSION_CONFIG = Object.freeze({
  version: '1.0',
  provider: 'supabase-rest',
  enabled: true,
  projectUrl: 'https://PROJECT_REF.supabase.co',
  publishableKey: 'sb_publishable_...',
  table: 'p120_submissions',
  requireCompleteCoverage: true,
  maxPayloadBytes: 262144,
  requestTimeoutMs: 15000
});
```

Only the publishable key belongs in browser code. Never use `sb_secret_...`, legacy `service_role`, database passwords, or admin tokens here.

If the site is deployed on Vercel/Netlify with the repository CSP enabled, `connect-src` must be tightened to the exact Supabase project origin after `PROJECT_REF` is known. GitHub Pages currently serves the static production site and does not use those hosting-provider header configs.

## Admin lookup

In the Supabase dashboard SQL editor, an authorized operator can locate the latest submission by Participant ID:

```sql
select
  submission_id,
  participant_id,
  schema_version,
  form_version,
  prototype_version,
  coverage_answered,
  coverage_total,
  payload_sha256,
  received_at,
  payload
from public.p120_submissions
where participant_id = 'P120-ABC123'
order by received_at desc;
```

The `payload` field is the raw package to pass into the controlled deterministic scoring workflow.

## Current capture boundary

The current live web flow captures the 180 scored items across SAT-24, P-72, P-72D, AO-12 and SOMA-24. The intake package explicitly records that the full non-scored QA/qualitative operational metadata is not yet present in the web capture. Downstream interpretation must not invent missing metadata.

## Next hardening gate

Before broad public recruitment, add the research privacy/retention policy, deletion workflow, operator access policy, audit logging, backup/restore checks, and a server-side authenticated admin lookup/API. Central storage is a transport layer only; it does not change the frozen scoring or interpretation authority chain.
