# P-120 Web Editorial v1.6.1 — Contrast Architecture Restoration

Baseline: **v1.6 Desktop HD / UHD Master Pass**.

This is a deliberately narrow corrective release. It does not redesign the site and does not change measurement, scoring, respondent content, mobile UX architecture, or HD/UHD stage logic.

## Restored visual architecture

- Added dedicated `--frame-line`, `--frame-line-strong`, `--frame-shadow`, and `--frame-shadow-strong` tokens.
- Restored visible semantic contours for structural cards and systems without returning to blanket dashboard-like cardification.
- Re-strengthened editorial rules: act dividers, chapter index circles, chapter flash top/bottom rules, and resume rail.
- Restored contours/depth for:
  - module/layer cards;
  - scientific construct/evidence/validation objects;
  - semantic flow cards;
  - “two systems meet” block;
  - distinction cards;
  - orbital map shell and clusters;
  - questionnaire container;
  - selected report/result surfaces.
- Restored separator contrast in grid systems that use the border color itself as the internal divider.
- Scientific sections remain intentionally de-cardified but regain a readable boundary on HD/QHD/UHD.

## Theme-specific correction

- Ivory: warmer, darker architectural contour.
- Graphite: higher-contrast warm-grey contour with restrained dark-stage depth.
- Museum: teal-grey contour aligned to the cream/teal/sand palette.
- Museum report/showcase objects explicitly override older transparent-border rules.

## Large desktop behavior

At `>=1920 px`, selected structural objects receive slightly stronger stage depth so 1 px contours do not visually disappear on large canvases.

## Mobile

- Geometry and interaction behavior from v1.2–v1.5 remain unchanged.
- Only border contrast is restored.
- Heavy desktop shadows are intentionally suppressed on small screens.

## Locked areas

- HD/UHD stage system: unchanged.
- Mobile UX: unchanged.
- Instrument / 180 scored items: unchanged.
- Measurement changes: **NONE**.
- Scoring changes: **NONE**.
- New thresholds: **NONE**.
- Global total: **NONE**.
