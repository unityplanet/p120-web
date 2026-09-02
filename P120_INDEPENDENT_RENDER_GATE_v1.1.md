# P120 Independent Render Gate v1.1

**Document code:** P120-WEB-QA-IRG-1.1  
**Date:** 2026-09-02  
**Status:** PASS / RENDER GATE GREEN / LOCALIZATION CLOSURE PASS  
**Scope:** public web routes, System runtime routing, responsive rendering, link/transition integrity, measurement payload parity, full-page visual evidence, EN Scientific Base localization closure  
**Scientific / scoring authority:** OUT OF SCOPE / UNCHANGED

## 1. Gate result

The independent second render gate is GREEN after final EN Scientific Base localization reconciliation.

- Production routes: **20**
- Render cases: **40** (desktop + mobile)
- Internal production link checks: **205**
- Critical transition checks: **14 / 14 PASS**
- Measurement parity: **180 / 180 PASS**
- Horizontal overflow: **0 px across all 40 cases**
- Local runtime errors: **0 across all 40 cases**
- Technical gate failures: **NONE**

Final independent render workflow: `P120 Independent Render Audit v1.1`, run `33620267232`, conclusion `success`.
Evidence artifact: `P120_INDEPENDENT_RENDER_AUDIT_V1_1`, artifact `9842738333`, archive SHA-256 `e546a5f81d6fc3a1340348aea3ec50350ddb7fd58b046ca9331c2dc7590f61ca`.

## 2. Critical transition closure

All controlled transitions passed in desktop/mobile coverage, including:

- RU Editorial → RU System
- EN Editorial → EN System
- RU / EN `?start=1` entry
- RU System ↔ EN System language routing
- RU / EN System → matching-language Editorial home
- RU / EN mobile Start → matching-language System
- RU System ↔ EN System mobile language routing through the real mobile drawer
- RU / EN saved-state Editorial guard

## 3. Full-page visual evidence

Browser-native `fullPage` capture is not sufficient evidence for scroll-driven / intersection-driven scenes, so the final visual-evidence pass used normal scrolling and viewport stitching.

- Routes: **20**
- Desktop stitched captures: **20**
- Mobile stitched captures: **20**
- Total visual captures: **40**
- HTTP failures: **0**
- Document height / stitched height parity: **PASS across all 40 captures**
- Visual-evidence workflow result: **PASS**

Final workflow: `P120 Independent Full-Page Stitch v1`, run `33620288794`, conclusion `success`.
Evidence artifact: `P120_FULL_PAGE_STITCHED_RENDERS_V1`, artifact `9842746864`, archive SHA-256 `6f18a101a76a9e43a1049e757927ec314b6746d2dcea5a85d03580326198acda`.

## 4. EN Scientific Base localization closure

**LOC-EN-SCI-01 — CLOSED / PASS.**

A dedicated controlled localization application layer was bound to `/en/science/`. It reuses the authorized RU→EN scientific translation dictionary and controlled formulaic UI bindings. The correction is localization/presentation-only and does not modify scientific constructs, evidence claims, measurement content, scoring, or interpretation rules.

Dedicated localization closure workflow: `P120 EN Science Localization Gate v1`, run `33620158188`, conclusion `success`.
Evidence artifact: `P120_EN_SCIENCE_LOCALIZATION_GATE_V1`, artifact `9842581145`, archive SHA-256 `f9564733555cdd6189a6a72259b23c7094ca77b239fc58d1f8bf322e9fef57ce`.

Closure evidence:

- `/en/science/` desktop: **HTTP 200 / lang=en / 0 px overflow / 0 visible Cyrillic / 0 Cyrillic UI attributes / 0 page errors / 0 bad responses / PASS**
- `/en/science/` mobile: **HTTP 200 / lang=en / 0 px overflow / 0 visible Cyrillic / 0 Cyrillic UI attributes / 0 page errors / 0 bad responses / PASS**
- English scientific PDF binding: **PASS** (`p120-scientific-concept-paper-en-v1.2.pdf`)
- Localization marker: **en-v1.0 / PASS**

The EN System / questionnaire entry surface also remains clean in desktop and mobile evidence.

## 5. Protected scope confirmation

- P-120 questionnaire wording: **UNCHANGED**
- Item IDs/order/response values: **UNCHANGED**
- Measurement payload: **180/180 parity retained**
- Scoring / interpretation logic: **UNCHANGED**
- Scientific evidence claims / constructs: **UNCHANGED by render/localization corrections**
- Legal wording: **UNCHANGED**
- RU Scientific Base source: **UNCHANGED**

## 6. Gate decision

**INDEPENDENT SECOND RENDER: PASS / GREEN.**  
**FULL-PAGE VISUAL EVIDENCE: PASS / CAPTURED.**  
**EN SCIENTIFIC BASE LOCALIZATION: CLOSED / PASS.**  
**RU/EN PUBLIC PRESENTATION RENDER CLOSURE: PASS.**

The controlled web/runtime branch is cleared for merge and production deployment, subject only to the repository merge/deployment controls. No scientific or scoring unfreeze is implied by this decision.
