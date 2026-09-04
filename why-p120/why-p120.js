(() => {
  'use strict';

  /* Critical responsive/mobile CSS is staticized in why-p120-firstpaint.css. */

  /* Keep RU and EN visually identical while preventing language leakage.
     Person / Profile / Pattern / Perception / Presence / Partnership remain in
     English by design: they are the six literal P-expansions; their explanatory
     lines are localized underneath. */
  function localizeRouteCopy(){
    const isEn=(document.documentElement.lang||'ru').toLowerCase().startsWith('en');
    document.body.dataset.wpLang=isEn?'en':'ru';

    const caption=document.querySelector('.wp-pi-caption');
    if(caption){
      caption.innerHTML=isEn
        ? 'A finite instrument<br>for something that is not finite.'
        : 'Конечный инструмент<br>для того, что не имеет конца.';
    }

    const brandSmall=document.querySelector('.wp-brand-lockup small');
    if(brandSmall) brandSmall.textContent=isEn?'research architecture':'исследовательская архитектура';

    const mobileHome=document.querySelector('.wp-mobile-menu');
    if(mobileHome) mobileHome.textContent=isEn?'Menu':'Меню';

    const coordinateLabel=document.querySelector('.wp-coordinate-label');
    if(coordinateLabel) coordinateLabel.textContent=isEn?'data → structure → human':'данные → структура → человек';

    const finalManifesto=document.querySelectorAll('.wp-final-manifesto span');
    if(finalManifesto.length>=2){
      finalManifesto[0].textContent=isEn?'120 questions are not the result.':'120 вопросов — не результат.';
      finalManifesto[1].textContent=isEn?'They are the coordinates.':'Это координаты.';
    }

    const brandLine=document.querySelector('.wp-brand-line .tag');
    if(brandLine) brandLine.textContent=isEn
      ? 'Science. Structure. Depth.  The person in full complexity.'
      : 'Наука. Структура. Глубина.  Человек во всей сложности.';

    const footerTagline=document.querySelector('.wp-footer-inner > span');
    if(footerTagline) footerTagline.textContent=isEn
      ? 'Scientific credibility above mythology.'
      : 'Научная достоверность важнее мифологии.';

    const footerLink=document.querySelector('.wp-footer a');
    if(footerLink) footerLink.textContent=isEn?'Return to the site →':'Вернуться на сайт →';

    document.querySelectorAll('.wp-semantic-term').forEach(el=>{
      el.setAttribute('lang','en');
    });

    document.title=isEn
      ? 'Why P-120? — P-120 · Brand Origin'
      : 'Почему P-120? — P-120 · Происхождение названия';
  }

  function setupMobileNavigation(){
    const original=document.querySelector('.wp-mobile-menu');
    if(!original || document.querySelector('.wp-mobile-nav-panel')) return;

    const isEn=(document.documentElement.lang||'ru').toLowerCase().startsWith('en');
    const t=isEn?{
      menu:'Menu',title:'Explore P-120',kicker:'P-120 · Navigation',close:'Close menu',
      home:'Home',homeNote:'Return to P-120',about:'About P-120',aboutNote:'The system and its purpose',
      why:'Why P-120?',whyNote:'The origin of the name',creator:'From the Creator',creatorNote:'The personal context behind P-120',
      unique:'What makes it different',uniqueNote:'Why the architecture is not a single score',shows:'What it can show',showsNote:'What the research can reveal',
      report:'Report',reportNote:'How results are presented',science:'Scientific Base',scienceNote:'Evidence and methodology',
      start:'Take P-120 · RU'
    }:{
      menu:'Меню',title:'Исследовать P-120',kicker:'P-120 · Навигация',close:'Закрыть меню',
      home:'На главную',homeNote:'Вернуться к P-120',about:'О P-120',aboutNote:'Система и её назначение',
      why:'Почему P-120?',whyNote:'Происхождение названия',creator:'От создателя',creatorNote:'Личный контекст появления P-120',
      unique:'Уникальность',uniqueNote:'Почему архитектура не сводится к одному баллу',shows:'Что покажет',showsNote:'Что может показать исследование',
      report:'Отчёт',reportNote:'Как представлены результаты',science:'Научная база',scienceNote:'Доказательная база и методология',
      start:'Начать P-120'
    };

    const base=isEn?'../en/':'../';
    const routes=[
      [t.about,base+'#why-important',t.aboutNote],
      [t.why,isEn?'../en/why-p120/':'./',t.whyNote,'page'],
      [t.creator,isEn?'../en/creator/':'../creator/',t.creatorNote],
      [t.unique,base+'#why-p120',t.uniqueNote],
      [t.shows,base+'#what-p120-shows',t.showsNote],
      [t.report,base+'#showcase',t.reportNote],
      [t.science,base+'#science-foundation',t.scienceNote]
    ];

    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='wp-mobile-menu wp-mobile-menu-trigger';
    trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-controls','wp-mobile-nav-panel');
    trigger.textContent=t.menu;
    original.replaceWith(trigger);

    const backdrop=document.createElement('div');
    backdrop.className='wp-mobile-nav-backdrop';
    backdrop.setAttribute('aria-hidden','true');

    const panel=document.createElement('aside');
    panel.className='wp-mobile-nav-panel';
    panel.id='wp-mobile-nav-panel';
    panel.setAttribute('aria-hidden','true');
    panel.setAttribute('aria-label',t.title);
    panel.innerHTML=`
      <div class="wp-mobile-nav-head">
        <div><span class="wp-mobile-nav-kicker">${t.kicker}</span><strong class="wp-mobile-nav-title">${t.title}</strong></div>
        <button class="wp-mobile-nav-close" type="button" aria-label="${t.close}">×</button>
      </div>
      <nav class="wp-mobile-nav-list" aria-label="${t.title}">
        ${routes.map((r,i)=>`<a class="wp-mobile-nav-item" href="${r[1]}"${r[3]?' aria-current="page"':''}><span class="wp-mobile-nav-index">${String(i+1).padStart(2,'0')}</span><span class="wp-mobile-nav-copy"><strong>${r[0]}</strong><small>${r[2]}</small></span><span class="wp-mobile-nav-arrow" aria-hidden="true">→</span></a>`).join('')}
      </nav>
      <div class="wp-mobile-nav-foot">
        <a class="wp-mobile-nav-action" href="${base}">${t.home}</a>
        <a class="wp-mobile-nav-action primary" href="../?start=1">${t.start}</a>
      </div>`;

    document.body.append(backdrop,panel);
    const closeButton=panel.querySelector('.wp-mobile-nav-close');
    let lastFocus=null;

    function setOpen(open){
      lastFocus=open?document.activeElement:lastFocus;
      trigger.setAttribute('aria-expanded',String(open));
      panel.setAttribute('aria-hidden',String(!open));
      backdrop.setAttribute('aria-hidden',String(!open));
      panel.classList.toggle('is-open',open);
      backdrop.classList.toggle('is-open',open);
      document.body.classList.toggle('wp-mobile-nav-open',open);
      if(open){requestAnimationFrame(()=>closeButton&&closeButton.focus());}
      else if(lastFocus&&typeof lastFocus.focus==='function'){lastFocus.focus();lastFocus=null;}
    }

    trigger.addEventListener('click',()=>setOpen(trigger.getAttribute('aria-expanded')!=='true'));
    closeButton.addEventListener('click',()=>setOpen(false));
    backdrop.addEventListener('click',()=>setOpen(false));
    panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&trigger.getAttribute('aria-expanded')==='true')setOpen(false);});
    window.addEventListener('resize',()=>{if(window.innerWidth>980&&trigger.getAttribute('aria-expanded')==='true')setOpen(false);},{passive:true});
  }

  document.body.removeAttribute('data-theme');
  localizeRouteCopy();
  setupMobileNavigation();

  const scenes=[...document.querySelectorAll('.wp-act,.wp-symbol-bridge')];
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if('IntersectionObserver' in window&&!reduce){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    scenes.forEach(scene=>io.observe(scene));
  }else{
    scenes.forEach(scene=>scene.classList.add('is-visible'));
  }
})();

/* P-120 sandbox legal layer — shared by RU source and generated EN Brand Origin route. */
(() => {
  'use strict';
  if (document.querySelector('script[data-p120-legal-runtime]')) return;
  const marker='/p120-web/';
  const path=location.pathname;
  const i=path.indexOf(marker);
  const base=i>=0?path.slice(0,i)+marker:'/';
  const script=document.createElement('script');
  script.src=base+'p120-legal-runtime-v1.0.js?v=legal10';
  script.dataset.p120LegalRuntime='v1.0';
  document.head.appendChild(script);
})();
