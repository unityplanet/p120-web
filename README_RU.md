# P-120 Web Editorial v1.6 — Desktop HD / UHD Master Pass

Production-ready static hosting package, собранный **поверх P-120 Web Editorial v1.5 — Unified Editorial Grammar / Hosting Package**.

## Release intent

v1.6 — это **desktop/hosting master**, а не новый дизайн с нуля. В нём сохранены mobile UX и editorial grammar линии v1.2–v1.5, а поверх них добавлена отдельная система для HD / QHD / Ultra HD.

Целевые режимы:

- 1366×768 — завершённая opening composition;
- 1440×900 — завершённая opening composition;
- 1920×1080 — finished premium digital publication;
- 2560×1440 — отдельная large-desktop композиционная система;
- 3440×1440 — ultrawide stage с ограничением вертикального overscale;
- 3840×2160 — полноценный UHD scaling/layout regime.

## Что изменено относительно v1.5

1. HD opening reconstruction: opening hero, subtitle, flash-line и CTA формируют законченный первый viewport; основной editorial body начинается ниже.
2. Large Desktop Stage System: отдельные режимы `1920–2559`, `2560–3199`, `≥3200 px`.
3. UHD typography: второй масштабный режим для display и functional typography.
4. Test / science / report layouts используют дополнительную ширину на QHD/UHD.
5. Production identity cleanup: публичные `P-120 Web`, `Interaction Polish`, `Mobile UX`, preview marker и пустой `0%` удалены.
6. Font delivery lock: Inter + Noto Serif + Noto Serif Display доставляются через Bunny Fonts; системные fallback остаются только как отказоустойчивость.
7. Selective de-cardification: scientific/structural UI стал более editorial; report/examples остаются самостоятельными визуальными объектами.
8. Accessibility/metadata: один H1 на главной, skip-link, `focus-visible`, OG/Twitter metadata, dynamic `theme-color`.
9. Hosting/security configs обновлены для Vercel и Netlify.

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
- `CHANGELOG_v1.6.md` — release changes;
- `QA_REPORT_v1.6.md` — release gate и ограничения visual capture runtime.

## Важное ограничение текущей сборки

Frontend по-прежнему хранит ответы в `localStorage`. Production database, real scoring backend, OpenAI report generation, e-mail и server-side PDF должны подключаться отдельным защищённым backend layer; scoring/API keys не должны попадать в `index.html`.
