# P-120 WEB-SCIENCE EXT PASS 4E — Browser / Responsive / Typography Science QA

**Document ID:** P120-WEBSCI-EXT-004-PASS4E-REPORT  
**Version:** v0.9  
**Date:** 2026-09-06  
**Status:** PASS / CLOSED / CONTROLLED  
**Parent PASS:** WEB-SCIENCE EXT PASS 4 remains OPEN.

## Scope
PASS 4E is the production-grade visual QA gate for the controlled Science stack established in PASS 4A–4D. It tests dedicated RU/EN Science surfaces across Core, Extended, Outcomes, Methods and the integrated Global-70 Library. It does not alter scientific claims, evidence states, measurement, scoring, thresholds, respondent data, persistence or report calculations.

## Diagnostic phase
The pre-correction diagnostic probe executed **70 rendered states**: 2 languages × 7 viewport classes × 5 active Science bases. It established that page-level responsive containment was already stable (zero document-level horizontal overflow and zero runtime-error runs), while identifying **five** presentation blockers requiring bounded correction:
1. long Global-70 evidence-role metadata chips could exceed the 320px content width;
2. several Russian H2 headings exhibited narrow-phone min-content clipping;
3. functional Science labels requested IBM Plex Sans weights 750–900 although the controlled web font request provides real weights only through 700;
4. selected mobile/tablet Science controls were below the 44px touch-target floor;
5. selected reader-facing Core prose remained at 11px on narrow phones.

The diagnostic evidence is bound to GitHub Actions run `34021476116`, artifact `9985649056`, digest `1ed9c04b407f82f5a1b6a63ccac5645e5f97511e821104664a59259c82484f9d`.

## Controlled presentation correction
PASS 4E adds `p120-webscience-pass4e-visual-v0.9.css` through an exact additive loader after the sealed PASS 4C library runtime. The stylesheet is scoped to `.science-page` and performs presentation-only corrections:
- maps functional IBM Plex Sans emphasis to real 600/700 weights, eliminating synthetic-weight dependence;
- assigns technical identifiers to IBM Plex Mono;
- adds min-content containment and narrow-phone H2 sizing;
- wraps long Global-70 role identifiers safely;
- establishes 44px mobile/tablet targets for Science subnavigation, Library filters and DOI controls;
- establishes a 12px narrow-phone floor for selected reader-facing scientific prose;
- preserves bottom-navigation reachability with dedicated Science bottom clearance.

## Post-gate manual visual reconciliation
A manual review of the generated narrow-screen evidence identified one additional presentation defect that the first numerical gate did not capture: on RU 320px and EN 390px Science views, horizontally compressed subnavigation pills could keep the page within the viewport while their labels visually collided. This finding did **not** change scientific content or evidence state, but it prevented final sealing.

The final correction makes mobile/tablet Science subnavigation a non-shrinking horizontally scrollable pill row and preserves each label inside its own control. The automated gate was extended with a per-state label-containment and adjacent-overlap assertion, so this defect can no longer pass merely because document-level horizontal overflow is zero.

## Final browser / responsive / typography gate
The final gate re-runs the complete **70-state matrix** and verifies document containment, canonical font inventory and computed-family use, real-weight conformance, IBM Plex Mono technical notation, critical H2 clipping, Global-70 chip containment, responsive control targets, **Science subnavigation label containment**, mobile prose floor, paragraph leading, sticky geometry, fixed-bottom-navigation reachability and runtime-error absence.

Result: **952/952 PASS; failed = 0**.

Upstream scientific and integration regressions were also re-run unchanged: PASS 4A projection 2970/2970; PASS 4C Global-70 browser 88/88; PASS 4D static 448/448; PASS 4D rendered parity 448/448.

## Package seal control
The final package builder excludes `PACKAGE_CONTENT_SHA256SUMS.txt` from its own checksum set, verifies every listed package file, verifies ZIP integrity and verifies the external ZIP sidecar before artifact publication. This closes the earlier self-reference defect in the package checksum ledger without changing any scientific or presentation content.

## No-change declaration
Scientific content = NONE · Evidence-state upgrade = NONE · Measurement = NONE · Scoring = NONE · Thresholds = NONE · Respondent sessions = NONE · Persistence = NONE · Report calculations = NONE · Production main = NONE.

## Verdict
**PASS / RESPONSIVE SCIENCE MATRIX CONTROLLED / TYPOGRAPHY CONFORMANCE ESTABLISHED / GLOBAL-70 NARROW-VIEW CONTAINMENT ESTABLISHED / MANUAL VISUAL RECONCILIATION CLOSED / NO SCIENTIFIC STATUS UPGRADE.**

Next authorized gate: **WEB-SCIENCE EXT PASS 4F — Closure Reconciliation**.
