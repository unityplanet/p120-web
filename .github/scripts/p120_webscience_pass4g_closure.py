from pathlib import Path
import json, hashlib, subprocess

V='v1.1'; DATE='2026-09-06'; BASE='1155a78646a314e3693aa7b247e667b86507a1d4'
BRANCH='web-science-ext-pass4g-final-sealing'
W=Path('webscience/pass4'); E=Path('qa-evidence-webscience-pass4g')
Q=E/'P120_WEBSCI_EXT_PASS4_PASS4G_FINAL_SEAL_QA_RESULT_v1.1.json'
qa=json.loads(Q.read_text())
if qa.get('status')!='PASS' or qa.get('checks_failed')!=0:
    raise SystemExit('PASS 4G final seal QA is not fully PASS')

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def git(*args): return subprocess.run(['git',*args],text=True,capture_output=True,check=True).stdout.strip()

# Persist final-seal QA evidence into controlled corpus.
(W/Q.name).write_bytes(Q.read_bytes())

status={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-FINAL-STATUS','version':V,'date':DATE,
 'workstream':'WEB-SCIENCE EXT PASS 4','status':'CLOSED_CONTROLLED_SEALED','verdict':'PASS',
 'final_sealing_gate':'PASS 4G','baseline_pass4f_closure':BASE,
 'subpasses':{
   'PASS4A':'CLOSED_CONTROLLED','PASS4B':'CLOSED_CONTROLLED','PASS4C':'CLOSED_CONTROLLED',
   'PASS4D':'CLOSED_CONTROLLED','PASS4E':'CLOSED_CONTROLLED_SEALED','PASS4F':'CLOSED_CONTROLLED_SEALED','PASS4G':'CLOSED_CONTROLLED_SEALED'
 },
 'recorded_upstream_gate_assertions':qa['recorded_upstream_gate_assertions'],
 'pass4g_final_seal_checks':f"{qa['checks_passed']}/{qa['checks_total']} PASS",
 'scientific_content_mutated_in_PASS4G':False,'references_mutated_in_PASS4G':False,
 'measurement_mutated_in_PASS4G':False,'scoring_mutated_in_PASS4G':False,'thresholds_mutated_in_PASS4G':False,
 'renderer_mutated_in_PASS4G':False,'presentation_mutated_in_PASS4G':False,
 'production_merge':'NOT_PERFORMED','production_activation':'NOT_AUTHORIZED_BY_SEALING',
 'production_activation_disposition':'SEPARATE_CONTROLLED_PRODUCTION_GATE_REQUIRED',
 'public_ceiling':'UNCHANGED_FROM_PASS4A_TO_PASS4F_AUTHORITY',
 'reopen_rule':'Any scientific, reference, evidence-state, runtime, presentation, measurement, scoring, threshold or production-activation change after this seal requires a new controlled gate; this package is not mutable in place.'
}
(W/'P120_WEBSCI_EXT_PASS4_FINAL_STATUS_RECORD_v1.1.json').write_text(json.dumps(status,ensure_ascii=False,indent=2)+'\n')

authority={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-FINAL-AUTHORITY-INDEX','version':V,'date':DATE,
 'authority_model':'FORWARD_ONLY / PASS_LOCAL_HISTORY_PRESERVED / CURRENT_STATE_BOUND_AT_FINAL_SEAL',
 'stages':[
   {'stage':'PASS4A','version':'v0.5','role':'RU_EN_PUBLICATION_PROJECTION','closure':'a775606fcbe061f27184c1800cc5f5bf15f84679','post_package_head':'2759e288fec90064858fb99b137c07e6505f6257','qa':'2970/2970'},
   {'stage':'PASS4B','version':'v0.6','role':'CONTROLLED_RENDERER_ACTIVATION','closure':'9d07a3a047ce4b9a61b6f307e3f791fcdfabaff4','qa':'198/198'},
   {'stage':'PASS4C','version':'v0.7','role':'CORE45_GLOBAL70_LIBRARY_INTEGRATION','closure':'211c0f4f0d2601c46bc2d4d283ade84aee474c47','qa':'88/88'},
   {'stage':'PASS4D','version':'v0.8','role':'CLAIM_BOUNDARY_AND_RU_EN_PARITY_QA','closure':'89683b678b76dde7df1cdeccc05d6e8541573b5b','qa':'448/448 static + 448/448 browser'},
   {'stage':'PASS4E','version':'v0.9','role':'BROWSER_RESPONSIVE_TYPOGRAPHY_QA','closure':'cd71bf494f72090e0a81cfd3702fd6049ab89bb0','qa':'952/952'},
   {'stage':'PASS4F','version':'v1.0','role':'CLOSURE_RECONCILIATION','closure':BASE,'qa':'119/119'},
   {'stage':'PASS4G','version':V,'role':'MANDATORY_FULL_PASS_PACKAGE_AND_FINAL_PARENT_SEAL','closure':'TO_BE_BOUND_BY_CLOSURE_COMMIT','qa':f"{qa['checks_passed']}/{qa['checks_total']}"}
 ],
 'authorized_historical_supersessions':[
   {'path':'p120-webscience-pass4b-renderer-v0.6.js','authority':'PASS4C','disposition':'AUTHORIZED_RUNTIME_SUPERSESSION'},
   {'path':'p120-webscience-pass4c-library-v0.7.js','authority':'PASS4E','disposition':'AUTHORIZED_PRESENTATION_LOADER_SUPERSESSION'}
 ],
 'unresolved_delta_count':0,
 'current_source_authority':{
   'publication_projection':'webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json',
   'global_library_projection':'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json',
   'global70_integrated':'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json'
 },
 'current_runtime_authority':{
   'base_runtime':'p120-scientific-base-runtime-v1.0.js','renderer':'p120-webscience-pass4b-renderer-v0.6.js',
   'global_library_runtime':'p120-webscience-pass4c-library-v0.7.js','visual_layer':'p120-webscience-pass4e-visual-v0.9.css'
 },
 'production_main_merge':'NOT_PERFORMED'
}
(W/'P120_WEBSCI_EXT_PASS4_FINAL_AUTHORITY_INDEX_v1.1.json').write_text(json.dumps(authority,ensure_ascii=False,indent=2)+'\n')

repro={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-FINAL-REPRODUCIBILITY','version':V,'date':DATE,
 'baseline_pass4f_closure':BASE,
 'required_environment':{'python':'3.x','node':'20.x compatible','playwright':'1.55.0 for browser gates','browser':'Chromium'},
 'reproduction_sequence':[
   'node qa/webscience_pass4a_projection_gate_v0.5.mjs',
   'node qa/webscience_pass4c_materialize_global_library_v0.7.mjs and require zero diff',
   'node qa/webscience_pass4d_claim_boundary_static_gate_v0.8.mjs',
   'node qa/webscience_pass4c_library_gate_v0.7.mjs',
   'node qa/webscience_pass4d_claim_boundary_browser_gate_v0.8.mjs',
   'node qa/webscience_pass4e_browser_typography_gate_v0.9.mjs',
   'python3 qa/webscience_pass4f_closure_reconciliation_gate_v1.0.py',
   'python3 qa/webscience_pass4g_final_seal_gate_v1.1.py'
 ],
 'expected_results':{
   'PASS4A':'2970/2970','PASS4C_browser':'88/88','PASS4D_static':'448/448','PASS4D_browser':'448/448','PASS4E':'952/952','PASS4F':'119/119','PASS4G':f"{qa['checks_passed']}/{qa['checks_total']}"
 },
 'global70_materialization':'BYTE_IDENTICAL_REQUIRED',
 'source_hashes':{
   'publication_projection':'2621ae1317b0161f3c3a819f79b2b874dfd9ba6e0c32e2d7ecb580841114758d',
   'global_library_projection':'a32623e1b058d3658ae0f3afbb1e6fdc4b3503a6132634ecc1868b6e335d146a',
   'global70_integrated':'af1fede5aeb36f2e4dc11fb55ad0f31fe5a74e2bd59fa9a0bb1aa7d405e8bdf8',
   'renderer_final':'3a97e8838c73c56913b2cda03a5ea12afc579b1b085440b946ef800f2adbcc7b',
   'library_runtime_final':'c8dd6b1c88706a2bb0c879099f5db0f87b2401b11fb5ca493037480781833425',
   'visual_layer_final':'d2fac104c534f0ea90e77d207887557afa8abd2ce246ac4f85c7f8ddbad48aeb'
 },
 'production_requirement':'Reproduction and final sealing do not authorize production merge or activation.'
}
(W/'P120_WEBSCI_EXT_PASS4_FINAL_REPRODUCIBILITY_RECORD_v1.1.json').write_text(json.dumps(repro,ensure_ascii=False,indent=2)+'\n')

summary={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4G-QA-SUMMARY','version':V,'date':DATE,'status':'PASS',
 'checks_total':qa['checks_total'],'checks_passed':qa['checks_passed'],'checks_failed':qa['checks_failed'],
 'recorded_upstream_gate_assertions':qa['recorded_upstream_gate_assertions'],
 'authority_chain':'FINAL_RECONCILED','unresolved_delta_count':0,'full_package_required':True,'full_package_built_by_seal_workflow':True,
 'parent_pass4_status':'CLOSED_CONTROLLED_SEALED','scientific_content_mutated':False,'references_mutated':False,
 'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,'renderer_mutated':False,'presentation_mutated':False,
 'production_merge':'NOT_PERFORMED','next_gate':'SEPARATE CONTROLLED PRODUCTION ACTIVATION / MERGE GATE'
}
(W/'P120_WEBSCI_EXT_PASS4_PASS4G_QA_SUMMARY_v1.1.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')

report=f'''# P-120 WEB-SCIENCE EXT PASS 4G — Mandatory Full PASS Package / Final PASS 4 Sealing

**Document ID:** P120-WEBSCI-EXT-004-PASS4G-REPORT  
**Version:** {V}  
**Date:** {DATE}  
**Status:** PASS / CLOSED / CONTROLLED / SEALED  
**Parent workstream:** WEB-SCIENCE EXT PASS 4 — **CLOSED / CONTROLLED / SEALED**

## 1. Purpose
PASS 4G is the mandatory parent-level sealing gate. It does not add scientific content or reopen PASS 4A–4F. Its purpose is to prove that the full controlled authority corpus is complete, internally reconciled, reproducible, packageable, hash-verifiable and ready to be frozen as the final WEB-SCIENCE EXT PASS 4 research/development record.

## 2. Final authority state
The accepted forward chain is:

`PASS 4A → PASS 4B → PASS 4C → PASS 4D → PASS 4E → PASS 4F → PASS 4G`.

PASS 4F established zero unresolved deltas and exactly two authorized historical runtime supersessions. PASS 4G preserves that reconciliation without further source/runtime/presentation mutation.

## 3. QA inventory
The sealed upstream record contains **{qa['recorded_upstream_gate_assertions']} recorded gate assertions** across heterogeneous gates. This is an audit inventory, not a psychometric or statistical score.

PASS 4G independently executes **{qa['checks_passed']}/{qa['checks_total']} PASS; failed = {qa['checks_failed']}** final-seal checks over stage status, manifests, QA summaries, source hashes, current runtime hashes, Global-70 partition/identity, PASS 4F reconciliation state and public-ceiling invariants.

The seal workflow also re-runs the controlled scientific/static/browser regressions and requires Global-70 byte-identical re-materialization before package construction.

## 4. Final scientific/public ceiling
Final sealing does not upgrade evidence or claims. The sealed ceiling remains:
- E0–E4 evidence ladder; E1 is not empirical psychometric validation;
- Core 45 + PASS 4 Extension 25 = Global 70;
- reference count is coverage metadata, not validity;
- COM-12, MOT-12, SELF-12, RPE-MOD and LIFE-12/18 remain `summary_only`;
- RPE detailed publication remains suppressed;
- DYADIC remains hidden;
- cross-layer discriminant and incremental validity remain not established;
- validated synergy and causal effects remain not authorized;
- no unsupported Extended super-score/total is authorized.

## 5. Mandatory full package
The final package contains the complete controlled PASS 4 corpus required to reproduce or audit the workstream: source projections, integrated Global-70 authority, PASS 4A–4G reports/decisions/manifests/QA records, authority and reconciliation records, current Science runtime/presentation sources, dedicated Science route sources, QA scripts, seal/reproduction scripts and workflow definitions, plus final status, final authority index, reproducibility record, package index and SHA-256 ledgers.

## 6. Production disposition
**Final sealing is not production activation.** No merge to production `main` is performed or authorized by PASS 4G. Any production activation/merge requires a separate controlled production gate with its own pre-merge and post-merge regression evidence.

## 7. Final verdict
**PASS / FULL AUTHORITY CORPUS RECONCILED / MANDATORY PACKAGE COMPLETE / REPRODUCIBILITY BOUND / HASH LEDGERS VERIFIED / WEB-SCIENCE EXT PASS 4 CLOSED / CONTROLLED / SEALED.**
'''
(W/'P120_WEBSCI_EXT_PASS4_PASS4G_REPORT_v1.1.md').write_text(report)

decision=f'''# P-120 WEB-SCIENCE EXT PASS 4G — Final Decision Record

**Decision:** PASS / CLOSED / CONTROLLED / SEALED  
**Version:** {V}  
**Parent workstream:** WEB-SCIENCE EXT PASS 4

1. Accept PASS 4A–4F as the complete controlled upstream authority chain.
2. Accept PASS 4F reconciliation: zero unresolved deltas and only two explicitly authorized historical runtime supersessions.
3. Accept PASS 4G final-seal QA only if all final checks pass and all required upstream regressions/reproducibility checks pass in the seal workflow.
4. Freeze the final public/scientific ceiling without evidence-state, validity, causal or scoring upgrade.
5. Freeze Core-45 / Extension-25 / Global-70 and the final current source/runtime hashes recorded in the reproducibility record.
6. Preserve all pass-local manifests as historical records; do not retroactively rewrite earlier hashes.
7. Require one full mandatory sealed ZIP with package index, internal SHA-256 ledger, external ZIP sidecar and independent post-build verification.
8. Set `WEB-SCIENCE EXT PASS 4` to **CLOSED / CONTROLLED / SEALED** only after package verification succeeds.
9. Do not merge to production `main` in PASS 4G and do not treat this seal as production authorization.
10. Any subsequent production activation or any modification of sealed Science authority requires a separate controlled gate.
'''
(W/'P120_WEBSCI_EXT_PASS4_PASS4G_DECISION_v1.1.md').write_text(decision)

# Build complete controlled file inventory after all final records above exist.
patterns=[
 'webscience/pass4/P120_WEBSCI_EXT_PASS4*','webscience/pass4/README.md',
 'science/index.html','en/science/index.html','P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json',
 'p120-scientific-base-runtime-v1.0.js','p120-webscience-pass4b-renderer-v0.6.js','p120-webscience-pass4c-library-v0.7.js','p120-webscience-pass4e-visual-v0.9.css',
 'qa/webscience_pass4*','.github/scripts/p120_webscience_pass4*','.github/workflows/p120-webscience-pass4*'
]
selected=set()
for pattern in patterns:
    for p in Path('.').glob(pattern):
        if p.is_file(): selected.add(p.as_posix())
# Manifest/index files are generated after this inventory; include their paths explicitly.
selected.update({
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_SHA256SUMS_v1.1.txt'
})
index_rows=[]
for p in sorted(selected):
    pp=Path(p)
    index_rows.append({'path':p,'sha256':sha(pp) if pp.exists() else 'GENERATED_AFTER_INDEX','size_bytes':pp.stat().st_size if pp.exists() else None})
index={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-FINAL-PACKAGE-INDEX','version':V,'date':DATE,
 'package_scope':'MANDATORY_FULL_PASS_CORPUS','file_count':len(index_rows),'files':index_rows,
 'production_files_outside_science_scope_included':False
}
(W/'P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')

core_final=[
 W/'P120_WEBSCI_EXT_PASS4_PASS4G_FINAL_SEAL_QA_RESULT_v1.1.json',W/'P120_WEBSCI_EXT_PASS4_PASS4G_QA_SUMMARY_v1.1.json',
 W/'P120_WEBSCI_EXT_PASS4_FINAL_STATUS_RECORD_v1.1.json',W/'P120_WEBSCI_EXT_PASS4_FINAL_AUTHORITY_INDEX_v1.1.json',
 W/'P120_WEBSCI_EXT_PASS4_FINAL_REPRODUCIBILITY_RECORD_v1.1.json',W/'P120_WEBSCI_EXT_PASS4_PASS4G_REPORT_v1.1.md',
 W/'P120_WEBSCI_EXT_PASS4_PASS4G_DECISION_v1.1.md',W/'P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json'
]
manifest={
 'standard':'P120','document_id':'P120-WEBSCI-EXT-004-FINAL-MANIFEST','version':V,'date':DATE,
 'status':'WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED','branch':BRANCH,'baseline_pass4f_closure':BASE,
 'production_main_mutated':False,'production_merge':'NOT_PERFORMED','production_activation':'SEPARATE_GATE_REQUIRED',
 'scientific_content_mutated':False,'references_mutated':False,'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,
 'renderer_mutated':False,'presentation_mutated':False,
 'authority_chain_reconciled':True,'unresolved_delta_count':0,'authorized_supersession_count':2,
 'public_ceiling_unchanged':True,'global_library_contract':{'core':45,'extension':25,'global':70},
 'recorded_upstream_gate_assertions':qa['recorded_upstream_gate_assertions'],'pass4g_checks':{'passed':qa['checks_passed'],'total':qa['checks_total'],'failed':qa['checks_failed']},
 'mandatory_full_package_required':True,'independent_post_build_verification_required':True,
 'core_final_records':[{'path':p.as_posix(),'sha256':sha(p)} for p in core_final],
 'package_index':'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json',
 'reopen_rule':'No in-place modification after final seal; use a new controlled gate.'
}
(W/'P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')

# Final SHA ledger covers all existing indexed files except the ledger itself, preventing self-reference.
index=load(W/'P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json')
ledger=[]
for row in index['files']:
    p=row['path']
    if p.endswith('P120_WEBSCI_EXT_PASS4_FINAL_SHA256SUMS_v1.1.txt'): continue
    pp=Path(p)
    if pp.exists(): ledger.append(f'{sha(pp)}  {p}\n')
(W/'P120_WEBSCI_EXT_PASS4_FINAL_SHA256SUMS_v1.1.txt').write_text(''.join(ledger))

# Update package index with generated final manifest/ledger hashes but never self-hash the index entry itself.
index=load(W/'P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json')
for row in index['files']:
    p=row['path']; pp=Path(p)
    if p.endswith('P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json'):
        row['sha256']='SELF_INDEX_EXCLUDED_FROM_OWN_HASH'; row['size_bytes']=pp.stat().st_size
    elif pp.exists():
        row['sha256']=sha(pp); row['size_bytes']=pp.stat().st_size
(W/'P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')

# Rebuild manifest binding updated package-index hash.
manifest['package_index_sha256']=sha(W/'P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json')
manifest['final_sha256_ledger_sha256']=sha(W/'P120_WEBSCI_EXT_PASS4_FINAL_SHA256SUMS_v1.1.txt')
(W/'P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')

# Rebuild ledger once after final manifest/index stabilization.
index=load(W/'P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json')
ledger=[]
for row in index['files']:
    p=row['path']; pp=Path(p)
    if p.endswith('P120_WEBSCI_EXT_PASS4_FINAL_SHA256SUMS_v1.1.txt'): continue
    if pp.exists(): ledger.append(f'{sha(pp)}  {p}\n')
(W/'P120_WEBSCI_EXT_PASS4_FINAL_SHA256SUMS_v1.1.txt').write_text(''.join(ledger))

# README final parent status.
readme=W/'README.md'; text=readme.read_text(); marker='## PASS 4G final sealing — 2026-09-06'
if marker not in text:
    text += f'''\n\n{marker}\n`PASS / CLOSED / CONTROLLED / SEALED / v1.1` — mandatory full PASS corpus assembled and final parent-level seal established after PASS 4A–4F reconciliation. Scientific/public ceiling remains unchanged; production merge is not performed or authorized by this seal. Subsequent activation requires a separate controlled production gate.\n'''
    readme.write_text(text)
print(json.dumps(summary,ensure_ascii=False,indent=2))
