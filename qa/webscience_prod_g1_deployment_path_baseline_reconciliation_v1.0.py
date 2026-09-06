from pathlib import Path
import hashlib, json, subprocess, sys

ROOT=Path('.')
OUT=ROOT/'qa-evidence-webscience-prod-g1-deployment-path-reconcile'
OUT.mkdir(parents=True,exist_ok=True)
PATH_BASE='f46b7335e47d75672424136979f91a1a3997aa37'
ACCEPTED_SCIENCE_BASE='6ef15f83ab1d7db132151b0d2216ba788f65ec71'
PRE_ACTIVATION_MAIN='194bdf274f1a6012ef6c2e4b4f31e5f44b472055'
SEALED='d095cae40b33da2118e5090be2a2c837205d8b64'
DATE='2026-09-06'
checks=[]; failures=[]

def ck(cid,ok,detail=None):
    row={'id':cid,'pass':bool(ok)}
    if detail is not None: row['detail']=detail
    checks.append(row)
    if not ok: failures.append(row)
    return bool(ok)

def git_bytes(ref,path):
    r=subprocess.run(['git','show',f'{ref}:{path}'],cwd=ROOT,capture_output=True)
    return r.stdout if r.returncode==0 else None

def sha(b): return hashlib.sha256(b).hexdigest()
def current_bytes(path): return Path(path).read_bytes() if Path(path).exists() else None

# Preserve the original PASS 4A path correction as an invariant across later
# authorized Science-page evolution. f46b733 proves the old broken token;
# 6ef15f is the later accepted complete Science-page authority with the fixed token.
specs=[
    (
        'science/index.html',
        '<script src="p120-scientific-base-runtime-v1.0.js?v=sbm10" data-p120-scientific-base-runtime="v1.0"></script>',
        '<script src="../p120-scientific-base-runtime-v1.0.js?v=sbm10" data-p120-scientific-base-runtime="v1.0"></script>',
    ),
    (
        'en/science/index.html',
        '<script src="../p120-en-science-localization-runtime-v1.0.js?v=ensci10" data-p120-en-science-localization="v1.0"></script>',
        '<script src="../../p120-en-science-localization-runtime-v1.0.js?v=ensci10" data-p120-en-science-localization="v1.0"></script>',
    ),
]
for path,new,old in specs:
    historical=git_bytes(PATH_BASE,path)
    accepted=git_bytes(ACCEPTED_SCIENCE_BASE,path)
    cur=current_bytes(path)
    ck(f'historical PASS4A baseline retrievable: {path}',historical is not None)
    ck(f'accepted Science baseline retrievable: {path}',accepted is not None)
    ck(f'production Science page present: {path}',cur is not None)
    if historical is not None:
        h=historical.decode('utf-8')
        ck(f'historical broken path occurs exactly once: {path}',h.count(old)==1,{'count':h.count(old)})
    if accepted is not None:
        a=accepted.decode('utf-8')
        ck(f'accepted baseline contains corrected path exactly once: {path}',a.count(new)==1,{'count':a.count(new)})
        ck(f'accepted baseline excludes historical broken path: {path}',a.count(old)==0,{'count':a.count(old)})
    if cur is not None:
        current=cur.decode('utf-8')
        ck(f'production contains corrected path exactly once: {path}',current.count(new)==1,{'count':current.count(new)})
        ck(f'production excludes historical broken path: {path}',current.count(old)==0,{'count':current.count(old)})
    ck(f'production page exact accepted Science baseline: {path}',cur is not None and accepted is not None and cur==accepted,{
        'current_sha256':sha(cur) if cur else None,'accepted_sha256':sha(accepted) if accepted else None})
    if cur is not None and accepted is not None:
        current=cur.decode('utf-8'); a=accepted.decode('utf-8')
        ck(f'extended-research-set count retained from accepted baseline: {path}',current.count('id="extended-research-set"')==a.count('id="extended-research-set"'),{
            'current':current.count('id="extended-research-set"'),'accepted':a.count('id="extended-research-set"')})

# Production activation must not have altered unrelated production surfaces.
pre_main_locked=[
    'index.html','en/index.html','system/index.html','en/system/index.html',
    'p120-session-contract-v1.0.js','p120-submission-intake-v1.0.js',
    'manual-report-handoff-v1.0.js','p120-en-science-localization-runtime-v1.0.js',
    'P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json'
]
for path in pre_main_locked:
    base=git_bytes(PRE_ACTIVATION_MAIN,path); cur=current_bytes(path)
    if base is None:
        ck(f'pre-activation absence preserved: {path}',cur is None)
    else:
        ck(f'pre-activation production surface exact: {path}',cur==base,{
            'current_sha256':sha(cur) if cur else None,'baseline_sha256':sha(base)})

# Scientific Base runtime is the one explicitly superseded production dependency.
runtime='p120-scientific-base-runtime-v1.0.js'
sealed=git_bytes(SEALED,runtime); cur=current_bytes(runtime)
ck('sealed Scientific Base runtime retrievable',sealed is not None)
ck('production Scientific Base runtime exact sealed PASS4 authority',sealed is not None and cur==sealed,{
    'current_sha256':sha(cur) if cur else None,'sealed_sha256':sha(sealed) if sealed else None})
ck('production Scientific Base runtime canonical SHA',cur is not None and sha(cur)=='d25a030b36adcfabd6015455b93ef322e9dab83e4c87cfa66251e487e1d6d9d1',{
    'actual':sha(cur) if cur else None})

manifest_path='webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json'
manifest=json.loads(Path(manifest_path).read_text())
ck('sealed PASS4 final status retained',manifest.get('status')=='WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED',manifest.get('status'))
ck('sealed PASS4 unresolved deltas remain zero',manifest.get('unresolved_delta_count')==0,manifest.get('unresolved_delta_count'))
ck('sealed PASS4 public ceiling unchanged',manifest.get('public_ceiling_unchanged') is True)
contract=manifest.get('global_library_contract',{})
ck('Global70 contract retained',contract.get('core')==45 and contract.get('extension')==25 and contract.get('global')==70,contract)

registry=json.loads(Path('P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json').read_text())
ck('measurement mutation prohibited',registry.get('measurement_mutation_allowed') is False)
ck('scoring mutation prohibited',registry.get('scoring_mutation_allowed') is False)
ck('session storage prohibited',registry.get('session_storage_access')=='PROHIBITED')

result={
    'standard':'P120',
    'document_id':'P120-WEBSCI-PROD-G1-DEPLOYMENT-PATH-BASELINE-RECONCILIATION-QA',
    'version':'v1.0','date':DATE,
    'status':'PASS' if not failures else 'FAIL',
    'gate':'WEB-SCIENCE PRODUCTION ACTIVATION GATE 1',
    'historical_path_baseline':PATH_BASE,
    'accepted_science_page_baseline':ACCEPTED_SCIENCE_BASE,
    'pre_activation_main':PRE_ACTIVATION_MAIN,
    'sealed_pass4_authority':SEALED,
    'checks_total':len(checks),'checks_passed':len(checks)-len(failures),'checks_failed':len(failures),
    'checks':checks,'failures':failures,
    'historical_scope_guard_disposition':'SUPERSEDED_FOR_FUTURE_MAIN_BY_INVARIANT_BASED_PRODUCTION_RECONCILIATION; ORIGINAL_PATH_CORRECTION_PRESERVED_AND_CURRENT_PAGES_BOUND_TO_LATER_ACCEPTED_AUTHORITY',
    'scientific_status_upgrade':False,'measurement_mutation':False,'scoring_mutation':False,
    'threshold_mutation':False,'respondent_session_mutation':False,'report_calculation_mutation':False
}
(OUT/'P120_WEBSCI_PROD_G1_DEPLOYMENT_PATH_BASELINE_RECONCILIATION_QA_v1.0.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checks_total':result['checks_total'],'checks_failed':result['checks_failed'],'failures':failures},ensure_ascii=False,indent=2))
if failures: sys.exit(1)
