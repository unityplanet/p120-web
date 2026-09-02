# P120 WEB — PASS 4A
## Deployment-Path Reconciliation

**Document code:** P120-WEB-PASS4A-001  
**Version:** 1.0  
**Date:** 2026-09-02  
**Status:** PRE-MERGE PASS / RELEASE CLOSURE PENDING  
**Production baseline:** `f46b7335e47d75672424136979f91a1a3997aa37`  
**Controlled branch:** `work/p120-deployment-path-reconciliation-pass4a`

## 1. Purpose

PASS 4A is limited to deterministic GitHub Pages project-subpath resolution for the dedicated Scientific Base routes:

- `/p120-web/science/`
- `/p120-web/en/science/`

General PASS 4 cleanup remains on HOLD. No design, typography, scientific-content, measurement, scoring or respondent-session changes are authorized in this gate.

## 2. Entry diagnosis

### RU

At production baseline, `/p120-web/science/` declares `<base href="../">`. The Scientific Base runtime was then referenced as `../p120-scientific-base-runtime-v1.0.js?v=sbm10`.

Under GitHub Pages this resolved to:

`https://unityplanet.github.io/p120-scientific-base-runtime-v1.0.js?v=sbm10`

which is outside `/p120-web/` and returned HTTP 404. Consequently the Scientific Evidence Atlas did not initialize on live RU Science.

### EN

At production baseline, `/p120-web/en/science/` declares `<base href="../">`. The EN localization runtime was referenced as `../../p120-en-science-localization-runtime-v1.0.js?v=ensci10`.

Under GitHub Pages this resolved to:

`https://unityplanet.github.io/p120-en-science-localization-runtime-v1.0.js?v=ensci10`

which is outside `/p120-web/` and returned HTTP 404. The Scientific Base Atlas itself loaded, but the intended EN localization layer was incomplete.

The previously observed `/en/science/en/` URL is explicitly outside PASS 4A. Diagnostic Reconciliation adjudicated it as non-reproducible transient QA/DOM-state evidence; PASS 4A contains no special-case correction for that URL.

## 3. Minimal correction

Only two production path tokens are changed:

- RU `science/index.html`: `../p120-scientific-base-runtime-v1.0.js` → `p120-scientific-base-runtime-v1.0.js`;
- EN `en/science/index.html`: `../../p120-en-science-localization-runtime-v1.0.js` → `../p120-en-science-localization-runtime-v1.0.js`.

No bootstrap/runtime architecture is rewritten.

## 4. QA model correction

PASS 4A QA serves the repository from its parent directory and opens the Science routes under the actual project prefix `/p120-web/`. This prevents the former domain-root local model from masking project-subpath path-resolution defects.

The gate verifies desktop and mobile for both locales, network-resolved runtime URLs, HTTP status, path containment, Atlas visibility, Scientific Base status, base selection, horizontal overflow, EN visible Cyrillic, browser errors and request failures.

## 5. Protected contract

The gate normalizes the two authorized path tokens back to the production baseline and requires the full RU/EN Science HTML files to be otherwise byte-identical to baseline.

It also verifies that the following are untouched:

- RU/EN Editorial routes;
- RU/EN System routes;
- PASS 3 session contract;
- submission intake;
- manual-report handoff;
- Scientific Base runtime;
- EN Science localization runtime;
- Scientific Base production registry.

Therefore questionnaire wording, item IDs/order, response values, 180-item measurement structure, scoring mathematics, interpretation logic, locale-isolated respondent sessions and scientific publication boundaries are outside the PASS 4A mutation set.

## 6. Legacy Extended block

`#extended-research-set` is intentionally **NOT MODIFIED** in PASS 4A. Its DOM reconciliation remains reserved for a separate PASS 4B after explicit Sequence & Action authorization.

## 7. Pre-merge evidence

**Project-subpath / Science QA workflow:** `P120 PASS 4A Deployment Path Gate`  
**Run:** `33639964297`  
**Result:** SUCCESS  
**Browser checks:** `82 / 82 PASS`  
**Failures:** `0`  
**Protected-contract job:** PASS  
**QA artifact:** `P120_PASS4A_DEPLOYMENT_PATH_QA` / artifact ID `9850434211`

The first branch gate confirms that both corrected runtimes resolve inside `/p120-web/`, both Science routes initialize the Scientific Evidence Atlas, all five public Scientific Base states are selectable, EN contains no unintended visible Cyrillic, and no tested asset request escapes the project path.

## 8. Closure rule

PASS 4A is **not closed by branch QA**.

Closure requires all of the following:

1. project-subpath local QA PASS;
2. branch Science regression PASS;
3. controlled PR and merge to `main`;
4. post-merge PASS 4A QA on the actual merged `main`;
5. GitHub Pages deployment SUCCESS from the merge HEAD;
6. actual live RU verification PASS;
7. actual live EN verification PASS.

Until all conditions are satisfied:

**PASS 4A = RELEASE CLOSURE PENDING**  
**General PASS 4 Cleanup = HOLD**  
**PASS 4B = NOT STARTED**
