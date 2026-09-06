from pathlib import Path
import hashlib

TARGET=Path('p120-webscience-pass4c-library-v0.7.js')
EXPECTED='902a124ac0f41b7de5a5f33b67780cb232350d836aaa5d1a918f4f81439e2a4d'
MARK="link.dataset.p120WebsciencePass4eLoader='v0.9'"
BLOCK=r'''

/* WEB-SCIENCE EXT PASS 4E — controlled Science visual QA stylesheet loader.
   PASS 4C library logic above remains unchanged except for this exact additive loader. */
(()=>{
  'use strict';
  const dedicated=/(?:^|\/)(?:en\/)?science\/?(?:index\.html)?$/i.test(location.pathname);
  if(!dedicated)return;
  if(document.querySelector('[data-p120-webscience-pass4e-loader]'))return;
  const owner=document.currentScript;
  const ownerUrl=owner?.src||new URL('p120-webscience-pass4c-library-v0.7.js',location.href).href;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=new URL('p120-webscience-pass4e-visual-v0.9.css?v=websci4e09',ownerUrl).href;
  link.dataset.p120WebsciencePass4eLoader='v0.9';
  link.addEventListener('load',()=>{
    document.documentElement.dataset.p120WebsciencePass4e='visual-v0.9';
    document.documentElement.dataset.p120WebsciencePass4eStatus='pass';
    dispatchEvent(new CustomEvent('p120:webscience-pass4e-ready',{detail:{pass:true,version:'0.9'}}));
  },{once:true});
  link.addEventListener('error',()=>{
    document.documentElement.dataset.p120WebsciencePass4eStatus='fail';
    console.error('[P120 WEB-SCIENCE PASS 4E] visual stylesheet load failed');
    dispatchEvent(new CustomEvent('p120:webscience-pass4e-ready',{detail:{pass:false,version:'0.9'}}));
  },{once:true});
  document.head.appendChild(link);
})();
'''

raw=TARGET.read_bytes()
text=raw.decode('utf-8')
if MARK in text:
    print('PASS 4E exact additive loader already present')
else:
    actual=hashlib.sha256(raw).hexdigest()
    if actual != EXPECTED:
        raise SystemExit(f'PASS 4C authority hash mismatch before PASS 4E loader: {actual}')
    TARGET.write_text(text.rstrip()+BLOCK.rstrip()+'\n',encoding='utf-8')
    print('PASS 4E exact additive visual loader applied')
