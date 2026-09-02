# P120 WEB RECONCILIATION PASS 1 — LEGACY / CLEANUP CLASSIFICATION POLICY

**Document ID:** P120-WEB-REC-PASS1-LEGACY-POLICY  
**Version:** 1.0  
**Status:** FROZEN POLICY  

## Classification states

### CANONICAL
Directly owns current intended production behavior or controlled content.

### SHARED
Intentionally consumed across two or more canonical routes or runtime layers.

### ROUTE-SPECIFIC
Intentionally owned by exactly one route/language implementation.

### LEGACY-CANDIDATE
Appears superseded or structurally obsolete, but removal has not yet been proven safe.

### ARCHIVE-CANDIDATE
Historical implementation material expected not to execute in production. Must still be reference-checked before physical removal from the active branch.

### UNKNOWN-DEPENDENCY
Purpose or active references are not yet sufficiently established. Protected from deletion.

## Deletion gate

A file may be physically removed in PASS 4 only if:

1. no canonical HTML/JS/CSS imports it;
2. no active build workflow generates or consumes it;
3. no protected Scientific Base build consumes it;
4. no current route requires its side effects;
5. replacement behavior has passed route regression;
6. rollback branch retains the pre-cleanup version;
7. removal does not alter frozen text, design or measurement/scoring output.

## Special treatment of generated and patch files

The words `patch`, `fix`, `reconciliation`, `migration`, `apply`, `old`, `v1`, or similar are not deletion evidence. Historical-looking files may still be active dependencies.

## PASS 1 rule

PASS 1 may classify but may not delete.
