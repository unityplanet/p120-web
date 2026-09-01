/* P-120 Science Navigation Reconciliation v1.0
   Navigation ownership only. No measurement, scoring, report or scientific-content changes. */
(()=>{
  'use strict';
  const HASHES=new Set(['#scientific-base','#science-base']);
  const DESKTOP_MIN=1121;
  let frame=0,restore=null;
  const root=()=>document.scrollingElement||document.documentElement;
  const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
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
  function clean(){if(HASHES.has(location.hash))history.replaceState(null,'',location.pathname+location.search);}
  function openBase(attempt=0){
    if(document.querySelector('.science-page,[data-science-root],#science-top')){clean();document.documentElement.dataset.p120ScienceDirection='base';return;}
    const b=document.querySelector('.topnav [data-science],button[data-science],.science-navlink[data-science]');
    if(b){clean();b.click();document.documentElement.dataset.p120ScienceDirection='base';return;}
    if(attempt<60)setTimeout(()=>openBase(attempt+1),45);
  }
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-chapter-jump="science"],[data-chapter-mobile="science"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();scrollChapter();},true);
  function hash(){if(HASHES.has(location.hash))setTimeout(()=>openBase(),0);}
  addEventListener('hashchange',hash);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hash,{once:true});else hash();
  document.documentElement.dataset.p120ScienceNavigation='reconciled-v1';
})();
