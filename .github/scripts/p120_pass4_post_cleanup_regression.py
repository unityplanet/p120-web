from pathlib import Path
import hashlib
import json
import subprocess

BASELINE='f46b7335e47d75672424136979f91a1a3997aa37'
OUT_JSON=Path('P120_PASS4_POST_CLEANUP_REGRESSION_v1.0.json')
OUT_MD=Path('P120_PASS4_POST_CLEANUP_REGRESSION_v1.0.md')

PROTECTED=[
    'index.html','en/index.html',
    'science/index.html','en/science/index.html',
    'system/index.html','en/system/index.html',
    'p120-scientific-base-runtime-v1.0.js',
    'P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json',
    'p120-session-contract-v1.0.js',
    'p120-submission-intake-v1.0.js',
    'manual-report-handoff-v1.0.js',
    'science-navigation-reconciliation-v1.0.js',
    'p120-en-science-localization-runtime-v1.0.js',
    'public-en-science-dictionary-v1.0.js',
]

REMOVED=[
    '.github/scripts/p120_scientific_base_production_migration.py',
    '.github/scripts/p120_en_science_localization_bind_v1.py',
    '.github/workflows/p120-scientific-base-production-migration-apply.yml',
    '.github/workflows/apply-science-public-v12.yml',
    '.github/workflows/publish-p120-public-science-v12.yml',
    '.github/workflows/publish-p120-public-science-en-v12.yml',
    '.github/workflows/extract-science-localization-source.yml',
    '.github/workflows/restore-science-visual-parity-v1.yml',
    '.github/workflows/restore-science-visual-parity-v2.yml',
    '.github/workflows/fix-science-navigation-direction-v1.yml',
    '.github/workflows/fix-science-navigation-direction-v1-1.yml',
    '.github/workflows/fix-science-navigation-direction-v1-2.yml',
    '.github/workflows/fix-science-navigation-direction-v1-3.yml',
    '.github/workflows/fix-science-navigation-direction-v1-4.yml',
    '.github/workflows/fix-science-parity-idempotence.yml',
    '.github/workflows/patch-science-direct-link-v1.yml',
    '.github/workflows/p120-en-science-localization-bind-v1.yml',
    '.github/workflows/p120-en-science-localization-gate-v1.yml',
    '.github/workflows/p120-en-science-localization-probe-v1.yml',
    '.github/workflows/qa-scientific-base-dedicated-v1.yml',
    '.github/workflows/qa-web-science-pass3.yml',
    'qa/en_science_localization_gate_v1.mjs',
    'qa/en_science_localization_probe_v1.mjs',
    '.github/p120-public-science-en-v12-xz/part-00.b64',
    '.github/p120-public-science-en-v12-xz/part-01.b64',
    '.github/p120-public-science-en-v12-xz/part-02.b64',
    '.github/p120-public-science-en-v12-xz/part-04.b64',
    '.github/p120-public-science-en-v12-xz/part-05.b64',
    '.github/p120-public-science-v12-xz/part-00.b64',
    '.github/p120-public-science-v12-xz/part-01.b64',
    '.github/p120-public-science-v12-xz/part-02.b64',
    '.github/p120-public-science-v12-xz/part-03.b64',
    '.github/p120-public-science-v12-xz/part-04.b64',
    '.github/p120-public-science-v12-xz/part-05.b64',
    '.github/p120-public-science-v12/part-00.b64',
    '.github/p120-public-science-v12/part-01.b64',
    '.github/p120-public-science-v12/part-02.b64',
    '.github/p120-public-science-v12/part-03.b64',
    '.github/p120-public-science-v12/part-04.b64',
]

REPORTS={
    'site_render':'qa-evidence-independent-render-v1-1/report.json',
    'pass3_session':'qa-evidence-pass3-session-contract-v1/P120_WEB_RECONCILIATION_PASS3_QA.json',
    'science':'qa-evidence-science-production-v1/P120_SCIENCE_PRODUCTION_QA_v1.0.json',
}

checks=[]
def add(cid, passed, detail=None):
    row={'id':cid,'pass':bool(passed)}
    if detail is not None: row['detail']=detail
    checks.append(row)

# 1. Byte identity of every protected production asset against the pre-cleanup production baseline.
for rel in PROTECTED:
    p=Path(rel)
    if not p.exists():
        add(f'protected exists: {rel}',False,'missing')
        continue
    baseline=subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])
    current=p.read_bytes()
    add(f'protected byte identity: {rel}',current==baseline,{
        'baseline_sha256':hashlib.sha256(baseline).hexdigest(),
        'current_sha256':hashlib.sha256(current).hexdigest(),
    })

# 2. Removed debris remains absent.
for rel in REMOVED:
    add(f'obsolete debris absent: {rel}',not Path(rel).exists())

# 3. Parse independent regression gates.
loaded={}
for name,rel in REPORTS.items():
    p=Path(rel)
    if not p.exists():
        add(f'{name} report exists',False,rel)
        continue
    data=json.loads(p.read_text(encoding='utf-8'))
    loaded[name]=data
    add(f'{name} report exists',True,rel)

site=loaded.get('site_render',{})
add('20-route independent render regression',site.get('summary',{}).get('pass') is True,site.get('summary'))
add('40 desktop/mobile render cases',site.get('summary',{}).get('render_cases')==40,site.get('summary',{}).get('render_cases'))
mp=site.get('measurement_parity') or {}
add('180/180 RU/EN measurement item parity',mp.get('ru_items')==180 and mp.get('en_items')==180 and mp.get('ru_unique')==180 and mp.get('en_unique')==180,mp)
add('measurement ID/order parity',mp.get('id_order_parity') is True,mp)
add('coded response structure parity',mp.get('coded_structure_parity') is True,mp)

p3=loaded.get('pass3_session',{})
add('PASS 3 locale/session contract regression',p3.get('status')=='PASS',{
    'status':p3.get('status'),
    'measurement':p3.get('measurement'),
    'storage':p3.get('storage'),
})

science=loaded.get('science',{})
add('Scientific Base production regression',science.get('status')=='PASS',{
    'status':science.get('status'),
    'checks_total':science.get('checks_total'),
    'checks_passed':science.get('checks_passed'),
    'checks_failed':science.get('checks_failed'),
})
add('Scientific Base 269/269 acceptance parity',science.get('checks_total')==269 and science.get('checks_passed')==269 and science.get('checks_failed')==0,{
    'total':science.get('checks_total'),'passed':science.get('checks_passed'),'failed':science.get('checks_failed')
})

# 4. Current authoritative assets remain singular/current.
ru=Path('science/index.html').read_text(encoding='utf-8')
en=Path('en/science/index.html').read_text(encoding='utf-8')
for locale,text in [('RU',ru),('EN',en)]:
    add(f'{locale} Science single production runtime loader',text.count('p120-scientific-base-runtime-v1.0.js')==1,text.count('p120-scientific-base-runtime-v1.0.js'))
    add(f'{locale} Science no active historical respondent key',"const KEY='p120_web_prototype_v01';" not in text)
add('current Scientific Base QA retained',Path('.github/workflows/p120-scientific-base-production-gate.yml').exists())
add('current PASS 3 QA retained',Path('.github/workflows/p120-pass3-session-contract-gate.yml').exists())
add('active Science navigation reconciliation retained',Path('science-navigation-reconciliation-v1.0.js').exists())

passed=sum(1 for c in checks if c['pass'])
failed=len(checks)-passed
result={
    'document_id':'P120-WEB-RUNTIME-PASS4-REGRESSION-001',
    'version':'1.0',
    'date':'2026-09-02',
    'stage':'P120 Web Runtime Reconciliation — PASS 4 / Post-Science Integration Cleanup & Consolidation',
    'baseline':BASELINE,
    'status':'PASS' if failed==0 else 'FAIL',
    'acceptance_criterion':'Post-Science cleanup completed with no regression to production behavior, locale isolation, measurement/scoring contract, Scientific Base presentation, or routing.',
    'checks_total':len(checks),
    'checks_passed':passed,
    'checks_failed':failed,
    'removed_operational_files':len(REMOVED),
    'protected_production_files':len(PROTECTED),
    'checks':checks,
}
OUT_JSON.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')

md=[
    '# P120 Web Runtime Reconciliation — PASS 4',
    '## Post-Cleanup Regression Gate',
    '',
    '**Document code:** P120-WEB-RUNTIME-PASS4-REGRESSION-001  ',
    '**Version:** 1.0  ',
    '**Date:** 2026-09-02  ',
    f"**Status:** {result['status']}  ",
    f"**Baseline:** `{BASELINE}`  ",
    f"**Checks:** {passed}/{len(checks)}  ",
    f"**Removed obsolete operational files:** {len(REMOVED)}  ",
    f"**Protected production files:** {len(PROTECTED)}",
    '',
    '### Acceptance criterion',
    '',
    f"> {result['acceptance_criterion']}",
    '',
    '### Regression gates',
    '',
    f"- Independent 20-route / 40-render audit: `{'PASS' if site.get('summary',{}).get('pass') is True else 'FAIL'}`.",
    f"- PASS 3 locale/session + measurement/scoring regression: `{p3.get('status','MISSING')}`.",
    f"- Scientific Base production regression: `{science.get('status','MISSING')}` — {science.get('checks_passed','?')}/{science.get('checks_total','?')}.",
    f"- Production asset byte identity vs pre-cleanup baseline: `{'PASS' if all(c['pass'] for c in checks if c['id'].startswith('protected ')) else 'FAIL'}`.",
    f"- Obsolete debris absence: `{'PASS' if all(c['pass'] for c in checks if c['id'].startswith('obsolete debris')) else 'FAIL'}`.",
    '',
    '### Gate decision',
    '',
    'PASS 4 cleanup is technically acceptable on this branch only if this regression record is PASS. Production closure still requires controlled merge, post-merge regression on actual main, and deployment verification.',
]
OUT_MD.write_text('\n'.join(md)+'\n',encoding='utf-8')
print(json.dumps({k:result[k] for k in ('status','checks_total','checks_passed','checks_failed','removed_operational_files','protected_production_files')},indent=2))
if failed:
    for c in checks:
        if not c['pass']: print('FAIL',c)
    raise SystemExit(1)
