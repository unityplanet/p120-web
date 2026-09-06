#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

/* P-120 — SYSTEM IMPLEMENTATION PASS 4 / FINAL PRODUCTION CLOSURE
   Read-only live GitHub Pages probe. Browser-local QA state only; no backend mutation. */
const BASE=(process.env.P120_PRODUCTION_BASE||'https://unityplanet.github.io/p120-web/').replace(/\/?$/,'/');
const EXPECTED_SHA=process.env.P120_EXPECTED_PRODUCTION_SHA||'43c224e081a478ec78a9ed850da7e6cfb865f4f7';
const ROOT=path.resolve(import.meta.dirname,'..');
const OUT=path.join(ROOT,'qa-artifacts','system-pass4-production-closure-live');
fs.mkdirSync(OUT,{recursive:true});

const failures=[];
const checks=[];
const add=(id,pass,detail={})=>{checks.push({id,pass:Boolean(pass),...detail});if(!pass)failures.push(id);};
const cases=[
  {id:'ru-mobile',path:'system/',locale:'ru',width:390,height:844,theme:'museum',sessionKey:'p120_runtime_session_ru_v1',title:'Что происходит с вашими ответами.',labels:['Ответ','Измерение','Вычисление','Интерпретация','Статус знания'],boundary:'Результат P-120 не является диагнозом',about:'/p120-web/about/'},
  {id:'ru-desktop',path:'system/',locale:'ru',width:1440,height:1000,theme:'graphite',sessionKey:'p120_runtime_session_ru_v1',title:'Что происходит с вашими ответами.',labels:['Ответ','Измерение','Вычисление','Интерпретация','Статус знания'],boundary:'Результат P-120 не является диагнозом',about:'/p120-web/about/'},
  {id:'en-mobile',path:'en/system/',locale:'en',width:390,height:844,theme:'museum',sessionKey:'p120_runtime_session_en_v1',title:'What happens to your answers.',labels:['Response','Measurement','Computation','Interpretation','Evidence status'],boundary:'A P-120 result is not a diagnosis',about:'/p120-web/en/about/'},
  {id:'en-desktop',path:'en/system/',locale:'en',width:1440,height:1000,theme:'graphite',sessionKey:'p120_runtime_session_en_v1',title:'What happens to your answers.',labels:['Response','Measurement','Computation','Interpretation','Evidence status'],boundary:'A P-120 result is not a diagnosis',about:'/p120-web/en/about/'}
];

const browser=await chromium.launch({headless:true});
try{
  for(const c of cases){
    const context=await browser.newContext({viewport:{width:c.width,height:c.height},reducedMotion:'reduce'});
    await context.addInitScript(({sessionKey,locale,theme})=>{
      localStorage.setItem('p120_web_theme_v16',theme);
      const stamp='2026-09-06T00:00:00.000Z';
      localStorage.setItem(sessionKey,JSON.stringify({
        participantId:'P120-PASS4-LIVE-QA',sessionLocale:locale,screen:'preflight',itemIndex:0,
        responses:{},adminModes:{},telemetry:[{type:'pass4_live_qa_preflight_seed',at:stamp}],
        startedAt:null,consentAt:null,lastSavedAt:stamp
      }));
    },{sessionKey:c.sessionKey,locale:c.locale,theme:c.theme});

    const page=await context.newPage();
    const errors=[];
    page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
    page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
    const url=new URL(c.path,BASE).href;
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('.luxury-preflight .preflight-main',{timeout:15000});
    await page.waitForSelector('section[data-p120-system-functional-derivative="pass4-v1.0"]',{state:'visible',timeout:15000});
    await page.waitForTimeout(250);

    const data=await page.evaluate(()=>{
      const block=document.querySelector('section[data-p120-system-functional-derivative="pass4-v1.0"]');
      const ritual=document.querySelector('.luxury-ritual-grid');
      const consent=document.querySelector('#consent');
      const start=document.querySelector('#start');
      const storageBefore={};
      for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);storageBefore[k]=localStorage.getItem(k)}
      window.P120SystemFunctionalDerivative?.render();
      window.P120SystemFunctionalDerivative?.render();
      const storageAfter={};
      for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);storageAfter[k]=localStorage.getItem(k)}
      const initialStartDisabled=!!start?.disabled;
      if(consent)consent.click();
      const enabledAfterConsent=start?!start.disabled:false;
      return {
        locale:document.documentElement.lang,
        marker:document.documentElement.dataset.p120SystemFunctionalDerivativeActive||null,
        count:document.querySelectorAll('section[data-p120-system-functional-derivative="pass4-v1.0"]').length,
        afterRitual:ritual?.nextElementSibling===block,
        title:block?.querySelector('h3')?.textContent?.trim()||'',
        labels:[...block?.querySelectorAll('.flow-step strong')||[]].map(x=>x.textContent.trim()),
        boundary:block?.querySelector('.p120-system-pass4-boundary')?.textContent?.replace(/\s+/g,' ').trim()||'',
        href:block?.querySelector('.p120-system-pass4-more')?.href||'',
        inputCount:block?.querySelectorAll('button,input,select,textarea').length||0,
        initialStartDisabled,enabledAfterConsent,
        storageBefore,storageAfter,
        overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
        width:block?.getBoundingClientRect().width||0,
        theme:document.body.dataset.theme||null,
        runtimeVersion:window.P120SystemFunctionalDerivative?.version||null
      };
    });

    add(`${c.id} / HTTP 2xx`,!!response&&response.status()>=200&&response.status()<300,{status:response?.status(),url});
    add(`${c.id} / project-prefix route`,new URL(url).pathname.startsWith('/p120-web/'),{pathname:new URL(url).pathname});
    add(`${c.id} / locale identity`,data.locale.toLowerCase().startsWith(c.locale),{locale:data.locale});
    add(`${c.id} / PASS4 runtime version`,data.runtimeVersion==='1.0',data);
    add(`${c.id} / root activation marker`,data.marker==='pass4-v1.0',data);
    add(`${c.id} / exactly one derivative section`,data.count===1,{count:data.count});
    add(`${c.id} / follows preparation ritual`,data.afterRitual===true,data);
    add(`${c.id} / exact title`,data.title===c.title,{title:data.title});
    add(`${c.id} / exact five-stage chain`,JSON.stringify(data.labels)===JSON.stringify(c.labels),{labels:data.labels});
    add(`${c.id} / result boundary`,data.boundary.includes(c.boundary),{boundary:data.boundary});
    add(`${c.id} / About onward route`,new URL(data.href).pathname===c.about,{href:data.href});
    add(`${c.id} / no respondent controls inside derivative`,data.inputCount===0,{inputCount:data.inputCount});
    add(`${c.id} / existing consent initially blocks start`,data.initialStartDisabled===true,data);
    add(`${c.id} / existing consent still enables start`,data.enabledAfterConsent===true,data);
    add(`${c.id} / derivative rerender storage-neutral`,JSON.stringify(data.storageBefore)===JSON.stringify(data.storageAfter),{before:data.storageBefore,after:data.storageAfter});
    add(`${c.id} / theme preserved`,data.theme===c.theme,{actual:data.theme,expected:c.theme});
    add(`${c.id} / visible geometry`,data.width>200,{width:data.width});
    add(`${c.id} / no horizontal overflow`,data.overflow===false,{overflow:data.overflow});
    add(`${c.id} / no console/page errors`,errors.length===0,{errors});

    await page.screenshot({path:path.join(OUT,`${c.id}.png`),fullPage:true});
    await context.close();
  }
} finally {await browser.close();}

const result={
  schema:'p120.system.functional_derivative.pass4.production_closure.live.v1',
  production_base:BASE,
  expected_deployment_sha:EXPECTED_SHA,
  generated_at:new Date().toISOString(),
  checks,failures,verdict:failures.length?'FAIL':'PASS'
};
fs.writeFileSync(path.join(OUT,'live-result.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length)process.exit(1);
