# P-120 — WEB DESIGN RECONCILIATION PASS 3A

## Reconciliation Delta — HG-CGA / Decision Research Admission

**Document code:** `P120-WEB-DESIGN-REC-PASS3A-DELTA-HGCGA`  
**Version:** `1.0`  
**Date:** `2026-09-06`  
**Workstream:** `P120 — WEB DESIGN RECONCILIATION / SITEWIDE VISUAL SYSTEM`  
**Current production baseline:** `d656835b2926f0fd7aede2606bb5da8b99841e25`  
**Prior PASS 3A closure head:** `527f2dde081f1e7ef11985d9b1ad1e9ac6caf8fc`  
**Reconciliation branch:** `work/web-design-pass3a-reconciliation-delta`  
**Delta status:** `IMPLEMENTED / QA PENDING`  

---

## 1. Trigger

After the original WEB DESIGN RECONCILIATION PASS 3A closure, a new bilingual public research surface was promoted to production:

- `research/how-we-decide/` — RU;
- `en/research/how-we-decide/` — EN.

The surface is the public HG-CGA / Decision Research projection and is already integrated into the P-120 Brand 5.3 navigation/runtime as page kind:

`research/how-we-decide`.

Because the surface entered `main` after the original PASS 3A baseline, it was not named in the original page-family contract or preservation matrix.

This delta closes that admission gap without reopening PASS 3A architecture.

---

## 2. Governing decision

HG-CGA is admitted to the sitewide visual-system corpus as:

**`DERIVED RESEARCH / DECISION RESEARCH`**

Canonical family marker:

`derived-research`

Runtime/page-kind binding:

`html[data-p120-page-kind="research/how-we-decide"]`

Resulting classification:

`PUBLIC SHELL -> SHARED VISUAL GRAMMAR -> DERIVED RESEARCH FAMILY -> HG-CGA ROUTE COMPOSITION`.

HG-CGA is not collapsed into the Scientific Base family and is not classified as Instrument/System.

---

## 3. Design disposition

HG-CGA enters the reconciliation package with status:

**`INCLUDE / NEAR-TARGET / PRESERVE COMPOSITION / RECONCILE SHARED DNA`**.

This delta does not redesign the page.

Protected route-local visual vocabulary includes, among other elements:

- HG-CGA decision field;
- evidence/assumption/interpretation layer presentation;
- decision example stepper;
- authority flow;
- experimental-arm presentation;
- evidence-state roadmap;
- HG-CGA mobile navigation implementation.

These remain route-local composition authority.

---

## 4. Exact implementation delta

### Shared grammar

`p120-visual-grammar-v1.0.css` gains one semantic family binding:

```css
[data-p120-family="derived-research"],
html[data-p120-page-kind="research/how-we-decide"]{
  --p120-family-kind:derived-research;
}
```

This marker is non-visual and does not target HG-CGA route selectors.

### QA

`qa/web_design_reconciliation_pass3a_gate.mjs` is rebased for this reconciliation gate onto production baseline:

`d656835b2926f0fd7aede2606bb5da8b99841e25`.

It now verifies:

- HG-CGA page-kind recognition by Brand 5.3;
- RU/EN HG-CGA Brand 5.3 CSS inheritance;
- RU/EN HG-CGA local composition authority retention;
- derived-research family admission;
- absence of `.hgcga-*`, `.decision-field` and `.step-card` leakage into shared grammar;
- byte-preservation of RU and EN HG-CGA route directories relative to production baseline;
- preservation of Brand 5.3 JS, Science, System, Why and existing reference surfaces;
- continued System isolation from public runtime.

### Workflow

The existing PASS 3A workflow is extended to run on the reconciliation branch.

---

## 5. Explicit non-changes

This delta makes no changes to:

- RU HG-CGA page content;
- EN HG-CGA page content;
- HG-CGA local CSS;
- HG-CGA local JS;
- HG-CGA research claims;
- HG-CGA evidence status;
- HG-CGA governance language;
- empirical-effectiveness boundary;
- Scientific Base authority;
- P-120 questionnaire content;
- measurement/scoring;
- respondent sessions/persistence;
- report calculation;
- Supabase/Auth/RLS;
- privacy/safety;
- frozen Why P-120 composition.

---

## 6. Merge-history reconciliation

The reconciliation candidate is built from a merge tree with two authorities as parents:

1. current production HG-CGA `main` — `d656835b2926f0fd7aede2606bb5da8b99841e25`;
2. closed PASS 3A head — `527f2dde081f1e7ef11985d9b1ad1e9ac6caf8fc`.

The merge-history reconciliation commit is:

`8e02b92eff4602da26e47052a710fae77330e8e4`.

Therefore the candidate contains both the current production HG-CGA surface and the previously validated PASS 3A foundation without rewriting either history.

---

## 7. Closure rule

This delta may be marked:

**`CLOSED / CONTROLLED / MERGE-READY`**

only after:

1. dedicated PASS 3A reconciliation QA is green on the exact candidate head;
2. inherited browser/cross-regression is green;
3. Actions governance is green;
4. RU/EN HG-CGA preservation checks remain green;
5. no protected authority surface changes are detected.

Until then status remains:

**`IMPLEMENTED / QA PENDING`**.

---

## 8. Effect on subsequent work

After closure, the sitewide reconciliation corpus explicitly includes HG-CGA.

The next major design gate remains:

**`WEB DESIGN RECONCILIATION PASS 4 — Homepage Visual Reconciliation`**.

HG-CGA itself does not become a PASS 4 redesign target. Its future treatment is controlled shared-DNA reconciliation under its Derived Research family classification.
