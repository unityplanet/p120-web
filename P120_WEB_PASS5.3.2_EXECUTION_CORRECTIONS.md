# P-120 WEB-EXPLORE PASS 5.3.2 — Execution Corrections

## CONTROL METADATA

- **Document ID:** P120-WEB-PASS5.3.2-EXEC
- **Version:** 1.0
- **Status:** PASS
- **Date:** 2026-09-01
- **Authority:** P120 Internal Documentation Standard; accepted WEB-EXPLORE PASS 5.3 continuation
- **Scope:** public web presentation / navigation execution only
- **Scientific impact:** NONE
- **Measurement / scoring impact:** NONE
- **Backend / persistence impact:** NONE
- **Implementation gate SHA:** `98b6b416c362c48b2da0f8234d36c441d782aeab`

## 1. PURPOSE

Close the residual execution defects discovered after sitewide brand unification and before the Sitewide Typography Audit.

The correction scope covered:

1. Saved Research plane / chapter-navigation stacking and width reconciliation.
2. Main theme-selector geometry and state-label reconciliation.
3. Chapter 04 **«Ещё глубже / Go deeper»** production navigation ownership.
4. Regression protection against the already reconciled Science / Scientific Base routing.

## 2. SOURCE RECONCILIATION

The principal Chapter 04 defect was not a cache defect and not a Git conflict.

The standalone `chapter-navigation-v1.0.js` had already been corrected to target `#extended-research-entry`, but the live main page still executes an older Chapter Navigation copy embedded in `p120-public-runtime-v1.0.js`. That bundled copy retains the legacy target `extended-research-set`, which is retired/hidden by the current Explore reconciliation layer.

Therefore editing only the standalone chapter-navigation source could not close the production defect.

The Science workstream had independently established a valid post-bundle reconciliation pattern through `science-navigation-reconciliation-v1.0.js`. PASS 5.3.2 uses the same ownership principle without modifying Scientific Base content or its routing contract.

## 3. IMPLEMENTATION

### 3.1 Chapter 04 production owner

Created:

- `extended-chapter-navigation-reconciliation-v1.0.js`

The runtime:

- captures only `[data-chapter-jump="extended"]` and `[data-chapter-mobile="extended"]`;
- prevents the stale bundled Chapter 04 handler from executing;
- remains on the main-page route;
- performs deterministic owned scrolling to `#extended-research-entry`;
- compensates for topbar + chapter-navigation height;
- restores Chapter 04 active state after the jump;
- does not intercept the explicit CTA that opens `/extended/`.

### 3.2 RU / EN production loading

`science-navigation-reconciliation-v1.0.js` remains the already-loaded post-bundle navigation bridge on both RU and EN main pages.

A narrow sibling-loader was appended to it so that the new Extended Chapter 04 owner is resolved from the reconciliation runtime URL itself. This avoids locale-relative path divergence between `/` and `/en/` and avoids reopening the large production bundle.

### 3.3 QA gate

`.github/workflows/qa-web-explore-pass53.yml` was extended to:

- include both reconciliation runtimes in path ownership;
- syntax-check both files;
- assert the `extended-research-entry` target contract;
- assert Chapter 04 selector ownership;
- run PASS 5.3.2 before the broader regression suites.

## 4. ACCEPTED NAVIGATION CONTRACT

| Control | Accepted destination |
|---|---|
| Home Chapter 04 — Ещё глубже / Go deeper | Main page → `#extended-research-entry` |
| CTA inside Хотите глубже? / Want to go deeper? | Dedicated `/extended/` route |
| Explore → deeper research | Dedicated `/extended/` route |
| Home Chapter 05 — Наука / Science | Main page → `#science-foundation` |
| Global Научная база / Scientific Base | Dedicated Science screen |

Chapter navigation and global/Explore routing are intentionally separate ownership layers.

## 5. PRESERVATION FIREWALL

The corrective pass did **not** modify:

- questionnaire items or response semantics;
- scoring, thresholds or report rules;
- session persistence or Supabase/backend contracts;
- scientific constructs or evidence content;
- Scientific Concept Paper PDF assets;
- Why P-120 frozen body composition;
- Extended Research scientific/module content.

The production bundle was deliberately not rebuilt during this correction.

## 6. VERIFICATION EVIDENCE

### PASS 5.3.2 targeted gate

GitHub Actions run: `33552883074`

Observed Chapter 04 execution at 1440 × 1000:

- before click: `scrollY = 1050`
- after click: `scrollY = 17851`
- `#extended-research-entry` top after reconciliation: `145.984375 px`
- route remained `/`
- target title: `Хотите глубже?`
- Chapter 04 active state: TRUE

Result:

- **105 checks**
- **0 failures**
- **8 screenshots**

### Full PASS 5.3 regression

- **632 checks**
- **0 failures**
- **64 screenshots**

### PASS 5.3.1 regression

- **29 checks**
- **0 failures**

### Controlled evidence artifact

- Artifact: `P120_WEB_PASS53_QA_EVIDENCE`
- Artifact ID: `9818222193`
- Files uploaded: `84`
- SHA-256: `94ad336bd98b64dac95457ad343b399b4a254151ce91c356c6ff4c8a5cf6a401`

### GitHub Pages

Pages run: `33552882026`

- build: PASS
- deploy: PASS
- report-build-status: PASS

## 7. ACCEPTANCE ADJUDICATION

**WEB-EXPLORE PASS 5.3.2: PASS**

The residual execution defect is closed at the production-runtime ownership layer. Chapter 04 now has a deterministic main-page destination, while the dedicated Extended Research route and the previously reconciled Science routing remain separate and preserved.

## 8. NEXT AUTHORIZED GATE

**Sitewide Typography Audit** may begin from the post-PASS-5.3.2 web baseline after confirming the documentation-only closeout commit introduces no source regression.
