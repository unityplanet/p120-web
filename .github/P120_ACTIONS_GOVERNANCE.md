# P-120 GitHub Actions Governance

**Control:** SEC-GH-02 — GitHub Actions executable-surface reduction  
**Version:** v1.1  
**Effective:** 2026-09-06  
**Status:** ACTIVE / RECONCILED

## Governing rule

GitHub Actions in `p120-web` are read-only by default. Historical one-time apply/fix/migration/sealing workflows must not remain executable merely as an archive; Git history and sealed evidence packages are the archive.

## Temporary repository-write allowlist

- `.github/workflows/p120-en-system-build-v0.4.yml` — TEMPORARY / ACTIVE EN localization materializer. Top-level workflow authority is `contents: read`; `contents: write` is scoped only to `build-native-system-routes`, because that job currently materializes and commits generated RU/EN System routes.

This exception must be removed when EN route generation is frozen or moved to a non-self-mutating release process.

No WEB-SCIENCE sealing workflow is part of the active repository-write allowlist.

## WEB-SCIENCE PASS 4 post-seal reconciliation

WEB-SCIENCE EXT PASS 4A–4G used branch-confined one-time sealing workflows during controlled closure. After PASS 4 reached `WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED`, those workflows no longer had an operational reason to retain repository-write authority.

During WEB-SCIENCE PROD-G1, SEC-GH-02 correctly detected the seven remaining Science sealing writers:

- `p120-webscience-pass4a-seal.yml`
- `p120-webscience-pass4b-seal.yml`
- `p120-webscience-pass4c-seal.yml`
- `p120-webscience-pass4d-seal.yml`
- `p120-webscience-pass4e-seal.yml`
- `p120-webscience-pass4f-seal.yml`
- `p120-webscience-pass4g-final-seal.yml`

Disposition: **RETIRED FROM EXECUTABLE SURFACE; WRITE ALLOWLIST NOT EXPANDED.** Their historical definitions, runs, commits, manifests, hashes and sealed package evidence remain recoverable from Git/GitHub history and controlled release records.

## Required invariants

1. No workflow other than the temporary allowlisted EN System materializer may contain `contents: write`.
2. No workflow other than the temporary allowlisted EN System materializer may execute `git push`.
3. QA, audit, review, packaging, reconciliation, production verification and introspection workflows must be read-only with respect to repository contents.
4. `pull_request_target` is prohibited unless separately reviewed and explicitly authorized.
5. Repository workflows may not request `pages: write` or `id-token: write` without a separate deployment authority decision.
6. Historical one-time writers are retired from `.github/workflows/`; source history remains recoverable from Git history.
7. Changes to `.github/workflows/**` and this control are checked by `p120-actions-governance-qa.yml`.
8. A sealed PASS may not use continued executable writer authority as its archival mechanism.

## Scope boundary

This control changes CI/CD authority only. It does **not** change P-120 measurement architecture, scoring, mappings, thresholds, respondent wording, scientific content, Supabase data, report logic, respondent sessions, persistence, or deployed Science content/runtime assets.

## Authority continuity

SEC-GH-02 v1.0 remains the historical closure record for the 2026-09-05 executable-surface reduction. v1.1 is a forward reconciliation after WEB-SCIENCE PASS 4 sealing and does not reopen the scientific PASS 4 package.
