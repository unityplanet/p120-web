# P-120 WEB — System Controlled Migration v1.0

**Date:** 2026-09-02  
**Status:** CONTROLLED / IMPLEMENTED  
**Canonical route:** `/system/`  
**Source:** pre-migration root `index.html`

## Decision

The existing frozen P-120 respondent runtime was relocated to `/system/` by deriving the System page directly from the deployed monolith. The questionnaire was not recreated or rewritten.

## Frozen boundary

- Instrument payload: byte-identical.
- Module order: `SAT24 → P72 → P72D → AO12 → SOMA24`.
- Item registry: 180 unique items, same order and IDs.
- Question wording and choices: unchanged.
- Assessment runtime from `renderPreflight()` through `renderResults()`: byte-identical.
- Storage key `p120_web_prototype_v01`: retained for continuity of saved local progress.

## Web-only changes

- `/system/index.html` is the canonical respondent runtime page.
- Root editorial CTAs now route to `/system/`.
- Root header now contains a visible `Система` entry.
- Root remains the editorial website even when assessment progress exists.
- `/system/` resumes progress, opens results for a completed session, or opens preflight for a new session.
- System navigation returns to the editorial site instead of rendering the editorial homepage inside `/system/`.
- Extended Research Set remains outside the frozen runtime page.

## Integrity evidence

- Source root SHA-256 before migration: `063f282e7258fafd16622eb457c858a587a29a69a1f13fe81e8157b6866bd528`
- Frozen instrument block SHA-256: `488cc206b63fb18fb2508a0ae9cbe8a431fd0e9297b31b423588093ebfa7332b`
- System frozen instrument block SHA-256: `488cc206b63fb18fb2508a0ae9cbe8a431fd0e9297b31b423588093ebfa7332b`
- Frozen instrument parity: **PASS**
- Assessment runtime parity: **PASS**
- Item count / uniqueness: **180 / 180 — PASS**
- Measurement changes: **NONE**
- Scoring changes: **NONE**
- Questionnaire changes: **NONE**

## Rollback boundary

The root document retains the previous frozen runtime source as a dormant rollback copy, but respondent entry controls no longer expose it. `/system/` is the operational and canonical runtime route from this migration onward.
