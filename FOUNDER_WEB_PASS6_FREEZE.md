# P-120 FOUNDER-WEB PASS 6 — Controlled Visual Object Release Freeze

Document status: FROZEN / CONTROLLED RELEASE BASELINE  
Release scope: `/creator/` Founder Editorial Story — visual object language, typography, cross-theme responsive behavior  
Freeze date: 2026-09-01  
Content authority: Founder Editorial Story v1.0 / Founder Manifest v2.0  
Visual authority: FOUNDER-WEB PASS 5 — Visual Object Language & Editorial Art Direction v1.0  
Supersedes for current visual/release purposes: FOUNDER-WEB PASS 4 freeze baseline

## 1. Release decision

**FOUNDER-WEB PASS 6: PASS / FROZEN.**

The dedicated `/creator/` page remains the controlled Founder route. The Founder copy and scene order `FND-00` through `FND-11` are unchanged. PASS 6 adds a creator-only visual-object layer and a controlled literary/technical typography system without changing the page's identity policy, scientific boundaries, assessment runtime, scoring, report logic, persistence or main-page editorial journey.

## 2. Frozen typography system

The Founder page uses a deliberate two-language typographic architecture:

- **Noto Serif Display** — large editorial statements and display-scale narrative.
- **Noto Serif** — literary reading voice and long-form Founder prose.
- **IBM Plex Sans Light / Regular** — technical-functional layer: navigation, labels, specimen markers, small research annotations and interface microcopy.
- **IBM Plex Mono Light / Regular** — coordinate, index and evidence microtype.

This pairing is intentional. The literary serif expresses the human/reflective layer; the Plex technical layer expresses the transition from observation toward an engineered research system. IBM's own Plex design concept explicitly frames the family around relationships such as human/machine, natural/engineered, emotional/rational and classic/cutting-edge. Plex Sans and Mono also provide the light weights needed for the quiet research-publication treatment.

Typography rule: the technical face must never take over paragraph reading. Noto remains the dominant voice; Plex functions as annotation, measurement grammar and interface structure.

## 3. Frozen visual object language

PASS 6 implements the PASS 5 object families as restrained editorial punctuation rather than illustration:

1. **VO-01 Origin Thread** — a thin unresolved path with sparse nodes; appears in selected scenes and suggests question → structure.
2. **VO-02 Index Mark** — `FND / 00` through `FND / 11` technical scene indexing.
3. **VO-03 Distance Field** — spatial notation between `ОЩУЩЕНИЕ` and `СЛОВО` in FND-03.
4. **VO-04 Specimen Row** — numbered research/specimen treatment for the FND-04 question series; no card UI.
5. **VO-05 Coordinate Atlas** — semantic rings and axes in FND-07; explicitly no score, respondent data or pseudo-measurement is plotted.
6. **VO-06 Doctrine Axis** — typographic opposition/translation structure for the principle pairs in FND-08.
7. **VO-07 Evidence Threshold** — `НАБЛЮДЕНИЕ → ГИПОТЕЗА → КОНСТРУКТ → ИЗМЕРЕНИЕ → ОСНОВАНИЕ` in FND-09.
8. **VO-08 North Star Mark** — a minimal final concentric mark supporting, not competing with, `Сделать внутреннее видимым.`

The object language follows the controlled principle:

> Typography remains the voice. Objects become punctuation.

## 4. Identity and privacy freeze

PASS 6 does **not** introduce a Founder image or identity cue.

Frozen rules remain:

- no real Founder name;
- no CV, biography card or social links;
- no photographic portrait or headshot;
- no profile-relief/contour asset in this release;
- no `meta author`;
- no Person JSON-LD;
- no identity-bearing image alt text;
- `Di` remains the only author signature and appears at the closing scene.

The PASS 6 visual runtime explicitly declares `portraitAsset:false` and `profileAsset:false`.

Any future profile relief/contour is a controlled privacy-changing visual addition and requires reopening this gate.

## 5. Controlled implementation set

Current controlled Founder visual release set:

- `creator/index.html`
- `founder-editorial-story-v1.0.js`
- `founder-editorial-story-v1.0.css`
- `founder-visual-objects-v1.0.js`
- `founder-visual-objects-v1.0.css`
- `founder-route-v1.1.js`
- `qa/check_founder_separate_page.py`
- `qa/founder_pass6_visual.mjs`
- `.github/workflows/qa-founder-pass6.yml`

Historical PASS 4 and temporary CTA workflows remain available as manual-only release archaeology utilities. They are not current automatic gates.

## 6. Implementation evidence

Key PASS 6 implementation commits:

- `8c5f6068af170809e88e94e5a03ebd54e84f0710` — visual object stylesheet.
- `4efecdfb378c8839c7ab2b539b689cea62d8e871` — visual object runtime.
- `a146613286f8d13ec739648b46c23895f1e5663e` — `/creator/` typography and PASS 6 asset integration.
- `3e02712ae760e778767c41463e8489d505d040d9` — PASS 6 browser regression script.
- `f7636cd09c069707c95b4644129f7ccc8919701e` — PASS 6 controlled QA workflow.
- `6defa909caeabb93e5314ea95fd9c6c01e7bd1c1` — stabilized final visual-evidence capture.

Implementation baseline for the visual surface: `6defa909caeabb93e5314ea95fd9c6c01e7bd1c1`.

Subsequent workflow-retirement/documentation commits do not change the controlled `/creator/` visual surface.

## 7. Cross-theme responsive regression

Final PASS 6 QA workflow:

- Workflow: `Founder Web PASS 6 QA`
- Run: `33495861748`
- Conclusion: **SUCCESS**
- Head SHA: `6defa909caeabb93e5314ea95fd9c6c01e7bd1c1`

Viewport matrix:

- 1920 × 1080 / UHD
- 1440 × 900 / desktop
- 1024 × 768 / tablet
- 390 × 844 / mobile

Theme matrix:

- Ivory
- Graphite
- Museum

Regression assertions include:

- main page does not load the PASS 6 visual CSS/JS and still does not render the long Founder Story;
- `/creator/` loads PASS 6 CSS and JS exactly once;
- all 12 Founder scenes remain intact;
- all visual object families render in their controlled counts/locations;
- no Founder image or identity metadata appears;
- theme persistence remains correct;
- no horizontal overflow across the full viewport/theme matrix;
- editorial vertical depth remains intact;
- computed typography resolves to Noto Serif for literary copy, IBM Plex Sans for technical labels and IBM Plex Mono for coordinate/index microtype;
- Reduced Motion disables visual transitions while leaving content and decorative semantics visible.

## 8. Visual evidence

Final visual evidence artifact:

- Name: `P120-FOUNDER-WEB-PASS6-visual-evidence`
- Artifact ID: `9795704574`
- Workflow run: `33495861748`
- SHA-256 digest: `c2dffd09976f33eb763ea2236d8e060edd036a939a99b1eaa9924cefe0916efb`
- Retention: 30 days from 2026-09-01

The first PASS 6 run also passed structurally, but the final evidence capture deliberately increased post-reveal stabilization time so screenshots represent the settled visual state rather than a transition frame. The re-freeze is based on the stabilized successful run above.

Manual review of final evidence confirms:

- the Museum hero retains the large Noto literary voice while the technical scene index stays quiet;
- the Coordinate Atlas becomes the intended visual peak without implying measured respondent data;
- the Evidence Threshold reads as research-process notation rather than decoration;
- Graphite retains adequate visual hierarchy after reveal stabilization;
- mobile preserves the narrative hierarchy, removes unnecessary thread density at very narrow width, and keeps atlas/evidence structures within the viewport.

## 9. Main-page and system boundary

PASS 6 is limited to the dedicated Founder visual surface.

It does not alter:

- P-120 Core items or scoring;
- supplemental module logic;
- respondent persistence/submission;
- report generation;
- scientific evidence claims;
- compatibility/dyadic logic;
- main-page long-form Founder loading behavior;
- the anonymous-author policy.

## 10. Re-freeze / change-control triggers

This PASS 6 gate must be reopened if any of the following changes materially:

- Noto/Plex typography roles or font families;
- FND-00…FND-11 copy or scene ordering;
- any VO-01…VO-08 object family;
- Coordinate Atlas semantics or plotted information;
- responsive breakpoints or object-density rules;
- theme-specific colors/contrast behavior;
- Reduced Motion behavior;
- route/CTA destinations;
- Founder identity/anonymity policy;
- any portrait, photo, profile relief or contour introduction;
- metadata/JSON-LD author attribution;
- loading of PASS 6 assets outside `/creator/`.

Documentation-only or historical workflow changes that do not alter these controlled surfaces do not reopen the gate.

## 11. Final controlled statement

**FOUNDER-WEB PASS 6 is accepted as PASS / FROZEN.**

The Founder page now has a dual visual grammar: Noto carries the human voice; the thin Plex layer carries indexing, coordinates and evidence. Visual objects no longer behave as decoration added to text; they form a restrained research-publication language that supports the movement from private observation to structured inquiry while preserving the anonymity and scientific boundary of P-120.
