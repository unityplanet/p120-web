/* P-120 WEB-EXPLORE PASS 4 — shared public Explore shell v1.2.
   Presentation/navigation/localisation only. No assessment, scoring, persistence or report logic. */
(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||document.baseURI;
  const head=document.head||document.documentElement;
  const html=document.documentElement;
  const pathname=location.pathname;
  const pageKind=/\/extended\/(?:index\.html)?$/i.test(pathname)?'extended':(/\/together\/(?:index\.html)?$/i.test(pathname)?'together':'');
  const isEn=html.lang.toLowerCase().startsWith('en')||/\/en\//i.test(pathname);

  if(!document.getElementById('p120-explore-critical-v12')){
    const critical=document.createElement('style');
    critical.id='p120-explore-critical-v12';
    critical.textContent='.mobile-drawer{display:none!important}@media(max-width:760px){.mobile-drawer{display:block!important}}';
    head.appendChild(critical);
  }

  if(!document.querySelector('link[data-p120-explore-refinement]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL('explore-refinement-v1.1.css?v=exp41',scriptUrl).href;
    link.dataset.p120ExploreRefinement='v1.1';
    link.addEventListener('load',()=>html.classList.add('explore-refinement-ready'),{once:true});
    head.appendChild(link);
  }

  function projectRoot(){
    const path=pathname.replace(/(?:en\/)?(?:extended|together)\/(?:index\.html)?$/i,'');
    return path.endsWith('/')?path:`${path}/`;
  }

  function addLanguageSwitch(){
    if(!pageKind)return;
    const inner=document.querySelector('.explore-topbar__inner');
    if(!inner||inner.querySelector('.explore-lang-switch'))return;
    const root=projectRoot();
    const ru=`${root}${pageKind}/`;
    const en=`${root}en/${pageKind}/`;
    const nav=document.createElement('nav');
    nav.className='explore-lang-switch';
    nav.setAttribute('aria-label',isEn?'Language':'Язык');
    nav.innerHTML=`<a href="${ru}" lang="ru" ${!isEn?'aria-current="page"':''}>RU</a><a href="${en}" lang="en" ${isEn?'aria-current="page"':''}>EN</a>`;
    const menu=inner.querySelector('.explore-menu-btn');
    inner.insertBefore(nav,menu||null);
  }

  const ruReplacements=[
    ['P-120 · EXTENDED RESEARCH SYSTEM','P-120 · СИСТЕМА УГЛУБЛЁННЫХ ИССЛЕДОВАНИЙ'],
    ['P-120 · DYADIC RESEARCH LAYER','P-120 · ДИАДИЧЕСКИЙ ИССЛЕДОВАТЕЛЬСКИЙ СЛОЙ'],
    ['Optional Deep-Dive Research Layers','Дополнительные углублённые исследовательские слои'],
    ['Dyadic Research Architecture','Архитектура исследования пары'],
    ['Research system in development','Исследовательская система в разработке'],
    ['Research preview','Исследовательский предпросмотр'],
    ['TWO INDEPENDENT SYSTEMS','ДВЕ НЕЗАВИСИМЫЕ СИСТЕМЫ'],
    ['FOUR-LEVEL COMPATIBILITY DOCTRINE','ЧЕТЫРЁХУРОВНЕВАЯ МОДЕЛЬ СОВМЕСТИМОСТИ'],
    ['DYNAMIC RESEARCH ENGINES','ДИНАМИЧЕСКИЕ ИССЛЕДОВАТЕЛЬСКИЕ МОДУЛИ'],
    ['PRIVACY BY DESIGN','КОНФИДЕНЦИАЛЬНОСТЬ ПО УМОЛЧАНИЮ'],
    ['FUTURE RESULT ARCHITECTURE','БУДУЩАЯ АРХИТЕКТУРА РЕЗУЛЬТАТА'],
    ['SCIENTIFIC BOUNDARY','НАУЧНАЯ ГРАНИЦА'],
    ['DYADIC PROCESS','ДИАДИЧЕСКИЙ ПРОЦЕСС'],
    ['ONE LEVEL DEEPER','ЕЩЁ ОДИН УРОВЕНЬ ГЛУБЖЕ'],
    ['CROSS-LAYER RESEARCH','МЕЖСЛОЙНОЕ ИССЛЕДОВАНИЕ'],
    ['OPTIONAL RESEARCH LENSES','ДОПОЛНИТЕЛЬНЫЕ ИССЛЕДОВАТЕЛЬСКИЕ ЛИНЗЫ'],
    ['CORE ↔ OPTIONAL','ОСНОВА ↔ ДОПОЛНИТЕЛЬНЫЕ СЛОИ'],
    ['CORE → OPTIONAL LENSES','ОСНОВА → ДОПОЛНИТЕЛЬНЫЕ ЛИНЗЫ'],
    ['Core profile → optional research lenses','Основной профиль → дополнительные исследовательские линзы'],
    ['Structural Fit','Структурное соответствие'],
    ['Negotiated Fit','Переговорная адаптация'],
    ['Experienced Dynamic Fit','Переживаемая динамика'],
    ['Temporal Stability','Временная устойчивость'],
    ['HARD LOCK.','КЛЮЧЕВОЕ ПРАВИЛО.'],
    ['Structural similarity','Структурное сходство'],
    ['structural similarity','структурное сходство'],
    ['Structural mismatch','Структурное несовпадение'],
    ['structural mismatch','структурное несовпадение'],
    ['good adaptation','хорошей адаптацией'],
    ['poor repair','плохим восстановлением контакта'],
    ['co-dysregulation','совместной дисрегуляцией'],
    ['NEED','ПОТРЕБНОСТЬ'],['PERCEPTION','ВОСПРИЯТИЕ'],['PROVISION','ДЕЙСТВИЕ'],['EXPERIENCE','ПЕРЕЖИВАНИЕ'],['EFFECT','ЭФФЕКТ'],
    ['Sexual Co-Regulation & Recovery','Сексуальная ко-регуляция и восстановление'],
    ['Dyadic Desire & Erotic Coordination','Диадическое желание и эротическая координация'],
    ['mutual recovery','взаимное восстановление'],['asymmetric recovery','асимметричное восстановление'],
    ['unilateral benefit','односторонняя польза'],['repeated event pattern','повторяющийся паттерн взаимодействия'],
    ['Synchrony ≠ co-regulation ≠ compatibility','Синхронность ≠ ко-регуляция ≠ совместимость'],
    ['No libido compatibility score · No desire compatibility percentage · No Couple Total','Нет балла совместимости либидо · Нет процента совместимости желания · Нет общего балла пары'],
    ['Research Candidate · controlled pre-pilot architecture','Исследовательский кандидат · контролируемая предпилотная архитектура'],
    ['Candidate measurement architecture · в разработке','Кандидатная измерительная архитектура · в разработке'],
    ['Individual participation','Индивидуальное участие'],['Pseudonymous pairing','Псевдонимное объединение пары'],
    ['Share-safe report consent','Согласие на безопасный совместный отчёт'],['Optional event study','Дополнительное исследование эпизодов'],
    ['event-level','уровня отдельных эпизодов'],['assessment','исследование'],['Raw answers','Исходные ответы'],
    ['Shared report','Совместный отчёт'],['sensitive safety data','чувствительные данные безопасности'],
    ['sensitive flow','чувствительный сценарий'],['Shared-report consent','Согласие на совместный отчёт'],['sensitive','чувствительных'],
    ['01 / INDIVIDUAL','01 / ИНДИВИДУАЛЬНО'],['02 / PARTNER-CONTEXT','02 / КОНТЕКСТ ПАРТНЁРА'],['03 / DYADIC','03 / ПАРА'],
    ['raw answers','исходных ответов'],['consent','согласие'],
    ['Будущая report architecture.','Будущая архитектура отчёта.'],['Production interpretation not yet authorised.','Интерпретация для production пока не авторизована.'],
    ['Нет Couple Total.','Нет общего балла пары.'],['Нет Compatibility %.','Нет процента совместимости.'],
    ['Один event','Один эпизод'],['Synchrony','Синхронность'],['co-regulation','ко-регуляции'],
    ['Research preview не равен валидированному production product.','Исследовательский предпросмотр не равен валидированному готовому продукту.'],
    ['Controlled candidate/pre-pilot architecture; production score/report authority не заявлена.','Контролируемая кандидатная предпилотная архитектура; право на production-оценку и отчёт не заявлено.'],
    ['Candidate dyadic desire measurement architecture; единый libido/compatibility score запрещён.','Кандидатная архитектура измерения диадического желания; единый балл либидо/совместимости запрещён.'],
    ['Dyadic privacy','Конфиденциальность пары'],['Independent participation, pseudonymous pairing и share-safe disclosure остаются обязательными границами.','Независимое участие, псевдонимное объединение пары и безопасное раскрытие остаются обязательными границами.'],
    ['research layers','исследовательские слои'],['individual score','индивидуальный показатель'],['individual coordinates','индивидуальные координаты'],
    ['optional research layers','дополнительные исследовательские слои'],['PERSON A','УЧАСТНИК A'],['PERSON B','УЧАСТНИК B'],
    ['Dyadic Research Layer','Диадический исследовательский слой'],['research architecture','исследовательская архитектура'],
    ['Extended Research System','Система углублённых исследований'],
    ['Erotic Communication Architecture','Архитектура эротической коммуникации'],['Sexual Motivation Architecture','Архитектура сексуальной мотивации'],
    ['Sexual Self-Relation Architecture','Архитектура отношения к собственной сексуальности'],['Intimacy-Life Integration / Spillover','Интеграция близости и жизни / перенос эффектов'],
    ['Receptive / Sensory / Power / Fantasy-Enactment Architecture','Архитектура рецептивности / сенсорики / распределения контроля / воплощения фантазии'],
    ['preference ≠ tolerance ≠ capacity · fantasy ≠ experience','предпочтение ≠ переносимость ≠ способность · фантазия ≠ опыт'],
    ['Adaptive research architecture · в разработке','Адаптивная исследовательская архитектура · в разработке'],
    ['regulation patterns','паттерны регуляции'],['fit/mismatch','соответствие/несовпадение'],['downstream состояниями','последующими состояниями'],
    ['composite scores','составными показателями'],['empirical authority','эмпирического подтверждения'],
    ['Extended modules','Дополнительные модули'],['current P-120 scores','текущие показатели P-120'],['P-120 Extended Total','общего показателя Extended P-120'],
    ['compatibility score','показателя совместимости'],['Development completeness','Завершённость разработки'],['psychometric validation','психометрической валидации'],
    ['Research Candidate.','Исследовательский кандидат.'],['Candidate measurement workstreams; participant-facing production scoring не заявлен.','Кандидатные измерительные направления; пользовательский production-scoring не заявлен.'],
    ['Candidate dimensional/outcome architectures; final factor and total-score authority отсутствует.','Кандидатные размерностные и outcome-архитектуры; право на финальные факторы и общий показатель отсутствует.'],
    ['Adaptive candidate routing architecture; final scoring, norms и public profile labels не заморожены.','Адаптивная кандидатная архитектура маршрутизации; финальный scoring, нормы и публичные названия профилей не заморожены.'],
    ['P-120 Research System','Исследовательская система P-120'],['WEB-EXPLORE · DYADIC RESEARCH PREVIEW · 18+','ВЕБ-РАЗДЕЛ · ИССЛЕДОВАНИЕ ПАРЫ · ПРЕДПРОСМОТР · 18+'],
    ['WEB-EXPLORE · RESEARCH PREVIEW · 18+','ВЕБ-РАЗДЕЛ · ИССЛЕДОВАТЕЛЬСКИЙ ПРЕДПРОСМОТР · 18+']
  ];

  function localiseRussianVisibleCopy(){
    if(isEn)return;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const tag=node.parentElement?.tagName;
      if(!node.nodeValue?.trim()||tag==='SCRIPT'||tag==='STYLE')return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      let value=node.nodeValue;
      for(const [from,to] of ruReplacements)if(value.includes(from))value=value.split(from).join(to);
      node.nodeValue=value;
    }
  }

  const btn=document.querySelector('[data-explore-menu]');
  const drawer=document.querySelector('[data-explore-drawer]');
  const topbar=document.querySelector('.explore-topbar');
  const desktopDetails=[...document.querySelectorAll('.explore-mainnav details')];

  function closeDrawer(){
    if(!drawer||!btn)return;
    drawer.classList.remove('is-open');drawer.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');document.body.style.overflow='';
  }
  function openDrawer(){
    if(!drawer||!btn)return;
    drawer.classList.add('is-open');drawer.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';
  }
  function closeFloatingMenus(except=null){desktopDetails.forEach(d=>{if(d!==except)d.removeAttribute('open')})}

  btn?.addEventListener('click',()=>drawer?.classList.contains('is-open')?closeDrawer():openDrawer());
  drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeDrawer));
  desktopDetails.forEach(details=>details.addEventListener('toggle',()=>{if(details.open)closeFloatingMenus(details)}));
  document.addEventListener('click',e=>{if(!e.target.closest?.('.explore-mainnav details'))closeFloatingMenus()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();closeFloatingMenus()}});
  window.matchMedia('(min-width:761px)').addEventListener?.('change',e=>{if(e.matches)closeDrawer()});
  window.addEventListener('scroll',()=>topbar?.classList.toggle('is-scrolled',window.scrollY>8),{passive:true});

  addLanguageSwitch();
  localiseRussianVisibleCopy();
  topbar?.classList.toggle('is-scrolled',window.scrollY>8);
  html.dataset.webExploreShell='v1.2';
})();
