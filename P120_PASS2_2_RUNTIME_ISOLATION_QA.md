# P120 PASS 2.2 — Runtime Isolation & Language Routing Verification

**Status:** PASS / STATIC QA COMPLETE

## Route matrix
- `/` → RU Editorial only: PASS
- `/en/` → EN Editorial only: PASS
- `/system/` → RU System runtime: PASS
- `/en/system/` → EN System runtime: PASS

## Boundary verification
- Saved assessment screen cannot seize either editorial route: PASS
- Editorial Start/Resume redirects to dedicated locale-relative `system/`: PASS
- Mobile resume redirects to dedicated locale-relative `system/`: PASS
- `?start=1` redirects to dedicated locale-relative `system/`: PASS
- EN System legacy post-render translator/binding excluded: PASS

## Measurement integrity
- RU items: 180
- EN items: 180
- ID/order parity: PASS (180/180 unique)
- Structural/coded-response parity: PASS

## Design preservation
- RU/EN System primary CSS SHA-256: `d51596fb1ba34b3b4ce1b1b05181697b9910bb3dd2ea85617578062b12173425`
- RU/EN Editorial primary CSS SHA-256: `d51596fb1ba34b3b4ce1b1b05181697b9910bb3dd2ea85617578062b12173425`
- Design parity: PASS

## Protected scope
- Scientific Base content: not modified by PASS 2.1.1 branch diff.
- Scoring logic: not modified.
- Item wording/content in System: not modified by this boundary pass.
- Legacy deletion: NONE.

**Next:** controlled PR/merge to `main`, GitHub Pages deployment, then live mobile/desktop smoke test.
