/* P-120 Founder — RU Conceptual Origin/Evidence Boundary v1.0
   Controlled editorial bridge authorised by Conceptual Entry PASS 2.5.
   Presentation copy only; no scientific model, measurement, scoring or runtime mutation. */
(() => {
  'use strict';
  if(!/^ru$/i.test(document.documentElement.lang||'')) return;
  if(!/\/creator\/(?:index\.html)?$/i.test(location.pathname)) return;

  const VERSION='P2.5-RU-v1.0';
  let timer=0;
  function syncNav(){
    document.querySelectorAll('.creator-topbar a[href*="why-p120"]').forEach(a=>{
      if((a.textContent||'').trim()!=='Происхождение названия')a.textContent='Происхождение названия';
    });
  }
  function apply(){
    syncNav();
    const fnd02=document.querySelector('#founder-story #fnd-02 .founder-story__reading');
    if(!fnd02)return false;
    if(!fnd02.querySelector('[data-founder-origin-boundary]')){
      const block=document.createElement('div');
      block.className='founder-story__origin-boundary';
      block.dataset.founderOriginBoundary=VERSION;
      block.innerHTML='<p><strong>Любой большой вопрос откуда-то начинается. Этот начался с личного опыта.</strong></p><p>Но личный опыт может поставить вопрос — он не может служить доказательством ответа.</p><p>Поэтому P-120 пришлось выйти за пределы моей собственной истории и стать исследовательской задачей.</p>';
      fnd02.appendChild(block);
    }
    if(!document.getElementById('founder-origin-boundary-p25-style')){
      const style=document.createElement('style');style.id='founder-origin-boundary-p25-style';
      style.textContent='.founder-story__origin-boundary{margin-top:clamp(34px,4vw,62px);padding-top:clamp(22px,2.5vw,36px);border-top:1px solid var(--line,rgba(47,125,120,.25));max-width:58rem}.founder-story__origin-boundary p{margin:0 0 .9em}.founder-story__origin-boundary p:last-child{margin-bottom:0}';
      document.head.appendChild(style);
    }
    document.documentElement.dataset.founderOriginEvidenceBoundary=VERSION;
    return true;
  }
  function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(()=>{apply();syncNav();},30)}
  const start=()=>{
    apply();
    const top=document.querySelector('.creator-topbar');
    if(top)new MutationObserver(schedule).observe(top,{childList:true,subtree:true,characterData:true});
    const app=document.getElementById('app');
    if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:false});
    setTimeout(()=>{apply();syncNav();},300);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
