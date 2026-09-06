from pathlib import Path
import json, hashlib

V='v1.1'; DATE='2026-09-06'; BASE='1155a78646a314e3693aa7b247e667b86507a1d4'
BRANCH='web-science-ext-pass4g-final-sealing'; W=Path('webscience/pass4'); E=Path('qa-evidence-webscience-pass4g')
Q=E/'P120_WEBSCI_EXT_PASS4_PASS4G_FINAL_SEAL_QA_RESULT_v1.1.json'
qa=json.loads(Q.read_text())
if qa.get('status')!='PASS' or qa.get('checks_failed')!=0: raise SystemExit('PASS 4G final seal QA is not fully PASS')
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def writej(name,obj): (W/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')

(W/Q.name).write_bytes(Q.read_bytes())

status={'standard':'P120','document_id':'P120-WEBSCI-EXT-004-FINAL-STATUS','version':V,'date':DATE,
'workstream':'WEB-SCIENCE EXT PASS 4','status':'CLOSED_CONTROLLED_SEALED','verdict':'PASS','final_sealing_gate':'PASS 4G','baseline_pass4f_closure':BASE,
'subpasses':{x:'CLOSED_CONTROLLED_SEALED' for x in ['PASS4A','PASS4B','PASS4C','PASS4D','PASS4E','PASS4F','PASS4G']},
'recorded_upstream_gate_assertions':qa['recorded_upstream_gate_assertions'],'pass4g_final_seal_checks':f"{qa['checks_passed']}/{qa['checks_total']} PASS",
'scientific_content_mutated_in_PASS4G':False,'references_mutated_in_PASS4G':False,'measurement_mutated_in_PASS4G':False,'scoring_mutated_in_PASS4G':False,'thresholds_mutated_in_PASS4G':False,'renderer_mutated_in_PASS4G':False,'presentation_mutated_in_PASS4G':False,
'production_merge':'NOT_PERFORMED','production_activation':'NOT_AUTHORIZED_BY_SEALING','production_activation_disposition':'SEPARATE_CONTROLLED_PRODUCTION_GATE_REQUIRED','public_ceiling':'UNCHANGED_FROM_PASS4A_TO_PASS4F_AUTHORITY',
'reopen_rule':'No in-place mutation after final seal; any change requires a new controlled gate.'}
writej('P120_WEBSCI_EXT_PASS4_FINAL_STATUS_RECORD_v1.1.json',status)

authority={'standard':'P120','document_id':'P120-WEBSCI-EXT-004-FINAL-AUTHORITY-INDEX','version':V,'date':DATE,'authority_model':'FORWARD_ONLY / PASS_LOCAL_HISTORY_PRESERVED / CURRENT_STATE_BOUND_AT_FINAL_SEAL',
'stages':[
{'stage':'PASS4A','version':'v0.5','closure':'a775606fcbe061f27184c1800cc5f5bf15f84679','post_package_head':'2759e288fec90064858fb99b137c07e6505f6257','role':'RU_EN_PUBLICATION_PROJECTION','qa':'2970/2970'},
{'stage':'PASS4B','version':'v0.6','closure':'9d07a3a047ce4b9a61b6f307e3f791fcdfabaff4','role':'CONTROLLED_RENDERER_ACTIVATION','qa':'198/198'},
{'stage':'PASS4C','version':'v0.7','closure':'211c0f4f0d2601c46bc2d4d283ade84aee474c47','role':'CORE45_GLOBAL70_LIBRARY_INTEGRATION','qa':'88/88'},
{'stage':'PASS4D','version':'v0.8','closure':'89683b678b76dde7df1cdeccc05d6e8541573b5b','role':'CLAIM_BOUNDARY_AND_RU_EN_PARITY_QA','qa':'448/448 static + 448/448 browser'},
{'stage':'PASS4E','version':'v0.9','closure':'cd71bf494f72090e0a81cfd3702fd6049ab89bb0','role':'BROWSER_RESPONSIVE_TYPOGRAPHY_QA','qa':'952/952'},
{'stage':'PASS4F','version':'v1.0','closure':BASE,'role':'CLOSURE_RECONCILIATION','qa':'119/119'},
{'stage':'PASS4G','version':V,'closure':'TO_BE_BOUND_BY_CLOSURE_COMMIT','role':'MANDATORY_FULL_PASS_PACKAGE_AND_FINAL_PARENT_SEAL','qa':f"{qa['checks_passed']}/{qa['checks_total']}"}],
'authorized_historical_supersessions':[{'path':'p120-webscience-pass4b-renderer-v0.6.js','authority':'PASS4C'},{'path':'p120-webscience-pass4c-library-v0.7.js','authority':'PASS4E'}],
'unresolved_delta_count':0,'production_main_merge':'NOT_PERFORMED'}
writej('P120_WEBSCI_EXT_PASS4_FINAL_AUTHORITY_INDEX_v1.1.json',authority)

repro={'standard':'P120','document_id':'P120-WEBSCI-EXT-004-FINAL-REPRODUCIBILITY','version':V,'date':DATE,'baseline_pass4f_closure':BASE,
'required_environment':{'python':'3.x','node':'20.x compatible','playwright':'1.55.0','browser':'Chromium'},
'reproduction_sequence':['node qa/webscience_pass4a_projection_gate_v0.5.mjs','node qa/webscience_pass4c_materialize_global_library_v0.7.mjs + require zero diff','node qa/webscience_pass4d_claim_boundary_static_gate_v0.8.mjs','node qa/webscience_pass4c_library_gate_v0.7.mjs','node qa/webscience_pass4d_claim_boundary_browser_gate_v0.8.mjs','node qa/webscience_pass4e_browser_typography_gate_v0.9.mjs','python3 qa/webscience_pass4f_closure_reconciliation_gate_v1.0.py','python3 qa/webscience_pass4g_final_seal_gate_v1.1.py'],
'expected_results':{'PASS4A':'2970/2970','PASS4C_browser':'88/88','PASS4D_static':'448/448','PASS4D_browser':'448/448','PASS4E':'952/952','PASS4F':'119/119','PASS4G':f"{qa['checks_passed']}/{qa['checks_total']}"},
'global70_materialization':'BYTE_IDENTICAL_REQUIRED','source_hashes':{'publication_projection':'2621ae1317b0161f3c3a819f79b2b874dfd9ba6e0c32e2d7ecb580841114758d','global_library_projection':'a32623e1b058d3658ae0f3afbb1e6fdc4b3503a6132634ecc1868b6e335d146a','global70_integrated':'af1fede5aeb36f2e4dc11fb55ad0f31fe5a74e2bd59fa9a0bb1aa7d405e8bdf8','renderer_final':'3a97e8838c73c56913b2cda03a5ea12afc579b1b085440b946ef800f2adbcc7b','library_runtime_final':'c8dd6b1c88706a2bb0c879099f5db0f87b2401b11fb5ca493037480781833425','visual_layer_final':'d2fac104c534f0ea90e77d207887557afa8abd2ce246ac4f85c7f8ddbad48aeb'},
'production_requirement':'Reproduction and final sealing do not authorize production merge or activation.'}
writej('P120_WEBSCI_EXT_PASS4_FINAL_REPRODUCIBILITY_RECORD_v1.1.json',repro)

summary={'standard':'P120','document_id':'P120-WEBSCI-EXT-004-PASS4G-QA-SUMMARY','version':V,'date':DATE,'status':'PASS','checks_total':qa['checks_total'],'checks_passed':qa['checks_passed'],'checks_failed':qa['checks_failed'],'recorded_upstream_gate_assertions':qa['recorded_upstream_gate_assertions'],'authority_chain':'FINAL_RECONCILED','unresolved_delta_count':0,'parent_pass4_status':'CLOSED_CONTROLLED_SEALED','scientific_content_mutated':False,'references_mutated':False,'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,'renderer_mutated':False,'presentation_mutated':False,'production_merge':'NOT_PERFORMED','next_gate':'SEPARATE CONTROLLED PRODUCTION ACTIVATION / MERGE GATE'}
writej('P120_WEBSCI_EXT_PASS4_PASS4G_QA_SUMMARY_v1.1.json',summary)

(W/'P120_WEBSCI_EXT_PASS4_PASS4G_REPORT_v1.1.md').write_text(f'''# P-120 WEB-SCIENCE EXT PASS 4G — Mandatory Full PASS Package / Final PASS 4 Sealing\n\n**Version:** {V}  \n**Date:** {DATE}  \n**Status:** PASS / CLOSED / CONTROLLED / SEALED  \n**Parent:** WEB-SCIENCE EXT PASS 4 — **CLOSED / CONTROLLED / SEALED**\n\n## Purpose\nPASS 4G is the mandatory parent-level seal. It adds no scientific content and reopens no upstream adjudication. It proves completeness, reconciliation, reproducibility and package integrity for PASS 4A–4F and freezes the current controlled Science authority.\n\n## QA\nUpstream audit inventory: **{qa['recorded_upstream_gate_assertions']} recorded gate assertions** across heterogeneous gates; this is an audit count, not a scientific metric. PASS 4G final seal QA: **{qa['checks_passed']}/{qa['checks_total']} PASS; 0 failed**. The seal workflow also re-runs scientific/static/browser regressions and byte-identical Global-70 materialization before packaging.\n\n## Frozen ceiling\nE0–E4 preserved; E1 is not empirical psychometric validation; Core45 + Extension25 = Global70; reference count is not validity; projected modules remain `summary_only`; RPE detail suppressed; DYADIC hidden; cross-layer discriminant/incremental validity not established; validated synergy and causal effects not authorized; no unsupported Extended total/super-score.\n\n## Production disposition\nFinal sealing is **not** production activation. `main` is not merged or authorized for merge by PASS 4G. Production activation requires a separate controlled gate with pre/post-merge regression evidence.\n\n## Verdict\n**PASS / FULL AUTHORITY CORPUS RECONCILED / MANDATORY PACKAGE COMPLETE / REPRODUCIBILITY BOUND / WEB-SCIENCE EXT PASS 4 CLOSED / CONTROLLED / SEALED.**\n''')
(W/'P120_WEBSCI_EXT_PASS4_PASS4G_DECISION_v1.1.md').write_text(f'''# P-120 WEB-SCIENCE EXT PASS 4G — Final Decision Record\n\n**Decision:** PASS / CLOSED / CONTROLLED / SEALED  \n**Version:** {V}\n\n1. Accept PASS 4A–4F as the complete controlled upstream authority chain.\n2. Accept PASS 4F reconciliation: zero unresolved deltas and exactly two authorized historical runtime supersessions.\n3. Freeze the scientific/public ceiling with no validity, causal, evidence-state or scoring upgrade.\n4. Freeze Core45 / Extension25 / Global70 and the current source/runtime hashes in the reproducibility record.\n5. Preserve pass-local manifests as historical records.\n6. Require one sealed mandatory full PASS ZIP, internal SHA ledger, external sidecar and independent post-build verification.\n7. Set WEB-SCIENCE EXT PASS 4 to CLOSED / CONTROLLED / SEALED only after package verification succeeds.\n8. Do not merge or activate production in PASS 4G. Subsequent activation requires a separate controlled gate.\n''')

# Final README mutation occurs before package inventory/hash construction.
readme=W/'README.md'; text=readme.read_text(); marker='## PASS 4G final sealing — 2026-09-06'
if marker not in text:
    text += f'''\n\n{marker}\n`PASS / CLOSED / CONTROLLED / SEALED / v1.1` — mandatory full PASS corpus reconciled, reproduced and sealed. Scientific/public ceiling remains unchanged. Production merge/activation is not authorized by this seal and requires a separate controlled production gate.\n'''
    readme.write_text(text)

patterns=['webscience/pass4/P120_WEBSCI_EXT_PASS4*','webscience/pass4/README.md','science/index.html','en/science/index.html','P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json','p120-scientific-base-runtime-v1.0.js','p120-webscience-pass4b-renderer-v0.6.js','p120-webscience-pass4c-library-v0.7.js','p120-webscience-pass4e-visual-v0.9.css','qa/webscience_pass4*','.github/scripts/p120_webscience_pass4*','.github/workflows/p120-webscience-pass4*']
selected=set()
for pat in patterns:
    for p in Path('.').glob(pat):
        if p.is_file(): selected.add(p.as_posix())
selected.update({'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json','webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json','webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_SHA256SUMS_v1.1.txt'})
index={'standard':'P120','document_id':'P120-WEBSCI-EXT-004-FINAL-PACKAGE-INDEX','version':V,'date':DATE,'package_scope':'MANDATORY_FULL_PASS_CORPUS','file_count':len(selected),'files':sorted(selected)}
writej('P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json',index)

core=['P120_WEBSCI_EXT_PASS4_PASS4G_FINAL_SEAL_QA_RESULT_v1.1.json','P120_WEBSCI_EXT_PASS4_PASS4G_QA_SUMMARY_v1.1.json','P120_WEBSCI_EXT_PASS4_FINAL_STATUS_RECORD_v1.1.json','P120_WEBSCI_EXT_PASS4_FINAL_AUTHORITY_INDEX_v1.1.json','P120_WEBSCI_EXT_PASS4_FINAL_REPRODUCIBILITY_RECORD_v1.1.json','P120_WEBSCI_EXT_PASS4_PASS4G_REPORT_v1.1.md','P120_WEBSCI_EXT_PASS4_PASS4G_DECISION_v1.1.md','P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json']
manifest={'standard':'P120','document_id':'P120-WEBSCI-EXT-004-FINAL-MANIFEST','version':V,'date':DATE,'status':'WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED','branch':BRANCH,'baseline_pass4f_closure':BASE,'production_main_mutated':False,'production_merge':'NOT_PERFORMED','production_activation':'SEPARATE_GATE_REQUIRED','scientific_content_mutated':False,'references_mutated':False,'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,'renderer_mutated':False,'presentation_mutated':False,'authority_chain_reconciled':True,'unresolved_delta_count':0,'authorized_supersession_count':2,'public_ceiling_unchanged':True,'global_library_contract':{'core':45,'extension':25,'global':70},'recorded_upstream_gate_assertions':qa['recorded_upstream_gate_assertions'],'pass4g_checks':{'passed':qa['checks_passed'],'total':qa['checks_total'],'failed':qa['checks_failed']},'mandatory_full_package_required':True,'independent_post_build_verification_required':True,'core_final_records':[{'path':f'webscience/pass4/{n}','sha256':sha(W/n)} for n in core],'package_index_sha256':sha(W/'P120_WEBSCI_EXT_PASS4_FINAL_PACKAGE_INDEX_v1.1.json'),'internal_sha_ledger':'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_SHA256SUMS_v1.1.txt','reopen_rule':'No in-place mutation after final seal; use a new controlled gate.'}
writej('P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json',manifest)

# Acyclic final ledger: hashes all indexed existing files except itself. Nothing is mutated after this point.
ledger=[]
for p in sorted(selected):
    if p.endswith('P120_WEBSCI_EXT_PASS4_FINAL_SHA256SUMS_v1.1.txt'): continue
    pp=Path(p)
    if not pp.exists(): raise SystemExit(f'Indexed package file missing: {p}')
    ledger.append(f'{sha(pp)}  {p}\n')
(W/'P120_WEBSCI_EXT_PASS4_FINAL_SHA256SUMS_v1.1.txt').write_text(''.join(ledger))
print(json.dumps(summary,ensure_ascii=False,indent=2))
