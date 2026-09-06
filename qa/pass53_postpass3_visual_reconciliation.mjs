#!/usr/bin/env node
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

/* P-120 WEB-EXPLORE PASS 5.3 — post Runtime-Reconciliation PASS 3 visual gate.
   Supersedes only the stale QA assumption that Main resume presentation is fed
   from p120_web_prototype_v01. Current authority uses locale-isolated respondent
   session keys. Production presentation/runtime code is not modified here. */
const BASE=(process.env.P120_QA_BASE||'http://127.0.0.1:4173').replace(/\/$/,'');
const ROOT=path.resolve(import.meta.dirname,'..');
const OUT=path.join(ROOT,'qa-artifacts','pass53-postpass3');
fs.mkdirSync(OUT,{recursive:true});
const THEME_KEY='p120_web_theme_v16';
const routes=[
  {id:'ru',path:'/',sessionKey:'p120_runtime_session_ru_v1',locale:'ru',themeLabel:{ivory:'Ivory',graphite:'Графит',museum:'Музей'}},
  {id:'en',path:'/en/',sessionKey:'p120_runtime_session_en_v1',locale:'en',themeLabel:{ivory:'Ivory',graphite:'Graphite',museum:'Museum'}}
];
const checks=[];
const failures=[];
const add=(id,pass,detail={})=>{checks.push({id,pass:Boolean(pass),...detail});if(!pass)failures.push(id);};
const browser=await chromium.launch({headless:true});
try{
  for(const route of routes){
    for(const width of [1366,1920]){
      for(const theme of ['ivory','graphite','museum']){
        const context=await browser.newContext({viewport:{width,height:1080},reducedMotion:'reduce'});
        await context.addInitScript(({themeKey,sessionKey,locale,theme})=>{
          localStorage.setItem(themeKey,theme);
          const responses={};
          for(let i=1;i<=24;i++)responses[`SAT${String(i).padStart(2,'0')}`]='3';
          const now=new Date().toISOString();
          localStorage.setItem(sessionKey,JSON.stringify({participantId:'P120-QA53-PASS3',sessionLocale:locale,screen:'home',itemIndex:24,responses,adminModes:{},telemetry:[{type:'session_created',at:now}],startedAt:now,consentAt:null,lastSavedAt:now}));
        },{themeKey:THEME_KEY,sessionKey:route.sessionKey,locale:route.locale,theme});
        const page=await context.newPage();
        const errors=[];
        page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
        page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
        const response=await page.goto(BASE+route.path,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForSelector('html[data-p120-brand-system="5.3"]',{timeout:15000});
        await page.waitForSelector('.editorial-resume-rail.p120-resume53',{state:'visible',timeout:15000});
        await page.waitForSelector('.header-theme-menu.p120-main-theme532',{state:'visible',timeout:15000});
        await page.waitForTimeout(250);
        const prefix=`${route.id}/${width}/${theme}`;
        add(`${prefix} / HTTP`,!!response&&response.status()<400,{status:response?.status()});
        const sessionState=await page.evaluate(key=>({current:localStorage.getItem(key),legacy:localStorage.getItem('p120_web_prototype_v01')}),route.sessionKey);
        add(`${prefix} / locale session is authoritative`,!!sessionState.current&&sessionState.legacy===null,{legacyPresent:sessionState.legacy!==null});
        const resume=page.locator('.editorial-resume-rail.p120-resume53');
        add(`${prefix} / resume rail visible`,await resume.isVisible());
        const resumeText=(await resume.innerText()).replace(/\s+/g,' ').trim();
        add(`${prefix} / resume identifies session`,resumeText.includes('P120-QA53-PASS3'),{text:resumeText.slice(0,300)});
        add(`${prefix} / resume identifies P-120`,/P-120/.test(resumeText));
        const rr=await resume.boundingBox();
        add(`${prefix} / resume inside viewport`,!!rr&&rr.x>=-1&&rr.x+rr.width<=width+1,{rect:rr});

        const themeMenu=page.locator('.header-theme-menu.p120-main-theme532').first();
        const summary=(await themeMenu.locator('summary').innerText()).trim();
        add(`${prefix} / theme summary synchronized`,summary===route.themeLabel[theme],{summary,expected:route.themeLabel[theme]});
        await themeMenu.evaluate(el=>{el.open=true;});
        const options=themeMenu.locator('.header-theme-option');
        add(`${prefix} / three theme options`,await options.count()===3,{count:await options.count()});
        const pop=themeMenu.locator('.header-theme-popover');
        add(`${prefix} / theme popover visible`,await pop.isVisible());
        const pr=await pop.boundingBox();
        add(`${prefix} / theme popover inside viewport`,!!pr&&pr.x>=-1&&pr.x+pr.width<=width+1,{rect:pr});

        const footer=page.locator('.p120-site-footer').filter({visible:true});
        add(`${prefix} / one unified public footer`,await footer.count()===1,{count:await footer.count()});
        const footerText=(await footer.first().innerText()).replace(/\s+/g,' ').trim();
        add(`${prefix} / footer preserves legal surface`,/Privacy|Конфиденциальность/.test(footerText)&&/Intellectual Property|Интеллектуальная собственность/.test(footerText));
        add(`${prefix} / no console/page errors`,errors.length===0,{errors});
        if(width===1920)await page.screenshot({path:path.join(OUT,`${route.id}-${theme}-1920.png`),fullPage:false});
        await context.close();
      }
    }
  }
} finally {await browser.close();}
const result={schema:'p120.pass53.postpass3.visual-reconciliation.v1',superseded_assumption:'Main resume uses p120_web_prototype_v01',current_authority:['p120_runtime_session_ru_v1','p120_runtime_session_en_v1'],generated_at:new Date().toISOString(),checks,failures,verdict:failures.length?'FAIL':'PASS'};
fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length)process.exit(1);
