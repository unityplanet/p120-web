import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE=(process.env.P120_PRODUCTION_BASE||'https://unityplanet.github.io/p120-web/').replace(/\/?$/,'/');
const OUT='qa-evidence-webscience-prod-g1-live';
fs.mkdirSync(OUT,{recursive:true});
const cases=[
  {locale:'RU',route:'science/',width:1440,height:1000},
  {locale:'RU',route:'science/',width:390,height:844},
  {locale:'EN',route:'en/science/',width:1440,height:1000},
  {locale:'EN',route:'en/science/',width:390,height:844},
];
const checks=[]; const failures=[];
function ck(id,pass,detail={}){const r={id,pass:Boolean(pass),...detail};checks.push(r);if(!r.pass)failures.push(r);}

const browser=await chromium.launch({headless:true});
try{
  for(const c of cases){
    const ctx=await browser.newContext({viewport:{width:c.width,height:c.height}});
    const page=await ctx.newPage();
    const errors=[]; const failedRequests=[]; const responses=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('requestfailed',r=>failedRequests.push({url:r.url(),failure:r.failure()?.errorText||''}));
    page.on('response',r=>{ if(r.url().includes('/p120-web/')) responses.push({url:r.url(),status:r.status()}); });
    const url=BASE+c.route;
    let response=null;
    try { response=await page.goto(url,{waitUntil:'networkidle',timeout:45000}); } catch(e){ errors.push('NAV:'+String(e)); }
    const tag=`${c.locale}-${c.width}`;
    ck(`${tag}: live document HTTP success`,!!response && response.status()>=200 && response.status()<400,{status:response?.status()??null,url});
    await page.waitForTimeout(1500);
    const snap=await page.evaluate(()=>{
      const text=document.body?.innerText||'';
      const sci=window.P120_SCIENCE||null;
      const state=sci?.status||null;
      const scripts=[...document.scripts].map(s=>s.src).filter(Boolean);
      const styles=[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.href).filter(Boolean);
      return {title:document.title,text,sciPresent:!!sci,status:state,scripts,styles,bodyWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth};
    });
    ck(`${tag}: P120_SCIENCE runtime present`,snap.sciPresent,{status:snap.status});
    ck(`${tag}: Scientific Base ready`,snap.status?.phase==='ready' && snap.status?.pass===true,{status:snap.status});
    ck(`${tag}: no horizontal document overflow`,snap.bodyWidth<=snap.clientWidth+1,{scrollWidth:snap.bodyWidth,clientWidth:snap.clientWidth});
    const projectResourceURLs=[...snap.scripts,...snap.styles].filter(u=>u.includes('unityplanet.github.io'));
    ck(`${tag}: all GitHub Pages scripts/styles remain inside /p120-web/`,projectResourceURLs.every(u=>u.startsWith('https://unityplanet.github.io/p120-web/')),{resources:projectResourceURLs});
    ck(`${tag}: Scientific Base runtime loaded`,snap.scripts.some(u=>u.includes('/p120-web/p120-scientific-base-runtime-v1.0.js')),{scripts:snap.scripts});
    ck(`${tag}: PASS4C library runtime loaded`,snap.scripts.some(u=>u.includes('/p120-web/p120-webscience-pass4c-library-v0.7.js')),{scripts:snap.scripts});
    ck(`${tag}: PASS4E visual CSS loaded`,snap.styles.some(u=>u.includes('/p120-web/p120-webscience-pass4e-visual-v0.9.css')),{styles:snap.styles});
    ck(`${tag}: no page errors`,errors.length===0,{errors});
    ck(`${tag}: no failed project requests`,failedRequests.filter(x=>x.url.includes('/p120-web/')).length===0,{failedRequests});
    ck(`${tag}: project responses successful`,responses.filter(x=>x.status>=400).length===0,{bad:responses.filter(x=>x.status>=400)});
    if(c.locale==='EN') ck(`${tag}: EN page has no obvious RU-only heading leakage`,!snap.text.includes('Научная база') && !snap.text.includes('Научная библиотека'));
    await page.screenshot({path:path.join(OUT,`${tag}.png`),fullPage:false});
    await ctx.close();
  }

  for(const locale of ['RU','EN']){
    const route=locale==='RU'?'science/':'en/science/';
    const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
    const page=await ctx.newPage();
    await page.goto(BASE+route,{waitUntil:'networkidle',timeout:45000});
    await page.waitForTimeout(1500);
    const available=await page.evaluate(()=>({text:document.body.innerText,science:window.P120_SCIENCE?{status:window.P120_SCIENCE.status,registry:window.P120_SCIENCE.registry}:null}));
    const upper=available.text.toUpperCase();
    for(const base of ['CORE','EXTENDED','OUTCOMES','METHODS','LIBRARY']) ck(`${locale} live: ${base} control/content discoverable`,upper.includes(base));
    for(const mod of ['COM-12','MOT-12','SELF-12','RPE-MOD','LIFE-12/18']) ck(`${locale} live: ${mod} present`,upper.includes(mod));
    ck(`${locale} live: DYADIC not publicly rendered`,!upper.includes('DYADIC'));
    ck(`${locale} live: Global70 counter contract visible`,/\b45\b/.test(available.text) && /\b25\b/.test(available.text) && /\b70\b/.test(available.text));
    ck(`${locale} live: session access remains prohibited`,available.science?.registry?.sessionAccess==='PROHIBITED' || available.science?.registry?.session_storage_access==='PROHIBITED');
    await ctx.close();
  }
} finally { await browser.close(); }

const result={document_id:'P120-WEBSCI-PROD-G1-LIVE-SMOKE',version:'v1.0',date:'2026-09-06',production_base:BASE,status:failures.length?'FAIL':'PASS',checks_total:checks.length,checks_passed:checks.length-failures.length,checks_failed:failures.length,checks,failures};
fs.writeFileSync(path.join(OUT,'P120_WEBSCI_PROD_G1_LIVE_SMOKE_v1.0.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks_total:result.checks_total,checks_passed:result.checks_passed,checks_failed:result.checks_failed},null,2));
if(failures.length) process.exit(1);
