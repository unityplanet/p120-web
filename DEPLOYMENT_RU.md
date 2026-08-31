# Развёртывание P-120 Web Editorial v1.6

## 1. GitHub — рекомендуемый source repository

1. Создать новый repository, например `p120-web`.
2. Загрузить **содержимое этой папки в корень репозитория**.
3. Главный файл должен называться `index.html`.
4. Не добавлять API keys, scoring keys, SMTP credentials или database secrets в repository/client HTML.

### GitHub Pages

`Settings → Pages → Deploy from a branch → main / root`.

Файл `.nojekyll` уже включён. Для текущей стадии сайт остаётся `noindex`.

## 2. Vercel

- Import Git Repository.
- Framework Preset: `Other`.
- Build command: пусто.
- Output directory: `.`.
- `vercel.json` уже содержит SPA rewrite и security headers.

Это предпочтительный вариант, если следующим этапом будут `/api/*` endpoints.

## 3. Netlify

- Import existing project или Netlify Drop.
- Build command: пусто.
- Publish directory: `.`.
- `netlify.toml` уже включает rewrite и security headers.

## 4. Обычный хостинг

Загрузить все файлы в `public_html`, `www`, `htdocs` или эквивалентный web root.

## 5. Robots policy

Пока сайт находится в стадии live correction, используются два уровня защиты от преждевременной индексации:

- `<meta name="robots" content="noindex,nofollow,noarchive">` в `index.html`;
- `robots.txt` с `Disallow: /`.

Когда домен и публичная версия утверждены:

1. заменить содержимое `robots.txt` содержимым `robots-public.txt`;
2. изменить meta robots в `index.html` на `index,follow`;
3. после появления окончательного домена добавить `canonical`, `og:url` и sitemap.

## 6. Fonts

Для одинаковой типографики на Windows/macOS/Linux подключены:

- Noto Serif Display — display headings;
- Noto Serif — reading/editorial serif;
- Inter — functional UI.

Они загружаются через Bunny Fonts (privacy-first CDN). Если CDN недоступен, сайт использует системные fallback; геометрия при этом может немного отличаться.

## 7. Перед подключением respondent backend

Нельзя размещать в клиентском HTML:

- authoritative scoring keys;
- OpenAI API key;
- SMTP/password credentials;
- database service-role keys.

Правильная production architecture:

`Browser UI → HTTPS backend → deterministic scoring → authorised interpretation object → report service → PDF/e-mail`.
