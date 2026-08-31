/* P-120 Web Editorial — final depth statement hook v1.1
   Public editorial presentation only. */
(() => {
  'use strict';
  const depthTexts = new Set([
    'А чтобы увидеть себя объёмнее.',
    'But to see yourself in greater depth.'
  ]);
  const leadTexts = new Set([
    'Не для того, чтобы поместить себя в коробку.',
    'Not to put yourself in a box.'
  ]);
  let scheduled=false;

  function exactElement(texts){
    return [...document.querySelectorAll('p,h1,h2,h3,h4,div,span,strong')].find(el => {
      if(el.children.length) return false;
      return texts.has((el.textContent||'').replace(/\s+/g,' ').trim());
    });
  }
  function frameFor(depth,lead){
    if(!depth) return null;
    let node=depth.parentElement;
    for(let i=0;i<5 && node;i++,node=node.parentElement){
      const t=(node.textContent||'').replace(/\s+/g,' ');
      if((lead && node.contains(lead)) || /поместить себя в коробку|put yourself in a box/i.test(t)) return node;
    }
    return depth.parentElement;
  }
  function run(){
    scheduled=false;
    const depth=exactElement(depthTexts);
    const lead=exactElement(leadTexts);
    if(!depth) return;
    depth.classList.add('p120-depth-statement');
    if(lead) lead.classList.add('p120-depth-lead');
    frameFor(depth,lead)?.classList.add('p120-depth-frame');
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run)}
  function start(){
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
    run();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
