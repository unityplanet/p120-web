#!/usr/bin/env node
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

/* P-120 WEB-EXPLORE PASS 5.3 — post Runtime-Reconciliation PASS 3 visual gate.
   The historical PASS 5.3 visual scripts assumed that Main's legacy Editorial
   resume rail was created by the respondent session. PASS 3 / Mobile Session
   Resume reconciliation explicitly separates those authorities: Editorial rail
   existence belongs to dormant Editorial state; canonical respondent resume is
   locale-isolated and independently governed. This gate tests current visual and
   session boundaries without re-promoting either historical assumption. */
const BASE=(process.env.P120_QA_BASE||'http://127.0.0.1:4173').replace(/\/$/,'');
const ROOT=path.resolve(import.meta.dirname,'..');
const OUT=path.join(ROOT,'qa-artifacts','pass53-postpass3');
fs.mkdirSync(OUT,{recursive:true});
const THEME_KEY='p120_web_theme_v16';
const routes=[
  {id:'ru',path:'/',sessionKey:'p120_runtime_session_ru_v1',locale:'ru',themeLabel:{ivory:'Светлая',graphite:'Графит',museum:'Музейная'}},
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
        await page.waitForSelector('.header-theme-menu.p120-main-theme532',{state:'visible',timeout:15000});
        await page.waitForTimeout(250);
        const prefix=`${route.id}/${width}/${theme}`;
        add(`${prefix} / HTTP`,!!response&&response.status()<400,{status:response?.status()});

        const sessionState=await page.evaluate(key=>({
          current:localStorage.getItem(key),
          legacy:localStorage.getItem('p120_web_prototype_v01'),
          railCount:document.querySelectorAll('.editorial-resume-rail').length,
          railVisible:[...document.querySelectorAll('.editorial-resume-rail')].some(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;})
        }),route.sessionKey);
        add(`${prefix} / locale respondent session exists`,!!sessionState.current);
        add(`${prefix} / legacy respondent key not promoted`,sessionState.legacy===null,{legacyPresent:sessionState.legacy!==null});
        // Rail presence/visibility is deliberately observational only. Its existence
        // belongs to dormant Editorial state and is not a respondent-session PASS gate.
        checks.push({id:`${prefix} / editorial rail observation`,pass:true,railCount:sessionState.railCount,railVisible:sessionState.railVisible,authority:'EDITORIAL STATE — NOT RESPONDENT SESSION'});

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

        const footer=page.locator('.p120-site-footer:visible');
        add(`${prefix} / one unified public footer`,await footer.count()===1,{count:await footer.count()});
        if(await footer.count()){
          const footerText=(await footer.first().innerText()).replace(/\s+/g,' ').trim();
          add(`${prefix} / footer preserves legal surface`,/Privacy|Конфиденциальность/.test(footerText)&&/Intellectual Property|Интеллектуальная собственность/.test(footerText));
        }
        const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
        add(`${prefix} / no horizontal overflow`,overflow<=1,{overflow});
        add(`${prefix} / no console/page errors`,errors.length===0,{errors});
        if(width===1920)await page.screenshot({path:path.join(OUT,`${route.id}-${theme}-1920.png`),fullPage:false});
        await context.close();
      }
    }
  }
} finally {await browser.close();}
const result={
  schema:'p120.pass53.postpass3.visual-reconciliation.v2',
  superseded_assumptions:[
    'Main respondent resume authority uses p120_web_prototype_v01',
    'Editorial resume rail existence is controlled by respondent-session state'
  ],
  current_authority:{respondent_sessions:['p120_runtime_session_ru_v1','p120_runtime_session_en_v1'],editorial_rail:'dormant Editorial state / observational only'},
  generated_at:new Date().toISOString(),checks,failures,verdict:failures.length?'FAIL':'PASS'
};
fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length)process.exit(1);
