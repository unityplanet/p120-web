# P-120 WEB EXPLORE TYPOGRAPHY POLICY v1.1

**Document ID:** P120-WEB-TYP-EXP-001  
**Artifact class:** source-adjacent web design authority / native repository record  
**Version:** v1.1  
**Status:** IMPLEMENTED / CURRENT SOURCE POLICY  
**Effective date:** 2026-09-01  
**Applies to:** `/extended/`, `/together/`, `/en/extended/`, `/en/together/`  
**Supersedes:** `P120_WEB_EXPLORE_TYPOGRAPHY_POLICY_v1.0.md`  
**Authority boundary:** presentation only; no measurement/scoring/scientific-authority change

> P120 governance note: this repository Markdown is a source-adjacent implementation authority under the native-artifact exception. If reissued as a controlled narrative publication, the v1.1 content must be released as matching DOCX editable master + PDF frozen rendering under the current P120 documentation standard.

## 01 Decision

WEB-EXPLORE PASS 4 introduces an explicit, user-authorised local typography exception for the public Explore pages.

Visible body copy previously rendered in **Noto Serif Regular** is replaced by **Prata**. This applies equally to RU and EN Explore pages.

This is a page-family-specific editorial decision. It does not change the P-120 measurement model, scientific claims, scoring, report logic or the typography authority of unrelated P-120 surfaces.

## 02 Current font ownership

| Surface | Required family |
|---|---|
| H1 / major H2 / major H3 | Noto Serif Display |
| Major statement / flash | Noto Serif Display |
| Main narrative and explanatory body copy | Prata |
| Module descriptions / section introductions / research caveats visible as prose | Prata |
| Navigation / controls / eyebrow / labels / status / metadata | IBM Plex Sans |
| IDs / module codes / process notation / technical tags | IBM Plex Mono |
| Noto Serif | fallback / non-primary on this page family; no longer the intended visible regular body voice |

## 03 Relationship to the Founder page

The Explore pages retain the Founder-derived separation between:

- **display declaration** — Noto Serif Display;
- **human/editorial reading voice** — Prata;
- **functional research/interface grammar** — IBM Plex Sans;
- **technical notation** — IBM Plex Mono.

PASS 4 deliberately expands Prata ownership beyond the narrower Founder secondary-serif usage for this specific public page family. This is the explicit exception that supersedes the v1.0 Explore policy.

## 04 Size and geometry authority

Explore sections use the main P-120 public-stage scale rather than a narrow microsite scale:

- content plane target: `1680px` maximum;
- gutters follow the main public stage: `clamp(18px, 2.7vw, 46px)`;
- hero height is bounded rather than forced to a full viewport;
- explanatory hero column expands materially on HD/UHD screens;
- cards, dyadic diagrams, research blocks and lower-page objects scale with the widened content plane.

## 05 Language authority

RU and EN are first-class Explore page variants.

- RU routes: `/extended/`, `/together/`;
- EN routes: `/en/extended/`, `/en/together/`;
- header language control: `RU / EN`;
- Russian public copy translates ordinary English interface/research wording wherever a Russian equivalent is practical;
- stable module identifiers and acronyms such as `P-120`, `COM`, `MOT`, `SELF`, `LIFE`, `RPE-MOD`, `SCORE-D`, `DESIRE-D`, `C1–C4` remain unchanged.

## 06 Change boundary

PASS 4 does not modify:

- questionnaire items;
- scoring keys, formulas or thresholds;
- report calculation;
- Supabase/persistence;
- scientific evidence status;
- dyadic privacy requirements;
- module validation status.

Further typography changes for this page family must preserve this ownership model unless a new explicit exception is issued.
