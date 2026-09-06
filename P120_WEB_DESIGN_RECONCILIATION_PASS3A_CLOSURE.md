# P-120 — WEB DESIGN RECONCILIATION PASS 3A

## Closure Record — Shared Shell Implementation, Visual-Grammar Bootstrap & Regression Lock

**Document code:** `P120-WEB-DESIGN-REC-PASS3A-CLOSURE`  
**Version:** `1.0`  
**Date:** `2026-09-06`  
**Workstream:** `P120 — WEB DESIGN RECONCILIATION / SITEWIDE VISUAL SYSTEM`  
**Baseline main:** `cf11a176bb0db87aec046d5694c302285b275f90`  
**Implementation evidence head:** `6bae35871edca3811dde151a73451b70b6f9ce6b`  
**Working branch:** `work/web-design-reconciliation-pass3a`  
**Pull request:** `#32 — WEB DESIGN RECONCILIATION PASS 3A — shared shell bootstrap`  
**Closure status:** `CLOSED / CONTROLLED / MERGE-READY`  
**Verdict:** `PASS / SHARED VISUAL FOUNDATION ESTABLISHED / REGRESSION LOCK GREEN`  

---

## 1. Closure decision

WEB DESIGN RECONCILIATION PASS 3A is technically complete and may be treated as the controlled implementation baseline for subsequent visual reconciliation passes.

The PASS establishes an executable shared visual foundation while preserving existing page composition and protected runtime/scientific authorities.

The resulting authority sequence is:

`Brand 5.3 semantic tokens / Public Shell -> Shared Visual Grammar -> Page-family composition`

and, for the respondent surface:

`Brand 5.3 semantic tokens -> Shared Visual Grammar -> Instrument Shell presentation contract -> native System runtime`.

No universal respondent JavaScript shell was introduced.

---

## 2. Exact implementation delta

### Added

- `p120-visual-grammar-v1.0.css`
- `p120-instrument-shell-v1.0.css`
- `qa/web_design_reconciliation_pass3a_gate.mjs`
- `.github/workflows/p120-web-design-reconciliation-pass3a.yml`
- `P120_WEB_DESIGN_RECONCILIATION_PASS3A_IMPLEMENTATION.md`

### Modified

- `p120-brand-system-v1.0.css`

The only intended Brand 5.3 modification is the leading bootstrap:

```css
@import url("./p120-visual-grammar-v1.0.css?v=3a1");
@import url("./p120-instrument-shell-v1.0.css?v=3a1");
```

The PASS 3A QA gate confirmed that the Brand 5.3 stylesheet body is byte-equivalent to baseline after removing this import header.

---

## 3. Shared Visual Grammar established

`p120-visual-grammar-v1.0.css` establishes canonical role aliases and opt-in primitives for:

- Noto Serif Display — display/editorial authority;
- Noto Serif — research/general reading;
- Prata — controlled human/literary voice;
- IBM Plex Sans — functional/metadata voice;
- IBM Plex Mono — technical/notation voice;
- semantic colour aliases inherited from `--p120-brand-*`;
- global/editorial/atlas stages;
- bounded reading measures;
- sectional vertical rhythm;
- semantic colour planes;
- structural rules and rule-callouts;
- atlas grid/cell grammar;
- genuine modular-object grammar;
- controlled status and action grammar;
- responsive/reduced-motion primitives.

The file deliberately does not retarget current route-local selectors. Existing pages therefore do not become redesigned merely because the shared grammar is loaded.

---

## 4. Page-family contract established

PASS 3A reuses the already-existing Brand 5.3 `html[data-p120-page-kind]` runtime marker rather than introducing another route-detection engine.

Mapped design families:

| Existing page kind | Design family |
|---|---|
| `main` | editorial |
| `about` | editorial |
| `why-p120` | editorial / frozen contextual exception |
| `creator` | narrative |
| `extended` | explore |
| `together` | dyadic |
| `science` | science |
| `privacy` | utility |
| `terms` | utility |
| `intellectual-property` | utility |
| `contact` | utility |

System continues to use its existing native marker:

`body[data-p120-page="system"]`.

This is bound to the Instrument/System presentation family without adding public runtime ownership.

---

## 5. Instrument Shell foundation established

`p120-instrument-shell-v1.0.css` is loaded as shared presentation infrastructure but is strictly scoped to:

- future `[data-p120-shell="instrument"]`; and
- existing `body[data-p120-page="system"]`.

It establishes opt-in primitives for:

- respondent stage;
- metadata/session notation;
- question typography;
- progress;
- panels;
- response-control presentation;
- safe route presentation.

It does not override the current validated native System selectors during PASS 3A.

No `p120-instrument-shell-v1.0.js` or equivalent state-owning runtime has been created.

---

## 6. Runtime / session firewall

PASS 3A changed none of the following:

- `p120-public-runtime-v1.0.js`;
- `p120-public-styles-v1.0.css`;
- RU System respondent runtime;
- EN System respondent runtime;
- locale-isolated respondent session contract;
- coded measurement/scoring contract;
- item IDs/order;
- response values;
- scoring mathematics;
- report calculation;
- submission/intake authority;
- Supabase/Auth/RLS;
- privacy/safety authority.

The PASS 3A QA explicitly verified that both native System routes remain free of:

- `p120-brand-system-v1.0.js`; and
- `p120-public-runtime-v1.0.js`.

Therefore shared visual inheritance has not converted into public-runtime coupling.

---

## 7. Scientific authority firewall

No Scientific Base content/runtime authority was changed.

No PASS 3A mutation was made to:

- `science/index.html`;
- `en/science/index.html`;
- Scientific Base claims/status;
- validation/evidence state;
- scientific publication projection.

Science receives the shared CSS foundation only through the pre-existing Brand 5.3 CSS dependency.

---

## 8. Frozen and reference-surface preservation

PASS 3A made no route HTML/content mutation to:

- Why P-120 RU/EN;
- About RU/EN;
- Creator RU/EN;
- Extended RU/EN;
- Together RU/EN;
- Science RU/EN;
- System RU/EN.

The frozen Why composition was not reopened.

Reference-cluster surfaces were used as preservation witnesses rather than rewritten in this PASS.

---

## 9. Local shell cleanup disposition

PASS 3A intentionally does **not** delete duplicate historical shell rules from:

- `about/about-p120-v1.0.css`;
- `explore-system-v1.0.css`;
- `founder-shell-v2.css`.

This is a controlled decision, not incomplete work.

Reason:

> upstream bootstrap must be proven regression-safe before destructive cascade cleanup.

Those duplicate definitions remain classified as design-authority debt and may be neutralised/retired only in a later controlled cleanup step with screenshot parity evidence.

---

## 10. Branch QA evidence

### Dedicated PASS 3A push gate

Workflow: `P120 Web Design Reconciliation PASS 3A`  
Run: `34041287088`  
Head: `6bae35871edca3811dde151a73451b70b6f9ce6b`  
Conclusion: `SUCCESS / PASS`  
Artifact: `P120_WEB_DESIGN_PASS3A_QA`  
Artifact ID: `9991739883`  
Digest: `sha256:88d8cc4f8e9c0a2be5646df3dbda2504321eb0fd0252e5e959fb0025f928bb84`

The evidence reported:

- status `PASS`;
- production runtime changes `NONE`;
- measurement/scoring changes `NONE`;
- scientific authority changes `NONE`;
- respondent session changes `NONE`;
- failures `[]`.

---

## 11. Pull-request QA evidence

### Dedicated PASS 3A PR gate

Workflow: `P120 Web Design Reconciliation PASS 3A`  
Run: `34041315777`  
Head: `6bae35871edca3811dde151a73451b70b6f9ce6b`  
Conclusion: `SUCCESS`  
Artifact: `P120_WEB_DESIGN_PASS3A_QA`  
Artifact ID: `9991748603`  
Digest: `sha256:51526784a57c3db56a5edc3138893c2b86731784970c416ac391585d771de130`

### Actions-governance gate

Workflow: `P120 Actions Governance QA`  
Run: `34041315770`  
Head: `6bae35871edca3811dde151a73451b70b6f9ce6b`  
Conclusion: `SUCCESS`.

### Inherited browser/cross-regression gate

Workflow: `P120 WEB Main Quick Locale Theme PATCH 3 PASS 2 QA`  
Run: `34041315816`  
Head: `6bae35871edca3811dde151a73451b70b6f9ce6b`  
Conclusion: `SUCCESS`.

The inherited browser suite passed all of the following:

1. Main RU/EN quick locale/theme gate;
2. mobile quick chapter navigation gate;
3. mobile session-resume gate;
4. frozen Global Header PASS 2.1 gate;
5. original Global Header PASS 1 gate;
6. footer presentation under project/GitHub-Pages prefix.

Evidence artifact: `P120_WEB_MAIN_QUICK_LOCALE_THEME_PATCH3_PASS2_QA`  
Artifact ID: `9991822576`  
Digest: `sha256:b513421e13fc9b0afe166d4683df5df9d3dc5cbd945851b4161fb651c65330f4`.

---

## 12. Regression conclusion

No regression was detected in the inherited shell/browser gates caused by the PASS 3A bootstrap.

Specifically proven green:

- public locale/theme continuity;
- mobile chapter navigation;
- read-only session-resume continuity;
- canonical Global Header geometry/visibility;
- original header regression baseline;
- project-prefix footer behavior.

This establishes the required regression lock for subsequent page-level design reconciliation.

---

## 13. Pull-request disposition

Pull request `#32` is open and mergeable against the exact starting `main` baseline.

PASS 3A is therefore classified:

`CLOSED / CONTROLLED / MERGE-READY`

not yet:

`MERGED / PRODUCTION VERIFIED`.

Merge into `main` is a separate repository-state transition and is not claimed by this closure record.

---

## 14. PASS 3A Decision Record

**DR-3A.01** — Shared visual grammar implemented as a separate upstream CSS authority.

**DR-3A.02** — Instrument Shell foundation implemented as CSS-only, strictly scoped presentation authority.

**DR-3A.03** — Existing Brand 5.3 stylesheet remains canonical public-shell authority.

**DR-3A.04** — Brand 5.3 body preserved; PASS 3A enters through two leading imports only.

**DR-3A.05** — Existing Brand 5.3 page-kind marker reused; no duplicate route-detection runtime created.

**DR-3A.06** — Native System marker reused for Instrument/System design family.

**DR-3A.07** — System remains free of public Brand JS and generated public runtime dependencies.

**DR-3A.08** — No questionnaire, scoring, respondent-session or scientific-authority mutation occurred.

**DR-3A.09** — Why remains frozen and was not reopened.

**DR-3A.10** — Reference cluster remained unchanged during foundation bootstrap.

**DR-3A.11** — Historical About/Explore/Founder shell duplication is retained temporarily and classified as later cleanup debt.

**DR-3A.12** — Destructive shell cleanup is prohibited until separately authorised with visual parity evidence.

**DR-3A.13** — Inherited browser regression suite establishes green shell baseline for the next design implementation stage.

---

## 15. Final disposition

# `WEB DESIGN RECONCILIATION PASS 3A — CLOSED / CONTROLLED / MERGE-READY`

**Shared Visual Grammar:** IMPLEMENTED  
**Instrument Shell Foundation:** IMPLEMENTED  
**Brand 5.3 integration:** PASS  
**Public runtime mutation:** NONE  
**System runtime coupling:** NONE  
**Scientific authority mutation:** NONE  
**Measurement/scoring mutation:** NONE  
**Respondent-session mutation:** NONE  
**Why frozen boundary:** PRESERVED  
**Reference-cluster preservation:** PASS  
**Dedicated QA:** PASS  
**Actions Governance QA:** PASS  
**Inherited browser regression:** PASS  
**PR:** `#32 / OPEN / MERGE-READY`  

## Next authorised design gate

`WEB DESIGN RECONCILIATION PASS 4 — Homepage Visual Reconciliation`

PASS 4 may now consume the shared visual grammar rather than adding another isolated Homepage-only design system.
