/* P-120 WEB-EXPLORE PASS 5.1 — shared Explore shell v1.3.2.
   Presentation/navigation/theme/localisation shell only.
   No assessment, scoring, persistence, report or scientific-authority logic. */
(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||document.baseURI;
  const head=document.head||document.documentElement;
  const html=document.documentElement;
  const pathname=location.pathname;
  const pageKind=/\/extended\/(?:index\.html)?$/i.test(pathname)?'extended':(/\/together\/(?:index\.html)?$/i.test(pathname)?'together':'');
  const isEn=html.lang.toLowerCase().startsWith('en')||/\/en\//i.test(pathname);
  const THEME_KEY='p120_web_theme_v16';
  const THEMES=['ivory','graphite','museum'];
  let theme='ivory';

  if(!document.getElementById('p120-explore-critical-v13')){
    const critical=document.createElement('style');
    critical.id='p120-explore-critical-v13';
    critical.textContent='.mobile-drawer{display:none!important}@media(max-width:760px){.mobile-drawer{display:block!important}}';
    head.appendChild(critical);
  }

  /* Peripheral surfaces in the PASS-2 base CSS pre-date theme support. Keep the
     correction narrow and token-driven so footer, drawer and secondary plot labels
     remain coherent in all three public themes. */
  if(!document.getElementById('p120-explore-theme-bridge-v1')){
    const bridge=document.createElement('style');
    bridge.id='p120-explore-theme-bridge-v1';
    bridge.textContent=`
.explore-footer{background:var(--stone)!important;color:var(--ink-2)!important;border-top-color:color-mix(in srgb,var(--line) 65%,transparent)!important}
.trajectory.b::before{color:color-mix(in srgb,var(--bronze) 82%,var(--graphite))!important}
@media(max-width:760px){
  .mobile-drawer{background:color-mix(in srgb,var(--petrol) 96%,#000)!important;color:var(--explore-reverse-ink,#f5f1e9)!important}
  .mobile-drawer small{color:color-mix(in srgb,var(--explore-reverse-ink,#f5f1e9) 70%,var(--teal))!important}
}`;
    head.appendChild(bridge);
  }

  function loadStyle(href,key,version){
    if(document.querySelector(`link[data-${key}]`))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL(href,scriptUrl).href;
    link.dataset[key]=version;
    head.appendChild(link);
  }
  loadStyle('explore-refinement-v1.1.css?v=exp41','p120ExploreRefinement','v1.1');
  loadStyle('explore-unification-v1.0.css?v=exp50','p120ExploreUnification','v1.0');
  loadStyle('explore-uhd-theme-reconciliation-v1.0.css?v=exp51','p120ExploreUhdThemeReconciliation','v1.0');

  function projectRoot(){
    const path=pathname.replace(/(?:en\/)?(?:extended|together)\/(?:index\.html)?$/i,'');
    return path.endsWith('/')?path:`${path}/`;
  }

  function loadTheme(){
    try{
      const stored=localStorage.getItem(THEME_KEY);
      return THEMES.includes(stored)?stored:'ivory';
    }catch(_){return 'ivory'}
  }

  function themeLabel(next){
    const ru={ivory:'Светлая',graphite:'Графит',museum:'Музейная'};
    const en={ivory:'Light',graphite:'Graphite',museum:'Museum'};
    return (isEn?en:ru)[next]||next;
  }

  function applyTheme(next,{persist=true}={}){
    theme=THEMES.includes(next)?next:'ivory';
    if(document.body)document.body.dataset.theme=theme;
    html.style.colorScheme=theme==='graphite'?'dark':'light';
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',({ivory:'#f2eee2',graphite:'#23211e',museum:'#f2eee2'})[theme]);
    if(persist){try{localStorage.setItem(THEME_KEY,theme)}catch(_){}}
    syncThemeControls();
  }

  function themeOptionMarkup(t){
    return `<button type="button" class="explore-theme-option" data-explore-theme="${t}" aria-pressed="false"><span class="explore-theme-swatch explore-theme-swatch-${t}" aria-hidden="true"></span><span>${themeLabel(t)}</span></button>`;
  }

  function addThemeControl(){
    if(!pageKind)return;
    const inner=document.querySelector('.explore-topbar__inner');
    if(!inner||inner.querySelector('.explore-theme-menu'))return;
    const details=document.createElement('details');
    details.className='explore-theme-menu';
    details.innerHTML=`<summary aria-label="${isEn?'Colour theme':'Цветовая тема'}"><span class="explore-theme-dot" aria-hidden="true"></span><span data-explore-theme-label>${themeLabel(theme)}</span></summary><div class="explore-theme-popover">${THEMES.map(themeOptionMarkup).join('')}</div>`;
    const menu=inner.querySelector('.explore-menu-btn');
    inner.insertBefore(details,menu||null);
    details.querySelectorAll('[data-explore-theme]').forEach(btn=>btn.addEventListener('click',e=>{
      e.preventDefault();
      applyTheme(btn.dataset.exploreTheme);
      details.removeAttribute('open');
    }));
  }

  function addMobileThemeControl(){
    const drawer=document.querySelector('[data-explore-drawer]');
    if(!drawer||drawer.querySelector('.explore-mobile-theme'))return;
    const group=document.createElement('div');
    group.className='explore-mobile-theme';
    group.setAttribute('aria-label',isEn?'Colour theme':'Цветовая тема');
    group.innerHTML=THEMES.map(t=>`<button type="button" data-explore-theme="${t}" aria-pressed="false">${themeLabel(t)}</button>`).join('');
    drawer.appendChild(group);
    group.querySelectorAll('[data-explore-theme]').forEach(btn=>btn.addEventListener('click',()=>applyTheme(btn.dataset.exploreTheme)));
  }

  function syncThemeControls(){
    document.querySelectorAll('[data-explore-theme]').forEach(btn=>{
      const active=btn.dataset.exploreTheme===theme;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',String(active));
    });
    document.querySelectorAll('[data-explore-theme-label]').forEach(node=>node.textContent=themeLabel(theme));
  }

  function addLanguageSwitch(){
    if(!pageKind)return;
    const inner=document.querySelector('.explore-topbar__inner');
    if(!inner||inner.querySelector('.explore-lang-switch'))return;
    const root=projectRoot();
    const ru=`${root}${pageKind}/`;
    const en=`${root}en/${pageKind}/`;
    const nav=document.createElement('nav');
    nav.className='explore-lang-switch';
    nav.setAttribute('aria-label',isEn?'Language':'Язык');
    nav.innerHTML=`<a href="${ru}" lang="ru" ${!isEn?'aria-current="page"':''}>RU</a><a href="${en}" lang="en" ${isEn?'aria-current="page"':''}>EN</a>`;
    const menu=inner.querySelector('.explore-menu-btn');
    inner.insertBefore(nav,menu||null);
  }

  const btn=document.querySelector('[data-explore-menu]');
  const drawer=document.querySelector('[data-explore-drawer]');
  const topbar=document.querySelector('.explore-topbar');

  function closeDrawer(){
    if(!drawer||!btn)return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
  }
  function openDrawer(){
    if(!drawer||!btn)return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
    btn.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
  }
  function desktopMenus(){return [...document.querySelectorAll('.explore-mainnav details')]}
  function closeFloatingMenus(except=null){desktopMenus().forEach(d=>{if(d!==except)d.removeAttribute('open')})}
  function closeThemeMenus(){document.querySelectorAll('.explore-theme-menu[open]').forEach(d=>d.removeAttribute('open'))}

  theme=loadTheme();
  applyTheme(theme,{persist:false});
  addThemeControl();
  addLanguageSwitch();
  addMobileThemeControl();
  syncThemeControls();

  btn?.addEventListener('click',()=>drawer?.classList.contains('is-open')?closeDrawer():openDrawer());
  drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeDrawer));
  desktopMenus().forEach(details=>details.addEventListener('toggle',()=>{
    if(details.open){closeFloatingMenus(details);closeThemeMenus()}
  }));
  document.querySelectorAll('.explore-theme-menu').forEach(details=>details.addEventListener('toggle',()=>{
    if(details.open)closeFloatingMenus();
  }));

  document.addEventListener('click',e=>{
    if(!e.target.closest?.('.explore-mainnav details'))closeFloatingMenus();
    if(!e.target.closest?.('.explore-theme-menu'))closeThemeMenus();
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeDrawer();closeFloatingMenus();closeThemeMenus()}
  });
  window.matchMedia('(min-width:761px)').addEventListener?.('change',e=>{if(e.matches)closeDrawer()});
  window.addEventListener('scroll',()=>topbar?.classList.toggle('is-scrolled',window.scrollY>8),{passive:true});
  window.addEventListener('storage',e=>{
    if(e.key===THEME_KEY&&THEMES.includes(e.newValue))applyTheme(e.newValue,{persist:false});
  });

  topbar?.classList.toggle('is-scrolled',window.scrollY>8);
  html.dataset.webExploreShell='v1.3.2';
  html.classList.add('explore-unification-ready');
})();

/* WEB-EXPLORE PASS 5.3 — canonical public brand layer. */
(() => {
  'use strict';
  if(document.querySelector('script[data-p120-brand-system-loader]') || window.P120_BRAND_SYSTEM) return;
  const base=document.currentScript?.src||document.baseURI;
  const script=document.createElement('script');
  script.src=new URL('p120-brand-system-v1.0.js?v=53',base).href;
  script.async=false;
  script.dataset.p120BrandSystemLoader='5.3';
  document.head.appendChild(script);
})();