# P-120 WEB — GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 2
## Technical / Code Integrity Audit

**Document ID:** P120-WEB-HDR-P2-AUDIT  
**Version:** 1.0  
**Status:** PASS WITH HARDENING NOTES / AUDIT COMPLETE  
**Date:** 2026-09-04  
**Workstream:** P-120 Web / Global Public Shell  
**Audit baseline:** `2f64cb6d821d7d4f15acec13ebfc929a7230ff76`  
**Audit instrumentation head:** `ead1b7ba074dc6c52a2a2d8df93345ac67634423`  
**Scientific / scoring / measurement impact:** NONE  
**Visual redesign authority:** NONE  
**Why P-120 composition:** FROZEN / NOT REOPENED

---

## 00 — Control Decision

PASS 2 was executed as a technical/code audit only. No production header, body, scientific, scoring, assessment, report, persistence, Supabase, legal or visual-composition source was modified by this pass.

The comparison from the closed PASS 1 baseline to the audit instrumentation head contains only:

- `qa/global_header_code_integrity_pass2.mjs` — audit instrumentation;
- `.github/workflows/qa-global-header-pass2-code-audit.yml` — dedicated CI gate.

The accepted visual state from PASS 1 therefore remains unchanged.

**Decision:** the current header implementation is operationally stable and contains no blocking runtime defect in the audited matrix, but the shared shell is **not yet eligible for CODE FROZEN status** because medium-severity hardening notes remain.

---

## 01 — Scope & Preservation Firewall

### In scope

- canonical brand source ownership;
- CSS cascade and responsive ownership;
- first-paint / runtime brand lifecycle;
- duplicate runtime and stylesheet loading;
- visible header / mark multiplicity;
- shared-runtime idempotency;
- MutationObserver / reconciliation behavior;
- legacy shell interaction with the canonical brand layer;
- regression-gate adequacy.

### Out of scope

- visual redesign;
- accepted logo geometry or descriptor wording;
- page editorial composition;
- Why P-120 body sources;
- questionnaire content or order;
- scoring, report calculation or interpretation;
- scientific authority;
- Supabase / Auth / RLS / persistence;
- legal-policy content.

---

## 02 — Current Authority Map

The intended canonical public brand layer is:

- `p120-brand-system-v1.0.js` — canonical runtime / reconciliation authority;
- `p120-brand-system-v1.0.css` — canonical header / brand / navigation CSS authority;
- `p120-pass53-visual-corrections-v1.0.css` — scoped contextual corrections, including accepted Why P-120 dark-header treatment;
- `navigation-unification-v1.0.css` — main desktop navigation geometry / descriptor preservation;
- PASS 1 lifecycle gate — `qa/global_header_brand_lockup_cleaning_pass1.mjs`.

The canonical runtime contains useful integrity guards:

1. global runtime version guard via `window.P120_BRAND_SYSTEM`;
2. loader guards on Founder / Explore / Legal entry points;
3. per-host canonicalization guard through `data-p120-canonical-brand="5.3"`;
4. stable canonical `brandMarkup()` containing orbit + nodes + P-120 + descriptor;
5. canonical CSS no longer contains the former `<=480px` `.brand-mark { display:none }` defect.

These controls are working and materially reduce duplicate-mount risk.

---

## 03 — Automated Audit Result

Dedicated workflow:

- workflow: **P120 WEB Global Header PASS 2 Code Audit**;
- run ID: `33868416834`;
- result: **SUCCESS**;
- audit status: **PASS_WITH_HARDENING_NOTES**;
- blocking findings: **0**;
- hardening notes: **4**;
- source files scanned: **135**;
- runtime cases: **16**;
- audited widths: **390 / 1440 px**;
- audited representative routes: Main / Extended / Together / Creator / Why P-120 / Science and RU/EN counterparts represented in the matrix;
- final visible-header multiplicity: **1 per audited case**;
- final visible orbit-mark multiplicity: **1 per audited case**;
- canonical brand runtime script instances: **1 per audited case**;
- canonical brand stylesheet instances: **1 per audited case**;
- visible -> hidden mark regressions: **0**;
- duplicate visible mark regressions: **0**;
- console / page errors: **0**.

Controlled evidence artifact:

- name: `P120_WEB_GLOBAL_HEADER_PASS2_CODE_AUDIT`;
- artifact ID: `9935061904`;
- SHA-256: `decee0896abfae679d10b4790641daab7ba0f2f8e285e05c9dcb3016b37d7dd9`.

---

## 04 — Findings

| ID | Severity | Finding | Evidence / Interpretation | Disposition |
|---|---|---|---|---|
| P2-N01 | MEDIUM | Legacy `.brand-mark { display:none }` rules remain outside canonical CSS | Source scan found 7 files. Six are live RU/EN Main / Science / System HTML sources; one is `preview/v1.7.1/index.html`. The canonical ready-state cascade currently prevents the PASS 1 regression, but competing responsive authority remains in active source. | HARDEN before code freeze |
| P2-N02 | MEDIUM | Canonical brand CSS is installed by the brand runtime rather than being guaranteed before first paint | `ensureCss()` runs from the shared runtime; when runtime is loaded while the document is still loading, `start()` waits for `DOMContentLoaded`. Initial shell CSS therefore owns an avoidable pre-canonical paint window. | HARDEN before code freeze |
| P2-N03 | MEDIUM | Shared reconciliation observes the full body subtree while `patchResumeRail()` can write `innerHTML` on every reconciliation when session state is present | Most canonical patchers are guarded, but this write is not value-idempotent. The audit did not establish an infinite loop or blocking defect; it identifies avoidable mutation churn risk inside the shared runtime. | HARDEN / make value-idempotent |
| P2-N04 | LOW | A hidden -> visible orbit-mark phase still exists in a small part of the matrix | Observed in 3 / 16 cases: 390 `/extended/`, 390 `/why-p120/`, 1440 `/why-p120/`. No visible -> hidden regression occurred. PASS 1 gate currently constrains the original failure direction but not canonical first-paint visibility. | Extend lifecycle gate |
| P2-N05 | MEDIUM | Initial header ownership remains distributed across legacy page families | Main renders its own `.brand-button` shell; Explore owns `.explore-brand` + legacy language/theme controls; Founder owns `.creator-brand` / `.creator-tools`; the canonical runtime reconciles these after render. This architecture is currently stable but preserves multiple pre-canonical authorities. | Consolidation candidate; no redesign |

### P2-N01 exact source inventory

Active production sources containing the legacy hide rule:

- `index.html`;
- `en/index.html`;
- `science/index.html`;
- `en/science/index.html`;
- `system/index.html`;
- `en/system/index.html`.

Non-production / preview source:

- `preview/v1.7.1/index.html`.

The important distinction is that the canonical `p120-brand-system-v1.0.css` itself is clean; the stale rules survive in legacy shell sources.

---

## 05 — Architecture Assessment

### What is healthy

- The canonical brand layer has a clear semantic identity and stable markup.
- Runtime-level duplicate loading is guarded.
- Repeated reconciliation of already-canonicalized brand hosts is prevented by a data marker.
- The accepted Why P-120 dark header is scoped as a contextual surface treatment and does not constitute an alternate brand system.
- PASS 1 regression remains closed: no audited case returned to a text-only P-120 state after the orbit mark became visible.
- The current final rendered state is one header / one orbit mark, not a dual-header mount.

### What remains structurally weak

The implementation is still a **reconciliation architecture**, not yet a **single-render-authority architecture**. Multiple page families create their own initial shell and the canonical runtime normalizes them afterward. This is why obsolete responsive rules and legacy control clusters can remain dormant yet still influence first paint.

This is not a current user-visible blocker. It is technical debt with a credible regression path and should be removed before declaring the global shell code-frozen.

---

## 06 — Risk Classification

### Current production risk

**LOW–MODERATE / CONTROLLED.**

Reason:

- the original defect is fixed;
- PASS 1 mobile lifecycle gate is green;
- PASS 2 runtime multiplicity and error checks are green;
- the remaining issues are primarily first-paint authority, dormant legacy cascade, and mutation/reconciliation complexity.

### Regression risk if left indefinitely

**MODERATE.**

A future CSS breakpoint, page-local header change, loader-order change or new route could re-activate a legacy rule before or after canonical reconciliation. The current system has enough guards to be stable now, but more moving parts than necessary.

---

## 07 — Recommended Hardening Sequence

No hardening was executed in PASS 2. The following sequence is recommended as a separate authorized pass, preserving the exact accepted appearance:

1. remove live legacy `.brand-mark { display:none }` rules from Main / Science / System RU+EN sources;
2. make canonical header CSS available before first paint on all governed routes;
3. make `patchResumeRail()` value-idempotent and confirm that shared reconciliation does not self-amplify mutations;
4. stop instantiating legacy utility controls that are immediately superseded/hidden by the canonical layer where safe;
5. extend the lifecycle gate to fail on both visible -> hidden and material hidden -> visible first-paint transitions;
6. expand route coverage to the remaining governed public / legal / assessment shells before CODE FROZEN status;
7. re-run mobile + desktop + RU/EN header regression and compare accepted screenshots for zero visual drift.

Proposed next pass name:

**P-120 WEB — GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 2.1 — CODE HARDENING & SINGLE-AUTHORITY CONSOLIDATION**

This pass must remain presentation-preserving. No redesign is authorized by this recommendation.

---

## 08 — Final Gate

**VISUAL STATE:** CLOSED / PASS  
**PASS 1 ORIGINAL REGRESSION:** CLOSED / PASS  
**PASS 2 TECHNICAL AUDIT:** PASS WITH HARDENING NOTES  
**BLOCKING CODE DEFECT:** NONE FOUND  
**CODE FROZEN:** NO  
**NEXT ACTION:** OPTIONAL BUT RECOMMENDED PASS 2.1 HARDENING  
**SCIENTIFIC / MEASUREMENT / SCORING CHANGE:** NONE

The global header can remain in production in its current visual state. The next work, if authorized, should simplify ownership and first-paint behavior without changing the accepted P-120 public identity or page composition.
