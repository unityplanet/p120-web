# P-120 — WEB DESIGN RECONCILIATION PASS 3A

## Shared Shell Implementation, Visual-Grammar Bootstrap & Regression Lock

**Document code:** `P120-WEB-DESIGN-REC-PASS3A`  
**Version:** `1.0`  
**Date:** `2026-09-06`  
**Workstream:** `P120 — WEB DESIGN RECONCILIATION / SITEWIDE VISUAL SYSTEM`  
**Baseline main:** `cf11a176bb0db87aec046d5694c302285b275f90`  
**Working branch:** `work/web-design-reconciliation-pass3a`  
**Implementation state:** `IMPLEMENTED / QA PENDING`  

## 1. Gate purpose

PASS 3A converts the PASS 2/3 visual-governance decisions into an executable but non-disruptive foundation before Homepage, Science or System visual reconciliation.

The governing sequence is:

`canonical Brand 5.3 tokens/shell -> shared visual grammar -> page-family composition`

and, for the respondent surface:

`canonical visual tokens -> scoped Instrument Shell -> native System runtime`.

No new universal respondent JavaScript runtime is introduced.

## 2. Implemented files

### `p120-visual-grammar-v1.0.css`

Establishes opt-in shared primitives for:

- canonical font-role aliases;
- Museum/Ivory/Graphite semantic aliases inherited from `--p120-brand-*`;
- global/editorial/atlas/reading measures;
- sectional rhythm;
- structural rules;
- semantic planes;
- restrained atlas/object/status/action primitives;
- responsive and reduced-motion behavior.

It also maps the already-existing Brand 5.3 `html[data-p120-page-kind]` marker into page-family design contracts without rewriting route HTML.

### `p120-instrument-shell-v1.0.css`

Establishes a strictly scoped Instrument Shell foundation using the existing native System marker:

`body[data-p120-page="system"]`.

The file contains presentation tokens and opt-in future Instrument primitives only. Existing validated System selectors are not overridden in PASS 3A.

### `p120-brand-system-v1.0.css`

Two imports were added before the existing Brand 5.3 authority:

1. `p120-visual-grammar-v1.0.css?v=3a1`
2. `p120-instrument-shell-v1.0.css?v=3a1`

No existing Brand 5.3 rule was intentionally modified.

## 3. Shell markers

PASS 3A does not add a new JavaScript marker engine.

Public family identity uses the existing Brand 5.3 runtime marker:

`html[data-p120-page-kind]`.

The shared grammar maps:

- Main / About / Why -> `editorial`;
- Creator -> `narrative`;
- Science -> `science`;
- Extended -> `explore`;
- Together -> `dyadic`;
- Privacy / Terms / IP / Contact -> `utility`.

System continues to use its existing explicit native marker:

`body[data-p120-page="system"]` -> `instrument/system`.

This avoids introducing runtime coupling only to create presentation metadata.

## 4. Preservation strategy

PASS 3A is deliberately additive-first.

No duplicate local shell rules are deleted in the bootstrap commit because screenshot/browser parity must precede cleanup.

Specifically, this PASS does not yet remove shell definitions from:

- `about/about-p120-v1.0.css`;
- `explore-system-v1.0.css`;
- `founder-shell-v2.css`.

Those rules become cleanup candidates only after the new shared foundation has passed regression evidence.

## 5. Runtime firewall

PASS 3A makes no change to:

- `p120-public-runtime-v1.0.js`;
- native RU/EN System runtime ownership;
- respondent session keys;
- measurement/scoring contract;
- Scientific Base runtime;
- Supabase/Auth/RLS;
- questionnaire items or response values;
- privacy/safety/submission logic.

System is not made to load `p120-brand-system-v1.0.js` or `p120-public-runtime-v1.0.js`.

## 6. Frozen/reference-surface firewall

No PASS 3A HTML/content mutation is authorised for:

- Why P-120 RU/EN;
- About RU/EN;
- Creator RU/EN;
- Extended RU/EN;
- Together RU/EN;
- Science RU/EN;
- System RU/EN.

The initial target is optically equivalent output with cleaner upstream authority, not a visible redesign.

## 7. QA authority

Added:

- `qa/web_design_reconciliation_pass3a_gate.mjs`;
- `.github/workflows/p120-web-design-reconciliation-pass3a.yml`.

The gate verifies:

- canonical import order;
- Brand 5.3 body preservation against the exact baseline;
- CSS structural balance;
- canonical font-role coverage;
- no new non-canonical font families;
- complete route-family marker mapping;
- native System runtime isolation;
- absence of route-local selector leakage in shared PASS 3A sheets;
- constrained changed-file set;
- no mutation of Why/reference cluster/Science/System/runtime production files.

## 8. Pending closure condition

PASS 3A may be marked `CLOSED / CONTROLLED / SEALED` only after:

1. PASS 3A CI gate returns `PASS`;
2. inherited repository checks do not expose a regression caused by the bootstrap;
3. exact branch/head evidence is recorded;
4. the closure record is created.

Until then:

**Status: `IMPLEMENTED / QA PENDING`.**
