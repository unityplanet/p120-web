# P120 Independent Render Corrections v1.0

**Date:** 2026-09-02  
**Status:** IMPLEMENTED / INDEPENDENT RENDER QA REQUIRED

## Trigger
Independent Playwright render of 20 production pages in desktop and mobile modes identified four presentation/routing defects after PASS 2.2.

## Corrections
1. System locale switch: dedicated route guard preserves `/system/` ↔ `/en/system/` instead of falling back to editorial roots.
2. EN System `?start=1`: query cleanup now preserves the current `/en/system/` pathname despite `<base href="../../">`.
3. Shared EN route detection: `founder-route-v1.1.js` now recognizes every `/en/...` route, so EN Scientific Base loads root-owned navigation assets from the correct repository location instead of `/en/...` 404 paths.
4. RU legal mobile containment: legal hero grid children can shrink/wrap at narrow widths; legal wording is unchanged.

## Protected scope
- P-120 item wording: **UNCHANGED**.
- Item IDs/order/response values: **UNCHANGED**.
- Scoring/interpretation logic: **UNCHANGED**.
- Scientific Base content/evidence: **UNCHANGED**; shared navigation asset routing only.
- Legal text: **UNCHANGED**; CSS containment only.
- Editorial scientific copy/design grammar: **UNCHANGED**.

## File hashes after patch
- `system/index.html`: `9c6e859db1f19a7e222a4eed344fd8db7a4ab804586dec12055c1df04569e583`
- `en/system/index.html`: `f99d686f3e5e66e201befd1dc9e8f794f1958becfe6500e19748384684ddedc4`
- `founder-route-v1.1.js`: `73769f10d2533fca59299afb231ded119cf266fb6118ee546ff1dea38dfb0694`
- `p120-legal-v1.0.css`: `df99eb1e62dad31035ec5b31ad93508d3468073182d6ea1f3e33fadc7b9b1e6f`

**Gate:** rerun independent 40-render desktop/mobile matrix, internal links, critical transitions, and live deployment QA before PASS 3.
