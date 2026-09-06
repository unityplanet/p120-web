# P-120 WEB-SCIENCE PROD-G1 — Scientific Base Baseline Reconciliation Decision

**Document ID:** P120-WEBSCI-PROD-G1-SCIENTIFIC-BASE-BASELINE-RECONCILIATION-DECISION  
**Version:** v1.0  
**Date:** 2026-09-06  
**Status:** PASS / BASELINE RECONCILED / CONTROLLED  
**Parent gate:** WEB-SCIENCE PRODUCTION ACTIVATION GATE 1 — OPEN

## Decision

1. Retain `6ef15f83ab1d7db132151b0d2216ba788f65ec71` as the historical Scientific Base baseline for `science/index.html`, `en/science/index.html`, `language-switch-v1.0.js` and `P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json`.
2. Supersede the historical baseline only for `p120-scientific-base-runtime-v1.0.js` with the exact sealed PASS 4 runtime authority from `d095cae40b33da2118e5090be2a2c837205d8b64`.
3. Accept the supersession only because the sealed runtime preserves the complete legacy Core prefix and adds the controlled PASS 4B publication-renderer loader without storage/session access or measurement/scoring/threshold mutation.
4. Accept workflow run `34027046342`: baseline reconciliation QA 36/36 PASS, independent Scientific Base browser QA 269/269 PASS and RU/EN single-owner language-switch regression PASS.
5. Preserve the sealed WEB-SCIENCE EXT PASS 4 scientific/public ceiling without upgrade.
6. Do not retroactively rewrite historical Scientific Base or PASS 4 records.
7. Keep WEB-SCIENCE PROD-G1 OPEN until this reconciliation is merged into production `main`, the updated production gate passes on `main`, live-production smoke is completed, and the mandatory PROD-G1 closure package is independently verified.
