# P-120 Web Editorial v1.6.1 — QA & Release Gate

## Release decision

**PASS — HOSTING-READY CORRECTIVE FRONTEND RELEASE**

Baseline: `P-120 Web Editorial v1.6`.

Scope is limited to restoration of structural contrast lost during the v1.6 de-cardification pass.

## 1. Locked logic

- Measurement changes: **NONE**
- Scoring changes: **NONE**
- Content changes: **NONE**
- HD/UHD stage logic changes: **NONE**
- Mobile UX architecture changes: **NONE**

The v1.6 static release checker still passes after the correction.

## 2. JavaScript / build

- Inline application JavaScript syntax: PASS (`node --check`).
- Static build checker: PASS (`python qa/check_build.py`).
- No new JavaScript behavior introduced by v1.6.1.

## 3. Contrast architecture correction

PASS at source level.

New theme-aware frame tokens:

- `--frame-line`
- `--frame-line-strong`
- `--frame-shadow`
- `--frame-shadow-strong`

Affected structural families include semantic cards, two-system composition, distinctions, orbital system, science objects, questionnaire, results, selected report/examples, and editorial divider rules.

## 4. De-cardification boundary

PASS.

The correction does **not** restore blanket shadows to all chapters/sections. Large editorial chapters remain open compositions. Stronger framing is reserved for elements that represent a distinct semantic object, measurement layer, comparison, system, or report object.

## 5. Theme behavior

- Ivory: stronger warm-neutral contour.
- Graphite: stronger visible contour against dark surfaces.
- Museum: teal-grey contour aligned with the existing cream/teal palette.

Older Museum rules that made selected showcase borders transparent are explicitly overridden in the final cascade for framed objects.

## 6. Responsive boundary

Desktop `>=1920 px` receives stronger depth for key structural objects to prevent contours disappearing on large stages.

Mobile/tablet retains the mature v1.2–v1.5 geometry and uses only the lighter restored frame treatment.

## 7. Live QA recommendation

After uploading this package over the current GitHub Pages build, visually verify at minimum:

- 1366×768 · Ivory
- 1920×1080 · Ivory / Graphite / Museum
- 2560×1440 · Ivory / Museum
- 3840×2160 · Graphite
- questionnaire · 1920 and 2560
- science · 1920 and 2560
- report preview · Museum

The expected change is specifically the return of readable architectural contours while preserving the v1.6 HD/UHD composition.
