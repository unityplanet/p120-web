/* P-120 EN public site runtime v1.0
   Scope: public editorial home + Scientific Base only.
   Questionnaire/preflight/items/scoring/results are intentionally not localized. */
(() => {
  'use strict';
  const D = window.P120_EN_TRANSLATIONS || new Map();
  let scheduled=false;
  let initialHomeGuardDone=false;

  const shellSelectors = '.topbar,.mobile-menu,.mobile-bottom-nav,#p120-chapter-navigation';
  const publicSelectors = '.editorial-home,.science-page,.science-shell,.science-hero,#science-top,[id^="science-"]';

  function dynamicTranslate(s){
    if(D.has(s)) return D.get(s);
    let m;
    if((m=s.match(/^(\d+) стр\.$/))) return `${m[1]} pp.`;
    if((m=s.match(/^(\d+) источников\.$/))) return `${m[1]} sources.`;
    if((m=s.match(/^(\d+) различий$/))) return `${m[1]} distinctions`;
    if((m=s.match(/^Критерий · (.+)$/))) return `Criterion · ${D.get(m[1]) || m[1]}`;
    if((m=s.match(/^Граница:\s*(.+)$/))) return `Boundary: ${D.get(m[1]) || m[1]}`;
    if((m=s.match(/^У вас сохранена незавершённая сессия · (\d+)%$/))) return `You have an unfinished Russian questionnaire session · ${m[1]}%`;
    if((m=s.match(/^Продолжить с (.+)$/))) return `Continue Russian questionnaire from ${m[1]}`;
    return s;
  }

  function replaceTextNode(node){
    const raw=node.nodeValue;
    if(!raw || !/[А-Яа-яЁё]/.test(raw)) return;
    const lead=raw.match(/^\s*/)?.[0] || '';
    const tail=raw.match(/\s*$/)?.[0] || '';
    const core=raw.trim();
    if(!core) return;
    const en=dynamicTranslate(core);
    if(en!==core) node.nodeValue=lead+en+tail;
  }

  function translateAttributes(el){
    for(const attr of ['aria-label','placeholder','title']){
      const raw=el.getAttribute?.(attr);
      if(!raw || !/[А-Яа-яЁё]/.test(raw)) continue;
      const en=dynamicTranslate(raw.trim());
      if(en!==raw.trim()) el.setAttribute(attr,en);
    }
  }

  function translateTree(root){
    if(!root) return;
    if(root.nodeType===1) translateAttributes(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
    let n;
    while((n=walker.nextNode())){
      if(n.nodeType===Node.TEXT_NODE) replaceTextNode(n);
      else translateAttributes(n);
    }
  }

  function translateVisiblePublic(){
    document.querySelectorAll(shellSelectors).forEach(translateTree);
    document.querySelectorAll(publicSelectors).forEach(translateTree);
    document.documentElement.lang='en';
    document.documentElement.dataset.publicLanguage='en';
    document.title='P-120 — architecture of attraction and intimacy';
  }

  function repoRootPath(){
    const p=location.pathname;
    const root=p.replace(/\/en\/(?:index\.html)?$/i,'/');
    return root.endsWith('/')?root:root+'/';
  }

  function russianQuestionnaireRedirect(mode='start'){
    const href = repoRootPath() + (mode==='resume' ? '?resume=1' : '?start=1');
    location.href=href;
  }

  function bindAssessmentBoundary(){
    if(document.documentElement.dataset.enAssessmentBoundary==='true') return;
    document.documentElement.dataset.enAssessmentBoundary='true';
    document.addEventListener('click',ev=>{
      const el=ev.target.closest?.('button,a');
      if(!el) return;
      const txt=(el.textContent||'').replace(/\s+/g,' ').trim();
      const isResume=/Continue questionnaire · Russian|Continue Russian questionnaire/.test(txt);
      const isStart=/Take P-120 · Russian questionnaire/.test(txt);
      if(!isResume && !isStart) return;
      ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
      russianQuestionnaireRedirect(isResume?'resume':'start');
    },true);
  }

  function ensureQuestionnaireBoundaryNote(){
    document.querySelectorAll('.editorial-home button,.editorial-home a,.mobile-menu button').forEach(el=>{
      const txt=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/Take P-120 · Russian questionnaire/.test(txt)){
        el.setAttribute('title','The research questionnaire is currently available in Russian.');
      }
    });
  }

  function initialHomeGuard(){
    if(initialHomeGuardDone) return;
    initialHomeGuardDone=true;
    window.setTimeout(()=>{
      const publicHome=document.querySelector('.editorial-home');
      const science=document.querySelector('#science-top,.science-page,.science-shell');
      if(!publicHome && !science && typeof window.goHome==='function'){
        try{ window.goHome(); }catch(_){}
      }
    },120);
  }

  function addMissingRuntimeLabels(){
    const extra=[
      ['Архитектура','Architecture'],['Две системы','Two systems'],['Результат','Result'],['По главам','Chapters'],
      ['Акт I · внутренняя система','Act I · inner system'],['Акт II · встреча архитектур','Act II · architectures meet'],['что покажет P-120','what P-120 can show'],['Акт III · научная опора','Act III · scientific grounding'],['Навигация по главам P-120','P-120 chapter navigation'],
      ['А хотите ещё глубже?','Want to go deeper?'],['Extended Research Set · дополнительные модули','Extended Research Set · supplemental modules']
    ];
    extra.forEach(([ru,en])=>{if(!D.has(ru))D.set(ru,en)});
  }

  function run(){
    scheduled=false;
    translateVisiblePublic();
    ensureQuestionnaireBoundaryNote();
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run)}
  function start(){
    addMissingRuntimeLabels();
    bindAssessmentBoundary();
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-label','placeholder','title']});
    initialHomeGuard();
    run();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
