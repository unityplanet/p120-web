# P-120 — WEB DESIGN RECONCILIATION PASS 4

## Homepage Visual Reconciliation

**Document code:** `P120-WEB-DESIGN-REC-PASS4-HOME`  
**Version:** `1.0`  
**Date:** `2026-09-07`  
**Workstream:** `P120 — WEB DESIGN RECONCILIATION / SITEWIDE VISUAL SYSTEM`  
**Upstream Design-Unification baseline:** `WEB DESIGN RECONCILIATION PASS 3A.1`  
**Upstream candidate head:** `9597b819679baa261f63d91a34102c7e7a207e45`  
**HG-CGA protected live authority:** `PASS 1I / 8756e23e2d2831e58e4a36aa5ec8718985ba3999 / HG-CGA-WEB-HR-MB-001 v1.0`  
**Implementation branch:** `work/web-design-pass4-homepage-visual-reconciliation`  
**Status:** `IMPLEMENTED / QA IN PROGRESS`  

---

## 1. Governing objective

Reconcile the P-120 public homepage from an accumulated long-form container into a structured semantic entrance to the research architecture.

The homepage is no longer treated as the place where every explanatory, scientific, example and runtime surface must be reproduced.

Its governing function becomes:

> **30 seconds: understand what P-120 is.  
> 2–3 minutes: understand the architecture and choose a depth.  
> Deeper reading: move to dedicated authority surfaces.**

This implements the Kuzmich Test as homepage information architecture rather than as a copy-only correction.

---

## 2. Source problem

The pre-PASS-4 `renderHome()` assembled the public homepage as:

- 10 editorial chapters;
- 4 acts;
- multiple editorial interludes;
- five-layer insert;
- future-report showcase;
- 10 synthetic profile examples;
- scientific-evidence insert;
- endnote / disclaimer;
- read-only session continuation rail.

The accumulated material was individually useful but produced a homepage that acted simultaneously as:

- semantic entrance;
- system explainer;
- research catalogue;
- example library;
- science teaser;
- respondent-runtime doorway.

PASS 4 changes the role of the homepage rather than merely reducing margins or hiding cards.

---

## 3. Canonical PASS 4 scene architecture

The public homepage is now composed as eight controlled scenes:

1. **Human Entry** — human-readable semantic entrance;
2. **Definition** — “not one test; a system of studies”;
3. **Human Atlas** — five-layer research field;
4. **System Depth** — responses → patterns → relationships → contradictions/alignment → integrated interpretation;
5. **Route Map** — dedicated P-120 surfaces instead of reproducing them on Home;
6. **One Synthetic Example** — one illustrative profile only;
7. **Research Boundary** — what P-120 studies and what it does not claim;
8. **Entry Point** — start / understand first / resume saved research.

Canonical sequence:

`HUMAN ENTRY -> DEFINITION -> HUMAN ATLAS -> SYSTEM DEPTH -> ROUTE MAP -> ONE SYNTHETIC EXAMPLE -> RESEARCH BOUNDARY -> ENTRY POINT`

---

## 4. Design grammar

The PASS 4 homepage applies the sitewide governing ideology:

**museum editorial × scientific atlas × controlled digital installation**.

Primary visual rules:

- section planes before cards;
- large editorial hierarchy;
- one bounded reading column where prose is required;
- ruled atlas structures for research layers;
- deep petrol plane for system-depth explanation;
- warm canvas for the human example;
- pale research-boundary plane;
- restrained pill actions;
- no generic dashboard grid;
- no nested card architecture;
- no ornamental science effects without semantic function.

Typography roles remain canonical:

- Noto Serif Display — display authority;
- Noto Serif — research / explanatory reading;
- Prata — controlled human/literary statement;
- IBM Plex Sans — functional UI;
- IBM Plex Mono — technical metadata.

---

## 5. Public / Instrument firewall

PASS 4 does **not** rewrite `index.html` runtime logic or the native `system/` respondent surface.

Implementation is an additive public-composition adapter:

- `homepage/homepage-design-reconciliation-pass4.js`;
- `homepage/homepage-design-reconciliation-pass4.css`.

The existing `mobile-session-resume-v1.0.js` presentation seam is used only to load the new Main composition.

The following session core remains byte-preserved relative to the PASS 3A.1 baseline:

- session parsing;
- eligibility calculation;
- response counting;
- session keys;
- mobile resume control creation;
- resume target;
- reconcile logic.

PASS 4 may **read** resume eligibility through `P120MobileSessionResume.getEligibility()`.

PASS 4 may not write or mutate session state.

---

## 6. Controlled compression disposition

### Retained on homepage

- clear human semantic entrance;
- concise P-120 definition;
- five-layer architecture;
- conceptual explanation of deeper integration;
- one illustrative synthetic example;
- scientific / interpretive boundary;
- direct routes to deeper surfaces;
- start and read-only resume routes.

### Removed from homepage composition

- 10-chapter linear editorial journey;
- four-act dramaturgy;
- 10-profile synthetic example library;
- duplicated detailed Science material;
- duplicated long-form system explanations;
- detailed material already governed by About / Why / Creator / Science / Extended / Together / HG-CGA.

The material remains in its dedicated authority surfaces or historical source implementation; PASS 4 does not delete research content authority.

---

## 7. Route map

PASS 4 routes the reader into dedicated surfaces:

### Understand

- About P-120;
- Why P-120?;
- From the Creator.

### Go deeper

- Scientific Base;
- Extended Research;
- HG-CGA / Decision Research.

### Relationship

- Together? / dyadic research.

HG-CGA is routed only to the final PASS 1I live surface. PASS 4 does not modify its frozen semantic architecture.

---

## 8. Example authority

Only one synthetic example remains on the public homepage.

It is explicitly labelled:

- synthetic;
- illustrative;
- not a validated typology;
- not a real participant result.

The example demonstrates cross-layer reading rather than presenting a classification system.

---

## 9. Research-boundary authority

The homepage explicitly distinguishes:

### P-120 studies

- patterns and relationships among layers;
- differences, tensions and conditions;
- testable research hypotheses;
- structured interpretation under explicit boundaries.

### P-120 does not claim

- diagnosis;
- determination of human value;
- proof of compatibility from one profile;
- reduction of a complex life to one score.

`Research Candidate · 18+` remains visible.

---

## 10. QA contract

PASS 4 cannot close unless all of the following pass on the exact final head:

1. JavaScript syntax preflight;
2. canonical scene-order gate;
3. RU/EN semantic parity gate;
4. read-only session firewall / byte-preservation gate;
5. changed-file scope gate;
6. HG-CGA PASS 1I non-mutation gate;
7. System / Science / Why non-mutation gate;
8. RU/EN wide render;
9. RU/EN mobile render;
10. no horizontal overflow;
11. one synthetic example only;
12. no old act/example-library DOM in reconciled Home;
13. read-only resume session byte preservation;
14. no PASS 4 root on native System;
15. inherited Main locale/theme regression;
16. inherited mobile chapter regression;
17. inherited mobile session-resume regression;
18. frozen Global Header PASS 2.1 regression;
19. original Global Header PASS 1 regression;
20. footer project-prefix regression;
21. Actions Governance QA.

---

## 11. Current disposition

**Implementation:** complete for candidate v1.0.  
**Production promotion:** not authorised by this document alone.  
**Closure:** pending exact-head QA evidence.
