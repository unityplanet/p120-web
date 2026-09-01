# P-120 WEB-EXPLORE PASS 2 — Source Reconciliation & Implementation

**Document class:** operational implementation record  
**Date:** 2026-09-01  
**Status:** IMPLEMENTED / QA GATE PENDING LIVE MAIN CHECK  
**Authority:** `P120_WEB_Explore_System_Pages_Spec_v1.0_2026-09-01`

## 1. Scope

Implement the RU Explore-system routes defined by WEB-EXPLORE v1.0 without changing assessment, scoring, questionnaire, report calculation, persistence, Supabase or scientific measurement logic.

Canonical RU routes:

- `/extended/` — **Хотите глубже? / Extended Research System**
- `/together/` — **Мы вместе? / Dyadic Research Layer**

English parity is intentionally deferred. Existing EN behavior remains unchanged in this pass.

## 2. Source reconciliation findings

The live source contained three overlapping navigation layers:

1. `navigation-architecture-v2.js` — Explore map; `deeper` pointed to the in-page `extended-research-set`; `together` was reserved/disabled.
2. `extended-research-navigation-v1.0.js` — moved the full Extended Research Set into the home scroll plane and injected a second `Ещё глубже` navigation affordance.
3. `p120-public-runtime-v1.0.js` — generated runtime bundle that still embeds the legacy Extended navigation implementation, so updating the source module alone would not change the currently deployed root page.

`founder-shell-v2.js` also retained the legacy RU Extended anchor and reserved Together state.

## 3. Implemented architecture

### Dedicated pages

Added:

- `extended/index.html`
- `together/index.html`
- `explore-system-v1.0.css`
- `explore-system-v1.0.js`

Both pages use the P-120 Museum Teal editorial/scientific grammar, canonical P-120 font families, responsive desktop/mobile layouts, reduced-motion handling, semantic headings, noindex research-preview metadata and explicit scientific-boundary language.

### Extended Research System

The `/extended/` page exposes the current research architecture as five independent optional lenses:

- COM-12
- MOT-12
- SELF-12
- LIFE-12/18
- RPE-MOD as a visually distinct adaptive deep-dive branch

It explicitly preserves the core P-120 profile and prohibits an Extended Total, intimacy index or automatic compatibility score.

### Dyadic Research Layer

The `/together/` page exposes:

- Two Independent Systems model
- Four-Level Compatibility Doctrine: Structural Fit → Negotiated Fit → Experienced Dynamic Fit → Temporal Stability
- NEED → PERCEPTION → PROVISION → EXPERIENCE → EFFECT chain
- SCORE-D and DESIRE-D as separate dynamic research engines
- privacy ladder C1–C4
- future three-plane result architecture

It explicitly prohibits Couple Total, Compatibility %, similarity-as-compatibility and single-event overgeneralisation.

## 4. Runtime reconciliation

`extended-research-navigation-v1.0.js` now acts as the RU PASS-2 reconciliation adapter.

Because the generated public runtime still contains the legacy module, the adapter does **not** repeatedly delete legacy nodes. Instead it:

- keeps the legacy `#extended-research-set` node present but hidden/retired from the public scroll plane, preventing the bundled observer from recreating it;
- replaces the legacy home teaser once with the compact PASS-2 bridge;
- retires duplicate pre-v2 `Ещё глубже` desktop/mobile controls using hidden state rather than DOM deletion;
- activates Explore-map `Хотите глубже?` and `Мы вместе?` through capture-phase canonical routing;
- redirects the legacy chapter-navigation Extended target to `/extended/`;
- observes the complete public shell (`document.body`) so navigation injected outside `#app` is reconciled;
- exits immediately on EN routes.

`founder-route-v1.1.js` was advanced internally to v1.2 behavior and loads the reconciliation adapter after the generated public runtime. This ordering is deliberate: it lets PASS 2 become the final RU public-route authority without rewriting the large generated runtime bundle.

`founder-shell-v2.js` was reconciled to v2.1 behavior:

- RU `Хотите глубже?` → `../extended/`
- RU `Мы вместе?` → `../together/`
- RU Together is active
- EN legacy states are retained pending EN parity.

## 5. Scientific / runtime firewall

PASS 2 does not modify:

- P-120 item content;
- scoring keys, formulas or thresholds;
- assessment state machine;
- response persistence;
- Supabase/Postgres integration;
- report generation or interpretation authority;
- scientific validation state.

The new pages are research-preview/editorial surfaces only.

## 6. QA performed before main cutover

- JavaScript syntax: `explore-system-v1.0.js`, reconciliation adapter and Founder shell — PASS via `node --check` on implementation sources.
- CSS parse: PASS, zero parser errors on shared Explore stylesheet.
- HTML structure: PASS on both pages; one H1, one main landmark, no duplicate IDs.
- Required content gates: PASS for COM, MOT, SELF, LIFE, RPE-MOD, SCORE-D, DESIRE-D, four dyadic levels, C1–C4 and scientific-boundary blocks.
- Responsive rules: desktop/tablet/mobile breakpoints present; reduced-motion rule present.
- Repository diff firewall: changed files are limited to Explore presentation/navigation plus this implementation record; no assessment/scoring/data files changed.
- Branch relation: implementation branch is a clean fast-forward from the pre-pass main baseline (no divergence).

### Remaining release gate

After fast-forward to `main`, verify GitHub Pages HTTP availability and route rendering for `/extended/`, `/together/`, root Explore routing and `/creator/` Explore routing. Browser-level pixel-perfect review remains a subsequent visual QA pass; this record does not claim screenshot-based visual regression coverage.

## 7. Release decision

**PASS 2 implementation state:** READY FOR MAIN CUTOVER after branch diff review.  
**EN parity:** deferred.  
**Measurement/scoring authority:** unchanged.
