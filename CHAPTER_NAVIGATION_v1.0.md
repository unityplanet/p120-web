# P-120 Web Editorial — Chapter Navigation v1.0

## Scope
Presentation/navigation-only additive release.

Measurement changes: NONE  
Scoring changes: NONE  
Questionnaire changes: NONE  
Report calculation changes: NONE

## Desktop
A thin chapter navigator appears only after the opening editorial scene has been meaningfully scrolled. It remains fixed below the global header and exposes five story landmarks:

1. Архитектура — `#why-important`
2. Две системы — `#two-systems`
3. Результат — `#showcase`
4. Ещё глубже — `#extended-research-set`
5. Наука — `#science-foundation`

The current chapter is highlighted and the line below the index advances with the active landmark.

## Mobile
The four-item mobile bottom navigation is unchanged.

The hamburger drawer receives a separate `По главам` group with the same five landmarks. This group is secondary to the existing fast navigation and does not consume bottom-bar space.

## UX principles
- The first editorial screen remains visually uninterrupted.
- Chapter navigation is a re-entry / orientation aid, not a replacement for sequential reading.
- Existing Act markers remain in the page as editorial transitions.
- The scientific page keeps its own local scientific navigation.
- Extended Research Set remains optional and visually subordinate to the core P-120 profile.

## Accessibility
- Desktop controls use native buttons and visible focus states.
- Active location uses `aria-current="location"`.
- Mobile targets reuse the existing drawer interaction model.
- Reduced-motion preference disables navigator transitions and uses non-animated scroll.
