# P-120 WEB-SCIENCE — PROD-G1 Governance & Deployment-Path Reconciliation

**Document ID:** P120-WEBSCI-PROD-G1-GOV-DEPLOY-DECISION  
**Version:** v1.0  
**Date:** 2026-09-06  
**Status:** CONTROLLED CANDIDATE / MAIN MERGE PENDING

## Trigger

After WEB-SCIENCE production activation was merged, two legacy production controls reported failures:

1. `P120 Scientific Base Production QA Gate` — historical single-baseline pin did not account for the sealed PASS 4 runtime loader supersession.
2. `P120 PASS 4A Deployment Path Gate` / `P120 Actions Governance QA` — historical repository-scope assumptions did not account for subsequent authorized Science work and retained one-time PASS 4 sealing writers.

The Scientific Base baseline issue was separately reconciled and merged to `main` as `9bd3c1366f69f02617612169ffbd69ebcf8f5100`.

## Deployment-path decision

The original PASS 4A single-token path correction remains authoritative. The historical baseline `f46b7335e47d75672424136979f91a1a3997aa37` is used to prove the original incorrect path. The later accepted Scientific Base baseline is used to prove the current full Science HTML. This avoids falsely requiring post-PASS4 Science pages to remain byte-identical to a 2026-09-02 page state.

Controlled reconciliation evidence on head `be03c6c7008841bf43afc9a3b3800ab868c808cc`:

- production-path invariant checks: **39/39 PASS**;
- project-subpath browser checks: **82/82 PASS**;
- workflow run: `34027483670`;
- artifact: `9987532063`;
- artifact digest: `sha256:35a661bd8a30a69a218f021dae0105ffed6e98aa26a1afc46b58e95437580a49`.

## Actions-governance decision

SEC-GH-02 v1.0 allows only `p120-en-system-build-v0.4.yml` to retain repository-write authority. The seven PASS 4A–4G sealing workflows were legitimate branch-confined closure mechanisms while PASS 4 was being sealed, but PASS 4 is now `CLOSED / CONTROLLED / SEALED` and those workflows no longer require executable write authority.

Decision:

- do **not** expand the permanent write allowlist;
- retire the seven PASS 4 sealing workflows from `.github/workflows/`;
- preserve their exact definitions and run history in Git/GitHub provenance;
- update the active SEC-GH-02 governance rule to v1.1 without reopening the original security pass;
- require Actions Governance QA to pass again on the PR and merged `main`.

## Structural impact

This reconciliation changes CI/CD governance and historical gate semantics only. It does not mutate:

- scientific content or evidence status;
- Core45 / Extension25 / Global70 identity;
- measurement architecture;
- scoring or thresholds;
- respondent wording or session contract;
- persistence;
- report calculation;
- Supabase state;
- production Science pages or Science runtime assets.

The intended net structural change is a **reduction** in executable repository-write surface.

## Closure rule

This record does not close PROD-G1. Closure requires successful PR/main governance gates, live RU/EN Science verification and a mandatory sealed PROD-G1 package with independent checksum verification.
