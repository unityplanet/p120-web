# P-120 WEB — MOBILE QUICK CHAPTER NAVIGATION
## PATCH 1 / PASS 2 — IMPLEMENTATION RECORD

**Document ID:** P120-WEB-MQN-P1-P2  
**Status:** IMPLEMENTED / REGRESSION-GATE REQUIRED  
**Scope class:** Mobile navigation presentation / additive access surface  
**Scientific / measurement / scoring impact:** NONE  
**Questionnaire / session persistence impact:** NONE  
**Global Header Brand Authority:** FROZEN / NOT REOPENED  
**Why P-120:** FROZEN / NOT REOPENED  
**Typography unification:** OUT OF SCOPE

## 1. Purpose

Add a compact mobile quick-chapter navigation surface to the P-120 Main editorial page without creating a second chapter-navigation authority.

The implementation extends the existing canonical Chapter Navigation runtime. It reuses the same chapter registry, active chapter state, target resolution and owned-scroll behavior already used by desktop Chapter Navigator and the mobile drawer `По главам / Chapters` group.

## 2. Canonical ownership

Single chapter authority remains:

`chapter-navigation-v1.0.js` + `chapter-navigation-v1.0.css`

Runtime revision for this pass: **1.6.0**.

Canonical chapter data remains five landmarks:

1. Architecture / Архитектура
2. Two systems / Две системы
3. Result / Результат
4. Go deeper / Ещё глубже
5. Science / Наука

No duplicate chapter registry, independent scroll engine or second active-state model is introduced.

## 3. Mobile quick-chapter behavior

At phone/mobile shell widths up to 820 px, the quick chapter control is created only on the Main editorial surface.

The opening editorial scene remains uninterrupted. The control becomes visible only after meaningful scroll, using the same appearance threshold concept as the existing desktop Chapter Navigator.

Collapsed state shows the current chapter index and localized chapter label. Activating the control opens a compact five-chapter picker. Selecting a chapter calls the existing canonical `openChapter()` path. Active state is synchronized across desktop chapter controls, drawer chapter controls and the mobile quick surface.

The control closes on chapter selection, outside interaction, Escape, navigation away from Main, or when the hamburger drawer is opened. Reduced-motion preference disables its transitions.

## 4. Hamburger preservation rule

**GOVERNING DECISION — HAMBURGER REMAINS A FULL NAVIGATION SURFACE.**

This pass does not remove, suppress, simplify or replace the hamburger menu.

The existing mobile drawer remains intact, including its complete menu structure and its `По главам / Chapters` group. The mobile bottom navigation also remains unchanged.

A later independent patch may expose sitewide quick language and theme controls outside the hamburger. That future quick-access authority does **not** implicitly authorize removing language, theme or other navigation items from the hamburger.

Any future hamburger cleanup, deduplication or information-architecture reduction must be opened as a separate controlled improvement with its own scope, evidence and regression review.

## 5. Localization

The new quick-chapter surface provides direct RU/EN labels based on route locale. This is limited to the new surface and does not refactor the existing sitewide localization architecture.

## 6. Freeze and exclusion boundaries

This pass must not alter:

- orbit mark, P-120 lockup, descriptor or first-paint header authority;
- hamburger information architecture;
- mobile bottom-navigation action count or ownership;
- session resume / unfinished-test bridge;
- quick language/theme header controls;
- Why P-120 composition;
- questionnaire wording or behavior;
- measurement, scoring or report calculation;
- scientific claims;
- existing font-family authority or Typography Unification work.

## 7. Regression gate

Dedicated QA must cover RU and EN, widths 360 / 390 / 430 / 480, Ivory / Graphite / Museum, meaningful-scroll appearance, current-chapter synchronization, five chapter targets, picker open/close, hamburger coexistence, four-button bottom navigation preservation, horizontal overflow, desktop preservation and console/page errors.

**Release rule:** PASS 2 may be closed only after the dedicated regression gate succeeds on the production tree and deployment evidence is available.
