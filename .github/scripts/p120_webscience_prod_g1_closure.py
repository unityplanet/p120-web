from pathlib import Path
import hashlib, json, os, subprocess, sys
from datetime import datetime, timezone

ROOT=Path('.')
OUT=Path(os.environ.get('P120_PROD_G1_CLOSURE_OUT','_release/P120_WEBSCI_PROD_G1_v1.0'))
OUT.mkdir(parents=True,exist_ok=True)
DATE='2026-09-06'
SEALED='d095cae40b33da2118e5090be2a2c837205d8b64'
PRODUCTION_CONTENT_HEAD='83bc0829d5d7371eedc9e810259f29b1c35b696c'
PRE_ACTIVATION_MAIN='194bdf274f1a6012ef6c2e4b4f31e5f44b472055'
ACTIVATION_MERGE='2c1f6ad9844d948c0e16e2f016ce8eeba339ef02'
SCIBASE_RECON_MERGE='9bd3c1366f69f02617612169ffbd69ebcf8f5100'
GOV_RECON_MERGE='83bc0829d5d7371eedc9e810259f29b1c35b696c'

EXPECTED={
 'sealed_reconciliation':69,
 'postmerge_boundary':31,
 'deployment_invariants':39,
 'deployment_browser':82,
 'actions_governance':11,
 'pass4a_projection':2970,
 'scientific_base':269,
 'pass4c_browser':88,
 'pass4d_static':448,
 'pass4d_browser':448,
 'pass4e_browser_typography':952,
 'live_production':140,
}

def sh(*args):
    return subprocess.check_output(args,text=True).strip()
def sha_file(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def load(p): return json.loads(Path(p).read_text())
def dump(name,obj):
    (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def write(name,text): (OUT/name).write_text(text.rstrip()+'\n')
def find_json(patterns,document_id=None):
    seen=[]
    for pat in patterns:
        for p in ROOT.glob(pat):
            if p.is_file() and p.suffix=='.json':
                try:d=load(p)
                except Exception:continue
                seen.append((p,d))
                if document_id is None or d.get('document_id')==document_id:return p,d
    raise SystemExit(f'missing QA JSON document_id={document_id} patterns={patterns}; candidates={[str(p) for p,_ in seen]}')
def require(name,d,expected):
    ok=d.get('status')=='PASS' and d.get('checks_passed')==expected and d.get('checks_failed')==0 and d.get('checks_total')==expected
    if not ok: raise SystemExit(f'{name} evidence mismatch: status={d.get("status")} passed={d.get("checks_passed")} total={d.get("checks_total")} failed={d.get("checks_failed")} expected={expected}')

head=sh('git','rev-parse','HEAD')
branch=sh('git','rev-parse','--abbrev-ref','HEAD')
if subprocess.run(['git','merge-base','--is-ancestor',SEALED,'HEAD']).returncode!=0: raise SystemExit('sealed PASS4 authority is not ancestor of closure candidate')
if subprocess.run(['git','merge-base','--is-ancestor',PRODUCTION_CONTENT_HEAD,'HEAD']).returncode!=0: raise SystemExit('production reconciliation head is not ancestor of closure candidate')

qa={}
qa['sealed_reconciliation']=find_json(['qa-evidence-webscience-prod-g1/*.json'],'P120-WEBSCI-PROD-G1-SEALED-RECONCILIATION-QA')
qa['postmerge_boundary']=find_json(['qa-evidence-webscience-prod-g1-postmerge/*.json'],'P120-WEBSCI-PROD-G1-POSTMERGE-QA')
qa['deployment_invariants']=find_json(['qa-evidence-webscience-prod-g1-deployment-path-reconcile/*.json'],'P120-WEBSCI-PROD-G1-DEPLOYMENT-PATH-BASELINE-RECONCILIATION-QA')
qa['deployment_browser']=find_json(['qa-evidence-pass4a/*.json'],'P120-WEB-PASS4A-QA-001')
qa['actions_governance']=find_json(['qa-evidence-webscience-prod-g1-actions/*.json'],'P120-WEBSCI-PROD-G1-ACTIONS-GOVERNANCE-QA')
qa['pass4a_projection']=find_json(['webscience/pass4/P120_WEBSCI_EXT_PASS4_PASS4A_QA_RESULT_v0.5.json'],'P120-WEBSCI-EXT-004-PASS4A-QA')
qa['scientific_base']=find_json(['qa-evidence-science-production-v1/*.json'],'P120-SCIENCE-PRODUCTION-QA-001')
qa['pass4c_browser']=find_json(['qa-evidence-webscience-pass4c/*.json'],'P120-WEBSCI-EXT-004-PASS4C-QA')
qa['pass4d_static']=find_json(['qa-evidence-webscience-pass4d/*.json','webscience/pass4/*PASS4D*STATIC*QA*.json'],'P120-WEBSCI-EXT-004-PASS4D-STATIC-QA')
qa['pass4d_browser']=find_json(['qa-evidence-webscience-pass4d/*.json','webscience/pass4/*PASS4D*BROWSER*QA*.json'],'P120-WEBSCI-EXT-004-PASS4D-BROWSER-QA')
qa['pass4e_browser_typography']=find_json(['qa-evidence-webscience-pass4e/*.json','webscience/pass4/*PASS4E*BROWSER*QA*.json'],'P120-WEBSCI-EXT-004-PASS4E-BROWSER-TYPOGRAPHY-QA')
qa['live_production']=find_json(['qa-evidence-webscience-prod-g1-live/*.json'],'P120-WEBSCI-PROD-G1-LIVE-SMOKE')
for k,(p,d) in qa.items(): require(k,d,EXPECTED[k])

# Strong authority conditions not reducible to counts.
final=load('webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json')
if final.get('status')!='WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED' or final.get('unresolved_delta_count')!=0: raise SystemExit('sealed PASS4 final manifest authority mismatch')
contract=final.get('global_library_contract',{})
if contract!={'core':45,'extension':25,'global':70}: raise SystemExit(f'Global70 contract mismatch: {contract}')
if final.get('public_ceiling_unchanged') is not True: raise SystemExit('public ceiling changed')
if qa['actions_governance'][1].get('active_write_allowlist')!=['p120-en-system-build-v0.4.yml']: raise SystemExit('Actions write allowlist mismatch')
if qa['live_production'][1].get('production_base')!='https://unityplanet.github.io/p120-web/': raise SystemExit('live production base mismatch')

# Exact production impact: product/science bytes are inherited from the already verified production head.
product_paths=[
 'science/index.html','en/science/index.html','p120-scientific-base-runtime-v1.0.js',
 'p120-webscience-pass4b-renderer-v0.6.js','p120-webscience-pass4c-library-v0.7.js','p120-webscience-pass4e-visual-v0.9.css',
 'index.html','en/index.html','p120-session-contract-v1.0.js','p120-submission-intake-v1.0.js','manual-report-handoff-v1.0.js'
]
product_delta=[]
for p in product_paths:
    rc=subprocess.run(['git','diff','--quiet',PRODUCTION_CONTENT_HEAD,'HEAD','--',p]).returncode
    product_delta.append({'path':p,'changed_from_production_content_head':rc!=0,'sha256':sha_file(p) if Path(p).exists() else None})
if any(x['changed_from_production_content_head'] for x in product_delta): raise SystemExit('closure candidate mutates product/science surface')

qa_matrix={k:{'path':str(p),'sha256':sha_file(p),'checks':d.get('checks_total'),'status':d.get('status')} for k,(p,d) in qa.items()}
qa_total=sum(EXPECTED.values())

exact_delta={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-EXACT-DELTA','version':'v1.0','date':DATE,
 'pre_activation_main':PRE_ACTIVATION_MAIN,'sealed_science_authority':SEALED,
 'production_activation_merge':ACTIVATION_MERGE,'scientific_base_reconciliation_merge':SCIBASE_RECON_MERGE,
 'governance_deployment_reconciliation_merge':GOV_RECON_MERGE,'closure_candidate_head':head,
 'product_science_surface_delta_after_governance_reconciliation':'ZERO',
 'product_paths':product_delta,
 'structural_changes':[
  'Sealed PASS4 Science activated into main through controlled merge topology.',
  'Scientific Base legacy single-baseline guard reconciled to split historical/sealed authority.',
  'PASS4A deployment-path guard reconciled from whole-repository historical scope to forward invariant authority.',
  'Seven completed PASS4A–4G repository-writer workflows retired from executable Actions surface.',
  'SEC-GH-02 active write allowlist remains one temporary EN System materializer.',
  'Read-only live GitHub Pages Science verification added for PROD-G1 closure.'
 ],
 'scientific_content_mutated':False,'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,
 'respondent_wording_mutated':False,'respondent_session_mutated':False,'persistence_mutated':False,'report_calculation_mutated':False,'supabase_mutated':False
}
dump('P120_WEBSCI_PROD_G1_EXACT_DELTA_v1.0.json',exact_delta)

authority={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-AUTHORITY-INDEX','version':'v1.0','date':DATE,
 'sealed_science_authority':SEALED,
 'production_content_head':PRODUCTION_CONTENT_HEAD,
 'authority_chain':[
  {'authority':'WEB-SCIENCE EXT PASS 4','commit':SEALED,'status':'CLOSED / CONTROLLED / SEALED'},
  {'authority':'pre-activation production main','commit':PRE_ACTIVATION_MAIN,'status':'PRESERVED AS NON-SCIENCE BASELINE'},
  {'authority':'production activation merge','commit':ACTIVATION_MERGE,'status':'MERGED'},
  {'authority':'Scientific Base baseline reconciliation','commit':SCIBASE_RECON_MERGE,'status':'MERGED / VERIFIED'},
  {'authority':'deployment-path + Actions governance reconciliation','commit':GOV_RECON_MERGE,'status':'MERGED / VERIFIED'},
  {'authority':'PROD-G1 closure candidate','commit':head,'status':'SEALED PACKAGE BUILD AUTHORITY'}
 ],
 'canonical_hashes':{
  'publication_projection':'2621ae1317b0161f3c3a819f79b2b874dfd9ba6e0c32e2d7ecb580841114758d',
  'global_library_projection':'a32623e1b058d3658ae0f3afbb1e6fdc4b3503a6132634ecc1868b6e335d146a',
  'global_library_integrated':'af1fede5aeb36f2e4dc11fb55ad0f31fe5a74e2bd59fa9a0bb1aa7d405e8bdf8',
  'pass4b_renderer':'3a97e8838c73c56913b2cda03a5ea12afc579b1b085440b946ef800f2adbcc7b',
  'pass4c_runtime':'c8dd6b1c88706a2bb0c879099f5db0f87b2401b11fb5ca493037480781833425',
  'pass4e_css':'d2fac104c534f0ea90e77d207887557afa8abd2ce246ac4f85c7f8ddbad48aeb'
 },
 'global_library_contract':{'core':45,'extension':25,'global':70},
 'public_evidence_ceiling':'UNCHANGED; E1 IS NOT EMPIRICAL VALIDATION; E2 PENDING; E3 NOT ESTABLISHED'
}
dump('P120_WEBSCI_PROD_G1_AUTHORITY_INDEX_v1.0.json',authority)

qa_evidence={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-QA-RECONCILIATION-EVIDENCE','version':'v1.0','date':DATE,
 'status':'PASS','checks_total':qa_total,'checks_failed':0,'matrix':qa_matrix,
 'live_probe_history':[
  {'run':34029403310,'result':'FAIL 51/72','disposition':'QA semantic heuristic defects identified; not accepted as closure evidence'},
  {'run':34029601319,'result':'FAIL 134/136','disposition':'PASS4E asynchronous readiness race identified; not accepted as closure evidence'},
  {'run':34029706435,'result':'PASS 140/140','artifact_id':9988196296,'artifact_digest':'sha256:7e30785c83172dec73cb2e93562db2a2ef732b65b4a566734a0d2d16157c733a','disposition':'FINAL LIVE EVIDENCE'}
 ],
 'previous_postmerge_evidence':{
  'run':34029140662,'artifact_id':9988037780,'artifact_digest':'sha256:435181823e9acee9748b823adb51301b9f180f3f1e882718ffd426a8e6fa2e37',
  'scientific_base_run':34029140658,'scientific_base_artifact_id':9988044458,'scientific_base_artifact_digest':'sha256:661f110256ad48312c249b08df2ae9b919f45c5474d7b33d34786cc3b301d7c'
 },
 'deployment_path_evidence':{'run':34027483670,'artifact_id':9987532063,'artifact_digest':'sha256:35a661bd8a30a69a218f021dae0105ffed6e98aa26a1afc46b58e95437580a49'}
}
dump('P120_WEBSCI_PROD_G1_QA_RECONCILIATION_EVIDENCE_v1.0.json',qa_evidence)

source_disposition={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-SOURCE-AUTHORITY-DISPOSITION','version':'v1.0','date':DATE,
 'sealed_pass4':'IMMUTABLE / NOT REOPENED','pass4f_pass4g':'HISTORICAL SEALED AUTHORITY / NOT RERUN AS PRE-PRODUCTION TOPOLOGY',
 'legacy_scientific_base_baseline':'PARTIALLY SUPERSEDED ONLY FOR p120-scientific-base-runtime-v1.0.js BY SEALED PASS4 AUTHORITY',
 'legacy_pass4a_scope_guard':'SUPERSEDED FOR FUTURE MAIN BY FORWARD INVARIANT-BASED DEPLOYMENT-PATH RECONCILIATION; ORIGINAL TWO PATH-TOKEN CORRECTIONS PRESERVED',
 'sec_gh_02_v1_0':'HISTORICAL CLOSURE RECORD PRESERVED','sec_gh_02_v1_1':'ACTIVE FORWARD GOVERNANCE',
 'pass4_sealing_writers':'RETIRED FROM EXECUTABLE SURFACE; GIT/GITHUB HISTORY RETAINED AS PROVENANCE',
 'production_science_assets':'EXACT SEALED PASS4 BYTES','production_non_science_surfaces':'PRESERVED THROUGH CONTROLLED MERGE/RECONCILIATION',
 'live_pages':'VERIFIED AGAINST PUBLIC GITHUB PAGES TRANSPORT'
}
dump('P120_WEBSCI_PROD_G1_SOURCE_AUTHORITY_DISPOSITION_v1.0.json',source_disposition)

repro={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-REPRODUCIBILITY','version':'v1.0','date':DATE,
 'repository':'unityplanet/p120-web','branch':branch,'closure_candidate_head':head,'production_content_head':PRODUCTION_CONTENT_HEAD,
 'production_url':'https://unityplanet.github.io/p120-web/','sealed_science_authority':SEALED,
 'environment':{'runner':'ubuntu-latest','playwright':'1.55.0','browser':'Chromium','git_fetch_depth':0},
 'commands':[ 
  'python3 qa/webscience_prod_g1_reconciliation_gate_v1.0.py',
  'python3 qa/webscience_prod_g1_postmerge_gate_v1.0.py',
  'python3 qa/webscience_prod_g1_deployment_path_baseline_reconciliation_v1.0.py',
  'python3 qa/webscience_prod_g1_actions_governance_gate_v1.0.py',
  'node qa/webscience_pass4a_projection_gate_v0.5.mjs',
  'node qa/pass4a_deployment_path_gate.mjs',
  'node qa/scientific_base_production_gate_v1.mjs',
  'node qa/webscience_pass4c_library_gate_v0.7.mjs',
  'node qa/webscience_pass4d_claim_boundary_static_gate_v0.8.mjs',
  'node qa/webscience_pass4d_claim_boundary_browser_gate_v0.8.mjs',
  'node qa/webscience_pass4e_browser_typography_gate_v0.9.mjs',
  'node qa/webscience_prod_g1_live_smoke_v1.0.mjs'
 ],
 'package_integrity_rule':'PACKAGE_CONTENT_SHA256SUMS.txt EXCLUDED FROM ITS OWN CHECKSUM SET; ZIP + SIDECAR + INTERNAL LEDGER VERIFIED AFTER BUILD'
}
dump('P120_WEBSCI_PROD_G1_REPRODUCIBILITY_RECORD_v1.0.json',repro)

status={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-FINAL-STATUS','version':'v1.0','date':DATE,
 'status':'CLOSED_CONTROLLED_SEALED_ACTIVE_IN_PRODUCTION','gate':'WEB-SCIENCE PRODUCTION ACTIVATION GATE 1',
 'production_url':'https://unityplanet.github.io/p120-web/','production_content_head':PRODUCTION_CONTENT_HEAD,'closure_candidate_head':head,
 'sealed_science_authority':SEALED,'checks_total':qa_total,'checks_failed':0,'live_checks':'140/140 PASS',
 'scientific_status_upgrade':False,'measurement_mutation':False,'scoring_mutation':False,'threshold_mutation':False,
 'respondent_session_mutation':False,'persistence_mutation':False,'report_calculation_mutation':False,'supabase_mutation':False,
 'remaining_active_repository_writer':'p120-en-system-build-v0.4.yml','retired_pass4_writer_workflows':7,
 'next_action':'FURTHER IMPLEMENTATION MAY PROCEED ONLY FROM CURRENT CONTROLLED MAIN AFTER REGISTRY RECONCILIATION'
}
dump('P120_WEBSCI_PROD_G1_FINAL_STATUS_RECORD_v1.0.json',status)

manifest={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-MANIFEST','version':'v1.0','date':DATE,
 'status':'PROD_G1_CLOSED_CONTROLLED_SEALED_ACTIVE_IN_PRODUCTION','repository':'unityplanet/p120-web','closure_candidate_head':head,
 'production_content_head':PRODUCTION_CONTENT_HEAD,'sealed_science_authority':SEALED,'qa_total_assertions':qa_total,
 'qa_matrix':qa_matrix,'unresolved_delta_count':0,'public_ceiling_unchanged':True,
 'global_library_contract':{'core':45,'extension':25,'global':70},'product_science_surface_delta_after_reconciliation':'ZERO',
 'package_sha256':'RECORDED_EXTERNALLY_IN_ZIP_SIDECAR_TO_AVOID_SELF_REFERENCE'
}
dump('P120_WEBSCI_PROD_G1_MANIFEST_v1.0.json',manifest)

write('P120_WEBSCI_PROD_G1_PASS_REPORT_v1.0.md',f'''# P-120 WEB-SCIENCE — PROD-G1 PASS Report

**Gate:** WEB-SCIENCE PRODUCTION ACTIVATION GATE 1  
**Date:** {DATE}  
**Status:** `PASS / CLOSED / CONTROLLED / SEALED / ACTIVE IN PRODUCTION`  
**Production Science authority:** `{SEALED}`  
**Production content head verified:** `{PRODUCTION_CONTENT_HEAD}`  
**Closure candidate:** `{head}`

## Result

The sealed WEB-SCIENCE EXT PASS 4 authority is active on production GitHub Pages. Production activation, Scientific Base baseline reconciliation, deployment-path reconciliation, Actions-governance reconciliation and live RU/EN verification all pass.

The final closure matrix contains **{qa_total}/{qa_total} PASS** assertions across immutable-seal reconciliation, production boundary, deployment path, Actions governance, publication projection, Scientific Base, Global70 integration, claim/parity, responsive typography and live production.

## Structural impact

No scientific content, measurement, scoring, threshold, respondent wording/session, persistence, report calculation or Supabase mutation was introduced by PROD-G1 reconciliation. Seven completed PASS4 sealing writer workflows were retired; the active repository-write allowlist was not expanded.
''')

write('P120_WEBSCI_PROD_G1_FINAL_RECONCILIATION_RECORD_v1.0.md',f'''# P-120 WEB-SCIENCE — PROD-G1 Final Reconciliation Record

**Status:** `RECONCILED / ZERO UNRESOLVED DELTAS`

1. Sealed Science authority `{SEALED}` remains byte/semantic authority.
2. Production activation merge `{ACTIVATION_MERGE}` established Science ancestry in `main`.
3. Scientific Base legacy baseline was reconciled without changing the historical Core prefix or public boundaries.
4. PASS4A deployment-path authority remains the original two project-subpath corrections; historical whole-repo scope semantics were superseded by forward invariants.
5. SEC-GH-02 detected retained one-time PASS4 writer workflows; seven were retired instead of added to the permanent allowlist.
6. Production main `{PRODUCTION_CONTENT_HEAD}` passed deployment, governance, Scientific Base, PASS4C/4D/4E and post-merge regressions.
7. Public GitHub Pages passed final live smoke **140/140**.
8. Unresolved deltas: **0**.
''')

write('P120_WEBSCI_PROD_G1_FREEZE_AND_ACTIVATION_DECISION_v1.0.md',f'''# P-120 WEB-SCIENCE — PROD-G1 Freeze / Activation Decision

**Decision:** `ACTIVATION ACCEPTED / PROD-G1 CLOSE`  
**Science publication authority:** frozen at sealed PASS4 `{SEALED}`.  
**Production state:** active at `https://unityplanet.github.io/p120-web/`.

The activation does not authorize scientific-status escalation. E1 remains internal architecture verification rather than empirical validation; E2 remains pending; E3 is not established. Extended modules remain `summary_only`; RPE detailed public structure remains suppressed; DYADIC remains hidden; no Extended super-score is authorized.

Further implementation may proceed from controlled `main`, but changes to Science publication authority require a new governed gate rather than modification of this sealed package.
''')

write('P120_WEBSCI_PROD_G1_PACKAGE_INDEX_v1.0.md','''# P-120 WEB-SCIENCE PROD-G1 — Package Index

Mandatory closure records:
- PASS Report
- Final Reconciliation Record
- Freeze / Activation Decision
- Exact Delta
- Authority Index
- QA / Reconciliation Evidence
- Source-Authority Disposition
- Final Status Record
- Manifest
- Reproducibility Record
- Package Index

The package additionally contains current QA evidence directories, selected canonical PASS4 authority files, governance reconciliation records and RELEASE_CONTROL integrity records.
''')

print(json.dumps({'status':'PASS','closure_candidate_head':head,'qa_total_assertions':qa_total,'out':str(OUT)},indent=2))
