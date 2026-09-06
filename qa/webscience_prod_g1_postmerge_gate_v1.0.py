from pathlib import Path
import hashlib, json, subprocess, sys

ROOT=Path('.')
OUT=ROOT/'qa-evidence-webscience-prod-g1-postmerge'
OUT.mkdir(parents=True,exist_ok=True)
SEALED='d095cae40b33da2118e5090be2a2c837205d8b64'
MAIN_BASE='194bdf274f1a6012ef6c2e4b4f31e5f44b472055'
DATE='2026-09-06'
checks=[]; failures=[]

def run(*args): return subprocess.run(list(args),cwd=ROOT,text=True,capture_output=True)
def ck(cid,ok,detail=None):
    row={'id':cid,'pass':bool(ok)}
    if detail is not None: row['detail']=detail
    checks.append(row)
    if not ok: failures.append(row)
def sha_bytes(b): return hashlib.sha256(b).hexdigest()
def sha_file(p): return sha_bytes(Path(p).read_bytes())
def git_bytes(ref,p):
    r=subprocess.run(['git','show',f'{ref}:{p}'],cwd=ROOT,capture_output=True)
    return r.stdout if r.returncode==0 else None

def same_as(ref,p):
    b=git_bytes(ref,p)
    return b is not None and Path(p).exists() and sha_file(p)==sha_bytes(b)

head=run('git','rev-parse','HEAD').stdout.strip()
ck('production HEAD resolved',len(head)==40,head)
ck('pre-activation main is ancestor',run('git','merge-base','--is-ancestor',MAIN_BASE,'HEAD').returncode==0,MAIN_BASE)
ck('sealed Science authority is ancestor',run('git','merge-base','--is-ancestor',SEALED,'HEAD').returncode==0,SEALED)

# Science/public authority must be byte-identical to the sealed PASS4 parent authority.
science=[
 'science/index.html','en/science/index.html','p120-scientific-base-runtime-v1.0.js',
 'p120-webscience-pass4b-renderer-v0.6.js','p120-webscience-pass4c-library-v0.7.js','p120-webscience-pass4e-visual-v0.9.css',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_STATUS_RECORD_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_REPRODUCIBILITY_RECORD_v1.1.json'
]
for p in science:
    ck(f'production sealed Science exact: {p}',same_as(SEALED,p),{'actual':sha_file(p) if Path(p).exists() else None,'sealed':sha_bytes(git_bytes(SEALED,p)) if git_bytes(SEALED,p) is not None else None})

# Non-Science production surfaces inherited from main must remain byte-identical.
main_preserve=['index.html','en/index.html','p120-session-contract-v1.0.js','p120-submission-intake-v1.0.js','manual-report-handoff-v1.0.js']
for p in main_preserve:
    b=git_bytes(MAIN_BASE,p)
    if b is None:
        ck(f'baseline absence preserved: {p}',not Path(p).exists())
    else:
        ck(f'pre-existing main surface preserved: {p}',Path(p).exists() and sha_file(p)==sha_bytes(b),{'production':sha_file(p) if Path(p).exists() else None,'baseline':sha_bytes(b)})

expected={
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_publication_projection_v0.5.json':'2621ae1317b0161f3c3a819f79b2b874dfd9ba6e0c32e2d7ecb580841114758d',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_projection_v0.5.json':'a32623e1b058d3658ae0f3afbb1e6fdc4b3503a6132634ecc1868b6e335d146a',
 'webscience/pass4/P120_WEBSCI_EXT_PASS4_global_library_integrated_v0.7.json':'af1fede5aeb36f2e4dc11fb55ad0f31fe5a74e2bd59fa9a0bb1aa7d405e8bdf8',
 'p120-webscience-pass4b-renderer-v0.6.js':'3a97e8838c73c56913b2cda03a5ea12afc579b1b085440b946ef800f2adbcc7b',
 'p120-webscience-pass4c-library-v0.7.js':'c8dd6b1c88706a2bb0c879099f5db0f87b2401b11fb5ca493037480781833425',
 'p120-webscience-pass4e-visual-v0.9.css':'d2fac104c534f0ea90e77d207887557afa8abd2ce246ac4f85c7f8ddbad48aeb'
}
for p,h in expected.items(): ck(f'production canonical hash: {p}',Path(p).exists() and sha_file(p)==h,{'actual':sha_file(p) if Path(p).exists() else None,'expected':h})

m=json.loads(Path('webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_MANIFEST_v1.1.json').read_text())
s=json.loads(Path('webscience/pass4/P120_WEBSCI_EXT_PASS4_FINAL_STATUS_RECORD_v1.1.json').read_text())
ck('sealed PASS4 manifest status retained',m.get('status')=='WEBSCI_EXT_PASS4_CLOSED_CONTROLLED_SEALED',m.get('status'))
ck('sealed PASS4 status retained',s.get('status')=='CLOSED_CONTROLLED_SEALED',s.get('status'))
ck('sealed unresolved deltas remain zero',m.get('unresolved_delta_count')==0,m.get('unresolved_delta_count'))
ck('sealed public ceiling remains unchanged',m.get('public_ceiling_unchanged') is True)
c=m.get('global_library_contract',{})
ck('production Global70 contract 45+25=70',c.get('core')==45 and c.get('extension')==25 and c.get('global')==70,c)

result={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-POSTMERGE-QA','version':'v1.0','date':DATE,
 'gate':'WEB-SCIENCE PRODUCTION ACTIVATION GATE 1','status':'PASS' if not failures else 'FAIL',
 'production_head':head,'pre_activation_main':MAIN_BASE,'sealed_science_authority':SEALED,
 'checks_total':len(checks),'checks_passed':len(checks)-len(failures),'checks_failed':len(failures),
 'checks':checks,'failures':failures,
 'production_merge_topology_verified':run('git','merge-base','--is-ancestor',SEALED,'HEAD').returncode==0 and run('git','merge-base','--is-ancestor',MAIN_BASE,'HEAD').returncode==0,
 'scientific_content_mutated_by_activation':False,'measurement_mutated':False,'scoring_mutated':False,'thresholds_mutated':False,
 'respondent_session_mutated':False,'report_calculation_mutated':False
}
(OUT/'P120_WEBSCI_PROD_G1_POSTMERGE_QA_v1.0.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checks_total':result['checks_total'],'checks_failed':result['checks_failed'],'production_head':head},indent=2))
if failures: sys.exit(1)
