from pathlib import Path
import hashlib, json, subprocess, sys

BASE='0c9a7bdc7470dcc9eb1223ebfc15bb5bcc6f94b4'
SEALED='d095cae40b33da2118e5090be2a2c837205d8b64'
OLD_REG=Path('P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json')
NEW_REG=Path('P120_WEBSCI_PRODUCTION_registry_v1.1_2026-09-06.json')
OLD_REG_SHA='38b706b38f8f19f60c5917874b8371661340bb0cf30059fe9a7de98d16251f5e'
PASS4_MANIFEST=Path('webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json')
PASS4_PROJECTION=Path('webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json')
GLOBAL70=Path('webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json')
RUNTIME=Path('p120-scientific-base-runtime-v1.0.js')
RU=Path('science/index.html')
EN=Path('en/science/index.html')

checks=[]
failures=[]
def ck(name,ok,detail=None):
    row={'name':name,'pass':bool(ok)}
    if detail is not None: row['detail']=detail
    checks.append(row)
    if not ok: failures.append(row)
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def git(*args): return subprocess.run(['git',*args],text=True,capture_output=True)
def load(p): return json.loads(Path(p).read_text())

ck('BASE is ancestor of HEAD',git('merge-base','--is-ancestor',BASE,'HEAD').returncode==0)
ck('sealed PASS4 authority is ancestor of HEAD',git('merge-base','--is-ancestor',SEALED,'HEAD').returncode==0)
ck('historical executable registry exists',OLD_REG.exists())
ck('historical executable registry SHA256 frozen',OLD_REG.exists() and sha(OLD_REG)==OLD_REG_SHA,sha(OLD_REG) if OLD_REG.exists() else None)
ck('new governance registry exists',NEW_REG.exists())

for p in [OLD_REG,RUNTIME,RU,EN,PASS4_MANIFEST,PASS4_PROJECTION,GLOBAL70]:
    diff=git('diff','--quiet',BASE,'HEAD','--',str(p)).returncode
    ck(f'protected pre-existing file unchanged / {p}',diff==0)

changed=[x for x in git('diff','--name-only',BASE,'HEAD').stdout.splitlines() if x]
allowed={
 'P120_WEBSCI_PRODUCTION_registry_v1.1_2026-09-06.json',
 'qa/webscience_prod_g1_registry_reconciliation_gate_v1.1.py',
 'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_RECONCILIATION_REPORT_v1.1.md',
 'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_RECONCILIATION_DECISION_v1.1.md',
 'webscience/production/P120_WEBSCI_PROD_G1_REGISTRY_RECONCILIATION_MANIFEST_v1.1.json',
 '.github/workflows/p120-webscience-prod-g1-registry-reconciliation-v1.1.yml'
}
for p in changed: ck(f'authorized additive delta / {p}',p in allowed,p)

if NEW_REG.exists():
    r=load(NEW_REG)
    ck('registry schema id',r.get('schema_id')=='P120-WEBSCI-PRODUCTION-REGISTRY',r.get('schema_id'))
    ck('registry schema version',r.get('schema_version')=='1.1',r.get('schema_version'))
    ck('registry active controlled status',r.get('status')=='ACTIVE_CONTROLLED_PRODUCTION_REGISTRY',r.get('status'))
    ck('controlled main exact',r.get('controlled_main',{}).get('commit_sha')==BASE,r.get('controlled_main',{}).get('commit_sha'))
    ck('sealed science authority exact',r.get('source_lineage',{}).get('sealed_science_authority_commit')==SEALED)
    ck('v1.0 executable registry bound exact',r.get('runtime_binding',{}).get('executable_registry_file')==OLD_REG.name)
    ck('runtime explicitly not mutated',r.get('runtime_binding',{}).get('runtime_mutated_by_registry_reconciliation') is False)
    ck('route HTML explicitly not mutated',r.get('runtime_binding',{}).get('route_html_mutated_by_registry_reconciliation') is False)
    ck('PROD-G1 final status exact',r.get('prod_g1',{}).get('status')=='CLOSED_CONTROLLED_SEALED_ACTIVE_IN_PRODUCTION')
    ck('PROD-G1 final merge exact',r.get('prod_g1',{}).get('final_merge_commit')==BASE)
    ck('postmerge seal success',r.get('prod_g1',{}).get('postmerge_final_seal',{}).get('conclusion')=='success')
    ck('postmerge seal run exact',r.get('prod_g1',{}).get('postmerge_final_seal',{}).get('run_id')==34035455628)
    ck('live production checks 140/0',r.get('prod_g1',{}).get('live_science_checks')=={'passed':140,'failed':0},r.get('prod_g1',{}).get('live_science_checks'))
    ck('unresolved delta zero',r.get('prod_g1',{}).get('unresolved_delta_count')==0)
    ck('global library contract 45/25/70',r.get('scientific_authority',{}).get('global_library_contract')=={'core':45,'extension':25,'global':70})
    ladder=r.get('scientific_authority',{}).get('evidence_ladder',{})
    ck('E1 remains non-empirical',ladder.get('E1')=='INTERNAL ARCHITECTURE VERIFICATION / NOT EMPIRICAL VALIDATION',ladder.get('E1'))
    ck('E2 remains pending','PENDING' in ladder.get('E2',''),ladder.get('E2'))
    ck('E3 remains not established','NOT ESTABLISHED' in ladder.get('E3',''),ladder.get('E3'))
    pub=r.get('public_projection',{})
    for m in ['COM-12','MOT-12','SELF-12','LIFE-12/18']:
        ck(f'{m} remains summary_only',pub.get(m)=='summary_only',pub.get(m))
    ck('RPE remains summary_only and suppressed',pub.get('RPE-MOD')=='summary_only / detailed structure suppressed',pub.get('RPE-MOD'))
    ck('DYADIC remains hidden',pub.get('DYADIC')=='hidden',pub.get('DYADIC'))
    ck('Extended Total remains unauthorized',pub.get('extended_total')=='NOT AUTHORIZED')
    ck('causal effects remain unauthorized',pub.get('causal_effects')=='NOT AUTHORIZED')
    ck('validated synergy remains unauthorized',pub.get('validated_synergy')=='NOT AUTHORIZED')
    flags=r.get('mutation_flags',{})
    for key,val in flags.items(): ck(f'mutation flag false / {key}',val is False,val)
    ck('status drift reconciled',r.get('disposition',{}).get('status_drift')=='RECONCILED')
    ck('scientific authority not reopened',r.get('disposition',{}).get('scientific_authority_reopened') is False)

if PASS4_MANIFEST.exists():
    m=load(PASS4_MANIFEST)
    ck('sealed PASS4 manifest status unchanged',m.get('status')=='WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED',m.get('status'))
    ck('sealed PASS4 unresolved delta zero',m.get('unresolved_delta_count')==0,m.get('unresolved_delta_count'))
    ck('sealed PASS4 public ceiling unchanged',m.get('public_ceiling_unchanged') is True)
    ck('sealed PASS4 Global70 exact',m.get('global_library_contract')=={'core':45,'extension':25,'global':70},m.get('global_library_contract'))

result={
 'standard':'P120',
 'document_id':'P120-WEBSCI-PROD-G1-REGISTRY-RECONCILIATION-QA',
 'version':'v1.1',
 'baseline':BASE,
 'sealed_science_authority':SEALED,
 'status':'PASS' if not failures else 'FAIL',
 'checks_total':len(checks),
 'checks_passed':len(checks)-len(failures),
 'checks_failed':len(failures),
 'changed_files':changed,
 'checks':checks,
 'failures':failures
}
out=Path('qa-evidence-webscience-prod-g1-registry')
out.mkdir(exist_ok=True)
(out/'P120_WEBSCI_PROD_G1_REGISTRY_RECONCILIATION_QA_v1.1.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['status','checks_total','checks_passed','checks_failed','changed_files','failures']},indent=2,ensure_ascii=False))
if failures: sys.exit(1)
