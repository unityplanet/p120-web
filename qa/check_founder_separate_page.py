#!/usr/bin/env python3
from pathlib import Path
import re, sys

root=Path(__file__).resolve().parents[1]
index=(root/'index.html').read_text(encoding='utf-8')
route=(root/'founder-route-v1.1.js').read_text(encoding='utf-8')
creator=(root/'creator'/'index.html').read_text(encoding='utf-8')
story=(root/'founder-editorial-story-v1.0.js').read_text(encoding='utf-8')
css=(root/'founder-editorial-story-v1.0.css').read_text(encoding='utf-8')

errors=[]

def require(cond,msg):
    if not cond: errors.append(msg)

# Main page must carry only the route adapter, never the long Founder Story runtime/CSS.
require('founder-route-v1.1.js' in index,'main page missing Founder route adapter')
require('founder-editorial-story-v1.0.js' not in index,'main page still loads full Founder Story runtime')
require('founder-editorial-story-v1.0.css' not in index,'main page still loads Founder Story CSS')
require('id="founder-story"' not in index,'Founder Story was statically embedded on main page')

# Dedicated page contract.
for token in ['От создателя — P-120','class="editorial-home"','../founder-editorial-story-v1.0.js','../founder-editorial-story-v1.0.css','../?start=1','../#science-foundation','../#why-p120']:
    require(token in creator,f'dedicated page missing: {token}')

# Story integrity and privacy.
for token in ['fnd-00','fnd-01','fnd-02','fnd-03','fnd-04','fnd-05','fnd-06','fnd-07','fnd-08','fnd-09','fnd-10','fnd-11','Сделать внутреннее видимым.','Di']:
    require(token in story,f'Founder Story missing: {token}')
forbidden=[r'schema\.org/Person',r'meta\s+name=["\']author',r'portrait-reveal',r'headshot',r'founder-profile-contour',r'<img[^>]+founder']
for pattern in forbidden:
    require(not re.search(pattern,creator+'\n'+story,re.I),f'identity/portrait leakage: {pattern}')

require('creator/' in route,'route adapter does not target dedicated creator page')
require('data-ecosystem-route="creator"' in route,'route adapter missing desktop route hook')
require('data-ecosystem-mobile="creator"' in route,'route adapter missing mobile route hook')
require('@media(prefers-reduced-motion:reduce)' in css,'reduced-motion contract missing')

if errors:
    print('FAIL Founder dedicated-page contract')
    for e in errors: print(' -',e)
    sys.exit(1)
print('PASS Founder dedicated-page contract')
