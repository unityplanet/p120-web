#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]

# PASS 2.1 is presentation-preserving. It changes header ownership / first-paint
# authority only and must not touch questionnaire, scoring or scientific content.
GOVERNED_HTML = {
    'index.html': '',
    'en/index.html': '../',
    'science/index.html': '../',
    'en/science/index.html': '../../',
    'system/index.html': '../',
    'en/system/index.html': '../../',
    'extended/index.html': '../',
    'en/extended/index.html': '../../',
    'together/index.html': '../',
    'en/together/index.html': '../../',
    'creator/index.html': '../',
    'en/creator/index.html': '../../',
    'why-p120/index.html': '../',
    'en/why-p120/index.html': '../../',
    'intellectual-property/index.html': '../',
    'en/intellectual-property/index.html': '../../',
    'terms/index.html': '../',
    'en/terms/index.html': '../../',
    'privacy/index.html': '../',
    'en/privacy/index.html': '../../',
}

LIVE_LEGACY_HIDE_FILES = [
    'index.html', 'en/index.html',
    'science/index.html', 'en/science/index.html',
    'system/index.html', 'en/system/index.html',
]

MAIN_FAMILY = {
    'index.html', 'en/index.html',
    'science/index.html', 'en/science/index.html',
    'system/index.html', 'en/system/index.html',
}
EXPLORE_FAMILY = {'extended/index.html','en/extended/index.html','together/index.html','en/together/index.html'}
FOUNDER_FAMILY = {'creator/index.html','en/creator/index.html'}
WHY_FAMILY = {'why-p120/index.html','en/why-p120/index.html'}

changed: list[str] = []

def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding='utf-8')

def write(rel: str, text: str) -> None:
    p = ROOT / rel
    old = p.read_text(encoding='utf-8')
    if old != text:
        p.write_text(text, encoding='utf-8')
        changed.append(rel)

def replace_exact(text: str, old: str, new: str, *, rel: str, minimum: int = 1, maximum: int | None = None) -> str:
    n = text.count(old)
    if n < minimum or (maximum is not None and n > maximum):
        raise RuntimeError(f'{rel}: expected {minimum}..{maximum or "∞"} occurrences of {old!r}, found {n}')
    return text.replace(old, new)

def replace_regex(text: str, pattern: str, repl, *, rel: str, minimum: int = 1, maximum: int | None = None, flags: int = 0) -> str:
    out, n = re.subn(pattern, repl, text, flags=flags)
    if n < minimum or (maximum is not None and n > maximum):
        raise RuntimeError(f'{rel}: regex {pattern!r} expected {minimum}..{maximum or "∞"} matches, found {n}')
    return out

def is_en(rel: str) -> bool:
    return rel.startswith('en/')

def page_kind(rel: str) -> str:
    parts = pathlib.PurePosixPath(rel).parts
    if parts[0] == 'en':
        parts = parts[1:]
    return 'main' if parts == ('index.html',) else parts[0]

def locale_root(prefix: str, en: bool) -> str:
    return prefix + ('en/' if en else '')

def route(prefix: str, en: bool, kind: str) -> str:
    base = locale_root(prefix, en)
    return base if kind == 'main' else base + kind + '/'

def canonical_brand(en: bool) -> str:
    descriptor = 'RESEARCH ARCHITECTURE' if en else 'ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА'
    return (
        '<span class="brand-mark" aria-hidden="true"><span class="brand-orbit"></span>'
        '<span class="brand-node brand-node-a"></span><span class="brand-node brand-node-b"></span></span>'
        f'<span class="brand-lockup"><span class="brand">P-120</span><span class="brand-sub">{descriptor}</span></span>'
    )

def canonical_nav(prefix: str, en: bool, current_kind: str, host_class: str) -> str:
    if en:
        c = dict(about='About P-120', why='Why P-120?', unique='What makes it different', shows='What it shows', report='Report',
                 science='Scientific Base', explore='Explore', explore_title='Explore P-120', map='Project map', story='Story of P-120', next='Next',
                 why_note='Origin of the name and the idea', creator='From the Creator', creator_note='The personal context behind P-120',
                 deeper='Go deeper', deeper_note='Extended Research Set · optional research', together='Together?', together_note='Dyadic research layer · relationship research')
        aria='Main navigation'
    else:
        c = dict(about='О P-120', why='Почему P-120?', unique='Уникальность', shows='Что покажет', report='Отчёт',
                 science='Научная база', explore='Исследовать', explore_title='Исследовать P-120', map='Карта проекта', story='История P-120', next='Дальше',
                 why_note='Происхождение названия и самой идеи', creator='От создателя', creator_note='Личный контекст появления P-120',
                 deeper='Хотите глубже?', deeper_note='Система углублённых исследований', together='Мы вместе?', together_note='Исследование пары')
        aria='Основная навигация'
    home = locale_root(prefix,en)
    why = route(prefix,en,'why-p120')
    creator = route(prefix,en,'creator')
    extended = route(prefix,en,'extended')
    together = route(prefix,en,'together')
    science = route(prefix,en,'science')
    why_current = ' aria-current="page"' if current_kind == 'why-p120' else ''
    creator_current = ' aria-current="page"' if current_kind == 'creator' else ''
    extended_current = ' aria-current="page"' if current_kind == 'extended' else ''
    together_current = ' aria-current="page"' if current_kind == 'together' else ''
    return (
        f'<nav class="{host_class} p120-brand53-nav" data-p120-canonical-nav="5.3" aria-label="{aria}">'
        f'<a class="p120-brand53-navitem" href="{home}#why-important">{c["about"]}</a>'
        f'<a class="p120-brand53-navitem" href="{why}"{why_current}>{c["why"]}</a>'
        f'<a class="p120-brand53-navitem" href="{home}#why-p120">{c["unique"]}</a>'
        f'<a class="p120-brand53-navitem" href="{home}#what-p120-shows">{c["shows"]}</a>'
        f'<a class="p120-brand53-navitem" href="{home}#showcase">{c["report"]}</a>'
        f'<a class="p120-brand53-navitem" href="{science}">{c["science"]}</a>'
        f'<details class="p120-brand53-mega"><summary>{c["explore"]}</summary><div class="p120-brand53-mega-panel" role="navigation" aria-label="{c["explore_title"]}">'
        f'<div class="p120-brand53-mega-head"><strong>{c["explore_title"]}</strong><span>{c["map"]}</span></div><div class="p120-brand53-mega-grid">'
        f'<section class="p120-brand53-mega-column"><div class="p120-brand53-mega-label">{c["story"]}</div>'
        f'<a class="p120-brand53-mega-card" href="{why}"{why_current}><strong>{c["why"]}</strong><small>{c["why_note"]}</small></a>'
        f'<a class="p120-brand53-mega-card" href="{creator}"{creator_current}><strong>{c["creator"]}</strong><small>{c["creator_note"]}</small></a></section>'
        f'<section class="p120-brand53-mega-column"><div class="p120-brand53-mega-label">{c["next"]}</div>'
        f'<a class="p120-brand53-mega-card" href="{extended}"{extended_current}><strong>{c["deeper"]}</strong><small>{c["deeper_note"]}</small></a>'
        f'<a class="p120-brand53-mega-card" href="{together}"{together_current}><strong>{c["together"]}</strong><small>{c["together_note"]}</small></a>'
        '</section></div></div></details></nav>'
    )

def canonical_tools(prefix: str, en: bool, current_kind: str, *, default_theme: str = 'ivory') -> str:
    labels_en = {'ivory':'Light','graphite':'Graphite','museum':'Museum'}
    labels_ru = {'ivory':'Светлая','graphite':'Графит','museum':'Музейная'}
    labels = labels_en if en else labels_ru
    lang_label = 'Language' if en else 'Язык'
    theme_label = 'Theme' if en else 'Тема'
    ru = route(prefix,False,current_kind)
    en_url = route(prefix,True,current_kind)
    ru_current = '' if en else ' aria-current="page"'
    en_current = ' aria-current="page"' if en else ''
    buttons = ''.join(
        f'<button type="button" class="p120-brand53-theme-option" data-p120-theme="{t}" aria-pressed="false"><span class="p120-brand53-theme-swatch {t}" aria-hidden="true"></span><span>{labels[t]}</span></button>'
        for t in ('ivory','graphite','museum')
    )
    return (
        '<div class="p120-brand53-tools" data-p120-brand53-tools>'
        f'<nav class="p120-brand53-language" aria-label="{lang_label}"><a href="{ru}" lang="ru"{ru_current}>RU</a><a href="{en_url}" lang="en"{en_current}>EN</a></nav>'
        f'<details class="p120-brand53-theme"><summary aria-label="{theme_label}"><span class="p120-brand53-theme-dot" aria-hidden="true"></span><span data-p120-theme-label>{labels[default_theme]}</span></summary>'
        f'<div class="p120-brand53-theme-popover">{buttons}</div></details></div>'
    )

def bootstrap_block(prefix: str) -> str:
    return (
        '\n  <!-- P120 GLOBAL HEADER PASS 2.1 — canonical first-paint authority -->\n'
        f'  <link rel="stylesheet" href="{prefix}p120-brand-system-v1.0.css?v=532" data-p120-brand-system="5.3" />\n'
        f'  <link rel="stylesheet" href="{prefix}p120-pass53-visual-corrections-v1.0.css?v=532" data-p120-pass53-visual-corrections="5.3.2" />\n'
        '  <script data-p120-brand-bootstrap="5.3.2">document.documentElement.classList.add(\'p120-brand53-ready\')</script>\n'
    )

# 1. Static first-paint authority on every governed route.
for rel, prefix in GOVERNED_HTML.items():
    text = read(rel)
    if 'data-p120-brand-bootstrap="5.3.2"' not in text:
        text = replace_exact(text, '</head>', bootstrap_block(prefix) + '</head>', rel=rel, minimum=1, maximum=1)
    write(rel, text)

# 2. Remove only live legacy rules that hide the canonical orbit mark.
hide_rule = re.compile(r'\s*\.brand-mark\s*\{\s*display\s*:\s*none(?:\s*!important)?\s*;?\s*\}', re.I)
for rel in LIVE_LEGACY_HIDE_FILES:
    text = read(rel)
    text, n = hide_rule.subn('', text)
    if n < 1:
        raise RuntimeError(f'{rel}: no live legacy .brand-mark display:none rule found')
    write(rel, text)

# 3. Main / Science / System generated shell already uses canonical orbit markup.
#    Mark it as canonical at source so the shared runtime does not rewrite it.
for rel in MAIN_FAMILY:
    text = read(rel)
    text = replace_exact(text, 'class="topbar mobile-ux-topbar"', 'class="topbar mobile-ux-topbar p120-brand53-header"', rel=rel, minimum=1, maximum=1)
    text = replace_exact(text, 'class="topbar-inner refined-topbar mobile-refined-topbar"', 'class="topbar-inner refined-topbar mobile-refined-topbar p120-brand53-header__inner"', rel=rel, minimum=1, maximum=1)
    text = replace_exact(text, 'class="brand-button" data-home', 'class="brand-button p120-brand53-brand" data-p120-canonical-brand="5.3" data-home', rel=rel, minimum=1, maximum=1)
    text = replace_exact(text, '<nav class="topnav" aria-label=', '<nav class="topnav p120-brand53-nav" data-p120-canonical-nav="5.3" aria-label=', rel=rel, minimum=1, maximum=1)
    write(rel, text)

# 4. Static page families: canonical brand markup + canonical nav + canonical tools
#    exist in source before the shared runtime starts.
for rel in sorted(EXPLORE_FAMILY | FOUNDER_FAMILY | WHY_FAMILY):
    text = read(rel)
    en = is_en(rel)
    prefix = GOVERNED_HTML[rel]
    kind = page_kind(rel)
    descriptor = canonical_brand(en)

    if rel in EXPLORE_FAMILY:
        brand_class, nav_class = 'explore-brand', 'explore-mainnav'
        text = replace_regex(
            text,
            r'(<a class="explore-brand"[^>]*>).*?</a>',
            lambda m: m.group(1).replace('class="explore-brand"','class="explore-brand p120-brand53-brand" data-p120-canonical-brand="5.3"') + descriptor + '</a>',
            rel=rel, minimum=1, maximum=1, flags=re.S,
        )
        text = replace_regex(text, r'<nav class="explore-mainnav"[^>]*>.*?</nav>', canonical_nav(prefix,en,kind,nav_class), rel=rel, minimum=1, maximum=1, flags=re.S)
        tools = canonical_tools(prefix,en,kind)
        text = replace_exact(text, '    <button class="explore-menu-btn"', '    ' + tools + '\n    <button class="explore-menu-btn"', rel=rel, minimum=1, maximum=1)
        text = replace_exact(text, '<header class="explore-topbar">', '<header class="explore-topbar p120-brand53-header">', rel=rel, minimum=1, maximum=1)
        text = replace_exact(text, '<div class="explore-topbar__inner">', '<div class="explore-topbar__inner p120-brand53-header__inner">', rel=rel, minimum=1, maximum=1)

    elif rel in FOUNDER_FAMILY:
        brand_class, nav_class = 'creator-brand', 'creator-nav topnav'
        text = replace_regex(
            text,
            r'(<a class="creator-brand"[^>]*>).*?</a>',
            lambda m: m.group(1).replace('class="creator-brand"','class="creator-brand p120-brand53-brand" data-p120-canonical-brand="5.3"') + descriptor + '</a>',
            rel=rel, minimum=1, maximum=1, flags=re.S,
        )
        text = replace_regex(text, r'<nav class="creator-nav topnav"[^>]*>.*?</nav>', canonical_nav(prefix,en,kind,nav_class), rel=rel, minimum=1, maximum=1, flags=re.S)
        default_theme='museum'
        text = replace_regex(text, r'<div class="creator-tools"[^>]*>.*?</div>\s*</div>\s*</header>', canonical_tools(prefix,en,kind,default_theme=default_theme) + '\n    </div>\n  </header>', rel=rel, minimum=1, maximum=1, flags=re.S)
        text = replace_exact(text, '<header class="creator-topbar">', '<header class="creator-topbar p120-brand53-header">', rel=rel, minimum=1, maximum=1)
        text = replace_exact(text, '<div class="creator-topbar__inner">', '<div class="creator-topbar__inner p120-brand53-header__inner">', rel=rel, minimum=1, maximum=1)

    elif rel in WHY_FAMILY:
        brand_class, nav_class = 'wp-brand', 'wp-nav'
        text = replace_regex(
            text,
            r'(<a class="wp-brand"[^>]*>).*?</a>',
            lambda m: m.group(1).replace('class="wp-brand"','class="wp-brand p120-brand53-brand" data-p120-canonical-brand="5.3"') + descriptor + '</a>',
            rel=rel, minimum=1, maximum=1, flags=re.S,
        )
        text = replace_regex(text, r'<nav class="wp-nav"[^>]*>.*?</nav>', canonical_nav(prefix,en,kind,nav_class), rel=rel, minimum=1, maximum=1, flags=re.S)
        tools = canonical_tools(prefix,en,kind)
        text = replace_regex(text, r'<div class="wp-header-tools">\s*<nav class="wp-lang-switch"[^>]*>.*?</nav>', '<div class="wp-header-tools">' + tools, rel=rel, minimum=1, maximum=1, flags=re.S)
        text = replace_exact(text, '<header class="wp-header"', '<header class="wp-header p120-brand53-header"', rel=rel, minimum=1, maximum=1)
        text = replace_exact(text, '<div class="wp-header-inner">', '<div class="wp-header-inner p120-brand53-header__inner">', rel=rel, minimum=1, maximum=1)

    write(rel, text)

# 5. Explore shell must not recreate desktop legacy language/theme controls after
#    canonical tools are already present in source.
rel = 'explore-system-v1.0.js'
text = read(rel)
text = replace_exact(text,
    "if(!inner||inner.querySelector('.explore-theme-menu'))return;",
    "if(!inner||inner.querySelector('.explore-theme-menu')||inner.querySelector('[data-p120-brand53-tools]'))return;",
    rel=rel, minimum=1, maximum=1)
text = replace_exact(text,
    "if(!inner||inner.querySelector('.explore-lang-switch'))return;",
    "if(!inner||inner.querySelector('.explore-lang-switch')||inner.querySelector('[data-p120-brand53-tools]'))return;",
    rel=rel, minimum=1, maximum=1)
write(rel, text)

# 6. Shared brand runtime: load canonical CSS immediately, avoid rewriting an
#    already-canonical source lockup, make resume-rail writes value-idempotent,
#    and filter/coalesce reconciliation mutations.
rel = 'p120-brand-system-v1.0.js'
text = read(rel)
text = text.replace('p120-brand-system-v1.0.css?v=53', 'p120-brand-system-v1.0.css?v=532')
text = text.replace('p120-pass53-visual-corrections-v1.0.css?v=531', 'p120-pass53-visual-corrections-v1.0.css?v=532')
text = text.replace("correction.dataset.p120Pass53VisualCorrections='5.3.1';", "correction.dataset.p120Pass53VisualCorrections='5.3.2';")
text = replace_exact(text, "  }\n\n  function kind(){", "  }\n\n  // PASS 2.1: install the canonical styles as soon as the runtime executes,\n  // not after DOMContentLoaded. Static governed routes already load the same files.\n  ensureCss();\n\n  function kind(){", rel=rel, minimum=1, maximum=1)

old_patch = """  function patchBrand(){
    const nodes=document.querySelectorAll('.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand');
    nodes.forEach(node=>{
      if(node.dataset.p120CanonicalBrand==='5.3') return;
      node.innerHTML=brandMarkup();
      node.classList.add('p120-brand53-brand');
      node.dataset.p120CanonicalBrand='5.3';
      if(node.tagName==='A') node.href=localeRoot(isEn);
      node.setAttribute('aria-label',isEn?'P-120 — home':'P-120 — на главную');
    });
  }
"""
new_patch = """  function hasCanonicalBrandMarkup(node){
    const mark=node.querySelector(':scope > .brand-mark');
    const lockup=node.querySelector(':scope > .brand-lockup');
    return !!(mark&&lockup&&mark.querySelector(':scope > .brand-orbit')&&mark.querySelector(':scope > .brand-node-a')&&mark.querySelector(':scope > .brand-node-b')&&lockup.querySelector(':scope > .brand')&&lockup.querySelector(':scope > .brand-sub'));
  }

  function patchBrand(){
    const nodes=document.querySelectorAll('.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand');
    nodes.forEach(node=>{
      if(node.dataset.p120CanonicalBrand==='5.3') return;
      if(!hasCanonicalBrandMarkup(node)) node.innerHTML=brandMarkup();
      else {
        const descriptor=node.querySelector(':scope > .brand-lockup > .brand-sub');
        if(descriptor&&descriptor.textContent.trim()!==copy.descriptor) descriptor.textContent=copy.descriptor;
      }
      node.classList.add('p120-brand53-brand');
      node.dataset.p120CanonicalBrand='5.3';
      if(node.tagName==='A') node.href=localeRoot(isEn);
      node.setAttribute('aria-label',isEn?'P-120 — home':'P-120 — на главную');
    });
  }
"""
text = replace_exact(text, old_patch, new_patch, rel=rel, minimum=1, maximum=1)

resume_pat = re.compile(r"    info\.innerHTML=isEn\n(?P<body>\s+\?.*?\n\s+: .*?);\n\n    const resume=", re.S)
m = resume_pat.search(text)
if not m:
    raise RuntimeError('p120-brand-system-v1.0.js: resume-rail innerHTML assignment not found')
assignment = '    const nextInfo=isEn\n' + m.group('body') + ';\n    if(info.innerHTML!==nextInfo) info.innerHTML=nextInfo;\n\n    const resume='
text = text[:m.start()] + assignment + text[m.end():]

old_start = """  let running=false;
  function reconcile(){
    if(running) return; running=true;
    try{
      ensureLegalHeader();
      patchHeaderClasses();
      patchBrand();
      patchNav();
      patchLanguageRoutes();
      ensureTools();
      patchDescriptor();
      patchResumeRail();
      patchFooter();
      if(document.body && document.body.dataset.theme!==currentTheme) applyTheme(currentTheme,{persist:false});
      html.classList.add('p120-brand53-ready');
      html.dataset.p120BrandSystem='5.3';
      html.dataset.p120PageKind=pageKind;
    } finally {running=false;}
  }

  function start(){
    ensureCss();
    bindGlobalInteractions();
    applyTheme(currentTheme,{persist:false});
    reconcile();
    if(document.body) new MutationObserver(()=>requestAnimationFrame(reconcile)).observe(document.body,{childList:true,subtree:true});
    if(document.body) new MutationObserver(()=>{
      const t=document.body.dataset.theme;
      if(THEMES.includes(t)&&t!==currentTheme){currentTheme=t;try{localStorage.setItem(THEME_KEY,t);}catch(_){} reconcile();}
    }).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
  }

  window.P120_BRAND_SYSTEM=Object.freeze({version:'5.3',revision:'5.3.1',themeKey:THEME_KEY,descriptor:copy.descriptor,brand:copy.brand,root:rootUrl.href,reconcile});
"""
new_start = """  let running=false;
  let reconcileCount=0;
  function reconcile(){
    if(running) return; running=true;
    try{
      reconcileCount++;
      ensureLegalHeader();
      patchHeaderClasses();
      patchBrand();
      patchNav();
      patchLanguageRoutes();
      ensureTools();
      patchDescriptor();
      patchResumeRail();
      patchFooter();
      if(document.body && document.body.dataset.theme!==currentTheme) applyTheme(currentTheme,{persist:false});
      html.classList.add('p120-brand53-ready');
      html.dataset.p120BrandSystem='5.3';
      html.dataset.p120PageKind=pageKind;
    } finally {running=false;}
  }

  const RECONCILE_SELECTOR='.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand,.topnav,.explore-mainnav,.creator-nav,.wp-nav,.explore-topbar,.creator-topbar,.wp-header,.p120-brand53-header,.editorial-resume-rail,[data-p120-legal-footer]';
  function touchesReconcileSurface(node){
    if(!(node instanceof Element)) return false;
    return node.matches(RECONCILE_SELECTOR)||!!node.querySelector(RECONCILE_SELECTOR);
  }
  function mutationNeedsReconcile(mutations){
    return mutations.some(m=>[...m.addedNodes,...m.removedNodes].some(touchesReconcileSurface));
  }
  let reconcileQueued=false;
  function queueReconcile(){
    if(reconcileQueued) return;
    reconcileQueued=true;
    requestAnimationFrame(()=>{reconcileQueued=false;reconcile();});
  }

  function start(){
    bindGlobalInteractions();
    applyTheme(currentTheme,{persist:false});
    reconcile();
    if(document.body) new MutationObserver(mutations=>{if(mutationNeedsReconcile(mutations))queueReconcile();}).observe(document.body,{childList:true,subtree:true});
    if(document.body) new MutationObserver(()=>{
      const t=document.body.dataset.theme;
      if(THEMES.includes(t)&&t!==currentTheme){currentTheme=t;try{localStorage.setItem(THEME_KEY,t);}catch(_){} reconcile();}
    }).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
  }

  window.P120_BRAND_SYSTEM=Object.freeze({version:'5.3',revision:'5.3.2',themeKey:THEME_KEY,descriptor:copy.descriptor,brand:copy.brand,root:rootUrl.href,reconcile,getReconcileCount:()=>reconcileCount});
"""
text = replace_exact(text, old_start, new_start, rel=rel, minimum=1, maximum=1)
write(rel, text)

# 7. Cache-bust every production loader that points to the canonical brand runtime.
loader_files = ['founder-route-v1.1.js','explore-system-v1.0.js','p120-legal-runtime-v1.0.js']
for rel in loader_files:
    text = read(rel)
    text = replace_exact(text, 'p120-brand-system-v1.0.js?v=53', 'p120-brand-system-v1.0.js?v=532', rel=rel, minimum=1, maximum=1)
    write(rel, text)

# 8. Final structural assertions before a commit can be made.
for rel in LIVE_LEGACY_HIDE_FILES:
    if hide_rule.search(read(rel)):
        raise RuntimeError(f'{rel}: live legacy brand hide rule survived PASS 2.1')
for rel in GOVERNED_HTML:
    text = read(rel)
    if 'data-p120-brand-bootstrap="5.3.2"' not in text:
        raise RuntimeError(f'{rel}: missing canonical first-paint bootstrap')
    if text.count('data-p120-brand-system="5.3"') != 1:
        raise RuntimeError(f'{rel}: expected exactly one static canonical brand stylesheet link')

print('P-120 WEB GLOBAL HEADER PASS 2.1 — PATCH READY')
print(f'Changed files: {len(changed)}')
for rel in changed:
    print(f'- {rel}')
