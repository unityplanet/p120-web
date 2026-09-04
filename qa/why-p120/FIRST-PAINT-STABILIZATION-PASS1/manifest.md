# Why P-120 — FIRST-PAINT-STABILIZATION-PASS1

Pass class: MICRO-POLISH
Purpose: eliminate delayed white/unstyled first-paint flash on RU and EN routes without altering frozen composition.
Baseline SHA: 7f732d18d21b8c631183a4003769c3a141b7486c
Affected component: route first-paint/loading architecture only.
Viewports: desktop 1920×1080; mobile 393×852.

Changed files:
- why-p120/index.html
- en/why-p120/index.html
- why-p120/why-p120.js
- why-p120/why-p120-firstpaint.css
- qa/why-p120/translation-pairs-v1.json

Frozen invariant changed: NO
Visual fidelity: PASS
Responsive: PASS
Horizontal overflow: PASS
Console/runtime: PASS
Bilingual parity: PASS
EN runtime loader/document rewrite removed: PASS
Critical responsive CSS staticized before first paint: PASS
Initial canvas polarity dark: PASS

Evidence:
- desktop-before.png
- desktop-after.png
- mobile-before.png
- mobile-after.png
- mobile-en-after.png

Final status: PASS
