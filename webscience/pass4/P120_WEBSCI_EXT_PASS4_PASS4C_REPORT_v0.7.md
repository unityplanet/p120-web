# P-120 WEB-SCIENCE EXT PASS 4C — Core-45 / Global-70 Library Integration

**Document ID:** P120-WEBSCI-EXT-004-PASS4C-REPORT  
**Version:** v0.7  
**Date:** 2026-09-06  
**Status:** PASS / CLOSED / CONTROLLED  
**Parent PASS:** WEB-SCIENCE EXT PASS 4 remains OPEN.

## Scope
PASS 4C integrates the frozen Core-45 bibliography and the controlled REF-046..REF-070 extension into one navigable Global-70 scientific-library layer on the controlled pre-production branch. Production main is not merged.

## Identity contract
The frozen Core source object contains citation and DOI fields only; it contains no native REF IDs, module bindings or per-reference evidence roles. PASS 4C therefore assigns REF-001..REF-045 strictly by frozen Core array order while preserving citation/DOI identity. No Core module or evidence-role metadata is inferred. REF-046..REF-070 retain their controlled PASS 4 module and role bindings.

## Integration result
- Core: 45 source-native references, unchanged.
- PASS 4 extension: 25 controlled references.
- Global library: 70 continuous identities, REF-001..REF-070.
- DOI and normalized-citation deduplication: PASS across the integrated corpus.
- Unified navigation: all/Core/extension filters, source-authorized module filters, text search and `?ref=REF-xxx` deep linking.
- Existing Core bibliography is hidden only while the integrated Library view is active, preventing duplicate rendering; it is restored outside Library.

## Scientific boundary
Reference count is coverage metadata, not a validity metric. Core role bindings are not invented where the frozen source does not contain them. PASS 4 scientific status and claim ceilings are unchanged.

## QA
Materialization gate: PASS. Core-45 runtime re-probe: PASS. Independent RU/EN desktop/mobile browser gate: **88/88 PASS; failed = 0**.

## No-change declaration
Measurement = NONE · Scoring = NONE · Thresholds = NONE · Respondent sessions = NONE · Persistence = NONE · Report calculations = NONE · Production main = NONE · Scientific status upgrade = NONE.

## Verdict
**PASS / CORE-45 IDENTITY PRESERVED / GLOBAL-70 LIBRARY INTEGRATED / DEDUPLICATION AND NAVIGATION ESTABLISHED.**

Next authorized gate: **WEB-SCIENCE EXT PASS 4D — Claim-Boundary & RU/EN Parity QA**.
