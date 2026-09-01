import {chromium} from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE=process.env.P120_QA_BASE||'http://127.0.0.1:4173';
const OUT='qa-artifacts/pass53';
const THEME_KEY='p120_web_theme_v16';
const widths=[1366,1440,1920,2560,3440,3840];
const themes=['museum','ivory','graphite'];
const routes={main:'/',extended:'/extended/',together:'/together/'};
const routeList=Object.entries(routes);
fs.mkdirSync(OUT,{recursive:true});

const failures=[];
const checks=[];
const metrics={};
const consoleErrors=[];
function check(ok,msg,detail=''){
  checks.push({status:ok?'PASS':'FAIL',msg,detail});
  if(!ok) failures.push(detail?`${msg}: ${detail}`:msg);
}
function near(a,b,tol=2){return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tol;}
function safe(s){return String(s).replace(/[^a-z0-9_-]+/gi,'-').replace(/^-|-$/g,'').toLowerCase();}

const browser=await chromium.launch({headless:true});

async function contextFor(theme,width,height=1080){
  const context=await browser.newContext({viewport:{width,height}});
  await context.addInitScript(({key,value})=>{try{localStorage.setItem(key,value)}catch(_){}},{key:THEME_KEY,value:theme});
  return context;
}

async function ready(page,url){
  page.on('console',msg=>{if(msg.type()==='error') consoleErrors.push(`${url} console: ${msg.text()}`)});
  page.on('pageerror',err=>consoleErrors.push(`${url} pageerror: ${err.message}`));
  const response=await page.goto(BASE+url,{waitUntil:'domcontentloaded',timeout:30000});
  check(!!response && response.status()<400,`${url} HTTP response`,response?String(response.status()):'no response');
  await page.waitForSelector('html[data-p120-brand-system="5.3"]',{timeout:15000});
  await page.waitForTimeout(550);
}

async function inspect(page,name,theme,width){
  const data=await page.evaluate(() => {
    const visible=el=>!!el && !!(el.offsetWidth||el.offsetHeight||el.getClientRects().length) && getComputedStyle(el).visibility!=='hidden';
    const firstVisible=sels=>{
      for(const s of sels){const el=[...document.querySelectorAll(s)].find(visible);if(el)return el;}return null;
    };
    const box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
    const header=firstVisible(['.topbar','.explore-topbar','.creator-topbar','.wp-header','.p120-brand53-header']);
    const inner=firstVisible(['.topbar-inner','.explore-topbar__inner','.creator-topbar__inner','.wp-header-inner','.p120-brand53-header__inner']);
    const nav=firstVisible(['.p120-brand53-nav','.topnav','.explore-mainnav','.creator-nav','.wp-nav']);
    const mark=firstVisible(['.brand-mark']);
    const descriptor=firstVisible(['.brand-sub']);
    const topChildren=nav?[...nav.children].filter(visible):[];
    const footerBrand=[...document.querySelectorAll('.explore-footer strong,.wp-footer-inner>strong,.home-footer>span:first-child,.p120-footer-brand')].find(visible);
    const body=getComputedStyle(document.body);
    return {
      brandSystem:document.documentElement.dataset.p120BrandSystem||'',
      theme:document.body.dataset.theme||'',
      descriptor:descriptor?.textContent.trim()||'',
      markChildren:mark?mark.querySelectorAll('.brand-orbit,.brand-node-a,.brand-node-b').length:0,
      header:box(header),inner:box(inner),nav:box(nav),mark:box(mark),
      visibleNavChildren:topChildren.length,
      navTexts:topChildren.map(el=>(el.textContent||'').trim().replace(/\s+/g,' ')),
      overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth,
      footerBrand:footerBrand?.textContent.trim()||'',
      bodyBg:body.backgroundColor,
      bodyColor:body.color,
      headerBg:header?getComputedStyle(header).backgroundColor:'',
      headerColor:header?getComputedStyle(header).color:''
    };
  });
  metrics[`${width}:${theme}:${name}`]=data;
  check(data.brandSystem==='5.3',`${name} ${theme} ${width}: brand runtime active`,data.brandSystem);
  check(data.theme===theme,`${name} ${theme} ${width}: requested theme applied`,data.theme);
  check(data.descriptor==='ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА',`${name} ${theme} ${width}: canonical RU descriptor`,data.descriptor);
  check(data.markChildren===3,`${name} ${theme} ${width}: canonical orbit mark structure`,String(data.markChildren));
  check(data.overflow<=1,`${name} ${theme} ${width}: no horizontal overflow`,String(data.overflow));
  if(width>=1366) check(data.visibleNavChildren===7,`${name} ${theme} ${width}: seven canonical top-level destinations`,JSON.stringify(data.navTexts));
  if(name!=='main') check(data.footerBrand==='P-120 — Исследовательская архитектура',`${name} ${theme} ${width}: canonical footer brand`,data.footerBrand);
  return data;
}

async function screenshotMatrix(){
  for(const width of widths){
    for(const theme of themes){
      for(const [name,url] of routeList){
        const context=await contextFor(theme,width,1080);
        const page=await context.newPage();
        await ready(page,url);
        await inspect(page,name,theme,width);
        const file=path.join(OUT,`${width}-${theme}-${name}.png`);
        await page.screenshot({path:file,fullPage:false});
        await context.close();
      }
      const main=metrics[`${width}:${theme}:main`];
      for(const name of ['extended','together']){
        const other=metrics[`${width}:${theme}:${name}`];
        check(near(main.header?.h,other.header?.h,2),`${theme} ${width}: ${name} header height matches main`,`${main.header?.h} vs ${other.header?.h}`);
        check(near(main.mark?.w,other.mark?.w,1)&&near(main.mark?.h,other.mark?.h,1),`${theme} ${width}: ${name} logo optical size matches main`,`${main.mark?.w}×${main.mark?.h} vs ${other.mark?.w}×${other.mark?.h}`);
        check(near(main.nav?.h,other.nav?.h,2),`${theme} ${width}: ${name} bubble height matches main`,`${main.nav?.h} vs ${other.nav?.h}`);
      }
    }
  }
}

async function megaMenuQA(){
  for(const url of ['/','/extended/','/together/','/creator/','/why-p120/']){
    const context=await contextFor('museum',1440,1000);
    const page=await context.newPage();
    await ready(page,url);
    const isMainRoute=url==='/';
    const trigger=page.locator('.ecosystem-nav-v2 .ecosystem-trigger:visible,.p120-brand53-mega>summary:visible').first();
    check(await trigger.count()===1,`${url} mega-menu trigger exists`);
    if(await trigger.count()){
      await trigger.click(); await page.waitForTimeout(120);
      const panel=page.locator('.ecosystem-panel-v2:visible,.p120-brand53-mega-panel:visible').first();
      check(await panel.count()===1,`${url} mega-menu opens`);
      if(await panel.count()){
        const before=await panel.boundingBox();
        const columnCount=await page.locator('.ecosystem-panel-v2:visible .ecosystem-column-v2,.p120-brand53-mega-panel:visible .p120-brand53-mega-column').count();
        check(columnCount===2,`${url} mega-menu has two stable columns`,String(columnCount));
        const cards=page.locator('.ecosystem-panel-v2:visible .ecosystem-item-v2,.p120-brand53-mega-panel:visible .p120-brand53-mega-card');
        const heights=await cards.evaluateAll(nodes=>nodes.map(n=>Math.round(n.getBoundingClientRect().height)));
        check(heights.length===4,`${url} mega-menu exposes four destinations`,JSON.stringify(heights));
        if(heights.length===4) check(Math.max(...heights)-Math.min(...heights)<=3,`${url} mega-menu card geometry stable`,JSON.stringify(heights));
        await page.waitForTimeout(300); const after=await panel.boundingBox();
        check(before&&after&&near(before.x,after.x,2)&&near(before.y,after.y,2)&&near(before.width,after.width,2)&&near(before.height,after.height,2),`${url} no material post-render mega-menu shift`,JSON.stringify({before,after}));
        await page.keyboard.press('Escape'); await page.waitForTimeout(80);
        const escapeClosed=isMainRoute
          ? await page.locator('.ecosystem-nav-v2.is-open').count()===0 && (await trigger.getAttribute('aria-expanded'))==='false'
          : await page.locator('.p120-brand53-mega[open]').count()===0;
        check(escapeClosed,`${url} Escape closes mega-menu`);
        await trigger.click(); await page.waitForTimeout(80);
        await page.mouse.click(6,Math.min(900,page.viewportSize().height-10)); await page.waitForTimeout(80);
        const outsideClosed=isMainRoute
          ? await page.locator('.ecosystem-nav-v2.is-open').count()===0 && (await trigger.getAttribute('aria-expanded'))==='false'
          : await page.locator('.p120-brand53-mega[open]').count()===0;
        check(outsideClosed,`${url} outside click closes mega-menu`);
      }
    }
    await context.close();
  }
}

async function persistenceAndRoutingQA(){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  await ready(page,'/extended/');
  const themeSummary=page.locator('.p120-brand53-theme>summary').first();
  check(await themeSummary.count()===1,'Extended canonical theme control exists');
  if(await themeSummary.count()){
    await themeSummary.click(); await page.waitForTimeout(60);
    const museum=page.locator('[data-p120-theme="museum"]:visible').first();
    check(await museum.count()===1,'Museum option visible after theme control opens');
    if(await museum.count()){await museum.click();await page.waitForTimeout(100);}
  }
  const stored=await page.evaluate(k=>localStorage.getItem(k),THEME_KEY);
  check(stored==='museum','Theme stored with canonical sitewide key',String(stored));
  await page.goto(BASE+'/together/',{waitUntil:'domcontentloaded'});await page.waitForSelector('html[data-p120-brand-system="5.3"]',{timeout:15000});await page.waitForTimeout(300);
  check(await page.evaluate(()=>document.body.dataset.theme)==='museum','Museum persists Extended → Together');
  const enHref=await page.locator('.p120-brand53-language a[lang="en"]').getAttribute('href');
  check(!!enHref && new URL(enHref).pathname.endsWith('/en/together/'),'Together RU→EN preserves conceptual route',String(enHref));
  await page.goto(BASE+'/en/extended/',{waitUntil:'domcontentloaded'});await page.waitForSelector('html[data-p120-brand-system="5.3"]',{timeout:15000});
  const ruHref=await page.locator('.p120-brand53-language a[lang="ru"]').getAttribute('href');
  check(!!ruHref && new URL(ruHref).pathname.endsWith('/extended/'),'Extended EN→RU preserves conceptual route',String(ruHref));
  await context.close();
}

async function supportRoutesQA(){
  const support=['/creator/','/en/creator/','/why-p120/','/en/why-p120/','/privacy/','/en/privacy/','/terms/','/en/terms/','/intellectual-property/','/en/intellectual-property/'];
  for(const url of support){
    const context=await contextFor('museum',1440,1000);const page=await context.newPage();await ready(page,url);
    const isEn=url.startsWith('/en/');
    const descriptor=await page.locator('.brand-sub').first().innerText();
    check(descriptor.trim()===(isEn?'RESEARCH ARCHITECTURE':'ИССЛЕДОВАТЕЛЬСКАЯ АРХИТЕКТУРА'),`${url} canonical localized descriptor`,descriptor.trim());
    const lang=page.locator('.p120-brand53-language');
    check(await lang.count()===1,`${url} canonical language control exists`);
    const nav=page.locator('.p120-brand53-nav:visible');
    check(await nav.count()===1,`${url} canonical nav bubble exists`);
    const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
    check(overflow<=1,`${url} no desktop horizontal overflow`,String(overflow));
    if(url==='/why-p120/'||url==='/en/why-p120/'){
      const acts=await page.locator('#act-1,#act-2,#act-3,#act-4').count();
      check(acts===4,`${url} frozen four-ACT composition remains present`,String(acts));
    }
    await page.screenshot({path:path.join(OUT,`support-${safe(url)}.png`),fullPage:false});
    await context.close();
  }
}

async function keyboardQA(){
  const context=await contextFor('museum',1440,1000);const page=await context.newPage();await ready(page,'/extended/');
  await page.keyboard.press('Tab');
  const focusVisible=await page.evaluate(()=>{const el=document.activeElement;if(!el)return false;const s=getComputedStyle(el);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth||'0')>0;});
  check(focusVisible,'Focus-visible is perceptible on keyboard navigation');
  const trigger=page.locator('.p120-brand53-mega>summary').first();await trigger.focus();await page.keyboard.press('Enter');await page.waitForTimeout(80);
  check(await page.locator('.p120-brand53-mega[open]').count()===1,'Mega-menu operable by keyboard');
  await page.keyboard.press('Escape');check(await page.locator('.p120-brand53-mega[open]').count()===0,'Keyboard Escape closes mega-menu');
  const buttonSemantics=await page.evaluate(()=>[...document.querySelectorAll('.p120-brand53-theme-option')].every(n=>n.tagName==='BUTTON'));
  check(buttonSemantics,'Theme actions use button semantics');
  await context.close();
}

await screenshotMatrix();
await megaMenuQA();
await persistenceAndRoutingQA();
await supportRoutesQA();
await keyboardQA();

check(consoleErrors.length===0,'No JavaScript console/page errors',consoleErrors.join(' | '));
await browser.close();

const summary={
  document:'P120 WEB-EXPLORE PASS 5.3 visual/functional QA',
  generated_at:new Date().toISOString(),
  base:BASE,
  widths,
  themes,
  pages:Object.keys(routes),
  screenshot_count:fs.readdirSync(OUT).filter(x=>x.endsWith('.png')).length,
  totals:{checks:checks.length,pass:checks.filter(x=>x.status==='PASS').length,fail:failures.length},
  failures,
  consoleErrors,
  metrics,
  checks
};
fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));
fs.writeFileSync(path.join(OUT,'QA_REPORT.txt'),checks.map(c=>`${c.status} ${c.msg}${c.detail?` :: ${c.detail}`:''}`).join('\n')+`\n\n${failures.length?`FAIL ${failures.length}`:'PASS'}\n`);
console.log(`PASS 5.3 QA checks=${checks.length} failures=${failures.length} screenshots=${summary.screenshot_count}`);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
