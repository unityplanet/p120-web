import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE='http://127.0.0.1:4173';
const OUT='qa-evidence-ru-conceptual-entry-pass2';
fs.mkdirSync(OUT,{recursive:true});

const report={
  id:'P120-WEB-RU-CEC-P2.5-QA',
  generatedAt:new Date().toISOString(),
  baseline:'644a6c769bad4ada605e5906ae301e630722d621',
  checks:[],viewports:{},scientificCopyRegression:{},externalIntelligibility:{status:'NOT_EXECUTED',reason:'Requires real independent first-time readers; automation must not fabricate human evidence.'}
};
function check(name,ok,detail=''){
  report.checks.push({name,ok:Boolean(ok),detail});
  if(!ok) throw new Error(`${name}: ${detail}`);
}

const retired=[
  'Сексуальность начинается не с секса',
  'импульс к жизни',
  'жизненная энергия',
  'сексуальная энергия',
  'созидательная энергия',
  'Встречаются две жизненные системы',
  'Зрелость — не отсутствие желания',
  'жизненность друг друга'
];

const viewports={desktop:{width:1440,height:1050},tablet:{width:900,height:1100},mobile:{width:390,height:844}};
const browser=await chromium.launch({headless:true});
try{
  for(const [name,viewport] of Object.entries(viewports)){
    const context=await browser.newContext({viewport});
    const page=await context.newPage();
    await page.goto(`${BASE}/`,{waitUntil:'networkidle'});
    await page.waitForSelector('html[data-p120-ru-conceptual-entry]',{timeout:10000});
    const state=await page.evaluate(()=>{
      const bodyText=document.body.innerText;
      const h1=[...document.querySelectorAll('h1')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0}).map(el=>el.textContent.trim());
      const nav=[...document.querySelectorAll('[data-why-origin]')].map(el=>el.textContent.replace(/\s+/g,' ').trim());
      return {
        h1,nav,bodyText,
        utility:!!document.getElementById('p120-utility'),
        boundary:!!document.getElementById('p120-reality-boundary'),
        width:{scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth},
        version:document.documentElement.dataset.p120RuConceptualEntry||null,
        actTitles:[...document.querySelectorAll('.editorial-home > .act-marker strong')].map(x=>x.textContent.trim())
      };
    });
    check(`${name}: canonical H1`,state.h1.includes('Что именно происходит, когда нас тянет к другому человеку?'),JSON.stringify(state.h1));
    check(`${name}: utility block`,state.utility,'#p120-utility missing');
    check(`${name}: reality boundary`,state.boundary,'#p120-reality-boundary missing');
    check(`${name}: origin nav label`,state.nav.some(x=>x.includes('Происхождение названия')),JSON.stringify(state.nav));
    check(`${name}: no horizontal overflow`,state.width.scroll<=state.width.client+2,JSON.stringify(state.width));
    check(`${name}: adapter version`,state.version==='P2.5-RU-v1.0',String(state.version));
    for(const phrase of retired) check(`${name}: retired phrase absent — ${phrase}`,!state.bodyText.includes(phrase),'visible text still contains retired phrase');
    report.viewports[name]={...state,bodyText:undefined};
    await page.screenshot({path:path.join(OUT,`homepage-${name}.png`),fullPage:true});
    await context.close();
  }

  // Founder origin/evidence boundary.
  {
    const context=await browser.newContext({viewport:viewports.desktop});
    const page=await context.newPage();
    await page.goto(`${BASE}/creator/`,{waitUntil:'networkidle'});
    await page.waitForSelector('[data-founder-origin-boundary]',{timeout:10000});
    const t=await page.locator('[data-founder-origin-boundary]').innerText();
    check('Founder: personal origin/evidence bridge',t.includes('личный опыт может поставить вопрос')&&t.includes('не может служить доказательством ответа'),t);
    const nav=await page.locator('.creator-topbar').innerText();
    check('Founder: origin navigation label',nav.includes('Происхождение названия'),nav);
    await page.screenshot({path:path.join(OUT,'creator-desktop.png'),fullPage:true});
    await context.close();
  }

  // System orientation. Fresh storage; trigger preflight if route opens another start surface first.
  {
    const context=await browser.newContext({viewport:viewports.desktop});
    await context.addInitScript(()=>{try{localStorage.clear();sessionStorage.clear();}catch(_){}});
    const page=await context.newPage();
    await page.goto(`${BASE}/system/`,{waitUntil:'networkidle'});
    if(!(await page.locator('.preflight.luxury-preflight').count())){
      const start=page.getByRole('button',{name:/Начать|Пройти P-120|Начать P-120/i}).first();
      if(await start.count()) { try{await start.click({timeout:2500});}catch(_){} }
    }
    await page.waitForSelector('#p120-system-orientation',{timeout:10000});
    const t=await page.locator('#p120-system-orientation').innerText();
    check('System: orientation card present',t.includes('Здесь нет «правильной» картины человека.'),t);
    check('System: non-forced-consistency instruction',t.includes('Они не обязательно означают ошибку.'),t);
    const orientationBox=await page.locator('#p120-system-orientation').boundingBox();
    check('System: orientation rendered visibly',!!orientationBox&&orientationBox.width>200&&orientationBox.height>100,JSON.stringify(orientationBox));
    await page.screenshot({path:path.join(OUT,'system-orientation-desktop.png'),fullPage:true});
    await context.close();
  }

  // EN must remain untouched until parity pass.
  {
    const context=await browser.newContext({viewport:viewports.desktop});
    const page=await context.newPage();
    await page.goto(`${BASE}/en/`,{waitUntil:'networkidle'});
    const en=await page.evaluate(()=>({insert:!!document.getElementById('p120-utility'),version:document.documentElement.dataset.p120RuConceptualEntry||null,lang:document.documentElement.lang}));
    check('EN parity firewall: no RU utility insert',!en.insert,JSON.stringify(en));
    check('EN parity firewall: no RU adapter marker',!en.version,JSON.stringify(en));
    await context.close();
  }

  // Scientific copy regression on rendered RU public surface.
  {
    const context=await browser.newContext({viewport:viewports.desktop});
    const page=await context.newPage();
    await page.goto(`${BASE}/`,{waitUntil:'networkidle'});
    await page.waitForSelector('html[data-p120-ru-conceptual-entry]');
    const text=await page.locator('body').innerText();
    const required=[
      'Научная основа и собственная архитектура P-120 — не одно и то же.',
      'Сила вывода должна соответствовать силе данных.',
      'Понимание не гарантирует результат.',
      'недостаточно оснований для вывода'
    ];
    for(const phrase of required)check(`Scientific regression: required boundary — ${phrase}`,text.includes(phrase),'missing required boundary phrase');
    const forbidden=['P-120 объясняет, почему','идеального партнёра','гарантирует счастливые отношения','раскрывает, кто вы на самом деле'];
    for(const phrase of forbidden)check(`Scientific regression: forbidden claim absent — ${phrase}`,!text.includes(phrase),'forbidden claim visible');
    report.scientificCopyRegression={required,forbidden,retired,status:'PASS'};
    await context.close();
  }

  report.status='PASS_AUTOMATED';
} catch(err){
  report.status='FAIL';report.error=String(err?.stack||err);
  throw err;
} finally {
  fs.writeFileSync(path.join(OUT,'qa-report.json'),JSON.stringify(report,null,2));
  await browser.close();
}
