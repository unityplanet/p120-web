# P120 Scientific Base Production Migration

**Document code:** P120-WEBSCI-PROD-MIG-001  
**Version:** 1.0  
**Date:** 2026-09-02  
**Status:** PASS / READY FOR CONTROLLED MERGE  
**Repository:** `unityplanet/p120-web`  
**Production baseline:** `54ac77854d511dbf625b65eaac627947bb9ced98`  
**Working branch:** `work/p120-scientific-base-production-migration`  
**Validated runtime head:** `1f103158c58ec56066044309ff82671628a856b9`

## 1. Gate purpose

This gate migrates the controlled Scientific Base information architecture into the stabilized P120 Web production runtime established by PASS 3.

The migration is an **integration operation only**. It does not perform a new scientific-source refresh, does not revise questionnaire content, and does not authorize new measurement or scoring claims.

## 2. Source lineage

The production migration preserves the controlled WEB-SCIENCE lineage:

- `P120-WEBSCI-EXT PASS 1 v0.1` — Extended Scientific Evidence Architecture / Website Information Model;
- `P120-WEBSCI-EXT PASS 2 v0.2` — source-reconciled data registry and non-visual prototype;
- `P120-WEBSCI-EXT runtime registry / adapter v0.3` — controlled candidate used as an implementation reference;
- current PASS 3 production baseline — runtime/session authority.

No historical experimental branch is treated as production authority by itself. The migration was rebuilt on the current PASS 3 baseline.

## 3. Production architecture

The Scientific Base now has one controlled public shell with the following families:

| Base | Production role | Public state |
|---|---|---|
| CORE | Existing deep P-120 scientific foundation | Published / default |
| EXTENDED | COM-12, MOT-12, SELF-12, RPE-MOD | Summary only |
| OUTCOMES | LIFE-12/18 outcome/spillover layer | Summary only |
| METHODS | Shared methods, validation and ethics | Published |
| LIBRARY | Shared Core scientific literature corpus | Published |
| DYADIC | Reserved future family | Hidden |

Only one deep base is active at a time. `CORE` remains the default. Shared validation, ethics and scientific literature remain common infrastructure rather than duplicated sub-base content.

## 4. Publication and claim boundaries

The production registry enforces:

- `measurement_mutation_allowed = false`;
- `scoring_mutation_allowed = false`;
- `session_storage_access = PROHIBITED`;
- no global Extended total;
- no module total for the migrated supplemental/outcome modules;
- unstable Extended/Outcomes material is exposed as controlled public summary only;
- DYADIC remains hidden until a separate public gate authorizes it.

Internal controlled status is not treated as equivalent to empirical validation, standardization or publication readiness.

## 5. Route integration

Production Science routes remain:

- `/science/` — RU Scientific Base;
- `/en/science/` — EN Scientific Base.

The migration adds a registry-driven Scientific Evidence Atlas and controlled base switching while preserving the existing Core Scientific Base visual grammar and deep content.

Supported controlled deep-link form:

`?science=extended&module=COM-12`

History/back navigation restores the active base/module state.

## 6. PASS 3 runtime protection

During migration an additional legacy-coupling condition was identified: the dedicated Science route copies still contained the historical pre-PASS3 key `p120_web_prototype_v01` inside dormant monolithic state logic.

This was reconciled without touching respondent sessions:

- RU dedicated Science state → `p120_science_page_state_ru_v1`;
- EN dedicated Science state → `p120_science_page_state_en_v1`.

The Scientific Base runtime itself has no `localStorage`, `sessionStorage` or `P120_SESSION_KEY` dependency.

The Science QA seeded and preserved all three protected respondent sources byte-for-byte:

- historical legacy migration source;
- RU respondent session;
- EN respondent session.

Therefore Scientific Base browsing cannot mutate PASS 3 respondent state.

## 7. Protected scientific/runtime scope

The migration materializer and QA enforce that the following remain unchanged from baseline except for the explicitly authorized Science-route loader/state-key delta:

- existing `window.P120_SCIENCE` Core scientific payload;
- 45-source Core reference corpus;
- Core evidence/validation/ethics content;
- `/system/` and `/en/system/` respondent runtimes;
- PASS 3 locale-specific session contract;
- submission intake and manual report handoff;
- root RU/EN Editorial routes;
- questionnaire wording;
- item IDs and order;
- coded response values;
- scoring mathematics and interpretation rules.

## 8. Science QA Gate

**Workflow:** `P120 Scientific Base Production QA Gate`  
**Run:** `33627407499`  
**Result:** PASS / SUCCESS  
**Checks:** `269 / 269`  
**Failures:** `0`  
**Evidence artifact:** `9845413539` — `P120_SCIENTIFIC_BASE_PRODUCTION_QA`  
**Artifact SHA256:** `7c1129b8f9253fdc1272639566322cc067ccbae95136cd792527afef1a6a761a`

The independent gate covered:

- both Science routes;
- RU/EN Scientific Base identity parity;
- desktop `1440 × 1000` and mobile `390 × 844`;
- CORE, EXTENDED, OUTCOMES, METHODS and LIBRARY states;
- 20 full-page screenshots;
- absence of visible Cyrillic on EN Science;
- no horizontal overflow in every tested state;
- no browser/runtime errors;
- local-anchor integrity;
- same-origin link integrity;
- RU ↔ EN Science-route language switching;
- deep-link and browser-history restoration;
- Extended summary-only publication ceiling;
- LIFE summary-only publication ceiling;
- DYADIC hidden boundary;
- respondent-session non-interference.

## 9. Manual visual evidence review

The complete 20-screenshot evidence set was reviewed as desktop and mobile contact sheets, with additional full-resolution inspection of representative RU/EN Core and Extended captures.

Observed result: no visible page truncation, section overlap, horizontal clipping, broken responsive stacking, or language contamination in the reviewed production candidate renders. The Atlas and active-base panels remain visually subordinate to the existing Scientific Base grammar rather than replacing it.

## 10. Controlled file delta

Authorized production-migration scope consists of:

- `science/index.html`;
- `en/science/index.html`;
- `P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json`;
- `p120-scientific-base-runtime-v1.0.js`;
- deterministic migration materializer/workflow;
- independent Science QA script/workflow;
- this controlled record.

No PASS 3 System/Editorial/scoring/session file is authorized for modification in this gate.

## 11. Gate decision

**SCIENTIFIC BASE PRODUCTION MIGRATION — PASS**  
**SCIENCE QA GATE — PASS**  
**Disposition:** READY FOR CONTROLLED MERGE TO `main`.

After merge, the Science QA Gate must run again on `main`, followed by successful GitHub Pages deployment verification. Production closure is not declared until both post-merge conditions are green.

## 12. Next controlled gate

After production closure, the next authorized runtime stage is:

**P120 Web Runtime Reconciliation — PASS 4**  
**Post-Science Integration Cleanup & Consolidation**

Design Unification Audit remains on HOLD until the post-Science cleanup/regression sequence is complete or a later Sequence Audit explicitly releases it.
