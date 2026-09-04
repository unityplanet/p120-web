# P-120 WEB — MINIMAL INTERNAL CABINET & FOUNDER ACCESS CONTROL
## PASS 1C — IMPLEMENTATION RECORD v1.0

**Project:** P-120 Research System  
**Workstream:** WEB / Runtime / Access Control  
**Priority:** P0.2  
**Date:** 04.09.2026  
**Branch:** `access-control/pass1c-v1`  
**Baseline:** `main@644a6c769bad4ada605e5906ae301e630722d621`  
**Status:** IMPLEMENTED FOUNDATION / ACTIVATION HOLD

## 1. Protected authorities

PASS 1C is additive. It does not alter:
- respondent item wording, order or response values;
- measurement architecture;
- scoring architecture;
- interpretation authority;
- `system/index.html` production respondent runtime;
- `p120-session-contract-v1.0.js`;
- `p120-submission-intake-v1.0.js`;
- `p120-submission-config-v1.0.js`;
- `public.p120_submissions` raw intake contract.

## 2. Implemented control plane

Live Supabase production now contains the controlled account/access layer:
- `p120_profiles`;
- `p120_resources`;
- `p120_access_groups`;
- `p120_access_group_members`;
- `p120_entitlements`;
- `p120_assessment_sessions`;
- `p120_access_audit`.

Supabase Auth remains the sole identity authority. Application assessment sessions are separate from `auth.sessions`.

RLS is enabled on all new application tables. Direct browser mutations are not granted. Sensitive mutations are mediated by narrowly-scoped RPC functions that derive identity from `auth.uid()` and verify role or session ownership server-side.

## 3. Implemented resource delivery

A private Storage bucket exists:

`p120-internal-resources`

Authenticated reads are allowed only when the object path is bound to a launchable, non-DISABLED resource and the effective P-120 authorization function grants RUN access. Browser upload/update/delete is denied.

Protected Alpha bytes are not committed to the public repository.

## 4. Implemented Founder cabinet

New route scaffold:
- `/internal/`
- `/internal/runtime/`

The cabinet implements:
- pre-provisioned Magic Link login (`shouldCreateUser=false`);
- identity / role / account-state display;
- resource registry display;
- own assessment sessions;
- Founder-only profile controls;
- Founder-only resource-state changes;
- entitlement grant/revoke controls;
- access audit display.

The static shell is not treated as a security boundary. Protected content is delivered only after Auth + RLS authorization.

## 5. Controlled runtime bridge

The internal runtime:
1. requires a valid authenticated account session;
2. resolves an assessment session owned by the current user;
3. resolves its P-120 resource;
4. verifies RUN authorization;
5. downloads the protected package from private Storage;
6. verifies database/session SHA-256 authority;
7. verifies runtime package schema, resource key, release version, runtime key, unique item IDs and item count;
8. binds a browser-generated Participant ID to the application assessment session;
9. stores responses in `p120_account_runtime_<assessment_session_uuid>`;
10. loads the existing production `p120-submission-intake-v1.0.js` unchanged;
11. submits the existing pseudonymous raw response package;
12. links the stored raw submission to the account assessment session using Participant ID + payload SHA-256.

No scoring or interpretation is performed by the internal runtime.

## 6. Founder Alpha resource state

A resource placeholder exists:

`founder-alpha-core-v1`

State: `INTERNAL_ALPHA`  
Release: `FA-P1`  
Runtime: `founder-alpha-runtime-v1`  
Launchable: **false**

This HOLD is intentional. Exact protected Founder Alpha corpus/package bytes have not been supplied/bound, so the system must not invent or expose candidate scientific content.

Required activation fields before launch:
- exact protected package;
- private Storage object path;
- SHA-256;
- manifest/item-count validation;
- resource `is_launchable=true` only after QA.

## 7. Founder identity activation state

Current live Auth state at implementation time:
- Auth users: 0;
- P-120 profiles: 0.

A one-time service-only `p120_bootstrap_founder()` authority is implemented. It can activate exactly the initial Founder profile and refuses bootstrap once an ACTIVE FOUNDER_ADMIN already exists.

Founder account provisioning itself remains HOLD until an explicit Founder email/account identity is provided/configured.

## 8. Migration governance

PASS 1C establishes traceable migration history from the verified production baseline. Live migration registry now contains:
- `20260904052005_p120_access_control_baseline_attestation_v1`;
- `20260904052518_p120_access_control_foundation_v1`;
- `20260904052651_p120_access_control_security_rpc_v1`;
- `20260904052708_p120_internal_storage_v1`;
- `20260904052718_p120_founder_alpha_resource_seed_v1`;
- `20260904052745_p120_access_control_function_privilege_hardening_v1`;
- `20260904053142_p120_access_control_audit_bootstrap_hardening_v1`.

Matching source migration files are committed on the implementation branch.

## 9. Security notes for PASS 1D

Confirmed after function hardening:
- no `anon` EXECUTE privilege remains on P-120 application functions;
- private Storage bucket exists and is non-public;
- no protected corpus exists in GitHub;
- no service-role credential exists in new browser code.

Supabase Security Advisor continues to emit `authenticated_security_definer_function_executable` warnings for intentionally callable authenticated RPCs. These are not dismissed automatically: PASS 1D must red-team each callable function for role/ownership enforcement, fixed `search_path`, parameter validation and privilege surface.

## 10. Activation gates

PASS 1C foundation is implemented, but Founder Alpha is not yet runnable. Activation requires all of:
1. Founder Auth account provisioning + controlled bootstrap;
2. Auth Site URL / redirect allowlist verification for the production `/internal/` callback;
3. exact protected Founder Alpha package binding in private Storage;
4. PASS 1D security/runtime regression QA;
5. explicit Alpha GO decision.

**Disposition:** IMPLEMENTATION FOUNDATION COMPLETE / FOUNDER ALPHA ACTIVATION HOLD.
