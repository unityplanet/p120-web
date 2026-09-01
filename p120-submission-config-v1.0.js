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

/* SANDBOX legal layer loader. Kept outside the generated main HTML so RU/EN
   assessment builds receive the same controlled legal runtime without touching
   measurement, scoring, or frozen item content. */
(() => {
  'use strict';
  if (document.querySelector('script[data-p120-legal-runtime]')) return;
  const marker='/p120-web/';
  const path=location.pathname;
  const i=path.indexOf(marker);
  const base=i>=0?path.slice(0,i)+marker:'/';
  const script=document.createElement('script');
  script.src=base+'p120-legal-runtime-v1.0.js?v=legal10';
  script.dataset.p120LegalRuntime='v1.0';
  document.head.appendChild(script);
})();
