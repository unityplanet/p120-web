from pathlib import Path
import hashlib, json, subprocess, sys

ACTIVATION='cf11a176bb0db87aec046d5694c302285b275f90'
SEALED='d095cae40b33da2118e5090be2a2c837205d8b64'
OLD_REG=Path('P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json')
NEW_REG=Path('P120_WEBSCI_PRODUCTION_registry_v1.1_2026-09-06.json')
OLD_REG_SHA='38b706b38f8f19f60c5917874b8371661340bb0cf30059fe9a7de98d16251f5e'
EVIDENCE=Path('webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_EVIDENCE_v1.1.json')
DELTA=Path('webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_EXACT_DELTA_v1.1.json')
SEAL_MANIFEST=Path('webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_SEAL_MANIFEST_v1.1.json')
PASS4_MANIFEST=Path('webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json')

protected=[
 OLD_REG, NEW_REG, Path('p120-scientific-base-runtime-v1.0.js'),
 Path('science/index.html'), Path('en/science/index.html'),
 PASS4_MANIFEST,
 Path('webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json'),
 Path('webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json')
]
allowed={
 'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_EVIDENCE_v1.1.json',
 'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_EXACT_DELTA_v1.1.json',
 'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_RECONCILIATION_v1.1.md',
 'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_FINAL_SEAL_MANIFEST_v1.1.json',
 'qa/webscience_prod_g1_registry_final_seal_gate_v1.1.py',
 '.github/scripts/p120_webscience_prod_g1_registry_final_closure.py',
 '.github/workflows/p120-webscience-prod-g1-registry-final-seal-v1.1.yml'
}

checks=[]; failures=[]
def ck(name, ok, detail=None):
    row={'name':name,'pass':bool(ok)}
    if detail is not None: row['detail']=detail
    checks.append(row)
    if not ok: failures.append(row)
def run(*args): return subprocess.run(list(args),text=True,capture_output=True)
def load(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

ck('registry activation is ancestor of HEAD',run('git','merge-base','--is-ancestor',ACTIVATION,'HEAD').returncode==0)
ck('sealed PASS4 authority is ancestor of HEAD',run('git','merge-base','--is-ancestor',SEALED,'HEAD').returncode==0)

for p in protected:
    ck(f'protected file exists / {p}',p.exists())
    if p.exists():
        ck(f'protected file unchanged from registry activation / {p}',run('git','diff','--quiet',ACTIVATION,'HEAD','--',str(p)).returncode==0)

ck('historical executable registry exact SHA',OLD_REG.exists() and sha(OLD_REG)==OLD_REG_SHA,sha(OLD_REG) if OLD_REG.exists() else None)

changed=[x for x in run('git','diff','--name-only',ACTIVATION,'HEAD').stdout.splitlines() if x]
ck('closure delta non-empty',len(changed)>0,changed)
for p in changed: ck(f'closure-only authorized delta / {p}',p in allowed,p)
ck('no missing mandatory closure source path',all(Path(p).exists() for p in allowed),[p for p in sorted(allowed) if not Path(p).exists()])

if EVIDENCE.exists():
    e=load(EVIDENCE)
    ck('evidence status complete',e.get('status')=='POSTMERGE_EVIDENCE_COMPLETE',e.get('status'))
    ck('evidence activation exact',e.get('registry_activation_head')==ACTIVATION,e.get('registry_activation_head'))
    ck('evidence sealed authority exact',e.get('sealed_science_authority')==SEALED,e.get('sealed_science_authority'))
    ck('evidence unresolved delta zero',e.get('unresolved_delta_count')==0,e.get('unresolved_delta_count'))
    pre=e.get('premerge',{})
    ck('premerge registry 62/62',pre.get('registry_qa')=={'checks_passed':62,'checks_failed':0},pre.get('registry_qa'))
    ck('premerge boundary 31/31',pre.get('prod_g1_boundary')=={'checks_passed':31,'checks_failed':0},pre.get('prod_g1_boundary'))
    ck('premerge PASS4A 2970/2970',pre.get('pass4a_projection')=={'checks_passed':2970,'checks_failed':0},pre.get('pass4a_projection'))
    post=e.get('postmerge',{})
    expected_runs={
      'registry_reconciliation':34037744613,
      'actions_governance':34037744596,
      'pages_deployment':34037744158,
      'prod_g1_full_postmerge_verification':34037744605,
      'scientific_base_production_qa':34037744585,
      'pass4a_deployment_path':34037744604,
    }
    for key,rid in expected_runs.items():
        item=post.get(key,{})
        ck(f'postmerge {key} run exact',item.get('run_id')==rid,item.get('run_id'))
        ck(f'postmerge {key} success',item.get('conclusion')=='success',item.get('conclusion'))
    for key in ['scientific_status_upgrade','runtime_mutated','science_routes_mutated','measurement_mutated','scoring_mutated','thresholds_mutated','respondent_state_mutated','persistence_mutated','report_calculation_mutated','supabase_mutated']:
        ck(f'evidence mutation/status flag false / {key}',e.get(key) is False,e.get(key))

if DELTA.exists():
    d=load(DELTA)
    ck('exact delta activation exact',d.get('registry_activation_merge')==ACTIVATION,d.get('registry_activation_merge'))
    ck('exact delta unresolved zero',d.get('unresolved_delta_count')==0,d.get('unresolved_delta_count'))
    ck('exact delta old registry frozen',d.get('historical_executable_registry',{}).get('sha256')==OLD_REG_SHA)
    for key,val in d.get('mutation_flags',{}).items(): ck(f'exact delta mutation false / {key}',val is False,val)

if SEAL_MANIFEST.exists():
    m=load(SEAL_MANIFEST)
    ck('seal manifest candidate status',m.get('status')=='FINAL_SEAL_CANDIDATE',m.get('status'))
    ck('seal manifest activation exact',m.get('registry_activation_head')==ACTIVATION,m.get('registry_activation_head'))
    ck('seal manifest parent PROD-G1 remains closed',m.get('parent_prod_g1_status')=='CLOSED_CONTROLLED_SEALED_ACTIVE_IN_PRODUCTION')
    ck('seal manifest target child status',m.get('child_gate_target_status')=='CLOSED_CONTROLLED_SEALED')
    ck('seal manifest public ceiling unchanged',m.get('public_ceiling_unchanged') is True)
    ck('seal manifest Global70 exact',m.get('global_library_contract')=={'core':45,'extension':25,'global':70},m.get('global_library_contract'))
    for key,val in m.get('mutation_authority',{}).items(): ck(f'seal manifest mutation authority false / {key}',val is False,val)

if NEW_REG.exists():
    r=load(NEW_REG)
    ck('governance registry active controlled',r.get('status')=='ACTIVE_CONTROLLED_PRODUCTION_REGISTRY',r.get('status'))
    ck('governance registry scientific authority not reopened',r.get('disposition',{}).get('scientific_authority_reopened') is False)
    ck('governance registry status drift reconciled',r.get('disposition',{}).get('status_drift')=='RECONCILED')
    ck('governance registry Global70 exact',r.get('scientific_authority',{}).get('global_library_contract')=={'core':45,'extension':25,'global':70})
    ladder=r.get('scientific_authority',{}).get('evidence_ladder',{})
    ck('E1 remains non-empirical',ladder.get('E1')=='INTERNAL ARCHITECTURE VERIFICATION / NOT EMPIRICAL VALIDATION',ladder.get('E1'))
    ck('E2 remains pending','PENDING' in ladder.get('E2',''),ladder.get('E2'))
    ck('E3 remains not established','NOT ESTABLISHED' in ladder.get('E3',''),ladder.get('E3'))

if PASS4_MANIFEST.exists():
    p=load(PASS4_MANIFEST)
    ck('PASS4 remains sealed',p.get('status')=='WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED',p.get('status'))
    ck('PASS4 unresolved delta zero',p.get('unresolved_delta_count')==0,p.get('unresolved_delta_count'))
    ck('PASS4 public ceiling unchanged',p.get('public_ceiling_unchanged') is True)
    ck('PASS4 Global70 exact',p.get('global_library_contract')=={'core':45,'extension':25,'global':70},p.get('global_library_contract'))

result={
 'standard':'P120',
 'document_id':'P120-WEBSCI-PROD-G1-REGISTRY-FINAL-SEAL-QA',
 'version':'v1.1',
 'activation_head':ACTIVATION,
 'sealed_science_authority':SEALED,
 'closure_candidate_head':run('git','rev-parse','HEAD').stdout.strip(),
 'status':'PASS' if not failures else 'FAIL',
 'checks_total':len(checks),
 'checks_passed':len(checks)-len(failures),
 'checks_failed':len(failures),
 'changed_files':changed,
 'failures':failures,
 'checks':checks
}
out=Path('qa-evidence-webscience-prod-g1-registry-final-seal')
out.mkdir(exist_ok=True)
(out/'P120_WEBSCI_PROD_G1_REGISTRY_FINAL_SEAL_QA_v1.1.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['status','checks_total','checks_passed','checks_failed','closure_candidate_head','changed_files','failures']},ensure_ascii=False,indent=2))
if failures: sys.exit(1)
