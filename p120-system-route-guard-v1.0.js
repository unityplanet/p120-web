/* P-120 System Route Guard v1.0
   Presentation/routing boundary only. No measurement, item, response, scoring, or interpretation logic. */
(() => {
  'use strict';

  const isSystemRoute = /(?:^|\/)system(?:\/|index\.html)?$/i.test(location.pathname);
  if (!isSystemRoute) return;

  let timer = 0;

  function localeHref(locale) {
    const url = new URL(location.href);
    let p = url.pathname;
    if (locale === 'en') {
      if (/\/en\/system(?:\/|\/index\.html)?$/i.test(p)) {
        p = p.replace(/\/index\.html$/i, '/');
      } else {
        p = p.replace(/\/system(?:\/|\/index\.html)?$/i, '/en/system/');
      }
    } else {
      p = p.replace(/\/en\/system(?:\/|\/index\.html)?$/i, '/system/');
      p = p.replace(/\/index\.html$/i, '/');
    }
    url.pathname = p;
    url.search = '';
    url.hash = '';
    return url.href;
  }

  function sync() {
    timer = 0;
    const current = /\/en\/system(?:\/|\/index\.html)?$/i.test(location.pathname) ? 'en' : 'ru';
    document.querySelectorAll('.p120-language-switch a[lang],.p120-language-mobile-options a[lang]').forEach(a => {
      const locale = a.getAttribute('lang') === 'en' ? 'en' : 'ru';
      const href = localeHref(locale);
      if (a.href !== href) a.href = href;
      if (locale === current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(sync, 0);
  }

  document.addEventListener('click', event => {
    const a = event.target.closest?.('.p120-language-switch a[lang],.p120-language-mobile-options a[lang]');
    if (!a) return;
    const locale = a.getAttribute('lang') === 'en' ? 'en' : 'ru';
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(localeHref(locale));
  }, true);

  const start = () => {
    sync();
    new MutationObserver(schedule).observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['href','aria-current']});
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();

/* P-120 Architecture Narrative — System Functional / Strategic Derivative PASS 4 v1.0
   Additive respondent-facing orientation only.
   No questionnaire, response, scoring, threshold, session, persistence, report-calculation,
   Scientific Base, Supabase/Auth/RLS, or interpretation-engine mutation. */
(() => {
  'use strict';

  const ROUTE_RE=/(?:^|\/)(?:en\/)?system(?:\/|index\.html)?$/i;
  if(!ROUTE_RE.test(location.pathname)) return;
  if(window.P120SystemFunctionalDerivative?.version==='1.0') return;

  const COPY={
    ru:{
      eyebrow:'КАК РАБОТАЕТ СИСТЕМА',
      title:'Что происходит с вашими ответами.',
      intro:'P-120 сохраняет разные исследовательские слои раздельно: ответы не превращаются в один общий «балл сексуальности». Каждый следующий этап имеет свою роль.',
      steps:[
        ['Ответ','Вы фиксируете собственный опыт в пределах конкретного вопроса. N/A означает недостаток релевантного опыта, а не низкий показатель.'],
        ['Измерение','Ответы остаются привязаны к своим измерительным территориям и исходным показателям; соседние процессы не должны сливаться только потому, что они связаны.'],
        ['Вычисление','Зафиксированные правила расчёта организуют ответы в производные показатели и многомерный профиль. Вычислительный слой не меняет сами ответы.'],
        ['Интерпретация','Профиль можно читать совместно по слоям, отмечая согласующиеся и расходящиеся сигналы, но интерпретация не становится новым измерением и не переписывает исходные показатели.'],
        ['Статус знания','Research Candidate означает, что надёжность, факторная структура, пороги и другие эмпирические свойства должны подтверждаться отдельной программой валидации.']
      ],
      boundaryTitle:'Граница результата',
      boundary:'Результат P-120 не является диагнозом, не определяет сексуальную ориентацию или травму и не устанавливает совместимость конкретной пары по данным одного человека.',
      link:'Подробнее об архитектуре P-120',
      href:'about/'
    },
    en:{
      eyebrow:'HOW THE SYSTEM WORKS',
      title:'What happens to your answers.',
      intro:'P-120 keeps its research layers separate: answers are not collapsed into one overall “sexuality score.” Each subsequent stage has a distinct role.',
      steps:[
        ['Response','You record your own experience within the scope of a specific question. N/A means insufficient relevant experience, not a low score.'],
        ['Measurement','Responses remain attached to their measurement territories and source indicators; neighboring processes should not be merged simply because they are related.'],
        ['Computation','Fixed calculation rules organize responses into derived indicators and a multidimensional profile. The computational layer does not change the responses themselves.'],
        ['Interpretation','The profile can be read across layers, including convergent and divergent signals, but interpretation does not become a new measurement and does not rewrite source indicators.'],
        ['Evidence status','Research Candidate means reliability, factor structure, thresholds, and other empirical properties require a separate validation programme.']
      ],
      boundaryTitle:'Result boundary',
      boundary:'A P-120 result is not a diagnosis, does not determine sexual orientation or trauma, and cannot establish the compatibility of a specific couple from one person’s data.',
      link:'More about the P-120 architecture',
      href:'en/about/'
    }
  };

  const isEn=()=>document.documentElement.lang?.toLowerCase().startsWith('en')||/\/en\/system(?:\/|\/index\.html)?$/i.test(location.pathname);
  let scheduled=false;

  function ensureStyle(){
    if(document.getElementById('p120-system-pass4-functional-style')) return;
    const style=document.createElement('style');
    style.id='p120-system-pass4-functional-style';
    style.textContent=`
      .p120-system-pass4-functional{margin:22px 0 4px;padding:22px;border-radius:18px;position:relative;overflow:hidden}
      .p120-system-pass4-functional h3{margin:8px 0 10px;font-size:clamp(23px,2vw,31px)}
      .p120-system-pass4-functional>.small{display:block;max-width:820px;font-size:13px;line-height:1.6}
      .p120-system-pass4-functional .flow-list{margin-top:14px}
      .p120-system-pass4-functional .flow-step{grid-template-columns:38px 1fr;padding:14px 0}
      .p120-system-pass4-functional .flow-num{width:32px;height:32px;font-size:11px}
      .p120-system-pass4-functional .flow-step strong{font-size:14px}
      .p120-system-pass4-functional .flow-step p{font-size:13px;line-height:1.55}
      .p120-system-pass4-boundary{margin-top:14px;padding:14px 16px;border-left:3px solid var(--ink);background:var(--soft);font-size:13px;line-height:1.55}
      .p120-system-pass4-boundary strong{display:block;margin-bottom:4px}
      .p120-system-pass4-more{display:inline-flex;margin-top:14px;font-size:12px;font-weight:800;text-decoration:none;border-bottom:1px solid currentColor}
      body[data-theme='graphite'] .p120-system-pass4-boundary,body[data-theme='museum'] .p120-system-pass4-boundary{background:rgba(255,255,255,.04)}
      @media(max-width:640px){.p120-system-pass4-functional{padding:18px}.p120-system-pass4-functional .flow-step{grid-template-columns:34px 1fr}}
    `;
    document.head.appendChild(style);
  }

  function render(){
    const main=document.querySelector('.luxury-preflight .preflight-main');
    if(!main) return false;
    if(main.querySelector('[data-p120-system-functional-derivative="pass4-v1.0"]')) return true;
    const ritual=main.querySelector('.luxury-ritual-grid');
    if(!ritual) return false;
    const c=COPY[isEn()?'en':'ru'];
    const section=document.createElement('section');
    section.className='preflight-panel p120-system-pass4-functional';
    section.dataset.p120SystemFunctionalDerivative='pass4-v1.0';
    section.setAttribute('aria-label',c.eyebrow);
    section.innerHTML=`
      <div class="eyebrow">${c.eyebrow}</div>
      <h3>${c.title}</h3>
      <span class="small">${c.intro}</span>
      <div class="flow-list">${c.steps.map((step,i)=>`<div class="flow-step"><div class="flow-num">${String(i+1).padStart(2,'0')}</div><div><strong>${step[0]}</strong><p>${step[1]}</p></div></div>`).join('')}</div>
      <div class="p120-system-pass4-boundary"><strong>${c.boundaryTitle}</strong>${c.boundary}</div>
      <a class="p120-system-pass4-more" href="${c.href}">${c.link} →</a>`;
    ritual.insertAdjacentElement('afterend',section);
    document.documentElement.dataset.p120SystemFunctionalDerivative='pass4-v1.0';
    return true;
  }

  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;render()});
  }

  function start(){
    ensureStyle();
    render();
    const app=document.getElementById('app')||document.body;
    new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  }

  window.P120SystemFunctionalDerivative={version:'1.0',render};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
