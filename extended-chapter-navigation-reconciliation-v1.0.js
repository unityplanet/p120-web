/* P-120 Extended Chapter Navigation Reconciliation v1.0
   Navigation ownership only. No measurement, scoring, questionnaire, report,
   scientific-content, persistence or backend changes. */
(()=>{
  'use strict';

  const TARGET_ID='extended-research-entry';
  const SELECTOR='[data-chapter-jump="extended"],[data-chapter-mobile="extended"]';
  const DESKTOP_MIN=1121;
  let frame=0;
  let restore=null;

  const root=()=>document.scrollingElement||document.documentElement;
  const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function topOffset(){
    const topbar=Math.max(58,Math.round(document.querySelector('.topbar')?.getBoundingClientRect().height||70));
    const chapter=innerWidth>=DESKTOP_MIN
      ? Math.max(48,Math.round(document.querySelector('.chapter-jump-nav-inner')?.getBoundingClientRect().height||48))+18
      : 14;
    return topbar+chapter;
  }

  function write(value){
    root().scrollTop=Math.max(0,value);
  }

  function beginOwnedScroll(){
    if(restore){restore();restore=null;}
    const html=document.documentElement;
    const body=document.body;
    const htmlInline=html.style.scrollBehavior;
    const bodyInline=body?.style.scrollBehavior||'';
    html.style.scrollBehavior='auto';
    if(body)body.style.scrollBehavior='auto';
    restore=()=>{
      html.style.scrollBehavior=htmlInline;
      if(body)body.style.scrollBehavior=bodyInline;
      restore=null;
    };
    write(root().scrollTop);
  }

  function endOwnedScroll(){
    if(!restore)return;
    const fn=restore;
    requestAnimationFrame(fn);
  }

  function ease(t){
    return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  }

  function markActive(){
    document.querySelectorAll('[data-chapter-jump],[data-chapter-mobile]').forEach(btn=>{
      const active=(btn.dataset.chapterJump||btn.dataset.chapterMobile)==='extended';
      btn.classList.toggle('is-active',active);
      if(active)btn.setAttribute('aria-current','location');
      else btn.removeAttribute('aria-current');
    });
    document.documentElement.style.setProperty('--chapter-progress','80%');
  }

  function scrollToDeeper(attempt=0){
    const home=document.querySelector('.editorial-home');
    const target=document.getElementById(TARGET_ID);
    if(!(home&&target&&target.isConnected)){
      if(attempt<60)setTimeout(()=>scrollToDeeper(attempt+1),45);
      return;
    }

    if(frame){cancelAnimationFrame(frame);frame=0;}
    beginOwnedScroll();

    const scroller=root();
    const start=scroller.scrollTop;
    const destination=Math.max(0,start+target.getBoundingClientRect().top-topOffset());
    const delta=destination-start;
    document.documentElement.dataset.p120ExtendedChapterDirection='home-teaser';
    markActive();

    if(reduced()||Math.abs(delta)<2){
      write(destination);
      markActive();
      endOwnedScroll();
      return;
    }

    const duration=Math.min(760,Math.max(360,Math.abs(delta)*.42));
    const t0=performance.now();
    const step=now=>{
      const p=Math.min(1,(now-t0)/duration);
      write(start+delta*ease(p));
      if(p<1){frame=requestAnimationFrame(step);return;}
      frame=0;
      const live=document.getElementById(TARGET_ID);
      if(live?.isConnected){
        const correction=live.getBoundingClientRect().top-topOffset();
        if(Math.abs(correction)>2)write(root().scrollTop+correction);
      }
      markActive();
      setTimeout(markActive,80);
      endOwnedScroll();
    };
    frame=requestAnimationFrame(step);
  }

  document.addEventListener('click',event=>{
    const control=event.target.closest?.(SELECTOR);
    if(!control)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    try{
      if(typeof window.closeMobileMenu==='function')window.closeMobileMenu();
      else document.body.classList.remove('mobile-menu-open');
    }catch(_){document.body.classList.remove('mobile-menu-open');}
    scrollToDeeper();
  },true);

  document.documentElement.dataset.p120ExtendedChapterNavigation='reconciled-v1';
})();
