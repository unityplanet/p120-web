# P-120 — About P-120 Implementation PASS 1
## Controlled Change Delta

**Document code:** P120-WEB-ABOUT-IMP1-DELTA-001  
**Version:** 1.0  
**Date:** 2026-09-05  
**Baseline:** `67d2ae422e422be20eae6bb086c51adf7de173bb`  
**Validated implementation head:** `35f64ce45e948340fa2aace14137b2ef13536860`  

## 1. Delta summary

Technical implementation delta at the validated head:

- changed files: `8`;
- additions: `740`;
- deletions: `4`;
- commits ahead: `12`;
- commits behind: `0`.

## 2. File-level implementation delta

| File | Status | Add | Del | Change class | Authority impact |
|---|---:|---:|---:|---|---|
| `.github/workflows/p120-about-pass1-qa.yml` | ADDED | 74 | 0 | QA / governance | NONE to scientific/measurement authority |
| `about/about-p120-v1.0.css` | ADDED | 36 | 0 | presentation | New About presentation only |
| `about/about-p120-v1.0.js` | ADDED | 28 | 0 | interaction shell | Theme/mobile-menu behaviour only |
| `about/index.html` | ADDED | 172 | 0 | public derivative content | New RU About derivative |
| `en/about/index.html` | ADDED | 172 | 0 | public derivative content | New EN About derivative |
| `p120-brand-system-v1.0.js` | MODIFIED | 44 | 4 | shared navigation runtime | About route/navigation only |
| `qa/about_pass1_render.mjs` | ADDED | 79 | 0 | QA | NONE to production authority |
| `qa/about_pass1_static.mjs` | ADDED | 135 | 0 | QA | NONE to production authority |

## 3. Shared runtime delta

The existing shared runtime change is limited to About route/navigation ownership:

- include `about` in page-kind resolution;
- create a first-class shared navigation item for About;
- route Main desktop About from the legacy anchor to the dedicated About page;
- add a Main mobile About discovery action;
- preserve locale counterpart routing for About;
- preserve current-page state for the About route.

No measurement, scoring, respondent persistence, submission, report-generation, Supabase, RLS or auth logic is added to this runtime delta.

## 4. Explicitly untouched source surfaces

No source-level diff exists in this PASS for:

- `index.html`;
- `en/index.html`;
- `why-p120/index.html`;
- `en/why-p120/index.html`;
- `creator/index.html`;
- `en/creator/index.html`;
- `science/index.html`;
- `en/science/index.html`;
- `system/index.html`;
- `en/system/index.html`;
- scoring/manifests/measurement keys;
- Supabase migrations or policies;
- submission intake;
- report calculation or interpretation logic.

## 5. Intentional behaviour changes

The following are deliberate and in-scope:

1. `About P-120 / О P-120` is now a first-class route;
2. shared desktop navigation resolves About to the new route;
3. Main desktop About control resolves to the new route;
4. Main mobile drawer exposes About explicitly;
5. RU/EN About locale switching resolves to counterpart About pages;
6. About page has its own responsive editorial presentation and mobile drawer;
7. About page participates in the existing theme model.

## 6. Non-changes

The following remain unchanged:

- measurement structure;
- score mathematics;
- thresholds;
- question/item content;
- response values;
- respondent-session data contract;
- scientific evidence ownership;
- Research Candidate status;
- privacy/safety policy;
- Why P-120 narrative;
- Creator narrative;
- Scientific Base content;
- System questionnaire source;
- production deployment state.

## 7. Closure classification

**Change class:** PUBLIC DERIVATIVE + PRESENTATION + NAVIGATION ROUTING + QA  
**Scientific-authority mutation:** NONE  
**Measurement/scoring mutation:** NONE  
**Production deployment mutation:** NONE  
**Release state:** CONTROLLED CANDIDATE / HELD PENDING PASS 10