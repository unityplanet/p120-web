# P-120 — WEB DESIGN RECONCILIATION PASS 3A.1

## POST-PASS-1I HG-CGA BASELINE RECONCILIATION — CLOSURE

**Document code:** `P120-WEB-DESIGN-REC-PASS3A1-CLOSURE`  
**Version:** `1.0`  
**Date:** `2026-09-07`  
**Workstream:** `P120 — WEB DESIGN RECONCILIATION / SITEWIDE VISUAL SYSTEM`  
**Governing production baseline:** `8756e23e2d2831e58e4a36aa5ec8718985ba3999`  
**Validated implementation head:** `42023e5b8fa00eb017904bba42921424bd94ef60`  
**Pull request:** `#41 — WEB DESIGN RECONCILIATION PASS 3A.1 — POST-PASS-1I HG-CGA baseline reconciliation`  
**Status:** `CLOSED / CONTROLLED / MERGE-READY SUBJECT TO EXACT-CLOSURE-HEAD RECHECK`  
**Verdict:** `PASS / PASS 1I HG-CGA INPUT FROZEN / DESIGN-UNIFICATION BASELINE RECONCILED`  

---

## 1. Closure decision

PASS 3A.1 has established the final HG-CGA / Decision Research bilingual live surface as the protected Design-Unification input.

The governing source is the final PASS 1I merge:

`8756e23e2d2831e58e4a36aa5ec8718985ba3999`.

No earlier supplier-first or pre-PASS-1I HG-CGA surface is authorised as a Design Unification source.

---

## 2. Final HG-CGA authority bound into Design Unification

- Final PASS: `PASS 1I — EN MIRROR RECONCILIATION / BILINGUAL PARITY & LIVE RELEASE`;
- Final corrective PR: `PR #40 — HG-CGA WEB PASS 1I — EN artifact parity correction`;
- Final merge SHA: `8756e23e2d2831e58e4a36aa5ec8718985ba3999`;
- Master authority: `HG-CGA-WEB-HR-MB-001 v1.0`;
- workstream state: `CLOSED / CONTROLLED BASELINE MAINTENANCE`.

Live evidence on the same final SHA:

- Pages run `#746 / 34064178851` — `completed / success`;
- Pages artifact `9998408432`;
- exact artifact SHA-256 `a5f682c2cc5562c615a7237d3a39e059a02cc418ba285b1880119027c3efc247`;
- Global Header audit `#12 / 34064179118` — `success`.

---

## 3. Frozen semantic architecture

The Design-Unification semantic invariant is:

> **Human Entry → Relationship PRIMARY → Relocation SECONDARY → Supplier TRANSFERABILITY → Synthesis → Human Authority Close**

The sequence is present and machine-checked in both RU and EN through:

1. `data-part="human-entry"`
2. `data-example="relationship"`
3. `data-example="relocation"`
4. `data-example="supplier"`
5. `data-part="synthesis"`
6. `data-part="authority-close"`

Subsequent visual work may reconcile presentation but may not reorder or semantically demote these blocks without a separate content/research authority gate.

---

## 4. PASS 3A authorities carried forward

The reconciled candidate adds two opt-in shared design authorities:

- `p120-visual-grammar-v1.0.css`;
- `p120-instrument-shell-v1.0.css`.

HG-CGA is represented in the family model as `derived-research`.

PASS 3A.1 deliberately does **not** attach these stylesheets to Brand 5.3 or any existing route. The final PASS 1I live surface therefore remains unchanged by this gate.

---

## 5. Exact PASS 1I preservation evidence

PASS 3A.1 QA confirms byte identity to the governing baseline for:

- RU HG-CGA HTML;
- RU human-relevance CSS;
- RU HG-CGA base CSS;
- RU HG-CGA JS;
- EN HG-CGA HTML;
- Brand 5.3 CSS.

It also verifies no changes under:

- `research/how-we-decide/`;
- `en/research/how-we-decide/`;
- Brand 5.3 CSS/JS;
- Why RU/EN;
- Science RU/EN;
- System RU/EN.

The implementation diff from `8756e23...` contains additions only; no existing production file is changed or deleted.

---

## 6. Dedicated PASS 3A.1 QA evidence

Workflow: `P120 Web Design Reconciliation PASS 3A.1`  
Run: `34065546847`  
Validated head: `42023e5b8fa00eb017904bba42921424bd94ef60`  
Conclusion: `SUCCESS`.

Dedicated freeze artifact:

- name: `P120_WEB_DESIGN_PASS3A1_QA`;
- artifact ID: `9998816672`;
- SHA-256: `45bbb3ba837401fa8c6c477cc3973769fd83638c1e25f446a13ae2711f05bc2b`.

---

## 7. Inherited browser/header regression evidence

The same workflow run executed the inherited Design Reconciliation browser suite on the same head.

All gates passed:

- Main quick locale/theme;
- mobile quick chapter;
- mobile session resume;
- frozen Global Header PASS 2.1;
- original Global Header PASS 1;
- footer presentation under project prefix.

Artifact:

- name: `P120_WEB_DESIGN_PASS3A1_BROWSER_REGRESSION`;
- artifact ID: `9998878114`;
- SHA-256: `715e0bd293ae05cd4fc2fed358ce58dc9bb4bcd9c02784ca488f80dbe7e0e4a7`.

---

## 8. Actions Governance evidence

Workflow: `P120 Actions Governance QA`  
Run: `34065546828`  
Validated head: `42023e5b8fa00eb017904bba42921424bd94ef60`  
Conclusion: `SUCCESS`.

---

## 9. Supersession record

Pre-PASS-1I Design Reconciliation PR `#34` has been closed without merge and marked superseded.

It remains historical evidence only.

PR `#41` is the current controlled Design-Unification candidate because it starts directly from final PASS 1I production SHA `8756e23...`.

---

## 10. Next gate

After exact closure-head QA is green and PR #41 is promoted, the next design workstream gate is:

**`WEB DESIGN RECONCILIATION PASS 4 — Homepage Visual Reconciliation`**.

Homepage work must consume the reconciled shared visual grammar deliberately and must treat final PASS 1I HG-CGA as a protected Derived Research witness, not as a source to be rewritten.
