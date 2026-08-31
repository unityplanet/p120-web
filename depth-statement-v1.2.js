/* P-120 Web Editorial — final depth statement hook v1.2
   Splits the two closing statements into explicit staircase lines.
   Public editorial presentation only. */
(() => {
  'use strict';

  const maps = new Map([
    ['Не для того, чтобы поместить себя в коробку.', ['Не для того,','чтобы поместить себя','в коробку.']],
    ['А чтобы увидеть себя объёмнее.', ['А чтобы','увидеть себя','объёмнее.']],
    ['Not to put yourself in a box.', ['Not to','put yourself','in a box.']],
    ['But to see yourself in greater depth.', ['But to','see yourself','in greater depth.']]
  ]);
  const leadTexts = new Set(['Не для того, чтобы поместить себя в коробку.','Not to put yourself in a box.']);
  const depthTexts = new Set(['А чтобы увидеть себя объёмнее.','But to see yourself in greater depth.']);
  let scheduled=false;

  function normalized(el){return (el.textContent||'').replace(/\s+/g,' ').trim()}
  function candidate(texts){
    return [...document.querySelectorAll('p,h1,h2,h3,h4,div,span,strong')].find(el=>{
      if(el.dataset.p120Staircase==='true') return false;
      if(el.children.length) return false;
      return texts.has(normalized(el));
    });
  }
  function frameFor(depth,lead){
    if(!depth) return null;
    let node=depth.parentElement;
    for(let i=0;i<6&&node;i++,node=node.parentElement){
      const t=normalized(node);
      if((lead&&node.contains(lead))||/поместить себя в коробку|put yourself in a box/i.test(t)) return node;
    }
    return depth.parentElement;
  }
  function staircase(el){
    if(!el||el.dataset.p120Staircase==='true') return;
    const full=normalized(el);
    const lines=maps.get(full);
    if(!lines) return;
    /* EN build is initially rendered from RU source and localized at runtime.
       Do not split RU source before the EN localization layer has translated it. */
    if(/\/en\/(?:index\.html)?$/i.test(location.pathname)&&/[А-Яа-яЁё]/.test(full)) return;
    el.dataset.p120Staircase='true';
    el.textContent='';
    const wrap=document.createElement('span');
    wrap.className='p120-stair-lines';
    lines.forEach((line,i)=>{
      const s=document.createElement('span');
      s.className='p120-stair-line';
      s.style.setProperty('--step',String(i));
      s.textContent=line;
      wrap.appendChild(s);
    });
    el.appendChild(wrap);
  }
  function run(){
    scheduled=false;
    const depth=candidate(depthTexts);
    const lead=candidate(leadTexts);
    if(depth){depth.classList.add('p120-depth-statement');staircase(depth)}
    if(lead){lead.classList.add('p120-depth-lead');staircase(lead)}
    const styledDepth=document.querySelector('.p120-depth-statement');
    const styledLead=document.querySelector('.p120-depth-lead');
    frameFor(styledDepth,styledLead)?.classList.add('p120-depth-frame');
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run)}
  function start(){
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
    run();
    setTimeout(run,180);
    setTimeout(run,600);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
