# P-120 — About P-120 Implementation PASS 1
## Closure Reconciliation Record

**Document code:** P120-WEB-ABOUT-IMP1-CLOSURE-001  
**Version:** 1.0  
**Date:** 2026-09-05  
**Status:** CLOSED / GREEN / CONTROLLED CANDIDATE / RELEASE-HELD  
**Authority:** P-120 Research System / Architecture Narrative Derivative Implementation  
**Repository:** `unityplanet/p120-web`  
**PR:** #18 — `IMPLEMENTATION PASS 1 — About P-120 controlled derivative`  

## 1. Closure decision

**IMPLEMENTATION PASS 1 — About P-120 is technically closed.**

The implementation acceptance criterion was:

> Produce a first-class bilingual About P-120 derivative surface, connect it to the existing public navigation architecture, preserve the frozen scientific and governance boundaries inherited from the Architecture / About the System narrative, and demonstrate responsive/render and shared-header regression safety without modifying measurement, scoring, respondent data, Scientific Base content, Why P-120 narrative, or Creator narrative.

The criterion is satisfied at validated implementation head:

`35f64ce45e948340fa2aace14137b2ef13536860`

Final dedicated QA run:

- workflow: `P120 About P-120 Implementation PASS 1 QA`
- run: `33992013876`
- run number: `#4`
- conclusion: **SUCCESS**
- evidence artifact: `P120_ABOUT_IMPLEMENTATION_PASS1_QA`
- artifact ID: `9976935681`
- artifact digest: `sha256:a7e7d70aae8c63582c86417972d97ccf86381b697c8228ba48a31e61a725e327`
- artifact size: `12,878,784 bytes`
- retained evidence files uploaded: `54`

Repository Actions governance at the same implementation head also passed:

- workflow: `P120 Actions Governance QA`
- run: `33992013878`
- run number: `#11`
- conclusion: **SUCCESS**

## 2. Release disposition

Technical closure does **not** authorize production release.

The PR remains:

- **OPEN**;
- **DRAFT**;
- **NOT MERGED**;
- **NOT PRODUCTION**.

The controlled release dependency remains the Architecture / About the System source-authority gate:

**P120-ARCH-SYS-001 PASS 10 — final master reconciliation / authority freeze.**

Therefore the correct state is:

**Implementation = CLOSED / GREEN**  
**Release = HELD pending PASS 10**  
**Production = UNCHANGED**

No merge should occur under this PASS until the source-authority gate either confirms the derivative or issues a controlled correction.

## 3. Entry baseline and implementation head

**Entry production baseline / PR base:**

`67d2ae422e422be20eae6bb086c51adf7de173bb`

**Validated implementation head:**

`35f64ce45e948340fa2aace14137b2ef13536860`

At technical closure, the implementation branch was:

- `12` commits ahead of baseline;
- `0` commits behind;
- implementation delta: `8` files;
- additions: `740`;
- deletions: `4`.

The closure documentation added after this validated head is governance-only. It does not redefine the technical implementation state proven by run `33992013876`.

## 4. Implemented public surfaces

The controlled candidate introduces two first-class derivative routes:

- RU: `/about/`
- EN: `/en/about/`

The page is structured as a system explanation rather than a replacement for Why P-120 or From the Creator.

The derivative contains the following controlled layers:

1. from test to architecture;
2. research object / construct separation;
3. multi-layer topology;
4. response-to-result chain;
5. scientific status and differentiated validation;
6. governed development;
7. human authority and computational environment;
8. explicit claim boundaries;
9. final system definition.

The implementation also preserves the P-120 / Core-120 identity distinction and the Research Candidate ceiling.

## 5. Navigation reconciliation

`About P-120 / О P-120` is promoted from a legacy Main-page anchor destination to a first-class public route.

The shared brand/navigation runtime was changed only to support this destination model:

- `about` added to page-kind detection;
- shared static navigation receives the About route;
- Main desktop `О P-120 / About P-120` button is rebound from `#why-important` to `/about/` or `/en/about/`;
- Main mobile drawer receives a distinct About destination;
- locale counterpart routing supports RU ↔ EN About routes.

This is an intentional **public navigation behaviour change**. It must not be represented as `Software Behaviour = NONE`.

## 6. Frozen/local-authority boundaries reconciled

The implementation diff does **not** modify the source files for:

- `/why-p120/`;
- `/en/why-p120/`;
- `/creator/`;
- `/en/creator/`;
- `/science/`;
- `/en/science/`;
- `/system/`;
- `/en/system/`;
- `/index.html`;
- `/en/index.html`.

Accordingly:

- Why P-120 narrative/composition remains unchanged;
- Creator narrative remains unchanged;
- Scientific Base scientific content remains unchanged;
- System measurement/respondent implementation remains unchanged;
- Main-page narrative content remains unchanged;
- only shared navigation routing is reconciled through `p120-brand-system-v1.0.js`.

## 7. Scientific and governance boundary reconciliation

The candidate page explicitly preserves the current controlled limits:

- P-120 is not reduced to one test or one global score;
- Core-120 remains a distinct frozen 120-item measurement identity inside the wider P-120 architecture;
- activation, motivation, behaviour, attachment, communication, embodiment and preference are not treated as interchangeable constructs;
- dyadic comparison is not converted into a universal compatibility percentage;
- internal verification, empirical validation, synthetic technical validation, production QA and independent audit remain different evidence classes;
- Research Candidate status is unchanged;
- self-governing research architecture is presented only as a qualified governance concept, not autonomy;
- governance mechanisms are not represented as scientific validity;
- governed organisational memory and second-order research architecture remain qualified concepts;
- Founder-governed computational research environment is transparent about modern computational/language-model capabilities while retaining final human authority;
- no fixed quantitative productivity multiplier is claimed;
- the page explicitly rejects diagnosis, hidden-objective-truth framing, universal-score framing and self-validation.

## 8. QA closure matrix

### 8.1 Syntax preflight

**PASS**

Checked:

- `p120-brand-system-v1.0.js`;
- `about/about-p120-v1.0.js`;
- `qa/about_pass1_static.mjs`;
- `qa/about_pass1_render.mjs`.

### 8.2 Derivative conformance and local-link gate

**164 / 164 PASS**  
**Failures: 0**

This gate verifies bilingual structure, mandatory terminology, scientific boundaries, route ownership, link targets, font-family presence and absence of prohibited overclaims.

### 8.3 Responsive/render regression

**84 / 84 PASS**  
**Failures: 0**

Tested RU and EN at:

- `390 × 844`;
- `768 × 1024`;
- `1440 × 1000`;
- `2560 × 1440`.

The gate includes:

- HTTP route availability;
- heading/section structure;
- horizontal-overflow detection;
- long-page completeness;
- final-definition layout;
- current-route state;
- console/page errors;
- mobile drawer open/Escape close;
- Graphite and Museum theme transitions;
- full-page screenshots for all scenarios.

### 8.4 Existing shared-header code-integrity regression

**PASS_WITH_HARDENING_NOTES**  
**Blocking findings: 0**  
**Runtime cases: 16**

Three previously known/shared hardening notes were reported by the older code-integrity inventory gate. They do not constitute an About PASS 1 blocker and are superseded for closure purposes by the dedicated hardening gate below.

### 8.5 Existing shared-header hardening regression

**PASS**

- source routes: `20`;
- route/viewport cases: `40`;
- saved-session idempotency cases: `1`;
- failures: `0`.

This confirms that the shared brand runtime change does not reopen the previously hardened header/utility behaviour.

### 8.6 Actions governance

**PASS**

Run `33992013878` completed successfully at the same validated implementation head.

## 9. Superseded failed QA attempts

Three earlier CI attempts are retained as trace evidence but are **not implementation failures**:

1. run `33991471133` — static gate was case-sensitive against Russian controlled terms; QA harness corrected;
2. run `33991514769` — Playwright attempted to click a hidden theme option without opening the `<details>` control; QA harness corrected;
3. run `33991636436` — second theme transition was still exercised through a visibility-dependent interaction; QA harness made deterministic.

No About content, measurement, scoring or scientific-authority correction was required by these failures. The final run `33992013876` passed the complete matrix.

## 10. Residual risk and open dependency

There is **no unresolved technical blocker inside Implementation PASS 1**.

One external governance dependency remains:

**PASS 10 source-authority freeze is not yet recorded as complete in this implementation branch.**

Consequently:

- the derivative must remain a controlled candidate;
- the PR must remain draft/unmerged;
- any PASS 10 lexical normalization must be applied as a narrow derivative correction and rerun through the same QA gate;
- no production claim may be made before merge/deployment evidence exists.

## 11. Corrected no-change / change declaration

### Changed

- Public About content: **YES — new RU/EN derivative pages**.
- Public presentation: **YES — new About editorial surface**.
- Public navigation behaviour: **YES — About becomes a first-class route**.
- Shared brand/navigation runtime: **YES — routing-only reconciliation**.
- QA/governance infrastructure: **YES — dedicated PASS 1 gates added**.

### Unchanged

- Measurement: **NONE**.
- Scoring: **NONE**.
- Thresholds: **NONE**.
- Item wording / IDs / order: **NONE**.
- Evidence-status model: **NONE**.
- Research Candidate scientific status: **UNCHANGED**.
- Safety/privacy policy: **NONE**.
- Respondent data model / persistence: **NONE**.
- Supabase / RLS / auth: **NONE**.
- Report calculation / interpretation engine: **NONE**.
- Why P-120 narrative/composition: **NONE**.
- Creator narrative: **NONE**.
- Scientific Base scientific content: **NONE**.
- System questionnaire/runtime source: **NONE**.
- Governance ontology: **NONE**; only existing governed concepts are expressed on the derivative surface.

## 12. Freeze rule after closure

Until PASS 10:

- do not merge PR #18;
- do not deploy the candidate as production;
- do not broaden About into Why P-120 or Creator content;
- do not alter Science/System measurement authority under this PASS;
- do not add new scientific claims under the label of implementation polish;
- any correction must be traceable to PASS 10 authority or a reproducible implementation defect;
- after any implementation-surface correction, rerun the dedicated About PASS 1 workflow.

## 13. Final disposition

**P-120 — About P-120 Implementation PASS 1**  
**FINAL TECHNICAL STATUS: CLOSED / GREEN**  
**DERIVATIVE STATUS: CONTROLLED CANDIDATE**  
**RELEASE STATUS: HELD PENDING PASS 10**  
**PR #18: DRAFT / OPEN / NOT MERGED**  
**PRODUCTION: UNCHANGED**

The next authorized action is **PASS 10 source-authority reconciliation**. If PASS 10 confirms the derivative without material change, the implementation may proceed to controlled merge/release reconciliation. If PASS 10 requires lexical normalization, only the affected derivative text is reopened and the full About QA gate must be rerun.