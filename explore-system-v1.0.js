/* P-120 WEB-EXPLORE PASS 3 — shared public Explore shell v1.1.
   Presentation/navigation only. No assessment, scoring, persistence or report logic. */
(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||document.baseURI;
  const head=document.head||document.documentElement;

  /* Critical production repair: the PASS-2 base CSS scoped .mobile-drawer only
     inside the mobile media query. Until the refinement stylesheet loads, keep
     the drawer out of desktop document flow. */
  if(!document.getElementById('p120-explore-critical-v11')){
    const critical=document.createElement('style');
    critical.id='p120-explore-critical-v11';
    critical.textContent='.mobile-drawer{display:none!important}@media(max-width:760px){.mobile-drawer{display:block!important}}';
    head.appendChild(critical);
  }

  if(!document.querySelector('link[data-p120-explore-refinement]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL('explore-refinement-v1.0.css?v=exp30',scriptUrl).href;
    link.dataset.p120ExploreRefinement='v1.0';
    link.addEventListener('load',()=>document.documentElement.classList.add('explore-refinement-ready'),{once:true});
    head.appendChild(link);
  }

  const btn=document.querySelector('[data-explore-menu]');
  const drawer=document.querySelector('[data-explore-drawer]');

  function close(){
    if(!drawer||!btn)return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
  }
  function open(){
    if(!drawer||!btn)return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
    btn.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
  }

  btn?.addEventListener('click',()=>drawer?.classList.contains('is-open')?close():open());
  drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  window.matchMedia('(min-width:761px)').addEventListener?.('change',e=>{if(e.matches)close()});

  document.documentElement.dataset.webExploreShell='v1.1';
})();
