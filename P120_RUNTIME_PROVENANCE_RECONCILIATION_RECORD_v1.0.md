# P-120 WEB — Runtime Provenance Reconciliation Record

**Document code:** P120-WEB-FA01-RPR-001  
**Version:** 1.0  
**Date:** 2026-09-05  
**Status:** CONTROLLED / RECONCILED / REAL FOUNDER E2E RETEST REQUIRED  
**Authority:** P-120 Research System / Founder Alpha-01 / PASS 1E.1  
**Scope:** Runtime provenance only. No scientific, measurement, scoring, wording, item-order, response-model, or interpretation change.

## 1. Trigger

The first real Founder Alpha browser launch failed closed with:

`canonical_system_runtime_sha256_mismatch`

The controlled failed assessment session was created but never started or submitted. The failure occurred before any respondent answer data was collected.

## 2. Frozen and current canonical runtime identity

Frozen PASS 4 baseline commit:  
`644a6c769bad4ada605e5906ae301e630722d621`

Current production main inspected for reconciliation:  
`2f6418c0aff4fe18ef472268a5dfdf4ccbaa2d31`

`system/index.html` Git blob:

- frozen: `2a67d8eebb003b891593d3f363d73e2e79cf64d9`
- current: `ad95e98eeb8b6ec228ed221d54fdc31d550caf6e`

Raw canonical runtime SHA-256:

- frozen: `a102ebe769ac22a15b9de26a489eeaef395ede164514078b58c7a55c60502492`
- current: `f9861b3fcda1213073fc1fea245ca913776e2e0dc75ca1dcf54515d3a1f963c2`

The raw HTML identity changed and therefore the original Founder Alpha runtime binding became stale.

## 3. Drift classification

Only two post-freeze commits touched `system/index.html`:

1. `a9a5621f09752b1d3477bde6fd837fe2199c18fe` — `P120 WEB: PASS 2.1 harden global header authority`
2. `28154e341b887f207b6792928ff56896a187ff7d` — `P120 WEB: correct base-aware footer stylesheet resolution`

The exact delta is limited to presentation/header authority and stylesheet resolution:

- canonical brand/header classes and data attributes;
- first-paint brand/correction stylesheet links and bootstrap marker;
- mobile brand-mark presentation rule;
- stylesheet path correction.

No questionnaire, scoring, persistence, respondent session contract, or scientific content delta was detected.

**Classification:** `PRESENTATION_ONLY_CANONICAL_SOURCE_DRIFT / PROVENANCE_BINDING_STALE`.

## 4. Canonical instrument authority

The Founder adapter's exact authority algorithm is:

`SHA256(JSON.stringify({modules: base.modules, items: base.items}))`

The audit reproduced that algorithm against both frozen and current `system/index.html`.

Result:

- frozen item count: `180`
- current item count: `180`
- frozen module count: `5`
- current module count: `5`
- frozen instrument SHA-256: `a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49`
- current instrument SHA-256: `a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49`
- item IDs: identical
- module objects: identical
- item objects: identical

The scientific/measurement authority hash therefore remains unchanged.

A preliminary comparison fingerprint using a different stable-object serializer produced `7bbe...`; that fingerprint was explicitly reclassified as non-authoritative. It was an audit-fixture algorithm mismatch, not instrument drift.

## 5. Runtime logic and protected dependency parity

The inlined System application block differs raw only because of the known header presentation mutations. After removing those known presentation-only additions, frozen and current application blocks are byte-identical:

`b40fcf40306ddcde17b44790b2c8c5e6a7861c7c37f9fbded8eeb1e3f7c8638c`

Protected dependency Git blobs remain identical:

- `p120-session-contract-v1.0.js` — `4b13364db56d7e94444971c2ff2487db8857dd77`
- `p120-submission-config-v1.0.js` — `a478db3611a7cae396d89d29c7a910f3ecbec7d2`
- `p120-submission-intake-v1.0.js` — `173523121f1a88d9333b057d6524f3b209d52e5d`
- `internal/runtime/index.html` — `0248698fa145d58f02363de5f6a57a59e04d6c44`
- `internal/runtime/p120-alpha-system-adapter-v1.0.js` — `a1a0d980b969a6313fca79c6952b3ecc42918da3`

Founder runtime authority commit remains:

`563176ed7c31e98d8c150458499c8e157deff0be`

## 6. Provenance-only private package rebind

The protected Founder package was not rewritten semantically. The controlled local/package comparison found exactly one semantic change:

`/manifest/base_runtime_sha256`

from:

`a102ebe769ac22a15b9de26a489eeaef395ede164514078b58c7a55c60502492`

to:

`f9861b3fcda1213073fc1fea245ca913776e2e0dc75ca1dcf54515d3a1f963c2`

Package identities:

- bytes: `176174` → `176174`
- old file SHA-256: `fe034b6ed71822977f4d777e12a00b6f887e0561f653276593e919534bde601c`
- rebound file SHA-256: `ed63f00e94d00eeeec5af12463daf91a6f9018646f2458225d25a067dbd7a8dc`
- extension payload SHA-256: `004ef39cd280b6fade611da15393763609d0a766c5e48a3f39216609651722b6` — unchanged
- canonical instrument SHA-256: `a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49` — unchanged
- runtime build SHA: `563176ed7c31e98d8c150458499c8e157deff0be` — unchanged

The private Storage object was uploaded and re-read byte-for-byte. Readback returned `176174` bytes and SHA-256 `ed63f00e...`.

No private candidate wording was committed to the public repository.

## 7. Live resource rebind

`founder-alpha-core-v1` was placed on a fail-closed hold before the Storage mutation, rebound under guarded migrations, QA-checked, and then re-enabled.

Final controlled authority:

- release state: `INTERNAL_ALPHA`
- release version: `FA-P1`
- run type: `FOUNDER_ALPHA`
- runtime build SHA: `563176ed7c31e98d8c150458499c8e157deff0be`
- base runtime SHA-256: `f9861b3fcda1213073fc1fea245ca913776e2e0dc75ca1dcf54515d3a1f963c2`
- base instrument SHA-256: `a1e52bbc2f44e17091724bc2fe11d3ef8a0e1a0394b5d805550fe80c87de5e49`
- package/content SHA-256: `ed63f00e94d00eeeec5af12463daf91a6f9018646f2458225d25a067dbd7a8dc`
- extension payload SHA-256: `004ef39cd280b6fade611da15393763609d0a766c5e48a3f39216609651722b6`
- launchable: `true`
- authority state: `RUNTIME_PROVENANCE_RECONCILED_LAUNCH_ENABLED`
- provenance QA: `PASS`
- scientific/measurement delta: `NONE`

## 8. Controlled failure evidence preservation

Original failed session:

`e8ec9146-d52c-42ba-a896-7fffa8919bfb`

remains immutable evidence:

- status: `CREATED`
- `started_at`: NULL
- `submitted_at`: NULL
- `submission_id`: NULL
- old base runtime SHA-256 retained: `a102ebe...`
- old package SHA-256 retained: `fe034b6e...`

It was not mutated to match the new authority. A new `NEW` assessment session is required for the browser retest.

At reconciliation closure:

- assessment sessions: `1`
- submissions: `0`
- Founder feedback records: `0`

## 9. Operational security cleanup

The one-shot private package deployer was scrubbed immediately after verified upload:

- active deployer version: `6`
- `verify_jwt=true`
- source: inert `410 / SCRUBBED` response only
- no package bytes or service-role credential are present in active source

The temporary PostgreSQL `http` extension was removed. Final count: `0`.

## 10. Migration lineage

Live migration history is tracked in this branch with exact production versions:

- `20260905111507_p120_fa01_runtime_provenance_reconciliation_hold_v1.sql`
- `20260905111657_p120_fa01_runtime_provenance_temp_http_enable_v1.sql`
- `20260905111721_p120_fa01_runtime_provenance_temp_http_disable_v1.sql`
- `20260905111842_p120_fa01_runtime_provenance_rebind_v1.sql`
- `20260905111949_p120_fa01_runtime_provenance_reconciliation_activation_v1.sql`

The temporary deployer implementation containing private package bytes is intentionally not committed.

## 11. Audit gates

`P120 Runtime Provenance Reconciliation Audit` confirms:

- raw runtime drift exists;
- drift is presentation-only after controlled normalization;
- 180-item/5-module instrument identity is exact;
- protected dependency identities are exact;
- Founder adapter authority is exact.

`P120 Runtime Provenance Canonical Instrument Gate` independently confirms the adapter-exact instrument hash equals the frozen authority on both baseline and current runtime.

## 12. Disposition

**RUNTIME PROVENANCE RECONCILIATION: PASS**  
**DRIFT CLASSIFICATION: PRESENTATION-ONLY**  
**SCIENTIFIC / MEASUREMENT CHANGE: NONE**  
**PRIVATE PACKAGE PROVENANCE REBIND: PASS**  
**LIVE RESOURCE QA: PASS**  
**FAIL-CLOSED EVIDENCE PRESERVED: PASS**  
**REAL FOUNDER E2E RETEST: AUTHORIZED WITH A NEW SESSION**  
**HUMAN GO: HOLD until the real Founder browser retest completes the remaining E2E gates.**
