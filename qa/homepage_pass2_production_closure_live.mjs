#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

/* P-120 — HOMEPAGE IMPLEMENTATION PASS 2 / PRODUCTION CLOSURE
   Live GitHub Pages probe. Read-only. No production mutation. */
const BASE=(process.env.P120_PRODUCTION_BASE||'https://unityplanet.github.io/p120-web/').replace(/\/?$/,'/');
const EXPECTED_SHA=process.env.P120_EXPECTED_PRODUCTION_SHA||'194bdf274f1a6012ef6c2e4b4f31e5f44b472055';
const ROOT=path.resolve(import.meta.dirname,'..');
const OUT=path.join(ROOT,'qa-artifacts','homepage-pass2-production-closure-live');
fs.mkdirSync(OUT,{recursive:true});
const failures=[];
const checks=[];
const add=(id,pass,detail={})=>{checks.push({id,pass:Boolean(pass),...detail});if(!pass)failures.push(id);};
const THEME_KEY='p120_web_theme_v16';
const routes=[
  {
    // Empty relative path intentionally preserves the GitHub Pages project prefix.
    // A leading slash would resolve to the account root rather than /p120-web/.
    id:'ru',path:'',title:'P-120 — Исследовательская архитектура',
    display:'Не один тест. Не один итоговый балл.',
    body:'взрослого эротического, телесного и реляционного опыта',
    cta:'Что такое P-120',about:'/p120-web/about/'
  },
  {
    id:'en',path:'en/',title:'P-120 — Research Architecture',
    display:'Not one test. Not one final score.',
    body:'adult erotic, embodied and relational experience',
    cta:'What P-120 is',about:'/p120-web/en/about/'
  }
];
const viewports=[
  {id:'mobile',width:390,height:844,theme:'museum'},
  {id:'tablet',width:768,height:1024,theme:'ivory'},
  {id:'desktop',width:1440,height:1000,theme:'graphite'},
  {id:'uhd',width:2560,height:1440,theme:'museum'}
];

const browser=await chromium.launch({headless:true});
try{
  for(const route of routes){
    for(const vp of viewports){
      const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},reducedMotion:'reduce'});
      await context.addInitScript(({key,theme})=>localStorage.setItem(key,theme),{key:THEME_KEY,theme:vp.theme});
      const page=await context.newPage();
      const errors=[];
      page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
      page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
      const url=new URL(route.path,BASE).href;
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=>window.P120_BRAND_SYSTEM?.revision==='5.3.2',null,{timeout:15000});
      await page.waitForFunction(()=>window.P120HomepageArchitecturePass2?.version==='1.0',null,{timeout:15000});
      await page.waitForSelector('[data-p120-homepage-pass2="1.0"]',{state:'visible',timeout:15000});
      await page.waitForTimeout(250);
      const prefix=`${route.id}/${vp.id}`;
      const panel=page.locator('[data-p120-homepage-pass2="1.0"]');
      const inner=(await panel.innerText()).trim();

      add(`${prefix} / HTTP 2xx`,!!response&&response.status()>=200&&response.status()<300,{status:response?.status(),url});
      add(`${prefix} / project-prefix route`,new URL(url).pathname.startsWith('/p120-web/'),{pathname:new URL(url).pathname});
      add(`${prefix} / one controlled compression owner`,await page.locator('[data-p120-homepage-pass2="1.0"]').count()===1,{count:await page.locator('[data-p120-homepage-pass2="1.0"]').count()});
      add(`${prefix} / exact display copy`,(await panel.locator('.p120-homepage-pass2__display').innerText()).trim()===route.display);
      add(`${prefix} / human-domain copy`,inner.includes(route.body));
      add(`${prefix} / Research Candidate`,inner.includes('Research Candidate'));
      add(`${prefix} / 18+`,inner.includes('18+'));
      add(`${prefix} / controlled role separation`,route.id==='ru'?inner.includes('измерение, вычисление, интерпретацию и валидацию'):inner.includes('measurement, computation, interpretation and validation'));
      add(`${prefix} / CTA copy`,(await panel.locator('.p120-homepage-pass2__cta-title').innerText()).trim()===route.cta);
      const href=await panel.locator('.p120-homepage-pass2__cta').getAttribute('href');
      add(`${prefix} / About onward route`,new URL(href,url).pathname===route.about,{href});
      add(`${prefix} / canonical title`,await page.title()===route.title,{title:await page.title()});
      const desc=await page.locator('meta[name="description"]').getAttribute('content');
      add(`${prefix} / controlled metadata`,route.id==='ru'?desc?.includes('многомерная исследовательская архитектура'):desc?.includes('multidimensional research architecture'),{description:desc});
      add(`${prefix} / theme preserved`,await page.locator('body').getAttribute('data-theme')===vp.theme,{actual:await page.locator('body').getAttribute('data-theme'),expected:vp.theme});
      add(`${prefix} / why-important identity preserved`,await page.locator('#why-important').count()===1);
      add(`${prefix} / canonical chapter targets preserved`,await page.locator('#two-systems,#showcase,#science-foundation').count()===3,{count:await page.locator('#two-systems,#showcase,#science-foundation').count()});
      const dims=await page.evaluate(()=>({sw:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,ih:innerHeight}));
      add(`${prefix} / no horizontal overflow`,dims.sw<=dims.cw+2,dims);
      add(`${prefix} / substantive Main remains`,dims.sh>dims.ih*3,dims);
      add(`${prefix} / no console or page errors`,errors.length===0,{errors});

      if(vp.width>=1121){
        const topLevel=await page.locator('.p120-brand53-nav:visible > *:visible').count();
        add(`${prefix} / current eight-destination Main topology`,topLevel===8,{count:topLevel});
      }else{
        const menu=page.locator('[data-mobile-menu]:visible,.menu-btn:visible').first();
        add(`${prefix} / mobile menu visible`,await menu.count()===1);
        if(await menu.count()){
          await menu.click();
          await page.waitForTimeout(80);
          add(`${prefix} / mobile drawer opens`,await page.locator('body.mobile-menu-open').count()===1);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(60);
          add(`${prefix} / mobile drawer closes`,await page.locator('body.mobile-menu-open').count()===0);
        }
      }

      await page.screenshot({path:path.join(OUT,`${route.id}-${vp.id}.png`),fullPage:true});
      await context.close();
    }
  }

  // Isolation: Homepage derivative must not leak into the fuller About surface.
  for(const route of [{id:'ru-about',path:'about/'},{id:'en-about',path:'en/about/'}]){
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const page=await context.newPage();
    const response=await page.goto(new URL(route.path,BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(350);
    add(`${route.id} / HTTP 2xx`,!!response&&response.status()>=200&&response.status()<300,{status:response?.status()});
    add(`${route.id} / Homepage compression absent`,await page.locator('[data-p120-homepage-pass2]').count()===0,{count:await page.locator('[data-p120-homepage-pass2]').count()});
    await context.close();
  }
} finally {await browser.close();}

const result={
  schema:'p120.homepage.implementation_pass2.production_closure.live.v1',
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
