from pathlib import Path
import subprocess

BASE='9d07a3a047ce4b9a61b6f307e3f791fcdfabaff4'
PATH=Path('p120-webscience-pass4b-renderer-v0.6.js')
current=PATH.read_text(encoding='utf-8')
original=subprocess.check_output(['git','show',f'{BASE}:p120-webscience-pass4b-renderer-v0.6.js'],text=True)
if current != original:
    raise SystemExit('PASS 4B renderer changed before PASS 4C loader activation')
loader = r'''

/* WEB-SCIENCE EXT PASS 4C — controlled Global-70 library loader.
   PASS 4B renderer above remains unchanged except for this exact additive loader. */
(()=>{
  'use strict';
  const dedicated=/(?:^|\/)(?:en\/)?science\/?(?:index\.html)?$/i.test(location.pathname);
  if(!dedicated)return;
  if(document.querySelector('[data-p120-webscience-pass4c-loader]'))return;
  const owner=document.currentScript;
  const ownerUrl=owner?.src||new URL('p120-webscience-pass4b-renderer-v0.6.js',location.href).href;
  const script=document.createElement('script');
  script.src=new URL('p120-webscience-pass4c-library-v0.7.js?v=websci4c07',ownerUrl).href;
  script.async=false;
  script.dataset.p120WebsciencePass4cLoader='v0.7';
  document.head.appendChild(script);
})();
'''
updated=current+loader
if updated.count('data-p120-webscience-pass4c-loader') != 1:
    raise SystemExit('PASS 4C loader cardinality failure')
PATH.write_text(updated,encoding='utf-8')
if not PATH.read_text(encoding='utf-8').startswith(original+'\n\n/* WEB-SCIENCE EXT PASS 4C'):
    raise SystemExit('PASS 4B renderer changed outside additive loader')
print('Exact additive PASS 4C loader: PASS')
