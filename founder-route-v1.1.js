/* P-120 Founder Route v1.5 — WEB-EXPLORE PASS 5 bilingual bridge
   Stabilises live Explore destinations in the main navigation at first paint,
   keeps the Founder page on its dedicated route, loads the legacy home reconciliation
   adapter and the unified mega-menu presentation layer.
   No assessment, scoring, report, science or persistence mutations. */
(() => {
  'use strict';

  if (!document.getElementById('p120-brand-origin-mobile-close-fix-v1')) {
    const style=document.createElement('style');
    style.id='p120-brand-origin-mobile-close-fix-v1';
    style.textContent=`
@media(max-width:800px){
  .brand-origin-interstitial .brand-origin-interstitial-close{
    position:absolute!important;top:14px!important;right:14px!important;left:auto!important;
    width:40px!important;min-width:40px!important;max-width:40px!important;height:40px!important;min-height:40px!important;
    padding:0!important;margin:0!important;display:grid!important;place-items:center!important;line-height:1!important;
    box-sizing:border-box!important;z-index:5!important;
  }
  .brand-origin-interstitial-kicker{padding-right:54px!important}
}`;
    document.head.appendChild(style);
  }

  const isEn=/\/en\/(?:index\.html)?$/i.test(location.pathname);
  const CREATOR='[data-ecosystem-route="creator"],[data-ecosystem-mobile="creator"]';
  const DEEPER='[data-ecosystem-route="deeper"],[data-ecosystem-mobile="deeper"]';
  const TOGETHER='[data-ecosystem-route="together"],[data-ecosystem-mobile="together"]';
  let timer=0;

  function pageUrl(path){return new URL(path,document.baseURI).href;}
  function creatorUrl(){return pageUrl('creator/');}

  function loadNavigationUnification(){
    if(document.querySelector('link[data-p120-navigation-unification]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL(isEn?'../navigation-unification-v1.0.css?v=nav50':'navigation-unification-v1.0.css?v=nav50',document.baseURI).href;
    link.dataset.p120NavigationUnification='v1.0';
    document.head.appendChild(link);
  }

  function activateNode(node,note,label){
    node.removeAttribute('aria-disabled');
    node.querySelector('.ecosystem-item-status,.ecosystem-mobile-status')?.remove();
    const noteNode=node.querySelector('.ecosystem-item-note,small');
    if(noteNode&&noteNode.textContent!==note)noteNode.textContent=note;
    if(label)node.setAttribute('aria-label',label);
  }

  function patch(){
    timer=0;
    document.querySelectorAll(CREATOR).forEach(node=>activateNode(node,
      isEn?'Personal context behind P-120':'Личный контекст появления P-120',
      isEn?'From the creator — open dedicated page':'От создателя — открыть отдельную страницу'));
    document.querySelectorAll(DEEPER).forEach(node=>activateNode(node,
      isEn?'Extended Research System · optional research layers':'Система углублённых исследований · дополнительные модули',
      isEn?'Want to go deeper? — open page':'Хотите глубже? — открыть страницу'));
    document.querySelectorAll(TOGETHER).forEach(node=>activateNode(node,
      isEn?'Dyadic Research Layer · relationship research':'Исследование пары · диадический слой',
      isEn?'Are we together? — open page':'Мы вместе? — открыть страницу'));
  }

  function loadExplorePass2(){
    if(document.querySelector('script[data-p120-extended-navigation],script[data-web-explore-pass2-loader],script[src*="extended-research-navigation-v1.0.js"]'))return;
    const script=document.createElement('script');
    const rel=isEn?'../extended-research-navigation-v1.0.js?v=exp50':'extended-research-navigation-v1.0.js?v=exp50';
    script.src=new URL(rel,document.baseURI).href;
    script.async=false;script.dataset.webExplorePass2Loader='v2.1';document.body.appendChild(script);
  }

  function intercept(event){
    const creator=event.target.closest?.(CREATOR);
    const deeper=event.target.closest?.(DEEPER);
    const together=event.target.closest?.(TOGETHER);
    const target=creator||deeper||together;
    if(!target)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    location.href=creator?creatorUrl():(deeper?pageUrl('extended/'):pageUrl('together/'));
  }

  function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(patch,30);}
  function start(){
    loadNavigationUnification();
    document.addEventListener('click',intercept,true);
    const root=document.getElementById('app')||document.body;
    new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    patch();loadExplorePass2();
    let retries=0;const retry=setInterval(()=>{patch();if(++retries>24)clearInterval(retry)},80);
    window.P120_FOUNDER_ROUTE={version:'1.5',url:creatorUrl(),webExplorePass2:true,bilingual:true,navigationUnification:'v1.0',exploreRoutes:'live'};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
