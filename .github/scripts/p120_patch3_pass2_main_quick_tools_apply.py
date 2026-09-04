from pathlib import Path

js_path=Path('p120-brand-system-v1.0.js')
css_path=Path('p120-brand-system-v1.0.css')
js=js_path.read_text(encoding='utf-8')
css=css_path.read_text(encoding='utf-8')

old="function findHeaderInner(){return document.querySelector('.explore-topbar__inner,.creator-topbar__inner,.wp-header-inner,.p120-brand53-header__inner');}"
new="function findHeaderInner(){return document.querySelector('.topbar-inner,.explore-topbar__inner,.creator-topbar__inner,.wp-header-inner,.p120-brand53-header__inner');}"
assert old in js, 'findHeaderInner authority target not found'
js=js.replace(old,new,1)

old="""  function ensureTools(){
    if(isMain) return;
    const inner=findHeaderInner();
    if(!inner || inner.querySelector('[data-p120-brand53-tools]')) return;
    const tpl=document.createElement('template'); tpl.innerHTML=toolsMarkup();
    const tools=tpl.content.firstElementChild;
    const anchor=inner.querySelector('.explore-menu-btn,.creator-tools,.wp-header-tools');
    if(anchor?.classList.contains('wp-header-tools')) anchor.prepend(tools);
    else if(anchor){
      if(anchor.classList.contains('creator-tools')) anchor.classList.add('p120-brand53-legacy-tools');
      inner.insertBefore(tools,anchor);
    }
    else inner.appendChild(tools);
    tools.querySelectorAll('[data-p120-theme]').forEach(btn=>btn.addEventListener('click',e=>{
      e.preventDefault(); applyTheme(btn.dataset.p120Theme); tools.querySelector('.p120-brand53-theme')?.removeAttribute('open');
    }));
"""
new="""  function ensureTools(){
    const inner=findHeaderInner();
    if(!inner || inner.querySelector('[data-p120-brand53-tools]')) return;
    const tpl=document.createElement('template'); tpl.innerHTML=toolsMarkup();
    const tools=tpl.content.firstElementChild;
    if(isMain){
      const mainTools=inner.querySelector('.topbar-tools');
      if(!mainTools) return;
      tools.classList.add('p120-brand53-tools--main-quick');
      mainTools.prepend(tools);
    } else {
      const anchor=inner.querySelector('.explore-menu-btn,.creator-tools,.wp-header-tools');
      if(anchor?.classList.contains('wp-header-tools')) anchor.prepend(tools);
      else if(anchor){
        if(anchor.classList.contains('creator-tools')) anchor.classList.add('p120-brand53-legacy-tools');
        inner.insertBefore(tools,anchor);
      }
      else inner.appendChild(tools);
    }
    tools.querySelectorAll('[data-p120-theme]').forEach(btn=>btn.addEventListener('click',e=>{
      e.preventDefault(); applyUtilityTheme(btn.dataset.p120Theme); tools.querySelector('.p120-brand53-theme')?.removeAttribute('open');
    }));
"""
assert old in js, 'ensureTools canonical block not found'
js=js.replace(old,new,1)

marker="""  function toolsMarkup(){
"""
helper="""  // PATCH 3 / PASS 2 — Main quick utilities reuse the canonical theme authority
  // while keeping Main's legacy render-local theme variable synchronized.
  function applyUtilityTheme(next){
    if(!THEMES.includes(next)) return;
    if(isMain && typeof window.setTheme==='function'){
      try{
        window.setTheme(next);
        currentTheme=next;
        applyTheme(next,{persist:false});
        return;
      }catch(_){}
    }
    applyTheme(next);
  }

  function toolsMarkup(){
"""
assert marker in js, 'toolsMarkup marker not found'
js=js.replace(marker,helper,1)

old="window.P120_BRAND_SYSTEM=Object.freeze({version:'5.3',revision:'5.3.2'"
new="window.P120_BRAND_SYSTEM=Object.freeze({version:'5.3',revision:'5.3.3'"
assert old in js, 'brand revision marker not found'
js=js.replace(old,new,1)

css_block="""

/* PATCH 3 / PASS 2 — Main quick locale/theme utility parity.
   Reuses canonical p120-brand53-tools; Main desktop composition remains unchanged. */
html.p120-brand53-ready .p120-brand53-tools--main-quick{display:none}
@media(max-width:820px){
  html.p120-brand53-ready .topbar .p120-brand53-tools--main-quick{
    display:flex;
    margin-left:0;
    flex:0 0 auto;
  }
}
"""
assert 'p120-brand53-tools--main-quick' not in css, 'PATCH 3 CSS already present'
css=css.rstrip()+css_block+'\n'

js_path.write_text(js,encoding='utf-8')
css_path.write_text(css,encoding='utf-8')
print('PATCH 3 / PASS 2 production reconciliation staged')
