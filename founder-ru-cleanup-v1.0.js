/* P-120 Founder RU Cleanup v1.0
   Visible-language cleanup only. Technical identifiers (FND-xx, P-120, Di) remain unchanged. */
(() => {
  'use strict';
  if(!/^ru$/i.test(document.documentElement.lang||'')) return;
  function apply(){
    const root=document.getElementById('founder-story');if(!root)return false;
    const north=root.querySelector('#fnd-10 .founder-story__eyebrow');
    if(north) north.textContent='10 / Главный ориентир P-120';
    document.documentElement.dataset.founderRuCleanup='v1.0';
    return true;
  }
  if(apply())return;
  const mo=new MutationObserver(()=>{if(apply())mo.disconnect()});
  mo.observe(document.documentElement,{childList:true,subtree:true});
})();
