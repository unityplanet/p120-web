from pathlib import Path
import hashlib

RU = Path('index.html')
EN = Path('en/index.html')
CONTROL = Path('P120_PASS2_1_1_EDITORIAL_BOUNDARY_CONTROL.md')

ru = RU.read_text(encoding='utf-8')
en = EN.read_text(encoding='utf-8')

# PASS 2 baseline invariants on the RU editorial route. Do not modify RU here.
ru_required = [
    "if(['preflight','test','transition','results'].includes(state.screen)) state.screen='home';",
    "function startOrResume(){location.href='system/';return false}",
    "document.querySelectorAll('[data-mobile-resume]').forEach(b=>b.onclick=()=>{closeMobileMenu();location.href='system/'});",
    "const start=()=>{location.href='system/'};",
    "if(entryParams.get('start')==='1'){location.replace('system/');return}",
]
for marker in ru_required:
    if marker not in ru:
        raise SystemExit(f'RU editorial boundary invariant missing: {marker}')

replacements = [
    (
        "let state=load();\nlet theme=loadTheme();",
        "let state=load();\nif(['preflight','test','transition','results'].includes(state.screen)) state.screen='home';\nlet theme=loadTheme();",
    ),
    (
        "function startOrResume(){return hasProgress()?resumeTest():openPreflight()}",
        "function startOrResume(){location.href='system/';return false}",
    ),
    (
        "document.querySelectorAll('[data-mobile-resume]').forEach(b=>b.onclick=()=>{closeMobileMenu();resumeTest()});",
        "document.querySelectorAll('[data-mobile-resume]').forEach(b=>b.onclick=()=>{closeMobileMenu();location.href='system/'});",
    ),
    (
        "const start=()=>progress?resumeTest():openPreflight();",
        "const start=()=>{location.href='system/'};",
    ),
    (
        "if(entryParams.get('start')==='1'){state.screen=hasProgress()?'test':'preflight';save()}",
        "if(entryParams.get('start')==='1'){location.replace('system/');return}",
    ),
]

changed = []
for old, new in replacements:
    count = en.count(old)
    if count == 1:
        en = en.replace(old, new, 1)
        changed.append(old)
    elif count == 0 and new in en:
        # Idempotent re-run.
        pass
    else:
        raise SystemExit(f'Expected exactly one EN boundary marker, found {count}: {old}')

# Hard postconditions: English editorial must never restore or enter assessment screens itself.
en_required = [
    "if(['preflight','test','transition','results'].includes(state.screen)) state.screen='home';",
    "function startOrResume(){location.href='system/';return false}",
    "document.querySelectorAll('[data-mobile-resume]').forEach(b=>b.onclick=()=>{closeMobileMenu();location.href='system/'});",
    "const start=()=>{location.href='system/'};",
    "if(entryParams.get('start')==='1'){location.replace('system/');return}",
]
for marker in en_required:
    if marker not in en:
        raise SystemExit(f'EN editorial boundary invariant missing after patch: {marker}')

for forbidden in [
    "function startOrResume(){return hasProgress()?resumeTest():openPreflight()}",
    "const start=()=>progress?resumeTest():openPreflight();",
    "document.querySelectorAll('[data-mobile-resume]').forEach(b=>b.onclick=()=>{closeMobileMenu();resumeTest()});",
    "if(entryParams.get('start')==='1'){state.screen=hasProgress()?'test':'preflight';save()}",
]:
    if forbidden in en:
        raise SystemExit(f'Forbidden EN editorial test-entry path still active: {forbidden}')

EN.write_text(en, encoding='utf-8')

control = f"""# P120 PASS 2.1.1 — Editorial Runtime Boundary Guard\n\n**Status:** IMPLEMENTED / QA REQUIRED\n\n## Scope\n- RU Editorial `/`: existing PASS 2 boundary invariants verified; no content/design changes.\n- EN Editorial `/en/`: assessment-state restore blocked and all active editorial test-entry handlers redirected to `system/` (resolves to `/en/system/`).\n- RU System `/system/`: untouched.\n- EN System `/en/system/`: untouched.\n\n## Preserved invariants\n- Scientific Base: untouched.\n- P-120 item corpus: untouched.\n- Item IDs/order/response values: untouched.\n- Scoring logic: untouched.\n- CSS/typography/layout: untouched.\n- Legacy files: not deleted.\n\n## Editorial hard-boundary postconditions\n1. Saved `preflight/test/transition/results` state is coerced to `home` in `/en/` before render.\n2. Editorial Start/Resume uses dedicated `system/` route.\n3. Mobile resume uses dedicated `system/` route.\n4. Editorial CTA binding uses dedicated `system/` route.\n5. `?start=1` redirects to dedicated `system/` route.\n\n## Integrity\n- RU SHA-256 after pass: `{hashlib.sha256(ru.encode()).hexdigest()}`\n- EN SHA-256 after pass: `{hashlib.sha256(en.encode()).hexdigest()}`\n"""
CONTROL.write_text(control, encoding='utf-8')
print(f'PASS 2.1.1 patch complete; replacements applied: {len(changed)}')
