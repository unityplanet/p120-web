import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE=(process.env.P120_QA_BASE||'http://127.0.0.1:4174/p120-web').replace(/\/$/,'');
const OUT=path.join(process.cwd(),'qa-evidence-system-pass4');
fs.mkdirSync(OUT,{recursive:true});

const failures=[];
const checks=[];
const check=(label,ok,detail=null)=>{checks.push({label,ok,detail});if(!ok)failures.push({label,detail});};

const cases=[
  {id:'ru-mobile',route:'/system/',locale:'ru',width:390,height:844,theme:'museum'},
  {id:'ru-desktop',route:'/system/',locale:'ru',width:1440,height:1000,theme:'graphite'},
  {id:'en-mobile',route:'/en/system/',locale:'en',width:390,height:844,theme:'museum'},
  {id:'en-desktop',route:'/en/system/',locale:'en',width:1440,height:1000,theme:'graphite'}
];

const expected={
  ru:{title:'Что происходит с вашими ответами.',labels:['Ответ','Измерение','Вычисление','Интерпретация','Статус знания'],boundary:'Результат P-120 не является диагнозом',href:'/about/'},
  en:{title:'What happens to your answers.',labels:['Response','Measurement','Computation','Interpretation','Evidence status'],boundary:'A P-120 result is not a diagnosis',href:'/en/about/'}
};

const browser=await chromium.launch({headless:true});
try{
  for(const c of cases){
    const page=await browser.newPage({viewport:{width:c.width,height:c.height}});
    const errors=[];
    page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
    page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
    const url=BASE+c.route;
    const resp=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    check(`${c.id}: route HTTP OK`,!!resp&&resp.ok(),{status:resp?.status(),url});
    await page.waitForSelector('[data-editorial-action="test"]',{timeout:15000});
    const entered=await page.evaluate(()=>{
      const trigger=document.querySelector('[data-editorial-action="test"]');
      if(!trigger) return false;
      trigger.click();
      return true;
    });
    check(`${c.id}: existing System entry action invoked`,entered===true,entered);
    await page.waitForSelector('[data-p120-system-functional-derivative="pass4-v1.0"]',{timeout:15000});
    await page.evaluate(theme=>{document.body.dataset.theme=theme},c.theme);
    await page.waitForTimeout(120);

    const data=await page.evaluate(()=>{
      const block=document.querySelector('[data-p120-system-functional-derivative="pass4-v1.0"]');
      const ritual=document.querySelector('.luxury-ritual-grid');
      const title=block?.querySelector('h3')?.textContent?.trim()||'';
      const labels=[...block?.querySelectorAll('.flow-step strong')||[]].map(x=>x.textContent.trim());
      const boundary=block?.querySelector('.p120-system-pass4-boundary')?.textContent?.replace(/\s+/g,' ').trim()||'';
      const link=block?.querySelector('.p120-system-pass4-more');
      const consent=document.querySelector('#consent');
      const start=document.querySelector('#start');
      const initialStartDisabled=!!start?.disabled;
      const keysBefore=Object.keys(localStorage).sort();
      window.P120SystemFunctionalDerivative?.render();
      window.P120SystemFunctionalDerivative?.render();
      const keysAfter=Object.keys(localStorage).sort();
      const count=document.querySelectorAll('[data-p120-system-functional-derivative="pass4-v1.0"]').length;
      const rect=block?.getBoundingClientRect();
      const css=block?getComputedStyle(block):null;
      const bodyWidth=document.documentElement.scrollWidth;
      const viewportWidth=document.documentElement.clientWidth;
      if(consent){consent.click()}
      const enabledAfterConsent=start?!start.disabled:false;
      return {
        title,labels,boundary,
        href:link?.href||'',
        count,
        afterRitual:ritual?.nextElementSibling===block,
        initialStartDisabled,enabledAfterConsent,
        keysBefore,keysAfter,
        width:rect?.width||0,
        display:css?.display||'',
        background:css?.backgroundColor||'',
        color:css?.color||'',
        overflow:bodyWidth>viewportWidth+1,
        locale:document.documentElement.lang,
        dataset:document.documentElement.dataset.p120SystemFunctionalDerivative||null,
        interactiveCount:block?.querySelectorAll('button,input,select,textarea').length||0
      };
    });

    const e=expected[c.locale];
    check(`${c.id}: locale identity`,data.locale.toLowerCase().startsWith(c.locale),data.locale);
    check(`${c.id}: controlled derivative marker active`,data.dataset==='pass4-v1.0',data.dataset);
    check(`${c.id}: one derivative block only`,data.count===1,data.count);
    check(`${c.id}: derivative follows respondent-preparation ritual`,data.afterRitual===true,data);
    check(`${c.id}: exact controlled title`,data.title===e.title,data.title);
    check(`${c.id}: five-stage functional chain`,JSON.stringify(data.labels)===JSON.stringify(e.labels),data.labels);
    check(`${c.id}: result-boundary language`,data.boundary.includes(e.boundary),data.boundary);
    check(`${c.id}: About route`,new URL(data.href).pathname.endsWith(e.href),data.href);
    check(`${c.id}: existing consent remains initially blocking`,data.initialStartDisabled===true,data.initialStartDisabled);
    check(`${c.id}: existing consent still enables respondent start`,data.enabledAfterConsent===true,data.enabledAfterConsent);
    check(`${c.id}: repeated derivative rendering is storage-neutral`,JSON.stringify(data.keysBefore)===JSON.stringify(data.keysAfter),{before:data.keysBefore,after:data.keysAfter});
    check(`${c.id}: derivative adds no respondent input controls`,data.interactiveCount===0,data.interactiveCount);
    check(`${c.id}: visible block geometry`,data.width>200&&data.display!=='none',data);
    check(`${c.id}: no horizontal overflow`,data.overflow===false,data.overflow);
    check(`${c.id}: no console/page errors`,errors.length===0,errors);

    await page.screenshot({path:path.join(OUT,`${c.id}.png`),fullPage:true});
    await page.close();
  }
} finally {
  await browser.close();
}

const result={schema:'p120.system.functional_derivative.pass4.render.v1',base:BASE,verdict:failures.length?'FAIL':'PASS',checks:checks.length,failures,cases:cases.map(c=>c.id)};
fs.writeFileSync(path.join(OUT,'render-result.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(failures.length) process.exit(1);
