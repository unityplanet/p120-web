import {chromium} from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE=process.env.P120_QA_BASE||'http://127.0.0.1:4173';
const OUT='qa-artifacts/header-lockup-pass1';
const widths=[360,390,430,480];
const routes=['/','/extended/','/together/','/creator/','/why-p120/','/science/','/en/','/en/why-p120/'];
const failures=[];
const results=[];
fs.mkdirSync(OUT,{recursive:true});

function check(ok,label,detail=''){
  if(!ok) failures.push(detail?`${label}: ${detail}`:label);
  return {status:ok?'PASS':'FAIL',label,detail};
}

const browser=await chromium.launch({headless:true});

for(const width of widths){
  for(const route of routes){
    const context=await browser.newContext({viewport:{width,height:820}});
    const page=await context.newPage();
    const consoleErrors=[];
    page.on('console',m=>{if(m.type()==='error') consoleErrors.push(m.text())});
    page.on('pageerror',e=>consoleErrors.push(e.message));

    await page.addInitScript(() => {
      window.__p120BrandTimeline=[];
      const started=performance.now();
      const sample=()=>{
        const mark=document.querySelector('.brand-mark');
        if(mark){
          const cs=getComputedStyle(mark);
          const r=mark.getBoundingClientRect();
          window.__p120BrandTimeline.push({
            t:Math.round(performance.now()-started),
            display:cs.display,
            visibility:cs.visibility,
            width:r.width,
            height:r.height
          });
        }
        if(performance.now()-started<2200) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });

    const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('html[data-p120-brand-system="5.3"]',{timeout:15000});
    await page.waitForTimeout(750);

    const data=await page.evaluate(() => {
      const mark=document.querySelector('.brand-mark');
      const cs=mark?getComputedStyle(mark):null;
      const r=mark?.getBoundingClientRect();
      const timeline=window.__p120BrandTimeline||[];
      const firstVisible=timeline.findIndex(s=>s.display!=='none'&&s.visibility!=='hidden'&&s.width>0&&s.height>0);
      const afterFirst=firstVisible>=0?timeline.slice(firstVisible):[];
      const hiddenAfterVisible=afterFirst.filter(s=>s.display==='none'||s.visibility==='hidden'||s.width<=0||s.height<=0);
      return {
        runtime:document.documentElement.dataset.p120BrandSystem||'',
        finalDisplay:cs?.display||'',
        finalVisibility:cs?.visibility||'',
        finalWidth:r?.width||0,
        finalHeight:r?.height||0,
        canonicalChildren:mark?mark.querySelectorAll('.brand-orbit,.brand-node-a,.brand-node-b').length:0,
        sampleCount:timeline.length,
        firstVisible,
        hiddenAfterVisible:hiddenAfterVisible.slice(0,12)
      };
    });

    const checks=[];
    checks.push(check(!!response&&response.status()<400,`${width} ${route} HTTP`,response?String(response.status()):'no response'));
    checks.push(check(data.runtime==='5.3',`${width} ${route} brand runtime`,data.runtime));
    checks.push(check(data.finalDisplay!=='none'&&data.finalVisibility!=='hidden'&&data.finalWidth>0&&data.finalHeight>0,`${width} ${route} final orbit mark visible`,JSON.stringify(data)));
    checks.push(check(data.canonicalChildren===3,`${width} ${route} canonical orbit structure`,String(data.canonicalChildren)));
    checks.push(check(data.firstVisible>=0,`${width} ${route} orbit mark becomes visible`,String(data.firstVisible)));
    checks.push(check(data.hiddenAfterVisible.length===0,`${width} ${route} no visible-to-hidden brand transition`,JSON.stringify(data.hiddenAfterVisible)));
    checks.push(check(consoleErrors.length===0,`${width} ${route} no console/page errors`,consoleErrors.join(' | ')));

    const slug=route==='/'?'home':route.replace(/^\/|\/$/g,'').replaceAll('/','-');
    await page.screenshot({path:path.join(OUT,`${width}-${slug}.png`),fullPage:false});
    results.push({width,route,data,consoleErrors,checks});
    await context.close();
  }
}

await browser.close();
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({status:failures.length?'FAIL':'PASS',failures,results},null,2));

if(failures.length){
  console.error(`GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 1 — FAIL (${failures.length})`);
  failures.forEach(f=>console.error(`- ${f}`));
  process.exit(1);
}

console.log(`GLOBAL HEADER BRAND LOCKUP CLEANING / PASS 1 — PASS (${results.length} route/viewport cases)`);
