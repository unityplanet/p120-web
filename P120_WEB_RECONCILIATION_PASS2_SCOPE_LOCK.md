# P120 WEB RECONCILIATION — PASS 2 SCOPE LOCK

**Document ID:** P120-WEB-REC-PASS2-SCOPE  
**Version:** 1.0  
**Status:** ACTIVE / CONTROLLED  
**Date:** 2026-09-02

## Authorized scope

PASS 2 may modify System presentation/routing architecture only to establish native RU and native EN route ownership.

### Required invariants

- `/system/` owns Russian respondent/UI copy.
- `/en/system/` owns English respondent/UI copy.
- No post-render RU→EN DOM translator is permitted in the PASS 2 target architecture.
- Item IDs, order, response values, scoring functions and measurement meaning are unchanged.
- Existing visual design/CSS remains preserved unless a change is required to prevent route coupling.
- Scientific Base content/state is protected and is not migrated or rewritten in PASS 2.
- Shared session/storage architecture is not redesigned in PASS 2; that remains PASS 3 scope.
- No legacy files are physically deleted in PASS 2.

### Allowed route-isolation changes

- materialize English item/UI language before app execution;
- remove editorial-only mutation/injection runtimes from System route pages;
- correct nested System self-links/resume routing;
- correct auxiliary locale detection for `/en/system/` where needed for presentation language;
- add static route-authority and language-integrity gates.

## Rollback authority

Permanent pre-reconciliation rollback branch:
`freeze/p120-web-pre-reconciliation-2026-09-02`

Frozen production baseline:
`e2c8c0287b90f43aef50aa716b2a1e621855a15a`
