# P120 Web Runtime Reconciliation — PASS 3

**Document code:** P120-WEB-REC-PASS3  
**Version:** 1.0  
**Date:** 2026-09-02  
**Status:** PASS / READY FOR CONTROLLED MERGE  
**Scope:** Shared Instrument / Scoring Contract & Locale-Isolated Sessions  
**Baseline main:** `acd998c626e0fba77e3c49576839bdf9386f4155`  
**Working branch:** `work/p120-runtime-reconciliation-pass3`

## 1. Gate decision

PASS 3 is technically closed on the working branch. RU and EN respondent runtimes retain one common coded measurement/scoring contract while their persisted respondent sessions are isolated by locale. Editorial routes do not own respondent-session storage.

## 2. Storage ownership

| Surface | Storage authority |
|---|---|
| `/system/` | `p120_runtime_session_ru_v1` |
| `/en/system/` | `p120_runtime_session_en_v1` |
| `/` dormant Editorial runtime | `p120_editorial_state_ru_v1` |
| `/en/` dormant Editorial runtime | `p120_editorial_state_en_v1` |
| Historical pre-PASS3 respondent source | `p120_web_prototype_v01` — migration source only |

Cross-locale respondent writes are prohibited by the PASS 3 session contract.

## 3. Controlled legacy migration

Migration mode: **COPY_PRESERVE_LEGACY**.

When a locale-specific System session does not yet exist, the runtime may copy the historical `p120_web_prototype_v01` payload once into that locale's new session key. The historical source is not deleted or mutated. Each new session receives explicit `sessionLocale` and migration provenance metadata.

This preserves existing browser responses while preventing the historical shared key from remaining the active respondent-session authority.

## 4. Shared measurement and scoring contract

RU and EN System retain:

- 180 / 180 scored items;
- identical item IDs and item order;
- identical module ownership/order;
- identical coded choice values;
- identical scoring-function contract;
- equivalent scoring coverage for the same coded response payload.

Controlled hashes from the final PASS 3 gate:

- coded-response instrument manifest SHA256: `55d91f29d80d9de9535890386d1c65ec9b558e2e4b56714eb54efa8837574b7b`
- scoring contract SHA256: `d51dce3bb64dbe575a68111db9e47bd0ac009a9aeb1af216142ad93c9ce6f8b5`

## 5. Downstream consumer reconciliation

The active respondent-session dependency was also reconciled in:

- `manual-report-handoff-v1.0.js`
- `p120-submission-intake-v1.0.js`

Both consumers now resolve the active locale-specific System session through `window.P120_SESSION_KEY`, with explicit RU/EN fallback keys. They no longer use the historical shared respondent key as their active source.

## 6. Native System materializer compatibility

The existing Native System Route Builder was executed inside the PASS 3 gate and required to be idempotent for `system/index.html` and `en/system/index.html`. Result: **PASS**.

This establishes that the build-time EN System materialization does not erase or rewrite the PASS 3 session boundary.

## 7. Independent QA evidence

Final workflow: `P120 PASS 3 Session Contract Gate`  
Run: `33623917570`  
Head: `8231575a7001b5036f2f00257b950d02fabc1b97`  
Conclusion: **SUCCESS / PASS**  
Evidence artifact: `P120_WEB_RECONCILIATION_PASS3_QA`  
Artifact ID: `9844014372`  
Artifact digest: `sha256:7c52d492b26ed5c0b189dee81adde04b90e25056b019ec41edf493c374839266`

The final browser gate confirmed, among other checks:

- RU migration selects and writes only the RU respondent session;
- EN migration selects and writes only the EN respondent session;
- the same item can retain distinct RU/EN session values without cross-locale overwrite;
- the legacy source remains unchanged;
- RU/EN Editorial routes do not write respondent-session storage;
- manual handoff/submission intake export the matching active locale session;
- active System script dependency scan finds no legacy respondent-key coupling outside the dedicated migration contract;
- 180/180 coded measurement parity and shared scoring contract remain intact.

Earlier QA iterations exposed harness assumptions around browser `beforeunload` persistence and the independent legal-consent overlay. The harness was corrected to test the actual respondent handler/session boundary directly; these were QA-harness corrections, not scientific, scoring, or item-content changes.

## 8. Protected scope

PASS 3 makes **no change** to:

- questionnaire wording;
- item IDs/order;
- response values;
- construct ownership;
- Scientific Base claims/content;
- scoring mathematics or interpretation rules;
- visual design authority.

## 9. Closure

**PASS 3: PASS / READY FOR CONTROLLED MERGE.**

After merge and production deployment verification, the next controlled project gate is the **new Scientific Base production migration + Science QA**, before PASS 4 cleanup.
