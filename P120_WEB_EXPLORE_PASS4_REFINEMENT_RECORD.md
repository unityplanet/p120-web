# P-120 WEB-EXPLORE PASS 4 — Scale, Localisation & Bilingual Refinement

**Document ID:** P120-WEB-EXP-P4-001  
**Artifact class:** source-adjacent implementation / QA record  
**Version:** v1.0  
**Status:** IMPLEMENTED · LIVE VISUAL ACCEPTANCE PENDING  
**Date:** 2026-09-01  
**Scope:** `/together/`, `/extended/`, `/en/together/`, `/en/extended/`  
**Content authority:** WEB-EXPLORE PASS 2 scientific/editorial architecture retained  
**Measurement authority:** unchanged / out of scope

> P120 governance note: this Markdown is a native repository implementation record. If promoted to a controlled narrative publication, it must be issued as a matching DOCX/PDF pair under the current P120 documentation standard.

## 01 Trigger

PASS 4 was opened from live 1920px review of the Explore pages. The user accepted the page concept, information architecture and substantive text, while identifying scale, typography, localisation and header defects.

## 02 Implemented corrections

### P4-01 Hero scale and vertical rhythm

- removed the full-viewport-like empty field created by the prior hero geometry;
- bounded the hero to the main P-120 stage scale;
- expanded the explanatory column from the prior narrow microsite measure;
- reconciled maximum content width to `1680px` and main-stage gutters.

### P4-02 Prata body exception

- the second-block introductory paragraph on `/together/` is now Prata;
- all visible prose that previously used Noto Serif Regular on Explore pages is now assigned to Prata;
- Noto Serif Display remains the display/statement authority;
- IBM Plex Sans remains functional/navigation/metadata;
- IBM Plex Mono remains technical notation;
- policy is frozen in `P120_WEB_EXPLORE_TYPOGRAPHY_POLICY_v1.1.md`.

### P4-03 Lower-section object scaling

- cards, dyadic panels, research engines, privacy blocks, result blocks and module objects use the wider public-stage plane;
- proportions remain editorial rather than dashboard-like;
- existing content and section order are preserved.

### P4-04 Russian localisation cleanup

Ordinary translatable English wording was replaced in RU public source copy wherever practical, including section labels, dyadic process labels, privacy labels, status phrases, module descriptors and visible compatibility terminology.

Stable identifiers remain unchanged: `P-120`, `COM`, `MOT`, `SELF`, `LIFE`, `RPE-MOD`, `SCORE-D`, `DESIRE-D`, `C1–C4`.

### P4-05 Header / floating menu refinement

- sticky header reconciled to main-site scale and top-rule grammar;
- Explore dropdown closes on outside click and Escape;
- only one desktop floating Explore menu remains open at a time;
- scroll-state depth is restrained and deterministic;
- mobile drawer behavior is preserved.

### P4-06 Bilingual Explore surface

Added:

- `/en/together/`;
- `/en/extended/`;
- persistent `RU / EN` switch in the Explore header;
- bilingual routing adapter for main-site Explore entries;
- EN compatibility with the existing Founder-route bridge.

## 03 Files

- `explore-refinement-v1.1.css`
- `explore-system-v1.0.js` — internal shell v1.2
- `together/index.html`
- `extended/index.html`
- `en/together/index.html`
- `en/extended/index.html`
- `extended-research-navigation-v1.0.js` — internal adapter v2.1
- `founder-route-v1.1.js` — internal bridge v1.3
- `P120_WEB_EXPLORE_TYPOGRAPHY_POLICY_v1.1.md`

## 04 Preservation firewall

No changes were authorised or made to measurement items, scoring, formulas, thresholds, report calculation, Supabase/persistence, validation claims or dyadic privacy doctrine.

## 05 Acceptance status

| Gate | Status |
|---|---|
| Hero scale correction | IMPLEMENTED |
| Main-stage content width | IMPLEMENTED |
| Prata body conversion | IMPLEMENTED |
| RU localisation cleanup | IMPLEMENTED |
| RU/EN page pair | IMPLEMENTED |
| Header/dropdown refinement | IMPLEMENTED |
| Lower-object scale refinement | IMPLEMENTED |
| Measurement/scoring regression | NOT TOUCHED |
| GitHub Pages deployment | VERIFY FINAL HEAD |
| 1920 live visual acceptance | OPEN |
| Mobile live visual acceptance | OPEN |

## 06 Next gate

The next action is a screenshot-based live visual acceptance pass on both RU pages first, then EN parity, with edits restricted to real presentation defects, responsive behavior, spacing and typography.
