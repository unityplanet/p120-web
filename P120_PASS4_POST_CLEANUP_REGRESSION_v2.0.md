# P120 Web Runtime Reconciliation — PASS 4
## Post-Cleanup Regression v2.0

**Document code:** P120-WEB-RUNTIME-PASS4-REGRESSION-002  
**Date:** 2026-09-02  
**Entry baseline:** `563c1a932702dd47c3608772311468a3f10628f1`  
**Branch gate run:** `33643697932`  
**Evidence artifact:** `9852116096` — `P120_PASS4_POST_CLEANUP_REGRESSION_V2`  
**Artifact SHA256:** `df32bcd3d76ca30286740fe719f5217d9e048b4bebbb9ab4b9c98948bc41e747`  
**Status:** PASS  

### Acceptance criterion

> Post-Science cleanup completed with no regression to production behavior, locale isolation, measurement/scoring contract, Scientific Base presentation, or routing.

### Cleanup scope

The cleanup removes 39 adjudicated obsolete post-Science operational artifacts: one-shot migration/publish/fix/probe workflows, packed Science source chunks, retired localization bind/probe assets, and the obsolete Science migration materializer. Production HTML, System runtime, Scientific Base runtime, PASS 3 session contract, measurement/scoring surfaces, design, typography and scientific content are unchanged from the entry baseline.

### Regression matrix

| Check | Result |
|---|---|
| Protected production/runtime/QA contract byte identity | PASS |
| Exact 39-file cleanup removal set | PASS |
| 20-route desktop/mobile render + transition audit | PASS |
| 40 route/device render cases | PASS |
| 205 internal production links | PASS |
| 14 critical route transitions | PASS |
| Independent 180/180 measurement parity | PASS |
| PASS 3 locale-isolated session/measurement/scoring contract | PASS |
| PASS 3 manifest SHA256 `55d91f29d80d9de9535890386d1c65ec9b558e2e4b56714eb54efa8837574b7b` | PASS |
| PASS 3 scoring SHA256 `d51dce3bb64dbe575a68111db9e47bd0ac009a9aeb1af216142ad93c9ce6f8b5` | PASS |
| Scientific Base production regression 269/269 | PASS |
| PASS 4A project-subpath Science regression 82/82 | PASS |
| GitHub Pages-compatible `/p120-web/` project-path model | PASS |

### Controlled disposition

Branch-level cleanup and post-cleanup regression are GREEN. PASS 4 is **not production-closed by this branch record alone**. Controlled PR/merge, post-merge regression on the factual `main`, and production deployment verification remain required before PASS 4 may be declared CLOSED / GREEN / PRODUCTION.

No architecture/design gate is authorized before that production closure.
