# P-120 — About P-120 Implementation PASS 1
## Decision Record

**Document code:** P120-WEB-ABOUT-IMP1-DR-001  
**Version:** 1.0  
**Date:** 2026-09-05  
**Decision status:** CONTROLLED / EFFECTIVE FOR IMPLEMENTATION CLOSURE  

## Decision

Close Implementation PASS 1 as **GREEN at the technical implementation layer**, while retaining the About P-120 derivative as a **controlled candidate** and holding merge/release pending Architecture / About the System PASS 10.

## Rationale

The implementation has met its technical, derivative-conformance and regression obligations:

- RU and EN About routes exist as separate first-class surfaces;
- the page preserves the intended system-level explanatory role;
- the shared public navigation now points About to the dedicated route rather than the legacy Main anchor;
- dedicated conformance and render QA is fully green;
- existing shared-header integrity and hardening gates are green/non-blocking;
- Actions governance is green;
- protected scientific/measurement/respondent source surfaces were not modified.

However, implementation authority and source narrative authority are different layers. PASS 10 remains the designated source-authority freeze and therefore retains precedence over final release.

## Explicit adjudications

### D01 — About becomes a first-class route

**APPROVED.**

`/about/` and `/en/about/` are the controlled About P-120 destinations.

### D02 — Legacy Main About anchor

**SUPERSEDED AS PRIMARY ABOUT DESTINATION.**

The Main-page section remains part of the homepage narrative, but the global About navigation item no longer treats `#why-important` as the canonical About surface.

### D03 — Why P-120 and About P-120 relationship

**SEPARATE AUTHORITIES / COMPLEMENTARY ROLES.**

Why P-120 retains origin/rationale narrative authority. About P-120 carries system/architecture explanation. Implementation PASS 1 must not merge these roles.

### D04 — From the Creator relationship

**SEPARATE AUTHORITY.**

Founder/Creator narrative remains untouched and is not absorbed into About.

### D05 — Scientific Base relationship

**NO SCIENTIFIC AUTHORITY TRANSFER.**

About may summarize controlled scientific-status boundaries but does not become the source of Scientific Base claims, measurement definitions or validation evidence.

### D06 — System / respondent runtime relationship

**NO MEASUREMENT OR RESPONDENT AUTHORITY TRANSFER.**

About contains no scoring keys, respondent persistence logic, RLS/auth logic, questionnaire authority or report-calculation authority.

### D07 — Self-governance wording

**APPROVED ONLY AS QUALIFIED CONCEPT.**

`self-governing research architecture / самоуправляемая исследовательская архитектура` is permitted only where autonomy is explicitly rejected and scientific validity is not inferred from governance quality.

### D08 — Computational framing

**APPROVED.**

Founder-governed computational research environment may explicitly acknowledge modern computational and language-model capabilities. Final problem formation, architecture judgement and scientific/governance responsibility remain human.

### D09 — Fixed productivity multiplier

**PROHIBITED.**

No fixed `×100`, `hundreds of times`, or other quantitative productivity multiplier may be presented as established without a defined metric and evidence.

### D10 — Release disposition

**HOLD.**

Technical PASS closure does not convert PR #18 into merge-ready production work. PASS 10 remains mandatory before merge/release authorization.

## Reopen conditions

Implementation PASS 1 may be reopened only for one of the following:

1. PASS 10 issues a controlled correction affecting the About derivative;
2. a reproducible implementation/render/navigation defect is discovered;
3. a shared-runtime regression attributable to this delta is demonstrated;
4. a governance/safety/scientific overclaim is identified in the derivative.

Pure preference changes or unrelated site redesign are not valid reasons to reopen this PASS.

## Final decision

**TECHNICAL IMPLEMENTATION: ACCEPTED / CLOSED**  
**DERIVATIVE: CONTROLLED CANDIDATE**  
**MERGE: NOT YET AUTHORIZED**  
**PRODUCTION: UNCHANGED**  
**NEXT AUTHORITY GATE: P120-ARCH-SYS-001 PASS 10**