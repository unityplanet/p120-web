# P-120 GitHub Actions Governance

**Control:** SEC-GH-02 — GitHub Actions executable-surface reduction  
**Version:** v1.0  
**Effective:** 2026-09-05  
**Status:** ACTIVE

## Governing rule

GitHub Actions in `p120-web` are read-only by default. Historical one-time apply/fix/migration workflows must not remain executable merely as an archive; Git history is the archive.

## Temporary repository-write allowlist

- `.github/workflows/p120-en-system-build-v0.4.yml` — TEMPORARY / ACTIVE EN localization materializer. Top-level workflow authority is `contents: read`; `contents: write` is scoped only to `build-native-system-routes`, because that job currently materializes and commits generated RU/EN System routes.

This exception must be removed when EN route generation is frozen or moved to a non-self-mutating release process.

## Required invariants

1. No other workflow may contain `contents: write`.
2. No other workflow may execute `git push`.
3. QA, audit, review, packaging and introspection workflows must be read-only with respect to repository contents.
4. `pull_request_target` is prohibited unless separately reviewed and explicitly authorized.
5. Repository workflows may not request `pages: write` or `id-token: write` without a separate deployment authority decision.
6. Historical one-time writers are retired from `.github/workflows/`; source history remains recoverable from Git history.
7. Changes to `.github/workflows/**` and this control are checked by `p120-actions-governance-qa.yml`.

## Scope boundary

This control changes CI/CD authority only. It does **not** change P-120 measurement architecture, scoring, mappings, thresholds, respondent wording, scientific content, Supabase data, OpenAI report logic, or currently deployed respondent-facing assets.
