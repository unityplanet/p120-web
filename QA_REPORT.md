# P-120 Web Editorial — Extended Research Set Section v1.0
## QA Report

Date: 2026-08-31

## Release gate summary

**Section integration: PASS**

**GitHub Pages deployment: PASS**

**Measurement / scoring / questionnaire / current report changes: NONE**

The release is additive. The integration commit adds the Extended Research Set stylesheet link, static section markup and presentation-only placement script. It does not delete or rewrite existing P-120 core code. The subsequent mobile UI commit adds one external presentation-only script reference.

## Source integrity

Confirmed:
- exactly one `#extended-research-set` section in the integrated source;
- exactly one `data-p120-extended-research="v1.0"` stylesheet reference;
- independent COM / MOT / SELF / LIFE module metadata present once each;
- `P120_TOTAL_EXTENDED` absent;
- no new scoring identifier, compatibility percentage, archetype or global total introduced;
- no prohibited public claims such as “validated”, “полная модель личности”, “sexual intelligence”, or a formula for ideal relationships were introduced by the section source.

Integration commit: `7680df54fe42e0a5263df01b9f1bf030baaa696d`.
Responsive UI integration commit: `433b7c8131269195ba5c18c28d56e26f8346255f`.

## Syntax / parser QA

- Extended section CSS parser errors: **0**.
- Existing inline executable JavaScript blocks in the packaged integrated `index.html`: **syntax PASS**.
- Extended placement JavaScript: **syntax PASS**.
- Extended responsive details JavaScript: **syntax PASS**.
- Hosting ZIP integrity: **PASS** in the build workflow.

## Visual / responsive section QA

The Extended Research Set was rendered as an isolated self-contained section against the production CSS at the following widths:

- 1366
- 1440
- 1920
- 2560
- 3440
- 3840
- tablet 1024 / 768
- mobile 430 / 390 / 360

Themes checked:
- Ivory
- Graphite
- Museum

Results:
- horizontal overflow: **0 px** at all checked widths/themes;
- central `Core → optional lenses` atlas remains a single architectural composition at desktop widths;
- tablet simplifies the atlas to core + 2×2 directions;
- mobile removes decorative orbit connections and stacks the chapter in reading order;
- module summaries exceed the current 44–48 px touch-target direction;
- `prefers-reduced-motion` disables section transitions;
- Museum reads as cream / stone / grey-green with structural teal rather than a dark global panel;
- LIFE is visually differentiated as an outcome/spillover layer;
- SELF uses a more exploratory dashed frame treatment.

The mobile presentation-only script closes module `<details>` at ≤680 px so COM/MOT/SELF/LIFE open by tap rather than presenting four long expanded modules by default. Desktop keeps module content expanded for the atlas composition.

## Scientific boundary QA

The section explicitly states that:
- Extended Research Set is a separate Post-Pilot Research architecture;
- modules are not part of the current frozen P-120 measurement model;
- modules do not currently alter P-120 results;
- cross-layer relationships are hypotheses until empirical testing;
- no fictional Couple Score is created.

PASS.

## Existing-system regression boundary

The section-specific integration does not modify:
- questionnaire items or wording;
- scoring functions;
- result calculation;
- archetypes;
- compatibility logic;
- existing report engine;
- current scientific-status wording;
- existing theme switcher logic.

Because the integration diff is additive-only, existing core code is preserved. GitHub Pages completed successfully after integration.

A full end-to-end respondent traversal was not re-run inside the isolated visual QA harness; the regression guarantee for this pass is based on additive-only source diff plus unchanged existing core code, not a new measurement/functionality release.

## Placement behavior

The section source is static in `index.html` for content availability. A presentation-only placement script locates the current scientific chapter and moves the Extended Research Set immediately before it. If the dynamic scientific chapter is not available at first DOM pass, a short MutationObserver waits for it; fallback placement is before the site footer/end of main content.

Intended reading order:

`основной P-120 → результат/report experience → Extended Research Set → scientific/closing layer`

## Final acceptance

PASS for the additive section release if the public reading remains:

> P-120 уже даёт самостоятельный многослойный профиль.
> Extended Research Set позволяет посмотреть ещё глубже.

The section does not imply that the current P-120 is incomplete without COM / MOT / SELF / LIFE.
