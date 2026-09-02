# P120 WEB RUNTIME RECONCILIATION & CODEBASE CLEANUP
## PASS 1 — Authority Inventory, Dependency Map & Rollback Freeze

**Document ID:** P120-WEB-REC-PASS1-CONTROL  
**Version:** 1.0  
**Date:** 2026-09-02  
**Status:** ACTIVE / NON-BEHAVIORAL INVENTORY PASS  
**Production modification authority:** NONE  

## 1. Purpose

Freeze the current production state, establish rollback boundaries, inventory route/runtime/localization/storage dependencies, identify canonical and legacy authorities, and protect the new Scientific Base release candidate before any structural cleanup.

## 2. Hard invariants

PASS 1 MUST NOT change respondent-visible production behavior.

The following are frozen through this pass:

- all P-120 scientific item wording currently approved for RU;
- controlled EN localization candidate produced through PASS 4;
- all scored item IDs;
- module order and item order;
- response values and scoring bindings;
- scoring logic and interpretation authority;
- visual design, typography, section order and content presentation;
- current production Scientific Base until controlled replacement;
- new Scientific Base release candidate until its own controlled production migration.

## 3. Rollback boundaries

Production baseline commit frozen before reconciliation:

`e2c8c0287b90f43aef50aa716b2a1e621855a15a`

Permanent rollback branch created:

`freeze/p120-web-pre-reconciliation-2026-09-02`

Working inventory/reconciliation branch:

`work/p120-runtime-reconciliation-pass1`

No cleanup operation is authorized directly against `main` during PASS 1.

## 4. Target route authorities

- `/` — RU Editorial authority
- `/system/` — RU System respondent authority
- `/en/` — EN Editorial authority
- `/en/system/` — EN System respondent authority

Scientific measurement identity is language-independent. Presentation language must not determine scoring.

## 5. PASS 1 completion gates

PASS 1 may close only when the repository contains:

1. rollback freeze evidence;
2. four-route authority map;
3. active runtime dependency inventory;
4. localization and language-mutation inventory;
5. storage/session/submission inventory;
6. workflow and patch inventory;
7. Scientific Base protection record;
8. legacy candidate classifications with no deletions;
9. explicit PASS 2 handoff.

## 6. Prohibited actions in PASS 1

- no deletion of runtime files;
- no removal of workflows;
- no rewrite of `/system/` or `/en/system/`;
- no item/scoring changes;
- no Scientific Base production migration;
- no post-render translator removal yet;
- no shared-storage migration yet.

All potentially obsolete components are classification-only until later passes prove zero active dependency.
