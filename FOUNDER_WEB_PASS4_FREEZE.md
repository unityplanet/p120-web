# P-120 FOUNDER-WEB PASS 4 — Controlled Release Freeze

Document status: FROZEN / CONTROLLED RELEASE BASELINE  
Release scope: Founder Editorial Story / dedicated-page architecture  
Freeze date: 2026-09-01  
Content authority: P120 Founder Manifest / Founder Editorial Story v1.0  

## 1. Frozen architecture

The full Founder Editorial Story is hosted on a dedicated Russian page at `creator/`.

The main P-120 page MUST NOT render or load the long Founder Story. The existing Navigation Architecture v2 entry `От создателя` is the controlled entry point and is routed to the dedicated page by `founder-route-v1.1.js`.

This decision is intentional: the main editorial journey is already information-dense, and the Founder narrative requires its own reading rhythm and page depth.

## 2. Frozen identity/privacy rules

- No real founder name.
- No CV, biography card, social links, headshot or photographic portrait.
- No founder profile/contour asset in the launch release.
- No `meta author`, Person JSON-LD, hidden identity metadata or identity-bearing image alt text.
- `Di` is the only author signature and appears at the closing scene of the Founder Story.
- The page presents the question and intellectual origin of P-120, not the founder as a public persona.

Any future addition of a profile relief/contour or other identity cue requires an explicit new change authority and re-opens the privacy/visual gate.

## 3. Frozen implementation set

- `creator/index.html` — dedicated Founder page shell.
- `founder-editorial-story-v1.0.js` — FND-00 through FND-11 content/runtime.
- `founder-editorial-story-v1.0.css` — Founder editorial presentation layer.
- `founder-route-v1.1.js` — route-only adapter on the main page.
- `qa/check_founder_separate_page.py` — static architecture/privacy contract.
- `qa/founder_pass4_browser.mjs` — browser regression matrix.
- `.github/workflows/apply-founder-editorial-story-v1.yml` — controlled dedicated-page application workflow.
- `.github/workflows/qa-founder-pass4.yml` — PASS 4 visual/privacy QA workflow.

## 4. Integration evidence

Controlled integration commit:
`f54984733bfdcaa3c69ddba7cdf6bad5842acd74` — `feat: move Founder Editorial Story to dedicated page`.

Dedicated-page application workflow:
Run `33450786107` — SUCCESS.

GitHub Pages build/deploy for the integration baseline:
Run `33450794915` — SUCCESS.

## 5. PASS 4 validation evidence

PASS 4 workflow:
Run `33450999562` — SUCCESS.

The successful job includes:

1. Static contract and privacy audit — PASS.
2. Browser QA runtime installation — PASS.
3. Local production server smoke test — PASS.
4. Browser visual regression / privacy / responsive matrix — PASS.
5. Visual evidence artifact upload — PASS.

Browser matrix:

- 1920 × 1080 / UHD
- 1440 × 900 / desktop
- 1024 × 768 / tablet
- 390 × 844 / mobile

Themes checked in browser automation:

- Ivory
- Graphite
- Museum

Automated assertions include:

- 12 Founder scenes (`FND-00`…`FND-11`) render on the dedicated page.
- No full Founder Story block renders on the main page.
- Main page loads the route-only adapter rather than the long Founder runtime.
- No horizontal overflow across the tested viewport/theme matrix.
- No founder portrait/image in the Founder Story.
- No `meta author` or identity JSON-LD.
- Theme persistence works.
- Opening typography remains display-scale.

Visual evidence artifact:
`P120-FOUNDER-WEB-PASS4-visual-evidence`  
Artifact ID: `9779762088`  
SHA-256 digest: `1d9b9a4137d8725473e05e6fdf4affbc3f9e6dddca6e19edbb5cd180098169a8`  
Retention through: 2026-09-30.

## 6. Release decision

**FOUNDER-WEB PASS 4: PASS / FROZEN.**

The controlled release baseline is the dedicated-page architecture. The previous design that injected the full Founder Editorial Story into the main page is superseded and must not be restored.

## 7. Change-control rule

The PASS 4 gate must be re-opened if any of the following changes:

- Founder copy or scene ordering;
- route or URL architecture;
- main-page Founder loading behavior;
- identity/anonymity policy;
- use of portrait, profile relief or contour;
- metadata / JSON-LD / author attribution;
- theme behavior or responsive layout;
- CTA destinations;
- FND-00…FND-11 runtime behavior.

Minor repository documentation changes that do not affect these controlled surfaces do not reopen the gate.
