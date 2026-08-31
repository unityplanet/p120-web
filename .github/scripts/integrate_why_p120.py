from pathlib import Path
import re

root_path=Path('index.html')
why_path=Path('why-p120/index.html')
js_path=Path('why-p120/why-p120.js')
root=root_path.read_text(encoding='utf-8')
why=why_path.read_text(encoding='utf-8')

# Main-site integration CSS: fixed dark teaser surface inside any main-site theme.
if 'id="why-p120-production-integration"' not in root:
    css='''<style id="why-p120-production-integration">
.topnav .navlink-origin{white-space:nowrap}
.brand-origin-teaser{position:relative;overflow:hidden;margin:clamp(18px,2vw,28px) 0 clamp(48px,7vw,100px);min-height:clamp(420px,48vw,660px);border-radius:clamp(28px,3.2vw,52px);background:radial-gradient(760px 420px at 78% 42%,rgba(86,116,137,.13),transparent 64%),linear-gradient(135deg,#07090a 0%,#0a0d0f 60%,#101316 100%);color:#f3eee5;border:1px solid rgba(255,255,255,.09);display:grid;grid-template-columns:minmax(0,.8fr) minmax(420px,1.2fr);align-items:center;gap:clamp(34px,6vw,92px);padding:clamp(38px,6vw,88px);box-shadow:0 34px 110px rgba(0,0,0,.18);isolation:isolate}.brand-origin-teaser:before{content:"";position:absolute;right:-8%;top:-34%;width:min(720px,64vw);aspect-ratio:1;border-radius:50%;border:1px solid rgba(129,153,176,.15);box-shadow:0 0 0 72px rgba(129,153,176,.035),0 0 0 144px rgba(129,153,176,.022);pointer-events:none}.brand-origin-copy{position:relative;z-index:2;max-width:590px}.brand-origin-kicker{font:800 10px/1.2 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.15em;color:#c7a05b}.brand-origin-copy h2{font-family:"Noto Serif Display","Noto Serif",Georgia,serif;font-size:clamp(50px,5.4vw,96px);font-weight:500;letter-spacing:-.05em;line-height:.98;margin:18px 0 24px;color:#f6f0e7}.brand-origin-copy p{font-size:clamp(17px,1.4vw,22px);line-height:1.65;color:rgba(241,236,226,.74);max-width:34ch;margin:0}.brand-origin-link{display:inline-flex;align-items:center;gap:10px;margin-top:34px;border:1px solid rgba(255,255,255,.30);border-radius:999px;padding:13px 22px;text-decoration:none;color:#f6f1e8;font-size:12px;font-weight:800;letter-spacing:.04em;transition:transform .2s ease,background .2s ease,color .2s ease}.brand-origin-link:hover{transform:translateY(-1px);background:#f3eee5;color:#121212}.brand-origin-visual{position:relative;z-index:1;min-height:330px;display:grid;place-items:center;text-align:center}.brand-origin-visual strong{font-family:"Noto Serif Display","Noto Serif",Georgia,serif;font-size:clamp(92px,10vw,190px);font-weight:500;line-height:.8;letter-spacing:-.075em;color:#f5f0e7;white-space:nowrap}.brand-origin-visual span{font-family:"Noto Serif",Georgia,serif;font-size:clamp(28px,3vw,52px);letter-spacing:.02em;color:#d8c29e;margin-top:24px}.brand-origin-ghost{position:absolute;font-family:"Noto Serif Display","Noto Serif",Georgia,serif;font-size:min(34vw,480px);line-height:.8;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.045);right:-4%;bottom:-14%;z-index:-1;user-select:none}.brand-origin-caption{position:absolute;right:0;bottom:0;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.34)}
@media(max-width:980px){.brand-origin-teaser{grid-template-columns:1fr;min-height:auto}.brand-origin-copy{max-width:720px}.brand-origin-visual{min-height:300px}.brand-origin-caption{position:static;margin-top:18px;text-align:right}}
@media(max-width:620px){.brand-origin-teaser{margin-inline:-2px;padding:34px 22px;border-radius:28px;gap:20px}.brand-origin-copy h2{font-size:clamp(46px,13vw,68px)}.brand-origin-copy p{font-size:17px}.brand-origin-visual{min-height:250px}.brand-origin-visual strong{font-size:clamp(82px,25vw,130px)}.brand-origin-visual span{font-size:clamp(27px,8vw,40px)}.brand-origin-link{min-height:52px;width:100%;justify-content:center}.brand-origin-ghost{font-size:70vw}}
@media(prefers-reduced-motion:reduce){.brand-origin-link{transition:none}}
</style>'''
    if '</head>' not in root: raise SystemExit('root </head> not found')
    root=root.replace('</head>',css+'\n</head>',1)

# Desktop navigation.
old='''          <button class="navlink" data-nav="why-important">О P-120</button>\n          <button class="navlink" data-nav="why-p120">Уникальность</button>'''
new='''          <button class="navlink" data-nav="why-important">О P-120</button>\n          <button class="navlink navlink-origin" data-why-origin>Почему P-120?</button>\n          <button class="navlink" data-nav="why-p120">Уникальность</button>'''
if 'data-why-origin>Почему P-120?' not in root:
    if old not in root: raise SystemExit('desktop nav target not found')
    root=root.replace(old,new,1)

# Mobile drawer.
old='''          <button class="mobile-menu-action" data-home><div><div>Главная страница</div><small>Вернуться к editorial-структуре</small></div></button>\n          <button class="mobile-menu-action" data-science><div><div>Научная база</div><small>Открыть отдельный научный раздел</small></div></button>'''
new='''          <button class="mobile-menu-action" data-home><div><div>Главная страница</div><small>Вернуться к editorial-структуре</small></div></button>\n          <button class="mobile-menu-action" data-why-origin><div><div>Почему P-120?</div><small>История названия · 72 + 48 · символический слой бренда</small></div></button>\n          <button class="mobile-menu-action" data-science><div><div>Научная база</div><small>Открыть отдельный научный раздел</small></div></button>'''
if 'История названия · 72 + 48' not in root:
    if old not in root: raise SystemExit('mobile drawer target not found')
    root=root.replace(old,new,1)

# Route binding.
anchor="  document.querySelectorAll('[data-science]').forEach(b=>b.onclick=()=>{closeMobileMenu();goScience()});"
line="\n  document.querySelectorAll('[data-why-origin]').forEach(b=>b.onclick=()=>{closeMobileMenu();location.href='why-p120/'});"
if "location.href='why-p120/'" not in root:
    if anchor not in root: raise SystemExit('bindShell target not found')
    root=root.replace(anchor,anchor+line,1)

# Homepage Brand Origin teaser.
if 'function renderBrandOriginTeaser()' not in root:
    marker='function bindEditorialExperience(progress){'
    teaser='''function renderBrandOriginTeaser(){\n  return `<section class="brand-origin-teaser" id="brand-origin" data-reveal aria-labelledby="brand-origin-title"><div class="brand-origin-copy"><span class="brand-origin-kicker">THE NAME · BRAND ORIGIN</span><h2 id="brand-origin-title">Почему P-120?</h2><p>72 + 48 объясняют число. Но не весь смысл названия.</p><a class="brand-origin-link" href="why-p120/">Узнать историю <span aria-hidden="true">→</span></a></div><div class="brand-origin-visual" aria-hidden="true"><strong>P-120</strong><span>72 + 48 = 120</span><i class="brand-origin-ghost">P</i><small class="brand-origin-caption">FACT → MEANING → SYMBOL → HUMAN</small></div></section>`;\n}\n'''
    if marker not in root: raise SystemExit('teaser marker not found')
    root=root.replace(marker,teaser+marker,1)
old='    ${s4}${s5}${s6}'
new='    ${s4}${s5}${renderBrandOriginTeaser()}${s6}'
if new not in root:
    if old not in root: raise SystemExit('home insertion target not found')
    root=root.replace(old,new,1)

# External hash/start routing into the dynamic main site.
if 'const initialRouteHash=' not in root:
    old='render();\nupdateReadingProgress();'
    new='''const entryParams=new URLSearchParams(location.search);\nconst initialRouteHash=(location.hash||'').replace(/^#/,'');\nconst homeRouteAnchors=['why-important','life-energy','understand-desire','two-systems','why-p120','what-p120-shows','showcase','examples','science-foundation','life-importance','understand-earlier','final','brand-origin'];\nif(initialRouteHash&&homeRouteAnchors.includes(initialRouteHash)){state.screen='home';save()}\nif(entryParams.get('start')==='1'){state.screen=hasProgress()?'test':'preflight';save()}\nrender();\nif(initialRouteHash)setTimeout(()=>{if(document.getElementById(initialRouteHash))elegantScrollTo(initialRouteHash)},120);\nupdateReadingProgress();'''
    if old not in root: raise SystemExit('bootstrap target not found')
    root=root.replace(old,new,1)

# Brand Origin page: lock to its approved single palette and remove theme UI.
if '<body class="wp-fixed-editorial-theme">' not in why:
    why=why.replace('<body>','<body class="wp-fixed-editorial-theme">',1)
why,removed=re.subn(r'\s*<details class="wp-theme">.*?</details>','',why,count=1,flags=re.S)
if removed==0 and 'class="wp-theme"' in why: raise SystemExit('theme menu removal failed')
why=why.replace('<a class="wp-start" href="../">Начать</a>','<a class="wp-start" href="../?start=1">Начать</a>')
why=why.replace('<a class="wp-btn primary" href="../">Пройти P-120</a>','<a class="wp-btn primary" href="../?start=1">Пройти P-120</a>')
if 'id="wp-fixed-palette-lock"' not in why:
    lock='''<style id="wp-fixed-palette-lock">.wp-fixed-editorial-theme{color-scheme:light}.wp-fixed-editorial-theme .wp-header{border-top-color:transparent}.wp-fixed-editorial-theme .wp-header-tools{margin-left:0}.wp-fixed-editorial-theme .wp-header:after{content:"BRAND ORIGIN";position:absolute;right:var(--wp-gutter);bottom:5px;font:700 7px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;color:rgba(255,255,255,.22);pointer-events:none}@media(max-width:980px){.wp-fixed-editorial-theme .wp-header:after{display:none}}</style>'''
    why=why.replace('</head>',lock+'\n</head>',1)

fixed_js="""(() => {\n  'use strict';\n  document.body.removeAttribute('data-theme');\n  const sections=[...document.querySelectorAll('.wp-act')];\n  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n  if('IntersectionObserver' in window&&!reduce){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});sections.forEach(s=>io.observe(s))}else sections.forEach(s=>s.classList.add('is-visible'));\n})();\n"""

root_path.write_text(root,encoding='utf-8')
why_path.write_text(why,encoding='utf-8')
js_path.write_text(fixed_js,encoding='utf-8')

# Acceptance assertions.
assert 'data-why-origin>Почему P-120?' in root
assert 'function renderBrandOriginTeaser()' in root
assert '${s4}${s5}${renderBrandOriginTeaser()}${s6}' in root
assert "entryParams.get('start')==='1'" in root
assert 'class="wp-theme"' not in why
assert 'data-theme-choice' not in why
assert '../?start=1' in why
assert 'Preview load error' not in why and 'DecompressionStream' not in why
assert root.count('function renderBrandOriginTeaser()')==1
assert why.count('id="act-1"')==1 and why.count('id="act-4"')==1
assert 'localStorage' not in fixed_js
print('Why P-120 production integration: PASS')
