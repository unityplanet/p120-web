/* P-120 Science Navigation Reconciliation v1.1
   Dedicated-page ownership for Scientific Base; Home chapter Science remains in-page. */
(()=>{
  'use strict';
  const HASHES=new Set(['#scientific-base','#science-base']);
  const DESKTOP_MIN=1121;
  let frame=0,restore=null;
  const root=()=>document.scrollingElement||document.documentElement;
  const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const scienceUrl=()=>new URL('science/',location.href).href;
  function topOffset(){const h=Math.max(58,Math.round(document.querySelector('.topbar')?.getBoundingClientRect().height||70));const n=innerWidth>=DESKTOP_MIN?Math.max(48,Math.round(document.querySelector('.chapter-jump-nav-inner')?.getBoundingClientRect().height||48))+18:14;return h+n;}
  function write(v){root().scrollTop=Math.max(0,v);}
  function begin(){if(restore){restore();restore=null;}const h=document.documentElement,b=document.body,hs=h.style.scrollBehavior,bs=b?.style.scrollBehavior||'';h.style.scrollBehavior='auto';if(b)b.style.scrollBehavior='auto';restore=()=>{h.style.scrollBehavior=hs;if(b)b.style.scrollBehavior=bs;restore=null;};}
  function end(){if(restore){const fn=restore;requestAnimationFrame(fn);}}
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function scrollChapter(attempt=0){
    const home=document.querySelector('.editorial-home'),target=document.getElementById('science-foundation');
    if(!(home&&target)){if(attempt<45)setTimeout(()=>scrollChapter(attempt+1),45);return;}
    if(frame){cancelAnimationFrame(frame);frame=0;}begin();
    const r=root(),start=r.scrollTop,dest=Math.max(0,start+target.getBoundingClientRect().top-topOffset()),delta=dest-start;
    document.documentElement.dataset.p120ScienceDirection='chapter';
    if(reduced()||Math.abs(delta)<2){write(dest);end();return;}
    const dur=Math.min(760,Math.max(360,Math.abs(delta)*.42)),t0=performance.now();
    const step=now=>{const p=Math.min(1,(now-t0)/dur);write(start+delta*ease(p));if(p<1){frame=requestAnimationFrame(step);return;}frame=0;const live=document.getElementById('science-foundation');if(live){const c=live.getBoundingClientRect().top-topOffset();if(Math.abs(c)>2)write(root().scrollTop+c);}end();};
    frame=requestAnimationFrame(step);
  }
  function goDedicated(){document.documentElement.dataset.p120ScienceDirection='dedicated';location.href=scienceUrl();}
  function capture(event){
    const chapter=event.target.closest?.('[data-chapter-jump="science"],[data-chapter-mobile="science"]');
    if(chapter){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();scrollChapter();return;}
    const base=event.target.closest?.('[data-science],[data-mobile-jump-science]');
    if(base){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();goDedicated();}
  }
  function legacyHash(){if(HASHES.has(location.hash))goDedicated();}
  function migrateLegacyScreen(){if(document.querySelector('.science-page')&&!document.querySelector('.editorial-home'))goDedicated();}
  document.addEventListener('click',capture,true);
  addEventListener('hashchange',legacyHash);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{legacyHash();setTimeout(migrateLegacyScreen,0)},{once:true});else{legacyHash();setTimeout(migrateLegacyScreen,0);}
  document.documentElement.dataset.p120ScienceNavigation='dedicated-v1.1';
})();

/* Production bundle bridge: Chapter 04 has its own reconciliation owner.
   Resolve the sibling script from this runtime's URL so RU / and EN /en/ load
   the same root asset without changing either document or the scientific route. */
(()=>{
  'use strict';
  const ID='p120-extended-chapter-navigation-reconciliation';
  if(document.getElementById(ID))return;
  const current=document.currentScript;
  const base=current?.src||new URL('science-navigation-reconciliation-v1.0.js',location.href).href;
  const script=document.createElement('script');
  script.id=ID;
  script.src=new URL('extended-chapter-navigation-reconciliation-v1.0.js',base).href;
  script.dataset.p120ExtendedChapterNavigation='reconciled-v1';
  document.head.appendChild(script);
})();
