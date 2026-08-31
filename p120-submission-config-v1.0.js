/* P-120 Submission Intake configuration v1.0
   PUBLIC CLIENT CONFIG ONLY.
   Never place Supabase secret/service_role keys, database passwords, admin tokens,
   OpenAI keys, or any other privileged credential in this file.

   Active production intake configuration for the P-120 GitHub Pages deployment.
   The publishable key is intentionally a public browser credential; database access
   is constrained by Row Level Security and the insert-only policy in the migration.
*/
window.P120_SUBMISSION_CONFIG = Object.freeze({
  version: '1.0',
  provider: 'supabase-rest',
  enabled: true,
  projectUrl: 'https://hvjgrpssjnnprazwhikn.supabase.co',
  publishableKey: 'sb_publishable_p0gxdEZ0FntF7hJwsVNxfg_NuCgu-lb',
  table: 'p120_submissions',
  requireCompleteCoverage: true,
  maxPayloadBytes: 262144,
  requestTimeoutMs: 15000
});
