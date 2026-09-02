# P120 WEB RECONCILIATION PASS 1 — SCIENTIFIC BASE PROTECTION RECORD

**Document ID:** P120-WEB-REC-PASS1-SCIENCE-PROTECT  
**Version:** 1.0  
**Date:** 2026-09-02  
**Status:** PROTECTED / MIGRATION DEFERRED  

## 1. Protected states

PASS 1 recognizes two separate Scientific Base states:

### A. Current production Scientific Base

Status: **CURRENT PRODUCTION AUTHORITY**  
Action in PASS 1: **NO CHANGE**

### B. New Scientific Base candidate

Status: **PROTECTED RELEASE CANDIDATE / NOT YET PRODUCTION AUTHORITY**  
Action in PASS 1: **NO CHANGE / NO MERGE / NO CLEANUP**

The candidate must be migrated only after RU/EN route authority is stabilized and before dead-code removal, so cleanup is evaluated against the future production architecture rather than the obsolete science implementation.

## 2. Repository evidence to preserve

Repository science-related material includes release/control artifacts and build materials associated with public science work, including existing `P120_SCIENTIFIC_CONCEPT_PUBLIC_*`, science navigation/reconciliation records, `apply-science-*` workflow history, and staged/chunked science build material under `.github`.

PASS 1 explicitly forbids treating such material as disposable merely because it appears historical, duplicated, compressed, chunked or generated.

## 3. Cleanup rule

No science-related file may receive `LEGACY-CANDIDATE` deletion authority until all of the following are true:

1. the exact new Scientific Base production package has been identified;
2. its route and language ownership are known;
3. its active assets and navigation dependencies have been traced;
4. a production migration has completed successfully;
5. the old Scientific Base has a rollback reference;
6. zero-reference status has been demonstrated for each removal candidate.

## 4. Migration sequence

Scientific Base migration remains scheduled after PASS 3 and before PASS 4:

`PASS 1 inventory → PASS 2 route separation → PASS 3 shared measurement/session contract → NEW SCIENTIFIC BASE production migration + QA → PASS 4 dead-code cleanup → PASS 5 regression/freeze`

## 5. Protection conclusion

Scientific Base content and its release candidate are outside the destructive scope of PASS 1. The current reconciliation work is infrastructure preparation only.
