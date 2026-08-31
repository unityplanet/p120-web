# P-120 Web Editorial v1.7 — Render-Led Visual System

**Release status: RELEASE / PASS**

Production hosting package based on **P-120 Web Editorial v1.6.1 — Contrast Architecture Restoration** and closed under the approved render-led visual system.

The art direction unifies homepage, scientific basis, questionnaire, transitions, report preview, mobile navigation and all three themes into one language: **museum editorial × scientific atlas × luxury publication × digital installation**.

## Themes

- Ivory / Light Editorial
- Graphite / Editorial Studio
- Dark Museum / Digital Installation

All themes use the same semantic component roles rather than independent per-component color overrides. See `THEME_SYSTEM_v1.7.md` and `SELECTOR_AUDIT_v1.7.md`.

## Release locks

- Measurement logic changed: NO
- Scoring logic changed: NO
- Question wording changed: NO
- Scientific model changed: NO
- Frozen source blocks byte-identical v1.6.1: PASS

## QA

Final QA documentation: `QA_REPORT_v1.7.md`.

Reference screenshots and the desktop resolution matrix are under `qa_visual/final_shipping/`.

Run the static shipping check with:

```bash
python3 qa/check_build.py
```

## Deployment

The package remains a static single-page application. `index.html` is the production entry point and can be deployed to GitHub Pages, Vercel, Netlify or equivalent static hosting.

See `DEPLOYMENT_RU.md` for deployment notes.
