# P-120 WEB-SCIENCE — PROD-G1.1 Registry Reconciliation Report

**Document ID:** `P120-WEBSCI-PROD-G1-REGISTRY-REPORT`  
**Version:** `v1.1`  
**Date:** `2026-09-06`  
**Baseline:** `main @ 0c9a7bdc7470dcc9eb1223ebfc15bb5bcc6f94b4`  
**Parent gate:** `WEB-SCIENCE PRODUCTION ACTIVATION GATE 1 — CLOSED / CONTROLLED / SEALED / ACTIVE IN PRODUCTION`

## 1. Finding

The production Scientific Base was fully activated and sealed at `0c9a7bdc7470dcc9eb1223ebfc15bb5bcc6f94b4`, but the historical root registry `P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json` still described a `PRODUCTION MIGRATION CANDIDATE`, referenced the pre-activation baseline `54ac77854d511dbf625b65eaac627947bb9ced98`, and recorded the Library activation as the historical Core-only state.

This is a **governance / production-state registry drift**, not a scientific-content or executable-runtime defect.

## 2. Authority constraint

The historical registry is consumed directly by the sealed `p120-scientific-base-runtime-v1.0.js`. PASS 4 / PROD-G1 hash firewalls protect that runtime and its executable registry contract. Mutating the historical registry or switching the sealed runtime in-place would reopen executable Science authority and is therefore outside this reconciliation scope.

## 3. Reconciliation

A new active governance registry is added:

`P120_WEBSCI_PRODUCTION_registry_v1.1_2026-09-06.json`

It records the actual controlled production state while preserving the historical v1.0 registry as the frozen executable input. The v1.1 registry binds:

- controlled production `main`: `0c9a7bdc7470dcc9eb1223ebfc15bb5bcc6f94b4`;
- production content head: `69aa0142c3b6b3dc70c89c2200888d69777909fd`;
- sealed Science authority: `d095cae40b33da2118e5090be2a2c837205d8b64`;
- PROD-G1 status: `CLOSED_CONTROLLED_SEALED_ACTIVE_IN_PRODUCTION`;
- post-merge final seal run `34035455628`;
- production verification run `34035455422`;
- Actions Governance run `34035455436`;
- Pages deployment run `34035454899`;
- Global Library contract `45 Core + 25 Extension = 70 Global`.

## 4. Public/scientific ceiling preserved

No scientific status is upgraded. E1 remains internal architecture verification and not empirical validation; E2 remains pending; E3 is not established. COM-12, MOT-12, SELF-12 and LIFE-12/18 remain `summary_only`; RPE-MOD remains summary-only with detailed public structure suppressed; DYADIC remains hidden. No Extended Total, causal effects or validated cross-layer synergy are authorized.

## 5. Mutation boundary

This subpass is additive governance only. It does **not** mutate:

- `science/index.html` or `en/science/index.html`;
- `p120-scientific-base-runtime-v1.0.js`;
- historical executable registry v1.0;
- PASS 4 publication projection / Global70 authority;
- questionnaires, measurement, scoring or thresholds;
- respondent wording/session state;
- persistence, report calculation or Supabase.

## 6. Gate criterion

`PROD-G1.1` may close only if executable QA proves:

1. exact ancestry from controlled `main 0c9a7bdc…` and sealed PASS 4 authority;
2. historical executable registry SHA remains exact;
3. all protected pre-existing Science/runtime files remain unchanged;
4. v1.1 binds the exact production and evidence ceilings;
5. delta scope is limited to this registry-reconciliation package;
6. unresolved registry-status delta is zero.
