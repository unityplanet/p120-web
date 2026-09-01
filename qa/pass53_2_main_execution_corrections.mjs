import {chromium} from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE=process.env.P120_QA_BASE||'http://127.0.0.1:4173';
const OUT='qa-artifacts/pass53-2';
const THEME_KEY='p120_web_theme_v16';
const SESSION_KEY='p120_web_prototype_v01';
fs.mkdirSync(OUT,{recursive:true});

const checks=[];
const failures=[];
const consoleErrors=[];
const check=(ok,msg,detail='')=>{checks.push({status:ok?'PASS':'FAIL',msg,detail});if(!ok)failures.push(detail?`${msg}: ${detail}`:msg)};
const browser=await chromium.launch({headless:true});

function seedScript(theme){
  return ({themeKey,sessionKey,theme})=>{
    try{localStorage.setItem(themeKey,theme)}catch(_){}
    const responses={};
    for(let i=1;i<=24;i++)responses[`SAT${String(i).padStart(2,'0')}`]='3';
    try{localStorage.setItem(sessionKey,JSON.stringify({
      participantId:'P120-QA532',screen:'home',itemIndex:24,responses,adminModes:{},
      telemetry:[{type:'session_created',at:new Date().toISOString()}],
      startedAt:new Date().toISOString(),consentAt:null,lastSavedAt:new Date().toISOString()
    }))}catch(_){}
  };
}

async function openMain({locale='en',theme='ivory',width=1920,height=1080}){
  const context=await browser.newContext({viewport:{width,height}});
  await context.addInitScript(seedScript(theme),{themeKey:THEME_KEY,sessionKey:SESSION_KEY,theme});
  const page=await context.newPage();
  const url=locale==='en'?'/en/':'/';
  page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(`${url} ${width} ${theme} console: ${msg.text()}`)});
  page.on('pageerror',err=>consoleErrors.push(`${url} ${width} ${theme} pageerror: ${err.message}`));
  const response=await page.goto(BASE+url,{waitUntil:'domcontentloaded',timeout:30000});
  check(!!response&&response.status()<400,`${url} ${width} ${theme} responds`,response?String(response.status()):'no response');
  await page.waitForSelector('html[data-p120-brand-system="5.3"]',{timeout:15000});
  await page.waitForSelector('html[data-p120-pass532="ready"]',{timeout:15000});
  await page.waitForSelector('.editorial-resume-rail.p120-resume53',{timeout:15000});
  await page.waitForSelector('.header-theme-menu.p120-main-theme532',{timeout:15000});
  await page.waitForTimeout(500);
  return {context,page,url};
}

async function inspectStack(page,label,width,theme){
  await page.evaluate(()=>window.scrollTo({top:1050,behavior:'auto'}));
  await page.waitForFunction(()=>document.documentElement.classList.contains('chapter-nav-visible'),null,{timeout:8000});
  await page.waitForTimeout(180);
  const state=await page.evaluate(()=>{
    const rect=o=>o?{top:o.top,bottom:o.bottom,left:o.left,right:o.right,width:o.width,height:o.height}:null;
    const rail=document.querySelector('.editorial-resume-rail.p120-resume53');
    const nav=document.querySelector('.chapter-jump-nav-inner');
    const rc=rail?.getBoundingClientRect();
    const nc=nav?.getBoundingClientRect();
    const rs=rail?getComputedStyle(rail):null;
    return {rail:rect(rc),nav:rect(nc),railBg:rs?.backgroundColor||'',railBorder:rs?.borderTopColor||'',viewport:innerWidth};
  });
  check(!!state.rail&&!!state.nav,`${label} ${width} ${theme} functional planes exist`,JSON.stringify(state));
  if(state.rail&&state.nav){
    check(state.nav.bottom+5<=state.rail.top,`${label} ${width} ${theme} chapter navigation does not overlap saved research`,JSON.stringify(state));
    check(state.rail.width>=Math.min(width-120,1180),`${label} ${width} ${theme} saved research uses available stage width`,JSON.stringify(state.rail));
    check(state.nav.width>=Math.min(width-140,1180),`${label} ${width} ${theme} chapter navigation uses available stage width`,JSON.stringify(state.nav));
    check(state.rail.left>=0&&state.rail.right<=state.viewport+1,`${label} ${width} ${theme} saved research stays inside viewport`,JSON.stringify(state.rail));
  }
  if(theme==='ivory')check(!/255,\s*254,\s*250/.test(state.railBg),`${label} ${width} Ivory saved plane is softened from hard white`,state.railBg);
  return state;
}

async function inspectThemeMenu(page,label,width,theme){
  const menu=page.locator('.header-theme-menu.p120-main-theme532').first();
  const expected={ivory:'Ivory',graphite:'Graphite',museum:'Museum'}[theme];
  const summaryText=(await menu.locator('summary').innerText()).trim();
  check(summaryText===expected,`${label} ${width} ${theme} theme summary reflects current state`,summaryText);
  await menu.locator('summary').click();
  await page.waitForTimeout(100);
  const state=await menu.evaluate(el=>{
    const pop=el.querySelector('.header-theme-popover');
    const options=[...el.querySelectorAll('.header-theme-option')];
    const r=pop?.getBoundingClientRect();
    const rows=options.map(o=>{const x=o.getBoundingClientRect();return {top:x.top,bottom:x.bottom,left:x.left,right:x.right,width:x.width,height:x.height,text:o.textContent.trim()}});
    return {
      open:el.open,
      pop:r?{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}:null,
      rows,
      popBg:pop?getComputedStyle(pop).backgroundColor:'',
      viewport:innerWidth
    };
  });
  check(state.open&&!!state.pop,`${label} ${width} ${theme} theme popover opens`,JSON.stringify(state));
  if(state.pop){
    check(state.pop.left>=0&&state.pop.right<=state.viewport+1,`${label} ${width} ${theme} theme popover stays inside viewport`,JSON.stringify(state.pop));
    check(state.pop.width>=190,`${label} ${width} ${theme} theme popover has stable width`,String(state.pop.width));
    check(!/rgba\([^)]*,\s*0\)/.test(state.popBg),`${label} ${width} ${theme} theme popover has a solid semantic surface`,state.popBg);
  }
  check(state.rows.length===3,`${label} ${width} ${theme} exactly three theme rows`,JSON.stringify(state.rows));
  for(let i=0;i<state.rows.length-1;i++){
    check(state.rows[i].bottom<=state.rows[i+1].top+0.5,`${label} ${width} ${theme} theme rows do not overlap ${i+1}/${i+2}`,JSON.stringify(state.rows));
  }
  check(state.rows.every(r=>r.height>=43&&r.width>150),`${label} ${width} ${theme} theme rows retain deterministic geometry`,JSON.stringify(state.rows));
}

for(const width of [1366,1920]){
  for(const theme of ['ivory','graphite','museum']){
    const {context,page}=await openMain({locale:'en',theme,width});
    await inspectStack(page,'EN',width,theme);
    await inspectThemeMenu(page,'EN',width,theme);
    await page.screenshot({path:path.join(OUT,`main-${width}-${theme}-theme-open.png`),fullPage:false});
    await page.keyboard.press('Escape');
    await context.close();
  }
}

// Explicit state-change regression: Graphite must not leave the legacy Ivory label behind.
{
  const {context,page}=await openMain({locale:'en',theme:'ivory',width:1920});
  const menu=page.locator('.header-theme-menu.p120-main-theme532').first();
  await menu.locator('summary').click();
  await menu.locator('[data-set-theme="graphite"]').click();
  await page.waitForFunction(()=>document.body.dataset.theme==='graphite');
  await page.waitForTimeout(120);
  const state=await page.evaluate(()=>({
    theme:document.body.dataset.theme,
    stored:localStorage.getItem('p120_web_theme_v16'),
    label:document.querySelector('.header-theme-menu .p120-main-theme532-label')?.textContent.trim()||'',
    open:document.querySelector('.header-theme-menu')?.open||false
  }));
  check(state.theme==='graphite'&&state.stored==='graphite','EN theme selection persists Graphite',JSON.stringify(state));
  check(state.label==='Graphite','EN Graphite selection updates header label without stale Ivory text',JSON.stringify(state));
  check(state.open===false,'EN theme menu closes cleanly after selection',JSON.stringify(state));
  await page.locator('.header-theme-menu summary').click();
  await page.screenshot({path:path.join(OUT,'main-1920-graphite-after-switch.png'),fullPage:false});
  await context.close();
}

// RU label parity — do not fix EN while leaving the Russian public control stale.
{
  const {context,page}=await openMain({locale:'ru',theme:'graphite',width:1920});
  const text=(await page.locator('.header-theme-menu.p120-main-theme532 summary').innerText()).trim();
  check(text==='Графит','RU Graphite summary is synchronized',text);
  await context.close();
}

// Chapter 04 semantics: “Ещё глубже” is a chapter jump on the main page, not the
// dedicated Extended route. The teaser CTA remains the explicit route transition.
{
  const {context,page}=await openMain({locale:'ru',theme:'ivory',width:1440,height:1000});
  await page.waitForSelector('#extended-research-entry',{timeout:15000});
  await page.evaluate(()=>window.scrollTo({top:1050,behavior:'auto'}));
  await page.waitForFunction(()=>document.documentElement.classList.contains('chapter-nav-visible'),null,{timeout:8000});
  const beforePath=await page.evaluate(()=>location.pathname);
  await page.locator('[data-chapter-jump="extended"]').click();
  await page.waitForTimeout(850);
  const state=await page.evaluate(()=>{
    const target=document.getElementById('extended-research-entry');
    const r=target?.getBoundingClientRect();
    return {
      path:location.pathname,
      targetTop:r?.top??null,
      targetBottom:r?.bottom??null,
      active:document.querySelector('[data-chapter-jump="extended"]')?.classList.contains('is-active')||false,
      title:target?.querySelector('h2')?.textContent.trim()||''
    };
  });
  check(state.path===beforePath,'RU chapter 04 stays on the main-page route',JSON.stringify(state));
  check(state.title==='Хотите глубже?','RU chapter 04 targets the compact main-page deeper teaser',JSON.stringify(state));
  check(Number.isFinite(state.targetTop)&&state.targetTop>=0&&state.targetTop<320,'RU chapter 04 scrolls the deeper teaser into the reading plane',JSON.stringify(state));
  check(state.active,'RU chapter 04 becomes the active chapter after jump',JSON.stringify(state));
  await page.screenshot({path:path.join(OUT,'main-1440-ivory-chapter04-deeper.png'),fullPage:false});
  await page.locator('#extended-research-entry [data-open-extended-page]').click();
  await page.waitForURL(/\/extended\/$/,{timeout:10000});
  check(new URL(page.url()).pathname.endsWith('/extended/'),'RU deeper teaser CTA still opens the dedicated Extended page',page.url());
  await context.close();
}

check(consoleErrors.length===0,'PASS 5.3.2 introduces no JavaScript console/page errors',consoleErrors.join(' | '));
await browser.close();

const report={generated_at:new Date().toISOString(),checks,failures,consoleErrors};
fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(OUT,'QA_REPORT.txt'),checks.map(x=>`${x.status} ${x.msg}${x.detail?` :: ${x.detail}`:''}`).join('\n')+`\n\n${failures.length?`FAIL ${failures.length}`:'PASS'}\n`);
console.log(`PASS 5.3.2 targeted QA checks=${checks.length} failures=${failures.length} screenshots=8`);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
