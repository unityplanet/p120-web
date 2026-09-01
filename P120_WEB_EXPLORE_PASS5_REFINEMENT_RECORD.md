# P-120 WEB-EXPLORE PASS 5 — Desktop Design Unification & Theme Reconciliation

**Document ID:** P120-WEB-EXP-P5-001  
**Artifact class:** source-adjacent implementation / QA record  
**Version:** v1.0  
**Status:** IMPLEMENTED · DESKTOP VISUAL ACCEPTANCE OPEN  
**Date:** 2026-09-01  
**Scope:** main-page Explore mega menu + `/extended/` + `/together/` + EN counterparts  
**Measurement authority:** unchanged / out of scope

> P120 governance note: this Markdown is a native repository implementation record. If promoted to a controlled narrative publication, it must be issued as the matching controlled release pair required by the current P120 documentation standard.

## 01 Trigger

Desktop screenshot review accepted the substantive design of both Explore pages and opened a focused unification pass for:

- one shared bubble-navigation grammar based on the main P-120 page;
- correction of the main-page Explore mega-menu geometry after the new dedicated routes became live;
- three public colour themes on both Explore page families;
- larger opening slogans closer to the main-page statement scale;
- additional visual reconciliation without redesigning accepted section architecture.

## 02 Implemented corrections

### P5-01 Shared bubble header

The dedicated Explore pages now use the main-page header grammar:

- optically larger P-120 identity mark;
- orbit-derived brand symbol;
- rounded central navigation bubble;
- rounded RU/EN control;
- dedicated theme bubble;
- stable dropdown geometry;
- restrained sticky scroll depth.

### P5-02 Main-page mega-menu stability

The main Explore mega menu now has a stable two-column geometry with fixed card rhythm and note measure. Obsolete reserved-state badges are visually suppressed because both dedicated destinations are live.

The first-paint bridge now activates and routes:

- `Хотите глубже?` → `/extended/`;
- `Мы вместе?` → `/together/`;
- EN equivalents → language-relative EN routes.

This removes the former post-load card movement caused by late reserved-state reconciliation.

### P5-03 Shared colour themes

The Explore pages now read and write the same public theme key as the main P-120 page:

`p120_web_theme_v16`

Supported themes:

- `ivory` — Светлая / Light;
- `graphite` — Графит / Graphite;
- `museum` — Музейная / Museum.

Theme changes update the page tokens, controls, active states and browser theme colour, and persist across navigation through local storage.

### P5-04 Theme-aware semantic surfaces

Theme mapping covers the principal Explore visual objects:

- page canvas and section bands;
- header and navigation bubble;
- mega-menu/dropdown;
- cards and research surfaces;
- orbit and dyadic objects;
- status pills and boundaries;
- reversed petrol/graphite sections;
- CTA and accent lines.

### P5-05 Opening statement scale

Desktop hero H1 was increased to a controlled maximum of `136px`, with a tighter display line-height and expanded left-column allowance. This brings `Хотите глубже?` and `Мы вместе?` closer to the main-page opening scale without collapsing the explanatory right column.

### P5-06 Preservation

The already accepted information architecture, section order, Prata body treatment, scientific caveats and lower-page compositions were not redesigned.

## 03 Source files

- `explore-unification-v1.0.css`
- `explore-system-v1.0.js` — shell v1.3
- `navigation-unification-v1.0.css`
- `founder-route-v1.1.js` — bridge v1.5

Existing PASS 4 files remain active underneath this refinement layer.

## 04 Preservation firewall

No changes were authorised or made to:

- questionnaire items;
- scoring keys, formulas or thresholds;
- report calculation;
- Supabase/persistence;
- scientific evidence status;
- dyadic privacy doctrine;
- validation status of candidate modules;
- frozen Why P-120 page composition.

## 05 Acceptance matrix

| Gate | Status |
|---|---|
| Shared desktop bubble navigation | IMPLEMENTED |
| Main mega-menu geometry stabilisation | IMPLEMENTED |
| Dedicated Explore theme control | IMPLEMENTED |
| Theme persistence with main page | IMPLEMENTED |
| Ivory theme mapping | IMPLEMENTED |
| Graphite theme mapping | IMPLEMENTED |
| Museum theme mapping | IMPLEMENTED |
| Larger hero slogans | IMPLEMENTED |
| RU/EN route preservation | IMPLEMENTED |
| GitHub Pages build | VERIFY FINAL HEAD |
| Desktop screenshot visual acceptance | OPEN |
| Mobile regression acceptance | DEFERRED TO MOBILE PASS |

## 06 Next gate

Desktop screenshot acceptance should now verify the main header/mega menu and both Explore hero/header states in all three themes. Only real presentation defects should be corrected before opening the mobile regression pass.
