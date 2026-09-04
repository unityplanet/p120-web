# P-120 WEB — MINIMAL INTERNAL CABINET & FOUNDER ACCESS CONTROL
## PASS 1E — FOUNDER ALPHA READINESS / REAL E2E

**Document ID:** P120-WEB-AC-005  
**Version:** v1.0  
**Date:** 2026-09-04  
**Authority:** P-120 Research System  
**Evaluated runtime branch:** `access-control/pass1c-v1`  
**Evaluated runtime SHA:** `35e68456415650616c99d3f8825d29553b5bc0ce`  
**Founder Alpha authority:** `P120-FA01-WEB-001 v1.1 / PASS 1.1`  
**Status:** **HOLD / CONTROLLED CHANGE REQUIRED BEFORE REAL HUMAN E2E**  
**Scientific / measurement mutation:** NONE

---

## 00. Executive gate decision

PASS 1E reconciles the implemented access-control build against the exact Founder Alpha runtime authority before any real Founder response is collected.

Security/access-control foundation from PASS 1D remains valid. However, the current `/internal/runtime/` implementation is a separate generic respondent runner: it owns its own item renderer, next/previous navigation, Participant ID generation and local response state. That is not equivalent to proving Founder Alpha as an additive mode of the existing production-oriented respondent runtime.

The current build therefore **must not receive HUMAN GO**. Real FA01-RU-01 execution is stopped before respondent data collection.

Primary controlled blocker:

> **FAE2E-CR-01 — Existing Respondent Runtime Integration.** Replace the parallel generic internal respondent runner with an additive Founder Alpha integration that reuses the existing P-120 respondent runtime authority, or formally modularize that runtime under a separately controlled no-regression change. Frozen wording, item order, response models, administration modes, scoring boundaries and public `/system/` behavior remain protected.

This is an implementation/runtime change request, not a scientific or scoring revision.

---

## 01. Live activation state at PASS 1E opening

Live Supabase state was rechecked before E2E authorization:

- Auth users: `0`
- Auth identities: `0`
- Auth sessions: `0`
- P-120 profiles: `0`
- P-120 assessment sessions: `0`
- P-120 submissions: `0`
- Objects in private bucket `p120-internal-resources`: `0`

Founder Alpha resource state:

- `resource_key = founder-alpha-core-v1`
- `release_state = INTERNAL_ALPHA`
- `release_version = FA-P1`
- `run_type = FOUNDER_ALPHA`
- `runtime_key = founder-alpha-runtime-v1`
- `is_launchable = false`
- storage object: not bound
- content SHA-256: not bound

This is the correct fail-closed state for an unprovisioned Alpha package.

---

## 02. Authority reconciliation

The current Founder Alpha authority requires:

1. exact frozen 180-item source sequence: SAT-24 → P-72 → P-72D → AO-12 → SOMA-24;
2. exact COM-12 24 + MOT-12 24 + SELF-12 21 candidate corpora with participant scoring suppressed;
3. LIFE T3 only in the main Alpha administration, with T0/T1 as linked natural-event sessions;
4. RPE-MOD only as an adult, voluntary, adaptive optional branch;
5. normalized response-state/scope/exposure provenance without rewriting source-native response values;
6. Founder review data separated from measurement responses;
7. telemetry without duplicated intimate response values;
8. exact source/build/version provenance;
9. no new browser scoring arithmetic;
10. QA-01…QA-30 green before HUMAN GO.

The implementation handoff also requires the Alpha to be a private/access-controlled overlay over the current respondent architecture, not a disconnected runtime reconstruction.

---

## 03. Structural non-conformance found in PASS 1E

### FAE2E-01 — Parallel respondent runner

Current `internal/runtime/p120-internal-runtime-v1.0.js` independently implements:

- Participant ID generation;
- local session key/state;
- item rendering;
- previous/next navigation;
- choice mapping;
- completion transition;
- private package interpretation.

This duplicates the respondent execution layer instead of demonstrating the already-controlled `/system/` runtime as the Alpha execution authority.

**Classification:** CRITICAL / CONTROLLED CHANGE REQUIRED.

### FAE2E-02 — P-72D administration-mode parity is not implemented

The generic runner initializes `adminModes:{}` but does not provide the controlled P-72D administration-mode flow required by the frozen source architecture.

**Classification:** CRITICAL / QA-04 PARITY BLOCKER.

### FAE2E-03 — Alpha response envelope is insufficient

Existing raw intake stores item ID, module, response value and position, but the Alpha authority additionally requires traceable scope, response state, temporal/eligibility state, source/version identity and runtime build provenance. These fields must be additive metadata; they must not alter source-native values.

**Classification:** CRITICAL / QA-13/14/15/25 BLOCKER.

### FAE2E-04 — LIFE orchestration is not enforced

The generic runner can render any package items sequentially. It does not enforce the T3-only main-session rule or linked T0/T1 event-session architecture.

**Classification:** CRITICAL / QA-07/08/09 BLOCKER.

### FAE2E-05 — RPE optional adaptive routing is not implemented

No 18+ opt-in/adaptive RPE router is present. RPE must either remain explicitly disabled/deferred for the first Alpha run or be implemented under its controlling safety/privacy authority.

**Classification:** HOLD / QA-10/11/12.

### FAE2E-06 — Founder review namespace is not implemented

The current access-control schema/runtime does not yet provide the required review/feedback object separate from measurement responses.

**Classification:** HIGH / QA-21 BLOCKER.

---

## 04. QA-01…QA-30 readiness matrix

| ID | Requirement | PASS 1E state | Disposition |
|---|---|---|---|
| QA-01 | Persist exact repository/build SHA with run | **FAIL** | Session schema snapshots release/content hash but not runtime build SHA. |
| QA-02 | Extended corpus absent from public static source | **PASS** | No protected package/candidate bank is committed in the evaluated branch. |
| QA-03 | Real access boundary, not hidden URL | **PASS — FOUNDATION** | Auth + RLS/RPC + private Storage access path exists and was red-teamed in PASS 1D. |
| QA-04 | Exact frozen source parity | **FAIL / NOT EVIDENCED** | No exact private package; generic loader does not enforce frozen per-module parity; P-72D mode flow missing. |
| QA-05 | Frozen source count = 180 | **BASELINE PASS / ALPHA HOLD** | Existing public runtime baseline is 180; Alpha package parity not yet evidenced. |
| QA-06 | Exact COM24 + MOT24 + SELF21 binding | **HOLD** | Authoritative corpora identified; private package not bound. |
| QA-07 | LIFE T0/T1/T3 separation | **FAIL** | No orchestration guard in current generic runner. |
| QA-08 | Main LIFE = T3 only | **FAIL** | No package/runtime enforcement. |
| QA-09 | No event inducement | **PARTIAL / HOLD** | No inducement is implemented, but the controlled LIFE event-session flow is absent. |
| QA-10 | RPE 18+ voluntary opt-in | **HOLD** | Router absent; keep RPE deferred/disabled until implemented. |
| QA-11 | RPE adaptive burden | **HOLD** | Router absent. |
| QA-12 | RPE safety ceiling | **HOLD** | No RPE package is active; must remain inactive until controlled route exists. |
| QA-13 | Distinct response states | **FAIL** | Current Alpha state collapses responses to a simple response map. |
| QA-14 | Scope ontology per extended response | **FAIL** | Not persisted in current Alpha response object/intake. |
| QA-15 | Exposure/opportunity metadata | **FAIL** | Not persisted; must never be inferred as a low response. |
| QA-16 | No prohibited composites | **PASS** | Internal runtime performs no composite calculation. |
| QA-17 | Candidate scoring suppression | **PASS** | COM/MOT/SELF/LIFE/RPE scoring is not implemented. |
| QA-18 | Deterministic scoring boundary | **PASS WITH REPORT HOLD** | No new browser scoring arithmetic; report/scoring cutover remains disabled. |
| QA-19 | Current `/system/` scoring baseline unchanged | **PASS** | Access-control branch is additive; public respondent runtime was not modified. |
| QA-20 | Report channel split | **HOLD** | Respondent report is correctly suppressed, but Founder Internal Research View is not implemented. |
| QA-21 | Founder feedback separate from measurement | **FAIL** | Separate feedback persistence/UI absent. |
| QA-22 | Telemetry minimization | **PASS IN CURRENT GENERIC RUNNER** | Generic internal runner does not emit answer-value telemetry. Must be revalidated after runtime integration. |
| QA-23 | Existing telemetry issue isolated in Alpha | **FAIL / CR DEPENDENCY** | Reusing the existing runtime requires an Alpha-specific telemetry suppression/isolation control. |
| QA-24 | Save/resume main + LIFE linked sessions | **PARTIAL** | Main local save exists; LIFE linked follow-up/session resume absent. |
| QA-25 | Version/source/build provenance | **FAIL** | Release/content hash is partial; required per-administration and runtime build provenance is incomplete. |
| QA-26 | RU authority | **PARTIAL / FAIL-CLOSED REQUIRED** | Cabinet currently launches RU, but Founder Alpha server/runtime contract does not prohibit EN candidate execution. |
| QA-27 | Accessibility browser QA | **HOLD** | No exact-build keyboard/focus/screen-reader browser evidence yet. |
| QA-28 | 390/768/1440/2560 visual QA | **HOLD** | Source CSS exists; exact rendered viewport evidence not yet captured. |
| QA-29 | Failure recovery / idempotency | **PARTIAL / HOLD** | Raw intake retries and receipt dedupe exist; exact Founder Alpha browser recovery test not executed. |
| QA-30 | Explicit HUMAN GO | **HOLD** | Prohibited until all CRITICAL gates are green on the exact build. |

---

## 05. E2E execution decision

A real Founder sign-in/run was **not** started. This is intentional.

Starting a human run now would create evidence against a build that is known not to satisfy the governing Alpha respondent-runtime contract. PASS 1.1 explicitly prohibits HUMAN GO while a critical QA gate remains pending/failing.

Therefore:

**REAL E2E = NOT AUTHORIZED ON SHA `35e68456415650616c99d3f8825d29553b5bc0ce`.**

No respondent data were created during PASS 1E.

---

## 06. Controlled corrective path

Open and execute `P120-WEB-CR-FA01-001 — Founder Alpha Existing-Runtime Integration` with the following hard boundaries:

- preserve public `/system/` behavior and anonymous path;
- preserve frozen wording/order/response models;
- preserve P-72D controlled administration modes;
- no new scoring arithmetic;
- private candidate bytes remain outside public GitHub;
- add only Alpha orchestration, private source loading, provenance, response-state metadata, LIFE/RPE routing, feedback separation and telemetry isolation;
- rerun PASS 1D security regression after the integration;
- rerun the complete QA-01…QA-30 matrix on one exact build SHA;
- only then provision Founder identity/package and perform the real E2E.

---

## 07. PASS 1E verdict

**ACCESS CONTROL:** PASS FOUNDATION  
**PRIVATE STORAGE BOUNDARY:** PASS FOUNDATION  
**FOUNDER ALPHA RESPONDENT-RUNTIME CONFORMANCE:** **FAIL / CR REQUIRED**  
**REAL HUMAN E2E:** **HOLD**  
**HUMAN GO:** **NOT AUTHORIZED**  
**MEASUREMENT/SCORING CHANGE:** NONE

### Next exact gate

`P120-WEB-CR-FA01-001 — Founder Alpha Existing-Runtime Integration` → regression → `PASS 1E.1 — Exact Build QA & Real Founder E2E`.
