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

## 6. Executable pre-merge evidence

Final corrected branch run `34037519283` on head `b5f7a5398be7a3646d5601d6ae862c30de49d0bf` completed **SUCCESS**.

- PROD-G1.1 registry reconciliation gate: **62/62 PASS**, failed `0`;
- inherited PROD-G1 production-boundary regression: **31/31 PASS**, failed `0`;
- PASS4A publication-projection regression: **2970/2970 PASS**, failed `0`;
- read-only repository cleanliness check: **PASS**;
- QA artifact: `9990632746`;
- QA artifact digest: `sha256:e83bed9377a083095040b8943bd138e8aef12782f98d05e88304e7c82602de23`.

The first diagnostic runs are not closure evidence. They identified a transcription error in the newly authored package's copy of the historical registry SHA. The protected historical file itself never changed. The final gate binds its actual frozen SHA-256:

`38b706b38f8f19f60c5917874b8371661340bb0cf30059fe9a7de98d16251f5e`

No scientific/runtime drift was found.

## 7. Gate disposition

All pre-merge executable criteria are satisfied and unresolved technical registry delta is `0` on the candidate branch. The subpass is **READY FOR CONTROLLED PR MERGE**, not yet closed at production level.

Closure still requires:

1. current `main` recheck immediately before PR/merge;
2. PR-level reconciliation and governance QA;
3. controlled merge into actual `main`;
4. post-merge registry QA on the resulting production HEAD;
5. final production closure record / package verification before any `CLOSED / CONTROLLED / SEALED` declaration.
