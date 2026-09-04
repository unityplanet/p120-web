# P-120 WEB — MOBILE SESSION RESUME
## PATCH 2 / PASS 2 — IMPLEMENTATION & REGRESSION QA

**Document ID:** P120-WEB-MSR-P2-P2  
**Version:** 1.0  
**Date:** 2026-09-04  
**Status:** PASS / IMPLEMENTED / REGRESSION-GATED / PRODUCTION DEPLOYED  
**PASS 1 authority baseline:** `415121c2d5ed753fa8ee3aeb117786cfb1cbf75b`  
**Production authority commit:** `46f574154cafc58f56a14c7f29e182554657e746`  
**Post-implementation cleanup head:** `49fe1c6695c24c050eab3a6c030503849cbcd280`  
**Controlled implementation-record deployment head:** `aac871c6011e31e7d7f7738b0d4f3b7c55679007`  
**Scope class:** Mobile session-resume access / read-only presentation bridge  
**Scientific / measurement / scoring impact:** NONE  
**Questionnaire impact:** NONE  
**Respondent-session schema change:** NONE  
**Supabase / submission schema change:** NONE  
**Global Header Brand Authority:** FROZEN / NOT REOPENED  
**Why P-120:** FROZEN / NOT REOPENED  
**Hamburger information architecture:** PRESERVED  
**Mobile bottom-navigation authority:** PRESERVED  
**Typography:** NO CHANGE

## 1. Gate objective

PATCH 2 / PASS 2 implements a mobile quick-resume affordance for an unfinished canonical P-120 respondent session while preserving the PASS 3 locale-isolated respondent-session contract and the existing System continuation state machine.

The public Editorial surface remains a read-only consumer. It does not become a respondent-session owner and it does not calculate continuation independently.

## 2. Canonical session authority

The implementation preserves the PASS 1 / Runtime Reconciliation PASS 3 authority map:

| Surface / role | Canonical storage authority | PATCH 2 role |
|---|---|---|
| `/system/` | `p120_runtime_session_ru_v1` | authoritative RU respondent session |
| `/en/system/` | `p120_runtime_session_en_v1` | authoritative EN respondent session |
| `/` dormant Editorial runtime | `p120_editorial_state_ru_v1` | excluded from respondent resume authority |
| `/en/` dormant Editorial runtime | `p120_editorial_state_en_v1` | excluded from respondent resume authority |
| historical shared source | `p120_web_prototype_v01` | copy-preserving migration source only |

No new persistence key or migration path was introduced.

## 3. Production implementation

### 3.1 Read-only resume runtime

New permanent runtime:

`mobile-session-resume-v1.0.js`

Initial implementation commit:

`e6320980b384315208085510ef1131c9511be3d9`

The runtime:

- resolves the canonical respondent key from route locale;
- never references `p120_web_prototype_v01`;
- performs no `localStorage.setItem()` respondent writes;
- runs only on the locale-matched public Main route;
- derives current item coverage from `window.P120_INSTRUMENT.items`;
- counts only canonical instrument item IDs with non-null / non-empty response values;
- exposes a fail-closed eligibility result;
- routes RU resume to `/system/` and EN resume to `/en/system/`;
- delegates actual continuation position to the existing System runtime;
- synchronizes any existing `.editorial-resume-rail` visibility to the canonical respondent-session predicate rather than dormant Editorial progress.

### 3.2 Presentation

New permanent stylesheet:

`mobile-session-resume-v1.0.css`

Initial presentation commit:

`a6f63d1b0c41a75c223f8fd24186f24135a92bee`

The control is:

- mobile-only at widths up to 820 px;
- absent on desktop at 821 px and above;
- positioned directly below and right-aligned with the hamburger;
- visually subordinate to the primary assessment CTA and canonical header identity;
- hidden from interaction while the hamburger drawer is open;
- reduced-motion compatible.

RU label: `Продолжить`  
EN label: `Resume`

The control includes the current canonical completion percentage.

### 3.3 Brand-runtime authority correction

Production commit:

`46f574154cafc58f56a14c7f29e182554657e746`

The stale presentation reader in `p120-brand-system-v1.0.js` was reconciled from:

`p120_web_prototype_v01`

to locale-specific canonical respondent keys:

- `p120_runtime_session_ru_v1`
- `p120_runtime_session_en_v1`

The brand runtime now loads the PATCH 2 mobile resume bridge only on the locale-matched public Main route.

This was an explicitly bounded session-resume correction. Orbit mark, P-120 lockup, localized descriptor, first-paint header authority, canonical navigation and brand styling were not redesigned or reopened.

## 4. Resumable-session predicate

The mobile control is visible only when all relevant conditions are satisfied:

1. the current locale canonical respondent key contains a parseable object;
2. `responses` is a non-array object;
3. `sessionLocale`, when present, matches the current route locale;
4. the public canonical instrument is available;
5. at least one canonical scored item has a valid response;
6. fewer than all canonical scored items are answered;
7. the session is not in `results` state.

The current instrument remains 180 scored items, but production eligibility derives the total from the canonical instrument rather than hard-coding 180 into display logic.

The affordance fails closed for:

- no canonical session;
- zero-answer session;
- completed 180/180 session;
- partial state already marked `results`;
- invalid JSON;
- missing/invalid `responses`;
- cross-locale `sessionLocale` mismatch;
- legacy-only state without a locale-specific canonical session.

## 5. Continuation ownership

The public Editorial surface does not calculate a next question and does not rewrite respondent state before navigation.

Resume action:

- RU Editorial → `/system/`
- EN Editorial → `/en/system/`

The existing System runtime restores the saved state and determines the continuation item. This preserves one assessment continuation state machine.

## 6. Dedicated PATCH 2 / PASS 2 regression gate

Permanent QA:

`qa/mobile_session_resume_patch2_pass2.mjs`

Permanent workflow:

`.github/workflows/qa-mobile-session-resume-patch2-pass2.yml`

Accepted workflow:

**P120 WEB Mobile Session Resume PATCH 2 PASS 2 QA**  
**Run:** `33896826052`  
**Job:** `101101319063`  
**Head:** `2bb4f080b611a6a8425447375ad06521b2c7eb3d`  
**Conclusion:** SUCCESS

Dedicated PATCH 2 result:

- **363 / 363 checks PASS**
- 24 core mobile cases;
- RU / EN;
- widths 360 / 390 / 430 / 480;
- Ivory / Graphite / Museum;
- 22 edge-state cases;
- 2 resume-to-System continuation cases;
- no dedicated-gate failures.

Accepted evidence artifact:

- Name: `P120_WEB_MOBILE_SESSION_RESUME_PATCH2_PASS2_QA`
- Artifact ID: `9946094677`
- Size: `3,876,573` bytes
- SHA256: `c67abff60b446d4ec500c1c977be579bc99538bebb36b2c7ec13d58955216780`

## 7. PASS 3 session-contract regression

The same accepted PATCH 2 workflow reran the existing PASS 3 locale-isolated session contract and returned PASS.

Preserved controlled invariants:

- RU session selects `p120_runtime_session_ru_v1`;
- EN session selects `p120_runtime_session_en_v1`;
- cross-locale writes remain prohibited;
- legacy source remains `COPY_PRESERVE_LEGACY` migration input only;
- RU/EN Editorial routes do not write respondent sessions;
- respondent item count remains 180 / 180;
- coded-response instrument manifest SHA256 remains `55d91f29d80d9de9535890386d1c65ec9b558e2e4b56714eb54efa8837574b7b`;
- scoring contract SHA256 remains `d51dce3bb64dbe575a68111db9e47bd0ac009a9aeb1af216142ad93c9ce6f8b5`.

## 8. Frozen Global Header regression

Because PATCH 2 touches `p120-brand-system-v1.0.js`, the previously frozen header authority gate was rerun.

An initial rerun exposed one stale QA-harness assumption: the saved-session idempotency fixture still seeded `p120_web_prototype_v01`. After the production reader was correctly moved to canonical locale-specific respondent storage, that historical fixture no longer represented a canonical saved session. This was a QA-harness issue, not a production header regression.

The fixture alone was corrected to seed `p120_runtime_session_ru_v1` with `sessionLocale:'ru'`. No production runtime was changed by this correction.

Final accepted frozen-header run:

**Workflow:** P120 WEB Global Header PASS 2.1 Hardened QA  
**Run:** `33897148297`  
**Job:** `101102339030`  
**Head:** `3b6a3d125b3de9fb84b78317c4ceceb13d92473f`  
**Conclusion:** SUCCESS

Results:

- PASS 2.1 hardened source/runtime gate: **PASS**
- Source routes: 20
- Runtime route/viewport cases: 40
- Saved-session idempotency cases: 1
- Failures: 0
- Original Header PASS 1: **PASS — 32 route/viewport cases**
- Footer Link Presentation Correction PASS 1: **PASS — 4 base-aware routes / 4 mobile runtime cases**

Frozen-header evidence artifact:

- Name: `P120_WEB_GLOBAL_HEADER_PASS21_HARDENED_QA`
- Artifact ID: `9946240195`
- Size: `15,283,713` bytes
- SHA256: `24cece3ee1bff35c34be88211e1b5a19d89a4129568d3846e52f7071ed829eee`

## 9. Findings closure

| ID | PASS 1 finding | PASS 2 disposition |
|---|---|---|
| P2-SR01 | Brand resume reader selected legacy shared key | **CLOSED** — locale canonical keys now selected |
| P2-SR02 | Editorial resume existence depended on Editorial-only progress | **CLOSED** — canonical responder predicate controls PATCH 2 resume; existing rail is reconciled to it |
| P2-SR03 | Hamburger progress is Editorial-only | **CONTROLLED** — excluded from respondent resume eligibility; hamburger preserved |
| P2-SR04 | Historical PASS 3 workflow was not a main-branch PATCH 2 protection | **CLOSED** — permanent PATCH 2 main-branch gate reruns PASS 3 |
| P2-SR05 | Legacy key must remain migration source only | **CLOSED / PRESERVED** |
| P2-SR06 | Editorial must remain read-only consumer | **CLOSED / REGRESSION-PROVEN** |

**Blocking findings remaining:** 0.

## 10. Cleanup and permanent assets

Temporary one-shot implementation infrastructure was retired after successful production reconciliation and regression QA:

- `.github/workflows/apply-mobile-session-resume-patch2-pass2.yml` — retired;
- `.github/scripts/p120_patch2_pass2_session_resume_apply.py` — retired;
- `.github/workflows/apply-header-pass21-patch2-fixture.yml` — retired.

Permanent retained assets:

- `mobile-session-resume-v1.0.js`;
- `mobile-session-resume-v1.0.css`;
- `qa/mobile_session_resume_patch2_pass2.mjs`;
- `.github/workflows/qa-mobile-session-resume-patch2-pass2.yml`;
- canonical-session fixture in `qa/global_header_code_hardening_pass21.mjs`;
- frozen header workflow with PATCH 2 runtime/style trigger coverage.

## 11. Protected scope and freeze boundary

PATCH 2 / PASS 2 makes no change to:

- questionnaire wording;
- item IDs or order;
- response values;
- construct ownership;
- scoring mathematics;
- report interpretation rules;
- Supabase intake behavior;
- submission schema;
- scientific claims;
- Why P-120 composition;
- orbit mark / P-120 lockup / descriptor;
- first-paint brand authority;
- hamburger information architecture;
- mobile bottom-navigation action count or ownership;
- typography authority.

The following PATCH 2 decisions are now controlled implementation authority:

- locale-specific canonical respondent keys are the only public resume source;
- public Editorial resume detection is read-only;
- legacy shared storage is not an active resume source;
- eligibility is fail-closed and requires meaningful incomplete canonical progress;
- System routes own actual continuation;
- RU resumes to `/system/`, EN resumes to `/en/system/`;
- quick resume is mobile-only up to 820 px and desktop-hidden;
- quick resume is anchored directly below / right-aligned with hamburger;
- no new persistence key or duplicate state machine is permitted.

A future change touching these decisions requires rerunning the dedicated PATCH 2 gate and PASS 3 session-contract regression. A change touching the shared brand runtime or frozen header surface also requires the Global Header PASS 2.1 / PASS 1 / footer regression package.

## 12. Deployment verification

GitHub Pages deployment of the complete implementation-record head finished successfully:

**Workflow:** pages build and deployment  
**Run:** `33897515974`  
**Head:** `aac871c6011e31e7d7f7738b0d4f3b7c55679007`  
**Conclusion:** SUCCESS

This deployment head already contains the production runtime, permanent QA, canonical header-QA fixture, cleanup of all one-shot implementation infrastructure, and this controlled implementation record. The present status update is documentation-only and does not alter the deployed production runtime.

## 13. Gate decision

**PATCH 2 / PASS 2 — PASS / IMPLEMENTED / REGRESSION-GATED / PRODUCTION DEPLOYED.**

**CANONICAL SESSION AUTHORITY:** PRESERVED  
**PUBLIC EDITORIAL ROLE:** READ-ONLY  
**LEGACY ACTIVE RESUME AUTHORITY:** REMOVED  
**NEW STORAGE / MIGRATION:** NONE  
**SYSTEM CONTINUATION STATE MACHINE:** SINGLE AUTHORITY  
**DEDICATED QA:** 363 / 363 PASS  
**PASS 3 REGRESSION:** PASS  
**FROZEN HEADER REGRESSION:** PASS  
**IMPLEMENTATION FINDINGS OPEN:** 0  
**PRODUCTION DEPLOYMENT:** SUCCESS  
**PATCH 2 / PASS 2:** CLOSED
