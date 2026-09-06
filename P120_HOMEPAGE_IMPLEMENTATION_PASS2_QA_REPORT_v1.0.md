# P-120 — Homepage Implementation PASS 2
## QA Report

**Document code:** P120-WEB-HOME-IMP2-QA-001  
**Version:** 1.0  
**Date:** 2026-09-06  
**Status:** PASS / GREEN / PRE-MERGE  

## Final validated head

`482b5a245cc66ebb3d18ad07fb07568ab5c74399`

## Dedicated workflow

- name: `P120 Homepage Implementation PASS 2 QA`
- run ID: `34023617103`
- conclusion: `SUCCESS`
- environment: Ubuntu 24.04.4 / Playwright 1.55.0

## Controlled results

| Gate | Result |
|---|---|
| JavaScript syntax preflight | PASS |
| Frozen source-authority gate | 19 / 19 PASS |
| Controlled-compression static gate | 91 / 91 PASS |
| Existing build/static conformance | PASS |
| Homepage RU/EN responsive/render | 172 / 172 PASS |
| PASS 5.3 post-PASS3 visual/session reconciliation | 144 / 144 PASS |
| PASS 5.3 About-route topology reconciliation | 77 / 77 PASS |
| Main quick locale/theme | 191 / 191 PASS |
| Mobile quick chapter navigation | 24 mobile + 2 desktop preservation cases / 0 failures |
| Mobile session resume | 363 / 363 PASS |
| Global header integrity | PASS_WITH_HARDENING_NOTES / 0 blocking findings |
| Global header hardening | PASS / 20 routes / 40 route-viewport cases / 0 failures |
| Footer presentation | PASS / 4 routes / 4 mobile cases |
| Actions Governance | SUCCESS |

## Render matrix

Homepage-specific render gate covered both RU and EN at:

- `390×844` / Museum
- `768×1024` / Ivory
- `1440×1000` / Graphite
- `2560×1440` / Museum

It checks exact controlled copy, About routing, metadata, theme preservation, chapter targets, no horizontal overflow, Main topology, mobile drawer behaviour, idempotency after DOM mutation and isolation from About routes.

## Global-header notes

The existing integrity gate reports three pre-existing medium hardening notes and **zero blocking findings**. The stronger PASS 2.1 hardening suite remains fully green. No note is attributed as a Homepage PASS 2 release blocker.

## Primary artifact

- name: `P120_HOMEPAGE_IMPLEMENTATION_PASS2_QA`
- artifact ID: `9986426081`
- files uploaded: `106`
- size: `66,254,298 bytes`
- SHA-256: `2133f330cdd0ce1857e98bf03ec7cd18449d7ef08bf115b79e907bbe86f95ef2`
- retention: `30 days`

## Actions Governance

- run ID: `34023617124`
- conclusion: `SUCCESS`

## Superseded run

Run `34023582339` failed a single static assertion because the harness matched the forbidden token `submission` inside a comment stating that no submission behaviour existed. The harness was corrected. No public narrative, measurement, scoring, respondent-data or runtime correction was required.

Final evidence authority is run `34023617103` and artifact `9986426081`.

## QA verdict

**PRE-MERGE QA: PASS / GREEN**  
**MERGE: SUPPORTED**  
**PRODUCTION SEAL: PENDING POST-MERGE LIVE GATE**
