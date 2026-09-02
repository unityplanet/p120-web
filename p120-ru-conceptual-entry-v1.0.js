/* P-120 WEB — Conceptual Entry & Credibility Correction PASS 2.5
   RU canonical public-copy reconciliation v1.0.
   Presentation/editorial only. No measurement, respondent items, scoring, persistence,
   Scientific Base data, report calculation, or respondent runtime logic is changed. */
(() => {
  'use strict';

  if (!/^ru$/i.test(document.documentElement.lang || '')) return;
  const path = location.pathname.replace(/\/index\.html$/i,'/');
  if (/\/(?:en|system|creator|why-p120|science|extended|together)\//i.test(path)) return;

  const VERSION='P2.5-RU-v1.0';
  let timer=0;

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const sections={
    'why-important':{
      number:'01',act:'Акт I · Вход',
      hero:'Что именно происходит, когда нас тянет к другому человеку?',
      subtitle:'P-120 — исследовательская система, которая помогает различить разные стороны опыта, обычно скрытые внутри одного слова: «нравится».',
      flash:'Не всё, что мы чувствуем одновременно, является одним и тем же.',
      body:[
        'Человек может казаться красивым — а желания при этом может не быть.',
        'Можно чувствовать сильное телесное притяжение без эмоциональной близости.',
        'Можно быть очень близкими — и почти не чувствовать эротического желания.',
        'А иногда несколько этих переживаний совпадают одновременно.',
        'P-120 создана, чтобы эти различия не исчезали внутри одного общего ответа.'
      ],cta:'Что исследует P-120'
    },
    'life-energy':{
      number:'02',act:'Акт I · Различение',
      hero:'Желание и притяжение — не одно и то же.',
      subtitle:'Сильное желание может существовать без притяжения к конкретному человеку.',
      flash:'Для P-120 важен не «правильный» вариант, а само различие.',
      body:[
        'Эстетическая привлекательность может не сопровождаться эротическим интересом.',
        'Телесный отклик может возникать без эмоционального сближения.',
        'А близость сама по себе не гарантирует желания.',
        'P-120 не предполагает, что все эти явления являются проявлением одной общей силы.',
        'P-120 рассматривает эти явления раздельно, потому что их несовпадение может нести информацию.'
      ],cta:null
    },
    'understand-desire':{
      number:'05',act:'Акт I · Желание',
      hero:'Желание — тоже не один ответ.',
      subtitle:'Важно не только, к кому направлено желание, но и когда оно возникает, с чем совпадает и как связано с близостью, знакомством, новизной и контекстом.',
      flash:'Чем точнее вопрос, тем меньше разных переживаний приходится называть одним словом.',
      body:[
        'С чем связано сохранение или изменение желания?',
        'Как оно соотносится с близостью и пространством?',
        'Как меняется при знакомстве, повторяемости и новизне?',
        'Какую роль играет живой отклик другого человека?',
        'Одинаковое «я хочу» может соответствовать разным конфигурациям опыта.'
      ],cta:'Исследовать свой профиль'
    },
    'two-systems':{
      number:'06',act:'Акт II · Два человека',
      hero:'В отношениях встречаются два человека, для которых одно и то же может означать разное.',
      subtitle:'Различие сначала нужно увидеть — и только затем решать, какое значение оно имеет именно для этих двух людей.',
      flash:'Различие само по себе ещё не означает несовместимость.',
      body:[
        'То, что один переживает как близость, другой может воспринимать как давление.',
        'То, что для одного означает пространство, для другого может ощущаться как дистанция.',
        'Прикосновение может быть важным способом близости для одного — и гораздо менее значимым для другого.',
        'Желание может присутствовать у обоих, но переживаться, выражаться и меняться по-разному.',
        'И сходство само по себе не гарантирует результата.',
        'Для P-120 различие прежде всего является информацией. Его значение для отношений зависит от того, затрагивает ли оно важные для конкретных людей потребности, границы или способы взаимодействия.'
      ],cta:'Исследовать свою сторону отношений'
    },
    'why-p120':{
      number:'07',act:'Акт II · Архитектура',
      hero:'Не один балл.\nНе один тип.\nНе один ответ.',
      subtitle:'P-120 не сводит сложный опыт к одной цифре. Система рассматривает несколько различимых уровней — сначала отдельно, а затем в их сочетании.',
      flash:'P-120 начинается с различий, которые обычный язык часто стирает.',
      body:[
        'Красота и желание — не одно и то же.',
        'Общее желание и притяжение к конкретному человеку — не одно и то же.',
        'Телесный отклик и эмоциональная близость — не одно и то же.',
        'Прикосновение и эротический интерес — не одно и то же.',
        'Близость и автономность — не одно и то же.',
        'Мотивация и поведение — не одно и то же.',
        'То, что человеку важно переживать, и то, насколько легко он может об этом говорить, — тоже разные вопросы.',
        'Именно поэтому сложный профиль не должен исчезать внутри одного итогового числа.'
      ],cta:'Исследовать свой профиль'
    },
    'what-p120-shows':{
      number:'08',act:'Акт II · Что исследуется',
      hero:'Не «насколько вы сексуальны».\nА что именно для вас связано с притяжением, желанием, телом и близостью.',
      subtitle:'P-120 исследует несколько уровней опыта и не требует, чтобы один из них автоматически объяснял другой.',
      flash:'Первоначальное притяжение и то, как желание меняется со временем, — разные вопросы.',
      body:[
        'что привлекает внимание;',
        'что связано с эротическим интересом и желанием;',
        'как переживаются тело и прикосновение;',
        'как соотносятся близость, дистанция и автономность;',
        'какое значение имеет новизна;',
        'как человек выражает желания и границы;',
        'что происходит во взаимодействии;',
        'какие состояния могут быть связаны с периодом после близости.'
      ],cta:'Посмотреть архитектуру P-120'
    },
    'science-foundation':{
      number:'09',act:'Акт III · Научная основа',
      hero:'Научная основа P-120 — не одна теория.',
      subtitle:'P-120 опирается на современную научную литературу и существующие исследовательские конструкты из нескольких областей.',
      flash:'Научная основа и собственная архитектура P-120 — не одно и то же.',
      body:[
        'Научная литература помогает определить, что уже известно о разных сторонах человеческого опыта.',
        'Архитектура P-120 решает другой вопрос: как измерять различимые стороны опыта отдельно, а затем рассматривать их совместно, не стирая границы между ними.',
        'Внутри проекта архитектура прошла многоэтапную научно-методологическую, вычислительную и межмодульную проверку.',
        'При этом внутренняя проверка архитектуры — не то же самое, что эмпирическая психометрическая валидация на выборках респондентов.',
        'То, что уже известно из исследований, должно быть отделено от того, что P-120 ещё предстоит подтвердить на собственных данных.',
        'Сила вывода должна соответствовать силе данных.'
      ],cta:'Открыть научную основу'
    },
    'life-importance':{
      number:'10',act:'Акт III · Контекст',
      hero:'Интимный опыт не существует отдельно от остальной жизни.',
      subtitle:'Связи с эмоциональным состоянием, восстановлением и последующим контактом можно исследовать, не превращая интимный опыт в универсальное объяснение человека.',
      flash:'Связь с остальной жизнью — не то же самое, что её причина.',
      body:[
        'То, что человек переживает в близости, может быть связано с его эмоциональным состоянием, восстановлением и последующим контактом.',
        'Но связь не означает, что интимный опыт определяет человека целиком.',
        'P-120 не предполагает, что сексуальная или интимная жизнь является универсальной причиной счастья, успеха, творчества или психологического благополучия.',
        'Поэтому состояния, связанные с периодом после близости, рассматриваются как отдельная область исследования — а не как объяснение всего остального опыта человека.'
      ],cta:null
    },
    'understand-earlier':{
      number:'11',act:'Акт III · Раньше',
      hero:'Некоторые важные различия становятся заметны поздно — когда у отношений уже есть история.',
      subtitle:'К этому моменту уже могут появиться чувства, общая история, привязанность и обязательства.',
      flash:'Раннее понимание не устраняет различие. Оно просто не оставляет его полностью невидимым.',
      body:[
        'Само различие не становится ошибкой. Но его значение для двух людей может возрастать.',
        'P-120 не обещает предотвратить конфликт.',
        'Но значимое различие можно заметить до того, как оно окажется в центре уже возникшего напряжения.'
      ],cta:'Увидеть различия раньше'
    },
    'final':{
      number:'12',act:'Акт IV · Финал',
      hero:'Возможно, многое из этого вы уже знали о себе.',
      subtitle:'Возможно, вы просто никогда не видели эти различия рядом.',
      flash:'Не всякое новое знание должно быть неожиданным. Иногда достаточно увидеть знакомое точнее.',
      body:[
        'Что связано с моим притяжением и желанием?',
        'Что для меня означает близость?',
        'Когда прикосновение для меня значимо — и когда нет?',
        'Как я переживаю дистанцию и автономность?',
        'Что связано с сохранением или изменением моего желания?',
        'При каких условиях оно может снижаться или меняться?',
        'Насколько легко мне говорить о желаниях и границах?',
        'Какие различия могут оказаться значимыми во взаимодействии с другим человеком?',
        'Не для того, чтобы получить ещё один ярлык.',
        'А чтобы различать больше, чем позволял один общий ответ.'
      ],cta:'Пройти P-120',ctaSub:'Различить то, что обычно ощущается как одно.'
    }
  };

  const utilityMarkup=()=>`<section class="editorial-chapter editorial-precision p120-conceptual-insert" id="p120-utility" data-p120-conceptual-insert="utility" data-reveal>
    <div class="chapter-index"><span>03</span><small>Акт I · Что даёт P-120</small></div>
    <div class="chapter-head"><div class="chapter-hero"><h2>Не вердикт. Более точная карта.</h2></div><div class="chapter-subtitle">Результат P-120 — не окончательный ответ на вопрос «кто я?». Он может дать более точный язык для вопроса: «что именно здесь происходит со мной?».</div></div>
    <div class="chapter-flash"><p>P-120 не говорит, как должно быть. Она увеличивает разрешение, с которым можно рассмотреть то, что уже есть.</p></div>
    <div class="editorial-body"><div class="editorial-prose">
      <p>P-120 помогает рассмотреть, что связано для человека с притяжением и желанием; какие формы близости, прикосновения и телесного взаимодействия имеют для него значение; где разные стороны опыта совпадают, а где расходятся.</p>
      <p>Система показывает, какие сочетания видны между разными частями профиля и где имеющихся данных недостаточно для более сильного вывода.</p>
      <p>Если анализируются два профиля, отдельный парный уровень может сопоставлять их и показывать, в чём именно люди похожи, в чём различаются и какие расхождения потенциально значимы.</p>
      <p><strong>Там, где измерение не даёт достаточных оснований, корректный результат — не догадка, а «недостаточно оснований для вывода».</strong></p>
    </div></div>
  </section>`;

  const boundaryMarkup=()=>`<section class="editorial-chapter editorial-precision p120-conceptual-insert" id="p120-reality-boundary" data-p120-conceptual-insert="boundary" data-reveal>
    <div class="chapter-index"><span>04</span><small>Акт I · Граница</small></div>
    <div class="chapter-head"><div class="chapter-hero"><h2>Понимание не гарантирует результат.</h2></div><div class="chapter-subtitle">P-120 объясняет различия; она не обещает идеальный исход.</div></div>
    <div class="chapter-flash"><p>Понимание не отменяет реальность другого человека.</p></div>
    <div class="editorial-body"><div class="editorial-prose p120-boundary-list">
      <p>P-120 не выбирает за человека, кого любить.</p>
      <p>Не создаёт притяжение там, где его нет.</p>
      <p>Не гарантирует взаимность.</p>
      <p>Не превращает сходство двух профилей в счастливые отношения.</p>
      <p>Не делает двух людей совместимыми.</p>
      <p>Не предсказывает судьбу отношений.</p>
      <p><strong>Задача P-120 — не устранить различие, а не дать ему остаться невидимым.</strong></p>
    </div></div>
  </section>`;

  function setSection(id,spec){
    const section=document.getElementById(id); if(!section) return;
    section.dataset.p120ConceptualEntry=VERSION;
    const idx=section.querySelector('.chapter-index span'); if(idx) idx.textContent=spec.number;
    const act=section.querySelector('.chapter-index small'); if(act) act.textContent=spec.act;
    const head=section.querySelector('.chapter-head');
    if(head){
      const tag=id==='why-important'?'h1':'h2';
      head.innerHTML=`<div class="chapter-hero"><${tag}>${esc(spec.hero).replace(/\n/g,'<br>')}</${tag}></div><div class="chapter-subtitle">${esc(spec.subtitle).replace(/\n/g,'<br>')}</div>`;
    }
    const flash=section.querySelector('.chapter-flash p'); if(flash) flash.textContent=spec.flash;
    const body=section.querySelector('.editorial-body');
    if(body) body.innerHTML=`<div class="editorial-prose p120-conceptual-prose">${spec.body.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`;
    const btn=section.querySelector('.chapter-cta .editorial-cta');
    if(btn){
      if(spec.cta){btn.textContent=spec.cta;btn.hidden=false;}
      else btn.hidden=true;
    }
    const sub=section.querySelector('.chapter-cta > span');
    if(spec.ctaSub){
      if(sub) sub.textContent=spec.ctaSub;
      else section.querySelector('.chapter-cta')?.insertAdjacentHTML('beforeend',`<span>${esc(spec.ctaSub)}</span>`);
    } else if(sub) sub.remove();
  }

  function insertCoreBlocks(home){
    const distinction=document.getElementById('life-energy');
    const desire=document.getElementById('understand-desire');
    if(!distinction||!desire||!distinction.parentNode)return;
    let utility=document.getElementById('p120-utility');
    if(!utility){distinction.insertAdjacentHTML('afterend',utilityMarkup());utility=document.getElementById('p120-utility');}
    let boundary=document.getElementById('p120-reality-boundary');
    if(!boundary){utility.insertAdjacentHTML('afterend',boundaryMarkup());boundary=document.getElementById('p120-reality-boundary');}
    if(boundary.nextElementSibling!==desire) desire.parentNode.insertBefore(desire,boundary.nextSibling);
  }

  function reconcileActs(home){
    const titles=['Различить то, что ощущается вместе','Когда различия встречаются','Что мы знаем — и где проходят границы','Собрать различия в карту'];
    home.querySelectorAll(':scope > .act-marker').forEach((m,i)=>{const s=m.querySelector('strong');if(s&&titles[i])s.textContent=titles[i];});
  }

  function reconcileInterludes(home){
    const i1=home.querySelector('.editorial-interlude.interlude-1 p');if(i1)i1.textContent='Искра говорит о начале. Она ещё ничего не обещает о продолжении.';
    const i2=home.querySelector('.editorial-interlude.interlude-2 p');if(i2)i2.textContent='Одно и то же может ощущаться двумя людьми по-разному.';
    const i3=home.querySelector('.editorial-interlude.interlude-3 p');if(i3)i3.textContent='Некоторые части себя мы всю жизнь только чувствуем.';
  }

  function reconcileNavigation(){
    document.querySelectorAll('[data-why-origin]').forEach(el=>{
      if(!el.matches('button,a'))return;
      const first=el.querySelector('div>div');const note=el.querySelector('small');
      if(first){if(first.textContent!=='Происхождение названия')first.textContent='Происхождение названия';if(note&&note.textContent!=='Почему система называется P-120')note.textContent='Почему система называется P-120';}
      else if(el.textContent!=='Происхождение названия')el.textContent='Происхождение названия';
    });
    document.querySelectorAll('.brand-origin-teaser').forEach(teaser=>{
      const h=teaser.querySelector('h2');if(h&&h.textContent!=='Происхождение названия')h.textContent='Происхождение названия';
      const p=teaser.querySelector('.brand-origin-copy p');const pt='72 + 48 объясняют число. Отдельная страница рассказывает, откуда появилось название P-120.';if(p&&p.textContent!==pt)p.textContent=pt;
      const a=teaser.querySelector('.brand-origin-link');const ah='Узнать происхождение <span aria-hidden="true">→</span>';if(a&&a.innerHTML!==ah)a.innerHTML=ah;
    });
    document.querySelectorAll('.brand-origin-interstitial').forEach(panel=>{
      const h=panel.querySelector('h2');if(h&&h.textContent!=='Происхождение названия')h.textContent='Происхождение названия';
      const p=panel.querySelector('.brand-origin-interstitial-copy p');const pt='72 + 48 объясняют число. Но происхождение названия этим не исчерпывается.';if(p&&p.textContent!==pt)p.textContent=pt;
      const a=panel.querySelector('a');const ah='Узнать происхождение <span aria-hidden="true">→</span>';if(a&&a.innerHTML!==ah)a.innerHTML=ah;
    });
  }

  function reconcileSupportInserts(home){
    const showcase=home.querySelector('#showcase');
    if(showcase&&showcase.dataset.p120ConceptualEntry!==VERSION){
      showcase.dataset.p120ConceptualEntry=VERSION;
      const support=showcase.querySelector('.support-head > p');
      if(support)support.textContent='Это демонстрационная визуализация. Реальный отчёт должен строиться из рассчитанных профилей, качества покрытия и разрешённых интерпретаций и описывать только те стороны профиля, для которых есть основания.';
      const note=showcase.querySelector('.showcase-note');if(note)note.textContent='В итоговом отчёте несколько независимых профилей могут рассматриваться рядом. Межмодульные связи описываются только там, где это разрешено измерительной и интерпретационной логикой.';
    }
    const examples=home.querySelector('#examples');
    if(examples&&examples.dataset.p120ConceptualEntry!==VERSION){examples.dataset.p120ConceptualEntry=VERSION;const h=examples.querySelector('.support-head h2');if(h)h.textContent='Одинаковая внешняя реакция может соответствовать разным конфигурациям профиля.';}
    const sci=home.querySelector('.science-confidence-insert');
    if(sci){const grid=sci.querySelector('.science-ledger-grid');if(grid&&grid.dataset.p120ConceptualEntry!==VERSION){grid.dataset.p120ConceptualEntry=VERSION;grid.innerHTML='<div><strong>Evidence</strong><span>проверяемая научная основа и source provenance</span></div><div><strong>Methods</strong><span>отдельная методологическая и измерительная архитектура</span></div><div><strong>Hypotheses</strong><span>фальсифицируемые межслойные вопросы</span></div><div><strong>Validation</strong><span>поэтапная эмпирическая программа</span></div>';}}
  }

  function bindCanonicalActions(home){
    const start=()=>{location.href='system/';};
    const map={
      'why-important':()=>document.getElementById('what-p120-shows')?.scrollIntoView({behavior:'smooth',block:'start'}),
      'understand-desire':start,'two-systems':start,'why-p120':start,
      'what-p120-shows':()=>document.getElementById('layers-insert')?.scrollIntoView({behavior:'smooth',block:'start'}),
      'science-foundation':()=>{location.href='science/';},'understand-earlier':start,'final':start
    };
    Object.entries(map).forEach(([id,fn])=>{const b=home.querySelector(`#${id} .chapter-cta .editorial-cta`);if(b)b.onclick=fn;});
  }

  function addStyle(){
    if(document.getElementById('p120-conceptual-entry-p25-style'))return;
    const style=document.createElement('style');style.id='p120-conceptual-entry-p25-style';
    style.textContent='.p120-conceptual-insert{border-top:1px solid var(--frame-line-soft,var(--line));padding-top:clamp(42px,6vw,86px);margin-top:clamp(38px,5vw,72px)}.p120-conceptual-prose,.p120-boundary-list{max-width:930px}.p120-boundary-list p{margin-block:.52em}@media(max-width:760px){.p120-conceptual-insert{padding-top:38px;margin-top:30px}.p120-conceptual-prose,.p120-boundary-list{max-width:none}}';
    document.head.appendChild(style);
  }

  function run(){
    timer=0;
    const home=document.querySelector('.editorial-home');if(!home)return;
    addStyle();
    Object.entries(sections).forEach(([id,s])=>setSection(id,s));
    insertCoreBlocks(home);reconcileActs(home);reconcileInterludes(home);reconcileNavigation();reconcileSupportInserts(home);bindCanonicalActions(home);
    home.dataset.p120ConceptualEntry=VERSION;
    document.documentElement.dataset.p120RuConceptualEntry=VERSION;
  }
  function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(run,35);}
  const start=()=>{
    run();
    const app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:false});
    setTimeout(run,300);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
