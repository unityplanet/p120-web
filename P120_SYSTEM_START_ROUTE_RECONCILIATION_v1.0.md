# P120 System Start Route Reconciliation v1.0

**Document code:** P120-WEB-QA-SRR-1.0  
**Date:** 2026-09-02  
**Status:** PASS / READY FOR CONTROLLED MERGE  
**Scope:** direct `?start=1` normalization on canonical RU/EN System routes after native route materialization  
**Scientific / scoring authority:** OUT OF SCOPE / UNCHANGED

## 1. Trigger

After the accepted render/localization closure was merged, the existing `P-120 Native System Route Build` materialized `en/system/index.html` from the RU System source. The RU source still carried the legacy nested redirect target `system/` for a direct `?start=1` query, so native materialization restored the same legacy target in EN.

This was a route-normalization defect only. It did not alter questionnaire content, item IDs/order, response values, measurement structure, scoring, interpretation logic, scientific constructs, or legal wording.

## 2. Controlled correction

Both canonical System sources now normalize a direct start query to the current pathname:

`if(entryParams.get('start')==='1'){location.replace(location.pathname);return}`

This removes the query without constructing a nested `/system/system/` path.

## 3. Generator stability

The native route generator was executed against the corrected sources and produced **no diff** for `system/index.html` or `en/system/index.html`.

**Generator idempotence:** PASS.

## 4. Focused route gate

Workflow: `P120 System Start Route Gate v1`, run `33621193156`, conclusion `success`.

- `/system/?start=1` → `/system/` — PASS
- `/en/system/?start=1` → `/en/system/` — PASS
- `/?start=1` → `/system/` — PASS
- `/en/?start=1` → `/en/system/` — PASS
- Query removed after normalization — PASS
- RU items / unique IDs — 180 / 180
- EN items / unique IDs — 180 / 180
- RU/EN item-order parity — PASS
- RU/EN module-order parity — PASS
- RU/EN System route guard present — PASS

## 5. Protected scope confirmation

- Questionnaire wording: **UNCHANGED**
- Item IDs/order/response values: **UNCHANGED**
- Measurement/scoring: **UNCHANGED**
- Interpretation logic: **UNCHANGED**
- Scientific Base: **UNCHANGED**
- Legal wording: **UNCHANGED**

## 6. Decision

**SYSTEM START ROUTE RECONCILIATION: PASS.**  
**NATIVE ROUTE GENERATOR STABILITY: PASS.**  
**READY FOR CONTROLLED MERGE AND REDEPLOYMENT.**
