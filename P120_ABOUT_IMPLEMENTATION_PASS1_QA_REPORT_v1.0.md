# P-120 — About P-120 Implementation PASS 1
## QA Report

**Document code:** P120-WEB-ABOUT-IMP1-QA-001  
**Version:** 1.0  
**Date:** 2026-09-05  
**Status:** QA COMPLETE / GREEN  
**Validated implementation head:** `35f64ce45e948340fa2aace14137b2ef13536860`  

## 1. Final QA verdict

**PASS**

Dedicated final workflow:

`P120 About P-120 Implementation PASS 1 QA`

Run:

`33992013876` — run `#4`

Conclusion:

`success`

All substantive steps completed successfully.

## 2. Syntax preflight

Result: **PASS**

Files checked with `node --check`:

- `p120-brand-system-v1.0.js`;
- `about/about-p120-v1.0.js`;
- `qa/about_pass1_static.mjs`;
- `qa/about_pass1_render.mjs`.

## 3. Derivative conformance / link gate

Script:

`qa/about_pass1_static.mjs`

Result:

**164 / 164 PASS**  
**Failures: 0**

Coverage includes:

- existence of RU/EN About files;
- language ownership;
- H1/H2 and section structure;
- five validation classes;
- six governance stages;
- required section IDs;
- controlled terminology and governance concepts;
- Research Candidate boundary;
- P-120 / Core-120 identity distinction;
- no-diagnosis / no-self-validation / no-universal-compatibility overclaim;
- no fixed `×100` multiplier claim;
- locale counterpart routes;
- shared runtime About ownership;
- Main desktop/mobile About routing hooks;
- local-link target existence;
- canonical font-family presence in About CSS;
- About interaction runtime isolation from measurement/scoring/Supabase logic.

## 4. Responsive/render regression

Script:

`qa/about_pass1_render.mjs`

Result:

**84 / 84 PASS**  
**Failures: 0**

Scenarios:

| Locale | Viewport | Class |
|---|---:|---|
| RU | 390 × 844 | mobile |
| EN | 390 × 844 | mobile |
| RU | 768 × 1024 | tablet |
| EN | 768 × 1024 | tablet |
| RU | 1440 × 1000 | desktop |
| EN | 1440 × 1000 | desktop |
| RU | 2560 × 1440 | UHD |
| EN | 2560 × 1440 | UHD |

Checks include:

- route HTTP success;
- one visible H1;
- nine controlled About sections;
- no horizontal overflow;
- full long-page layout;
- visible final definition;
- current-page navigation state;
- zero console errors;
- zero page errors;
- mobile drawer open and Escape close;
- Graphite theme transition;
- Museum theme transition;
- full-page screenshot capture.

## 5. Existing shared-header code-integrity regression

Script:

`qa/global_header_code_integrity_pass2.mjs`

Result:

**PASS_WITH_HARDENING_NOTES**

- blocking findings: `0`;
- hardening notes: `3`;
- source files scanned: `159`;
- runtime cases: `16`;
- initial hidden→visible cases: `0`.

The notes are legacy/shared-runtime inventory observations and are not new About defects:

1. one legacy external `.brand-mark display:none` rule remains in the wider source graph;
2. the inventory gate describes a pre-canonical CSS timing concern from the older runtime pattern;
3. the inventory gate describes a broad observer/resume-rail pattern.

These observations do not block this PASS and are reconciled by the dedicated hardening gate below, which passed with zero failures.

## 6. Existing shared-header hardening regression

Script:

`qa/global_header_code_hardening_pass21.mjs`

Result:

**PASS**

- source routes: `20`;
- runtime route/viewport cases: `40`;
- saved-session idempotency cases: `1`;
- failures: `0`.

This is the controlling regression result for the already hardened shared header/runtime behaviour.

## 7. Actions governance QA

Workflow:

`P120 Actions Governance QA`

Run:

`33992013878` — run `#11`

Result:

**SUCCESS**

## 8. Evidence artifact

Artifact name:

`P120_ABOUT_IMPLEMENTATION_PASS1_QA`

Artifact ID:

`9976935681`

Size:

`12,878,784 bytes`

Digest:

`sha256:a7e7d70aae8c63582c86417972d97ccf86381b697c8228ba48a31e61a725e327`

Uploaded evidence files:

`54`

Retention window from creation:

30 days.

## 9. Superseded QA attempts

### Run #1 — `33991471133`

Failure class: **QA harness / terminology case sensitivity**.

The static test expected lower-case Russian terms as exact case-sensitive substrings. The gate was normalized to case-insensitive lexical comparison. No implementation content correction was required.

### Run #2 — `33991514769`

Failure class: **QA harness / hidden theme control interaction**.

Playwright attempted to click a theme option while its `<details>` popover was closed. The test was corrected to exercise the actual control state.

### Run #3 — `33991636436`

Failure class: **QA harness / second theme transition determinism**.

The second theme interaction remained visibility-dependent after the first transition. The test was made deterministic by explicitly opening the details element before dispatching each tested option.

### Run #4 — `33992013876`

**FULL SUCCESS.**

No substantive About content or protected scientific/measurement logic was changed in response to runs #1–#3.

## 10. QA conclusion

No unresolved implementation-level QA blocker remains.

**FINAL QA STATUS: GREEN / COMPLETE**

Release remains separately held pending PASS 10 source-authority closure.