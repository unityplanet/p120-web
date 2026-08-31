/* P-120 Submission Intake configuration v1.0
   PUBLIC CLIENT CONFIG ONLY.
   Never place Supabase secret/service_role keys, database passwords, admin tokens,
   OpenAI keys, or any other privileged credential in this file.

   Activation requires only the Supabase Project URL + publishable key after the
   database migration in supabase/migrations/20260831_p120_submission_intake_v1.sql
   has been applied. Until then the manual JSON handoff remains the active fallback.
*/
window.P120_SUBMISSION_CONFIG = Object.freeze({
  version: '1.0',
  provider: 'supabase-rest',
  enabled: false,
  projectUrl: '',
  publishableKey: '',
  table: 'p120_submissions',
  requireCompleteCoverage: true,
  maxPayloadBytes: 262144,
  requestTimeoutMs: 15000
});
