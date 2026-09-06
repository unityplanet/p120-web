from pathlib import Path
import json, re, sys

ROOT=Path('.')
OUT=ROOT/'qa-evidence-webscience-prod-g1-actions'
OUT.mkdir(parents=True,exist_ok=True)
WF=ROOT/'.github/workflows'
ALLOW={'p120-en-system-build-v0.4.yml'}
checks=[]; failures=[]

def ck(cid, ok, detail=None):
    row={'id':cid,'pass':bool(ok)}
    if detail is not None: row['detail']=detail
    checks.append(row)
    if not ok: failures.append(row)

files=sorted(WF.glob('*.yml'))
writes=[]; pushes=[]; privileged=[]
for p in files:
    text=p.read_text(encoding='utf-8')
    if re.search(r'(?m)^\s*contents:\s*write\s*$',text): writes.append(p.name)
    if re.search(r'(?m)^\s*git\s+push\b',text): pushes.append(p.name)
    if 'pull_request_target:' in text: privileged.append(f'{p.name}:pull_request_target')
    if re.search(r'(?m)^\s*(pages|id-token):\s*write\s*$',text): privileged.append(f'{p.name}:deployment-write')

ck('workflow inventory resolves',len(files)>0,{'count':len(files)})
ck('contents write exact temporary allowlist',set(writes)==ALLOW,{'observed':writes,'expected':sorted(ALLOW)})
ck('git push exact temporary allowlist',set(pushes)==ALLOW,{'observed':pushes,'expected':sorted(ALLOW)})
ck('no privileged PR or deployment write trigger',not privileged,{'violations':privileged})
for retired in [
 'p120-webscience-pass4a-seal.yml','p120-webscience-pass4b-seal.yml','p120-webscience-pass4c-seal.yml',
 'p120-webscience-pass4d-seal.yml','p120-webscience-pass4e-seal.yml','p120-webscience-pass4f-seal.yml',
 'p120-webscience-pass4g-final-seal.yml']:
    ck(f'retired writer absent: {retired}',not (WF/retired).exists())

result={
 'standard':'P120','document_id':'P120-WEBSCI-PROD-G1-ACTIONS-GOVERNANCE-QA','version':'v1.0','date':'2026-09-06',
 'control':'SEC-GH-02','status':'PASS' if not failures else 'FAIL',
 'checks_total':len(checks),'checks_passed':len(checks)-len(failures),'checks_failed':len(failures),
 'workflow_count':len(files),'contents_write':writes,'git_push':pushes,'active_write_allowlist':sorted(ALLOW),
 'retired_pass4_writer_count':7,'checks':checks,'failures':failures,
 'scientific_content_mutated':False,'measurement_mutated':False,'scoring_mutated':False,'session_mutated':False
}
(OUT/'P120_WEBSCI_PROD_G1_ACTIONS_GOVERNANCE_QA_v1.0.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checks_total':result['checks_total'],'checks_failed':result['checks_failed'],'workflow_count':result['workflow_count']},indent=2))
if failures: sys.exit(1)
