#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const ROOT=path.resolve(import.meta.dirname,'..');
const BASE=(process.env.P120_QA_BASE||'http://127.0.0.1:4174/p120-web').replace(/\/$/,'');
const OUT=path.join(ROOT,'qa-evidence-homepage-pass2','render');
fs.mkdirSync(OUT,{recursive:true});
const failures=[];
const checks=[];
const add=(id,pass,detail={})=>{checks.push({id,pass:Boolean(pass),...detail});if(!pass)failures.push(id);};
const THEME_KEY='p120_web_theme_v16';
const routes=[
  {id:'ru',path:'/',title:'P-120 — Исследовательская архитектура',display:'Не один тест. Не один итоговый балл.',body:'взрослого эротического, телесного и реляционного опыта',cta:'Что такое P-120',about:'/p120-web/about/'},
  {id:'en',path:'/en/',title:'P-120 — Research Architecture',display:'Not one test. Not one final score.',body:'adult erotic, embodied and relational experience',cta:'What P-120 is',about:'/p120-web/en/about/'}
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
      const response=await page.goto(BASE+route.path,{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(()=>window.P120_BRAND_SYSTEM?.revision==='5.3.2',null,{timeout:15000});
      await page.waitForSelector('#why-important',{state:'attached',timeout:15000});
      await page.waitForFunction(()=>window.P120HomepageArchitecturePass2?.version==='1.0',null,{timeout:15000});
      await page.waitForSelector('[data-p120-homepage-pass2="1.0"]',{state:'visible',timeout:15000});
      await page.waitForTimeout(200);
      const prefix=`${route.id}/${vp.id}`;

      add(`${prefix} / HTTP`,!!response&&response.status()<400,{status:response?.status()});
      add(`${prefix} / Main editorial home exists`,await page.locator('.editorial-home').count()===1,{count:await page.locator('.editorial-home').count()});
      add(`${prefix} / single controlled compression`,await page.locator('[data-p120-homepage-pass2="1.0"]').count()===1,{count:await page.locator('[data-p120-homepage-pass2="1.0"]').count()});
      const panel=page.locator('[data-p120-homepage-pass2="1.0"]');
      add(`${prefix} / controlled compression visible`,await panel.isVisible());
      add(`${prefix} / display copy`,(await panel.locator('.p120-homepage-pass2__display').innerText()).trim()===route.display,{actual:(await panel.locator('.p120-homepage-pass2__display').innerText()).trim()});
      add(`${prefix} / human-domain copy`,(await panel.locator('.p120-homepage-pass2__body').innerText()).includes(route.body));
      add(`${prefix} / Research Candidate`,(await panel.innerText()).includes('Research Candidate'));
      add(`${prefix} / 18+`,(await panel.innerText()).includes('18+'));
      add(`${prefix} / CTA copy`,(await panel.locator('.p120-homepage-pass2__cta-title').innerText()).trim()===route.cta);
      const href=await panel.locator('.p120-homepage-pass2__cta').getAttribute('href');
      add(`${prefix} / About onward route`,new URL(href,page.url()).pathname===route.about,{href});
      add(`${prefix} / canonical title`,await page.title()===route.title,{title:await page.title()});
      const desc=await page.locator('meta[name="description"]').getAttribute('content');
      add(`${prefix} / canonical description`,route.id==='ru'?desc.includes('многомерная исследовательская архитектура'):desc.includes('multidimensional research architecture'),{description:desc});
      const theme=await page.locator('body').getAttribute('data-theme');
      add(`${prefix} / requested theme preserved`,theme===vp.theme,{theme,expected:vp.theme});

      const contrast=await panel.evaluate(el=>{
        const rgb=s=>{const m=String(s).match(/rgba?\((\d+(?:\.\d+)?)[, ]+\s*(\d+(?:\.\d+)?)[, ]+\s*(\d+(?:\.\d+)?)/);return m?[+m[1],+m[2],+m[3]]:null};
        const lum=c=>{const f=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
        const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
        const blend=(fg,bg,a)=>fg.map((v,i)=>v*a+bg[i]*(1-a));
        const p=getComputedStyle(el), d=getComputedStyle(el.querySelector('.p120-homepage-pass2__display')), b=getComputedStyle(el.querySelector('.p120-homepage-pass2__body'));
        const bg=rgb(p.backgroundColor), dc=rgb(d.color), bc=rgb(b.color);
        if(!bg||!dc||!bc)return {background:p.backgroundColor,display:d.color,body:b.color,displayRatio:0,bodyRatio:0};
        const bodyOpacity=Math.max(0,Math.min(1,Number.parseFloat(b.opacity)||1));
        return {
          background:p.backgroundColor,display:d.color,body:b.color,bodyOpacity,
          displayRatio:ratio(dc,bg),
          bodyRatio:ratio(blend(bc,bg,bodyOpacity),bg),
          backgroundLuminance:lum(bg),displayLuminance:lum(dc)
        };
      });
      add(`${prefix} / architecture headline contrast >= 4.5`,contrast.displayRatio>=4.5,contrast);
      add(`${prefix} / architecture body effective contrast >= 4.5`,contrast.bodyRatio>=4.5,contrast);
      if(vp.theme==='graphite'){
        add(`${prefix} / Graphite panel surface remains dark`,contrast.backgroundLuminance<0.15,contrast);
        add(`${prefix} / Graphite headline remains light`,contrast.displayLuminance>0.65,contrast);
      }

      const geom=await page.evaluate(()=>({sw:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,ih:innerHeight}));
      add(`${prefix} / no horizontal overflow`,geom.sw<=geom.cw+2,geom);
      add(`${prefix} / substantive homepage remains`,geom.sh>geom.ih*3,geom);
      add(`${prefix} / why-important identity preserved`,await page.locator('#why-important').count()===1);
      add(`${prefix} / core chapter targets preserved`,await page.locator('#two-systems,#showcase,#science-foundation').count()===3,{count:await page.locator('#two-systems,#showcase,#science-foundation').count()});
      add(`${prefix} / no console or page errors`,errors.length===0,{errors});

      await page.evaluate(()=>{
        window.P120HomepageArchitecturePass2?.reconcile();
        window.P120HomepageArchitecturePass2?.reconcile();
        document.getElementById('app')?.appendChild(document.createComment('homepage-pass2-qa-rerender'));
      });
      await page.waitForTimeout(120);
      add(`${prefix} / idempotent after rerender`,await page.locator('[data-p120-homepage-pass2="1.0"]').count()===1,{count:await page.locator('[data-p120-homepage-pass2="1.0"]').count()});

      if(vp.width>=1121){
        const topLevel=await page.locator('.p120-brand53-nav:visible > *:visible').count();
        add(`${prefix} / current eight-destination Main topology`,topLevel===8,{count:topLevel});
      }else{
        const menu=page.locator('[data-mobile-menu]:visible,.menu-btn:visible').first();
        add(`${prefix} / mobile menu control`,await menu.count()===1);
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

  for(const route of [{id:'ru-about',path:'/about/'},{id:'en-about',path:'/en/about/'}]){
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    const page=await context.newPage();
    const response=await page.goto(BASE+route.path,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(300);
    add(`${route.id} / HTTP`,!!response&&response.status()<400,{status:response?.status()});
    add(`${route.id} / Homepage compression absent`,await page.locator('[data-p120-homepage-pass2]').count()===0,{count:await page.locator('[data-p120-homepage-pass2]').count()});
    await context.close();
  }
} finally {await browser.close();}

const result={schema:'p120.homepage.implementation_pass2.render.v1',base:BASE,generated_at:new Date().toISOString(),checks,failures,verdict:failures.length?'FAIL':'PASS'};
fs.writeFileSync(path.join(ROOT,'qa-evidence-homepage-pass2','render.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({verdict:result.verdict,checks:checks.length,failures},null,2));
if(failures.length) process.exit(1);
