from pathlib import Path
import hashlib, json, subprocess, sys

ROOT=Path('.')
OUT=ROOT/'qa-evidence-webscience-prod-g1-baseline-reconcile'
OUT.mkdir(parents=True,exist_ok=True)
LEGACY='6ef15f83ab1d7db132151b0d2216ba788f65ec71'
SEALED='d095cae40b33da2118e5090be2a2c837205d8b64'
ACTIVATED='2c1f6ad9844d948c0e16e2f016ce8eeba339ef02'
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
def current_bytes(path): return Path(path).read_bytes()

legacy_locked=[
 'science/index.html','en/science/index.html','language-switch-v1.0.js',
 'P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json'
]
for p in legacy_locked:
    old=git_bytes(LEGACY,p); cur=current_bytes(p) if Path(p).exists() else None
    ck(f'legacy authority retrievable: {p}',old is not None)
    ck(f'legacy authority remains exact: {p}',old is not None and cur==old,
       {'legacy_sha256':sha(old) if old else None,'current_sha256':sha(cur) if cur else None})

runtime='p120-scientific-base-runtime-v1.0.js'
old=git_bytes(LEGACY,runtime); sealed=git_bytes(SEALED,runtime); activated=git_bytes(ACTIVATED,runtime); cur=current_bytes(runtime)
for label,b in [('legacy',old),('sealed',sealed),('activated',activated)]: ck(f'{label} runtime retrievable',b is not None)
ck('current runtime exact sealed PASS4 authority',sealed is not None and cur==sealed,
   {'current_sha256':sha(cur),'sealed_sha256':sha(sealed) if sealed else None})
ck('activation merge runtime exact sealed authority',sealed is not None and activated==sealed,
   {'activation_sha256':sha(activated) if activated else None,'sealed_sha256':sha(sealed) if sealed else None})

# The only authorized baseline evolution is an additive PASS 4B loader after the
# previously accepted Core runtime. No bytes inside the legacy Core are changed.
old_core=old.rstrip(b'\n') if old else b''
expected_marker='\n\n/* WEB-SCIENCE EXT PASS 4B — controlled publication-renderer loader.'.encode('utf-8')
ck('sealed runtime preserves complete legacy Core prefix',bool(old_core) and sealed is not None and sealed.startswith(old_core+expected_marker))
if sealed is not None and old_core:
    suffix=sealed[len(old_core):]
    ck('authorized suffix identifies PASS4B controlled loader',b'WEB-SCIENCE EXT PASS 4B' in suffix)
    ck('authorized suffix loads PASS4B renderer',b'p120-webscience-pass4b-renderer-v0.6.js?v=websci4b06' in suffix)
    ck('authorized suffix is Science-route scoped',b'data-p120-webscience-pass4b-loader' in suffix and b'const dedicated=' in suffix)
    ck('authorized suffix does not contain storage/session tokens',not any(t in suffix for t in (b'localStorage',b'sessionStorage',b'P120_SESSION_KEY')))
    ck('runtime delta size is bounded',len(suffix)<2000,{'suffix_bytes':len(suffix)})

text=cur.decode('utf-8')
for token in ('localStorage','sessionStorage','P120_SESSION_KEY'):
    ck(f'current runtime prohibited token absent: {token}',token not in text)
for token in ('reconcileLanguageSwitch','canonical-single-owner',"tools.querySelector('.p120-language-switch')"):
    ck(f'legacy language reconciliation contract retained: {token}',token in text)
for token in ('data-p120-webscience-pass4b-loader','p120-webscience-pass4b-renderer-v0.6.js?v=websci4b06'):
    ck(f'PASS4B loader contract present: {token}',token in text)

registry=json.loads(Path('P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json').read_text())
ck('registry schema unchanged',registry.get('schema_id')=='P120-WEBSCI-PRODUCTION-001')
ck('measurement mutation remains prohibited',registry.get('measurement_mutation_allowed') is False)
ck('scoring mutation remains prohibited',registry.get('scoring_mutation_allowed') is False)
ck('session storage remains prohibited',registry.get('session_storage_access')=='PROHIBITED')
dyadic=next((b for b in registry.get('bases',[]) if b.get('base_id')=='DYADIC'),None)
ck('DYADIC remains hidden',bool(dyadic) and dyadic.get('public_visibility')=='hidden')
ck('module totals remain prohibited',all(m.get('is_total_allowed') is False for m in registry.get('modules',[])))

manifest=json.loads(Path('webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json').read_text())
ck('sealed PASS4 authority status retained',manifest.get('status')=='WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED')
ck('sealed PASS4 unresolved deltas remain zero',manifest.get('unresolved_delta_count')==0)
ck('sealed PASS4 public ceiling unchanged',manifest.get('public_ceiling_unchanged') is True)

result={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-SCIENTIFIC-BASE-BASELINE-RECONCILIATION-QA',
 'version':'v1.0','date':DATE,'status':'PASS' if not failures else 'FAIL',
 'legacy_scientific_base_baseline':LEGACY,'sealed_pass4_authority':SEALED,'activation_merge':ACTIVATED,
 'baseline_disposition':{
   'science/index.html':'LEGACY_BASELINE_RETAINED',
   'en/science/index.html':'LEGACY_BASELINE_RETAINED',
   'language-switch-v1.0.js':'LEGACY_BASELINE_RETAINED',
   'P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json':'LEGACY_BASELINE_RETAINED',
   runtime:'SUPERSEDED_BY_EXACT_SEALED_PASS4_RUNTIME_WITH_LEGACY_CORE_PREFIX_PRESERVED'
 },
 'runtime_sha256':{
   'legacy':sha(old) if old else None,'sealed':sha(sealed) if sealed else None,
   'activation':sha(activated) if activated else None,'current':sha(cur)
 },
 'checks_total':len(checks),'checks_passed':len(checks)-len(failures),'checks_failed':len(failures),
 'checks':checks,'failures':failures,
 'scientific_content_upgrade':False,'measurement_mutation':False,'scoring_mutation':False,
 'threshold_mutation':False,'session_access_mutation':False,
 'decision':'BASELINE_RECONCILIATION_AUTHORIZED_ONLY_IF_ALL_CHECKS_PASS'
}
(OUT/'P120_WEBSCI_PROD_G1_SCIENTIFIC_BASE_BASELINE_RECONCILIATION_QA_v1.0.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checks_total':result['checks_total'],'checks_failed':result['checks_failed'],'runtime_sha256':result['runtime_sha256']},indent=2))
if failures: sys.exit(1)
