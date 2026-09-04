# P-120 WEB — MAIN QUICK LOCALE / THEME CONTROLS
## PATCH 3 / PASS 1 — SOURCE & AUTHORITY RECONCILIATION

**Document ID:** P120-WEB-HU01-P3-P1  
**Version:** 1.0  
**Date:** 2026-09-04  
**Status:** PASS / SOURCE AUTHORITY RECONCILED / IMPLEMENTATION NOT STARTED  
**Baseline main:** `df3cd48290eecdd945dca7003d71256c3c3be336`  
**Finding:** HEADER-U01 — Main Quick Locale / Theme Controls Parity  
**Scope class:** Mobile/public-header utility access parity  
**Production behavior change in this pass:** NONE  
**Global Header Brand Authority:** FROZEN / MUST NOT BE REOPENED  
**Why P-120:** FROZEN / NOT REOPENED  
**Typography:** OUT OF SCOPE  
**Session Resume / PATCH 2:** CLOSED / NOT REOPENED  
**Mobile Chapter Navigation / PATCH 1:** CLOSED / NOT REOPENED  
**Scientific / measurement / scoring / questionnaire:** NO CHANGE

## 1. Workstream position

The earlier mobile continuity review identified three independent corrective patches:

1. `NAV-M01` — Mobile Chapter Bubble / Quick Chapter Navigation — **PATCH 1 CLOSED**.
2. `SESSION-M01` — Main ↔ System Resume Session Bridge — **PATCH 2 CLOSED**.
3. `HEADER-U01` — Main Quick Locale / Theme Controls Parity — **PATCH 3 OPEN**.

PATCH 3 therefore addresses only the third finding. It must not absorb additional hamburger cleanup, typography unification, session-resume behavior, chapter navigation, footer work or any new header-brand redesign.

## 2. User-observed asymmetry

On mobile public Main, the canonical header currently exposes the P-120 brand lockup and hamburger, while the Creator surface exposes the existing compact utility controls:

- `RU`
- `EN`
- compact theme switcher

The Creator pattern demonstrates that these controls fit the current mobile header geometry and are already part of the P-120 public visual language.

The target is therefore **parity through reuse of the existing canonical utility component**, not creation of a new language/theme system.

## 3. Canonical utility authority identified

`p120-brand-system-v1.0.js` already owns the shared public utility markup through `toolsMarkup()`.

The shared component contains:

- `p120-brand53-language` with locale-matched RU/EN links;
- `p120-brand53-theme` with the canonical theme control;
- the existing three-theme authority: `ivory`, `graphite`, `museum`;
- existing route-aware counterpart resolution;
- existing persistence via `p120_web_theme_v16`;
- existing `applyTheme()` state synchronization.

`p120-brand-system-v1.0.css` already owns the visual and responsive presentation for this component. At `<=1080px`, the utility group moves to the right side of the header; the text label of the theme control is hidden and the theme trigger becomes a compact 34×34 circular/pill control. At `<=720px`, RU/EN controls are compacted further.

**Decision:** PATCH 3 must reuse this authority. No second theme engine, second locale switcher, duplicate theme key or new utility component is authorized.

## 4. Root cause A — explicit Main exclusion

Current `ensureTools()` in `p120-brand-system-v1.0.js` begins with:

`if(isMain) return;`

This explicitly excludes Main from canonical RU/EN/theme utility injection.

This is the primary source-level cause of the observed Main/Creator asymmetry.

**Finding P3-HU01-A:** `MAIN_EXPLICIT_UTILITY_EXCLUSION`  
**Severity:** MEDIUM UX / parity  
**Disposition:** OPEN → bounded correction required in PASS 2.

## 5. Root cause B — Main header inner is not in the utility insertion selector

The shared utility insertion helper currently resolves header ownership through:

`findHeaderInner()` → `.explore-topbar__inner,.creator-topbar__inner,.wp-header-inner,.p120-brand53-header__inner`

The Main public shell uses `.topbar-inner`.

Therefore merely removing `if(isMain) return;` would still not make Main eligible for insertion because the Main header inner is not returned by `findHeaderInner()`.

**Finding P3-HU01-B:** `MAIN_HEADER_INNER_NOT_IN_UTILITY_TARGET_SET`  
**Severity:** MEDIUM implementation blocker  
**Disposition:** OPEN → bounded correction required in PASS 2.

## 6. Main header geometry and compatibility

The canonical brand stylesheet already includes `.topbar-inner` in the shared responsive header geometry selectors. Under `<=1080px`, Main and other public headers are converted to the same flex-based compact header arrangement.

The canonical utility CSS also already defines the mobile/right-side behavior required for `p120-brand53-tools`.

Therefore no new Main-specific utility design is required as a prerequisite.

PASS 2 should first attempt pure authority parity through existing component injection and only add minimal route-scoped spacing protection if runtime QA proves it necessary at narrow widths.

## 7. Frozen header boundary

PATCH 3 is a utility-access correction inside the existing public header but **does not reopen Global Header Brand Authority**.

The following remain frozen and must not be changed in design or ownership:

- orbit mark structure;
- `P-120` lockup;
- localized descriptor authority;
- first-paint brand CSS authority;
- canonical brand source/runtime ownership;
- canonical header height/border identity unless a narrowly scoped geometry compatibility adjustment is proven necessary by QA;
- PASS 2.1 header regression expectations.

If `p120-brand-system-v1.0.js` or `p120-brand-system-v1.0.css` is touched, frozen-header regression gates must be rerun.

## 8. Hamburger governing rule

**HAMBURGER REMAINS A FULL NAVIGATION SURFACE.**

Adding quick RU/EN/theme controls to Main does **not** authorize automatic removal of equivalent controls or any other items from the hamburger.

The hamburger remains the complete alternative navigation surface after PATCH 3.

Any future deduplication, simplification or information-architecture cleanup of the hamburger is a separate controlled improvement and requires its own audit/authorization.

This rule also means PATCH 3 acceptance must verify coexistence rather than deduplication.

## 9. Locale behavior contract

The shared canonical utility must preserve current counterpart routing:

- RU Main `RU` remains current and `EN` routes to EN Main;
- EN Main `EN` remains current and `RU` routes to RU Main;
- no locale switch may route into `/system/`, `/creator/` or another non-Main counterpart when invoked from Main;
- current locale must be represented by the existing `aria-current="page"` state;
- no duplicate locale authority may be introduced.

## 10. Theme behavior contract

PATCH 3 must preserve the existing canonical theme contract:

- themes: Ivory / Graphite / Museum;
- persistence key: `p120_web_theme_v16`;
- same current theme before and after opening/closing hamburger;
- same current theme after route-local hard reload;
- no theme flash/race introduced by utility injection;
- no divergence between quick control and hamburger/theme controls;
- `applyTheme()` remains the single runtime authority for shared public theme state.

## 11. PASS 2 implementation boundary

PATCH 3 / PASS 2 is authorized to make only the minimum changes necessary to expose the existing canonical `toolsMarkup()` component on RU and EN Main.

Expected source-level corrections:

1. Remove/replace the unconditional Main exclusion in `ensureTools()`.
2. Add `.topbar-inner` to the canonical utility insertion target set.
3. Resolve insertion order so the quick tools sit between the Main brand region and the hamburger/right-edge action without changing the brand lockup or nav ownership.
4. Reuse existing theme and locale event bindings.
5. Avoid duplicate `[data-p120-brand53-tools]` nodes under reconciliation/mutation-observer reruns.

No new persistence or navigation engine is authorized.

## 12. Required PASS 2 QA matrix

Dedicated PATCH 3 QA must include at minimum:

- locales: RU / EN;
- themes: Ivory / Graphite / Museum;
- mobile widths: 360 / 390 / 430 / 480;
- Main fresh load;
- hard reload;
- theme switch from each theme to each other theme;
- RU → EN and EN → RU route switch;
- hamburger closed/open/closed coexistence;
- saved-session state present and absent, confirming PATCH 2 Resume is not disturbed;
- chapter quick-nav eligible/ineligible scroll states, confirming PATCH 1 is not disturbed;
- no duplicate utility controls after repeated reconcile/mutation cycles;
- no first-paint → final-state geometry jump beyond accepted header behavior;
- no horizontal overflow;
- no overlap with brand lockup;
- no overlap with hamburger;
- no overlap with PATCH 2 mobile Resume control;
- touch target accessibility;
- keyboard/focus behavior where applicable;
- console/page errors = 0.

Desktop preservation should be checked at representative widths above the mobile navigation threshold so PATCH 3 does not alter accepted desktop header composition unintentionally.

## 13. Required cross-regression gates

Because shared header runtime/CSS is expected to be touched, PASS 2 must rerun:

- Global Header PASS 2.1 hardened QA;
- original Global Header PASS 1 lifecycle gate;
- Footer Link Presentation Correction project-prefix gate;
- PATCH 2 Mobile Session Resume gate;
- PATCH 1 Mobile Quick Chapter Navigation gate, if its permanent workflow is available on main.

Any red run caused only by a stale QA fixture must be classified and corrected at the harness level without changing production behavior unless an actual product defect is reproduced.

## 14. Protected scope

PATCH 3 must not change:

- questionnaire content;
- scoring;
- measurement/scientific architecture;
- respondent-session ownership;
- session-resume eligibility contract;
- chapter-navigation authority;
- Why P-120 composition;
- footer;
- typography authority;
- CTA theme/state authority;
- mobile bottom-navigation action count/ownership;
- hamburger information architecture.

## 15. Gate decision

**PATCH 3 / PASS 1 — PASS.**

The source/authority question is resolved:

**CANONICAL LOCALE/THEME UTILITY:** existing `toolsMarkup()` / `p120-brand53-tools`  
**THEME AUTHORITY:** existing `applyTheme()` + `p120_web_theme_v16`  
**LOCALE AUTHORITY:** existing route-aware `counterpart()` logic  
**ROOT CAUSE A:** Main explicitly excluded by `if(isMain) return;`  
**ROOT CAUSE B:** `.topbar-inner` absent from utility insertion target set  
**NEW DESIGN SYSTEM:** NOT REQUIRED / NOT AUTHORIZED  
**HAMBURGER:** REMAINS FULL NAVIGATION SURFACE  
**FROZEN HEADER BRAND AUTHORITY:** NOT REOPENED  
**PASS 2 IMPLEMENTATION:** AUTHORIZED

**PATCH 3 / PASS 1 CLOSED.**
