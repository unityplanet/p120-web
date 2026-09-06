#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

/* P-120 — ABOUT P-120 RELEASE PROMOTION & PRODUCTION CLOSURE
   Live GitHub Pages probe. Read-only. No production mutation. */
const BASE=(process.env.P120_PRODUCTION_BASE||'https://unityplanet.github.io/p120-web/').replace(/\/?$/,'/');
const EXPECTED_SHA=process.env.P120_EXPECTED_PRODUCTION_SHA||'aa2d101f8bd0dcb12b033df8643756da8a6f22a1';
const ROOT=path.resolve(import.meta.dirname,'..');
const OUT=path.join(ROOT,'qa-artifacts','about-production-closure-live');
fs.mkdirSync(OUT,{recursive:true});
const failures=[];
const checks=[];
const add=(id,pass,detail={})=>{checks.push({id,pass:Boolean(pass),...detail});if(!pass)failures.push(id);};
const routes=[
  {id:'ru',path:'about/',h1:'Что такое P-120',current:'О P-120',counterpart:'/p120-web/en/about/'},
  {id:'en',path:'en/about/',h1:'What P-120 is',current:'About P-120',counterpart:'/p120-web/about/'}
];
const viewports=[{id:'mobile',width:390,height:844},{id:'desktop',width:1440,height:1000}];

const browser=await chromium.launch({headless:true});
try{
  for(const route of routes){
    for(const vp of viewports){
      const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      const consoleErrors=[];
      const pageErrors=[];
      page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
      page.on('pageerror',e=>pageErrors.push(String(e)));
      const url=new URL(route.path,BASE).href;
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForSelector('h1',{state:'visible',timeout:15000});
      await page.waitForTimeout(300);
      const prefix=`${route.id}/${vp.id}`;
      add(`${prefix} / HTTP 2xx`,!!response&&response.status()>=200&&response.status()<300,{status:response?.status(),url});
      add(`${prefix} / canonical H1`,(await page.locator('h1').innerText()).trim()===route.h1,{actual:(await page.locator('h1').innerText()).trim()});
      add(`${prefix} / nine controlled sections`,await page.locator('.about-section').count()===9,{count:await page.locator('.about-section').count()});
      add(`${prefix} / final definition present`,await page.locator('#definition').isVisible());
      add(`${prefix} / About current marker`,await page.locator('a[aria-current="page"]').filter({hasText:route.current}).count()>=1);
      const counterpart=route.id==='ru'?page.locator('a[lang="en"]').first():page.locator('a[lang="ru"]').first();
      add(`${prefix} / locale counterpart route`,new URL(await counterpart.getAttribute('href'),url).pathname===route.counterpart,{href:await counterpart.getAttribute('href')});
      const dims=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,ih:innerHeight}));
      add(`${prefix} / no horizontal overflow`,dims.sw<=dims.cw+2,dims);
      add(`${prefix} / substantive long-form page`,dims.sh>dims.ih*3,dims);
      add(`${prefix} / no console errors`,consoleErrors.length===0,{errors:consoleErrors});
      add(`${prefix} / no page errors`,pageErrors.length===0,{errors:pageErrors});

      if(vp.id==='mobile'){
        const menu=page.locator('[data-about-menu]');
        add(`${prefix} / mobile menu control visible`,await menu.isVisible());
        await menu.click();
        add(`${prefix} / mobile drawer opens`,await page.locator('[data-about-drawer].is-open').count()===1);
        await page.keyboard.press('Escape');
        add(`${prefix} / Escape closes mobile drawer`,await page.locator('[data-about-drawer].is-open').count()===0);
      }else{
        const theme=page.locator('.p120-brand53-theme').first();
        // The option popover intentionally closes after each selection. Open the
        // native <details> deterministically before every option click so this
        // live probe tests theme behaviour rather than pointer/toggle timing.
        await theme.evaluate(el=>{el.open=true;});
        await theme.locator('[data-p120-theme="graphite"]').click();
        await page.waitForFunction(()=>document.body.dataset.theme==='graphite',null,{timeout:5000});
        add(`${prefix} / Graphite theme applies`,await page.locator('body').getAttribute('data-theme')==='graphite');
        await theme.evaluate(el=>{el.open=true;});
        await theme.locator('[data-p120-theme="museum"]').click();
        await page.waitForFunction(()=>document.body.dataset.theme==='museum',null,{timeout:5000});
        add(`${prefix} / Museum theme restores`,await page.locator('body').getAttribute('data-theme')==='museum');
      }

      await page.screenshot({path:path.join(OUT,`${route.id}-${vp.id}.png`),fullPage:true});
      await context.close();
    }
  }

  // Production navigation ownership from Main to first-class About routes.
  for(const locale of ['ru','en']){
    const pathPart=locale==='ru'?'':'en/';
    const expected=locale==='ru'?'/p120-web/about/':'/p120-web/en/about/';
    const label=locale==='ru'?'О P-120':'About P-120';

    // Desktop Main route.
    {
      const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
      const page=await context.newPage();
      await page.goto(new URL(pathPart,BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=>window.P120_BRAND_SYSTEM?.revision==='5.3.2',null,{timeout:15000});
      await page.waitForTimeout(250);
      const control=page.locator('a,button').filter({hasText:label}).first();
      add(`main/${locale}/desktop / About control exists`,await control.count()===1);
      await control.click();
      await page.waitForURL(u=>u.pathname===expected,{timeout:10000});
      add(`main/${locale}/desktop / About routes first-class`,new URL(page.url()).pathname===expected,{url:page.url()});
      await context.close();
    }

    // Mobile Main route: verify injected drawer destination.
    {
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
      const page=await context.newPage();
      await page.goto(new URL(pathPart,BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=>window.P120_BRAND_SYSTEM?.revision==='5.3.2',null,{timeout:15000});
      await page.locator('[data-mobile-menu]').click();
      await page.waitForTimeout(100);
      const about=page.locator('[data-p120-about-discovery]');
      add(`main/${locale}/mobile / injected About destination exists`,await about.count()===1);
      add(`main/${locale}/mobile / injected About destination visible`,await about.isVisible());
      await about.click();
      await page.waitForURL(u=>u.pathname===expected,{timeout:10000});
      add(`main/${locale}/mobile / About routes first-class`,new URL(page.url()).pathname===expected,{url:page.url()});
      await context.close();
    }
  }
} finally {await browser.close();}

const result={
  schema:'p120.about.production-closure.live.v1',
  production_base:BASE,
  expected_deployment_sha:EXPECTED_SHA,
  generated_at:new Date().toISOString(),
  checks,
  failures,
  verdict:failures.length?'FAIL':'PASS'
};
fs.writeFileSync(path.join(OUT,'live-result.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length)process.exit(1);
