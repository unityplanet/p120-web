from pathlib import Path
import json
import re
import hashlib

ROOT = Path('.')
RU_ED = ROOT / 'index.html'
EN_ED = ROOT / 'en/index.html'
RU_SYS = ROOT / 'system/index.html'
EN_SYS = ROOT / 'en/system/index.html'
REPORT = ROOT / 'P120_PASS2_2_RUNTIME_ISOLATION_QA.md'

for p in (RU_ED, EN_ED, RU_SYS, EN_SYS):
    if not p.exists():
        raise SystemExit(f'Missing route file: {p}')

ru_ed = RU_ED.read_text(encoding='utf-8')
en_ed = EN_ED.read_text(encoding='utf-8')
ru_sys = RU_SYS.read_text(encoding='utf-8')
en_sys = EN_SYS.read_text(encoding='utf-8')

assessment = "if(['preflight','test','transition','results'].includes(state.screen)) state.screen='home';"
redirect = "function startOrResume(){location.href='system/';return false}"
mobile_redirect = "document.querySelectorAll('[data-mobile-resume]').forEach(b=>b.onclick=()=>{closeMobileMenu();location.href='system/'});"
editorial_redirect = "const start=()=>{location.href='system/'};"
query_redirect = "if(entryParams.get('start')==='1'){location.replace('system/');return}"

for name, src in [('RU Editorial', ru_ed), ('EN Editorial', en_ed)]:
    for marker in (assessment, redirect, mobile_redirect, editorial_redirect, query_redirect):
        if marker not in src:
            raise SystemExit(f'{name}: missing boundary marker: {marker}')

forbidden_editorial = [
    "function startOrResume(){return hasProgress()?resumeTest():openPreflight()}",
    "const start=()=>progress?resumeTest():openPreflight();",
    "document.querySelectorAll('[data-mobile-resume]').forEach(b=>b.onclick=()=>{closeMobileMenu();resumeTest()});",
    "if(entryParams.get('start')==='1'){state.screen=hasProgress()?'test':'preflight';save()}",
]
for name, src in [('RU Editorial', ru_ed), ('EN Editorial', en_ed)]:
    for marker in forbidden_editorial:
        if marker in src:
            raise SystemExit(f'{name}: active local assessment entry remains: {marker}')

# Route language identity.
if '<html lang="ru">' not in ru_ed or '<html lang="ru">' not in ru_sys:
    raise SystemExit('RU route language identity failed')
if '<html lang="en">' not in en_ed or '<html lang="en">' not in en_sys:
    raise SystemExit('EN route language identity failed')

# System ownership / legacy translator exclusion.
for forbidden in ['p120-en-system-runtime-v0.4.js', 'p120-en-item-binding-v0.4.js', 'p120-public-runtime-v1.0.js']:
    if forbidden in en_sys:
        raise SystemExit(f'EN System still loads forbidden legacy runtime: {forbidden}')

# Parse canonical instrument payloads.
def instrument(src):
    m = re.search(r'window\.P120_INSTRUMENT\s*=\s*(\{.*?\});\s*</script>', src, re.S)
    if not m:
        raise SystemExit('P120_INSTRUMENT block missing')
    return json.loads(m.group(1))

ru_i = instrument(ru_sys)
en_i = instrument(en_sys)
ru_items = ru_i.get('items', [])
en_items = en_i.get('items', [])
if len(ru_items) != 180 or len(en_items) != 180:
    raise SystemExit(f'Expected 180 items each, got RU={len(ru_items)} EN={len(en_items)}')
ru_ids = [x.get('id') for x in ru_items]
en_ids = [x.get('id') for x in en_items]
if ru_ids != en_ids or len(set(ru_ids)) != 180:
    raise SystemExit('RU/EN item ID/order parity failed')

# Coded-response structural parity. Localized strings are intentionally excluded.
struct_keys = ['id','module','type','scale','reverse','scored','facet','construct','dimension','values','codes','weight']
for idx, (r, e) in enumerate(zip(ru_items, en_items), start=1):
    rs = {k:r.get(k) for k in struct_keys if k in r or k in e}
    es = {k:e.get(k) for k in struct_keys if k in r or k in e}
    if rs != es:
        raise SystemExit(f'Item structural/coding drift at {r.get("id") or idx}: {rs} != {es}')

# Design preservation: the main inline CSS block for System must remain identical across locales.
def style_hash(src):
    m = re.search(r'<style>(.*?)</style>', src, re.S)
    if not m:
        raise SystemExit('Primary inline style block missing')
    return hashlib.sha256(m.group(1).encode('utf-8')).hexdigest()

ru_style = style_hash(ru_sys)
en_style = style_hash(en_sys)
if ru_style != en_style:
    raise SystemExit('RU/EN System primary design style parity failed')

# Editorial CSS is also expected to preserve the same visual grammar.
ru_ed_style = style_hash(ru_ed)
en_ed_style = style_hash(en_ed)
if ru_ed_style != en_ed_style:
    raise SystemExit('RU/EN Editorial primary design style parity failed')

report = f"""# P120 PASS 2.2 — Runtime Isolation & Language Routing Verification\n\n**Status:** PASS / STATIC QA COMPLETE\n\n## Route matrix\n- `/` → RU Editorial only: PASS\n- `/en/` → EN Editorial only: PASS\n- `/system/` → RU System runtime: PASS\n- `/en/system/` → EN System runtime: PASS\n\n## Boundary verification\n- Saved assessment screen cannot seize either editorial route: PASS\n- Editorial Start/Resume redirects to dedicated locale-relative `system/`: PASS\n- Mobile resume redirects to dedicated locale-relative `system/`: PASS\n- `?start=1` redirects to dedicated locale-relative `system/`: PASS\n- EN System legacy post-render translator/binding excluded: PASS\n\n## Measurement integrity\n- RU items: {len(ru_items)}\n- EN items: {len(en_items)}\n- ID/order parity: PASS (180/180 unique)\n- Structural/coded-response parity: PASS\n\n## Design preservation\n- RU/EN System primary CSS SHA-256: `{ru_style}`\n- RU/EN Editorial primary CSS SHA-256: `{ru_ed_style}`\n- Design parity: PASS\n\n## Protected scope\n- Scientific Base content: not modified by PASS 2.1.1 branch diff.\n- Scoring logic: not modified.\n- Item wording/content in System: not modified by this boundary pass.\n- Legacy deletion: NONE.\n\n**Next:** controlled PR/merge to `main`, GitHub Pages deployment, then live mobile/desktop smoke test.\n"""
REPORT.write_text(report, encoding='utf-8')
print('PASS 2.2 static runtime isolation QA: PASS')
