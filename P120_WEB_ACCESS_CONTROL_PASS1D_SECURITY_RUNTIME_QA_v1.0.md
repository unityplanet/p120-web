# P-120 WEB — MINIMAL INTERNAL CABINET & FOUNDER ACCESS CONTROL
## PASS 1D — SECURITY & RUNTIME QA / RED-TEAM

**Document ID:** P120-WEB-AC-004  
**Version:** v1.0  
**Date:** 04.09.2026  
**Branch:** `access-control/pass1c-v1`  
**Supabase project:** `p120-research / hvjgrpssjnnprazwhikn`  
**Status:** SECURITY FOUNDATION PASS / ACTIVATION HOLD  
**Measurement / scoring / respondent items:** NO CHANGE

## 1. Scope

Red-team review covered: RLS and table grants, SECURITY DEFINER RPCs, role escalation, cross-user session isolation, entitlement precedence, DISABLED state behavior, PUBLIC state semantics, protected-resource state transition, assessment-session ownership, submission binding, private Storage policy structure, runtime fail-closed package validation, client-side XSS surfaces, static-route boundary, third-party JS dependency pinning, and regression isolation from the existing public respondent runtime.

All database attack simulations were executed inside explicit transactions and rolled back. No QA users, QA resources, QA entitlements, QA submissions, or QA sessions were persisted.

## 2. Verified PASS controls

- `anon` has no EXECUTE privilege on P-120 privileged functions.
- `authenticated` has SELECT-only direct table privileges on access-control tables; mutations are RPC controlled.
- direct role escalation against `p120_profiles` is denied at table privilege level.
- non-Founder invocation of Founder admin RPCs returns `founder_admin_required`.
- cross-user assessment-session SELECT is blocked by RLS.
- cross-user participant attachment is blocked by ownership check.
- account without entitlement cannot RUN INTERNAL_ALPHA resource.
- entitled owner can RUN INTERNAL_ALPHA resource.
- global ALLOW, parent DENY, and child-specific ALLOW precedence behave as specified.
- DISABLED resource cannot RUN, including for Founder.
- after red-team hardening, only Founder may VIEW DISABLED metadata.
- after red-team hardening, PUBLIC resources grant VIEW/RUN but not MANAGE.
- protected launchable FOUNDER_ALPHA/PILOT resources cannot be transitioned to PUBLIC through Founder RPC.
- disabled access group is no longer accepted as cohort provenance for non-Founder assessment-session creation.
- cross-user submission binding is blocked.
- wrong payload SHA-256 cannot bind.
- owner + matching Participant ID + matching SHA-256 binds successfully.
- raw `p120_submissions` remains pseudonymous and unchanged.
- private Storage read policy remains tied to authenticated resource RUN authorization.
- internal runtime verifies resource state, launchability, Storage path, expected SHA-256, session SHA snapshot, package schema, resource key, release version, runtime key, unique item IDs, and manifest item count before execution.
- runtime renders package text through `textContent` / escaping rather than trusting HTML.
- branch remains additive relative to frozen public runtime files.

## 3. Red-team findings corrected during PASS 1D

### RT-01 — PUBLIC implied MANAGE
Original access helper returned TRUE for all levels when a resource was PUBLIC. This could incorrectly label an ordinary active account as having MANAGE authority. No Founder RPC directly relied on this, but the semantics violated the frozen access model.

**Correction:** PUBLIC now grants only VIEW/RUN. MANAGE remains explicit/Founder-controlled.

### RT-02 — DISABLED metadata visible through entitlement
Original helper allowed a non-Founder VIEW entitlement to expose DISABLED resource metadata.

**Correction:** DISABLED now returns VIEW only to active FOUNDER_ADMIN; RUN/MANAGE remain denied.

### RT-03 — disabled cohort provenance
Assessment-session creation checked membership state but not group state.

**Correction:** non-Founder cohort binding now requires both ACTIVE membership and ACTIVE group.

### RT-04 — protected Alpha/Pilot runtime could be switched PUBLIC
Founder state-control RPC accepted PUBLIC for any resource.

**Correction:** a launchable FOUNDER_ALPHA/PILOT runtime now fails closed with `protected_runtime_cannot_be_public`.

### RT-05 — unpinned privileged browser dependency
Internal cabinet/runtime loaded `@supabase/supabase-js@2`, allowing future minor-version drift on a privileged page.

**Correction:** both pages are pinned to `@supabase/supabase-js@2.112.4`; a restrictive meta CSP was added for scripts/connect targets. Self-hosting/SRI remains a later hardening option.

## 4. Transactional attack results

| Probe | Expected | Observed |
|---|---|---|
| active user, no entitlement, INTERNAL_ALPHA RUN | DENY | false |
| global RUN ALLOW | ALLOW | true |
| specific parent RUN DENY | DENY | false |
| child-specific RUN ALLOW over parent DENY | ALLOW | true |
| Founder DISABLED RUN | DENY | false |
| Founder DISABLED VIEW | ALLOW | true |
| non-Founder DISABLED VIEW despite entitlement | DENY | false |
| PUBLIC VIEW | ALLOW | true |
| PUBLIC RUN | ALLOW | true |
| PUBLIC MANAGE | DENY | false |
| direct role escalation | DENY | permission denied |
| non-Founder Founder-RPC call | DENY | founder_admin_required |
| cross-user session SELECT | DENY | 0 rows |
| cross-user participant attach | DENY | session_not_found |
| owner session SELECT | ALLOW | 1 row |
| cross-user submission bind | DENY | session_not_found |
| owner bind wrong SHA | DENY | submission_not_found |
| owner bind correct Participant ID + SHA | ALLOW | success |

## 5. Supabase Advisor disposition

Security Advisor continues to report `authenticated_security_definer_function_executable` warnings for functions intentionally exposed as authenticated RPC endpoints. These are not dismissed categorically: the red-team verified that Founder mutations enforce `p120_is_founder()`, session operations enforce `auth.uid()` ownership/access, fixed `search_path` is set, anonymous EXECUTE is absent, and direct table mutation is withheld.

The warnings therefore remain **DOCUMENTED / ACCEPTED WITH VERIFIED INTERNAL AUTHORIZATION**, not production blockers by themselves.

## 6. Remaining activation holds

### HOLD-01 — real Founder Auth E2E
No real Auth user exists yet. Magic Link delivery, allowed redirect configuration, actual browser session restoration, and Founder bootstrap cannot be end-to-end verified until the real Founder identity is provisioned.

### HOLD-02 — PKCE conformance
PASS 1B selected Magic Link / PKCE as canonical. The current browser client uses Supabase URL session detection but has not yet been proven against the project's final PKCE redirect/email-template configuration. This must be validated with the real Founder Auth setup before Alpha GO.

### HOLD-03 — exact protected Founder Alpha package
The resource remains non-launchable until authoritative package bytes, release metadata, object path and SHA-256 are bound. Fail-closed behavior is implemented, but positive-path package execution cannot be completed without the actual package.

### HOLD-04 — real browser/device regression
Database and source-level runtime checks are green, but final desktop/mobile dry run requires the actual deployed internal branch/auth flow and protected package.

## 7. Regression boundary

No public measurement, scoring, respondent wording, item order, response values, raw submission schema, public session contract, or public `/system/` runtime file was modified in PASS 1D.

## 8. Gate

**SECURITY FOUNDATION:** PASS  
**DATABASE AUTHORIZATION RED-TEAM:** PASS AFTER HARDENING  
**SUBMISSION BINDING:** PASS  
**STATIC ROUTE / PRIVATE RESOURCE MODEL:** PASS  
**FOUNDER AUTH E2E:** HOLD  
**PROTECTED PACKAGE E2E:** HOLD  
**ALPHA PRODUCTION GO:** NOT YET AUTHORISED

Next controlled phase: Founder identity provisioning + exact Alpha resource binding, followed by PASS 1E Founder Alpha readiness / real end-to-end dry run.
