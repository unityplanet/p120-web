# P120 WEB RECONCILIATION PASS 1 — RISK REGISTER

**Document ID:** P120-WEB-REC-PASS1-RISK  
**Version:** 1.0  
**Status:** ACTIVE CONTROL RECORD  

| Risk | Evidence / mechanism | Current control | Next authorized action |
|---|---|---|---|
| RU/EN UI contamination | EN System inherits RU System and uses post-render translation | Freeze current behavior; no patching in PASS 1 | PASS 2 native route-language assembly |
| Runtime mutation race | Multiple MutationObserver/navigation layers can recreate route UI | Inventory observers; no removals yet | PASS 2 ownership separation |
| Shared session route jumps | RU/EN use shared `p120_web_prototype_v01` state including screen/progress | Preserve storage in PASS 1 | PASS 3 state contract/migration |
| Incorrect locale metadata | Auxiliary runtimes use `/en/`-only regex and may classify `/en/system/` as RU | Recorded as defect; no hotfix in PASS 1 | PASS 3 locale contract |
| Accidental scoring drift | Cleanup could touch instrument/scoring source | 180-ID and scoring invariants frozen | Automated parity gates before each later merge |
| Loss of existing design/text | Legacy patch may still own visible UI | No deletion before reference proof | PASS 4 zero-reference deletion only |
| Scientific Base loss | New candidate and current production materials coexist with historical science build files | Protected science record | Migration after PASS 3, cleanup after migration |
| Hidden workflow dependency | Historical apply/reconciliation workflows may still generate active files | No workflow deletion in PASS 1 | PASS 4 dependency graph + zero-reference proof |
| English item/source divergence | EN candidate is layered over inherited RU payload | Protect EN PASS 4 manifests and ID binding | PASS 2 build-time locale manifests |
| Rollback failure | Structural cleanup could make recovery difficult | Frozen baseline branch at production HEAD | Never force-move rollback branch |

## Severity control

No later pass may proceed with an unresolved HIGH risk that can affect item identity, scoring, response persistence, route language authority, or Scientific Base content.
