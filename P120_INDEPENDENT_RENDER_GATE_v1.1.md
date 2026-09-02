# P120 Independent Render Gate v1.1

**Document code:** P120-WEB-QA-IRG-1.1  
**Date:** 2026-09-02  
**Status:** PASS / RENDER GATE GREEN  
**Scope:** public web routes, System runtime routing, responsive rendering, link/transition integrity, measurement payload parity, full-page visual evidence  
**Scientific / scoring authority:** OUT OF SCOPE / UNCHANGED

## 1. Gate result

The independent second render gate is GREEN.

- Production routes: **20**
- Render cases: **40** (desktop + mobile)
- Internal production link checks: **205**
- Critical transition checks: **14 / 14 PASS**
- Measurement parity: **180 / 180 PASS**
- Horizontal overflow: **0 px across all 40 cases**
- Local runtime errors: **0 across all 40 cases**
- Technical gate failures: **NONE**

Independent render workflow: `P120 Independent Render Audit v1.1`, run `33617553914`, conclusion `success`.
Evidence artifact: `P120_INDEPENDENT_RENDER_AUDIT_V1_1`, artifact `9841679172`.

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

Because browser-native `fullPage` capture does not faithfully represent scroll-driven / intersection-driven scenes, a second independent visual-evidence pass was executed using normal scrolling and viewport stitching.

- Routes: **20**
- Desktop stitched captures: **20**
- Mobile stitched captures: **20**
- Total visual captures: **40**
- HTTP failures: **0**
- Visual-evidence workflow result: **PASS**

Workflow: `P120 Independent Full-Page Stitch v1`, run `33618088080`, conclusion `success`.
Evidence artifact: `P120_FULL_PAGE_STITCHED_RENDERS_V1`, artifact `9841899635`.

## 4. Independent visual review

The EN System / questionnaire entry surface renders cleanly in both desktop and mobile evidence and is consistent with the controlled responsive architecture.

### Localization observation — separate gate

**LOC-EN-SCI-01 — OPEN:** `/en/science/` renders the English route, English shell/title and correct route assets, but the current full-page visual evidence still shows substantial Russian subsection copy inside the Scientific Base body.

This observation **does not invalidate the technical render gate** above: routing, loading, responsive geometry, transitions and measurement parity all pass. It does mean that **full bilingual-publication closure should not be declared yet** for the English Scientific Base. Resolution belongs to a controlled localization/source-reconciliation pass so scientific wording is not changed ad hoc.

## 5. Protected scope confirmation

- P-120 questionnaire wording: **UNCHANGED**
- Item IDs/order/response values: **UNCHANGED**
- Measurement payload: **180/180 parity retained**
- Scoring / interpretation logic: **UNCHANGED**
- Scientific evidence claims / constructs: **UNCHANGED by render corrections**
- Legal wording: **UNCHANGED**

## 6. Gate decision

**INDEPENDENT SECOND RENDER: PASS / GREEN.**  
**FULL-PAGE VISUAL EVIDENCE: PASS / CAPTURED.**  
**EN SCIENTIFIC BASE LOCALIZATION: OPEN SEPARATE CLOSURE ITEM.**

The web/runtime workstream may proceed beyond the second-render gate while keeping LOC-EN-SCI-01 explicitly open until controlled English Scientific Base reconciliation is completed.
