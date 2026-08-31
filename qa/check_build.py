#!/usr/bin/env python3
from pathlib import Path
from collections import Counter
import hashlib, json, re, sys

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'index.html'
text=HTML.read_text(encoding='utf-8')
errors=[]

def check(cond,msg):
    if not cond: errors.append(msg)

m=re.search(r'window\.P120_INSTRUMENT\s*=\s*(\{.*?\});\s*</script>',text,re.S)
check(bool(m),'P120_INSTRUMENT JSON block not found')
if m:
    inst=json.loads(m.group(1))
    items=inst.get('items',[])
    counts=Counter(x.get('module') for x in items)
    check(len(items)==180,f'Expected 180 items, found {len(items)}')
    check(len({x.get("id") for x in items})==180,'Item IDs are not unique')
    expected={'SAT24':24,'P72':72,'P72D':48,'AO12':12,'SOMA24':24}
    check(dict(counts)==expected,f'Module counts differ: {dict(counts)}')

for token in [
    '@media (min-width:1920px)',
    '@media (min-width:2560px)',
    '@media (min-width:3200px)',
    '@media (min-width:3200px) and (max-height:1600px)',
    ':focus-visible',
    'themeMeta.setAttribute',
    'fonts.bunny.net',
    'id="main-content"',
    "section.id==='why-important'?'h1':'h2'",
]:
    check(token in text,f'Missing production token: {token}')

for banned in ['<span class="brand">P-120 Web</span>','interaction polish · исследовательская платформа','P-120 · автономный preview']:
    check(banned not in text,f'Public identity residue: {banned}')

for f in ['manifest.webmanifest','vercel.json']:
    try: json.load(open(ROOT/f,encoding='utf-8'))
    except Exception as e: errors.append(f'{f} invalid JSON: {e}')

print('P-120 v1.6 static build check')
print('index.html SHA-256:',hashlib.sha256(HTML.read_bytes()).hexdigest())
if errors:
    print('FAIL')
    for e in errors: print('-',e)
    sys.exit(1)
print('PASS')
