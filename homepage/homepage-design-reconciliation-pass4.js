/* P-120 WEB DESIGN RECONCILIATION PASS 4 — Homepage Visual Reconciliation
   Public composition adapter only.
   Governing sequence: human entry -> definition -> human atlas -> system depth -> route map -> one synthetic example -> research boundary / entry point.
   No measurement, scoring, questionnaire, report-engine, persistence, submission, session-write, Supabase/Auth/RLS or scientific-authority mutation. */
(()=>{
  'use strict';
  if(window.P120HomepageDesignPass4?.version==='1.0') return;

  const scriptUrl=document.currentScript?.src||document.baseURI;
  const homepageDir=new URL('./',scriptUrl);
  const rootUrl=new URL('../',homepageDir);
  const isEn=(document.documentElement.lang||'').toLowerCase().startsWith('en')||/\/en(?:\/|$)/i.test(location.pathname);
  const locale=isEn?'en':'ru';
  const normalizePath=value=>{const clean=String(value||'/').replace(/\/{2,}/g,'/');return clean.endsWith('/')?clean:`${clean}/`;};
  const publicUrl=new URL(isEn?'en/':'./',rootUrl);
  const isPublicMain=normalizePath(location.pathname)===normalizePath(publicUrl.pathname);
  const STYLE_ATTR='data-p120-homepage-pass4-style';
  const ROOT_ATTR='data-p120-homepage-pass4';
  const systemUrl=new URL(isEn?'en/system/':'system/',rootUrl).href;
  const route=path=>new URL(`${isEn?'en/':''}${path}`,rootUrl).href;
  const decisionUrl=new URL(`${isEn?'en/':''}research/how-we-decide/`,rootUrl).href;

  const copy=isEn?{
    metaTitle:'P-120 — Research Architecture',
    metaDescription:'P-120 is a multidimensional research architecture for studying attraction, closeness, embodied response and the durability of desire. Research Candidate · 18+.',
    hero:{
      eyebrow:'P-120 · RESEARCH ARCHITECTURE · RESEARCH CANDIDATE',
      title:'Why can one person affect us more deeply than another?',
      lead:'Why does attraction appear, persist, change or disappear — and can those patterns be studied without reducing a person to a single score?',
      definition:'P-120 is a research architecture for studying attraction, closeness, embodied response, the durability of desire and related human patterns.',
      explore:'Explore P-120',start:'Begin research'
    },
    definition:{
      eyebrow:'01 · WHAT P-120 IS',title:'Not one test. A system of studies.',
      lead:'P-120 is a multidimensional research architecture for studying structured patterns in adult erotic, embodied and relational experience. It connects measurement, computation, interpretation and validation without making those functions interchangeable.',
      cols:[
        ['Human','The system does not read one answer in isolation. It examines several distinct layers of experience.'],
        ['Structure','Different research modules ask different questions about the same person.'],
        ['Integration','Meaning comes from relationships among layers — not from one final score.']
      ]
    },
    atlas:{
      eyebrow:'02 · THE HUMAN ATLAS',title:'A person does not consist of one scale.',
      intro:'Each layer remains distinct. The useful signal appears in how those layers align, diverge or change under different conditions.',
      layers:[
        ['01 · SAT-24','Social touch','How nonsexual touch acquires emotional and bodily meaning.'],
        ['02 · P-72','Activation','What captures attention and organizes erotic-aesthetic involvement.'],
        ['03 · P-72D','Durability of desire','What happens to desire through familiarity, repetition, closeness and renewed contact.'],
        ['04 · AO-12','Regulation of closeness','How trust, distance, uncertainty and reliance on another person are experienced.'],
        ['05 · SOMA-24','Embodied response','How the body notices, differentiates and modulates erotically meaningful response.']
      ]
    },
    depth:{
      eyebrow:'03 · HOW THE SYSTEM LOOKS DEEPER',title:'An answer is not yet an interpretation.',
      statement:'Meaning emerges from relationships between answers — within a layer, between layers and across conditions.',
      flow:['Responses','Patterns within a layer','Relations between layers','Alignment and contradiction','Integrated interpretation'],
      note:'This is a conceptual map of the research process, not a public scoring formula.'
    },
    routes:{
      eyebrow:'04 · CHOOSE YOUR DEPTH',title:'P-120 is larger than its homepage.',
      intro:'The homepage gives orientation. The deeper layers live in dedicated surfaces, each with its own authority and purpose.',
      groups:[
        ['UNDERSTAND',[
          ['About P-120','System and architecture',route('about/')],
          ['Why P-120?','Origin of the name and idea',route('why-p120/')],
          ['From the Creator','Human context behind the system',route('creator/')]
        ]],
        ['GO DEEPER',[
          ['Scientific Base','Methods, evidence and boundaries',route('science/')],
          ['Go deeper?','Extended research programme',route('extended/')],
          ['Decision Research','HG-CGA · human-governed cognitive analysis',decisionUrl]
        ]],
        ['RELATIONSHIP',[
          ['Together?','Dyadic / relationship research',route('together/')]
        ]]
      ]
    },
    example:{
      eyebrow:'05 · ONE SYNTHETIC EXAMPLE',title:'The same outward reaction can have a different internal structure.',
      intro:'This example is illustrative, not a validated typology and not a real participant result.',
      profile:'Aesthetic-resonant partner profile',
      narrative:'Strong involvement through form, beauty and coherence may become more durable when emotional responsiveness and living contact are present.',
      signals:[['Aesthetic activation','high'],['Durability with closeness','high'],['Embodied availability','moderate-high'],['Unwanted triggers','moderate']],
      close:'The point is not the label. The point is that several layers can be read together without collapsing them into one number.'
    },
    boundary:{
      eyebrow:'06 · RESEARCH BOUNDARY',title:'What P-120 studies — and what it does not claim.',
      yesTitle:'P-120 studies',yes:['patterns and relationships among layers','differences, tensions and conditions','research hypotheses that can be tested','structured interpretation under explicit boundaries'],
      noTitle:'P-120 does not',no:['diagnose a person','determine a person’s value','prove compatibility from one profile','reduce a complex life to one score'],
      note:'P-120 is a Research Candidate · 18+. N/A means insufficient relevant experience; an individual form does not establish actual compatibility of a specific pair.'
    },
    close:{
      eyebrow:'07 · ENTRY POINT',title:'See the structure — then decide how deep you want to go.',
      body:'You can read the system first, or begin the research and return later. The final interpretation remains bounded by the evidence available.',
      start:'Begin research',about:'Understand P-120 first',resume:'Resume saved research'
    },
    footer:'P-120 · Research Candidate · 18+ · multidimensional research architecture'
  }:{
    metaTitle:'P-120 — Исследовательская архитектура',
    metaDescription:'P-120 — многомерная исследовательская архитектура для изучения притяжения, близости, телесного отклика и устойчивости желания. Research Candidate · 18+.',
    hero:{
      eyebrow:'P-120 · ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА · RESEARCH CANDIDATE',
      title:'Почему один человек может затронуть нас сильнее другого?',
      lead:'Почему притяжение возникает, сохраняется, меняется или исчезает — и можно ли исследовать эти закономерности, не сводя человека к одному баллу?',
      definition:'P-120 — исследовательская архитектура для изучения притяжения, близости, телесного отклика, устойчивости желания и связанных человеческих закономерностей.',
      explore:'Исследовать P-120',start:'Начать исследование'
    },
    definition:{
      eyebrow:'01 · ЧТО ТАКОЕ P-120',title:'Не один тест. Система исследований.',
      lead:'P-120 — многомерная исследовательская архитектура для изучения структурированных закономерностей взрослого эротического, телесного и реляционного опыта. Она связывает измерение, вычисление, интерпретацию и валидацию, не смешивая их роли.',
      cols:[
        ['Человек','Система не читает один ответ отдельно. Она рассматривает несколько самостоятельных слоёв опыта.'],
        ['Структура','Разные исследовательские модули задают разные вопросы об одном и том же человеке.'],
        ['Интеграция','Смысл возникает из отношений между слоями — а не из одного итогового балла.']
      ]
    },
    atlas:{
      eyebrow:'02 · ЧЕЛОВЕЧЕСКИЙ АТЛАС',title:'Человек не состоит из одной шкалы.',
      intro:'Каждый слой остаётся самостоятельным. Полезный сигнал появляется в том, как эти слои согласуются, расходятся или меняются в разных условиях.',
      layers:[
        ['01 · SAT-24','Социальное прикосновение','Как несексуальное прикосновение приобретает эмоциональное и телесное значение.'],
        ['02 · P-72','Активация','Что захватывает внимание и организует эротико-эстетическое вовлечение.'],
        ['03 · P-72D','Устойчивость желания','Что происходит с желанием при знакомстве, повторяемости, близости и восстановлении контакта.'],
        ['04 · AO-12','Регуляция близости','Как переживаются доверие, дистанция, неопределённость и опора на другого.'],
        ['05 · SOMA-24','Телесный отклик','Как собственное тело замечает, различает и модулирует эротически значимый отклик.']
      ]
    },
    depth:{
      eyebrow:'03 · КАК СИСТЕМА СМОТРИТ ГЛУБЖЕ',title:'Ответ сам по себе ещё не является интерпретацией.',
      statement:'Значение возникает из отношений между ответами — внутри слоя, между слоями и в разных условиях.',
      flow:['Ответы','Паттерны внутри слоя','Отношения между слоями','Согласованность и противоречия','Интегрированная интерпретация'],
      note:'Это концептуальная карта исследовательского процесса, а не публичная формула расчёта.'
    },
    routes:{
      eyebrow:'04 · ВЫБРАТЬ ГЛУБИНУ',title:'P-120 больше своей главной страницы.',
      intro:'Homepage даёт ориентацию. Более глубокие уровни живут на отдельных поверхностях, каждая — со своим назначением и authority.',
      groups:[
        ['ПОНЯТЬ',[
          ['О P-120','Система и её архитектура',route('about/')],
          ['Почему P-120?','Происхождение названия и идеи',route('why-p120/')],
          ['От создателя','Человеческий контекст появления системы',route('creator/')]
        ]],
        ['ПОЙТИ ГЛУБЖЕ',[
          ['Научная база','Методология, доказательная база и границы',route('science/')],
          ['Хотите глубже?','Система расширенных исследований',route('extended/')],
          ['Исследование решений','HG-CGA · управляемый когнитивный анализ',decisionUrl]
        ]],
        ['ОТНОШЕНИЯ',[
          ['Мы вместе?','Исследование пары / dyadic research',route('together/')]
        ]]
      ]
    },
    example:{
      eyebrow:'05 · ОДИН СИНТЕТИЧЕСКИЙ ПРИМЕР',title:'Одинаковая внешняя реакция может иметь разное внутреннее устройство.',
      intro:'Это иллюстративный пример, а не валидированная типология и не результат реального участника.',
      profile:'Эстетически-резонансный партнёрный профиль',
      narrative:'Сильное вовлечение через форму, красоту и целостность образа может становиться устойчивее в условиях эмоциональной ответности и живого контакта.',
      signals:[['Эстетическая активация','высокая'],['Устойчивость при близости','высокая'],['Телесная доступность','умеренно высокая'],['Нежелательные триггеры','умеренные']],
      close:'Смысл не в названии профиля. Смысл в том, что несколько слоёв можно читать вместе, не сводя их к одному числу.'
    },
    boundary:{
      eyebrow:'06 · ИССЛЕДОВАТЕЛЬСКАЯ ГРАНИЦА',title:'Что P-120 исследует — и чего не утверждает.',
      yesTitle:'P-120 исследует',yes:['паттерны и отношения между слоями','различия, напряжения и условия','исследовательские гипотезы, которые можно проверять','структурированную интерпретацию с явными границами'],
      noTitle:'P-120 не делает',no:['не ставит диагноз','не определяет ценность человека','не доказывает совместимость по одному профилю','не сводит сложную жизнь к одному баллу'],
      note:'P-120 — Research Candidate · 18+. N/A означает недостаток релевантного опыта; индивидуальная форма не устанавливает фактическую совместимость конкретной пары.'
    },
    close:{
      eyebrow:'07 · ТОЧКА ВХОДА',title:'Увидеть структуру — и самому выбрать глубину.',
      body:'Можно сначала прочитать о системе или начать исследование и вернуться к нему позже. Итоговая интерпретация остаётся ограниченной доступными данными и evidence boundaries.',
      start:'Начать исследование',about:'Сначала понять P-120',resume:'Продолжить сохранённое исследование'
    },
    footer:'P-120 · Research Candidate · 18+ · многомерная исследовательская архитектура'
  };

  let observer=null,frame=0,revealObserver=null;

  function ensureCss(){
    if(document.querySelector(`link[${STYLE_ATTR}]`)) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL('homepage-design-reconciliation-pass4.css?v=1',homepageDir).href;
    link.setAttribute(STYLE_ATTR,'1.0');
    document.head.appendChild(link);
  }
  function setMeta(selector,attr,value){const node=document.querySelector(selector);if(node)node.setAttribute(attr,value);}
  function normalizeMetadata(){
    document.title=copy.metaTitle;
    setMeta('meta[name="description"]','content',copy.metaDescription);
    setMeta('meta[property="og:title"]','content',copy.metaTitle);
    setMeta('meta[property="og:description"]','content',copy.metaDescription);
    setMeta('meta[name="twitter:title"]','content',copy.metaTitle);
    setMeta('meta[name="twitter:description"]','content',copy.metaDescription);
  }
  function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function linkCard(item){return `<a class="p120-home4-route" href="${esc(item[2])}"><span><strong>${esc(item[0])}</strong><small>${esc(item[1])}</small></span><i aria-hidden="true">→</i></a>`;}
  function resumeMarkup(){
    try{
      const eligibility=window.P120MobileSessionResume?.getEligibility?.();
      if(!eligibility?.resumable) return '';
      return `<a class="p120-home4-resume" href="${esc(systemUrl)}" data-p120-home4-resume="1"><span>${esc(copy.close.resume)}</span><strong>${eligibility.percent}%</strong></a>`;
    }catch(_){return '';}
  }
  function markup(){
    const d=copy;
    return `<div class="p120-home4" data-p120-home4-root="1">
      <section class="p120-home4-scene p120-home4-hero" id="why-important" data-p120-home-scene="human-entry" data-reveal>
        <div class="p120-home4-stage p120-home4-hero-grid">
          <div class="p120-home4-hero-copy">
            <span class="p120-home4-eyebrow">${esc(d.hero.eyebrow)}</span>
            <h1>${esc(d.hero.title)}</h1>
            <p class="p120-home4-hero-lead">${esc(d.hero.lead)}</p>
            <p class="p120-home4-definition">${esc(d.hero.definition)}</p>
            <div class="p120-home4-actions"><button type="button" class="p120-home4-action p120-home4-action-primary" data-home4-explore>${esc(d.hero.explore)}</button><a class="p120-home4-action" href="${esc(systemUrl)}">${esc(d.hero.start)}</a></div>
            ${resumeMarkup()}
          </div>
          <div class="p120-home4-field" aria-hidden="true"><span>HUMAN</span><i></i><b>P-120</b><i></i><span>STRUCTURE</span></div>
        </div>
      </section>

      <section class="p120-home4-scene p120-home4-paper" id="home-definition" data-p120-home-scene="definition" data-reveal>
        <div class="p120-home4-stage p120-home4-split">
          <div><span class="p120-home4-eyebrow">${esc(d.definition.eyebrow)}</span><h2>${esc(d.definition.title)}</h2></div>
          <div><p class="p120-home4-reading">${esc(d.definition.lead)}</p><div class="p120-home4-definition-grid">${d.definition.cols.map((x,i)=>`<article><span>0${i+1}</span><strong>${esc(x[0])}</strong><p>${esc(x[1])}</p></article>`).join('')}</div></div>
        </div>
      </section>

      <section class="p120-home4-scene p120-home4-atlas" id="two-systems" data-p120-home-scene="human-atlas" data-reveal>
        <div class="p120-home4-stage">
          <div class="p120-home4-section-head"><span class="p120-home4-eyebrow">${esc(d.atlas.eyebrow)}</span><h2>${esc(d.atlas.title)}</h2><p>${esc(d.atlas.intro)}</p></div>
          <div class="p120-home4-atlas-field">${d.atlas.layers.map(x=>`<article><span>${esc(x[0])}</span><strong>${esc(x[1])}</strong><p>${esc(x[2])}</p></article>`).join('')}</div>
        </div>
      </section>

      <section class="p120-home4-scene p120-home4-deep" id="home-depth" data-p120-home-scene="system-depth" data-reveal>
        <div class="p120-home4-stage p120-home4-depth-grid">
          <div><span class="p120-home4-eyebrow">${esc(d.depth.eyebrow)}</span><h2>${esc(d.depth.title)}</h2><p class="p120-home4-deep-statement">${esc(d.depth.statement)}</p></div>
          <div class="p120-home4-flow">${d.depth.flow.map((x,i)=>`<div><span>0${i+1}</span><strong>${esc(x)}</strong></div>`).join('')}<p>${esc(d.depth.note)}</p></div>
        </div>
      </section>

      <section class="p120-home4-scene p120-home4-routes" id="extended-research-entry" data-p120-home-scene="route-map" data-reveal>
        <div class="p120-home4-stage">
          <div class="p120-home4-section-head"><span class="p120-home4-eyebrow">${esc(d.routes.eyebrow)}</span><h2>${esc(d.routes.title)}</h2><p>${esc(d.routes.intro)}</p></div>
          <div class="p120-home4-route-groups">${d.routes.groups.map(g=>`<section><h3>${esc(g[0])}</h3><div>${g[1].map(linkCard).join('')}</div></section>`).join('')}</div>
        </div>
      </section>

      <section class="p120-home4-scene p120-home4-example" id="showcase" data-p120-home-scene="synthetic-example" data-reveal>
        <div class="p120-home4-stage p120-home4-example-grid">
          <div><span class="p120-home4-eyebrow">${esc(d.example.eyebrow)}</span><h2>${esc(d.example.title)}</h2><p class="p120-home4-reading">${esc(d.example.intro)}</p></div>
          <article class="p120-home4-profile"><span class="p120-home4-profile-label">SYNTHETIC / ILLUSTRATIVE</span><h3>${esc(d.example.profile)}</h3><p>${esc(d.example.narrative)}</p><dl>${d.example.signals.map(x=>`<div><dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd></div>`).join('')}</dl><footer>${esc(d.example.close)}</footer></article>
        </div>
      </section>

      <section class="p120-home4-scene p120-home4-boundary" id="science-foundation" data-p120-home-scene="research-boundary" data-reveal>
        <div class="p120-home4-stage">
          <div class="p120-home4-section-head"><span class="p120-home4-eyebrow">${esc(d.boundary.eyebrow)}</span><h2>${esc(d.boundary.title)}</h2></div>
          <div class="p120-home4-boundary-grid"><article><h3>${esc(d.boundary.yesTitle)}</h3><ul>${d.boundary.yes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article><article><h3>${esc(d.boundary.noTitle)}</h3><ul>${d.boundary.no.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article></div>
          <p class="p120-home4-boundary-note">${esc(d.boundary.note)}</p>
        </div>
      </section>

      <section class="p120-home4-scene p120-home4-close" id="home-entry-point" data-p120-home-scene="entry-point" data-reveal>
        <div class="p120-home4-stage p120-home4-close-grid"><div><span class="p120-home4-eyebrow">${esc(d.close.eyebrow)}</span><h2>${esc(d.close.title)}</h2><p>${esc(d.close.body)}</p></div><div class="p120-home4-close-actions"><a class="p120-home4-action p120-home4-action-primary" href="${esc(systemUrl)}">${esc(d.close.start)}</a><a class="p120-home4-action" href="${esc(route('about/'))}">${esc(d.close.about)}</a>${resumeMarkup()}</div></div>
      </section>
      <footer class="p120-home4-footer"><div class="p120-home4-stage"><span>${esc(d.footer)}</span></div></footer>
    </div>`;
  }

  function bindReveal(root){
    revealObserver?.disconnect?.();
    const targets=[...root.querySelectorAll('[data-reveal]')];
    if(!('IntersectionObserver' in window)||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){targets.forEach(el=>el.classList.add('is-visible'));return;}
    revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -7% 0px'});
    targets.forEach(el=>revealObserver.observe(el));
  }
  function bind(root){
    root.querySelector('[data-home4-explore]')?.addEventListener('click',()=>document.getElementById('home-definition')?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
    bindReveal(root);
  }
  function reconcile(){
    frame=0;if(!isPublicMain)return;
    ensureCss();normalizeMetadata();
    const home=document.querySelector('.editorial-home');
    if(!home)return;
    if(home.getAttribute(ROOT_ATTR)==='1.0'){
      const resumes=[...home.querySelectorAll('[data-p120-home4-resume]')];
      const eligibility=window.P120MobileSessionResume?.getEligibility?.();
      resumes.forEach(node=>{node.hidden=!eligibility?.resumable;if(eligibility?.resumable)node.querySelector('strong')&&(node.querySelector('strong').textContent=`${eligibility.percent}%`);});
      return;
    }
    home.innerHTML=markup();
    home.setAttribute(ROOT_ATTR,'1.0');
    home.dataset.p120HomepageFamily='editorial';
    bind(home);
  }
  function schedule(){if(frame)return;frame=requestAnimationFrame(reconcile);}
  function start(){
    if(!isPublicMain)return;
    ensureCss();
    const app=document.getElementById('app')||document.body;
    observer=new MutationObserver(schedule);observer.observe(app,{childList:true,subtree:true});
    window.addEventListener('storage',schedule,{passive:true});
    window.addEventListener('hashchange',schedule,{passive:true});
    reconcile();window.setTimeout(schedule,80);window.setTimeout(schedule,260);window.setTimeout(schedule,700);
  }

  window.P120HomepageDesignPass4=Object.freeze({version:'1.0',mode:'PUBLIC_COMPOSITION_RECONCILIATION',locale,isPublicMain,systemUrl,reconcile:schedule});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
