# Why P-120 — Micro-Polish Regression Evidence Protocol

This directory is the mandatory evidence plane for all changes to the frozen Why P-120 composition.

## Required directory structure

`qa/why-p120/<PASS_ID>/`

Required files:

- `desktop-before.png` or `.jpg`
- `desktop-after.png` or `.jpg`
- `mobile-before.png` or `.jpg`
- `mobile-after.png` or `.jpg`
- `manifest.md`

## Required baseline viewports

- Desktop: 1920×1080
- Mobile: 393×852

Add tablet/UHD evidence when the proposed change can affect those ranges.

## manifest.md template

```md
# WHY-P120 MICRO-POLISH — <PASS_ID>

Status: PASS | FAIL
Baseline SHA: <sha>
Candidate SHA: <sha>
Scope: <single scene/component>
Purpose: <one sentence>

Changed files:
- <path>

Frozen invariant changed: NO

Evidence:
- desktop-before.png — 1920×1080
- desktop-after.png — 1920×1080
- mobile-before.png — 393×852
- mobile-after.png — 393×852

Regression gates:
- Visual fidelity: PASS | FAIL
- Responsive: PASS | FAIL
- Horizontal overflow: PASS | FAIL
- Navigation/interaction: PASS | N/A | FAIL
- RU/EN parity: PASS | N/A | FAIL
- Reduced motion/accessibility: PASS | N/A | FAIL
- Console/runtime: PASS | FAIL

Decision:
<why this micro-change can be merged without unfreezing the composition>
```

## Rule

No screenshot pair = no merge.  
No completed manifest = no merge.  
Any frozen invariant change = stop and request an explicit UNFREEZE / NEW DESIGN DECISION.
