from pathlib import Path
import json, hashlib, subprocess, sys

ROOT=Path('.')
OUT=ROOT/'qa-evidence-webscience-pass4g'
OUT.mkdir(parents=True,exist_ok=True)
DATE='2026-09-06'
VERSION='v1.1'
PASS4F_CLOSURE='1155a78646a314e3693aa7b247e667b86507a1d4'

checks=[]; failures=[]
def check(cid,ok,detail=None):
    row={'id':cid,'pass':bool(ok)}
    if detail is not None: row['detail']=detail
    checks.append(row)
    if not ok: failures.append(row)
    return bool(ok)
def load(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def git(*args): return subprocess.run(['git',*args],text=True,capture_output=True)

# PASS 4G must be packaging/sealing only over exact PASS 4F closure authority.
protected=[
 'science/index.html','en/science/index.html','p120-scientific-base-runtime-v1.0.js',
 'p120-webscience-pass4b-renderer-v0.6.js','p120-webscience-pass4c-library-v0.7.js','p120-webscience-pass4e-visual-v0.9.css',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json',
 'P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json',
 'p120-session-contract-v1.0.js','p120-submission-intake-v1.0.js','manual-report-handoff-v1.0.js'
]
r=git('diff','--quiet',PASS4F_CLOSURE,'HEAD','--',*protected)
check('4G-001 protected PASS4F final authority unchanged',r.returncode==0,{'protected_count':len(protected)})
r=git('merge-base','--is-ancestor',PASS4F_CLOSURE,'HEAD')
check('4G-002 PASS4F closure is ancestor of PASS4G branch',r.returncode==0)

stages=[
 ('PASS4A','v0.5','P120_WEBSCI_EXT_PASS4_PASS4A_MANIFEST_v0.5.json','P120_WEBSCI_EXT_PASS4_PASS4A_QA_SUMMARY_v0.5.json','PASS4A_CLOSED_CONTROLLED',2970),
 ('PASS4B','v0.6','P120_WEBSCI_EXT_PASS4_PASS4B_MANIFEST_v0.6.json','P120_WEBSCI_EXT_PASS4_PASS4B_QA_SUMMARY_v0.6.json','PASS4B_CLOSED_CONTROLLED',198),
 ('PASS4C','v0.7','P120_WEBSCI_EXT_PASS4_PASS4C_MANIFEST_v0.7.json','P120_WEBSCI_EXT_PASS4_PASS4C_QA_SUMMARY_v0.7.json','PASS4C_CLOSED_CONTROLLED',88),
 ('PASS4D','v0.8','P120_WEBSCI_EXT_PASS4_PASS4D_MANIFEST_v0.8.json','P120_WEBSCI_EXT_PASS4_PASS4D_QA_SUMMARY_v0.8.json','PASS4D_CLOSED_CONTROLLED',896),
 ('PASS4E','v0.9','P120_WEBSCI_EXT_PASS4_PASS4E_MANIFEST_v0.9.json','P120_WEBSCI_EXT_PASS4_PASS4E_QA_SUMMARY_v0.9.json','PASS4E_CLOSED_CONTROLLED',952),
 ('PASS4F','v1.0','P120_WEBSCI_EXT_PASS4_PASS4F_MANIFEST_v1.0.json','P120_WEBSCI_EXT_PASS4_PASS4F_QA_SUMMARY_v1.0.json','PASS4F_CLOSED_CONTROLLED',119),
]
W=Path('webscience/pass4')
recorded_total=0
for sid,ver,mname,qname,status,expected_count in stages:
    mp=W/mname; qp=W/qname
    check(f'{sid} manifest present',mp.exists(),str(mp)); check(f'{sid} QA summary present',qp.exists(),str(qp))
    if not mp.exists() or not qp.exists(): continue
    m=load(mp); q=load(qp)
    check(f'{sid} manifest version',m.get('version')==ver,{'actual':m.get('version'),'expected':ver})
    check(f'{sid} manifest status',m.get('status')==status,{'actual':m.get('status'),'expected':status})
    check(f'{sid} QA status PASS',q.get('status')=='PASS',q.get('status'))
    check(f'{sid} production main not mutated',m.get('production_main_mutated') is False, m.get('production_main_mutated'))
    if 'production_merge' in m: check(f'{sid} production merge not performed',m.get('production_merge')=='NOT_PERFORMED',m.get('production_merge'))
    # Normalize heterogeneous QA cardinalities without treating the sum as a single statistical metric.
    if sid=='PASS4D': actual=(q.get('static_checks_passed',0)+q.get('browser_checks_passed',0)); failed=(q.get('static_checks_failed',0)+q.get('browser_checks_failed',0))
    elif sid=='PASS4E': actual=q.get('browser_typography_checks_passed',0); failed=q.get('browser_typography_checks_failed',0)
    elif sid=='PASS4F': actual=q.get('reconciliation_checks_passed',0); failed=q.get('reconciliation_checks_failed',0)
    else: actual=q.get('checks_passed',0); failed=q.get('checks_failed',0)
    check(f'{sid} recorded QA cardinality',actual==expected_count and failed==0,{'passed':actual,'expected':expected_count,'failed':failed})
    recorded_total += actual
check('4G recorded upstream gate assertions total',recorded_total==5223,{'recorded_total':recorded_total,'note':'heterogeneous gate assertions; aggregation is inventory only'})

# PASS 4F is the immediate reconciliation authority for final sealing.
fman=load(W/'P120_WEBSCI_EXT_PASS4_PASS4F_MANIFEST_v1.0.json')
fqa=load(W/'P120_WEBSCI_EXT_PASS4_PASS4F_QA_SUMMARY_v1.0.json')
check('PASS4F authority chain reconciled',fman.get('authority_chain_reconciled') is True)
check('PASS4F historical hashes reconciled',fman.get('historical_hashes_reconciled') is True)
check('PASS4F authorized supersession count exact',fman.get('authorized_supersession_count')==2,fman.get('authorized_supersession_count'))
check('PASS4F unresolved delta count zero',fman.get('unresolved_delta_count')==0,fman.get('unresolved_delta_count'))
check('PASS4F public ceiling unchanged',fman.get('public_ceiling_unchanged') is True)
check('PASS4F parent awaited PASS4G',fman.get('parent_pass4_status')=='OPEN_PENDING_PASS4G',fman.get('parent_pass4_status'))
check('PASS4F next gate is PASS4G',str(fman.get('next_gate','')).startswith('PASS 4G'))
check('PASS4F reconciliation QA 119/119',fqa.get('reconciliation_checks_passed')==119 and fqa.get('reconciliation_checks_failed')==0)

# Verify current final public/source contract directly.
publication=load(W/'P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json')
libproj=load(W/'P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json')
global70=load(W/'P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json')
check('publication projection frozen SHA',sha(W/'P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json')=='2621ae1317b0161f3c3a819f79b2b874dfd9ba6e0c32e2d7ecb580841114758d')
check('library projection frozen SHA',sha(W/'P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json')=='a32623e1b058d3658ae0f3afbb1e6fdc4b3503a6132634ecc1868b6e335d146a')
check('Global70 final SHA',sha(W/'P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json')=='af1fede5aeb36f2e4dc11fb55ad0f31fe5a74e2bd59fa9a0bb1aa7d405e8bdf8')
check('current PASS4B renderer SHA',sha('p120-webscience-pass4b-renderer-v0.6.js')=='3a97e8838c73c56913b2cda03a5ea12afc579b1b085440b946ef800f2adbcc7b')
check('current PASS4C library runtime SHA',sha('p120-webscience-pass4c-library-v0.7.js')=='c8dd6b1c88706a2bb0c879099f5db0f87b2401b11fb5ca493037480781833425')
check('current PASS4E visual SHA',sha('p120-webscience-pass4e-visual-v0.9.css')=='d2fac104c534f0ea90e77d207887557afa8abd2ce246ac4f85c7f8ddbad48aeb')

refs=global70.get('references',global70.get('items',[]))
check('Global70 reference inventory is 70',len(refs)==70,{'count':len(refs)})
ids=[x.get('reference_id') or x.get('id') for x in refs]
expected=[f'REF-{i:03d}' for i in range(1,71)]
check('Global70 IDs continuous REF-001..070',ids==expected,{'first':ids[:3],'last':ids[-3:]})
source_layers=[x.get('source_layer') for x in refs]
check('Global70 Core partition 45',source_layers.count('CORE45')==45,source_layers.count('CORE45'))
check('Global70 Extension partition 25',source_layers.count('PASS4_EXTENSION')==25,source_layers.count('PASS4_EXTENSION'))

# Public ceiling imported from reconciliation matrix is itself a sealing invariant.
mx=load(W/'P120_WEBSCI_EXT_PASS4_PASS4F_RECONCILIATION_MATRIX_v1.0.json')
dims=mx.get('dimensions',{})
check('E1 remains non-empirical-validation',dims.get('evidence_ladder',{}).get('E1_equals_empirical_validation') is False)
check('library contract remains 45/25/70',dims.get('library_contract',{}).get('core')==45 and dims.get('library_contract',{}).get('extension')==25 and dims.get('library_contract',{}).get('global')==70)
check('reference count remains non-validity metric',dims.get('library_contract',{}).get('count_is_validity_metric') is False)
check('module publication remains summary_only',dims.get('module_publication',{}).get('mode')=='summary_only')
check('RPE detail remains suppressed',dims.get('RPE',{}).get('detail')=='SUPPRESSED')
check('DYADIC remains hidden',dims.get('DYADIC',{}).get('visibility')=='HIDDEN')
cl=dims.get('cross_layer',{})
check('cross-layer discriminant validity not established',cl.get('discriminant_validity')=='NOT_ESTABLISHED')
check('cross-layer incremental validity not established',cl.get('incremental_validity')=='NOT_ESTABLISHED')
check('validated synergy not authorized',cl.get('validated_synergy')=='NOT_AUTHORIZED')
check('causal effects not authorized',cl.get('causal_effects')=='NOT_AUTHORIZED')
check('production renderer remains pre-production',dims.get('renderer',{}).get('production_merge')=='NOT_PERFORMED')

# Verify every PASS4F manifest-listed file remains exact before parent sealing.
for row in fman.get('files',[]):
    p=Path(row['path']); ok=p.exists(); check(f'PASS4F file present: {row["path"]}',ok)
    if ok: check(f'PASS4F file hash: {row["path"]}',sha(p)==row['sha256'],{'actual':sha(p),'expected':row['sha256']})

result={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4G-FINAL-SEAL-QA','version':VERSION,'date':DATE,
 'status':'PASS' if not failures else 'FAIL','scope':'MANDATORY_FULL_PASS_PACKAGE_AND_FINAL_PARENT_SEAL',
 'baseline_pass4f_closure':PASS4F_CLOSURE,
 'checks_total':len(checks),'checks_passed':len(checks)-len(failures),'checks_failed':len(failures),
 'recorded_upstream_gate_assertions':recorded_total,
 'checks':checks,'failures':failures,
 'scientific_content_mutated':False,'references_mutated':False,'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,'renderer_mutated':False,'presentation_mutated':False,
 'production_merge':'NOT_PERFORMED',
 'final_parent_status_if_sealed':'CLOSED_CONTROLLED_SEALED',
 'production_activation_disposition':'SEPARATE_CONTROLLED_GATE_REQUIRED'
}
(OUT/'P120_WEBSCI_EXT_PASS4_PASS4G_FINAL_SEAL_QA_RESULT_v1.1.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checks_total':result['checks_total'],'checks_failed':result['checks_failed'],'recorded_upstream_gate_assertions':recorded_total},indent=2))
if failures: sys.exit(1)
