/* P-120 Founder Route v1.1
   Keeps the full Founder Editorial Story off the main page and activates the existing
   Navigation Architecture v2 "creator" entry as a dedicated-page route.
   Includes a narrow shared mobile correction for the Brand Origin interstitial close control.
   No assessment, scoring, report, science or persistence mutations. */
(() => {
  'use strict';

  /* The interstitial's mobile catch-all button rule gives every button width:100%.
     That unintentionally stretches the absolute close button across the card and
     centers the × over the kicker. Restore a dedicated close-control safe area.
     This runs for both RU and EN public pages. */
  if (!document.getElementById('p120-brand-origin-mobile-close-fix-v1')) {
    const style=document.createElement('style');
    style.id='p120-brand-origin-mobile-close-fix-v1';
    style.textContent=`
@media(max-width:800px){
  .brand-origin-interstitial .brand-origin-interstitial-close{
    position:absolute!important;
    top:14px!important;
    right:14px!important;
    left:auto!important;
    width:40px!important;
    min-width:40px!important;
    max-width:40px!important;
    height:40px!important;
    min-height:40px!important;
    padding:0!important;
    margin:0!important;
    display:grid!important;
    place-items:center!important;
    line-height:1!important;
    box-sizing:border-box!important;
    z-index:5!important;
  }
  .brand-origin-interstitial-kicker{
    padding-right:54px!important;
  }
}
`;
    document.head.appendChild(style);
  }

  if (/\/en\/(?:index\.html)?$/i.test(location.pathname)) return;

  const SELECTOR='[data-ecosystem-route="creator"],[data-ecosystem-mobile="creator"]';
  let timer=0;

  function creatorUrl(){
    return new URL('creator/', document.baseURI).href;
  }

  function patch(){
    timer=0;
    document.querySelectorAll(SELECTOR).forEach(btn=>{
      btn.removeAttribute('aria-disabled');
      btn.setAttribute('aria-label','От создателя — открыть отдельную страницу');
      btn.querySelector('.ecosystem-item-status,.ecosystem-mobile-status')?.remove();
    });
  }

  function intercept(event){
    const target=event.target.closest?.(SELECTOR);
    if(!target)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    location.href=creatorUrl();
  }

  function schedule(){
    if(timer)clearTimeout(timer);
    timer=setTimeout(patch,55);
  }

  function start(){
    document.addEventListener('click',intercept,true);
    const root=document.getElementById('app')||document.body;
    new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    patch();
    let retries=0;
    const retry=setInterval(()=>{patch();if(++retries>30)clearInterval(retry)},100);
    window.P120_FOUNDER_ROUTE={version:'1.1',url:creatorUrl()};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
