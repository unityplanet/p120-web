from pathlib import Path
import hashlib, json, os, subprocess, sys

ROOT=Path('.')
OUT=ROOT/'qa-evidence-webscience-prod-g1'
OUT.mkdir(parents=True,exist_ok=True)
SEALED='d095cae40b33da2118e5090be2a2c837205d8b64'
EXPECTED_MAIN='194bdf274f1a6012ef6c2e4b4f31e5f44b472055'
DATE='2026-09-06'
checks=[]; failures=[]

def run(*args,check=False):
    return subprocess.run(list(args),cwd=ROOT,text=True,capture_output=True,check=check)

def ck(cid,ok,detail=None):
    row={'id':cid,'pass':bool(ok)}
    if detail is not None: row['detail']=detail
    checks.append(row)
    if not ok: failures.append(row)
    return bool(ok)

def sha_bytes(b): return hashlib.sha256(b).hexdigest()
def sha_file(p): return sha_bytes(Path(p).read_bytes())
def git_bytes(ref,path):
    r=subprocess.run(['git','show',f'{ref}:{path}'],cwd=ROOT,capture_output=True)
    if r.returncode: return None
    return r.stdout

def changed_paths():
    r=run('git','diff','--cached','--name-only','origin/main')
    if r.returncode: return []
    return [x.strip() for x in r.stdout.splitlines() if x.strip()]

main_actual=run('git','rev-parse','origin/main').stdout.strip()
ck('main baseline exact',main_actual==EXPECTED_MAIN,{'actual':main_actual,'expected':EXPECTED_MAIN})
ck('sealed authority object exists',run('git','cat-file','-e',f'{SEALED}^{{commit}}').returncode==0,SEALED)

paths=changed_paths()
ck('candidate has controlled delta',len(paths)>0,{'changed_count':len(paths)})

def allowed(p):
    if p.startswith('webscience/pass4/'): return True
    if p.startswith('qa/webscience_'): return True
    if p.startswith('.github/scripts/p120_webscience_'): return True
    if p.startswith('.github/workflows/p120-webscience-'): return True
    if p in {'p120-scientific-base-runtime-v1.0.js','p120-webscience-pass4b-renderer-v0.6.js','p120-webscience-pass4c-library-v0.7.js','p120-webscience-pass4e-visual-v0.9.css','science/index.html','en/science/index.html'}: return True
    return False

unauthorized=[p for p in paths if not allowed(p)]
ck('changed paths constrained to Science/control allowlist',not unauthorized,{'unauthorized':unauthorized,'changed_count':len(paths)})

for forbidden in [
 'p120-session-contract-v1.0.js','p120-submission-intake-v1.0.js','manual-report-handoff-v1.0.js',
 'test/index.html','en/test/index.html','index.html','en/index.html'
]:
    ck(f'forbidden production surface untouched: {forbidden}',forbidden not in paths)

# Exact sealed Science authority bytes must survive the main+Science candidate merge.
protected=[
 'science/index.html','en/science/index.html','p120-scientific-base-runtime-v1.0.js',
 'p120-webscience-pass4b-renderer-v0.6.js','p120-webscience-pass4c-library-v0.7.js','p120-webscience-pass4e-visual-v0.9.css',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_STATUS_RECORD_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_REPRODUCIBILITY_RECORD_v1.1.json'
]
for p in protected:
    sealed=git_bytes(SEALED,p)
    exists=Path(p).exists()
    ck(f'protected authority present: {p}',exists)
    if exists and sealed is not None:
        actual=sha_file(p); expected=sha_bytes(sealed)
        ck(f'protected authority exact: {p}',actual==expected,{'actual':actual,'expected':expected})
    else:
        ck(f'protected authority source retrievable: {p}',False)

expected_hashes={
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json':'2621ae1317b0161f3c3a819f79b2b874dfd9ba6e0c32e2d7ecb580841114758d',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json':'a32623e1b058d3658ae0f3afbb1e6fdc4b3503a6132634ecc1868b6e335d146a',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json':'af1fede5aeb36f2e4dc11fb55ad0f31fe5a74e2bd59fa9a0bb1aa7d405e8bdf8',
 'p120-webscience-pass4b-renderer-v0.6.js':'3a97e8838c73c56913b2cda03a5ea12afc579b1b085440b946ef800f2adbcc7b',
 'p120-webscience-pass4c-library-v0.7.js':'c8dd6b1c88706a2bb0c879099f5db0f87b2401b11fb5ca493037480781833425',
 'p120-webscience-pass4e-visual-v0.9.css':'d2fac104c534f0ea90e77d207887557afa8abd2ce246ac4f85c7f8ddbad48aeb'
}
for p,h in expected_hashes.items():
    ck(f'final sealed hash: {p}',Path(p).exists() and sha_file(p)==h,{'expected':h,'actual':sha_file(p) if Path(p).exists() else None})

manifest=Path('webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json')
if manifest.exists():
    m=json.loads(manifest.read_text())
    ck('sealed parent status',m.get('status')=='WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED',m.get('status'))
    ck('sealed unresolved deltas zero',m.get('unresolved_delta_count')==0,m.get('unresolved_delta_count'))
    ck('sealed public ceiling unchanged',m.get('public_ceiling_unchanged') is True,m.get('public_ceiling_unchanged'))
    c=m.get('global_library_contract',{})
    ck('Global70 contract 45+25=70',c.get('core')==45 and c.get('extension')==25 and c.get('global')==70,c)
else:
    ck('final manifest present',False)

# Explicitly verify that current-main high-risk non-Science surfaces remain byte-identical.
main_preserve=['index.html','en/index.html','p120-session-contract-v1.0.js','p120-submission-intake-v1.0.js','manual-report-handoff-v1.0.js']
for p in main_preserve:
    b=git_bytes('origin/main',p)
    if b is None:
        ck(f'main preserve source available or absent consistently: {p}',not Path(p).exists())
    else:
        ck(f'main preserve exact: {p}',Path(p).exists() and sha_file(p)==sha_bytes(b),{'candidate':sha_file(p) if Path(p).exists() else None,'main':sha_bytes(b)})

result={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-PREMERGE-CANDIDATE-QA','version':'v1.0','date':DATE,
 'gate':'WEB-SCIENCE PRODUCTION ACTIVATION GATE 1','status':'PASS' if not failures else 'FAIL',
 'sealed_authority':SEALED,'production_main_baseline_expected':EXPECTED_MAIN,'production_main_baseline_actual':main_actual,
 'changed_paths_count':len(paths),'changed_paths':paths,'checks_total':len(checks),'checks_passed':len(checks)-len(failures),'checks_failed':len(failures),
 'checks':checks,'failures':failures,
 'measurement_mutation_authorized':False,'scoring_mutation_authorized':False,'threshold_mutation_authorized':False,
 'respondent_session_mutation_authorized':False,'report_calculation_mutation_authorized':False,
 'candidate_disposition':'PREMERGE_ONLY','production_merge_performed':False
}
(OUT/'P120_WEBSCI_PROD_G1_PREMERGE_CANDIDATE_QA_v1.0.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checks_total':result['checks_total'],'checks_failed':result['checks_failed'],'changed_paths_count':len(paths)},indent=2))
if failures: sys.exit(1)
