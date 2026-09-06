# P-120 — Homepage Implementation PASS 2C
## Graphite Contrast Correction Record

**Document code:** P120-WEB-HOME-IMP2C-CONTRAST-001  
**Version:** 1.0  
**Date:** 2026-09-06  
**Status:** CORRECTION CANDIDATE / QA REQUIRED  
**Parent implementation:** Homepage Implementation PASS 2  
**Production baseline:** `194bdf274f1a6012ef6c2e4b4f31e5f44b472055`

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
- Graphite headline luminance remains light.

This converts the visually discovered failure mode into a permanent release gate.

## 4. Governance disposition

Homepage PASS 2 remains the parent implementation. This correction is a controlled subordinate corrective pass and does not reopen the frozen Architecture narrative authority.

Production sealing remains **HOLD** until:

1. PASS 2C local/full regression is green;
2. the correction is merged;
3. GitHub Pages deploys the corrected main SHA;
4. live production contrast and full Homepage closure QA are green;
5. final Production Closure package is issued and sealed.
