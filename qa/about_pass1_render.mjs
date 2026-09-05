#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const EVID=path.join(ROOT,'qa-evidence-about-pass1');
fs.mkdirSync(EVID,{recursive:true});
const BASE=(process.env.P120_BASE_URL||'http://127.0.0.1:4173/').replace(/\/?$/,'/');
const failures=[];
const checks=[];
const add=(id,pass,detail={})=>{checks.push({id,pass:Boolean(pass),...detail});if(!pass)failures.push(id);};
const scenarios=[
  {name:'ru-mobile',path:'about/',w:390,h:844,mobile:true},
  {name:'en-mobile',path:'en/about/',w:390,h:844,mobile:true},
  {name:'ru-tablet',path:'about/',w:768,h:1024,mobile:false},
  {name:'en-tablet',path:'en/about/',w:768,h:1024,mobile:false},
  {name:'ru-desktop',path:'about/',w:1440,h:1000,mobile:false},
  {name:'en-desktop',path:'en/about/',w:1440,h:1000,mobile:false},
  {name:'ru-uhd',path:'about/',w:2560,h:1440,mobile:false},
  {name:'en-uhd',path:'en/about/',w:2560,h:1440,mobile:false}
];

const browser=await chromium.launch({headless:true});
try{
  for(const s of scenarios){
    const context=await browser.newContext({viewport:{width:s.w,height:s.h},reducedMotion:'reduce'});
    const page=await context.newPage();
    const consoleErrors=[]; const pageErrors=[];
    page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
    page.on('pageerror',e=>pageErrors.push(String(e)));
    const url=new URL(s.path,BASE).href;
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('h1',{state:'visible',timeout:15000});
    await page.waitForTimeout(350);
    add(`${s.name}.http`,response?.ok(),{status:response?.status(),url});
    add(`${s.name}.h1`,await page.locator('h1').count()===1);
    add(`${s.name}.sections`,await page.locator('.about-section').count()===9,{count:await page.locator('.about-section').count()});
    const dims=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,ih:innerHeight}));
    add(`${s.name}.noHorizontalOverflow`,dims.sw<=dims.cw+2,dims);
    add(`${s.name}.longPage`,dims.sh>dims.ih*3,dims);
    const finalVisible=await page.locator('#definition').evaluate(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0});
    add(`${s.name}.finalDefinitionLayout`,finalVisible);
    const aboutCurrent=await page.locator('a[aria-current="page"]').filter({hasText:s.name.startsWith('ru')?'О P-120':'About P-120'}).count();
    add(`${s.name}.aboutCurrent`,aboutCurrent>=1,{count:aboutCurrent});
    add(`${s.name}.consoleErrors`,consoleErrors.length===0,{errors:consoleErrors});
    add(`${s.name}.pageErrors`,pageErrors.length===0,{errors:pageErrors});

    if(s.mobile){
      const menu=page.locator('[data-about-menu]');
      await menu.click();
      add(`${s.name}.mobileMenuOpen`,await page.locator('[data-about-drawer].is-open').count()===1);
      await page.keyboard.press('Escape');
      add(`${s.name}.mobileMenuEscape`,await page.locator('[data-about-drawer].is-open').count()===0);
    } else if(s.w>=1440){
      const theme=page.locator('.p120-brand53-theme').first();
      const summary=theme.locator('summary');
      await summary.click();
      const graphite=theme.locator('[data-p120-theme="graphite"]');
      await graphite.click();
      add(`${s.name}.themeGraphite`,await page.locator('body').getAttribute('data-theme')==='graphite');
      await summary.click();
      const museum=theme.locator('[data-p120-theme="museum"]');
      await museum.click();
      add(`${s.name}.themeMuseum`,await page.locator('body').getAttribute('data-theme')==='museum');
    }

    await page.screenshot({path:path.join(EVID,`${s.name}.png`),fullPage:true});
    await context.close();
  }
} finally {await browser.close();}

const result={schema:'p120.about.pass1.render.v1',base_url:BASE,generated_at:new Date().toISOString(),checks,failures,verdict:failures.length?'FAIL':'PASS'};
fs.writeFileSync(path.join(EVID,'render.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length)process.exit(1);
