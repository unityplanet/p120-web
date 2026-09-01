# P-120 Web Editorial — Why P-120 Composition Freeze v1.0

**Document type:** repository-native freeze authority  
**Scope:** `/why-p120/` and `/en/why-p120/`  
**Status:** FROZEN  
**Effective date:** 2026-09-01  
**Frozen production baseline:** `92a6ebdcdc7b8f353b1324b5fc97294ab3689ac1`  
**Baseline branch:** `freeze/why-p120-composition-v1.0`  
**Visual acceptance authority:** `P120_WEB_Why_P120_Visual_Acceptance_Report_v1.0_2026-09-01`

## 1. Freeze decision

The current Why P-120 / Brand Origin composition is frozen. Future changes are permitted only as isolated **MICRO-POLISH** passes. A micro-polish pass may improve optical spacing, local typography, micro-alignment, contrast, line weight, small responsive corrections, accessibility behavior, or narrowly scoped interaction quality. It must not redesign the page or alter its dramaturgy.

## 2. Frozen composition invariants

The following are frozen and may not be changed by a micro-polish pass:

1. Four-act dramaturgy: **ACT 1 → ACT 2 → ACT 3 → ACT 4**.
2. Surface rhythm: **dark → warm ivory → dark → warm ivory**.
3. ACT 1 core composition: monumental `P-120`, factual `72 + 48 = 120`, two-circle 72/48 architecture, symbolic brand layer `72→9`, `48→3`, `9−3=6`, and `P.01–P.06` bridge.
4. ACT 2 core composition: large translucent `P` plus indexed six-direction semantic object `P.01–P.06`.
5. ACT 3 core composition: `P / π` visual climax, real π decimal field, construction geometry, and explicit boundary that π is symbolic only.
6. ACT 4 core composition: coordinate field → network → human profile metaphor with Founder-derived contour treatment.
7. Fixed editorial palette for this route; the page does not become a three-theme page.
8. Rounded desktop navigation bubble and dedicated mobile navigation layer.
9. RU/EN route symmetry and locale-specific secondary copy.
10. Existing scientific / methodological boundary: brand mythology must never be presented as scoring, validation, or scientific evidence.

## 3. Allowed MICRO-POLISH scope

A micro-polish pass MAY change only narrowly bounded presentation behavior, for example:

- optical spacing within an existing scene;
- local type size/leading/tracking corrections;
- line, node, border, or opacity refinement;
- small Founder-contour fidelity adjustment without changing ACT 4 architecture;
- breakpoint-specific overflow/clipping correction;
- mobile menu density or focus-state correction;
- accessibility/focus/reduced-motion repair;
- localization alignment where meaning is unchanged;
- performance correction that preserves visual output.

## 4. Prohibited without explicit UNFREEZE decision

The following require a new controlled design decision and are NOT micro-polish:

- adding/removing/reordering ACTs;
- replacing the dark/ivory rhythm;
- changing the ACT 1 factual equation or the relationship between 72, 48 and 120;
- removing or materially redesigning the P.01–P.06 semantic object;
- replacing the P/π scene with a different metaphor;
- replacing the ACT 4 coordinate→human composition;
- converting sections to generic cards or standard landing-page blocks;
- introducing WebGL/heavy cinematic dependencies solely for decorative effect;
- changing scientific, measurement, scoring, questionnaire, result or test-engine logic;
- changing the fixed-editorial-theme decision for Why P-120.

## 5. Mandatory evidence for every future micro-polish pass

Every proposed change must include screenshot regression evidence in `qa/why-p120/<PASS_ID>/`.

Minimum evidence set:

- `desktop-before.png` or `.jpg`
- `desktop-after.png` or `.jpg`
- `mobile-before.png` or `.jpg`
- `mobile-after.png` or `.jpg`
- `manifest.md`

Minimum viewport evidence:

- Desktop: **1920×1080**
- Mobile: **393×852**

Additional screenshots are required when the change is breakpoint-specific or affects tablet/UHD behavior.

The evidence manifest must identify:

- pass ID and purpose;
- baseline SHA;
- changed files;
- exact affected scene/component;
- before/after viewport sizes;
- whether any frozen invariant changed (`NO` required for MICRO-POLISH);
- visual regression result;
- responsive regression result;
- bilingual regression result if relevant;
- accessibility/interaction regression result if relevant;
- final status: `PASS` or `FAIL`.

## 6. Merge rule

A Why P-120 change is acceptable only when all conditions are true:

1. Change is explicitly identified as `MICRO-POLISH`.
2. Scope is isolated and does not alter frozen invariants.
3. Required screenshot evidence exists.
4. Regression manifest is complete.
5. Automated Why P-120 freeze gate passes.
6. No new console/layout/overflow regression is introduced.

If any invariant must change, the pass must stop and request an explicit **UNFREEZE / NEW DESIGN DECISION** before implementation.

## 7. Enforcement boundary

This repository currently has no protected `main` branch. The automated gate can enforce pull-request conformance but cannot physically prevent an authorized direct push to `main`. Direct pushes that modify the frozen scope without the required evidence are therefore **non-conforming releases** under this freeze authority.

## 8. Current release state

**WHY P-120 COMPOSITION: FROZEN**  
**VISUAL BASELINE: ACCEPTED**  
**FUTURE CHANGE MODE: ISOLATED MICRO-POLISH ONLY**  
**SCREENSHOT REGRESSION EVIDENCE: MANDATORY**
