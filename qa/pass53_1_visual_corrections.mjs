import {chromium} from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE=process.env.P120_QA_BASE||'http://127.0.0.1:4173';
const OUT='qa-artifacts/pass53-1';
const THEME_KEY='p120_web_theme_v16';
const SESSION_KEY='p120_web_prototype_v01';
fs.mkdirSync(OUT,{recursive:true});

const checks=[];
const failures=[];
const consoleErrors=[];
const check=(ok,msg,detail='')=>{checks.push({status:ok?'PASS':'FAIL',msg,detail});if(!ok)failures.push(detail?`${msg}: ${detail}`:msg)};

const browser=await chromium.launch({headless:true});

async function makeContext({session=false}={}){
  const context=await browser.newContext({viewport:{width:1920,height:1080}});
  await context.addInitScript(({themeKey,sessionKey,seedSession})=>{
    try{localStorage.setItem(themeKey,'museum')}catch(_){}
    if(seedSession){
      const responses={};
      for(let i=1;i<=24;i++) responses[`SAT${String(i).padStart(2,'0')}`]='3';
      try{localStorage.setItem(sessionKey,JSON.stringify({
        participantId:'P120-QA531',screen:'home',itemIndex:24,responses,adminModes:{},
        telemetry:[{type:'session_created',at:new Date().toISOString()}],startedAt:new Date().toISOString(),consentAt:null,lastSavedAt:new Date().toISOString()
      }))}catch(_){}
    }
  },{themeKey:THEME_KEY,sessionKey:SESSION_KEY,seedSession:session});
  return context;
}

async function ready(page,url){
  page.setDefaultTimeout(60000);
  page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(`${url} console: ${msg.text()}`)});
  page.on('pageerror',err=>consoleErrors.push(`${url} pageerror: ${err.message}`));
  const r=await page.goto(BASE+url,{waitUntil:'domcontentloaded',timeout:30000});
  check(!!r&&r.status()<400,`${url} responds`,r?String(r.status()):'no response');
  await page.waitForSelector('html[data-p120-brand-system="5.3"]',{timeout:15000});
  await page.waitForTimeout(850);
}

async function shot(page,file){
  await page.screenshot({path:path.join(OUT,file),fullPage:false,animations:'disabled',timeout:60000});
}

async function footerState(page,url,{legacySelector='' }={}){
  const state=await page.evaluate((legacy)=>{
    const visible=el=>!!el && getComputedStyle(el).display!=='none' && getComputedStyle(el).visibility!=='hidden' && !!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);
    return {
      unified:[...document.querySelectorAll('.p120-site-footer')].filter(visible).length,
      legal:[...document.querySelectorAll('[data-p120-legal-footer]')].filter(visible).length,
      legacy:legacy?[...document.querySelectorAll(legacy)].filter(visible).length:0,
      brand:[...document.querySelectorAll('.p120-footer-brand')].find(visible)?.textContent.trim()||'',
      footerText:[...document.querySelectorAll('.p120-site-footer')].find(visible)?.textContent.replace(/\s+/g,' ').trim()||''
    };
  },legacySelector);
  check(state.unified===1,`${url} exactly one unified public footer`,JSON.stringify(state));
  check(state.legal===1,`${url} legal authority remains inside unified footer`,JSON.stringify(state));
  if(legacySelector) check(state.legacy===0,`${url} legacy footer layer suppressed`,JSON.stringify(state));
  check(state.brand===(url.startsWith('/en/')?'P-120 — Research Architecture':'P-120 — Исследовательская архитектура'),`${url} canonical footer brand`,state.brand);
  check(/Интеллектуальная собственность|Intellectual Property/.test(state.footerText)&&/Конфиденциальность|Privacy/.test(state.footerText),`${url} legal links preserved`);
}

// MAIN: reproduce the user's 13% saved-session state and inspect the upgraded bubble.
{
  const context=await makeContext({session:true});
  const page=await context.newPage();
  await ready(page,'/');
  const resume=await page.locator('.editorial-resume-rail.p120-resume53').first().evaluate(el=>({
    text:el.textContent.replace(/\s+/g,' ').trim(),
    resume:el.querySelector('#editorialResume')?.textContent.trim()||'',
    restart:el.querySelector('#homeRestart')?.textContent.trim()||''
  }));
  check(/13% пройдено/.test(resume.text),'Main saved bubble shows total progress',resume.text);
  check(/Сегмент 02 \/ 05/.test(resume.text),'Main saved bubble identifies queued segment',resume.text);
  check(/P-72 v4\.0/.test(resume.text),'Main saved bubble names queued test segment',resume.text);
  check(/Инструмент · P-120/.test(resume.text),'Main saved bubble identifies instrument',resume.text);
  check(/Сессия · P120-QA531/.test(resume.text),'Main saved bubble exposes human-readable session identifier',resume.text);
  check(resume.resume==='Продолжить исследование · вопрос 1','Main resume CTA is human-readable',resume.resume);
  check(!/Q01/.test(resume.text),'Main consumer bubble does not leak raw Q item ID',resume.text);
  await footerState(page,'/',{legacySelector:'.home-footer'});
  await shot(page,'main-resume-1920-museum.png');
  const footer=page.locator('.p120-site-footer').first();await footer.scrollIntoViewIfNeeded();await page.waitForTimeout(150);
  await shot(page,'main-footer-1920-museum.png');
  await context.close();
}

// CREATOR: no duplicate utility cluster; one footer plane.
{
  const context=await makeContext();const page=await context.newPage();await ready(page,'/creator/');
  const controls=await page.evaluate(()=>{
    const visible=el=>!!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);
    return {canonical:[...document.querySelectorAll('[data-p120-brand53-tools]')].filter(visible).length,legacy:[...document.querySelectorAll('.creator-tools')].filter(visible).length};
  });
  check(controls.canonical===1,'Creator has one canonical utility-control cluster',JSON.stringify(controls));
  check(controls.legacy===0,'Creator legacy utility cluster is suppressed',JSON.stringify(controls));
  await footerState(page,'/creator/');
  await shot(page,'creator-header-1920-museum.png');
  const footer=page.locator('.p120-site-footer').first();await footer.scrollIntoViewIfNeeded();await page.waitForTimeout(150);
  await shot(page,'creator-footer-1920-museum.png');
  await context.close();
}

// WHY P-120: the canonical geometry must not erase its original black editorial header.
{
  const context=await makeContext();const page=await context.newPage();await ready(page,'/why-p120/');
  const header=await page.locator('.wp-header').first().evaluate(el=>({bg:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color,box:el.getBoundingClientRect().toJSON()}));
  const nums=(header.bg.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
  check(nums.length===3&&nums.every(n=>n<=30),'Why P-120 header restored to dark editorial plane',header.bg);
  const act1=await page.locator('#act-1').evaluate(el=>getComputedStyle(el).backgroundColor);
  check(!!act1,'Why P-120 ACT 1 remains present',act1);
  await footerState(page,'/why-p120/',{legacySelector:'.wp-footer'});
  await shot(page,'why-header-1920-museum.png');
  const footer=page.locator('.p120-site-footer').first();await footer.scrollIntoViewIfNeeded();await page.waitForTimeout(150);
  await shot(page,'why-footer-1920-museum.png');
  await context.close();
}

check(consoleErrors.length===0,'No JavaScript console/page errors',consoleErrors.join(' | '));
await browser.close();

const report={generated_at:new Date().toISOString(),checks,failures,consoleErrors};
fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(OUT,'QA_REPORT.txt'),checks.map(x=>`${x.status} ${x.msg}${x.detail?` :: ${x.detail}`:''}`).join('\n')+`\n\n${failures.length?`FAIL ${failures.length}`:'PASS'}\n`);
console.log(`PASS 5.3.1 targeted QA checks=${checks.length} failures=${failures.length}`);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
