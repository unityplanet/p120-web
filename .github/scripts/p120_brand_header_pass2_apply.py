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
   Main's duplicate quick theme icon is the first expendable control because the
   canonical theme system remains available elsewhere; RU/EN remains visible. */
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
    font-size:6px!important;
    letter-spacing:.07em!important;
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
}
'''
CSS.write_text(css.rstrip() + css_append + '\n', encoding='utf-8')

js = JS.read_text(encoding='utf-8')
old = """      if(node.dataset.p120CanonicalBrand==='5.3') return;"""
new = """      if(node.dataset.p120CanonicalBrand==='5.3'){
        const descriptor=node.querySelector(':scope > .brand-lockup > .brand-sub');
        if(descriptor&&descriptor.textContent.trim()!==copy.descriptor) descriptor.textContent=copy.descriptor;
        if(node.tagName==='A') node.href=localeRoot(isEn);
        node.setAttribute('aria-label',isEn?'P-120 — home':'P-120 — на главную');
        return;
      }"""
if old not in js:
    raise SystemExit('Expected canonical-brand early-return authority not found; refusing unsafe patch')
if js.count(old) != 1:
    raise SystemExit(f'Expected one canonical-brand early-return, found {js.count(old)}')
js = js.replace(old, new, 1)
JS.write_text(js, encoding='utf-8')

print('PASS 2 controlled apply complete')
print(' - p120-pass53-visual-corrections-v1.0.css: mobile descriptor authority appended')
print(' - p120-brand-system-v1.0.js: canonical locale/aria reconciliation hardened')
