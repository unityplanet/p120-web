# P-120 — Homepage Implementation PASS 2
## Decision Record

**Document code:** P120-WEB-HOME-IMP2-DR-001  
**Version:** 1.0  
**Date:** 2026-09-06  
**Status:** CONTROLLED / EFFECTIVE FOR PASS 2  

## Decisions

1. **Homepage is a narrow derivative.** Main inherits architecture through `CONTROLLED_COMPRESSION`; it does not become a shorter copy of About.
2. **About remains the fuller public architecture surface.** Homepage sends readers to `/about/` and `/en/about/` for architectural depth.
3. **Human-readable entry precedes technical depth.** Main states in plain language that P-120 is not one test or one final score and identifies the adult erotic, embodied and relational domain before any deeper system language.
4. **Scientific ceiling is preserved.** `Research Candidate` is retained; no empirical-validation status is upgraded.
5. **No scientific evidence authority moves to Main.** Homepage remains a public narrative surface.
6. **No measurement/scoring authority moves to Main.** The new surface does not calculate, score, persist, submit or interpret respondent data.
7. **Existing Main dramaturgy is preserved.** The change is additive around `#why-important`; canonical chapter targets and respondent journey remain intact.
8. **Root RU/EN HTML remains protected.** The implementation uses a governed additive presentation layer rather than editing large frozen-ish Main HTML sources.
9. **Existing mobile-session file may load the presentation enhancer only.** Its respondent-session keys, eligibility logic and data behaviour remain unchanged.
10. **Why P-120 remains frozen.** No Why composition or narrative transfer is authorized.
11. **Detailed governance concepts are prohibited on Main in this PASS.** Second-order architecture, detailed self-governance, Founder computational environment and full validation architecture remain outside Homepage scope.
12. **No fixed multiplier or universal compatibility claim is permitted.**

## Release decision

Validated implementation head `482b5a245cc66ebb3d18ad07fb07568ab5c74399` satisfies pre-merge technical and governance gates.

**Decision: MERGE AUTHORIZED.**

Production authority is granted only after successful merge, Pages deployment and live production regression.

## Reopen conditions

Reopen this PASS before production seal if any of the following is established:

- canonical source-authority conflict;
- material RU/EN semantic drift;
- broken About routing;
- Main chapter/navigation regression attributable to PASS 2;
- respondent-session mutation attributable to the loader extension;
- measurement/scoring or evidence-authority leakage;
- reproducible responsive/overflow/accessibility defect;
- non-green post-merge live production gate.
