from pathlib import Path
import hashlib, json, subprocess, sys

ROOT=Path('.')
OUT=ROOT/'qa-evidence-webscience-prod-g1-deployment-path-reconcile'
OUT.mkdir(parents=True,exist_ok=True)
PATH_BASE='f46b7335e47d75672424136979f91a1a3997aa37'
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

# Preserve the original PASS 4A deployment-path authority as a single-token delta.
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
    base=git_bytes(PATH_BASE,path)
    cur=current_bytes(path)
    ck(f'PASS4A path baseline retrievable: {path}',base is not None)
    ck(f'production Science page present: {path}',cur is not None)
    if base is not None and cur is not None:
        current=cur.decode('utf-8'); baseline=base.decode('utf-8')
        ck(f'corrected path occurs exactly once: {path}',current.count(new)==1,{'count':current.count(new)})
        normalized=current.replace(new,old,1)
        ck(f'page differs from PASS4A baseline only by authorized path token: {path}',normalized==baseline)
        ck(f'extended-research-set count retained: {path}',current.count('id="extended-research-set"')==baseline.count('id="extended-research-set"'),{
            'current':current.count('id="extended-research-set"'),'baseline':baseline.count('id="extended-research-set"')})

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

# Sealed Science public ceiling remains authoritative.
manifest_path='webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json'
manifest=json.loads(Path(manifest_path).read_text())
ck('sealed PASS4 final status retained',manifest.get('status')=='WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED',manifest.get('status'))
ck('sealed PASS4 unresolved deltas remain zero',manifest.get('unresolved_delta_count')==0,manifest.get('unresolved_delta_count'))
ck('sealed PASS4 public ceiling unchanged',manifest.get('public_ceiling_unchanged') is True)
contract=manifest.get('global_library_contract',{})
ck('Global70 contract retained',contract.get('core')==45 and contract.get('extension')==25 and contract.get('global')==70,contract)

# Deployment-path reconciliation is not a scientific or respondent-runtime change.
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
    'pre_activation_main':PRE_ACTIVATION_MAIN,
    'sealed_pass4_authority':SEALED,
    'checks_total':len(checks),'checks_passed':len(checks)-len(failures),'checks_failed':len(failures),
    'checks':checks,'failures':failures,
    'historical_scope_guard_disposition':'SUPERSEDED_FOR_FUTURE_MAIN_BY_INVARIANT_BASED_PRODUCTION_RECONCILIATION; ORIGINAL_SINGLE_TOKEN_PATH_AUTHORITY_PRESERVED',
    'scientific_status_upgrade':False,'measurement_mutation':False,'scoring_mutation':False,
    'threshold_mutation':False,'respondent_session_mutation':False,'report_calculation_mutation':False
}
(OUT/'P120_WEBSCI_PROD_G1_DEPLOYMENT_PATH_BASELINE_RECONCILIATION_QA_v1.0.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checks_total':result['checks_total'],'checks_failed':result['checks_failed']},indent=2))
if failures: sys.exit(1)
