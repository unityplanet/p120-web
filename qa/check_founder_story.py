#!/usr/bin/env python3
from pathlib import Path
import re, sys
root=Path(__file__).resolve().parents[1]
js=(root/'founder-editorial-story-v1.0.js').read_text(encoding='utf-8')
css=(root/'founder-editorial-story-v1.0.css').read_text(encoding='utf-8')
required=['fnd-00','fnd-01','fnd-02','fnd-03','fnd-04','fnd-05','fnd-06','fnd-07','fnd-08','fnd-09','fnd-10','fnd-11','Сделать внутреннее видимым.','Di','data-founder-route="science"','data-founder-route="why"','data-founder-route="self"']
missing=[x for x in required if x not in js]
forbidden=[r'schema\.org/Person',r'"author"\s*:',r'meta\s+name="author"',r'portrait-reveal',r'headshot']
found=[p for p in forbidden if re.search(p,js,re.I)]
if missing:
    print('FAIL missing:',missing);sys.exit(1)
if found:
    print('FAIL forbidden identity tokens:',found);sys.exit(1)
if '.founder-story' not in css or '@media(prefers-reduced-motion:reduce)' not in css:
    print('FAIL css contract');sys.exit(1)
print('PASS founder story static contract')
