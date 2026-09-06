# P-120 WEB-SCIENCE EXT PASS 4B — Renderer Activation

**Document ID:** P120-WEBSCI-EXT-004-PASS4B-REPORT  
**Version:** v0.6  
**Date:** 2026-09-06  
**Status:** PASS / CLOSED / CONTROLLED  
**Parent PASS:** WEB-SCIENCE EXT PASS 4 remains OPEN.

## Scope
PASS 4B activates the sealed PASS 4A RU/EN public-safe publication projection in the dedicated Scientific Base renderer on the controlled pre-production branch. It does not merge to production main and does not modify questionnaire content, measurement, scoring, thresholds, respondent sessions, persistence or report calculations.

## Renderer architecture
- Existing `p120-scientific-base-runtime-v1.0.js` Core logic is preserved byte-for-byte relative to the PASS 4A baseline and receives one exact additive loader only.
- New `p120-webscience-pass4b-renderer-v0.6.js` consumes the PASS 4A publication projection and Global Library projection.
- Fail-closed validation prevents activation if schema, visibility, E3/E4, RPE, DYADIC, cross-layer or Core45/Global70 contracts drift.
- RU and EN use the same projection identity and renderer logic.

## Activated surfaces
- Global scientific positioning.
- EXTENDED: COM-12, MOT-12, SELF-12 and minimal RPE-MOD projection.
- OUTCOMES: LIFE-12/18 projection.
- METHODS: E0-E4 evidence ladder and ten research-only cross-layer questions.
- LIBRARY: separate 25-reference extension layer is rendered while the Core 45-reference fixture remains intact.

## PASS 4C boundary
PASS 4B proves that the renderer can display the separate extension layer without rewriting Core. PASS 4C remains necessary to perform the full Core-45 / Global-70 library integration contract: unified library navigation, deduplication/reconciliation against Core identity, reference-role binding and final integrated-library QA.

## Scientific boundaries retained
COM-12, MOT-12, SELF-12, RPE-MOD and LIFE-12/18 remain `summary_only`. RPE detailed constructs and its detailed public reference payload remain suppressed. DYADIC remains hidden. E3 psychometric validation and E4 replication are not established. Cross-layer discriminant validity and incremental validity are not established; validated synergy and causal cross-layer effects remain unauthorized. No Extended super-score is created.

## QA
Independent RU/EN desktop/mobile browser gate: **198/198 PASS; failed = 0**.

## No-change declaration
Measurement = NONE · Scoring = NONE · Thresholds = NONE · Respondent sessions = NONE · Persistence = NONE · Report calculations = NONE · Production main = NONE · Scientific status upgrade = NONE.

## Verdict
**PASS / CONTROLLED RU-EN SCIENTIFIC RENDERER ACTIVATED / CLAIM BOUNDARIES PRESERVED / READY FOR PASS 4C.**

Next authorized gate: **WEB-SCIENCE EXT PASS 4C — Core-45 / Global-70 Library Integration**.
