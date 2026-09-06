# P-120 — WEB DESIGN RECONCILIATION PASS 3A.1

## POST-PASS-1I HG-CGA BASELINE RECONCILIATION

**Document code:** `P120-WEB-DESIGN-REC-PASS3A1`  
**Version:** `1.0`  
**Date:** `2026-09-07`  
**Workstream:** `P120 — WEB DESIGN RECONCILIATION / SITEWIDE VISUAL SYSTEM`  
**Baseline:** `8756e23e2d2831e58e4a36aa5ec8718985ba3999`  
**Status:** `IMPLEMENTED / QA PENDING`  

---

## 1. Purpose

PASS 3A.1 reconciles the Sitewide Design Unification architecture against the final live HG-CGA / Decision Research authority produced by PASS 1I.

This is a baseline-admission and preservation gate. It is not an HG-CGA redesign pass and does not reopen PASS 1I.

---

## 2. Governing HG-CGA authority

Design Unification source authority:

- Final PASS: `PASS 1I — EN MIRROR RECONCILIATION / BILINGUAL PARITY & LIVE RELEASE`;
- Final corrective PR: `#40 — HG-CGA WEB PASS 1I — EN artifact parity correction`;
- Final merge SHA: `8756e23e2d2831e58e4a36aa5ec8718985ba3999`;
- Pages deployment: run `#746 / 34064178851` — `completed / success`;
- Pages artifact: `9998408432`;
- Pages artifact SHA-256: `a5f682c2cc5562c615a7237d3a39e059a02cc418ba285b1880119027c3efc247`;
- Global Header audit: run `#12 / 34064179118` — `success`;
- Master authority: `HG-CGA-WEB-HR-MB-001 v1.0`;
- HG-CGA workstream: `CLOSED / CONTROLLED BASELINE MAINTENANCE`.

---

## 3. Frozen Design-Unification input

The following source sequence is protected:

> **Human Entry → Relationship PRIMARY → Relocation SECONDARY → Supplier TRANSFERABILITY → Synthesis → Human Authority Close**

Machine-readable sequence:

`data-part="human-entry"`
→ `data-example="relationship"`
→ `data-example="relocation"`
→ `data-example="supplier"`
→ `data-part="synthesis"`
→ `data-part="authority-close"`.

Both RU and EN must retain this sequence through subsequent Design Unification passes.

---

## 4. PASS 3A foundation carried forward

PASS 3A.1 restores the previously established shared design authorities on top of the final PASS 1I baseline:

- `p120-visual-grammar-v1.0.css`;
- `p120-instrument-shell-v1.0.css`.

Their status at this gate is **opt-in authority / not globally activated**.

No import is added to `p120-brand-system-v1.0.css` and no current live route is restyled by PASS 3A.1.

HG-CGA is admitted in the shared family model as:

`PUBLIC SHELL → DERIVED RESEARCH FAMILY → HG-CGA ROUTE COMPOSITION`.

This family marker does not own route-local HG-CGA selectors.

---

## 5. Preservation firewall

PASS 3A.1 MUST NOT mutate:

- `research/how-we-decide/`;
- `en/research/how-we-decide/`;
- Brand 5.3 CSS/JS;
- frozen Why composition;
- Scientific Base authority;
- System/respondent runtime;
- questionnaire content/order/scales;
- scoring/thresholds/report interpretation;
- persistence/session state;
- Supabase/Auth/RLS;
- privacy/safety;
- HG-CGA research claims or empirical-effectiveness boundary.

---

## 6. Exact PASS 1I route blobs under protection

- RU HTML: `15cb691f9d5acc137d228c32cc768ed4bfe3f9f5`;
- Human-relevance CSS: `959904e56d9553164d937156894933398c6b2d75`;
- HG-CGA base CSS: `5f6f8b06bfc46abd05ccdc6558b2173089d7eba1`;
- HG-CGA JS: `08f4327eb1bc9d3ad298166103ab9b1c947481a7`;
- EN HTML: `40e48ad74371324a3d9f783cae2c7cc85e1e122f`;
- Brand 5.3 CSS: `fc19106f89789c77355fce74dc7ff9cd8d74aedd`.

PASS 3A.1 QA verifies both exact blob identity and byte equivalence to the final baseline.

---

## 7. Migration implication

The next Homepage design pass must begin from this reconciled baseline. It may adopt the shared visual grammar deliberately, but must not use any pre-PASS-1I HG-CGA route as a reference source for content hierarchy or narrative order.

Reference pages remain evidence of shared design DNA; HG-CGA is now additionally a protected Derived Research witness.

---

## 8. Closure gate

PASS 3A.1 may be marked `CLOSED / CONTROLLED / MERGE-READY` only when the exact candidate head satisfies:

1. dedicated PASS 3A.1 QA — PASS;
2. exact PASS 1I HG-CGA blob preservation — PASS;
3. RU/EN semantic-order freeze — PASS;
4. no local HG-CGA selector leakage into shared authorities — PASS;
5. Actions Governance QA — PASS;
6. inherited browser/global-header regression — PASS;
7. final closure head is rechecked after the closure record is added.

Until then status remains `IMPLEMENTED / QA PENDING`.
