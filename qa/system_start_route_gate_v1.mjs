import { chromium } from 'playwright';

const BASE='http://127.0.0.1:4177';
const browser=await chromium.launch({headless:true});
const report={version:'P120 System Start Route Gate v1.0',checks:[],measurement:null,pass:true};

async function routeCheck(id,path,expected){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  let error=null;
  try{
    await page.goto(BASE+path,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForLoadState('networkidle',{timeout:10000}).catch(()=>{});
    await page.waitForTimeout(500);
  }catch(e){error=String(e)}
  const u=new URL(page.url());
  const bodyChars=await page.locator('body').innerText().then(s=>s.trim().length).catch(()=>0);
  const ok=!error&&u.pathname===expected&&u.search===''&&bodyChars>100&&!/\/system\/system\/?$/.test(u.pathname);
  report.checks.push({id,input:path,expected,final_path:u.pathname,final_search:u.search,body_chars:bodyChars,error,pass:ok});
  if(!ok)report.pass=false;
  await context.close();
}

await routeCheck('RU direct System start normalization','/system/?start=1','/system/');
await routeCheck('EN direct System start normalization','/en/system/?start=1','/en/system/');
await routeCheck('RU Editorial start handoff','/?start=1','/system/');
await routeCheck('EN Editorial start handoff','/en/?start=1','/en/system/');

async function instrument(route){
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(500);
  const snap=await page.evaluate(()=>{
    const I=window.P120_INSTRUMENT||{};
    return {ids:(I.items||[]).map(x=>x.id),modules:(I.modules||[]).map(x=>x.id),guard:!!document.querySelector('script[data-p120-system-route-guard="v1.0"]')};
  });
  await page.close();
  return snap;
}
const ru=await instrument('/system/');
const en=await instrument('/en/system/');
report.measurement={ru_items:ru.ids.length,en_items:en.ids.length,ru_unique:new Set(ru.ids).size,en_unique:new Set(en.ids).size,id_order_parity:JSON.stringify(ru.ids)===JSON.stringify(en.ids),module_order_parity:JSON.stringify(ru.modules)===JSON.stringify(en.modules),ru_guard:ru.guard,en_guard:en.guard};
if(ru.ids.length!==180||en.ids.length!==180||new Set(ru.ids).size!==180||new Set(en.ids).size!==180||!report.measurement.id_order_parity||!report.measurement.module_order_parity||!ru.guard||!en.guard)report.pass=false;

await browser.close();
console.log(JSON.stringify(report,null,2));
if(!report.pass)process.exit(1);
