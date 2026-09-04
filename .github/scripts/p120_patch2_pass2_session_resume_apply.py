from pathlib import Path

path=Path('p120-brand-system-v1.0.js')
text=path.read_text(encoding='utf-8')

old="  const SESSION_KEY = 'p120_web_prototype_v01';"
new="  const SESSION_KEY = isEn ? 'p120_runtime_session_en_v1' : 'p120_runtime_session_ru_v1';"
if text.count(old)!=1:
    raise SystemExit(f'expected exactly one stale SESSION_KEY authority, found {text.count(old)}')
text=text.replace(old,new,1)

anchor="  const pageKind=kind();\n  const isMain=pageKind==='main';\n"
if text.count(anchor)!=1:
    raise SystemExit(f'expected one pageKind/isMain anchor, found {text.count(anchor)}')
loader="""  const pageKind=kind();
  const isMain=pageKind==='main';

  // PATCH 2 / PASS 2 — load the read-only mobile resume bridge only on the
  // locale-matched public Main route. Respondent storage remains System-owned.
  const normalizeResumePath=(value)=>{
    const clean=String(value||'/').replace(/\\/{2,}/g,'/');
    return clean.endsWith('/')?clean:`${clean}/`;
  };
  const publicMainPath=new URL(isEn?'en/':'./',rootUrl).pathname;
  const isPublicMain=normalizeResumePath(location.pathname)===normalizeResumePath(publicMainPath);
  function ensureMobileSessionResume(){
    if(!isPublicMain||document.querySelector('script[data-p120-mobile-session-resume]')) return;
    const runtime=document.createElement('script');
    runtime.src=new URL('mobile-session-resume-v1.0.js?v=1',rootUrl).href;
    runtime.async=false;
    runtime.dataset.p120MobileSessionResume='2.2';
    document.head.appendChild(runtime);
  }
  ensureMobileSessionResume();
"""
text=text.replace(anchor,loader,1)

path.write_text(text,encoding='utf-8')

check=path.read_text(encoding='utf-8')
if "const SESSION_KEY = 'p120_web_prototype_v01';" in check:
    raise SystemExit('stale legacy session authority remains')
for token in ['p120_runtime_session_ru_v1','p120_runtime_session_en_v1','mobile-session-resume-v1.0.js','data-p120-mobile-session-resume']:
    if token not in check:
        raise SystemExit(f'missing required token: {token}')
print('PATCH 2 / PASS 2 controlled brand session-resume reconciliation: READY')
