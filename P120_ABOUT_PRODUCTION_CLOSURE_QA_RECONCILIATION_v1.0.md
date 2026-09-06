# P-120 — About P-120 Release Promotion & Production Closure
## QA Reconciliation Record

**Document code:** P120-WEB-ABOUT-PROD-CLOSE-QA-001  
**Version:** 1.0  
**Date:** 2026-09-06  
**Status:** PRE-MERGE QA RECONCILIATION / GREEN  
**Repository:** `unityplanet/p120-web`  
**PR:** #19  

## 1. Purpose

This record closes the QA-authority drift discovered after About P-120 Implementation PASS 1 was merged and deployed. The drift was confined to historical regression assumptions; no production About content, measurement, scoring, respondent runtime, Scientific Base, Why P-120, Creator, privacy/safety, or application code defect was established.

## 2. Production content baseline

About implementation production baseline:

`aa2d101f8bd0dcb12b033df8643756da8a6f22a1`

The current QA/governance reconciliation branch head validated below is:

`ab0e434c88be8862b18e4ccead98ddec38bc22fa`

## 3. Reconciled authority conflicts

### 3.1 Respondent session authority

Historical PASS 5.3 QA still expected `p120_web_prototype_v01` as an active shared respondent key.

Current authority is locale-isolated:

- RU: `p120_runtime_session_ru_v1`
- EN: `p120_runtime_session_en_v1`

The legacy key remains migration-source only and is not re-promoted.

### 3.2 Phone quick-theme authority

Historical PATCH 3 QA attempted to use the duplicate quick-theme selector at widths `<=430px`.

Current PASS 5.3.1 presentation authority intentionally hides that duplicate at phone widths while retaining the complete theme chooser in the Main mobile drawer. The reconciled gate now tests the drawer as the authoritative phone theme surface and the quick control at wider mobile geometry.

### 3.3 Editorial resume rail authority

Historical PASS 5.3 visual QA assumed `.editorial-resume-rail` existence was controlled by respondent-session state.

Current authority separates dormant Editorial state from canonical respondent-session resume authority. The reconciliation therefore treats Editorial rail presence as observational rather than as a respondent-session release gate.

### 3.4 Main navigation topology

Historical PASS 5.3 visual QA expected seven visible top-level Main destinations.

About P-120 Implementation PASS 1 intentionally promoted `О P-120 / About P-120` to a first-class public route. Current controlled topology is:

- Main: 8 visible top-level destinations;
- Extended/Together: 7 visible top-level destinations.

The historical 632-check suite is still executed. Only the 18 superseded `seven canonical top-level destinations` assertions for Main are adjudicated, and the replacement gate explicitly requires the 8/7 controlled topology and first-class About presence.

## 4. Final pre-merge QA matrix

All workflows on head `ab0e434c88be8862b18e4ccead98ddec38bc22fa` are green:

| Workflow | Run | Result |
|---|---:|---|
| P120 Actions Governance QA | `34022015821` | SUCCESS |
| P120 About P-120 Production Closure QA | `34022015813` | SUCCESS |
| WEB-EXPLORE PASS 5.3 Brand Unification QA | `34022015834` | SUCCESS |
| P120 WEB Main Quick Locale Theme PATCH 3 PASS 2 QA | `34022015810` | SUCCESS |

PASS 5.3 post-PASS3 visual/session reconciliation: `144` checks / `0` failures.

The historical PASS 5.3 visual suite is retained under the About-route reconciliation wrapper; non-About failures remain blocking.

## 5. Evidence artifacts

### About production closure

- artifact: `P120_ABOUT_PRODUCTION_CLOSURE_QA`
- ID: `9985816205`
- SHA-256: `dc959ef88f467c7584280fd652e14a61ff139c2a88c806bf7ded5550ebe2a891`

### PASS 5.3 reconciliation

- artifact: `P120_WEB_PASS53_QA_EVIDENCE`
- ID: `9985839533`
- SHA-256: `f95d8348f9bbfc1e752a990420a96f0f3a30da085ed02a7020e8fed237e7d613`

### Main quick locale/theme and cross-regression

- artifact: `P120_WEB_MAIN_QUICK_LOCALE_THEME_PATCH3_PASS2_QA`
- ID: `9985876076`
- SHA-256: `1c2a95e84df91d4fc81a62df0867effe9af341b3c5049177a6cd78c0cd40aa57`

### Header lockup evidence

- artifact: `P120_WEB_HEADER_LOCKUP_PASS1_QA_EVIDENCE`
- ID: `9985825790`
- SHA-256: `767471607e0bb7bd533afbda083caca79da774348d167edda9267ece2fe696bb`

## 6. Change declaration

Changed in PR #19:

- QA workflow authority;
- QA scripts and reconciliation logic;
- production-closure live probe;
- governance evidence only.

Unchanged:

- About RU/EN public content;
- Main public content;
- measurement;
- scoring;
- thresholds;
- item wording / IDs / order;
- respondent application runtime;
- respondent data schema;
- Supabase / RLS / auth;
- Scientific Base content;
- Why P-120 composition;
- Creator narrative;
- privacy/safety policy;
- Research Candidate scientific status.

## 7. Decision

**PRE-MERGE QA AUTHORITY RECONCILIATION: PASS / GREEN**  
**PR #19: MERGE AUTHORIZED**  
**NEXT GATE: MERGE → GITHUB PAGES DEPLOYMENT → POST-MERGE LIVE PRODUCTION CLOSURE → FINAL CLOSURE PACKAGE**
