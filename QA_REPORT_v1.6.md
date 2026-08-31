# P-120 Web Editorial v1.6 — QA & Release Gate

## Release decision

**HOSTING-READY FRONTEND MASTER / LIVE-CORRECTION STAGE**

Source baseline: `P120_Web_Editorial_v1.5_HOSTING_PACKAGE.zip`.

This release is a desktop/hosting pass. It does **not** change measurement/scoring content.

## 1. Source integrity

PASS.

The six embedded data/script blocks before the application shell were byte-for-byte unchanged from v1.5. The only changed script block is the UI/application shell.

Instrument lock:

- scored items: 180;
- unique respondent IDs: 180;
- SAT24: 24;
- P72: 72;
- P72D: 48;
- AO12: 12;
- SOMA24: 24.

Instrument JSON SHA-256:

`25654202e9d4075c917ceb062b420b4ec8ed9c5a92aa46577b46c52acc1f2794`

## 2. JavaScript / CSS / config

- Application JavaScript syntax: PASS (`node --check`).
- CSS top-level parser errors: 0.
- `manifest.webmanifest`: JSON PASS.
- `vercel.json`: JSON PASS.
- `netlify.toml`: TOML PASS.
- Static release checker: PASS (`python qa/check_build.py`).

## 3. HD / UHD stage system

Code-level stage gate: PASS.

| Viewport class | v1.6 regime |
|---|---|
| 1366×768 / 1440×900 | HD opening reconstruction + compressed low-height opening |
| 1920×1080 | Stage I · 1840px layout / finished desktop publication |
| 2560×1440 | Stage II · 2320px architecture / widened test + science + report |
| 3440×1440 | Stage III width + special low-height ultrawide override |
| 3840×2160 | Stage III · 3160px layout / UHD typography + functional scale |

The first editorial chapter on desktop is explicitly reordered as:

`index → hero/subtitle → flash → CTA → long-form body`

so the opening viewport has a complete composition before the long-form reading sequence continues below.

## 4. Production identity cleanup

PASS.

Removed from public UI:

- `P-120 Web` brand label;
- `Interaction Polish`;
- `Mobile UX v1.5`;
- autonomous preview badge;
- idle `0%` progress indicator.

Public brand is now `P-120` with `исследовательская архитектура` descriptor.

## 5. Typography

PASS at configuration level.

Production families:

- `Noto Serif Display` — display/editorial headings;
- `Noto Serif` — serif reading hierarchy;
- `Inter` — functional UI.

Delivery is configured through Bunny Fonts, with system fallback stacks retained for resilience.

Note: the local artifact runtime has no outbound DNS, so CDN response could not be verified from the build container itself. The font API URL is production-configured and should be verified once the package has a live URL.

## 6. Accessibility / semantics / metadata

PASS at source level.

- one semantic H1 on the home editorial opening;
- science page keeps its own H1 when rendered as the active screen;
- skip-link to `#main-content`;
- keyboard `focus-visible` ring;
- dynamic browser `theme-color` for Ivory / Graphite / Museum;
- OG/Twitter/application metadata;
- explicit staging robots policy;
- public robots template included.

## 7. Robots policy

Intentional staging state:

- meta robots: `noindex,nofollow,noarchive`;
- `robots.txt`: `Disallow: /`.

`robots-public.txt` is included for the official public-indexing switch after final domain review.

## 8. Visual capture matrix

**Automated local screenshot gate: NOT EXECUTABLE IN CURRENT ARTIFACT RUNTIME.**

The installed Chromium process hangs on the container DBus/zygote runtime before producing screenshots. Multiple headless attempts were terminated by timeout. Therefore this report does **not** falsely mark the visual matrix as captured.

Required first live-host QA matrix is already defined and should be executed immediately after deployment:

### Home
- 1366×768 · Ivory
- 1440×900 · Ivory
- 1920×1080 · Ivory
- 1920×1080 · Graphite
- 1920×1080 · Museum
- 2560×1440 · Ivory
- 3440×1440 · Ivory
- 3840×2160 · Ivory

### Questionnaire
- 1366×768 · Ivory
- 1920×1080 · Graphite
- 2560×1440 · Museum
- 3840×2160 · Graphite

### Science
- 1920×1080 · Museum
- 2560×1440 · Ivory
- 3840×2160 · Graphite

### Report / results
- 1920×1080 · Ivory
- 2560×1440 · Museum
- 3840×2160 · Graphite

## 9. Release boundary

This v1.6 package is appropriate for:

- GitHub source control;
- GitHub Pages staging;
- Vercel static deployment;
- Netlify static deployment;
- ordinary static hosting.

It is **not yet** the protected respondent-data backend. Database, deterministic real scoring, OpenAI report generation, PDF/e-mail and secret management remain a separate server-side production layer.
