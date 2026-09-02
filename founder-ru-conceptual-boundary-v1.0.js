/* P-120 Founder — RU Conceptual Origin/Evidence Boundary v1.0
   Controlled editorial bridge authorised by Conceptual Entry PASS 2.5.
   Presentation copy only; no scientific model, measurement, scoring or runtime mutation. */
(() => {
  'use strict';
  if(!/^ru$/i.test(document.documentElement.lang||'')) return;
  if(!/\/creator\/(?:index\.html)?$/i.test(location.pathname)) return;

  const VERSION='P2.5-RU-v1.0';
  function apply(){
    const fnd02=document.querySelector('#founder-story #fnd-02 .founder-story__reading');
    if(!fnd02)return false;
    if(!fnd02.querySelector('[data-founder-origin-boundary]')){
      const block=document.createElement('div');
      block.className='founder-story__origin-boundary';
      block.dataset.founderOriginBoundary=VERSION;
      block.innerHTML='<p><strong>Любой большой вопрос откуда-то начинается. Этот начался с личного опыта.</strong></p><p>Но личный опыт может поставить вопрос — он не может служить доказательством ответа.</p><p>Поэтому P-120 пришлось выйти за пределы моей собственной истории и стать исследовательской задачей.</p>';
      fnd02.appendChild(block);
    }
    document.querySelectorAll('.creator-topbar a[href*="why-p120"]').forEach(a=>{if((a.textContent||'').trim()==='Почему P-120?')a.textContent='Происхождение названия';});
    if(!document.getElementById('founder-origin-boundary-p25-style')){
      const style=document.createElement('style');style.id='founder-origin-boundary-p25-style';
      style.textContent='.founder-story__origin-boundary{margin-top:clamp(34px,4vw,62px);padding-top:clamp(22px,2.5vw,36px);border-top:1px solid var(--line,rgba(47,125,120,.25));max-width:58rem}.founder-story__origin-boundary p{margin:0 0 .9em}.founder-story__origin-boundary p:last-child{margin-bottom:0}';
      document.head.appendChild(style);
    }
    document.documentElement.dataset.founderOriginEvidenceBoundary=VERSION;
    return true;
  }
  if(apply())return;
  const mo=new MutationObserver(()=>{if(apply())mo.disconnect()});
  mo.observe(document.documentElement,{childList:true,subtree:true});
})();
