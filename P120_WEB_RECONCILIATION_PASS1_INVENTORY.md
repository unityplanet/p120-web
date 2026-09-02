# P120 WEB RECONCILIATION PASS 1 — AUTHORITY & DEPENDENCY INVENTORY

**Document ID:** P120-WEB-REC-PASS1-INVENTORY  
**Version:** 1.0  
**Date:** 2026-09-02  
**Status:** CONTROLLED INVENTORY / NO DELETIONS AUTHORIZED  

## A. Route authority inventory

| Route | Intended authority | Current implementation state | PASS 1 classification |
|---|---|---|---|
| `/` | RU Editorial | Monolithic editorial page with production public runtime and legacy embedded assessment source retained as rollback history | CANONICAL ROUTE / MIXED SOURCE HISTORY |
| `/system/` | RU System respondent runtime | Canonical respondent route derived from previous monolith; frozen instrument and app runtime present | CANONICAL RU SYSTEM |
| `/en/` | EN Editorial | English public localization layer over editorial source | CANONICAL EN EDITORIAL / LOCALIZATION-LAYER DEPENDENT |
| `/en/system/` | EN System respondent runtime | Generated from RU `/system/`; EN item binding before app runtime plus post-render UI translator | ACTIVE EN SYSTEM / ARCHITECTURAL RECONCILIATION REQUIRED |

## B. Measurement authority

**Shared scientific identity:** item ID + response value.

Current controlled scored corpus:

- SAT24
- P72
- P72D
- AO12
- SOMA24
- 180 unique scored item IDs

Classification: **CANONICAL SHARED MEASUREMENT CONTRACT**.

The RU and EN respondent texts are presentation realizations and must not become separate scoring authorities.

## C. Active English instrument localization layer

Known active EN System localization components:

- `localization/p120-en-items-sat24-v1.0.js`
- `localization/p120-en-items-p72-q01-q48-v1.0.js`
- `localization/p120-en-items-p72-q49-q72-v1.0.js`
- `localization/p120-en-items-p72d-v1.0.js`
- `localization/p120-en-items-ao12-v1.0.js`
- `localization/p120-en-items-soma24-v1.0.js`
- `localization/p120-en-pass4-overrides-v0.4.js`
- `p120-en-instrument-bind-v0.4.js`

Classification: **ACTIVE / PROTECTED UNTIL PASS 2–3 REASSEMBLY**.

`p120-en-instrument-bind-v0.4.js` correctly binds English text through existing item IDs while retaining response values/scoring. This behavior is the architectural pattern to preserve.

## D. Active post-render language mutation

`p120-en-system-runtime-v0.4.js` translates rendered Russian DOM strings into English and installs a `MutationObserver`.

Classification: **ACTIVE LEGACY BRIDGE / REMOVE ONLY AFTER PASS 2 NATIVE EN UI EXISTS**.

It must not be deleted during PASS 1 because `/en/system/` currently depends on it for respondent UI language.

## E. English System build path

`.github/workflows/p120-en-system-build-v0.4.yml` currently:

1. reads `system/index.html`;
2. changes page language/meta/base path;
3. injects EN item files and binding;
4. retains the inherited RU application/runtime source;
5. appends the post-render EN System translator;
6. writes `en/system/index.html`.

Classification: **ACTIVE BUILD AUTHORITY / REPLACE IN PASS 2, NOT DELETE IN PASS 1**.

## F. Shared storage/session dependency

Known respondent runtime storage key:

`p120_web_prototype_v01`

It is used by the current System application and auxiliary transport layers. RU and EN currently resolve to the same browser storage object.

Classification: **ACTIVE SHARED STATE / RECONCILE IN PASS 3**.

PASS 3 requirement: retain language-independent response coding while separating locale-specific route/UI session state sufficiently to prevent route/language jumps.

## G. Submission and report transport

Known auxiliary layers include:

- `p120-submission-intake-v1.0.js`
- `manual-report-handoff-v1.0.js`

Both read the shared storage state. Their current English route detection was designed around `/en/` and requires explicit reconciliation for `/en/system/`.

Classification: **ACTIVE SHARED TRANSPORT / ROUTE-DETECTION DEFECT / PASS 3**.

## H. Public/editorial runtime coupling

`p120-production-public-runtime-v1.1.js` contains multiple generated/integrated editorial navigation layers, including runtime-created Russian labels and `MutationObserver` logic.

Examples include:

- Extended Research Set navigation;
- chapter navigation;
- mobile navigation integration;
- dynamically inserted editorial controls.

Classification: **CANONICAL FOR EDITORIAL UNTIL DEPENDENCY SPLIT / PROHIBITED AS SYSTEM OWNER AFTER PASS 2**.

PASS 2 must prevent editorial runtime ownership from leaking into `/system/` and `/en/system/`.

## I. Workflow/patch accumulation

The repository contains numerous historical `apply-*`, reconciliation, migration, typography, navigation, science, founder and localization workflows/scripts. Their presence is not itself proof of dead code.

PASS 1 classification model:

- **CANONICAL** — directly owns current production behavior/source;
- **SHARED** — consumed by more than one canonical route;
- **ROUTE-SPECIFIC** — intentionally owned by a single route/language;
- **LEGACY-CANDIDATE** — apparently superseded but deletion not yet proven safe;
- **ARCHIVE-CANDIDATE** — historical implementation material not expected to run;
- **UNKNOWN-DEPENDENCY** — must not be touched until reference tracing is complete.

No workflow or script is deleted in PASS 1.

## J. Scientific Base protection

Two distinct states must remain separated:

1. **current production Scientific Base** — remains untouched during PASS 1–3;
2. **new Scientific Base release candidate** — protected candidate planned for controlled migration after route/runtime stabilization and before dead-code cleanup.

Classification for the new Scientific Base: **PROTECTED RELEASE CANDIDATE / NOT YET PRODUCTION AUTHORITY**.

PASS 1 does not silently assume that every file containing `science` belongs to the new candidate. Exact candidate artifact identification must be recorded before PASS 1 closure if repository evidence allows it; otherwise it remains an explicitly protected unresolved inventory item.

## K. PASS 2 handoff constraints

PASS 2 is authorized to change route/runtime assembly only after this inventory closes. It must preserve:

- all approved texts;
- all existing design/CSS presentation unless a route defect requires a controlled equivalent correction;
- 180/180 item identity;
- item order/module order;
- response coding;
- scoring behavior;
- existing Scientific Base content until its separate migration gate.

The required architectural change is ownership separation, not redesign.
