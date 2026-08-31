/* P-120 Founder Editorial Story v1.0
   Source-reconciled runtime add-on for Navigation Architecture v2.
   No assessment, scoring, report or science model mutations. */
(() => {
  'use strict';

  if (/\/en\/(?:index\.html)?$/i.test(location.pathname)) return;

  const STORY_ID = 'founder-story';
  const ROUTE_KEY = 'creator';
  let observer = null;
  let revealObserver = null;
  let scheduled = 0;

  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const questions = [
    ['БЛИЗОСТЬ','Что заставляет меня приближаться?'],
    ['ДИСТАНЦИЯ','Что заставляет отступать?'],
    ['ПРИКОСНОВЕНИЕ','Что для меня означает прикосновение?'],
    ['СВОБОДА','Когда свобода становится дистанцией?'],
    ['ЖЕЛАНИЕ','Что я считаю проявлением желания?'],
    ['ЯЗЫК','Чего я жду от другого, но никогда не формулировал?'],
    ['ВНУТРЕННЕЕ','Что я чувствую, но ещё не умею назвать?']
  ];
  const doctrine = [
    ['НЕ ЯРЛЫК','А ВИДИМОСТЬ.'],
    ['НЕ ОЦЕНКА','А ЯЗЫК.'],
    ['НЕ ОДИН БАЛЛ','А СЛОИ.'],
    ['НЕ ДЕФЕКТ','А РАЗЛИЧИЕ.'],
    ['НЕ ПРОРОЧЕСТВО','А РЕФЛЕКСИЯ.'],
    ['НЕ МИСТИФИКАЦИЯ','А ОСНОВАНИЯ.']
  ];

  function storyMarkup(){
    return `
<section class="founder-story" id="${STORY_ID}" data-founder-story="v1.0" aria-labelledby="founder-story-title">
  <section class="founder-story__scene founder-story__scene--statement" id="fnd-00" data-fnd-screen="FND-00">
    <div class="founder-story__inner founder-story__reveal">
      <p class="founder-story__eyebrow">Из заметок создателя</p>
      <h2 class="founder-story__display" id="founder-story-title">P-120 начался не с теста.</h2>
      <p class="founder-story__display">Он начался с вопроса.</p>
    </div>
  </section>

  <section class="founder-story__scene founder-story__scene--question" id="fnd-01" data-fnd-screen="FND-01">
    <div class="founder-story__inner founder-story__reveal">
      <p class="founder-story__eyebrow">01 / Вопрос</p>
      <p class="founder-story__display founder-story__display--question">Почему человек может чувствовать очень многое — и при этом так мало уметь об этом сказать?</p>
      <p class="founder-story__display founder-story__display--question">Почему два человека могут быть близки — и всё равно не суметь по-настоящему рассказать друг другу, кто они?</p>
    </div>
  </section>

  <section class="founder-story__scene" id="fnd-02" data-fnd-screen="FND-02">
    <div class="founder-story__inner founder-story__reading founder-story__reveal">
      <p class="founder-story__eyebrow">02 / Сначала была жизнь</p>
      <p>Я думал об этом много лет. Не как исследователь, который однажды сел перед чистым листом и решил создать новый тест.</p>
      <p>Сначала была жизнь. Отношения. Ошибки. Встречи. Расставания. Периоды близости — и годы одиночества, когда появляется гораздо больше времени смотреть назад, сравнивать и задавать неудобные вопросы.</p>
      <p>Я разговаривал с очень разными людьми — с теми, кто объясняет человека через психологию, философию, тело, чувства или интуицию. И чем больше было объяснений, тем меньше меня интересовало, каким человек должен быть.</p>
      <p><strong>Меня интересовало другое: что человек действительно переживает, когда от него никто не требует правильного ответа?</strong></p>
    </div>
  </section>

  <section class="founder-story__scene" id="fnd-03" data-fnd-screen="FND-03">
    <div class="founder-story__inner founder-story__beats">
      <p class="founder-story__eyebrow founder-story__reveal">03 / Между чувством и языком</p>
      <p class="founder-story__beat founder-story__reveal">У человека может быть чувство — но не быть для него слова.</p>
      <p class="founder-story__beat founder-story__reveal">Желание — но не быть внутреннего разрешения сказать о нём.</p>
      <p class="founder-story__beat founder-story__reveal">Телесный отклик — но не быть понимания, что он означает именно для него.</p>
      <p class="founder-story__beat founder-story__beat--final founder-story__reveal">И иногда расстояние между переживанием и языком становится больше, чем расстояние между двумя людьми.</p>
    </div>
  </section>

  <section class="founder-story__scene" id="fnd-04" data-fnd-screen="FND-04">
    <div class="founder-story__inner">
      <p class="founder-story__eyebrow founder-story__reveal">04 / Что остаётся невысказанным</p>
      <div class="founder-story__questions">
        ${questions.map(([m,q])=>`<div class="founder-story__question-row founder-story__reveal"><span class="founder-story__marker">${esc(m)}</span><span class="founder-story__question-text">${esc(q)}</span></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="founder-story__scene founder-story__scene--statement" id="fnd-05" data-fnd-screen="FND-05">
    <div class="founder-story__inner founder-story__reveal">
      <p class="founder-story__eyebrow">05 / Наблюдение</p>
      <p class="founder-story__display founder-story__display--insight">Очень многое между людьми разрушается не потому, что они ничего не чувствуют.</p>
      <p class="founder-story__display founder-story__display--insight">Иногда — потому, что чувствуют больше, чем умеют перевести в слова.</p>
      <p class="founder-story__lead">Недосказанность не всегда означает скрытность. Иногда человек сам ещё не видит структуру того, что с ним происходит.</p>
    </div>
  </section>

  <section class="founder-story__scene founder-story__scene--scientific" id="fnd-06" data-fnd-screen="FND-06">
    <div class="founder-story__inner founder-story__reveal">
      <div class="founder-story__rule" aria-hidden="true"></div>
      <div class="founder-story__reading">
        <p>В какой-то момент возник другой вопрос:</p>
        <p><strong>А что, если прежде чем объяснять человеку, просто задать ему достаточно точные вопросы?</strong></p>
        <p>Не о том, хороший ли он партнёр. Не о том, нормальны ли его желания. Не о том, кем ему следует быть.</p>
        <p>А о том, как именно он переживает близость, желание, прикосновение, инициативу, безопасность, дистанцию и взаимность.</p>
      </div>
      <p class="founder-story__display founder-story__display--turn" style="margin-top:clamp(54px,7vw,110px)">Философский вопрос становится исследовательской задачей.</p>
    </div>
  </section>

  <section class="founder-story__scene founder-story__scene--scientific" id="fnd-07" data-fnd-screen="FND-07">
    <div class="founder-story__inner founder-story__coordinates">
      <div class="founder-story__coordinate-copy founder-story__reveal">
        <p class="founder-story__eyebrow">07 / Координаты</p>
        <p><strong>Так постепенно появился P-120.</strong></p>
        <p>Не как формула человека. Не как окончательный вердикт.</p>
        <p><strong>Как система координат.</strong></p>
        <p>Сложное не становится простым, когда у него появляются координаты. Оно становится различимым.</p>
        <p>Именно это меня интересовало: не уменьшить человека до результата, а увеличить разрешение, с которым он способен смотреть на собственный опыт.</p>
      </div>
      <div class="founder-story__coordinate-field founder-story__reveal" aria-hidden="true">
        <div class="founder-story__coordinate-labels"><span>ЖЕЛАНИЕ</span><span>БЛИЗОСТЬ</span><span>ДИСТАНЦИЯ</span><span>ПРИКОСНОВЕНИЕ</span><span>ЯЗЫК</span><span>ВЗАИМНОСТЬ</span></div>
      </div>
    </div>
  </section>

  <section class="founder-story__scene" id="fnd-08" data-fnd-screen="FND-08">
    <div class="founder-story__inner">
      <p class="founder-story__eyebrow founder-story__reveal">08 / Принципы</p>
      <div class="founder-story__doctrine">
        ${doctrine.map(([a,b])=>`<div class="founder-story__doctrine-row founder-story__reveal"><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="founder-story__scene founder-story__scene--scientific" id="fnd-09" data-fnd-screen="FND-09">
    <div class="founder-story__inner founder-story__boundary">
      <div class="founder-story__reveal">
        <p class="founder-story__eyebrow">09 / Где заканчивается автор</p>
        <h3 class="founder-story__boundary-title">P-120 родился из личного и философского вопроса.</h3>
      </div>
      <div class="founder-story__boundary-copy founder-story__reveal">
        <p><strong>Но ответы системы не должны зависеть от философии её создателя.</strong></p>
        <p>Наблюдение должно стать гипотезой. Гипотеза — определяемой конструкцией. Измерение — пройти проверку. А там, где оснований недостаточно, система должна уметь сказать: «Мы этого пока не знаем».</p>
        <p>Для меня это не слабость. Это граница между убеждением и знанием.</p>
        <p>P-120 не должен читать мысли, «раскрывать подсознание» или определять судьбу. Его задача — работать только в пределах того, что действительно можно обосновать.</p>
        <button class="founder-story__science-link" type="button" data-founder-route="science">Как устроена научная база →</button>
      </div>
    </div>
  </section>

  <section class="founder-story__scene founder-story__scene--north" id="fnd-10" data-fnd-screen="FND-10">
    <div class="founder-story__inner founder-story__reveal">
      <p class="founder-story__eyebrow">10 / P-120 North Star</p>
      <div class="founder-story__reading">
        <p>Поэтому задача P-120 одновременно скромнее и сложнее.</p>
        <p>Не объяснить человека вместо него.<br>Не определить.<br>Не исправить.</p>
        <p><strong>Помочь заметить.</strong></p>
      </div>
      <p class="founder-story__display founder-story__display--north" style="margin-top:clamp(56px,7vw,120px)">Сделать внутреннее видимым.</p>
      <div class="founder-story__north-copy"><p>Иногда первый настоящий шаг к пониманию другого начинается не с разговора с ним, а с момента, когда мы достаточно внимательно увидели самих себя.</p></div>
    </div>
  </section>

  <section class="founder-story__scene" id="fnd-11" data-fnd-screen="FND-11">
    <div class="founder-story__inner founder-story__signature founder-story__reveal">
      <div>
        <p class="founder-story__signature-mark">Di</p>
        <p class="founder-story__signature-role">из заметок создателя P-120</p>
      </div>
      <nav class="founder-story__routes" aria-label="Дальше по P-120">
        <button class="founder-story__route" type="button" data-founder-route="self"><span>ИССЛЕДОВАТЬ СЕБЯ</span><span>→</span></button>
        <button class="founder-story__route" type="button" data-founder-route="science"><span>НАУЧНАЯ БАЗА</span><span>→</span></button>
        <button class="founder-story__route" type="button" data-founder-route="why"><span>ПОЧЕМУ P-120?</span><span>→</span></button>
      </nav>
    </div>
  </section>
</section>`;
  }

  function scrollToStory(){
    const target=document.getElementById(STORY_ID);
    if(!target)return;
    const topbar=document.querySelector('.topbar');
    const offset=Math.max(70,Math.round(topbar?.getBoundingClientRect().height||70))+18;
    const y=window.scrollY+target.getBoundingClientRect().top-offset;
    window.scrollTo({top:Math.max(0,y),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }

  function patchNavigation(){
    const routes=window.P120_NAV_V2_ROUTES;
    if(routes?.[ROUTE_KEY]){
      routes[ROUTE_KEY].status='active';
      routes[ROUTE_KEY].target=STORY_ID;
    }
    document.querySelectorAll('[data-ecosystem-route="creator"],[data-ecosystem-mobile="creator"]').forEach(btn=>{
      btn.removeAttribute('aria-disabled');
      btn.querySelector('.ecosystem-item-status,.ecosystem-mobile-status')?.remove();
    });
  }

  function bindRoutes(root){
    root.querySelectorAll('[data-founder-route]').forEach(btn=>{
      if(btn.dataset.founderBound==='1')return;
      btn.dataset.founderBound='1';
      btn.addEventListener('click',()=>{
        const route=btn.dataset.founderRoute;
        if(route==='science'){
          if(typeof window.goScience==='function')window.goScience('science-top');
          else location.hash='science-top';
        } else if(route==='why'){
          if(typeof window.goHome==='function')window.goHome('why-p120');
          else location.hash='why-p120';
        } else if(route==='self'){
          if(typeof window.startOrResume==='function')window.startOrResume();
          else if(typeof window.openPreflight==='function')window.openPreflight();
        }
      });
    });
  }

  function setupReveal(root){
    revealObserver?.disconnect();
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      root.querySelectorAll('.founder-story__reveal').forEach(el=>el.classList.add('is-visible'));
      return;
    }
    revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');revealObserver.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px',threshold:.08});
    root.querySelectorAll('.founder-story__reveal').forEach(el=>revealObserver.observe(el));
  }

  function ensureStory(){
    scheduled=0;
    patchNavigation();
    const home=document.querySelector('.editorial-home');
    if(!home)return;
    let root=document.getElementById(STORY_ID);
    if(!root){
      const holder=document.createElement('div');
      holder.innerHTML=storyMarkup().trim();
      root=holder.firstElementChild;
      const why=document.getElementById('why-p120');
      const deeper=document.getElementById('extended-research-set');
      if(why?.parentNode===home)why.insertAdjacentElement('afterend',root);
      else if(deeper?.parentNode===home)deeper.insertAdjacentElement('beforebegin',root);
      else home.appendChild(root);
      bindRoutes(root);
      setupReveal(root);
    }
    patchNavigation();
  }

  function schedule(){if(scheduled)clearTimeout(scheduled);scheduled=setTimeout(ensureStory,55)}
  function start(){
    const app=document.getElementById('app')||document.body;
    observer=new MutationObserver(schedule);
    observer.observe(app,{childList:true,subtree:true});
    ensureStory();
    let retries=0;
    const timer=setInterval(()=>{patchNavigation();ensureStory();if(++retries>24)clearInterval(timer)},100);
    window.P120_FOUNDER_STORY={version:'1.0',scrollToStory};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
