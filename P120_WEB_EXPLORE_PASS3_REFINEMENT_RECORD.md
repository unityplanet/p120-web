# P-120 WEB-EXPLORE PASS 3 — Visual Refinement & Typography Conformance

**Document ID:** P120-WEB-EXP-P3-001  
**Document class:** Controlled Implementation / QA Record  
**Version:** 1.0  
**Status:** IMPLEMENTED · LIVE DEPLOYED · FINAL VISUAL ACCEPTANCE OPEN  
**Date:** 2026-09-01  
**Scope:** `/extended/`, `/together/`  
**Content authority:** unchanged from WEB-EXPLORE PASS 2  
**Measurement authority:** unchanged / out of scope

---

## 1. Trigger

PASS 3 was opened after live desktop screenshots showed a production presentation defect on both Explore pages and after a typography-conformance review against the P-120 «От Создателя» page.

The page concept, information architecture and editorial/scientific text were retained.

No scientific or measurement-content rewrite was authorized in this pass.

---

## 2. Defect register

### EXP-DEF-01 — Mobile drawer leaked into desktop document flow

**Observed:** a raw, unstyled line of navigation links appeared directly below the desktop header on both `/extended/` and `/together/`.

**Root cause:** `.mobile-drawer` had no base desktop state. Its positioning/visibility rules existed only inside `@media(max-width:760px)`, so on desktop the element reverted to ordinary block layout and exposed its anchor content.

**Correction:**
- hard desktop suppression of `.mobile-drawer`;
- explicit mobile re-enable at `<=760px`;
- critical runtime guard added before the full refinement layer is applied.

**Disposition:** corrected in code.

### EXP-REF-02 — Hero vertical composition on wide/short desktop

**Observed:** the left display title was visually pulled toward the lower part of the hero while the right explanatory column began substantially higher, producing an unintended empty field.

**Root cause:** PASS-2 `hero-grid` used `align-items:end` inside a tall hero.

**Correction:** on large desktop viewports the hero now uses centered vertical composition and a bounded viewport-height frame while preserving the two-column editorial asymmetry.

**Disposition:** refined.

### EXP-REF-03 — Typography role drift

**Observed:** PASS 2 loaded the correct font families but did not fully bind them to the same semantic roles used by the Founder architecture.

**Correction:** semantic ownership was frozen and implemented:
- Noto Serif Display — display statements and major headings;
- Noto Serif — scientific/explanatory body;
- Prata — sparse human/editorial narrative;
- IBM Plex Sans — navigation, metadata, status and functional research UI;
- IBM Plex Mono — codes, IDs and technical notation.

**Disposition:** corrected and standardized.

---

## 3. Implementation artifacts

- `explore-refinement-v1.0.css`
- `explore-system-v1.0.js` upgraded internally to shared shell v1.1
- `P120_WEB_EXPLORE_TYPOGRAPHY_POLICY_v1.0.md`

The PASS-2 stylesheet remains the base layer; PASS 3 is a narrow override/refinement layer.

---

## 4. Scientific / measurement firewall

PASS 3 does **not** alter:

- test items;
- module construct definitions;
- scoring keys;
- formulas;
- thresholds;
- composite indices;
- P-120 result generation;
- Supabase/persistence behavior;
- participant submission logic;
- dyadic privacy doctrine;
- research-status claims.

No new psychometric claim was introduced.

---

## 5. Typography gate

**Canonical families:** exactly five named P-120 families.

1. Noto Serif Display
2. Noto Serif
3. Prata
4. IBM Plex Sans
5. IBM Plex Mono

A sixth named family is non-conforming.

Prata is explicitly secondary and must never replace Noto Serif as the scientific body voice.

---

## 6. Acceptance gates

| Gate | Status |
|---|---|
| Desktop mobile-drawer leakage removed | IMPLEMENTED |
| Wide-desktop hero alignment refined | IMPLEMENTED |
| Founder-compatible font ownership | IMPLEMENTED |
| Responsive rules preserved | IMPLEMENTED |
| Reduced-motion protection preserved | IMPLEMENTED |
| Assessment/scoring regression | NOT TOUCHED |
| Live GitHub Pages build | PASS — run 381 · implementation HEAD `b97cb40db1ee2058737bbf024ceb7ab59bd43643` |
| Screenshot visual acceptance | OPEN — user/live visual review |

---

## 7. Change-control rule

Further PASS-3 edits should be limited to actual visual defects, spacing, responsive behavior and typography conformance.

Any scientific/content architecture change must open a separate reconciliation pass rather than being folded into visual refinement.
