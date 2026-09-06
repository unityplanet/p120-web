/* P-120 / HOMEPAGE / IMPLEMENTATION PASS 2
   Controlled-compression public narrative only.
   No measurement, scoring, questionnaire, report, submission, persistence or scientific-authority mutation. */
(()=>{
  'use strict';
  if(window.P120HomepageArchitecturePass2?.version==='1.0') return;

  const scriptUrl=document.currentScript?.src||document.baseURI;
  const homepageDir=new URL('./',scriptUrl);
  const rootUrl=new URL('../',homepageDir);
  const isEn=(document.documentElement.lang||'').toLowerCase().startsWith('en')||/\/en(?:\/|$)/i.test(location.pathname);
  const locale=isEn?'en':'ru';
  const normalizePath=(value)=>{
    const clean=String(value||'/').replace(/\/{2,}/g,'/');
    return clean.endsWith('/')?clean:`${clean}/`;
  };
  const expectedPath=normalizePath(new URL(isEn?'en/':'./',rootUrl).pathname);
  const isPublicMain=normalizePath(location.pathname)===expectedPath;
  const PANEL_ATTR='data-p120-homepage-pass2';
  const STYLE_ATTR='data-p120-homepage-pass2-style';
  const aboutUrl=new URL(isEn?'en/about/':'about/',rootUrl).href;

  const copy=isEn?{
    title:'P-120 — Research Architecture',
    description:'P-120 is a multidimensional research architecture for structured patterns in adult erotic, embodied and relational experience. Research Candidate · 18+.',
    eyebrow:'P-120 · RESEARCH ARCHITECTURE',
    display:'Not one test. Not one final score.',
    body:'P-120 is a multidimensional research architecture for studying structured patterns in adult erotic, embodied and relational experience. It connects measurement, computation, interpretation and validation without making those functions interchangeable.',
    chips:['Research Candidate','18+','multidimensional profile'],
    cta:'What P-120 is',
    note:'System and architecture',
    aria:'P-120 architecture — concise definition'
  }:{
    title:'P-120 — Исследовательская архитектура',
    description:'P-120 — многомерная исследовательская архитектура взрослого эротического, телесного и реляционного опыта. Research Candidate · 18+.',
    eyebrow:'P-120 · ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА',
    display:'Не один тест. Не один итоговый балл.',
    body:'P-120 — многомерная исследовательская архитектура для изучения структурированных закономерностей взрослого эротического, телесного и реляционного опыта. Она связывает измерение, вычисление, интерпретацию и валидацию, не смешивая их роли.',
    chips:['Research Candidate','18+','многомерный профиль'],
    cta:'Что такое P-120',
    note:'Система и её архитектура',
    aria:'P-120 — краткое определение исследовательской архитектуры'
  };

  let observer=null;
  let frame=0;

  function ensureCss(){
    if(document.querySelector(`link[${STYLE_ATTR}]`)) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL('homepage-architecture-pass2.css?v=1',homepageDir).href;
    link.setAttribute(STYLE_ATTR,'1.0');
    document.head.appendChild(link);
  }

  function setMeta(selector,attr,value){
    const node=document.querySelector(selector);
    if(node) node.setAttribute(attr,value);
  }

  function normalizeMetadata(){
    document.title=copy.title;
    const desc=document.querySelector('meta[name="description"]');
    if(desc) desc.setAttribute('content',copy.description);
    setMeta('meta[property="og:title"]','content',copy.title);
    setMeta('meta[property="og:description"]','content',copy.description);
    setMeta('meta[name="twitter:title"]','content',copy.title);
    setMeta('meta[name="twitter:description"]','content',copy.description);
  }

  function makePanel(){
    const panel=document.createElement('aside');
    panel.className='p120-homepage-pass2';
    panel.setAttribute(PANEL_ATTR,'1.0');
    panel.setAttribute('aria-label',copy.aria);
    panel.innerHTML=`
      <div class="p120-homepage-pass2__copy">
        <div class="p120-homepage-pass2__eyebrow"></div>
        <p class="p120-homepage-pass2__display"></p>
        <p class="p120-homepage-pass2__body"></p>
        <div class="p120-homepage-pass2__chips" aria-label="${isEn?'Status':'Статус'}"></div>
      </div>
      <a class="p120-homepage-pass2__cta" href="${aboutUrl}">
        <span class="p120-homepage-pass2__cta-title"></span>
        <span class="p120-homepage-pass2__cta-note"></span>
        <span class="p120-homepage-pass2__cta-arrow" aria-hidden="true">→</span>
      </a>`;
    panel.querySelector('.p120-homepage-pass2__eyebrow').textContent=copy.eyebrow;
    panel.querySelector('.p120-homepage-pass2__display').textContent=copy.display;
    panel.querySelector('.p120-homepage-pass2__body').textContent=copy.body;
    panel.querySelector('.p120-homepage-pass2__cta-title').textContent=copy.cta;
    panel.querySelector('.p120-homepage-pass2__cta-note').textContent=copy.note;
    const chips=panel.querySelector('.p120-homepage-pass2__chips');
    for(const text of copy.chips){
      const chip=document.createElement('span');
      chip.textContent=text;
      chips.appendChild(chip);
    }
    return panel;
  }

  function findInsertionAnchor(section){
    if(!section) return null;
    const shell=section.querySelector(':scope > .section-inner, :scope > .section-content, :scope > .content, :scope > .container, :scope > .shell');
    return shell||section;
  }

  function reconcilePanel(){
    if(!isPublicMain) return;
    const section=document.getElementById('why-important');
    const existing=[...document.querySelectorAll(`[${PANEL_ATTR}]`)];
    if(!section){
      existing.forEach(node=>node.remove());
      return;
    }
    let panel=existing[0]||null;
    existing.slice(1).forEach(node=>node.remove());
    if(!panel) panel=makePanel();
    const anchor=findInsertionAnchor(section);
    if(anchor&&panel.parentElement!==anchor){
      const heading=anchor.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > .section-head, :scope > .chapter-head, :scope > header');
      if(heading) heading.insertAdjacentElement('afterend',panel);
      else anchor.insertAdjacentElement('afterbegin',panel);
    }
  }

  function reconcile(){
    frame=0;
    if(!isPublicMain) return;
    ensureCss();
    normalizeMetadata();
    reconcilePanel();
  }

  function schedule(){
    if(frame) return;
    frame=requestAnimationFrame(reconcile);
  }

  function start(){
    if(!isPublicMain) return;
    ensureCss();
    const root=document.getElementById('app')||document.body;
    observer=new MutationObserver(schedule);
    observer.observe(root,{childList:true,subtree:true});
    window.addEventListener('popstate',schedule,{passive:true});
    window.addEventListener('hashchange',schedule,{passive:true});
    reconcile();
    window.setTimeout(schedule,80);
    window.setTimeout(schedule,260);
    window.setTimeout(schedule,700);
  }

  window.P120HomepageArchitecturePass2=Object.freeze({
    version:'1.0',
    mode:'CONTROLLED_COMPRESSION',
    locale,
    isPublicMain,
    aboutUrl,
    reconcile:schedule
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
