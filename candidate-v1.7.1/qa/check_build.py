#!/usr/bin/env python3
from pathlib import Path
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from collections import Counter
import hashlib, json, re, subprocess, sys, tempfile, tomllib
import tinycss2

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'index.html'
errors=[]
notes=[]

def check(cond,msg):
    if not cond: errors.append(msg)

check(HTML.is_file(),'production index.html missing')
if not HTML.is_file():
    print('P-120 v1.7 final static build check\nFAIL\n- production index.html missing')
    raise SystemExit(1)
text=HTML.read_text(encoding='utf-8')
soup=BeautifulSoup(text,'html.parser')

# Frozen instrument structure sanity.
m=re.search(r'window\.P120_INSTRUMENT\s*=\s*(\{.*?\});\s*</script>',text,re.S)
check(bool(m),'P120_INSTRUMENT JSON block not found')
if m:
    inst=json.loads(m.group(1)); items=inst.get('items',[]); counts=Counter(x.get('module') for x in items)
    check(len(items)==180,f'Expected 180 items, found {len(items)}')
    check(len({x.get("id") for x in items})==180,'Item IDs are not unique')
    expected={'SAT24':24,'P72':72,'P72D':48,'AO12':12,'SOMA24':24}
    check(dict(counts)==expected,f'Module counts differ: {dict(counts)}')

# Frozen-block comparison record must be PASS.
lockfile=ROOT/'qa'/'locked_blocks_v1.6.1_vs_v1.7.json'
check(lockfile.is_file(),'locked-block comparison record missing')
if lockfile.is_file():
    lock=json.loads(lockfile.read_text(encoding='utf-8'))
    check(lock.get('locked_block_count')==6,'locked block count is not 6')
    check(lock.get('all_byte_identical') is True,'locked blocks are not byte-identical to v1.6.1')

# v1.7 production identity / semantic theme system tokens.
for token in [
    '--canvas','--surface','--ink-primary','--frame-primary','--orbit-line','--sphere-core',
    '--cta-start','--selection-start',"body[data-theme='ivory']","body[data-theme='graphite']","body[data-theme='museum']",
    ':focus-visible','prefers-reduced-motion','id="main-content"','p120_web_theme_v17'
]:
    check(token in text,f'Missing v1.7 production token: {token}')

# CSS parser integrity.
style_blocks=[s.get_text() for s in soup.find_all('style')]
css_errors=[]
for i,css in enumerate(style_blocks):
    rules=tinycss2.parse_stylesheet(css,skip_comments=False,skip_whitespace=False)
    for r in rules:
        if getattr(r,'type',None)=='error': css_errors.append(f'style[{i}] {r.message}')
check(not css_errors,f'CSS parser errors: {len(css_errors)}' + (': '+css_errors[0] if css_errors else ''))
notes.append(f'CSS parser errors: {len(css_errors)}')

# Local asset integrity and internal anchors.
local_refs=[]
for tag,attr in [('link','href'),('script','src'),('img','src'),('source','src'),('a','href')]:
    for el in soup.find_all(tag):
        v=el.get(attr)
        if not v: continue
        if v.startswith('#'): continue
        u=urlparse(v)
        if u.scheme or v.startswith('//') or v.startswith('data:') or v.startswith('mailto:') or v.startswith('tel:'):
            continue
        clean=v.split('?',1)[0].split('#',1)[0]
        if clean:
            local_refs.append(clean)
missing=sorted({x for x in local_refs if not (ROOT/x).exists()})
check(not missing,'Missing local assets: '+', '.join(missing))
notes.append(f'Missing local assets: {len(missing)}')
ids={x.get('id') for x in soup.find_all(attrs={'id':True})}
broken=[]
for a in soup.find_all('a',href=True):
    h=a['href']
    if h.startswith('#') and len(h)>1 and h[1:] not in ids and f'id=\"{h[1:]}\"' not in text: broken.append(h)
check(not broken,'Broken internal anchors: '+', '.join(sorted(set(broken))))
notes.append(f'Broken internal anchors: {len(set(broken))}')

# Hosting configs.
for f in ['manifest.webmanifest','vercel.json']:
    try: json.loads((ROOT/f).read_text(encoding='utf-8'))
    except Exception as e: errors.append(f'{f} invalid JSON: {e}')
try: tomllib.loads((ROOT/'netlify.toml').read_text(encoding='utf-8'))
except Exception as e: errors.append(f'netlify.toml invalid TOML: {e}')

# All inline JS blocks must parse in Node.
scripts=[]
for s in soup.find_all('script'):
    if s.get('src'): continue
    scripts.append(s.string if s.string is not None else s.get_text())
js_pass=0
for i,code in enumerate(scripts):
    with tempfile.NamedTemporaryFile('w',suffix='.js',encoding='utf-8',delete=False) as fh:
        fh.write(code); path=fh.name
    try:
        r=subprocess.run(['node','--check',path],capture_output=True,text=True)
        if r.returncode==0: js_pass+=1
        else: errors.append(f'Inline JS block {i} syntax FAIL: {r.stderr.strip()}')
    finally:
        Path(path).unlink(missing_ok=True)
notes.append(f'Inline JS syntax: {js_pass}/{len(scripts)} PASS')

# Release-package cleanliness.
for p in ROOT.rglob('*'):
    if not p.is_file(): continue
    n=p.name.lower()
    check('prefinal_backup' not in n and not n.endswith('.bak') and not n.endswith('.tmp') and not n.endswith('~'),f'Backup/temp artifact present: {p.relative_to(ROOT)}')

print('P-120 v1.7 final static build check')
print('index.html SHA-256:',hashlib.sha256(HTML.read_bytes()).hexdigest())
for n in notes: print(n)
if errors:
    print('FAIL')
    for e in errors: print('-',e)
    sys.exit(1)
print('PASS')
