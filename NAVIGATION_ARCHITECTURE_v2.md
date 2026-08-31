# P-120 Navigation Architecture v2

## Purpose
Separate long-form page navigation from project/ecosystem navigation as P-120 expands beyond one editorial page.

## Navigation layers
1. **Global top navigation** — current public-page anchors and Science.
2. **Explore / Исследовать** — ecosystem navigation for independent P-120 directions.
3. **Chapter Navigator** — in-page reading position across the long P-120 narrative.
4. **Science tabs** — local navigation inside Scientific Base.
5. **Mobile bottom navigation** — remains unchanged: four primary actions only.

## Desktop
A compact `Исследовать / Explore` trigger is added to the existing top navigation. It opens a two-column editorial panel:

### STORY / ИСТОРИЯ P-120
- `Почему P-120? / Why P-120?` — active; currently routes to the existing Why P-120 editorial section.
- `От создателя / From the Creator` — reserved route `creator`; content is not activated until the dedicated block/page is frozen.

### NEXT / ДАЛЬШЕ
- `Хотите глубже? / Go deeper` — active; routes to the Extended Research Set.
- `Мы вместе? / Together?` — reserved route `together`; intended for the future dyadic research layer.

Reserved destinations are visually present but explicitly marked `Готовится / Coming`; they are not broken links.

The older standalone `Ещё глубже / Go deeper` desktop nav entry is visually suppressed once v2 is active because Extended Research Set now has a stable home under `Explore`.

## Mobile drawer
The existing drawer remains the shell. v2 organizes it into a project map:
- `P-120` — start/resume/home/science actions already provided by the core shell.
- `Основное / Core` — existing section jumps.
- `История P-120 / Story` — Why P-120 + From the Creator.
- `Дальше / Next` — Go deeper + Together?.
- `По главам / Chapters` — existing Chapter Navigator group.
- `Language` — existing RU/EN selector.
- Theme controls remain available after language.

The older standalone Extended Set mobile drawer item is suppressed to avoid duplication.

## Route registry
`window.P120_NAV_V2_ROUTES` exposes the current route registry. Reserved routes can later be activated without redesigning the navigation shell.

Current states:
- `why`: active → `#why-p120`
- `creator`: reserved → route id `creator`
- `deeper`: active → `#extended-research-set`
- `together`: reserved → route id `together`

## Locked systems
Navigation Architecture v2 MUST NOT modify:
- questionnaire wording;
- measurement model;
- scoring;
- report calculation;
- mobile bottom navigation;
- scientific claims.

## Responsive rule
Desktop ecosystem navigation is visible above 1080 px. At and below 1080 px, ecosystem navigation lives only in the mobile drawer.
