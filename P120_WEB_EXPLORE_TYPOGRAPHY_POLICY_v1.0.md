# P-120 WEB EXPLORE TYPOGRAPHY POLICY v1.0

**Document ID:** P120-WEB-TYP-EXP-001  
**Document class:** Controlled Web Design Standard  
**Version:** 1.0  
**Status:** FROZEN FOR CURRENT EXPLORE IMPLEMENTATION  
**Applies to:** `/extended/`, `/together/`, future Explore-system pages derived from the same shell  
**Reference architecture:** P-120 «От Создателя» typography grammar  
**Effective date:** 2026-09-01

---

## 1. Purpose

This standard fixes the typography ownership model for the P-120 Explore layer so that future pages may expand without introducing a competing visual language.

The Explore layer MUST use the same five-family canonical system already established by the P-120 publication design and the «От Создателя» page.

No sixth editorial, UI, code or display family is permitted in controlled production output.

---

## 2. Canonical font families

### 2.1 Noto Serif Display — display / statement authority

**Role:** primary editorial display voice.

Use for:
- page H1;
- major H2/H3;
- chapter / section openers;
- large statements and flash lines;
- major result or doctrine statements;
- large editorial questions.

Do not use for:
- technical metadata;
- pills/status labels;
- long scientific paragraphs;
- code or IDs.

### 2.2 Noto Serif — scientific / explanatory reading authority

**Role:** primary research and long-form explanatory voice.

Use for:
- scientific explanation;
- construct boundaries;
- module descriptions;
- methodology-oriented prose;
- evidence and research caveats;
- explanatory section introductions;
- long-form text where semantic precision is more important than literary tone.

This remains the default body family for Explore pages.

### 2.3 Prata — secondary human / literary voice

**Role:** selective human/editorial narrative only.

Use sparingly for:
- hero narrative copy;
- reflective human-facing passages;
- selected editorial transitions;
- emotionally human but non-technical prose.

Prata MUST NOT become the default body font of research sections.

Prata MUST NOT be used for:
- tables;
- labels;
- navigation;
- module codes;
- scientific caveats;
- metadata;
- technical notation.

### 2.4 IBM Plex Sans — functional / research interface grammar

**Role:** navigation, metadata and system language.

Use for:
- navigation;
- eyebrow labels;
- buttons;
- status chips;
- module status;
- captions;
- interface microcopy;
- functional labels;
- research metadata.

### 2.5 IBM Plex Mono — notation / technical grammar

**Role:** machine-like identifiers and explicit technical notation.

Use for:
- module IDs;
- construct codes;
- equations;
- process-chain notation;
- privacy levels such as C1–C4;
- technical tags and version identifiers.

---

## 3. Explore page ownership map

| Surface | Required family |
|---|---|
| H1 / major H2 / major H3 | Noto Serif Display |
| Major statement / flash | Noto Serif Display |
| Scientific body | Noto Serif |
| Construct / boundary explanation | Noto Serif |
| Hero human narrative | Prata |
| Optional literary transition | Prata |
| Navigation / controls | IBM Plex Sans |
| Eyebrows / labels / status | IBM Plex Sans |
| Module metadata | IBM Plex Sans |
| IDs / codes / process notation | IBM Plex Mono |

---

## 4. Visual hierarchy rule

The P-120 Explore layer uses a three-voice reading hierarchy:

**Noto Display = what the page declares**  
**Noto Serif = what the research explains**  
**Prata = where the page speaks humanly**

IBM Plex Sans and IBM Plex Mono are not narrative voices. They are the functional and technical grammar around the narrative.

---

## 5. Conformance rules

1. Font substitution to an unapproved named family is a typography defect.
2. Inter, Arial, Calibri, Georgia, Times New Roman, JetBrains Mono and other named non-canonical families MUST NOT be introduced into controlled Explore CSS.
3. Generic terminal fallbacks (`serif`, `sans-serif`, `monospace`) may remain only as browser failure fallbacks; their actual activation in production should be treated as a QA warning/blocker depending on severity.
4. Browser `font-synthesis` should be disabled where practical to avoid synthetic bold/italic variants.
5. Prata usage must remain visibly secondary and sparse.
6. Scientific meaning must never depend on typographic styling alone.

---

## 6. Current implementation binding

The current implementation is bound through:

- `explore-system-v1.0.css` — PASS-2 base visual system;
- `explore-refinement-v1.0.css` — PASS-3 typography and visual refinement layer;
- `explore-system-v1.0.js` — shared shell loader and mobile navigation control.

The PASS-3 refinement does not alter measurement, scoring, questionnaire, report-engine, persistence or scientific-content logic.

---

## 7. Change control

Any future typography change affecting the five canonical family roles requires a controlled design-system revision.

Local component fixes may adjust size, weight, line height, measure or spacing without revising this policy, provided family ownership does not change.
