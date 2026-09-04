#!/usr/bin/env python3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'qa/apply_global_header_pass21.py'

# Why P-120 EN is a document.write localisation proxy over the frozen RU source.
# Keep that transport intact: canonicalise only the brand lockup in the RU source,
# then let the existing localisation pairs translate it for EN.
why=ROOT/'why-p120/index.html'
text=why.read_text(encoding='utf-8')
old='<a class="wp-brand" href="../" aria-label="P-120 — главная"><span class="wp-brand-mark" aria-hidden="true"><i></i></span><span class="wp-brand-lockup"><strong>P-120</strong><small>исследовательская архитектура</small></span></a>'
new='<a class="wp-brand" href="../" data-p120-canonical-brand="5.3" aria-label="P-120 — главная"><span class="wp-brand-mark brand-mark" aria-hidden="true"><span class="brand-orbit"></span><span class="brand-node brand-node-a"></span><span class="brand-node brand-node-b"></span></span><span class="wp-brand-lockup brand-lockup"><strong class="brand">P-120</strong><small class="brand-sub">исследовательская архитектура</small></span></a>'
if old not in text:
    raise RuntimeError('Why P-120 RU canonical-brand source pattern not found')
text=text.replace(old,new,1)
text=text.replace('<header class="wp-header"','<header class="wp-header p120-brand53-header"',1)
text=text.replace('<div class="wp-header-inner">','<div class="wp-header-inner p120-brand53-header__inner">',1)
why.write_text(text,encoding='utf-8')

proxy=ROOT/'en/why-p120/index.html'
text=proxy.read_text(encoding='utf-8')
old_pair="['<small>исследовательская архитектура</small>','<small>research architecture</small>']"
new_pair="['<small class=\"brand-sub\">исследовательская архитектура</small>','<small class=\"brand-sub\">RESEARCH ARCHITECTURE</small>']"
if old_pair not in text:
    raise RuntimeError('Why P-120 EN descriptor localisation pair not found')
text=text.replace(old_pair,new_pair,1)
proxy.write_text(text,encoding='utf-8')

# Execute the guarded base patcher, excluding Why from the full static-nav rewrite.
source=base.read_text(encoding='utf-8')
needle="WHY_FAMILY = {'why-p120/index.html','en/why-p120/index.html'}"
if needle not in source:
    raise RuntimeError('Base PASS 2.1 patcher WHY_FAMILY declaration not found')
source=source.replace(needle,'WHY_FAMILY = set()',1)
ns={'__file__':str(base),'__name__':'__main__'}
exec(compile(source,str(base),'exec'),ns,ns)
