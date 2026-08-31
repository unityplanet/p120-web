# P-120 Web Editorial v1.6.1 — Contrast Architecture Restoration

Hosting-ready corrective package, собранный **поверх P-120 Web Editorial v1.6 — Desktop HD / UHD Master Pass**.

## Release intent

v1.6.1 — это **узкий corrective pass**. Он сохраняет desktop/UHD master v1.6 и возвращает контрастную архитектуру рамок, которая стала слишком слабой после selective de-cardification. Mobile UX и editorial grammar v1.2–v1.5 остаются сохранёнными.

Целевые режимы:

- 1366×768 — завершённая opening composition;
- 1440×900 — завершённая opening composition;
- 1920×1080 — finished premium digital publication;
- 2560×1440 — отдельная large-desktop композиционная система;
- 3440×1440 — ultrawide stage с ограничением вертикального overscale;
- 3840×2160 — полноценный UHD scaling/layout regime.

## Что сохраняется из v1.6

- HD opening reconstruction и Large Desktop Stage System — без изменений.
- UHD typography и QHD/UHD test/science/report layouts — без изменений.
- Production identity, font delivery, accessibility/metadata и hosting configs — без изменений.
- Mobile UX v1.2–v1.5 — без изменений.
- Исправлено только визуальное ослабление structural frames: введены отдельные theme-aware frame tokens и возвращена глубина ключевым semantic/science/test/report объектам.
- Большие editorial chapters не превращены обратно в карточки: de-cardification сохранена там, где она работает.


## Measurement lock

**НЕ МЕНЯЛИСЬ:**

- 180 scored respondent items;
- SAT-24 = 24;
- P-72 = 72;
- P-72D = 48;
- AO-12 = 12;
- SOMA-24 = 24;
- wording / module order / response choices;
- scoring/measurement logic.

P-120 остаётся **Research Candidate · 18+**. Эта статическая frontend-сборка не превращает инструмент в validated/standardized/clinical test.

## Файлы

- `index.html` — self-contained frontend/data build;
- `favicon.svg` — orbital P-120 mark;
- `manifest.webmanifest` — web app metadata;
- `vercel.json` — Vercel routing + security headers;
- `netlify.toml` — Netlify routing + security headers;
- `robots.txt` — staging/noindex policy по умолчанию;
- `robots-public.txt` — готовая public-indexing политика для момента официального запуска;
- `DEPLOYMENT_RU.md` — GitHub / Vercel / Netlify / обычный хостинг;
- `CHANGELOG_v1.6.md` — исходный HD/UHD master pass;
- `QA_REPORT_v1.6.md` — исходный v1.6 release gate;
- `CHANGELOG_v1.6.1.md` — contrast restoration changes;
- `QA_REPORT_v1.6.1.md` — corrective release gate.

## Важное ограничение текущей сборки

Frontend по-прежнему хранит ответы в `localStorage`. Production database, real scoring backend, OpenAI report generation, e-mail и server-side PDF должны подключаться отдельным защищённым backend layer; scoring/API keys не должны попадать в `index.html`.
