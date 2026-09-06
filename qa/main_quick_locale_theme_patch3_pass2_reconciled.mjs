#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

/* P-120 — PATCH 3 / PASS 2 QA RECONCILIATION
   Reconciles the old assumption that the quick theme control is visible at all
   phone widths with PASS 5.3.1 presentation authority, which intentionally hides
   only the duplicate quick theme selector at <=430px while preserving the full
   theme chooser in the Main mobile drawer. No production behaviour is changed. */
const ROOT=path.resolve(import.meta.dirname,'..');
const BASE=(process.env.P120_QA_BASE||'http://127.0.0.1:4174/p120-web').replace(/\/$/,'');
const OUT=path.join(ROOT,'qa-artifacts','main-quick-locale-theme-patch3-pass2-reconciled');
fs.mkdirSync(OUT,{recursive:true});

const widths=[360,390,430,480];
const themes=['ivory','graphite','museum'];
const routes=[
  {id:'ru',path:'/',current:'ru'},
  {id:'en',path:'/en/',current:'en'}
];
const THEME_KEY='p120_web_theme_v16';
const failures=[];
const checks=[];
const matrix=[];
const add=(id,pass,detail={})=>{checks.push({id,pass:Boolean(pass),...detail});if(!pass)failures.push(id);};
const visible=async locator=>{try{return await locator.isVisible();}catch{return false;}};

const brand=fs.readFileSync(path.join(ROOT,'p120-brand-system-v1.0.js'),'utf8');
const correctionCss=fs.readFileSync(path.join(ROOT,'p120-pass53-visual-corrections-v1.0.css'),'utf8');
add('STATIC / canonical theme key preserved',brand.includes("const THEME_KEY = 'p120_web_theme_v16'"));
add('STATIC / locale-isolated respondent keys preserved',brand.includes("p120_runtime_session_en_v1")&&brand.includes("p120_runtime_session_ru_v1"));
add('STATIC / <=430 duplicate quick theme hide is authoritative',correctionCss.includes('@media(max-width:430px)')&&correctionCss.includes('.p120-brand53-tools--main-quick .p120-brand53-theme')&&correctionCss.includes('display:none!important'));

const browser=await chromium.launch({headless:true});
try{
  for(const route of routes){
    for(const width of widths){
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      const page=await context.newPage();
      const errors=[];
      page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
      page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
      const response=await page.goto(BASE+route.path,{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=>window.P120_BRAND_SYSTEM?.revision==='5.3.2',null,{timeout:15000});
      await page.waitForSelector('.p120-brand53-tools--main-quick',{state:'attached',timeout:15000});
      add(`${route.id}/${width} / HTTP`,!!response&&response.status()<400,{status:response?.status()});
      add(`${route.id}/${width} / quick utility owner visible`,await visible(page.locator('.p120-brand53-tools--main-quick')));
      add(`${route.id}/${width} / hamburger visible`,await visible(page.locator('[data-mobile-menu]')));
      add(`${route.id}/${width} / one quick owner`,await page.locator('.p120-brand53-tools--main-quick').count()===1);
      const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
      add(`${route.id}/${width} / no horizontal overflow`,overflow<=1,{overflow});

      const quickTheme=page.locator('.p120-brand53-tools--main-quick .p120-brand53-theme');
      const quickThemeVisible=await visible(quickTheme.locator('summary'));
      add(`${route.id}/${width} / theme visibility matches authority`,width<=430?!quickThemeVisible:quickThemeVisible,{quickThemeVisible});

      for(const start of themes){
        await page.evaluate(({k,v})=>localStorage.setItem(k,v),{k:THEME_KEY,v:start});
        await page.reload({waitUntil:'domcontentloaded'});
        await page.waitForFunction(()=>window.P120_BRAND_SYSTEM?.revision==='5.3.2',null,{timeout:15000});
        const target=themes[(themes.indexOf(start)+1)%themes.length];
        const prefix=`${route.id}/${width}/${start}->${target}`;
        const initial=await page.evaluate(k=>({body:document.body.dataset.theme,stored:localStorage.getItem(k)}),THEME_KEY);
        add(`${prefix} / initial theme restored`,initial.body===start&&initial.stored===start,initial);

        if(width<=430){
          add(`${prefix} / duplicate quick theme remains hidden`,!(await visible(quickTheme.locator('summary'))));
          await page.locator('[data-mobile-menu]').click();
          await page.waitForTimeout(80);
          add(`${prefix} / drawer open`,await page.locator('body.mobile-menu-open').count()===1);
          add(`${prefix} / drawer has three canonical theme controls`,await page.locator('.mobile-menu [data-set-theme]').count()===3,{count:await page.locator('.mobile-menu [data-set-theme]').count()});
          await page.locator(`.mobile-menu [data-set-theme="${target}"]`).click();
          await page.waitForFunction(t=>document.body.dataset.theme===t,target,{timeout:5000});
          const switched=await page.evaluate(k=>({body:document.body.dataset.theme,stored:localStorage.getItem(k)}),THEME_KEY);
          add(`${prefix} / drawer theme changes canonical state`,switched.body===target&&switched.stored===target,switched);
          if(await page.locator('body.mobile-menu-open').count()){
            await page.locator('[data-mobile-menu]').click();
            await page.waitForTimeout(60);
          }
        }else{
          await quickTheme.locator('summary').click();
          add(`${prefix} / quick theme popover opens`,await quickTheme.getAttribute('open')!==null);
          await quickTheme.locator(`[data-p120-theme="${target}"]`).click();
          await page.waitForFunction(t=>document.body.dataset.theme===t,target,{timeout:5000});
          const switched=await page.evaluate(k=>({body:document.body.dataset.theme,stored:localStorage.getItem(k)}),THEME_KEY);
          add(`${prefix} / quick theme changes canonical state`,switched.body===target&&switched.stored===target,switched);
        }

        await page.reload({waitUntil:'domcontentloaded'});
        await page.waitForFunction(()=>window.P120_BRAND_SYSTEM?.revision==='5.3.2',null,{timeout:15000});
        const persisted=await page.evaluate(k=>({body:document.body.dataset.theme,stored:localStorage.getItem(k)}),THEME_KEY);
        add(`${prefix} / selected theme persists after reload`,persisted.body===target&&persisted.stored===target,persisted);
        matrix.push({route:route.id,width,start,target,quickThemeVisible:await visible(quickTheme.locator('summary')),errors:[...errors]});
      }

      add(`${route.id}/${width} / no console or page errors`,errors.length===0,{errors});
      if(width===390||width===480)await page.screenshot({path:path.join(OUT,`${route.id}-${width}.png`),fullPage:false});
      await context.close();
    }
  }
} finally {await browser.close();}

const result={schema:'p120.main.quick-theme.qa-reconciliation.v1',authority:'PASS 5.3.1 <=430 quick-theme hide; drawer retains theme authority',generated_at:new Date().toISOString(),checks,failures,matrix,verdict:failures.length?'FAIL':'PASS'};
fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length)process.exit(1);
