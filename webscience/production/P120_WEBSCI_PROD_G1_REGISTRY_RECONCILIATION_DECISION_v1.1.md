# P-120 WEB-SCIENCE — PROD-G1.1 Registry Reconciliation Decision

**Document ID:** `P120-WEBSCI-PROD-G1-REGISTRY-DECISION`  
**Version:** `v1.1`  
**Date:** `2026-09-06`

## Decision

**Authorize controlled registry reconciliation as an additive governance subpass.**

1. `P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json` remains immutable and continues to serve as the frozen executable registry consumed by the sealed Scientific Base runtime.
2. `P120_WEBSCI_PRODUCTION_registry_v1.1_2026-09-06.json` becomes the current production-governance registry after QA and merge.
3. v1.1 may supersede v1.0 only for **production-state/governance semantics**. It does not supersede v1.0 as the runtime input and does not reopen PASS 4 scientific authority.
4. The reconciled production state is `main @ 0c9a7bdc7470dcc9eb1223ebfc15bb5bcc6f94b4`, with PROD-G1 closed, controlled, sealed and active in production.
5. The public Scientific Base ceiling remains unchanged: E1 is not empirical validation; E2 pending; E3 not established; Extended/Outcomes detail remains bounded; RPE detail suppressed; DYADIC hidden; Global70 is a reference-coverage contract, not a validity metric.
6. No questionnaire, measurement, scoring, threshold, respondent state, persistence, report-calculation, Supabase, route HTML or sealed runtime mutation is authorized in this subpass.

## Closure condition

The subpass closes only after the dedicated v1.1 QA gate passes with zero failures and the current `main` is rechecked before merge. If `main` advances, reconciliation must be repeated against the new head rather than merged blindly.

## Parent disposition

`WEB-SCIENCE PROD-G1` remains closed and is **not reopened** by this administrative reconciliation.
