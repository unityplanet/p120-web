(() => {
  'use strict';

  /* Why P-120 mobile corrective pass v4.
     Layout corrections preserve the approved visual language and add a
     dedicated mobile navigation layer for the Brand Origin route. */
  if (!document.getElementById('wp-mobile-origin-corrective-v4')) {
    const style=document.createElement('style');
    style.id='wp-mobile-origin-corrective-v4';
    style.textContent=`
@media(max-width:720px){
  /* ACT 1 — keep the approved symbolic object, only repair its anchor. */
  .wp-venn-six{
    left:0!important;
    right:0!important;
    margin-left:auto!important;
    margin-right:auto!important;
    transform:none!important;
  }
  .wp-venn-six[data-reveal]{transform:translateY(20px)!important}
  .wp-act1.is-visible .wp-venn-six[data-reveal],
  .wp-venn-six[data-reveal].is-visible{transform:none!important}

  /* ACT 2 — one semantic rail on phones; typography/design stay intact. */
  .wp-act2 .wp-act-inner{display:block!important}
  .wp-semantic{
    display:grid!important;
    grid-template-columns:minmax(0,1fr)!important;
    grid-auto-flow:row!important;
    gap:0!important;
    width:100%!important;
    max-width:none!important;
    margin-top:30px!important;
    padding-left:34px!important;
  }
  .wp-semantic-item{
    grid-column:1/-1!important;
    width:100%!important;
    min-width:0!important;
    grid-template-columns:52px minmax(0,1fr)!important;
    gap:10px!important;
    margin:0!important;
  }
  .wp-semantic-copy{min-width:0!important}
  .wp-semantic-term{white-space:normal!important}
  .wp-semantic>.wp-act2-note{
    grid-column:1/-1!important;
    margin:18px 0 0 auto!important;
  }

  /* ACT 3 — center the caption without relying on translateX. */
  .wp-pi-caption{
    left:0!important;
    right:0!important;
    width:min(280px,calc(100% - 36px))!important;
    max-width:min(280px,calc(100% - 36px))!important;
    margin-left:auto!important;
    margin-right:auto!important;
    text-align:center!important;
    transform:none!important;
  }
  .wp-pi-caption[data-reveal]{transform:translateY(20px)!important}
  .wp-act3.is-visible .wp-pi-caption[data-reveal],
  .wp-pi-caption[data-reveal].is-visible{transform:none!important}
}
@media(max-width:420px){
  .wp-semantic{
    grid-template-columns:minmax(0,1fr)!important;
    padding-left:30px!important;
  }
  .wp-semantic-item{
    grid-template-columns:48px minmax(0,1fr)!important;
    gap:9px!important;
  }
  .wp-pi-caption{
    width:min(260px,calc(100% - 32px))!important;
    max-width:min(260px,calc(100% - 32px))!important;
  }
}

/* Route-level localization for generated/persistent microcopy. */
.wp-fixed-editorial-theme[data-wp-lang="ru"] .wp-header:after{content:"ПРОИСХОЖДЕНИЕ НАЗВАНИЯ"!important}
.wp-fixed-editorial-theme[data-wp-lang="en"] .wp-header:after{content:"BRAND ORIGIN"!important}

/* Why P-120 — dedicated mobile navigation. */
.wp-mobile-nav-backdrop,.wp-mobile-nav-panel{display:none}
@media(max-width:980px){
  .wp-mobile-menu-trigger{
    display:inline-flex!important;align-items:center;justify-content:center;gap:9px;
    min-height:42px;padding:9px 15px;border:1px solid rgba(255,255,255,.22);
    border-radius:999px;background:rgba(255,255,255,.025);color:#f4efe7;
    font:650 11px/1 var(--wp-sans);letter-spacing:.02em;cursor:pointer;
  }
  .wp-mobile-menu-trigger::before{
    content:"";width:15px;height:10px;display:block;
    background:linear-gradient(currentColor,currentColor) 0 0/15px 1px no-repeat,
               linear-gradient(currentColor,currentColor) 0 50%/11px 1px no-repeat,
               linear-gradient(currentColor,currentColor) 0 100%/15px 1px no-repeat;
    opacity:.82
  }
  .wp-mobile-menu-trigger[aria-expanded="true"]{background:rgba(255,255,255,.10);color:#fff}
  .wp-mobile-nav-backdrop{
    display:block;position:fixed;inset:var(--wp-header) 0 0;z-index:86;
    background:rgba(0,0,0,.54);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
    opacity:0;visibility:hidden;pointer-events:none;transition:opacity .22s var(--wp-ease),visibility .22s
  }
  .wp-mobile-nav-panel{
    display:flex;position:fixed;z-index:87;top:calc(var(--wp-header) + 10px);left:12px;right:12px;
    max-height:calc(100svh - var(--wp-header) - 22px);overflow:auto;overscroll-behavior:contain;
    flex-direction:column;padding:17px;border:1px solid rgba(255,255,255,.13);border-radius:24px;
    background:linear-gradient(145deg,rgba(14,17,19,.985),rgba(8,10,11,.99));color:#f3eee5;
    box-shadow:0 28px 80px rgba(0,0,0,.48);opacity:0;visibility:hidden;pointer-events:none;
    transform:translateY(-10px) scale(.985);transform-origin:top center;
    transition:opacity .22s var(--wp-ease),transform .22s var(--wp-ease),visibility .22s
  }
  .wp-mobile-nav-backdrop.is-open{opacity:1;visibility:visible;pointer-events:auto}
  .wp-mobile-nav-panel.is-open{opacity:1;visibility:visible;pointer-events:auto;transform:none}
  body.wp-mobile-nav-open{overflow:hidden}
  .wp-mobile-nav-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:3px 3px 14px}
  .wp-mobile-nav-kicker{display:block;font:700 8px/1 var(--wp-sans);letter-spacing:.15em;text-transform:uppercase;color:var(--wp-gold)}
  .wp-mobile-nav-title{display:block;margin-top:8px;font:500 26px/1.05 var(--wp-serif);letter-spacing:-.025em}
  .wp-mobile-nav-close{width:38px;height:38px;border:1px solid rgba(255,255,255,.17);border-radius:50%;background:transparent;color:#f4efe7;font-size:20px;line-height:1;cursor:pointer;flex:0 0 auto}
  .wp-mobile-nav-list{display:grid;border-top:1px solid rgba(255,255,255,.10)}
  .wp-mobile-nav-item{
    display:grid;grid-template-columns:30px minmax(0,1fr) 20px;gap:10px;align-items:center;
    min-height:55px;padding:10px 4px;border-bottom:1px solid rgba(255,255,255,.085);
    text-decoration:none;color:rgba(245,240,232,.77)
  }
  .wp-mobile-nav-item:hover,.wp-mobile-nav-item:focus-visible{color:#fff}
  .wp-mobile-nav-item[aria-current="page"]{color:#fff;background:linear-gradient(90deg,rgba(199,160,91,.075),transparent 72%)}
  .wp-mobile-nav-index{font:600 8px/1 var(--wp-sans);letter-spacing:.11em;color:rgba(226,195,136,.62);font-variant-numeric:tabular-nums}
  .wp-mobile-nav-copy{display:grid;gap:3px;min-width:0}
  .wp-mobile-nav-copy strong{font:600 13px/1.2 var(--wp-sans);letter-spacing:.005em}
  .wp-mobile-nav-copy small{font:450 9px/1.35 var(--wp-sans);color:rgba(226,222,214,.42)}
  .wp-mobile-nav-arrow{font:400 15px/1 var(--wp-serif);opacity:.42;text-align:center}
  .wp-mobile-nav-foot{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding-top:15px}
  .wp-mobile-nav-action{min-height:44px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.18);border-radius:999px;text-decoration:none;font:700 10px/1 var(--wp-sans);letter-spacing:.03em;color:#f3eee5}
  .wp-mobile-nav-action.primary{background:#f0ece4;color:#111;border-color:#f0ece4}
}
@media(max-width:430px){
  .wp-mobile-nav-panel{left:8px;right:8px;top:calc(var(--wp-header) + 7px);padding:14px;border-radius:20px}
  .wp-mobile-nav-title{font-size:23px}.wp-mobile-nav-item{min-height:52px}
  .wp-mobile-nav-foot{grid-template-columns:1fr}
  .wp-mobile-menu-trigger{padding:9px 13px}
}
@media(prefers-reduced-motion:reduce){
  .wp-mobile-nav-backdrop,.wp-mobile-nav-panel{transition:none!important}
}
`;
    document.head.appendChild(style);
  }

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
