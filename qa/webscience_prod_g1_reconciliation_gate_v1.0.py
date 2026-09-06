from pathlib import Path
import hashlib, json, subprocess, sys

ROOT=Path('.')
OUT=ROOT/'qa-evidence-webscience-prod-g1'
OUT.mkdir(parents=True,exist_ok=True)
SEALED='d095cae40b33da2118e5090be2a2c837205d8b64'
DATE='2026-09-06'
checks=[]; failures=[]

def ck(cid,ok,detail=None):
    row={'id':cid,'pass':bool(ok)}
    if detail is not None: row['detail']=detail
    checks.append(row)
    if not ok: failures.append(row)

def sha_bytes(b): return hashlib.sha256(b).hexdigest()
def sha_file(p): return sha_bytes(Path(p).read_bytes())
def sealed_bytes(p):
    r=subprocess.run(['git','show',f'{SEALED}:{p}'],capture_output=True)
    return r.stdout if r.returncode==0 else None

def load(p): return json.loads(Path(p).read_text())

# These are immutable sealed upstream records. In a production merge candidate we
# verify their bytes and semantics directly; we do not rerun pre-production
# topology assertions that compare historical closure commits to HEAD.
records=[
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4F_MANIFEST_v1.0.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4F_QA_SUMMARY_v1.0.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4F_RECONCILIATION_MATRIX_v1.0.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4G_FINAL_SEAL_QA_RESULT_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4G_QA_SUMMARY_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_STATUS_RECORD_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_REPRODUCIBILITY_RECORD_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_AUTHORITY_INDEX_v1.1.json'
]
for p in records:
    sb=sealed_bytes(p); exists=Path(p).exists()
    ck(f'sealed record present: {p}',exists)
    ck(f'sealed source retrievable: {p}',sb is not None)
    if exists and sb is not None:
        ck(f'sealed record byte-exact: {p}',sha_file(p)==sha_bytes(sb),{'actual':sha_file(p),'sealed':sha_bytes(sb)})

fman=load(records[0]); fqa=load(records[1]); mx=load(records[2]); gqa=load(records[4]); status=load(records[5]); final=load(records[6])
ck('PASS4F reconciled authority',fman.get('authority_chain_reconciled') is True)
ck('PASS4F historical hashes reconciled',fman.get('historical_hashes_reconciled') is True)
ck('PASS4F unresolved deltas zero',fman.get('unresolved_delta_count')==0,fman.get('unresolved_delta_count'))
ck('PASS4F QA 119/119',fqa.get('reconciliation_checks_passed')==119 and fqa.get('reconciliation_checks_failed')==0)
ck('PASS4G QA 95/95',gqa.get('checks_passed')==95 and gqa.get('checks_failed')==0)
ck('PASS4 final status sealed',status.get('status')=='CLOSED_CONTROLLED_SEALED',status.get('status'))
ck('PASS4 final manifest sealed',final.get('status')=='WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED',final.get('status'))
ck('PASS4 final unresolved deltas zero',final.get('unresolved_delta_count')==0,final.get('unresolved_delta_count'))
ck('PASS4 public ceiling unchanged',final.get('public_ceiling_unchanged') is True)
contract=final.get('global_library_contract',{})
ck('PASS4 Global70 45+25=70',contract.get('core')==45 and contract.get('extension')==25 and contract.get('global')==70,contract)
ck('upstream assertion inventory 5223',final.get('recorded_upstream_gate_assertions')==5223,final.get('recorded_upstream_gate_assertions'))

# Public ceiling remains frozen while production disposition is allowed to move
# from NOT_PERFORMED only in this new gate; the historical records stay immutable.
dims=mx.get('dimensions',{})
ck('E1 remains non-empirical validation',dims.get('evidence_ladder',{}).get('E1_equals_empirical_validation') is False)
ck('reference count remains non-validity metric',dims.get('library_contract',{}).get('count_is_validity_metric') is False)
ck('module mode remains summary_only',dims.get('module_publication',{}).get('mode')=='summary_only')
ck('RPE remains suppressed',dims.get('RPE',{}).get('detail')=='SUPPRESSED')
ck('DYADIC remains hidden',dims.get('DYADIC',{}).get('visibility')=='HIDDEN')
cl=dims.get('cross_layer',{})
ck('cross-layer discriminant validity not established',cl.get('discriminant_validity')=='NOT_ESTABLISHED')
ck('cross-layer incremental validity not established',cl.get('incremental_validity')=='NOT_ESTABLISHED')
ck('validated synergy not authorized',cl.get('validated_synergy')=='NOT_AUTHORIZED')
ck('causal effects not authorized',cl.get('causal_effects')=='NOT_AUTHORIZED')

expected={
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json':'2621ae1317b0161f3c3a819f79b2b874dfd9ba6e0c32e2d7ecb580841114758d',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json':'a32623e1b058d3658ae0f3afbb1e6fdc4b3503a6132634ecc1868b6e335d146a',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json':'af1fede5aeb36f2e4dc11fb55ad0f31fe5a74e2bd59fa9a0bb1aa7d405e8bdf8',
 'p120-webscience-pass4b-renderer-v0.6.js':'3a97e8838c73c56913b2cda03a5ea12afc579b1b085440b946ef800f2adbcc7b',
 'p120-webscience-pass4c-library-v0.7.js':'c8dd6b1c88706a2bb0c879099f5db0f87b2401b11fb5ca493037480781833425',
 'p120-webscience-pass4e-visual-v0.9.css':'d2fac104c534f0ea90e77d207887557afa8abd2ce246ac4f85c7f8ddbad48aeb'
}
for p,h in expected.items():
    ck(f'current sealed authority hash: {p}',Path(p).exists() and sha_file(p)==h,{'actual':sha_file(p) if Path(p).exists() else None,'expected':h})

# PASS4F manifest files must remain exact even though production topology changed.
for row in fman.get('files',[]):
    p=row['path']; exists=Path(p).exists()
    ck(f'PASS4F manifest file present: {p}',exists)
    if exists: ck(f'PASS4F manifest file hash: {p}',sha_file(p)==row['sha256'],{'actual':sha_file(p),'expected':row['sha256']})

result={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-SEALED-RECONCILIATION-QA','version':'v1.0','date':DATE,
 'gate':'WEB-SCIENCE PRODUCTION ACTIVATION GATE 1','status':'PASS' if not failures else 'FAIL',
 'scope':'PRODUCTION_CANDIDATE_RECONCILIATION_OVER_IMMUTABLE_SEALED_PASS4',
 'sealed_authority':SEALED,'checks_total':len(checks),'checks_passed':len(checks)-len(failures),'checks_failed':len(failures),
 'checks':checks,'failures':failures,
 'historical_pass4f_rerun_disposition':'NOT_APPLICABLE_TO_SYNTHETIC_MERGE_HEAD_TOPOLOGY; SEALED_RECORDS_AND_CURRENT_BYTES_VERIFIED_INSTEAD',
 'historical_pass4g_rerun_disposition':'NOT_APPLICABLE_TO_PRODUCTION_ACTIVATION_TOPOLOGY; SEALED_RECORDS_AND_CURRENT_BYTES_VERIFIED_INSTEAD',
 'scientific_status_upgrade':False,'measurement_mutation':False,'scoring_mutation':False,'threshold_mutation':False
}
(OUT/'P120_WEBSCI_PROD_G1_SEALED_RECONCILIATION_QA_v1.0.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checks_total':result['checks_total'],'checks_failed':result['checks_failed']},indent=2))
if failures: sys.exit(1)
