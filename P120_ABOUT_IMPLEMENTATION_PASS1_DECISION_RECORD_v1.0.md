# P-120 — About P-120 Implementation PASS 1
## Decision Record

**Document code:** P120-WEB-ABOUT-IMP1-DR-001  
**Version:** 1.0  
**Date:** 2026-09-06  
**Decision status:** CONTROLLED / EFFECTIVE FOR RELEASE PROMOTION  

## Decision

Implementation PASS 1 remains **CLOSED / GREEN** at the technical layer. The former source-authority release hold is now cleared because `P120-ARCH-SYS-001 v1.0` completed **PASS 10 — Final Reconciliation / Freeze Recommendation** with status `PASS / CLOSED / CONTROLLED / SEALED`, decision `FREEZE APPROVED`, and authority state `FROZEN / CANONICAL SYSTEM AUTHORITY / EFFECTIVE`.

The About P-120 derivative is therefore authorized to proceed from controlled candidate to **controlled merge and production-release verification**, subject to a green current-head QA run and post-merge production regression.

## Source-authority binding

Final PASS 10 package SHA-256:

`7e389b53a4575df2f3214a3050d029134562d9e9a19514230ecdc51822a22dcd`

Controlled source package files: `63`.

The implementation branch now contains an executable source-authority gate:

- `qa/about_pass1_source_authority_gate.json`
- `qa/about_pass1_source_authority_gate.mjs`

The dedicated workflow requires this PASS 10 gate to pass before derivative/render regressions proceed.

## Current-head release QA

Validated branch head:

`b130e5fa782dbfeecfa7fea2a5479a9a66ea3245`

Dedicated workflow:

- `P120 About P-120 Implementation PASS 1 QA`
- run `34020619512`
- run number `#15`
- conclusion: **SUCCESS**

Release QA evidence:

- PASS 10 frozen source-authority gate: **PASS**;
- derivative conformance and local links: **PASS**;
- responsive/render regression: **PASS**;
- shared-header code-integrity regression: **PASS / 0 blocking findings**;
- shared-header hardening regression: **PASS / 0 failures**;
- Actions Governance QA: **SUCCESS**.

Evidence artifact:

- `P120_ABOUT_IMPLEMENTATION_PASS1_QA`
- artifact ID `9985385180`
- digest `sha256:c407fce0fec3972138b4c31b40c94531d89684efe2530afc95d4683deb4512f8`

## Explicit adjudications

### D01 — About becomes a first-class route

**APPROVED.**

`/about/` and `/en/about/` are the controlled About P-120 destinations.

### D02 — Legacy Main About anchor

**SUPERSEDED AS PRIMARY ABOUT DESTINATION.**

The Main-page section remains part of the homepage narrative, but the global About navigation item no longer treats `#why-important` as the canonical About surface.

### D03 — Why P-120 and About P-120 relationship

**SEPARATE AUTHORITIES / COMPLEMENTARY ROLES.**

Why P-120 retains origin/rationale narrative authority. About P-120 carries system/architecture explanation. Implementation PASS 1 does not merge these roles.

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

### D10 — Source-authority release hold

**CLEARED.**

PASS 10 is complete and frozen. No material About correction is required by the final source reconciliation.

### D11 — Merge disposition

**AUTHORIZED AFTER GREEN CURRENT-HEAD QA.**

The current-head release QA is green. PR #18 may be marked ready and merged under controlled release procedure.

### D12 — Production disposition

**NOT YET CLOSED.**

Production closure requires successful merge, GitHub Pages deployment, and post-merge production regression/route verification.

## Reopen conditions

Implementation PASS 1 may be reopened only for one of the following:

1. a reproducible implementation/render/navigation defect is discovered;
2. a shared-runtime regression attributable to this delta is demonstrated;
3. a governance/safety/scientific overclaim is identified in the derivative;
4. `P120-ARCH-SYS-001` is formally reopened and issues a new controlled source correction affecting About.

Pure preference changes or unrelated site redesign are not valid reasons to reopen this PASS.

## Final decision

**TECHNICAL IMPLEMENTATION: ACCEPTED / CLOSED**  
**SOURCE AUTHORITY: PASS 10 FROZEN / BOUND**  
**DERIVATIVE: RELEASE-PROMOTION AUTHORIZED**  
**MERGE: AUTHORIZED**  
**PRODUCTION: PENDING MERGE / DEPLOYMENT / POST-MERGE REGRESSION**  
**NEXT GATE: ABOUT P-120 RELEASE PROMOTION & PRODUCTION CLOSURE**
