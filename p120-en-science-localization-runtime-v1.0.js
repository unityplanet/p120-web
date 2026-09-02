/* P-120 EN Scientific Base localization runtime v1.0
   Controlled localization application layer for /en/science/ only.
   Uses the existing authorized RU->EN dictionary and formulaic UI bindings.
   Does not alter constructs, evidence claims, measurement, scoring, items, or interpretation rules. */
(() => {
  'use strict';
  if (!/\/en\/science(?:\/|\/index\.html)?$/i.test(location.pathname)) return;

  const D = window.P120_EN_TRANSLATIONS || new Map();
  const CYR = /[А-Яа-яЁё]/;
  let timer = 0;
  let running = false;

  const controlledExtras = [
    ['исследовательская архитектура · 18+','research architecture · 18+'],
    ['Воспроизводимый контроль версий.','Reproducible version governance.'],
    ['Пункты понимаются так, как задумано.','Items are understood as intended.'],
    ['Удаление или перепись системно неоднозначных пунктов.','Remove or rewrite systematically ambiguous items.'],
    ['Сохраняется архитектура, превосходящая более простые альтернативы.','Retain the architecture only if it outperforms simpler alternatives.'],
    ['Контроль переобучения на пилотной выборке.','Control overfitting to the pilot sample.'],
    ['Эмпирически обоснованные интервалы вместо предварительных зон эквивалентности.','Empirically justified intervals instead of provisional equivalence zones.'],
    ['Родственные, но не избыточные связи.','Related but non-redundant associations.'],
    ['Решение о сохранении или перестройке P-показателя.','Decision to retain or restructure the P index.'],
    ['Поведенческая конвергенция критических компонентов.','Behavioral convergence of critical components.'],
    ['Проспективная валидность и разделение ситуативной и устойчивой вариации.','Prospective validity and separation of situational from stable variation.'],
    ['Условия, при которых допустимы групповые сравнения.','Conditions under which group comparisons are defensible.'],
    ['Оценка совместимости без псевдоточности по одному респонденту.','Compatibility assessment without pseudo-precision from a single respondent.'],
    ['Переход от данных разработчика к независимой валидации.','Transition from developer-generated evidence to independent validation.'],
    ['01. Архитектура','01. Architecture'],
    ['02. Две системы','02. Two systems'],
    ['03. Результат','03. Result'],
    ['04. Ещё глубже','04. Go deeper'],
    ['05. Наука','05. Science']
  ];
  controlledExtras.forEach(([ru,en]) => { if (!D.has(ru)) D.set(ru,en); });

  function dynamicTranslate(s) {
    if (D.has(s)) return D.get(s);
    let m;
    if ((m=s.match(/^(\d+) · ФОРМА ПРОЯВЛЕНИЯ$/))) return `${m[1]} · EXPRESSION`;
    if ((m=s.match(/^(\d+) стр\.$/))) return `${m[1]} pp.`;
    if ((m=s.match(/^(\d+) источников\.$/))) return `${m[1]} sources.`;
    if ((m=s.match(/^(\d+) различий$/))) return `${m[1]} distinctions`;
    if ((m=s.match(/^Критерий · (.+)$/))) {
      const inner=D.get(m[1]) || m[1];
      return `Criterion · ${inner}`;
    }
    if ((m=s.match(/^Граница:\s*(.+)$/))) {
      const inner=D.get(m[1]) || m[1];
      return `Boundary: ${inner}`;
    }
    if ((m=s.match(/^(\d{2})\.\s*(.+)$/))) {
      const inner=D.get(m[2]) || m[2];
      if (inner !== m[2]) return `${m[1]}. ${inner}`;
    }
    return s;
  }

  function excluded(node) {
    const el=node.nodeType===Node.ELEMENT_NODE ? node : node.parentElement;
    return !!el?.closest?.('script,style,noscript,template');
  }

  function replaceTextNode(node) {
    if (excluded(node)) return;
    const raw=node.nodeValue;
    if (!raw || !CYR.test(raw)) return;
    const lead=raw.match(/^\s*/)?.[0] || '';
    const tail=raw.match(/\s*$/)?.[0] || '';
    const core=raw.trim();
    if (!core) return;
    const en=dynamicTranslate(core);
    if (en!==core) node.nodeValue=lead+en+tail;
  }

  function translateAttributes(el) {
    if (!el || excluded(el)) return;
    for (const attr of ['aria-label','placeholder','title']) {
      const raw=el.getAttribute?.(attr);
      if (!raw || !CYR.test(raw)) continue;
      const core=raw.trim();
      const en=dynamicTranslate(core);
      if (en!==core) el.setAttribute(attr,en);
    }
  }

  function translateTree(root) {
    if (!root) return;
    if (root.nodeType===Node.TEXT_NODE) replaceTextNode(root);
    else if (root.nodeType===Node.ELEMENT_NODE) translateAttributes(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n=walker.nextNode())) {
      if (n.nodeType===Node.TEXT_NODE) replaceTextNode(n);
      else translateAttributes(n);
    }
  }

  function apply() {
    timer=0;
    if (running) return;
    running=true;
    try {
      translateTree(document.body);
      document.documentElement.lang='en';
      document.documentElement.dataset.scienceLocalization='en-v1.0';
      document.title='Scientific Base — P-120';
    } finally {
      running=false;
    }
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer=setTimeout(apply,25);
  }

  function start() {
    apply();
    new MutationObserver(schedule).observe(document.body,{
      childList:true,subtree:true,characterData:true,attributes:true,
      attributeFilter:['aria-label','placeholder','title']
    });
    window.addEventListener('load',()=>setTimeout(apply,60),{once:true});
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
