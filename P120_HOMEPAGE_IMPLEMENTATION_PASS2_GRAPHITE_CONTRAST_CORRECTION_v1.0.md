# P-120 — Homepage Implementation PASS 2C
## Graphite Contrast Correction Record

**Document code:** P120-WEB-HOME-IMP2C-CONTRAST-001  
**Version:** 1.0  
**Date:** 2026-09-06  
**Status:** CORRECTION CANDIDATE / FULL QA GREEN / FINAL CURRENT-BASE RECONCILIATION RUNNING  
**Parent implementation:** Homepage Implementation PASS 2  
**Original production baseline:** `194bdf274f1a6012ef6c2e4b4f31e5f44b472055`  
**Latest concurrent main observed before final current-base rerun:** `83bc0829d5d7371eedc9e810259f29b1c35b696c`

## 1. Finding

Post-merge production-closure visual inspection identified a material presentation defect in the newly added Homepage controlled-compression card under the **Graphite** theme.

The Main `#why-important` scene exposes a light local `--surface` token while Graphite supplies a light foreground. The PASS 2 card inherited both, producing a light card surface with light text. Automated structural/render QA remained green because it verified geometry, content and runtime behaviour but did not include a foreground/background contrast assertion for the new derivative surface.

**Finding ID:** `HOME-P2-VIS-001`  
**Severity:** MATERIAL PRESENTATION / RELEASE BLOCKER  
**Scientific/measurement impact:** NONE  
**Respondent-data impact:** NONE

## 2. Correction

The Graphite variant of `.p120-homepage-pass2` is bound explicitly to the Graphite canvas/ink semantic authority:

- card surface → `--canvas-elevated` with controlled fallback;
- foreground → `--ink-primary` with controlled fallback;
- border polarity follows Graphite foreground.

No RU/EN narrative copy, routing, measurement, scoring, respondent state, About, Why P-120, Scientific Base, System, Supabase/Auth/RLS or report logic is changed.

## 3. QA hardening

`qa/homepage_pass2_render.mjs` is extended with executable contrast regression:

- architecture headline contrast ratio >= 4.5;
- architecture body effective contrast ratio >= 4.5, including element opacity;
- Graphite panel background luminance remains dark;
- Graphite headline luminance remains light;
- CSS color parsing covers both `rgb()/rgba()` and Chromium `color(srgb ...)` computed styles.

The static delta firewall is reconciled so PR-scope authorization is evaluated from the current merge-base rather than a historical release baseline; frozen source-authority hashes remain independently enforced.

This converts both the visual failure mode and the stale-baseline QA failure mode into permanent release gates.

## 4. Verified pre-merge evidence

Workflow run `34026960111` on branch head `98e7c9a70e26ba53e8db91e04f3df9000920dda2` completed **SUCCESS**.

A subsequent current-base reconciliation run `34029125431` on branch head `167c1b1eb7127ab90f8856181a127088c34e0c85` also completed **SUCCESS** against virtual merge commit `59f6c09fb8cc922f588346203b05fc5795fb6efb`, which combined the PASS 2C candidate with then-current `main` `9bd3c1366f69f02617612169ffbd69ebcf8f5100`.

All blocking stages passed in that current-base run:

1. JavaScript syntax preflight;
2. frozen source-authority gate;
3. controlled-compression static gate;
4. existing build/static conformance;
5. Homepage responsive/render regression including contrast assertions;
6. PASS 5.3 post-PASS3 visual/session reconciliation;
7. PASS 5.3 current About-route topology reconciliation;
8. Main locale/theme regression;
9. mobile chapter regression;
10. mobile session-resume regression;
11. global header integrity;
12. global header hardening;
13. footer presentation regression.

During that run, the separate Scientific Base production workstream advanced `main` once more to `83bc0829d5d7371eedc9e810259f29b1c35b696c`. The concurrent delta is explicitly documented as deployment-path / Actions-governance reconciliation with no Homepage, measurement, scoring, respondent-session or report-calculation mutation. Nevertheless, P-120 release discipline requires the PASS 2C candidate to receive one final PR run against that exact combined base before merge. This update triggers that final reconciliation run.

## 5. Governance disposition

Homepage PASS 2 remains the parent implementation. PASS 2C is a controlled subordinate corrective pass and does not reopen the frozen Architecture narrative authority.

`HOME-P2-VIS-001` is **CORRECTED IN CANDIDATE** but is not CLOSED at production level until the final current-base run, merge, deployment and live-production verification complete.

Production sealing remains **HOLD** until:

1. final current-base PASS 2C full regression is green;
2. the correction is merged;
3. GitHub Pages deploys the corrected final `main` SHA;
4. live production contrast and full Homepage closure QA are green;
5. final Production Closure package is issued with manifest, SHA-256 and reproducibility record;
6. final status is recorded as `PASS / CLOSED / CONTROLLED / SEALED`.
