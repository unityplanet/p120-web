import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const BASE='http://127.0.0.1:4173';
const OUT='qa-evidence-independent-render-v1-1';
const routes=[
  ['RU Editorial','/'],['EN Editorial','/en/'],
  ['RU System','/system/'],['EN System','/en/system/'],
  ['RU Science','/science/'],['EN Science','/en/science/'],
  ['RU Why P-120','/why-p120/'],['EN Why P-120','/en/why-p120/'],
  ['RU Creator','/creator/'],['EN Creator','/en/creator/'],
  ['RU Extended','/extended/'],['EN Extended','/en/extended/'],
  ['RU Together','/together/'],['EN Together','/en/together/'],
  ['RU Privacy','/privacy/'],['EN Privacy','/en/privacy/'],
  ['RU Terms','/terms/'],['EN Terms','/en/terms/'],
  ['RU IP','/intellectual-property/'],['EN IP','/en/intellectual-property/']
];
const productionPaths=new Set(routes.map(r=>r[1]));
const devices={desktop:{width:1440,height:1000},mobile:{width:390,height:844}};
const report={version:'P120 Independent Render & Transition Audit v1.1',generated_at:new Date().toISOString(),routes:[],transitions:[],link_checks:[],measurement_parity:null,summary:{}};
const failures=[];

fs.rmSync(OUT,{recursive:true,force:true});
for(const d of Object.keys(devices)) fs.mkdirSync(path.join(OUT,d),{recursive:true});
const browser=await chromium.launch({headless:true});

const slug=route=>route==='/'?'root':route.replace(/^\//,'').replace(/\/$/,'').replaceAll('/','__');
const routePath=url=>{try{const u=new URL(url,BASE);return u.origin===BASE?u.pathname:null}catch{return null}};
const fail=(kind,detail)=>failures.push({kind,detail});
const localNoise=list=>list.filter(x=>!(/favicon\.ico/i.test(x)));

async function settle(page){
  await page.waitForLoadState('networkidle',{timeout:9000}).catch(()=>{});
  await page.waitForTimeout(700);
}

async function primeFullPageVisualState(page){
  await page.evaluate(async()=>{
    const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const step=Math.max(520,Math.floor(window.innerHeight*0.82));
    const height=Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0);
    for(let y=0;y<=height;y+=step){
      window.scrollTo(0,y);
      await sleep(32);
    }
    window.scrollTo(0,0);
    await sleep(260);
  });
}

// 1) Independent full-page render matrix.
for(const [name,route] of routes){
  for(const [device,viewport] of Object.entries(devices)){
    const context=await browser.newContext({viewport,deviceScaleFactor:1});
    const page=await context.newPage();
    const consoleErrors=[]; const pageErrors=[]; const requestFailures=[]; const badResponses=[];
    page.on('console',msg=>{if(msg.type()==='error') consoleErrors.push(msg.text())});
    page.on('pageerror',err=>pageErrors.push(String(err)));
    page.on('requestfailed',req=>{if(req.url().startsWith(BASE))requestFailures.push(`${req.method()} ${req.url()} :: ${req.failure()?.errorText||'failed'}`)});
    page.on('response',res=>{if(res.url().startsWith(BASE)&&res.status()>=400)badResponses.push(`${res.status()} ${res.url()}`)});
    let status=null,navError=null;
    try{const res=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});status=res?.status()??null;await settle(page);await primeFullPageVisualState(page);}catch(e){navError=String(e)}
    const metrics=await page.evaluate(()=>({
      title:document.title,lang:document.documentElement.lang||'',bodyText:(document.body?.innerText||'').trim(),
      scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,
      scrollHeight:document.documentElement.scrollHeight,clientHeight:document.documentElement.clientHeight,
      visibleH1:[...document.querySelectorAll('h1')].filter(x=>x.offsetWidth||x.offsetHeight).map(x=>(x.innerText||'').trim()).slice(0,3)
    })).catch(()=>({title:'',lang:'',bodyText:'',scrollWidth:0,clientWidth:0,scrollHeight:0,clientHeight:0,visibleH1:[]}));
    const screenshot=path.join(OUT,device,`${slug(route)}.jpg`);
    await page.screenshot({path:screenshot,fullPage:true,type:'jpeg',quality:70}).catch(e=>fail('screenshot',`${route} ${device}: ${e}`));
    const overflow=Math.max(0,metrics.scrollWidth-metrics.clientWidth);
    const rec={name,route,device,status,final_url:page.url(),title:metrics.title,lang:metrics.lang,body_chars:metrics.bodyText.length,visible_h1:metrics.visibleH1,scroll_height:metrics.scrollHeight,horizontal_overflow_px:overflow,console_errors:localNoise(consoleErrors),page_errors:pageErrors,request_failures:localNoise(requestFailures),bad_responses:localNoise(badResponses),screenshot};
    report.routes.push(rec);
    if(status!==200) fail('http',`${route} ${device}: status ${status}`);
    if(navError) fail('navigation',`${route} ${device}: ${navError}`);
    if(metrics.bodyText.length<40) fail('blank',`${route} ${device}: only ${metrics.bodyText.length} body chars`);
    if(overflow>3) fail('overflow',`${route} ${device}: ${overflow}px horizontal overflow`);
    if(rec.page_errors.length) fail('pageerror',`${route} ${device}: ${rec.page_errors.join(' | ')}`);
    if(rec.request_failures.length) fail('requestfailed',`${route} ${device}: ${rec.request_failures.join(' | ')}`);
    if(rec.bad_responses.length) fail('badresponse',`${route} ${device}: ${rec.bad_responses.join(' | ')}`);
    await context.close();
  }
}

// 2) Crawl all observed internal links that point to the 20 production pages.
const uniqueLinkChecks=new Map();
for(const [,route] of routes){
  const page=await browser.newPage({viewport:devices.desktop});
  await page.goto(BASE+route,{waitUntil:'domcontentloaded'}); await settle(page);
  const links=await page.locator('a[href]').evaluateAll(as=>as.map(a=>({href:a.href,text:(a.innerText||a.getAttribute('aria-label')||'').trim(),visible:!!(a.offsetWidth||a.offsetHeight||a.getClientRects().length)})));
  for(const l of links){
    const p=routePath(l.href); if(!p) continue;
    const normalized=p.endsWith('/')?p:p+'/';
    if(productionPaths.has(p)||productionPaths.has(normalized)){
      const target=productionPaths.has(p)?p:normalized;
      uniqueLinkChecks.set(`${route}=>${target}`,{source:route,target,label:l.text,visible:l.visible});
    }
  }
  await page.close();
}
for(const item of uniqueLinkChecks.values()){
  const page=await browser.newPage({viewport:devices.desktop});
  let status=null,error=null;
  try{const r=await page.goto(BASE+item.target,{waitUntil:'domcontentloaded',timeout:20000});status=r?.status()??null}catch(e){error=String(e)}
  report.link_checks.push({...item,status,final_url:page.url(),error});
  if(status!==200||error) fail('link',`${item.source} -> ${item.target}: ${status||error}`);
  await page.close();
}

async function clickTransition(id,source,selector,expected,{mobile=false,revealMobileMenu=false}={}){
  const context=await browser.newContext({viewport:mobile?devices.mobile:devices.desktop});
  const page=await context.newPage();
  await page.goto(BASE+source,{waitUntil:'domcontentloaded'}); await settle(page);
  let count=0,visible=false,error=null,final='';
  try{
    const loc=page.locator(selector).first(); count=await loc.count(); visible=count?await loc.isVisible():false;
    if(revealMobileMenu && count && !visible){
      const openers=page.locator('.menu-btn,.mobile-menu-toggle,[data-mobile-menu-open],[data-menu-toggle],button[aria-controls*="mobile"]');
      const openerCount=await openers.count();
      for(let i=0;i<openerCount;i++){
        const opener=openers.nth(i);
        if(await opener.isVisible().catch(()=>false)){
          await opener.click();
          await page.waitForTimeout(220);
          break;
        }
      }
      visible=await loc.isVisible().catch(()=>false);
    }
    if(!count) throw new Error(`selector not found: ${selector}`);
    if(!visible) throw new Error(`selector not visible: ${selector}`);
    await loc.click();
    await page.waitForURL(url=>url.pathname===expected,{timeout:9000});
    await settle(page); final=new URL(page.url()).pathname;
  }catch(e){error=String(e);final=new URL(page.url()).pathname;}
  const ok=count>0&&visible&&final===expected&&!error;
  report.transitions.push({id,source,selector,expected,final,count,visible,ok,error,mobile});
  if(!ok) fail('transition',`${id}: expected ${expected}, got ${final}; count=${count}; visible=${visible}; ${error||''}`);
  await context.close();
}

async function directTransition(id,source,expected){
  const context=await browser.newContext({viewport:devices.desktop});const page=await context.newPage();let error=null;
  try{await page.goto(BASE+source,{waitUntil:'domcontentloaded'});await settle(page);}catch(e){error=String(e)}
  const final=new URL(page.url()).pathname;const ok=final===expected&&!error;
  report.transitions.push({id,source,expected,final,ok,error});if(!ok)fail('transition',`${id}: expected ${expected}, got ${final}; ${error||''}`);
  await context.close();
}

// 3) Critical route transitions.
await clickTransition('RU Editorial Start -> RU System','/','[data-editorial-action="test"]','/system/');
await clickTransition('EN Editorial Start -> EN System','/en/','[data-editorial-action="test"]','/en/system/');
await directTransition('RU Editorial ?start=1 -> RU System','/?start=1','/system/');
await directTransition('EN Editorial ?start=1 -> EN System','/en/?start=1','/en/system/');
await clickTransition('RU System language -> EN System','/system/','.p120-language-switch-desktop a[lang="en"]','/en/system/');
await clickTransition('EN System language -> RU System','/en/system/','.p120-language-switch-desktop a[lang="ru"]','/system/');
await clickTransition('RU System home -> RU Editorial','/system/','[data-home]','/');
await clickTransition('EN System home -> EN Editorial','/en/system/','[data-home]','/en/');
await clickTransition('RU Editorial mobile Start -> RU System','/','.mobile-bottom-nav [data-mobile-start]','/system/',{mobile:true});
await clickTransition('EN Editorial mobile Start -> EN System','/en/','.mobile-bottom-nav [data-mobile-start]','/en/system/',{mobile:true});
await clickTransition('RU System mobile language -> EN System','/system/','.p120-language-mobile-options a[lang="en"]','/en/system/',{mobile:true,revealMobileMenu:true});
await clickTransition('EN System mobile language -> RU System','/en/system/','.p120-language-mobile-options a[lang="ru"]','/system/',{mobile:true,revealMobileMenu:true});

// 4) Saved assessment state must not seize editorial routes.
for(const [id,source,expected] of [['RU saved-state editorial guard','/','/'],['EN saved-state editorial guard','/en/','/en/']]){
  const context=await browser.newContext({viewport:devices.desktop});const page=await context.newPage();
  await page.goto(BASE+source,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.setItem('p120_web_prototype_v01',JSON.stringify({participantId:'P120-QATEST1',screen:'test',itemIndex:5,responses:{Q01:3},adminModes:{},telemetry:[],startedAt:new Date().toISOString(),consentAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()})));
  await page.reload({waitUntil:'domcontentloaded'});await settle(page);
  const final=new URL(page.url()).pathname;
  const questionnaireVisible=await page.locator('.question-card').count().then(async c=>c?await page.locator('.question-card').first().isVisible():false).catch(()=>false);
  const ok=final===expected&&!questionnaireVisible;
  report.transitions.push({id,source,expected,final,ok,questionnaireVisible});
  if(!ok)fail('transition',`${id}: final=${final}; questionnaireVisible=${questionnaireVisible}`);
  await context.close();
}

// 5) Measurement payload parity stays intact after presentation/routing corrections.
async function instrumentSnapshot(route){
  const page=await browser.newPage({viewport:devices.desktop});await page.goto(BASE+route,{waitUntil:'domcontentloaded'});await settle(page);
  const snap=await page.evaluate(()=>{const I=window.P120_INSTRUMENT||{};return {ids:(I.items||[]).map(x=>x.id),modules:(I.modules||[]).map(x=>x.id),records:(I.items||[]).map(x=>({id:x.id,module:x.module,type:x.type,choices:(x.choices||[]).map(c=>c.value)}))}});
  await page.close();return snap;
}
const ruI=await instrumentSnapshot('/system/');const enI=await instrumentSnapshot('/en/system/');
const ruHash=crypto.createHash('sha256').update(JSON.stringify(ruI.records)).digest('hex');
const enHash=crypto.createHash('sha256').update(JSON.stringify(enI.records)).digest('hex');
report.measurement_parity={ru_items:ruI.ids.length,en_items:enI.ids.length,ru_unique:new Set(ruI.ids).size,en_unique:new Set(enI.ids).size,id_order_parity:JSON.stringify(ruI.ids)===JSON.stringify(enI.ids),module_order_parity:JSON.stringify(ruI.modules)===JSON.stringify(enI.modules),coded_structure_sha256_ru:ruHash,coded_structure_sha256_en:enHash,coded_structure_parity:ruHash===enHash};
if(ruI.ids.length!==180||enI.ids.length!==180||new Set(ruI.ids).size!==180||new Set(enI.ids).size!==180||!report.measurement_parity.id_order_parity||!report.measurement_parity.coded_structure_parity)fail('measurement','RU/EN measurement payload parity failed');

await browser.close();
report.summary={production_pages:routes.length,render_cases:report.routes.length,link_checks:report.link_checks.length,transition_checks:report.transitions.length,failures:failures.length,pass:failures.length===0,failures};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
let md=`# P120 Independent Render & Transition Audit v1.1\n\n**Generated:** ${report.generated_at}\n\n**Production pages:** ${routes.length}\n**Render cases:** ${report.routes.length} (desktop + mobile)\n**Internal production link checks:** ${report.link_checks.length}\n**Critical transition checks:** ${report.transitions.length}\n**Measurement parity:** ${report.measurement_parity.id_order_parity&&report.measurement_parity.coded_structure_parity?'PASS':'FAIL'} · ${report.measurement_parity.ru_items}/${report.measurement_parity.en_items}\n**Result:** ${report.summary.pass?'PASS':'FAIL'}\n\n## Render matrix\n\n| Route | Device | HTTP | Lang | Body chars | H-overflow | Local runtime errors |\n|---|---|---:|---|---:|---:|---:|\n`;
for(const r of report.routes)md+=`| \`${r.route}\` | ${r.device} | ${r.status??'—'} | ${r.lang||'—'} | ${r.body_chars} | ${r.horizontal_overflow_px}px | ${r.page_errors.length+r.request_failures.length+r.bad_responses.length} |\n`;
md+='\n## Critical transitions\n\n| Check | Source | Expected | Final | Result |\n|---|---|---|---|---|\n';
for(const t of report.transitions)md+=`| ${t.id} | \`${t.source}\` | \`${t.expected}\` | \`${t.final}\` | ${t.ok?'PASS':'FAIL'} |\n`;
md+='\n## Failures\n\n';
if(!failures.length)md+='None.\n';else failures.forEach(f=>md+=`- **${f.kind}:** ${f.detail}\n`);
fs.writeFileSync(path.join(OUT,'REPORT.md'),md);console.log(md);
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1)}
