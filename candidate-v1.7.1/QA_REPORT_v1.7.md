# QA REPORT — P-120 Web Editorial v1.7

## Final release status

**RELEASE / PASS**

Final corrective + shipping pass completed against the approved v1.7 Render-Led Visual System baseline. No additional aesthetic concepts were introduced during release closing.

## Absolute lock confirmation

`Measurement logic changed: NO`

`Scoring logic changed: NO`

`Question wording changed: NO`

`Scientific model changes: NONE`

`Locked blocks byte-identical: PASS`

The six frozen data/measurement/scoring source blocks are byte-identical to v1.6.1. Exact SHA-256 comparison is recorded in `qa/locked_blocks_v1.6.1_vs_v1.7.json`.

## Legacy selector audit

Systematic cleanup completed. The raw removal log contains 120 legacy theme selector groups: `qa/legacy_theme_rules_removed.txt`.

Detailed mapping is in `SELECTOR_AUDIT_v1.7.md`:

`legacy selector → affected component → replacement semantic token → verified themes`

Final result:

- pre-authoritative-v1.7 theme selectors remaining: **0**;
- accidental cross-theme inheritance: **0 known defects**;
- Ivory / Graphite / Dark Museum compatibility aliases are scoped per theme;
- CTA, questionnaire selected states, distinctions, central architecture, secondary cards, drawer/modal-like surfaces and focus/hover/active states use semantic roles.

## Theme parity matrix

| Theme | Device | Hero | Science | Questionnaire | Result |
|---|---|---:|---:|---:|---:|
| Ivory | Desktop | PASS | PASS | PASS | PASS |
| Graphite | Desktop | PASS | PASS | PASS | PASS |
| Dark Museum | Desktop | PASS | PASS | PASS | PASS |
| Ivory | Mobile | PASS | PASS | PASS | PASS |
| Graphite | Mobile | PASS | PASS | PASS | PASS |
| Dark Museum | Mobile | PASS | PASS | PASS | PASS |

### Theme-specific release observations

**Ivory:** warm publication canvas, structural frames remain visible, no generic white-SaaS collapse. PASS.

**Graphite:** remains a distinct medium-value editorial-studio theme; it does not collapse into Ivory or Dark Museum. PASS.

**Dark Museum:** no accidental light cards; cream/champagne appears only where intentional (primary CTA / selected response material); borders and muted text remain legible; orbital lines/nodes are visible without neon treatment; questionnaire active/selected states are consistent with the museum grammar. PASS.

## Desktop resolution matrix

All three themes were rendered and geometry/overflow checked at the required stages.

| Viewport | Ivory | Graphite | Dark Museum |
|---|---:|---:|---:|
| 1366×768 | PASS | PASS | PASS |
| 1920×1080 | PASS | PASS | PASS |
| 2560×1440 | PASS | PASS | PASS |
| 3840×2160 | PASS | PASS | PASS |

Additional horizontal-overflow checks:

| Viewport | Ivory | Graphite | Dark Museum |
|---|---:|---:|---:|
| 1440×900 | PASS | PASS | PASS |
| 3440×1440 | PASS | PASS | PASS |

For every overflow entry, `documentElement.scrollWidth == documentElement.clientWidth`.

Required key compositions were geometry-checked across 1366 / 1920 / 2560 / 3840 in all three themes:

| Composition | Result |
|---|---:|
| Hero | PASS |
| Manifestations | PASS |
| Nine Dimensions | PASS |
| Two Systems | PASS |
| A ≠ B | PASS |
| Act transition | PASS |
| Central P-120 architecture | PASS |
| Science | PASS |
| Report preview | PASS |
| Questionnaire | PASS |

## Mobile release gate

No mobile redesign was performed during final shipping.

- horizontal overflow: PASS;
- menu toggle touch target: **48 px**, PASS;
- bottom navigation minimum target: **59 px**, PASS;
- safe-area/mobile navigation implementation retained: PASS;
- drawer open/close: PASS in all three themes;
- bottom science navigation: PASS;
- questionnaire vertical degradation: PASS;
- decorative system does not block reading in reference captures: PASS.

## Functional gate

| Check | Status |
|---|---:|
| Navigation | PASS |
| Theme selector / actual theme switching | PASS |
| Preflight | PASS |
| Module transition into questionnaire | PASS |
| Questionnaire render | PASS |
| Response selection | PASS |
| Next-question progression | PASS |
| Progress UI | PASS |
| Local session logic retained | PASS |
| Science navigation | PASS |
| Mobile drawer | PASS |
| Mobile bottom navigation | PASS |
| Internal anchors | PASS |

## Technical shipping gate

| Check | Result |
|---|---:|
| Locked data/measurement/scoring blocks byte-identical v1.6.1 | PASS |
| Inline JS blocks checked by `node --check` | 7 / 7 PASS |
| CSS parser errors | 0 |
| Console errors | 0 |
| Page errors | 0 |
| Missing local assets | 0 |
| Broken internal anchors | 0 |
| Horizontal overflow | 0 known cases in required matrix |
| Static build checker | PASS |

Static checker: `qa/check_build.py`.

Browser QA results: `qa_visual/final_shipping/final_shipping_results.json`.

## Reference screenshot set

Required final references:

- `qa_visual/final_shipping/REF_desktop_1920x1080_ivory.png`
- `qa_visual/final_shipping/REF_desktop_1920x1080_graphite.png`
- `qa_visual/final_shipping/REF_desktop_1920x1080_museum.png`
- `qa_visual/final_shipping/REF_mobile_390x844_ivory.png`
- `qa_visual/final_shipping/REF_mobile_390x844_graphite.png`
- `qa_visual/final_shipping/REF_mobile_390x844_museum.png`
- `qa_visual/final_shipping/REF_questionnaire_1920x1080_ivory.png`
- `qa_visual/final_shipping/REF_questionnaire_1920x1080_graphite.png`
- `qa_visual/final_shipping/REF_questionnaire_1920x1080_museum.png`
- `qa_visual/final_shipping/REF_questionnaire_mobile_390x844_museum.png`

Resolution-matrix references are in `qa_visual/final_shipping/resolution_matrix/` for 1366×768, 1920×1080, 2560×1440 and 3840×2160 across all three themes.

Museum key-composition references cover Hero, Manifestations, Nine Dimensions, Two Systems, A ≠ B, Act transition, Central P-120 architecture, Report preview and Science.

## Known blockers

**NONE.**

No known theme-parity or release-blocking visual defect remains after the final selector cleanup and re-render.

## Release freeze

Visual system is frozen at this gate. Further aesthetic experimentation is outside v1.7 release scope.
