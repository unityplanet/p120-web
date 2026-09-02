from pathlib import Path
import hashlib
import json
import re
import subprocess

RU=Path('system/index.html')
EN=Path('en/system/index.html')
FREEZE_REF='origin/freeze/p120-web-pre-reconciliation-2026-09-02'


def sha(s): return hashlib.sha256(s.encode('utf-8')).hexdigest()

def git_show(ref,path):
    return subprocess.check_output(['git','show',f'{ref}:{path}'],text=True,encoding='utf-8')

def extract_instrument(s):
    m=re.search(r'window\.P120_INSTRUMENT\s*=\s*(\{.*?\});\s*</script>',s,re.S)
    if not m: raise AssertionError('P120_INSTRUMENT missing')
    return m.group(1),json.loads(m.group(1))

def manifest(x):
    return [(i.get('id'),i.get('module'),i.get('type'),tuple(c.get('value') for c in i.get('choices',[]))) for i in x.get('items',[])]

def extract_app(s):
    marker='<!-- inlined: app.js -->'
    p=s.find(marker)
    if p<0: raise AssertionError('app.js marker missing')
    op=s.find('<script>',p); cl=s.find('</script>',op)
    if op<0 or cl<0: raise AssertionError('app.js bounds missing')
    return s[op+8:cl]

def extract_function(app,name):
    m=re.search(rf'function\s+{re.escape(name)}\s*\([^)]*\)\s*\{{',app)
    if not m:return ''
    start=m.start(); i=m.end()-1; depth=0; quote=None; esc=False; template=False
    while i<len(app):
        ch=app[i]
        if quote:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch==quote: quote=None
        elif template:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch=='`': template=False
        else:
            if ch in "'\"": quote=ch
            elif ch=='`': template=True
            elif ch=='{': depth+=1
            elif ch=='}':
                depth-=1
                if depth==0:return app[start:i+1]
        i+=1
    return app[start:]

def inline_styles(s):
    return re.findall(r'<style[^>]*>(.*?)</style>',s,re.S|re.I)

def css_links(s):
    return sorted(re.findall(r'<link\b[^>]*(?:rel="(?:stylesheet|preload)"|as="style")[^>]*>',s,re.I))

def script_with_token(s,token):
    for block in re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>',s,re.S|re.I):
        if token in block:return block
    raise AssertionError(f'script token missing: {token}')

def no_cyr(s): return not re.search(r'[А-Яа-яЁё]',s)

freeze=git_show(FREEZE_REF,'system/index.html')
ru=RU.read_text(encoding='utf-8')
en=EN.read_text(encoding='utf-8')
errors=[]
checks=[]

def check(cond,label,detail=''):
    checks.append({'check':label,'status':'PASS' if cond else 'FAIL','detail':detail})
    if not cond: errors.append(label + (': '+detail if detail else ''))

# Route identity and route-owned language.
check('<html lang="ru">' in ru,'RU lang authority')
check('<html lang="en">' in en,'EN lang authority')
check('data-p120-route-authority="native-ru"' in ru,'RU native route marker')
check('data-p120-route-authority="native-en"' in en,'EN native route marker')
check('<base href="../" />' in ru,'RU shared-asset base')
check('<base href="../../" />' in en,'EN shared-asset base')

# No browser translation/binding or editorial runtime mutation on System.
for token in [
    'p120-en-system-runtime-v0.4.js','p120-en-instrument-bind-v0.4.js',
    'p120-public-runtime-v1.0.js','founder-route-v1.1.js',
    'extended-research-navigation-v1.0.js','science-navigation-reconciliation-v1.0.js',
    'brand-origin-scroll-interstitial-runtime-v1','p120-science-public-v12-runtime'
]:
    check(token not in ru and token not in en,'System excludes runtime coupling',token)

check('P120_EN_BINDING' not in en,'EN has no runtime item binding')
check('p120-en-items-' not in en and 'p120-en-pass4-overrides' not in en,'EN has no runtime localization manifests')

# Measurement identity and frozen RU authority.
frozen_raw,frozen_i=extract_instrument(freeze)
ru_raw,ru_i=extract_instrument(ru)
en_raw,en_i=extract_instrument(en)
check(sha(frozen_raw)==sha(ru_raw),'RU instrument payload byte parity with rollback freeze')
check(manifest(ru_i)==manifest(en_i),'RU/EN coded-response manifest parity')
check(len(manifest(ru_i))==180 and len({x[0] for x in manifest(ru_i)})==180,'180/180 unique scored item IDs')

# English item/module presentation is materialized, not translated at runtime.
en_item_fields=[]
for i in en_i.get('items',[]):
    en_item_fields.extend([str(i.get('text','')),str(i.get('optionA','')),str(i.get('optionB',''))])
for m in en_i.get('modules',[]):
    en_item_fields.extend([str(m.get('title','')),str(m.get('subtitle','')),str(m.get('intro',''))])
check(all(no_cyr(x) for x in en_item_fields),'EN instrument respondent fields contain no Cyrillic')
check(en_i.get('locale')=='en','EN instrument locale metadata')

# Scoring code is unchanged and language-independent.
frozen_scoring=script_with_token(freeze,'window.P120Scoring')
ru_scoring=script_with_token(ru,'window.P120Scoring')
en_scoring=script_with_token(en,'window.P120Scoring')
check(sha(frozen_scoring)==sha(ru_scoring)==sha(en_scoring),'Scoring runtime byte parity RU/EN/freeze')

# Visual design preservation: CSS/inline style authority must be unchanged.
freeze_styles=inline_styles(freeze); ru_styles=inline_styles(ru); en_styles=inline_styles(en)
check([sha(x) for x in freeze_styles]==[sha(x) for x in ru_styles],'RU inline design styles preserved')
check([sha(x) for x in freeze_styles]==[sha(x) for x in en_styles],'EN inline design styles preserved')
check(css_links(freeze)==css_links(ru)==css_links(en),'Shared stylesheet/font links preserved')

# System-only routing must not recurse or use <base>-sensitive self-link literals.
for label,s in [('RU',ru),('EN',en)]:
    app=extract_app(s)
    start=extract_function(app,'startOrResume')
    check('startOrResume(){startOrResume()' not in app,f'{label} startOrResume recursion absent')
    check("location.href='system/'" not in app,f'{label} nested system redirect absent')
    check(all(x in start for x in ['renderPreflight','renderQuestion','renderResults']),f'{label} native start/resume state routing')
    check('function systemLocaleHref(locale)' in app,f'{label} System locale route helper')
    check("renderSystemLanguageSwitch('desktop')" in app and "renderSystemLanguageSwitch('mobile')" in app,f'{label} native RU/EN selector present')
    check('href="./" aria-current="page"' not in app,f'{label} base-sensitive System self-link absent')
    check("systemLocaleHref(document.documentElement.lang==='en'?'en':'ru')" in app,f'{label} System self-link uses route authority helper')
    check("new URL('../',location.href)" in extract_function(app,'goHome'),f'{label} home route uses current URL authority')
    check("new URL('../',location.href)" in extract_function(app,'goScience'),f'{label} science route uses current URL authority')

# Active EN respondent/UI functions are English-only. Dormant editorial/science
# renderers remain physically present until PASS 4 but cannot own System navigation.
active=[
    'moduleBlurb','adminModeRu','adminModeHint','themeLabel','renderThemeSwitch','renderHeaderThemeMenu',
    'renderMobileBottomNav','renderMobileDrawer','shell','updateTopbar','renderSidebar',
    'renderMobileModulebar','renderModuleProgress','renderPreflight','renderTransition',
    'renderQuestion','checkAI','renderResults'
]
en_app=extract_app(en)
dirty={}
for name in active:
    f=extract_function(en_app,name)
    if not f: dirty[name]=['FUNCTION_MISSING']
    else:
        hits=sorted(set(re.findall(r'[^\n]{0,80}[А-Яа-яЁё][^\n]{0,100}',f)))
        if hits: dirty[name]=hits[:10]
check(not dirty,'Active EN System functions contain no Cyrillic',json.dumps(dirty,ensure_ascii=False))

# Explicit owner-reported mixed-language regressions.
for token in ['ПРОГРЕСС МОДУЛЯ','прогресс модуля','>Главная<','>О тесте<','>Наука<','>Продолжить<']:
    check(token not in en_app,'Owner screenshot mixed-language regression absent',token)

# Auxiliary route-localized copy recognizes nested English routes.
for path in ['manual-report-handoff-v1.0.js','p120-submission-intake-v1.0.js']:
    aux=Path(path).read_text(encoding='utf-8')
    check("/(^|\\/)en(?:\\/|$)/i.test(location.pathname)" in aux,'Nested EN locale detector',path)

# No Scientific Base production asset is rewritten by PASS 2: control is by diff
# scope; the PASS 2 QA report records this invariant explicitly.

report={
    'document_id':'P120-WEB-REC-PASS2-CLOSURE-QA',
    'version':'1.0',
    'date':'2026-09-02',
    'status':'FAIL' if errors else 'PASS',
    'route_authority':{'/system/':'native-ru','/en/system/':'native-en'},
    'post_render_translator':'ABSENT',
    'runtime_translation_manifests':'ABSENT_FROM_EN_ROUTE',
    'system_language_selector':'NATIVE_ROUTE_OWNED',
    'item_count':len(manifest(ru_i)),
    'measurement_manifest_sha256':sha(json.dumps(manifest(ru_i),ensure_ascii=False,sort_keys=True)),
    'ru_instrument_sha256':sha(ru_raw),
    'frozen_ru_instrument_sha256':sha(frozen_raw),
    'scoring_runtime_sha256':sha(ru_scoring),
    'visual_inline_style_hashes':[sha(x) for x in ru_styles],
    'active_en_functions_checked':len(active),
    'measurement_scoring_changes':'NONE',
    'scientific_base_changes':'NONE',
    'session_storage_redesign':'DEFERRED_TO_PASS3',
    'legacy_file_deletion':'NONE',
    'checks':checks,
    'failures':errors,
}
Path('P120_WEB_RECONCILIATION_PASS2_CLOSURE_QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if errors:
    raise SystemExit('\n'.join(errors))
print(json.dumps({k:v for k,v in report.items() if k not in ('checks',)},ensure_ascii=False,indent=2))
