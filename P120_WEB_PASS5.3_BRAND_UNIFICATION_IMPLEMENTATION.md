# P120 — WEB-EXPLORE PASS 5.3
## Sitewide Brand Lockup, Bubble Navigation & Naming Canon
### IMPLEMENTATION / QA / DEPLOYMENT RECORD

**Document ID:** P120-WEB-PASS5.3-IMPL  
**Version:** 1.0  
**Status:** PASS  
**Date:** 2026-09-01  
**Workstream:** P120 — Web Brand Unification  
**Authority:** P120 Unified Internal Documentation Standard v2.0 + accepted WEB-EXPLORE PASS 5.3 continuation authority  
**Release implementation SHA:** `8d12177401f038651e878490c03335a876711ef8`  
**Scientific impact:** NONE / PRESENTATION ONLY

---

## 1. Scope

PASS 5.3 reconciles the public P-120 web environment into one visual and semantic brand architecture without redesigning the accepted editorial chapters and without modifying measurement, scoring, persistence, privacy doctrine, safety logic, scientific claims, construct boundaries or backend authority.

The implemented public canon is:

- master brand: **P-120**;
- RU master descriptor: **ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА**;
- EN master descriptor: **RESEARCH ARCHITECTURE**;
- public canonical form RU: **P-120 — Исследовательская архитектура**;
- public canonical form EN: **P-120 — Research Architecture**;
- “system / система” remains subordinate functional terminology, not the public master descriptor.

---

## 2. Source reconciliation

| AREA | ACTUAL SOURCE AUTHORITY FOUND | PASS 5.3 DECISION |
|---|---|---|
| Logo | Main application DOM in `index.html`: `.brand-mark` → `.brand-orbit` + `.brand-node-a` + `.brand-node-b`, plus P-120 lockup | Reused as canonical sitewide mark; no screenshot/CSS approximation introduced |
| Main header | Main `topbar / topbar-inner` geometry and production public styles | Preserved as optical reference |
| Main navigation | Main `.topnav` plus `navigation-architecture-v2.css/js` and `navigation-unification-v1.0.css` | Canonical bubble / Explore navigation family |
| Mega menu | `navigation-architecture-v2.js` + `navigation-unification-v1.0.css` | One Story / Next two-column grammar; active destinations live |
| Theme state | `p120_web_theme_v16` | Frozen as one sitewide storage key |
| Explore pages | `explore-system-v1.0.css/js` + refinement/unification/UHD layers | Editorial dramaturgy preserved; shell reconciled into brand family |
| Founder | `founder-shell-v2.*` + Founder editorial layers | Editorial body preserved; duplicate utility grammar removed |
| Why P-120 | `why-p120/index.html`, `why-p120/why-p120.css/js` | Frozen ACT composition preserved; original dark contextual header restored under canonical geometry |
| Legal layer | `p120-legal-runtime-v1.0.js` + `p120-legal-v1.0.css` | Legal authority/text preserved and integrated into one public footer plane |
| UHD | Main staged responsive model + Explore UHD reconciliation | Structural stage scales; prose measure remains constrained |

Finding: filenames alone were not treated as authority. Final cascade/runtime ownership was determined before mutation.

---

## 3. Component decisions

### 3.1 Canonical brand lockup

A single public lockup is now propagated through the shared brand layer:

`orbit mark + P-120 + localized master descriptor`.

The main-page orbit markup is the source form. Founder, Why, Explore and legal shells no longer maintain competing public marks as their final visible brand identity.

### 3.2 Header / bubble navigation

Main, Extended, Together, Founder, Why and support/legal surfaces share the same public navigation language and optical component family. The top-level order remains:

1. О P-120 / About P-120
2. Почему P-120? / Why P-120?
3. Уникальность / What makes it different
4. Что покажет / What it shows
5. Отчёт / Report
6. Научная база / Scientific Base
7. Исследовать / Explore

The Explore mega menu remains a stable two-column Story / Next architecture.

### 3.3 Language and theme controls

RU/EN switching preserves conceptual route parity for supported destinations. Theme state is shared through `p120_web_theme_v16` and persists across page families.

The Founder legacy utility cluster is suppressed after the canonical cluster is installed. Why retains its Start action while redundant legacy language/theme controls are suppressed.

### 3.4 Why P-120 contextual dark header

A regression introduced during brand reconciliation had converted the original black Why P-120 header into a light strip. PASS 5.3.1 restores the original dark editorial plane while retaining the canonical logo, bubble geometry, route structure, RU/EN control and theme control.

This is a contextual surface treatment, not an alternate brand system.

---

## 4. Saved-session information bubble

The main-page saved-research bubble was upgraded without changing storage or assessment behavior.

It now derives presentation metadata from the already-existing `window.P120_INSTRUMENT` and local session state (`p120_web_prototype_v01`) and shows, where available:

- overall completion percentage;
- queued segment ordinal, e.g. `Сегмент 02 / 05`;
- queued segment identifier/name, e.g. `P-72 v4.0`;
- human-readable next question within that segment;
- instrument identity `P-120`;
- session identifier, e.g. `P120-XXXXXX`;
- human-readable resume action, e.g. `Продолжить исследование · вопрос 1`.

Raw consumer-facing item codes such as `Q01` are not reintroduced.

No session schema, response payload, persistence rule or scoring behavior was changed.

---

## 5. Footer reconciliation

The former main/Why footer stack contained multiple independently rendered layers. PASS 5.3.1 resolves the visible public result into one deliberate footer plane.

For main / Founder / Why / legal-runtime pages, the canonical footer now contains:

- canonical P-120 brand block;
- restrained chapter navigation;
- the existing legal notice without semantic alteration;
- existing Intellectual Property / Terms / Privacy links;
- existing sandbox/legal environment note.

The local legacy `.home-footer` and `.wp-footer` are suppressed when superseded by the canonical legal footer.

Why P-120 receives the same footer architecture on a dark editorial surface.

Extended / Together do not instantiate the full legal runtime. Their existing compact Explore footer is therefore retained as the single chapter footer and only its master brand wording is canonicalized; it is not removed in favor of a nonexistent second footer.

---

## 6. Theme reconciliation

Canonical theme family remains:

- Light / Ivory;
- Graphite;
- Museum.

Museum continues to derive from the main P-120 semantic family, including the established ivory canvas, restrained museum greens, graphite ink, teal accent and warm secondary accent. Page dramaturgy is not flattened into one background surface.

Why P-120 intentionally retains a dark header even when the persisted site theme is Museum because that header is part of the accepted ACT I dark editorial composition.

---

## 7. UHD reconciliation

The public shell is verified across distinct desktop regimes rather than treated as one generic desktop breakpoint:

- 1366;
- 1440;
- 1920;
- 2560;
- 3440;
- 3840.

The structural stage, header relationships, navigation and large objects scale across QHD/UHD while long-form prose remains bounded by readable measures.

---

## 8. Preservation firewall

PASS 5.3 / 5.3.1 did **not** authorize or modify:

- questionnaire item content;
- item order;
- response scales;
- scoring keys or formulas;
- thresholds;
- report calculation;
- psychometric architecture;
- construct boundaries;
- Supabase schema or migrations;
- RLS;
- participant/session persistence semantics;
- submission payload;
- safety rules;
- privacy doctrine;
- scientific claims or validation status;
- SCORE-D logic;
- DESIRE-D logic;
- RPE-MOD research authority.

Frozen Why P-120 body authorities `why-p120/index.html`, `why-p120/why-p120.css`, and `why-p120/why-p120.js` were not mutated by this correction pass.

---

## 9. Change matrix

| FILE | REASON | CHANGE CLASS | SCIENTIFIC IMPACT | QA |
|---|---|---|---|---|
| `p120-brand-system-v1.0.css` | Sitewide canonical brand/header/nav/theme/stage surface | PRESENTATION | NONE | PASS |
| `p120-brand-system-v1.0.js` | Canonical brand/nav/theme/language/footer runtime; saved-session presentation reconciliation | PRESENTATION / RUNTIME UI | NONE | PASS |
| `navigation-unification-v1.0.css` | Main bubble/mega-menu geometry and 1366 descriptor preservation | PRESENTATION | NONE | PASS |
| `founder-route-v1.1.js` | Load canonical brand bridge in main/founder routing environment | PRESENTATION LOADER | NONE | PASS |
| `explore-system-v1.0.js` | Canonical brand loader + safe preservation/canonical naming of compact Explore footer | PRESENTATION | NONE | PASS |
| `p120-legal-runtime-v1.0.js` | Load canonical public brand bridge on legal/support surfaces | PRESENTATION LOADER | NONE | PASS |
| `p120-pass53-visual-corrections-v1.0.css` | Screenshot-driven saved bubble, unified footer, Founder control cleanup, Why dark-header restoration | PRESENTATION | NONE | PASS |
| `qa/pass53_brand_unification.mjs` | Desktop/UHD/three-theme brand acceptance | QA | NONE | PASS |
| `qa/pass53_1_visual_corrections.mjs` | Targeted regression evidence for reported screenshots | QA | NONE | PASS |
| `.github/workflows/qa-web-explore-pass53.yml` | Controlled CI gate and artifact collection | QA / CI | NONE | PASS |

---

## 10. QA evidence

### 10.1 Full PASS 5.3 matrix

GitHub Actions run: `33539860505`  
Job: **Desktop UHD / three-theme visual acceptance**  
Result: **SUCCESS**

Evidence:

- **632 checks**;
- **632 PASS**;
- **0 FAIL**;
- **64 screenshots**;
- desktop widths: 1366 / 1440 / 1920 / 2560 / 3440 / 3840;
- themes: Museum / Ivory / Graphite;
- principal pages: Main / Extended / Together;
- support checks: Creator / Why P-120 / Privacy / Terms / Intellectual Property, RU and EN;
- navigation, mega menu, language parity, theme persistence, focus/keyboard and console/page-error checks included.

### 10.2 Screenshot-driven PASS 5.3.1 regression set

Same GitHub Actions run: `33539860505`  
Result: **SUCCESS**

Evidence:

- **29 targeted checks**;
- **29 PASS**;
- **0 FAIL**;
- saved-session state reproduced at 13% with segment transition into P-72;
- queued segment identifier confirmed;
- P-120 instrument and session identifier confirmed;
- raw `Q01` leakage prohibited and verified absent from the consumer bubble;
- main single-footer state confirmed;
- Founder canonical control cluster / legacy-control suppression confirmed;
- Why P-120 dark header confirmed;
- Why legacy footer suppression + canonical dark footer confirmed;
- no JavaScript console/page errors.

Controlled evidence artifact:

- Artifact ID: `9813217753`
- SHA-256: `9018cf7b5a1415fcac847678340c1b1edd1be0ab44c49260382e0cb09c7c871c`

Visual evidence was reviewed for the main saved-session bubble, main footer, Founder header/footer and Why P-120 header/footer after automated acceptance.

---

## 11. Deployment verification

Release implementation SHA: `8d12177401f038651e878490c03335a876711ef8`

GitHub Pages workflow run: `33539860264`

- `build` — **SUCCESS**
- `deploy` — **SUCCESS**
- `report-build-status` — **SUCCESS**
- GitHub Pages deployment ID: `6206996607`

Deployment was therefore verified at the Pages workflow level and not inferred from the existence of a commit.

---

## 12. Acceptance adjudication

**WEB-EXPLORE PASS 5.3 — PASS**

Acceptance basis:

- one canonical public P-120 lockup;
- one master public descriptor per locale;
- canonical bubble/navigation family;
- stable Explore mega menu;
- route-preserving RU/EN controls;
- shared theme state;
- main / Extended / Together stage compatibility through UHD;
- saved-session bubble now identifies queued segment and test/session context;
- mixed main footer layers consolidated;
- Founder header/footer reconciled;
- Why P-120 original black header restored;
- Why footer reconciled without touching frozen ACT composition;
- scientific/scoring/backend firewall preserved;
- automated QA 0 failures;
- GitHub Pages build and deployment verified successful.

The public target is now treated as one P-120 visual and semantic architecture expressed through different editorial chapters, rather than multiple loosely related microsites.
