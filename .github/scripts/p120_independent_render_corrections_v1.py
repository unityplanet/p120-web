from pathlib import Path
import hashlib
import re

ROOT=Path('.')
RU_SYSTEM=ROOT/'system/index.html'
EN_SYSTEM=ROOT/'en/system/index.html'
EN_SCIENCE=ROOT/'en/science/index.html'
LEGAL=ROOT/'p120-legal-v1.0.css'
CONTROL=ROOT/'P120_INDEPENDENT_RENDER_CORRECTIONS_v1.0.md'

ru=RU_SYSTEM.read_text(encoding='utf-8')
en=EN_SYSTEM.read_text(encoding='utf-8')
science=EN_SCIENCE.read_text(encoding='utf-8')
legal=LEGAL.read_text(encoding='utf-8')

# 1) Dedicated System locale guard. Injection is deliberately after existing runtime layers.
guard_tag='<script src="p120-system-route-guard-v1.0.js?v=sysroute10" data-p120-system-route-guard="v1.0"></script>'
for label,text,path in [('RU System',ru,RU_SYSTEM),('EN System',en,EN_SYSTEM)]:
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

# 3) EN Scientific Base: root-owned assets must escape its /en/ base URL.
science_assets=['navigation-unification-v1.0.css','extended-research-navigation-v1.0.js']
corrected_assets=[]
for asset in science_assets:
    # Match the source token plus optional cache query, but only when it is not already ../-prefixed.
    pattern=re.compile(r'(?<!\.\./)'+re.escape(asset)+r'(?:\?[^"\'<>\s]*)?')
    matches=pattern.findall(science)
    if len(matches)>1:
        raise SystemExit(f'EN Science asset {asset}: expected at most 1 uncorrected marker, found {len(matches)}')
    if matches:
        token=matches[0]
        science=science.replace(token,'../'+token,1)
    # Postcondition: an explicitly ../-prefixed token must now exist.
    ok=re.search(r'\.\./'+re.escape(asset)+r'(?:\?[^"\'<>\s]*)?',science)
    if not ok:
        raise SystemExit(f'EN Science corrected asset missing: ../{asset}')
    corrected_assets.append('../'+asset)

# 4) RU legal pages: constrain hero grid min-content on narrow screens; content stays unchanged.
legal_marker='/* P120 INDEPENDENT RENDER MOBILE LEGAL CONTAINMENT v1.0 */'
legal_fix='''\n\n/* P120 INDEPENDENT RENDER MOBILE LEGAL CONTAINMENT v1.0 */\n@media(max-width:760px){\n  .p120-legal-hero>*{min-width:0}\n  .p120-legal-hero h1,.p120-legal-kicker,.p120-legal-hero__meta{max-width:100%;overflow-wrap:anywhere;word-break:normal}\n}\n'''
if legal_marker not in legal:
    legal=legal.rstrip()+legal_fix

RU_SYSTEM.write_text(ru,encoding='utf-8')
EN_SYSTEM.write_text(en,encoding='utf-8')
EN_SCIENCE.write_text(science,encoding='utf-8')
LEGAL.write_text(legal,encoding='utf-8')

# Hard postconditions.
for label,text in [('RU System',ru),('EN System',en)]:
    if text.count(guard_tag)!=1: raise SystemExit(f'{label}: guard tag count != 1')
if old_start in en or new_start not in en: raise SystemExit('EN System start-route correction failed')
if legal_marker not in legal: raise SystemExit('Legal containment marker missing')

CONTROL.write_text(f'''# P120 Independent Render Corrections v1.0\n\n**Date:** 2026-09-02  \n**Status:** IMPLEMENTED / INDEPENDENT RENDER QA REQUIRED\n\n## Trigger\nIndependent Playwright render of 20 production pages in desktop and mobile modes identified four presentation/routing defects after PASS 2.2.\n\n## Corrections\n1. System locale switch: dedicated route guard preserves `/system/` ↔ `/en/system/` instead of falling back to editorial roots.\n2. EN System `?start=1`: query cleanup now preserves the current `/en/system/` pathname despite `<base href="../../">`.\n3. EN Scientific Base: two root-owned navigation assets now resolve from repository root, eliminating `/en/...` 404 requests.\n4. RU legal mobile containment: legal hero grid children can shrink/wrap at narrow widths; legal wording is unchanged.\n\n## Protected scope\n- P-120 item wording: **UNCHANGED**.\n- Item IDs/order/response values: **UNCHANGED**.\n- Scoring/interpretation logic: **UNCHANGED**.\n- Scientific Base content/evidence: **UNCHANGED**; only two asset URL references corrected.\n- Legal text: **UNCHANGED**; CSS containment only.\n- Editorial scientific copy/design grammar: **UNCHANGED**.\n\n## File hashes after patch\n- `system/index.html`: `{hashlib.sha256(ru.encode()).hexdigest()}`\n- `en/system/index.html`: `{hashlib.sha256(en.encode()).hexdigest()}`\n- `en/science/index.html`: `{hashlib.sha256(science.encode()).hexdigest()}`\n- `p120-legal-v1.0.css`: `{hashlib.sha256(legal.encode()).hexdigest()}`\n\n**Gate:** rerun independent 40-render desktop/mobile matrix, internal links, critical transitions, and live deployment QA before PASS 3.\n''',encoding='utf-8')
print('P120 Independent Render Corrections v1.0 applied successfully')
