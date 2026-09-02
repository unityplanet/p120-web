from pathlib import Path
import hashlib

ROOT=Path('.')
RU_SYSTEM=ROOT/'system/index.html'
EN_SYSTEM=ROOT/'en/system/index.html'
FOUNDER=ROOT/'founder-route-v1.1.js'
LEGAL=ROOT/'p120-legal-v1.0.css'
CONTROL=ROOT/'P120_INDEPENDENT_RENDER_CORRECTIONS_v1.0.md'

ru=RU_SYSTEM.read_text(encoding='utf-8')
en=EN_SYSTEM.read_text(encoding='utf-8')
founder=FOUNDER.read_text(encoding='utf-8')
legal=LEGAL.read_text(encoding='utf-8')

# 1) Dedicated System locale guard. Injection is deliberately after existing runtime layers.
guard_tag='<script src="p120-system-route-guard-v1.0.js?v=sysroute10" data-p120-system-route-guard="v1.0"></script>'
for label,text in [('RU System',ru),('EN System',en)]:
    if guard_tag not in text:
        if text.count('</body>') != 1:
            raise SystemExit(f'{label}: expected exactly one </body>, found {text.count("</body>")}')
        text=text.replace('</body>',f'  {guard_tag}\n</body>',1)
    if label=='RU System': ru=text
    else: en=text

# 2) EN System ?start=1 must stay on EN System. <base href="../../"> makes relative system/ point to RU.
old_start="if(entryParams.get('start')==='1'){location.replace('system/');return}"
new_start="if(entryParams.get('start')==='1'){location.replace(location.pathname);return}"
if old_start in en:
    if en.count(old_start)!=1: raise SystemExit(f'EN System start marker count={en.count(old_start)}')
    en=en.replace(old_start,new_start,1)
elif new_start not in en:
    raise SystemExit('EN System start marker not found')

# 3) Shared founder/navigation bridge must recognize every /en/... route, not only /en/ root.
old_is_en="const isEn=/\\/en\\/(?:index\\.html)?$/i.test(location.pathname);"
new_is_en="const isEn=/\\/en(?:\\/|$)/i.test(location.pathname);"
if old_is_en in founder:
    if founder.count(old_is_en)!=1: raise SystemExit(f'Founder EN route marker count={founder.count(old_is_en)}')
    founder=founder.replace(old_is_en,new_is_en,1)
elif new_is_en not in founder:
    raise SystemExit('Founder EN route marker not found')

# 4) RU legal pages: constrain hero grid min-content on narrow screens; content stays unchanged.
legal_marker='/* P120 INDEPENDENT RENDER MOBILE LEGAL CONTAINMENT v1.0 */'
legal_fix='''\n\n/* P120 INDEPENDENT RENDER MOBILE LEGAL CONTAINMENT v1.0 */\n@media(max-width:760px){\n  .p120-legal-hero>*{min-width:0}\n  .p120-legal-hero h1,.p120-legal-kicker,.p120-legal-hero__meta{max-width:100%;overflow-wrap:anywhere;word-break:normal}\n}\n'''
if legal_marker not in legal:
    legal=legal.rstrip()+legal_fix

RU_SYSTEM.write_text(ru,encoding='utf-8')
EN_SYSTEM.write_text(en,encoding='utf-8')
FOUNDER.write_text(founder,encoding='utf-8')
LEGAL.write_text(legal,encoding='utf-8')

# Hard postconditions.
for label,text in [('RU System',ru),('EN System',en)]:
    if text.count(guard_tag)!=1: raise SystemExit(f'{label}: guard tag count != 1')
if old_start in en or new_start not in en: raise SystemExit('EN System start-route correction failed')
if old_is_en in founder or new_is_en not in founder: raise SystemExit('Founder EN route recognition correction failed')
if legal_marker not in legal: raise SystemExit('Legal containment marker missing')

CONTROL.write_text(f'''# P120 Independent Render Corrections v1.0\n\n**Date:** 2026-09-02  \n**Status:** IMPLEMENTED / INDEPENDENT RENDER QA REQUIRED\n\n## Trigger\nIndependent Playwright render of 20 production pages in desktop and mobile modes identified four presentation/routing defects after PASS 2.2.\n\n## Corrections\n1. System locale switch: dedicated route guard preserves `/system/` ↔ `/en/system/` instead of falling back to editorial roots.\n2. EN System `?start=1`: query cleanup now preserves the current `/en/system/` pathname despite `<base href="../../">`.\n3. Shared EN route detection: `founder-route-v1.1.js` now recognizes every `/en/...` route, so EN Scientific Base loads root-owned navigation assets from the correct repository location instead of `/en/...` 404 paths.\n4. RU legal mobile containment: legal hero grid children can shrink/wrap at narrow widths; legal wording is unchanged.\n\n## Protected scope\n- P-120 item wording: **UNCHANGED**.\n- Item IDs/order/response values: **UNCHANGED**.\n- Scoring/interpretation logic: **UNCHANGED**.\n- Scientific Base content/evidence: **UNCHANGED**; shared navigation asset routing only.\n- Legal text: **UNCHANGED**; CSS containment only.\n- Editorial scientific copy/design grammar: **UNCHANGED**.\n\n## File hashes after patch\n- `system/index.html`: `{hashlib.sha256(ru.encode()).hexdigest()}`\n- `en/system/index.html`: `{hashlib.sha256(en.encode()).hexdigest()}`\n- `founder-route-v1.1.js`: `{hashlib.sha256(founder.encode()).hexdigest()}`\n- `p120-legal-v1.0.css`: `{hashlib.sha256(legal.encode()).hexdigest()}`\n\n**Gate:** rerun independent 40-render desktop/mobile matrix, internal links, critical transitions, and live deployment QA before PASS 3.\n''',encoding='utf-8')
print('P120 Independent Render Corrections v1.0 applied successfully')
