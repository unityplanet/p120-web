# QA REPORT v1.7.1 — Source-Reconciled Gate

## Source inspection
PASS — exact uploaded v1.7 source was inspected through source extraction.  
PASS — real Dark Museum token map confirmed (`#171411 / #1d1a17 / #211e1a`).  
PASS — exact theme registry confirmed (`ivory / graphite / museum`).  
PASS — exact UI label and runtime theme-color confirmed.  
PASS — v1.7 Render-Led component selectors reconciled against the production override.  
PASS — existing `museum` state key is preserved; no storage/state migration is required.

## Static patch design
PASS — patch is append-only for the Museum Teal CSS cascade plus two UI/theme-presentation literal substitutions.  
PASS — no v1.7 geometry/layout correction is introduced by this patch.  
PASS — no measurement/scoring/question/scientific-claim/archetype/compatibility/result source is targeted.

## CSS gate
PASS — `MUSEUM_TEAL_PRODUCTION_OVERRIDE_v1.7.1.css` parses with **0 tinycss2 errors**.  
PASS — braces are balanced **82 / 82**.  
PASS — no old Dark Museum canvas literals remain in the production override.  
PASS — deep petrol is restricted to selective focal/reverse planes rather than the global Museum canvas.

## Patcher gate
PASS — `apply_v1.7.1_patch.py` compiles.  
PASS — deterministic synthetic v1.7 fixture patch completed.  
PASS — theme key `museum` remained unchanged.  
PASS — runtime theme color changed `#171411 → #F2EEE2`.  
PASS — UI label changed `Тёмный музей → Музейная`.  
PASS — v1.7.1 CSS marker/override inserted once.  
PASS — combined patched fixture style parses with **0 CSS errors**.

## Data / package gate
PASS — token JSON valid.  
PASS — final manifest regenerated from bundle contents.  
PASS — ZIP integrity test completed with no errors.

## Runtime limitation
The exact uploaded `index.html` is readable through the conversation/file-source extraction and was sufficient for source-level reconciliation, but its declared `/mnt/data/index.html` path is still not physically available to the executable container/Python filesystem. Therefore this session cannot truthfully:

- mutate the exact uploaded binary itself;
- hash the exact uploaded bytes before/after;
- execute the full patched v1.7 application;
- render full before/after long-scroll screenshots from the exact binary;
- certify console, overflow and functional runtime behaviour on that exact patched binary.

## Frozen logic gate
Measurement logic changed: **NO**  
Scoring logic changed: **NO**  
Question wording changed: **NO**  
Scientific claims changed: **NO**  
Archetypes changed: **NO**  
Compatibility logic changed: **NO**  
Result calculation changed: **NO**  
Frozen source blocks changed: **NO by patch design; exact-byte post-patch diff awaits executable source mount**

## Release status
**SOURCE RECONCILIATION + STATIC PATCH QA: PASS**  
**FINAL FULL-BINARY RUNTIME RELEASE GATE: HOLD**

The remaining HOLD is only the physical application/runtime visual QA of the exact uploaded v1.7 binary. The design decision, exact selector reconciliation, Museum Teal production CSS and deterministic source-preserving patch are complete.
