# P-120 WEB — НЕЗАВИСИМОЕ ЗАКРЫТИЕ MOBILE UI PASS 2.1

**СТАТУС:** VERIFIED PASS / BOTH CLOSED / REGRESSION-GATED  
**КЛАСС:** INDEPENDENT VISUAL / RESPONSIVE / RUNTIME REGRESSION AUDIT  
**ЦЕЛЕВОЙ PRODUCTION SHA:** `ef6020afa0df6035bbbfe540a1ace815341589d4`  
**АУДИТОРСКАЯ ВЕТКА:** `audit/mobile-ui-pass21-ef6020a`  
**FINAL AUDIT RUN:** `33890839618`  
**FINAL EVIDENCE ARTIFACT:** `P120_WEB_INDEPENDENT_MOBILE_UI_PASS21_FINAL_EVIDENCE`  
**ARTIFACT ID:** `9943800404`  
**ARTIFACT ZIP SHA-256:** `178ef76afcd64f6eaf8656d76cc2e81b3a3eb733ff5d9c2061f8322c6dbe71fe`

## Итоговый вердикт

**CTA-01 — PASS / CLOSED.**  
**PROGRESS-01 — PASS / CLOSED.**  
**COMBINED VERDICT — PASS / BOTH CLOSED / REGRESSION-GATED.**  
**Observed regression in final matrix — NONE.**

## Автоматизированное подтверждение

Финальный deterministic audit выполнен против production и exact-source local parity. Итог GitHub Actions: `success`, failures `0`, warnings `0`.

Покрытие:

- 210 total automated cases;
- 168 production route/viewport/theme/state cases;
- 42 exact-source local parity cases при 390 px;
- 60 public CTA cases;
- 150 System CTA cases;
- 120 progress geometry checks;
- 6 production theme-switch checks;
- 6 production press-state checks;
- RU / EN;
- 360 / 390 / 430 / 480 px в production;
- Ivory / Graphite / Museum;
- public fresh / resume;
- System preflight / test / transition / results / resume;
- active/inactive CTA authority;
- no CTA clipping / horizontal overflow;
- progress label/percentage vertical separation;
- progress counter separation / nowrap authority;
- menu progress horizontal overflow = none in the audited matrix.

## Контраст CTA

Минимальные рассчитанные контрастные отношения в финальном audit:

- Ivory start: 17.95:1;
- Ivory end: 12.72:1;
- Graphite start: 4.65:1;
- Graphite end: 5.68:1;
- Museum start: 5.14:1;
- Museum end: 6.97:1.

Все проверяемые CTA endpoints находятся на уровне не ниже 4.5:1.

## Manual production evidence

В независимый audit record внесено предоставленное user-side production video evidence одного реального мобильного устройства. В записи подтверждены RU/EN, несколько тем, active-session CTA и progress drawer. Для PROGRESS-01 видна структура `Current session / Текущая сессия` → отдельный `4%` → правый counter `7 of 180 / 7 из 180`; слипания, clipping и overlap в записи не наблюдаются. Для CTA-01 primary treatment сохраняется при Graphite, Ivory, Museum и active questionnaire/session transitions; старый симптом демоции CTA в обычный nav item в записи не наблюдается.

Ограничение manual evidence: один физический viewport. Поэтому formal closure основан не только на видео, а на завершённой автоматизированной 360/390/430/480 matrix.

## История красных audit runs

Предыдущие красные runs классифицированы как **AUDIT-HARNESS FAILURE / NON-PRODUCT / SUPERSEDED**. Установленные причины включали перезапись seeded state через `beforeunload -> save()`, использование `.nojekyll` как seed resource, legal acceptance modal, точные ожидания browser CSS serialization и sampling во время theme transition. После устранения harness defects финальный scoped audit завершился PASS без product modification.

## Граница изменений

Audit не изменял production `main` и не вносил продуктовые правки. Все audit helpers/workflows находятся только в audit branch. Measurement, scoring, questionnaire wording, persistence contract, privacy/safety architecture и scientific architecture не изменялись.

Global Header brand authority не переоткрывался. WHY P-120 composition freeze не переоткрывался.

## Closure rule

Дефекты `CTA-01` и `PROGRESS-01` считаются закрытыми для production SHA `ef6020afa0df6035bbbfe540a1ace815341589d4`. Повторное открытие допускается только при новом воспроизводимом regression evidence на последующей production revision.
