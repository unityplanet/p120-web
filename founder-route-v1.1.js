/* P-120 Founder Route v1.1
   Keeps the full Founder Editorial Story off the main page and activates the existing
   Navigation Architecture v2 "creator" entry as a dedicated-page route.
   No assessment, scoring, report, science or persistence mutations. */
(() => {
  'use strict';

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
