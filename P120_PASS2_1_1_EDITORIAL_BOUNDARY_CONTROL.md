# P120 PASS 2.1.1 — Editorial Runtime Boundary Guard

**Status:** IMPLEMENTED / QA REQUIRED

## Scope
- RU Editorial `/`: existing PASS 2 boundary invariants verified; no content/design changes.
- EN Editorial `/en/`: assessment-state restore blocked and all active editorial test-entry handlers redirected to `system/` (resolves to `/en/system/`).
- RU System `/system/`: untouched.
- EN System `/en/system/`: untouched.

## Preserved invariants
- Scientific Base: untouched.
- P-120 item corpus: untouched.
- Item IDs/order/response values: untouched.
- Scoring logic: untouched.
- CSS/typography/layout: untouched.
- Legacy files: not deleted.

## Editorial hard-boundary postconditions
1. Saved `preflight/test/transition/results` state is coerced to `home` in `/en/` before render.
2. Editorial Start/Resume uses dedicated `system/` route.
3. Mobile resume uses dedicated `system/` route.
4. Editorial CTA binding uses dedicated `system/` route.
5. `?start=1` redirects to dedicated `system/` route.

## Integrity
- RU SHA-256 after pass: `dc301b9d1fcfb159682e28856249d6492f8cb11c46c982bd4f733e69b1755783`
- EN SHA-256 after pass: `b17a5219495b9deaac70feea46a7b6c068fc0765018621757618a6fa5979a5ad`
