# P-120 WEB — MOBILE SESSION RESUME
## PATCH 2 / PASS 1 — SOURCE & AUTHORITY RECONCILIATION

**Document ID:** P120-WEB-MSR-P2-P1  
**Version:** 1.0  
**Date:** 2026-09-04  
**Status:** PASS / AUTHORITY RECONCILED / IMPLEMENTATION FINDINGS OPEN  
**Baseline main:** `b808c33b88e7e6c1d610ae4946998b1168c04c98`  
**Scope class:** Mobile session-resume access / source-authority reconciliation  
**Production behavior change in this pass:** NONE  
**Scientific / measurement / scoring impact:** NONE  
**Questionnaire impact:** NONE  
**Respondent-session schema change:** NONE  
**Global Header Brand Authority:** FROZEN / NOT REOPENED  
**Why P-120:** FROZEN / NOT REOPENED  
**Typography:** NO CHANGE

## 1. Gate objective

PATCH 2 adds a future mobile quick-resume path for an unfinished P-120 respondent session. PASS 1 does not implement the control. Its purpose is to reconcile the existing storage, route and presentation sources so PASS 2 can add the control without creating a second session authority, reviving obsolete storage ownership or allowing the Editorial site to mutate respondent state.

The governing design principle is:

> The public Editorial surface may expose a read-only resume affordance, but the canonical respondent session remains owned by the locale-specific System runtime.

## 2. Source lineage reviewed

The relevant lineage is:

1. **System Controlled Migration v1.0** moved the respondent runtime to `/system/` and originally retained `p120_web_prototype_v01` for continuity.
2. **Runtime Reconciliation PASS 3** superseded that shared-key ownership by establishing locale-isolated respondent sessions and editorial-only state keys.
3. The dedicated `p120-session-contract-v1.0.js` now owns the locale session boundary and treats `p120_web_prototype_v01` only as a copy-preserving migration source.
4. `manual-report-handoff-v1.0.js` and `p120-submission-intake-v1.0.js` already consume `window.P120_SESSION_KEY` with RU/EN canonical fallbacks.
5. `p120-brand-system-v1.0.js` still contains a pre-PASS3 resume reader bound directly to `p120_web_prototype_v01`. That reader was not reconciled when respondent-session ownership moved to the PASS 3 contract.
6. The public Main dormant assessment state is intentionally editorial-only (`p120_editorial_state_ru_v1` / `p120_editorial_state_en_v1`) and must not be promoted back into respondent-session authority.

The source review therefore identifies one canonical respondent authority and two stale presentation paths that must be corrected before mobile resume is implemented.

## 3. Canonical storage ownership

| Surface / role | Canonical storage authority | PATCH 2 role |
|---|---|---|
| `/system/` | `p120_runtime_session_ru_v1` | authoritative RU respondent session |
| `/en/system/` | `p120_runtime_session_en_v1` | authoritative EN respondent session |
| `/` dormant Editorial runtime | `p120_editorial_state_ru_v1` | excluded from resume eligibility |
| `/en/` dormant Editorial runtime | `p120_editorial_state_en_v1` | excluded from resume eligibility |
| historical shared respondent source | `p120_web_prototype_v01` | migration input only; never active resume authority |

**Decision:** PATCH 2 introduces no new storage key and no storage migration.

## 4. Canonical session contract

The canonical contract remains `p120-session-contract-v1.0.js`.

For the active System route it resolves:

- RU → `p120_runtime_session_ru_v1`
- EN → `p120_runtime_session_en_v1`

The legacy key `p120_web_prototype_v01` is allowed only under `COPY_PRESERVE_LEGACY`: when the locale-specific session does not yet exist, the System contract may copy the historical payload into the locale key while preserving the historical source. Cross-locale respondent writes remain prohibited.

PATCH 2 must not delete, mutate, rename or re-promote the legacy source. It must also not reproduce migration logic on the Editorial page.

## 5. Existing authority conflict A — stale brand-runtime resume reader

Current `p120-brand-system-v1.0.js` declares:

`SESSION_KEY = 'p120_web_prototype_v01'`

and its `readSession()` / `patchResumeRail()` path reads that key directly.

This is no longer aligned with PASS 3 respondent-session ownership. The brand-runtime code is a presentation bridge; it must not independently select respondent storage.

**PASS 1 disposition:** the legacy reader is classified as an implementation blocker for PATCH 2 / PASS 2. It must be replaced or isolated so any resume presentation reads the canonical locale-specific respondent key instead.

This finding does not invalidate the frozen Global Header Brand Authority. PASS 2 must make only an explicitly bounded session-resume correction and must not alter orbit mark, lockup, descriptor, header first-paint ownership, canonical nav authority or brand styling.

## 6. Existing authority conflict B — Editorial resume rail existence

The current Main Editorial source can render `.editorial-resume-rail` according to the dormant Editorial runtime's `hasProgress()` state.

That state belongs to `p120_editorial_state_ru_v1` / `p120_editorial_state_en_v1`, not the canonical respondent session.

Consequences if reused without reconciliation:

- a real unfinished System session can exist while the Editorial resume rail is absent;
- dormant Editorial responses can cause a resume surface to exist without a canonical System session;
- session progress shown by the Editorial UI can therefore diverge from respondent progress.

**PASS 1 disposition:** Editorial `hasProgress()` is prohibited as the PATCH 2 resume-visibility authority.

PATCH 2 / PASS 2 must create or reveal the mobile resume affordance directly from the canonical respondent-session predicate. It must not depend on dormant Editorial assessment progress.

## 7. Existing authority conflict C — hamburger progress card

The existing mobile hamburger progress presentation on the public Main surface is also derived from local Editorial state.

It is therefore not an authoritative respondent-session progress source and must not be used to decide whether PATCH 2 resume is available.

This finding does **not** authorize removing or redesigning the hamburger.

**GOVERNING DECISION — HAMBURGER REMAINS A FULL NAVIGATION SURFACE.**

PATCH 2 preserves the complete hamburger information architecture. Any later cleanup or deduplication remains a separate controlled improvement.

## 8. Resumable-session contract for PASS 2

PATCH 2 / PASS 2 must fail closed. The mobile resume affordance is visible only when the current locale has a valid, unfinished canonical System session.

Minimum eligibility contract:

1. Read only the locale-matched canonical respondent key.
2. Stored value must parse as a non-array object.
3. `responses` must be a non-array object.
4. `sessionLocale`, when present, must agree with the route locale.
5. The public P-120 instrument must be available with its canonical item registry.
6. Count only responses whose item IDs exist in the canonical instrument and whose values are non-null/non-empty.
7. Meaningful respondent progress must exist: at least one canonical scored item answered.
8. The canonical scored-item set must be incomplete: answered count less than total item count.
9. A completed results state must not expose the unfinished-session resume affordance.
10. Corrupt, ambiguous, cross-locale or structurally invalid state hides the affordance.

For the current instrument the scored-item total is 180. PASS 2 should derive the total from `window.P120_INSTRUMENT.items.length` rather than hard-coding 180 into UI logic, while QA must still assert the current 180-item frozen contract.

The resume UI is a **reader only**. It must not write `itemIndex`, `screen`, `responses`, `participantId`, migration metadata, telemetry or timestamps.

## 9. Resume action and route ownership

The resume action must route to the existing locale-matched canonical System surface:

- RU Editorial → `/system/`
- EN Editorial → `/en/system/`

The Editorial page must not reproduce question routing or calculate the next question independently.

The System runtime remains responsible for `restore()` and for resolving the actual continuation position from the saved respondent state. This preserves a single assessment-state machine and avoids a second continuation algorithm in the public shell.

## 10. Mobile placement contract for PASS 2

The future mobile resume control is an additive quick-access utility, not a replacement for existing navigation.

Authorized placement target:

- mobile / phone shell only;
- top-right utility/action zone;
- directly below the hamburger;
- right-aligned with the hamburger;
- visually subordinate to the primary assessment CTA and to the canonical header identity;
- absent when no resumable canonical session exists.

PASS 1 authorizes no CSS or DOM implementation yet.

## 11. Findings register

| ID | Severity | Finding | PASS 1 disposition |
|---|---|---|---|
| P2-SR01 | BLOCKING FOR IMPLEMENTATION | `p120-brand-system-v1.0.js` resume reader still selects `p120_web_prototype_v01` | OPEN → must reconcile in PASS 2 |
| P2-SR02 | BLOCKING FOR IMPLEMENTATION | Main Editorial resume-rail existence is controlled by Editorial-only `hasProgress()` | OPEN → must bypass/replace as resume authority in PASS 2 |
| P2-SR03 | MEDIUM | Public hamburger progress card reflects local Editorial state, not canonical respondent progress | CONTROLLED → excluded from PATCH 2 eligibility logic |
| P2-SR04 | LOW / HARDENING | Historical PASS 3 session-contract workflow remains branch-pinned to `work/p120-runtime-reconciliation-pass3` rather than acting as a main-branch protection | OPEN HARDENING NOTE → PASS 2 QA must provide its own main-branch gate |
| P2-SR05 | CONTROL | Legacy `p120_web_prototype_v01` must remain copy-preserving migration input only | CLOSED BY GOVERNING RULE |
| P2-SR06 | CONTROL | Public Editorial routes must remain read-only consumers of respondent progress | CLOSED BY GOVERNING RULE / must be regression-tested |

**Blocking defects in current System respondent authority:** 0.  
**Blocking findings for adding the new resume surface without reconciliation:** 2.

## 12. PASS 2 implementation handoff

PATCH 2 / PASS 2 is authorized to implement the mobile resume surface only within the reconciled authority boundary above.

Required implementation properties:

- one shared read-only session-resume resolver for RU/EN public Main;
- resolver selects canonical locale respondent key, not Editorial state and not legacy shared key;
- no new persistence key;
- no respondent write from Editorial route;
- no duplicate continuation state machine;
- no change to System scoring, measurement or questionnaire code;
- no change to locale-isolation semantics;
- no change to legacy migration semantics;
- no change to hamburger information architecture;
- no change to mobile bottom-navigation action count/ownership;
- no reopening of frozen Global Header Brand Authority;
- no reopening of Why P-120;
- no typography redesign.

If implementation must touch `p120-brand-system-v1.0.js`, the change is permitted only inside the stale session-resume reader/presentation path and must preserve the previously frozen header authority byte/behavior expectations through regression QA.

## 13. PASS 2 QA requirements

Dedicated implementation QA must cover at minimum:

- RU and EN canonical unfinished sessions;
- no-session state;
- zero-answer canonical session;
- one-answer session;
- partial session at multiple progress depths;
- 179/180 state;
- completed 180/180 results state;
- invalid JSON;
- object without `responses`;
- cross-locale / mismatched `sessionLocale` state;
- legacy-only state with no locale session;
- simultaneous distinct RU and EN sessions;
- resume click routes to the correct locale System;
- System restores the correct continuation state after the click;
- Editorial route performs zero respondent-session writes during detection and interaction;
- hamburger remains present and functional;
- existing bottom navigation remains unchanged;
- mobile widths 360 / 390 / 430 / 480;
- Ivory / Graphite / Museum;
- desktop preservation;
- no horizontal overflow;
- no console/page errors;
- frozen Global Header PASS 2.1 regression gate rerun if the brand runtime is modified.

## 14. Protected scope

PATCH 2 / PASS 1 makes no production mutation and no change to:

- respondent answers;
- questionnaire wording;
- item IDs/order;
- response values;
- module ownership/order;
- scoring mathematics;
- interpretation/report logic;
- Supabase intake behavior;
- submission schema;
- scientific claims;
- Why P-120 composition;
- canonical brand mark / lockup / descriptor;
- theme authority;
- language authority;
- typography;
- hamburger information architecture;
- mobile bottom-navigation authority.

## 15. Gate decision

**PATCH 2 / PASS 1 — PASS.**

The current architecture already contains a correct locale-isolated canonical respondent-session authority. The reconciliation issue is in presentation-layer consumers: the old brand-runtime resume reader and the Editorial-only resume/progress conditions were not updated when PASS 3 moved respondent storage ownership.

PASS 1 therefore closes the authority question without changing production behavior:

**CANONICAL SESSION AUTHORITY:** RECONCILED  
**EDITORIAL ROLE:** READ-ONLY CONSUMER  
**LEGACY KEY:** MIGRATION SOURCE ONLY  
**NEW STORAGE / MIGRATION:** PROHIBITED / NOT REQUIRED  
**SYSTEM CONTINUATION STATE MACHINE:** SINGLE AUTHORITY  
**IMPLEMENTATION FINDINGS:** 2 OPEN / BOUNDED  
**PASS 2 IMPLEMENTATION:** AUTHORIZED  
**PRODUCTION BEHAVIOR CHANGE IN PASS 1:** NONE

**PATCH 2 / PASS 1 CLOSED.**
