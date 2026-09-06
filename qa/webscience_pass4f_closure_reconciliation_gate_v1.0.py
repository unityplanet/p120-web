from pathlib import Path
import json, hashlib, subprocess, sys

ROOT=Path('.')
OUT=ROOT/'qa-evidence-webscience-pass4f'
OUT.mkdir(parents=True, exist_ok=True)
DATE='2026-09-06'
VERSION='v1.0'
PASS4E_CLOSURE='cd71bf494f72090e0a81cfd3702fd6049ab89bb0'

checks=[]
failures=[]
def check(cid, ok, detail=None):
    row={'id':cid,'pass':bool(ok)}
    if detail is not None: row['detail']=detail
    checks.append(row)
    if not ok: failures.append(row)
    return bool(ok)

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def load(path):
    return json.loads(Path(path).read_text())

def git(*args):
    return subprocess.run(['git',*args],cwd=ROOT,text=True,capture_output=True)

stages=[
  {
    'id':'PASS4A','manifest':'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4A_MANIFEST_v0.5.json',
    'summary':'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4A_QA_SUMMARY_v0.5.json',
    'status':'PASS4A_CLOSED_CONTROLLED','baseline':'5295b50d1082e83e6e4e36f26286cdc2ccaca841',
    'qa':{'checks_total':2970,'checks_passed':2970,'checks_failed':0},
    'next':'PASS 4B — Renderer Activation'
  },
  {
    'id':'PASS4B','manifest':'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4B_MANIFEST_v0.6.json',
    'summary':'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4B_QA_SUMMARY_v0.6.json',
    'status':'PASS4B_CLOSED_CONTROLLED','baseline':'2759e288fec90064858fb99b137c07e6505f6257',
    'qa':{'checks_total':198,'checks_passed':198,'checks_failed':0},
    'next':'PASS 4C — Core-45 / Global-70 Library Integration'
  },
  {
    'id':'PASS4C','manifest':'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4C_MANIFEST_v0.7.json',
    'summary':'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4C_QA_SUMMARY_v0.7.json',
    'status':'PASS4C_CLOSED_CONTROLLED','baseline':'9d07a3a047ce4b9a61b6f307e3f791fcdfabaff4',
    'qa':{'checks_total':88,'checks_passed':88,'checks_failed':0},
    'next':'PASS 4D — Claim-Boundary & RU/EN Parity QA'
  },
  {
    'id':'PASS4D','manifest':'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4D_MANIFEST_v0.8.json',
    'summary':'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4D_QA_SUMMARY_v0.8.json',
    'status':'PASS4D_CLOSED_CONTROLLED','baseline':'211c0f4f0d2601c46bc2d4d283ade84aee474c47',
    'qa':{'static_checks_total':448,'static_checks_passed':448,'static_checks_failed':0,
          'browser_checks_total':448,'browser_checks_passed':448,'browser_checks_failed':0},
    'next':'PASS 4E — Browser / Responsive / Typography Science QA'
  },
  {
    'id':'PASS4E','manifest':'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4E_MANIFEST_v0.9.json',
    'summary':'webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4E_QA_SUMMARY_v0.9.json',
    'status':'PASS4E_CLOSED_CONTROLLED','baseline':'89683b678b76dde7df1cdeccc05d6e8541573b5b',
    'qa':{'browser_typography_checks_total':952,'browser_typography_checks_passed':952,'browser_typography_checks_failed':0},
    'next':'PASS 4F — Closure Reconciliation'
  }
]

for s in stages:
    mp=Path(s['manifest']); qp=Path(s['summary'])
    check(f"{s['id']}: manifest present",mp.exists(),str(mp))
    check(f"{s['id']}: QA summary present",qp.exists(),str(qp))
    if not mp.exists() or not qp.exists():
        continue
    m=load(mp); q=load(qp)
    check(f"{s['id']}: manifest status",m.get('status')==s['status'],{'actual':m.get('status'),'expected':s['status']})
    check(f"{s['id']}: baseline authority",m.get('baseline_commit')==s['baseline'],{'actual':m.get('baseline_commit'),'expected':s['baseline']})
    check(f"{s['id']}: production main not mutated",m.get('production_main_mutated') is False,{'actual':m.get('production_main_mutated')})
    if 'production_merge' in m:
        check(f"{s['id']}: production merge not performed",m.get('production_merge')=='NOT_PERFORMED',m.get('production_merge'))
    else:
        check(f"{s['id']}: production activation not production",m.get('production_activation')=='NOT_ACTIVATED',m.get('production_activation'))
    check(f"{s['id']}: QA status",q.get('status')=='PASS',q.get('status'))
    for key,val in s['qa'].items():
        check(f"{s['id']}: QA {key}",q.get(key)==val,{'actual':q.get(key),'expected':val})
    check(f"{s['id']}: next-gate chain",m.get('next_gate')==s['next'],{'actual':m.get('next_gate'),'expected':s['next']})

# Commit ancestry: historical subpasses must form one forward authority line.
lineage=[
 ('2759e288fec90064858fb99b137c07e6505f6257','9d07a3a047ce4b9a61b6f307e3f791fcdfabaff4','PASS4A post-package → PASS4B closure'),
 ('9d07a3a047ce4b9a61b6f307e3f791fcdfabaff4','211c0f4f0d2601c46bc2d4d283ade84aee474c47','PASS4B → PASS4C'),
 ('211c0f4f0d2601c46bc2d4d283ade84aee474c47','89683b678b76dde7df1cdeccc05d6e8541573b5b','PASS4C → PASS4D'),
 ('89683b678b76dde7df1cdeccc05d6e8541573b5b',PASS4E_CLOSURE,'PASS4D → PASS4E')
]
for a,b,label in lineage:
    r=git('merge-base','--is-ancestor',a,b)
    check(f"lineage: {label}",r.returncode==0,{'base':a,'head':b,'stderr':r.stderr.strip()})

# PASS 4F must not mutate any scientific/runtime/presentation authority inherited from final PASS 4E.
protected=[
 'science/index.html','en/science/index.html','p120-scientific-base-runtime-v1.0.js',
 'p120-webscience-pass4b-renderer-v0.6.js','p120-webscience-pass4c-library-v0.7.js',
 'p120-webscience-pass4e-visual-v0.9.css',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json',
 'P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json',
 'p120-session-contract-v1.0.js','p120-submission-intake-v1.0.js','manual-report-handoff-v1.0.js'
]
r=git('diff','--quiet',PASS4E_CLOSURE,'HEAD','--',*protected)
check('PASS4F: protected PASS4E authority unchanged',r.returncode==0,{'protected_count':len(protected)})

# Current final-state authorities: hashes are current-state hashes, not historical pass-local hashes.
current_authority={
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json':'2621ae1317b0161f3c3a819f79b2b874dfd9ba6e0c32e2d7ecb580841114758d',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json':'a32623e1b058d3658ae0f3afbb1e6fdc4b3503a6132634ecc1868b6e335d146a',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json':'af1fede5aeb36f2e4dc11fb55ad0f31fe5a74e2bd59fa9a0bb1aa7d405e8bdf8',
 'p120-webscience-pass4b-renderer-v0.6.js':'3a97e8838c73c56913b2cda03a5ea12afc579b1b085440b946ef800f2adbcc7b',
 'p120-webscience-pass4c-library-v0.7.js':'c8dd6b1c88706a2bb0c879099f5db0f87b2401b11fb5ca493037480781833425',
 'p120-webscience-pass4e-visual-v0.9.css':'d2fac104c534f0ea90e77d207887557afa8abd2ce246ac4f85c7f8ddbad48aeb'
}
for p,expected in current_authority.items():
    exists=Path(p).exists(); check(f'current authority present: {p}',exists)
    if exists:
        actual=sha(p); check(f'current authority hash: {p}',actual==expected,{'actual':actual,'expected':expected})

# Historical-manifest integrity: unchanged artifacts must still equal their pass-local hash;
# only explicitly superseded runtime files may differ in the final state.
authorized_supersession={
 ('PASS4B','p120-webscience-pass4b-renderer-v0.6.js'):'3a97e8838c73c56913b2cda03a5ea12afc579b1b085440b946ef800f2adbcc7b',
 ('PASS4C','p120-webscience-pass4c-library-v0.7.js'):'c8dd6b1c88706a2bb0c879099f5db0f87b2401b11fb5ca493037480781833425'
}
historical_rows=[]
for s in stages:
    if not Path(s['manifest']).exists(): continue
    m=load(s['manifest'])
    for f in m.get('files',[]):
        p=f.get('path'); historical=f.get('sha256'); pp=Path(p)
        if not pp.exists():
            check(f"{s['id']}: historical artifact present {p}",False)
            historical_rows.append({'stage':s['id'],'path':p,'state':'MISSING','historical_sha256':historical})
            continue
        current=sha(pp)
        if current==historical:
            state='UNCHANGED_CURRENT'
            ok=True
        elif (s['id'],p) in authorized_supersession and current==authorized_supersession[(s['id'],p)]:
            state='AUTHORIZED_SUPERSESSION'
            ok=True
        else:
            state='UNRECONCILED_DRIFT'
            ok=False
        check(f"{s['id']}: historical hash disposition {p}",ok,{'state':state,'historical':historical,'current':current})
        historical_rows.append({'stage':s['id'],'path':p,'state':state,'historical_sha256':historical,'current_sha256':current})

# Reconcile final public ceiling from sealed decisions without upgrading claims.
ceiling={
 'evidence_ladder':['E0','E1','E2','E3','E4'],
 'E1_is_empirical_psychometric_validation':False,
 'core_reference_count':45,
 'extension_reference_count':25,
 'global_reference_count':70,
 'reference_count_is_validity_metric':False,
 'public_modules':['COM-12','MOT-12','SELF-12','RPE-MOD','LIFE-12/18'],
 'module_publication_mode':'summary_only',
 'RPE_detailed_publication':'SUPPRESSED',
 'DYADIC':'HIDDEN',
 'extended_super_score_authorized':False,
 'validated_cross_layer_synergy_authorized':False,
 'empirical_cross_layer_discriminant_validity':'NOT_ESTABLISHED',
 'empirical_incremental_validity':'NOT_ESTABLISHED',
 'causal_effects_authorized':False,
 'next_gate':'PASS 4G — Mandatory Full PASS Package / Final PASS 4 Sealing'
}

result={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4F-RECONCILIATION-QA',
 'version':VERSION,'date':DATE,'status':'PASS' if not failures else 'FAIL',
 'scope':'CLOSURE_RECONCILIATION_ONLY','pass4e_authority':PASS4E_CLOSURE,
 'checks_total':len(checks),'checks_passed':len(checks)-len(failures),'checks_failed':len(failures),
 'checks':checks,'failures':failures,'historical_hash_disposition':historical_rows,
 'current_public_ceiling':ceiling,
 'scientific_content_mutated':False,'measurement_mutated':False,'scoring_mutated':False,
 'thresholds_mutated':False,'renderer_mutated':False,'presentation_mutated':False,
 'production_merge':'NOT_PERFORMED','parent_pass4_status':'OPEN_PENDING_PASS4G'
}
(OUT/'P120_WEBSCI_EXT_PASS4_PASS4F_RECONCILIATION_QA_RESULT_v1.0.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checks_total':result['checks_total'],'checks_failed':result['checks_failed']},indent=2))
if failures:
    sys.exit(1)
