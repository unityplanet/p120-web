# P-120 FOUNDER ALPHA-01 — PASS 1F
## Live Migration History ↔ Repository Traceability Attestation

**Document ID:** P120-FA01-PASS1F-MIG-001  
**Version:** v1.0  
**Date:** 2026-09-05  
**Document status:** REVIEWED  
**Purpose:** close migration-history traceability without replaying already-applied operational state transitions  
**Scientific / measurement change:** NONE

---

## 1. Control decision

PASS 1F identified a traceability difference between the live Supabase migration registry and the repository migration directory. The difference is primarily operational history: temporary HTTP invoker enable/disable pairs, fail-closed resource HOLD/rebind/activation transitions, Auth settings probes, and a timestamp difference for the PASS 1E.2 closure migration.

These entries **must not be copied into the repository as ordinary new replay migrations under fresh version numbers**, because doing so could re-run historical state transitions against a later production state. Instead, this attestation records their exact live version/name identity and the SHA-256 of the executed SQL statement retained by `supabase_migrations.schema_migrations`.

The live migration registry remains the execution-history authority for these operational entries. Repository migrations remain the rebuild/change-source authority. This attestation is the controlled bridge between the two histories.

---

## 2. Canonical PASS 1E.1 migrations already mirrored

The following live migrations are already present in repository source with matching version/name identity:

- `20260904074414 p120_fa01_temp_http_invoker_enable_v1`
- `20260904074845 p120_fa01_temp_http_invoker_disable_v1`
- `20260904074904 p120_fa01_exact_package_storage_binding_v1`
- `20260904075244 p120_fa01_exact_build_qa_activation_v1`

They require no retrospective duplicate migration.

---

## 3. Live-only operational history attestation

The following entries are retained as **NON-REPLAYABLE OPERATIONAL HISTORY**. Exact executed SQL remains stored in the live migration registry; statement hashes below were computed directly from `statements[1]` in that registry.

| Live version | Migration name | SQL chars | Executed statement SHA-256 | Classification |
|---|---|---:|---|---|
| 20260904084721 | `p120_founder_auth_temp_http_enable_v1` | 59 | `b5b79f616c8cc09827b263ca33c134a193821285b414e16488b6bd533cd7480b` | temporary operational helper |
| 20260904084834 | `p120_founder_auth_temp_http_disable_v1` | 30 | `8419b07ee2e3bba32f0274caa5f7942102cc69c31f0b66e5af237aa5ac7ef15b` | helper cleanup |
| 20260904085008 | `p120_founder_auth_verify_http_enable_v1` | 59 | `b5b79f616c8cc09827b263ca33c134a193821285b414e16488b6bd533cd7480b` | temporary verification helper |
| 20260904085019 | `p120_founder_auth_verify_http_disable_v1` | 30 | `8419b07ee2e3bba32f0274caa5f7942102cc69c31f0b66e5af237aa5ac7ef15b` | helper cleanup |
| 20260904103304 | `p120_step7b_temp_http_invoker_enable_v1` | 59 | `b5b79f616c8cc09827b263ca33c134a193821285b414e16488b6bd533cd7480b` | Step 7B temporary helper |
| 20260904103501 | `p120_step7b_temp_http_invoker_disable_v1` | 30 | `8419b07ee2e3bba32f0274caa5f7942102cc69c31f0b66e5af237aa5ac7ef15b` | helper cleanup |
| 20260905111507 | `p120_fa01_runtime_provenance_reconciliation_hold_v1` | 2179 | `96a58f2ee8df34762e45cc6646ef71988174080c34e3ada20501e2997f2565eb` | fail-closed state transition |
| 20260905111657 | `p120_fa01_runtime_provenance_temp_http_enable_v1` | 59 | `b5b79f616c8cc09827b263ca33c134a193821285b414e16488b6bd533cd7480b` | temporary helper |
| 20260905111721 | `p120_fa01_runtime_provenance_temp_http_disable_v1` | 30 | `8419b07ee2e3bba32f0274caa5f7942102cc69c31f0b66e5af237aa5ac7ef15b` | helper cleanup |
| 20260905111842 | `p120_fa01_runtime_provenance_rebind_v1` | 3398 | `dc6e7c850ec77fb062d4e5fbe7ff977d53836ba535656152d45bdcba31f78545` | controlled provenance rebind |
| 20260905111949 | `p120_fa01_runtime_provenance_reconciliation_activation_v1` | 4285 | `72f9313367bfde831d7c34ba281f0808d9759b0e238b6dd4f3044de9b72a78a8` | QA activation transition |
| 20260905114218 | `p120_fa01_respondent_render_correction_hold_v1` | 2323 | `7429a80da8695900671a5ff959e06f32ab97710d50d20d194947800ed1d36126` | fail-closed render hold |
| 20260905114306 | `p120_fa01_respondent_render_temp_http_enable_v1` | 59 | `b5b79f616c8cc09827b263ca33c134a193821285b414e16488b6bd533cd7480b` | temporary helper |
| 20260905114331 | `p120_fa01_respondent_render_temp_http_disable_v1` | 30 | `8419b07ee2e3bba32f0274caa5f7942102cc69c31f0b66e5af237aa5ac7ef15b` | helper cleanup |
| 20260905114346 | `p120_fa01_respondent_render_runtime_rebind_v1` | 3137 | `1e11ee945ff04a68e558cd61b9f382ff59349b2890b4758be20a1f85b818d8d0` | controlled runtime/package provenance rebind |
| 20260905114440 | `p120_fa01_respondent_render_correction_activation_v1` | 3981 | `1bd7e08fd0b09ce51648b57046f0363cc7e62e3d21c2a04f64428289080facd5` | QA activation transition |
| 20260905121342 | `p120_step7b_auth_settings_probe_http_enable_v1` | 59 | `b5b79f616c8cc09827b263ca33c134a193821285b414e16488b6bd533cd7480b` | Auth settings probe helper |
| 20260905121414 | `p120_step7b_auth_settings_probe_http_disable_v1` | 30 | `8419b07ee2e3bba32f0274caa5f7942102cc69c31f0b66e5af237aa5ac7ef15b` | helper cleanup |

Final-state verification at PASS 1F opening confirms PostgreSQL extension `http` is **not installed**, so every temporary HTTP-helper pair is operationally closed.

---

## 4. PASS 1E.2 closure version alias

Repository source contains:

`20260905124500_p120_fa01_pass1e2_runtime_readiness_closure_v1.sql`

Live execution registry contains:

`20260905124737 p120_fa01_pass1e2_runtime_readiness_closure_v1`

Live executed-statement authority:

- SQL chars: `6605`
- SHA-256: `1da57026f49cda95daefeefb0802bd326d5dcbdf723c81b32361fbfee3a0cad8`

The repository file and live registry share the same migration name and the same controlled PASS 1E.2 closure logic. The repository file contains additional documentary comments, including the explicit runtime-authority comment, which explains the byte-length difference. The **applied production version is 20260905124737**; the **repository documentary/source filename is 20260905124500**.

Controlled interpretation:

- `20260905124737` = LIVE EXECUTION VERSION AUTHORITY;
- `20260905124500` = REPOSITORY SOURCE/DOCUMENTARY ALIAS;
- do not apply the repository alias to production again;
- do not create a second executable copy under `20260905124737` in ordinary migration flow without an environment-aware migration repair procedure.

---

## 5. Rebuild / future environment rule

For a fresh environment, historical operational HOLD/rebind/helper transitions are not required to be replayed sequentially. A fresh environment must instead be brought to the current canonical final state through the repository's structural migrations plus the controlled current-state authority, followed by the normal QA gates.

For production forensic/audit reconstruction, the exact historical SQL remains recoverable from the live `supabase_migrations.schema_migrations.statements` registry and is bound by the version/name/SHA-256 records in this attestation.

This separation prevents accidental replay while preserving forensic traceability.

---

## 6. Attestation verdict

**Live operational history identified:** PASS  
**Executed SQL statement hashes captured:** PASS  
**Temporary HTTP helpers proven removed:** PASS  
**PASS 1E.2 version alias explicitly mapped:** PASS  
**Duplicate replay prohibited:** PASS  
**Scientific / measurement delta:** NONE

**P1F-02 migration traceability finding:** **RESOLVED BY CONTROLLED ATTESTATION CANDIDATE**, subject to PASS 1F branch review/merge with the rest of the reconciliation package.
