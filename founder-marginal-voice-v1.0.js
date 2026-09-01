/* P-120 Founder Marginal Voice v1.0
   Exactly three controlled marginal notes on /creator/.
   No experiment controls, query parameters, identity changes or copy mutations.
*/
(() => {
  'use strict';

  function mark(selector,index){
    const node=document.querySelector(selector);
    if(!node)return false;
    node.classList.add('founder-story__marginal-note');
    node.dataset.noteIndex=index;
    return true;
  }

  function apply(){
    const ok=[
      mark('#fnd-02 .founder-story__reading > p:last-child','01'),
      mark('#fnd-06 .founder-story__reading > p:nth-child(2)','02'),
      mark('#fnd-09 .founder-story__boundary-copy > p:nth-child(3)','03')
    ];
    if(ok.every(Boolean)) document.documentElement.dataset.fndMarginalVoice='v1.0';
    return ok.every(Boolean);
  }

  if(apply())return;
  const mo=new MutationObserver(()=>{if(apply())mo.disconnect();});
  mo.observe(document.documentElement,{childList:true,subtree:true});
})();
