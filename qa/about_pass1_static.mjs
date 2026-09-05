#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=p=>fs.existsSync(path.join(ROOT,p));
const failures=[];
const checks=[];
const check=(id,condition,detail='')=>{const pass=Boolean(condition);checks.push({id,pass,detail});if(!pass)failures.push(id);};
const count=(s,re)=>(s.match(re)||[]).length;

const ru=read('about/index.html');
const en=read('en/about/index.html');
const css=read('about/about-p120-v1.0.css');
const js=read('about/about-p120-v1.0.js');
const brand=read('p120-brand-system-v1.0.js');

check('files.about.ru',exists('about/index.html'));
check('files.about.en',exists('en/about/index.html'));
check('files.about.css',exists('about/about-p120-v1.0.css'));
check('files.about.js',exists('about/about-p120-v1.0.js'));
check('language.ru',/<html\s+lang="ru"/.test(ru));
check('language.en',/<html\s+lang="en"/.test(en));
check('structure.ru.h1',count(ru,/<h1\b/g)===1,`count=${count(ru,/<h1\b/g)}`);
check('structure.en.h1',count(en,/<h1\b/g)===1,`count=${count(en,/<h1\b/g)}`);
check('structure.ru.h2',count(ru,/<h2\b/g)===8,`count=${count(ru,/<h2\b/g)}`);
check('structure.en.h2',count(en,/<h2\b/g)===8,`count=${count(en,/<h2\b/g)}`);
check('structure.ru.validation5',count(ru,/class="validation-card"/g)===5);
check('structure.en.validation5',count(en,/class="validation-card"/g)===5);
check('structure.ru.governance6',count(ru,/class="governance-item"/g)===6);
check('structure.en.governance6',count(en,/class="governance-item"/g)===6);

const sectionIds=['architecture','object','topology','results','validation','governance','human-computation','boundaries','definition'];
for(const id of sectionIds){
  check(`section.ru.${id}`,ru.includes(`id="${id}"`));
  check(`section.en.${id}`,en.includes(`id="${id}"`));
}

const mandatoryRu=[
  'не один тест и не один итоговый балл',
  'Core-120',
  'активация ≠ мотивация',
  'связь ≠ причинность',
  'Синтетическая техническая валидация',
  'Research Candidate',
  'самоуправляемая исследовательская архитектура',
  'не автономность',
  'управляемая организационная память',
  'Архитектура второго порядка',
  'вычислительная исследовательская среда под управлением Фаундера',
  'Фиксированный количественный множитель производительности не заявляется',
  'трассируемые правила'
];
const mandatoryEn=[
  'not one test and not one overall score',
  'Core-120',
  'activation ≠ motivation',
  'association ≠ causation',
  'Synthetic technical validation',
  'Research Candidate',
  'Self-governing research architecture',
  'does <strong>not mean autonomy</strong>',
  'Governed organisational memory',
  'Second-order research architecture',
  'Founder-governed computational research environment',
  'No fixed quantitative productivity multiplier is claimed',
  'traceable rules'
];
const ruFold=ru.toLocaleLowerCase('ru');
const enFold=en.toLowerCase();
for(const term of mandatoryRu)check(`concept.ru.${term.slice(0,28)}`,ruFold.includes(term.toLocaleLowerCase('ru')));
for(const term of mandatoryEn)check(`concept.en.${term.slice(0,28)}`,enFold.includes(term.toLowerCase()));

const prohibited=[
  [/\bvalidated\b/i,'validated-claim'],
  [/\bstandardized\b/i,'standardized-claim'],
  [/\bnormed\b/i,'normed-claim'],
  [/[×x]\s*100\b/i,'fixed-x100'],
  [/universal compatibility percentage is valid/i,'compatibility-certainty'],
  [/autonomous scientific (agent|agency)/i,'autonomous-agency']
];
for(const [re,label] of prohibited){
  check(`prohibited.ru.${label}`,!re.test(ru));
  check(`prohibited.en.${label}`,!re.test(en));
}

check('boundary.ru.no-diagnosis',ru.includes('Не диагноз'));
check('boundary.en.no-diagnosis',en.includes('Not a diagnosis'));
check('boundary.ru.no-self-validation',ru.includes('Не самовалидация'));
check('boundary.en.no-self-validation',en.includes('Not self-validation'));
check('boundary.ru.no-universal-percent',ru.includes('не разрешает универсальный процент «совместимости»'));
check('boundary.en.no-universal-percent',en.includes('does not authorise a universal “compatibility percentage”'));

check('identity.ru.core120',ru.includes('Замороженная 120-пунктовая идентичность'));
check('identity.en.core120',en.includes('frozen 120-item measurement identity'));
check('identity.ru.umbrella',ru.includes('ЗОНТИЧНАЯ АРХИТЕКТУРА'));
check('identity.en.umbrella',en.includes('UMBRELLA ARCHITECTURE'));

check('route.ru.language',ru.includes('href="../en/about/"'));
check('route.en.language',en.includes('href="../../about/"'));
check('route.ru.current',ru.includes('href="./" aria-current="page">О P-120</a>'));
check('route.en.current',en.includes('href="./" aria-current="page">About P-120</a>'));
check('route.brand.kind',brand.includes("'terms','about','why-p120'"));
check('route.brand.static',brand.includes("href=\"${routeFor('about')}\""));
check('route.brand.mainDesktop',brand.includes('button[data-nav="why-important"],button[data-p120-about-route]'));
check('route.brand.mainMobile',brand.includes('data-p120-about-discovery'));
check('route.brand.noLegacyAboutAnchor',!brand.includes("homeAnchor('why-important')"));

check('runtime.about.noMeasurement',!/P120_INSTRUMENT|score|scoring|response_value|supabase/i.test(js));
check('css.braces',count(css,/\{/g)===count(css,/\}/g),`${count(css,/\{/g)}/${count(css,/\}/g)}`);
for(const family of ['Noto Serif Display','Noto Serif','Prata','IBM Plex Sans','IBM Plex Mono']){
  check(`fonts.${family}`,css.includes(family));
}

function localTargets(html,basePath){
  const links=[...html.matchAll(/\shref="([^"]+)"/g)].map(m=>m[1]);
  return links.filter(h=>!h.startsWith('#')&&!/^(?:https?:|mailto:|tel:|javascript:)/i.test(h)).map(h=>{
    const clean=h.split('#')[0].split('?')[0];
    const abs=path.resolve(ROOT,path.dirname(basePath),clean||'.');
    const target=clean.endsWith('/')?path.join(abs,'index.html'):abs;
    return {href:h,target};
  });
}
for(const [lang,html,base] of [['ru',ru,'about/index.html'],['en',en,'en/about/index.html']]){
  for(const {href,target} of localTargets(html,base))check(`link.${lang}.${href}`,fs.existsSync(target),path.relative(ROOT,target));
}

const result={schema:'p120.about.pass1.static.v1',generated_at:new Date().toISOString(),checks,failures,verdict:failures.length?'FAIL':'PASS'};
fs.mkdirSync(path.join(ROOT,'qa-evidence-about-pass1'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'qa-evidence-about-pass1','static.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length)process.exit(1);
