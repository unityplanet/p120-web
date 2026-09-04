# P-120 WEB — CONTROLLED CHANGE REQUEST
## P120-WEB-CR-FA01-001 — FOUNDER ALPHA EXISTING-RUNTIME INTEGRATION

**Version:** v1.0  
**Date:** 2026-09-04  
**Opened by:** PASS 1E readiness gate  
**Authority:** P-120 Research System  
**Change class:** Runtime / orchestration / persistence metadata  
**Scientific source mutation:** PROHIBITED  
**Scoring mutation:** PROHIBITED  
**Public `/system/` regression:** PROHIBITED  
**Status:** **OPEN / REQUIRED BEFORE FA01-RU-01 HUMAN GO**

---

## 00. Trigger

PASS 1E found that the PASS 1C internal implementation introduced a separate generic respondent runner under `/internal/runtime/`. The runner is secure and fail-closed at the access boundary, but it independently implements respondent rendering/navigation/state and therefore does not establish parity with the existing production-oriented P-120 respondent runtime.

The governing Founder Alpha authority requires an additive private Alpha mode around the current respondent architecture, exact source parity, protected candidate loading, separate Alpha namespace, and QA-01…QA-30 on the exact build.

This CR is opened because correcting the defect touches the respondent runtime integration boundary. It does **not** authorize scientific, item, scoring or interpretation changes.

---

## 01. Objective

Provide one controlled Founder Alpha execution path that:

1. authenticates and authorizes through the PASS 1C/1D account-control layer;
2. loads restricted Alpha source material only from private authorized storage;
3. executes the existing P-120 respondent-runtime semantics rather than a parallel questionnaire engine;
4. keeps anonymous `/system/` behavior byte/behavior compatible unless a narrowly documented shared-runtime extraction is necessary;
5. stores Alpha provenance and administrative metadata separately from source-native response values;
6. supports the authoritative FA01 module sequence and runtime rules;
7. remains scoring/report suppressed except where an independently verified deterministic adapter is later authorized.

---

## 02. Protected authorities

The implementation MUST preserve without silent normalization or rewriting:

- SAT-24 exact 24-item frozen source;
- P-72 v4.0 Q01–Q72;
- P-72D D01–D48 including controlled administration-mode semantics;
- AO-12 exact 12-item frozen source;
- SOMA-24 exact 24-item frozen source;
- COM-12 authoritative 24-item cognitive corpus;
- MOT-12 authoritative 24-item cognitive corpus;
- SELF-12 authoritative 21-item cognitive corpus;
- LIFE temporal identity: T3 main / T0-T1 natural-event linked;
- RPE safety/privacy/adaptive/18+ opt-in authority;
- raw submission package v1.0 unless a separate transport-version change is explicitly approved.

No Extended Total, compatibility %, Agency Total, Repair Total, Validation Total, Embodiment Total, Wellness Total or other new cross-layer aggregate is authorized.

---

## 03. Preferred integration architecture

### 03.1 Single respondent engine

Refactor only as much as necessary to expose the current respondent execution engine as a reusable runtime authority.

Preferred target:

- one shared respondent engine asset/module;
- public `/system/` loads the existing frozen public instrument/session contract;
- authenticated Alpha entry loads an authorized private instrument manifest/package before engine start;
- the engine receives explicit runtime mode, session namespace and controlled administration metadata;
- Alpha-only orchestration is additive and gated.

The resulting architecture must make it impossible for the public route to request or fetch restricted Alpha content.

### 03.2 No protected bytes in GitHub

The public repository may contain:

- runtime code;
- schemas;
- manifest structure;
- validation logic;
- non-sensitive hashes/authority IDs where approved.

It must not contain restricted Extended candidate wording/banks.

### 03.3 Alpha session namespace

Founder Alpha state must not collide with:

- `p120_runtime_session_ru_v1`
- `p120_runtime_session_en_v1`

An authenticated assessment-session-specific namespace is acceptable if it remains traceable to the canonical Alpha run/session identity.

---

## 04. Required runtime controls

### 04.1 Build/source provenance

Before launch, persist or snapshot at minimum:

- runtime repository/build SHA;
- resource/release version;
- private package SHA-256;
- source manifest version;
- module authority/version;
- language;
- item order identity;
- item/source hash where the authority provides it.

### 04.2 Frozen parity validator

The Alpha loader must fail closed unless the frozen source section validates:

- module order SAT24 → P72 → P72D → AO12 → SOMA24;
- counts 24 + 72 + 48 + 12 + 24 = 180;
- exact IDs/order;
- exact response choices/models;
- source/hash authority where available.

A count-only or unique-ID-only check is insufficient.

### 04.3 P-72D administration modes

Preserve the controlled P-72D administration-mode behavior. The Alpha runtime must not silently default every run to one referent mode or leave `adminModes` empty where the source requires an explicit administration decision.

### 04.4 Extended source binding

Bind the exact controlled corpora:

- COM24;
- MOT24;
- SELF21;
- LIFE T3 four probes.

Candidate scoring and participant interpretation remain disabled.

### 04.5 LIFE orchestration

Main Alpha session may present only the four T3 recent-pattern probes.

T0/T1 must:

- be separate linked sessions;
- require a naturally occurring eligible event;
- never be triggered by advice/instruction to create an intimate event;
- retain event-reference and window metadata;
- preserve structural missingness/eligibility states.

### 04.6 RPE

For FA01 the implementation MUST choose one explicit state:

**A. DEFERRED/DISABLED:** RPE is not offered in the initial human run; or

**B. ENABLED UNDER AUTHORITY:** adult-only preflight + voluntary opt-in + adaptive routing + PNA/unknown/no-experience/skip exits + safety/privacy ceiling.

A linear 74-record form is prohibited.

### 04.7 Response-state envelope

Source-native substantive values remain unchanged.

Add a separate Alpha metadata envelope capable of preserving:

- response_state;
- scope_class;
- temporal_mode;
- eligibility_state;
- route_decision;
- presented/answered timestamps;
- module/item/source versions;
- runtime build/source hashes.

Do not reinterpret N/A, insufficient experience, PNA, unknown, skipped, not-presented or technical missing as numeric lows.

### 04.8 Founder feedback

Founder reviewer annotations must have a distinct persistence namespace/object from measurement responses.

Feedback must never overwrite `response_value` or source response state.

### 04.9 Telemetry

Alpha operational telemetry may contain timing/navigation/error state but must not duplicate intimate answer values.

If the existing respondent engine currently emits answer values in telemetry, Alpha mode must suppress/redact that field without changing the measurement response itself.

---

## 05. Database/account changes allowed by this CR

Allowed additive changes:

- runtime/build SHA snapshot on resource/session;
- source-manifest metadata;
- Alpha response metadata/envelope storage;
- Founder feedback table/object;
- linked LIFE event-session metadata;
- explicit Alpha runtime-mode fields;
- required RLS/RPC functions/policies;
- audit additions.

Not allowed:

- changing existing anonymous `p120_submissions` respondent meaning;
- making authenticated users directly mutable authorities;
- adding user-editable role claims;
- exposing service-role secrets in browser;
- weakening existing anonymous insert-only intake controls.

---

## 06. Implementation stop rules

STOP and open a new scientific/measurement CR if implementation would require any of the following:

- changing frozen item wording;
- changing frozen item order for measurement reasons;
- changing response scale semantics;
- changing factor definitions;
- creating new scoring arithmetic/thresholds;
- altering deterministic scoring keys;
- inventing a missing source value;
- converting a candidate module into a validated/production construct;
- changing scientific maturity labels.

---

## 07. Acceptance gates

CR closes only when all of the following are evidenced on one exact build:

1. public anonymous `/system/` regression passes;
2. private Alpha package cannot be fetched anonymously or by unauthorized authenticated users;
3. exact frozen 180 parity passes;
4. P-72D administration modes pass;
5. exact COM24/MOT24/SELF21 binding passes;
6. LIFE T3/T0/T1 orchestration passes;
7. RPE explicitly deferred or passes controlled optional adaptive path;
8. response-state/scope/exposure provenance passes;
9. Founder feedback separation passes;
10. Alpha telemetry contains no intimate response values;
11. save/resume and failure recovery pass;
12. RU-only FA01 authority is enforced;
13. accessibility and 390/768/1440/2560 browser QA pass;
14. PASS 1D security regression remains green;
15. QA-01…QA-29 are green;
16. Founder reviews that exact build and gives QA-30 HUMAN GO.

---

## 08. Release decision

**CR STATUS: OPEN / IMPLEMENTATION AUTHORIZED WITHIN THE BOUNDARIES ABOVE.**

Until closure:

- Founder Alpha resource remains `INTERNAL_ALPHA`;
- `is_launchable` remains `false`;
- no private corpus should be activated;
- no real FA01-RU-01 respondent session should begin;
- report cutover remains HOLD.
