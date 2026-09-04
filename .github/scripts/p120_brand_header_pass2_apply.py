from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CSS = ROOT / 'p120-pass53-visual-corrections-v1.0.css'
JS = ROOT / 'p120-brand-system-v1.0.js'

CSS_MARKER = 'F. BRAND / HEADER MOBILE LOCKUP RECONCILIATION / PASS 2'
css = CSS.read_text(encoding='utf-8')
if CSS_MARKER in css:
    raise SystemExit('PASS 2 CSS marker already present; refusing duplicate apply')

css_append = r'''

/* --------------------------------------------------------------------------
   F. BRAND / HEADER MOBILE LOCKUP RECONCILIATION / PASS 2
   Authority: preserve the established public identity P-120 + Research
   Architecture / Исследовательская архитектура across desktop and mobile.
   Presentation only: no questionnaire, scoring, CTA, persistence, report,
   scientific-authority, privacy or navigation-IA changes.
   -------------------------------------------------------------------------- */

/* Canonical brand authority wins over legacy Main breakpoint rules that hid
   .brand-sub at 1420 / 860 / 820 / 720. The descriptor remains real DOM text. */
html.p120-brand53-ready :is(.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand) .brand-sub{
  display:block!important;
}

@media(max-width:1080px){
  html.p120-brand53-ready :is(.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand){
    gap:10px!important;
  }
  html.p120-brand53-ready :is(.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand) .brand-lockup{
    min-width:0;
    gap:3px;
  }
  html.p120-brand53-ready :is(.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand) .brand-sub{
    font-size:7px!important;
    line-height:1.05!important;
    letter-spacing:.12em!important;
    white-space:nowrap!important;
  }
}

/* Phone geometry: retain the descriptor before sacrificing functional controls.
   Main's duplicate quick theme icon is expendable because the full theme chooser
   remains in the Main mobile drawer. Static Explore keeps its theme control. */
@media(max-width:430px){
  html.p120-brand53-ready :is(.topbar-inner,.explore-topbar__inner,.creator-topbar__inner,.wp-header-inner,.p120-brand53-header__inner){
    padding-inline:12px!important;
    gap:8px!important;
  }
  html.p120-brand53-ready :is(.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand){
    gap:8px!important;
  }
  html.p120-brand53-ready .brand-mark{
    width:34px!important;
    height:34px!important;
    flex-basis:34px!important;
  }
  html.p120-brand53-ready .brand{font-size:21px!important}
  html.p120-brand53-ready :is(.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand) .brand-sub{
    font-size:6.5px!important;
    letter-spacing:.095em!important;
  }
  html.p120-brand53-ready .topbar .p120-brand53-tools--main-quick .p120-brand53-theme{
    display:none!important;
  }
  html.p120-brand53-ready .topbar .p120-brand53-tools--main-quick{gap:2px!important}
  html.p120-brand53-ready .topbar .p120-brand53-language a{
    min-width:27px;
    height:27px;
    padding-inline:3px;
  }
  html.p120-brand53-ready .topbar-tools{gap:5px!important;flex-wrap:nowrap!important}
  html.p120-brand53-ready .topbar .progress-badge{
    min-width:40px;
    padding-inline:7px;
    font-size:10px;
  }
  html.p120-brand53-ready .topbar .mobile-menu-toggle{
    min-width:44px;
    min-height:44px;
  }

  /* Explore carries canonical locale/theme utilities plus its drawer trigger.
     At phone widths retain all capabilities while showing only the cross-locale
     destination and converting the drawer label into a compact icon control. */
  html.p120-brand53-ready .explore-topbar .p120-brand53-tools{
    gap:4px!important;
    flex:0 0 auto;
  }
  html.p120-brand53-ready .explore-topbar .p120-brand53-language a{
    min-width:27px;
    height:27px;
    padding-inline:3px;
  }
  html.p120-brand53-ready .explore-topbar .p120-brand53-language a[aria-current='page']{
    display:none!important;
  }
  html.p120-brand53-ready .explore-topbar .explore-menu-btn{
    display:inline-flex!important;
    align-items:center;
    justify-content:center;
    flex:0 0 44px;
    width:44px;
    min-width:44px;
    height:44px;
    min-height:44px;
    margin-left:0!important;
    padding:0!important;
    font-size:0!important;
    line-height:1!important;
  }
  html.p120-brand53-ready .explore-topbar .explore-menu-btn::before{
    content:'☰';
    font:500 18px/1 var(--p120-brand-sans);
    letter-spacing:0;
  }

  /* Why P-120 is composition-frozen. This is isolated header micro-polish only:
     the brand already links home, so the legacy mobile home pill is redundant.
     Keep one cross-locale action plus the canonical theme control. */
  html.p120-brand53-ready .wp-header .wp-mobile-menu{
    display:none!important;
  }
  html.p120-brand53-ready .wp-header .wp-header-tools{
    min-width:0!important;
    gap:5px!important;
    margin-left:auto!important;
  }
  html.p120-brand53-ready .wp-header .p120-brand53-tools{
    gap:4px!important;
  }
  html.p120-brand53-ready .wp-header .p120-brand53-language a[aria-current='page']{
    display:none!important;
  }
  html.p120-brand53-ready .wp-header .p120-brand53-language a{
    min-width:27px;
    height:27px;
    padding-inline:3px;
  }
}

/* Extreme narrow stress regime. Full wording is preserved; typography and
   spacing are compacted rather than hiding the identity descriptor. */
@media(max-width:359px){
  html.p120-brand53-ready :is(.topbar-inner,.explore-topbar__inner,.creator-topbar__inner,.wp-header-inner,.p120-brand53-header__inner){
    padding-inline:10px!important;
    gap:7px!important;
  }
  html.p120-brand53-ready :is(.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand){
    gap:7px!important;
  }
  html.p120-brand53-ready .brand-mark{
    width:31px!important;
    height:31px!important;
    flex-basis:31px!important;
  }
  html.p120-brand53-ready .brand{font-size:20px!important}
  html.p120-brand53-ready :is(.brand-button,.explore-brand,.creator-brand,.wp-brand,.p120-brand53-brand) .brand-sub{
    font-size:6.25px!important;
    letter-spacing:.065em!important;
  }
  html.p120-brand53-ready .topbar .p120-brand53-language a{
    min-width:25px;
    height:27px;
    padding-inline:2px;
  }
  html.p120-brand53-ready .topbar-tools{gap:4px!important}
  html.p120-brand53-ready .topbar .progress-badge{
    min-width:38px;
    padding-inline:6px;
  }
  html.p120-brand53-ready .explore-topbar .p120-brand53-language a,
  html.p120-brand53-ready .wp-header .p120-brand53-language a{
    min-width:25px;
    padding-inline:2px;
  }
}
'''
CSS.write_text(css.rstrip() + css_append.rstrip() + '\n', encoding='utf-8')

js = JS.read_text(encoding='utf-8')
old_brand = """      if(node.dataset.p120CanonicalBrand==='5.3') return;"""
new_brand = """      if(node.dataset.p120CanonicalBrand==='5.3'){
        const descriptor=node.querySelector(':scope > .brand-lockup > .brand-sub');
        if(descriptor&&descriptor.textContent.trim()!==copy.descriptor) descriptor.textContent=copy.descriptor;
        if(node.tagName==='A') node.href=localeRoot(isEn);
        node.setAttribute('aria-label',isEn?'P-120 — home':'P-120 — на главную');
        return;
      }"""
if old_brand not in js:
    raise SystemExit('Expected canonical-brand early-return authority not found; refusing unsafe patch')
if js.count(old_brand) != 1:
    raise SystemExit(f'Expected one canonical-brand early-return, found {js.count(old_brand)}')
js = js.replace(old_brand, new_brand, 1)

old_tools = """  function ensureTools(){
    const inner=findHeaderInner();
    if(!inner || inner.querySelector('[data-p120-brand53-tools]')) return;
    const tpl=document.createElement('template'); tpl.innerHTML=toolsMarkup();"""
new_tools = """  function ensureTools(){
    const inner=findHeaderInner();
    if(!inner || inner.querySelector('[data-p120-brand53-tools]')) return;
    /* Science uses the same mature application header shell as Main and already
       carries locale/theme/mobile utilities inside .topbar-tools. Injecting a
       second canonical utility block creates a mobile second row, so preserve
       the existing Science utility authority instead of duplicating it. */
    if(pageKind==='science' && inner.querySelector('.topbar-tools')) return;
    const tpl=document.createElement('template'); tpl.innerHTML=toolsMarkup();"""
if old_tools not in js:
    raise SystemExit('Expected ensureTools authority not found; refusing unsafe patch')
if js.count(old_tools) != 1:
    raise SystemExit(f'Expected one ensureTools authority, found {js.count(old_tools)}')
js = js.replace(old_tools, new_tools, 1)

JS.write_text(js, encoding='utf-8')

print('PASS 2 controlled apply complete')
print(' - p120-pass53-visual-corrections-v1.0.css: mobile descriptor/header reconciliation appended')
print(' - p120-brand-system-v1.0.js: canonical locale/aria + Science utility reconciliation hardened')
