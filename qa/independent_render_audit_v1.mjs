import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE='http://127.0.0.1:4173';
const OUT='qa-evidence-independent-render-v1';
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
const report={version:'P120 Independent Render & Transition Audit v1.0',generated_at:new Date().toISOString(),routes:[],transitions:[],link_checks:[],summary:{}};
const failures=[];

fs.rmSync(OUT,{recursive:true,force:true});
for(const d of Object.keys(devices)) fs.mkdirSync(path.join(OUT,d),{recursive:true});

const browser=await chromium.launch({headless:true});

function slug(route){return route==='/'?'root':route.replace(/^\//,'').replace(/\/$/,'').replaceAll('/','__')}
function routePath(url){try{const u=new URL(url,BASE);return u.origin===BASE?u.pathname:null}catch{return null}}
function pushFailure(kind,detail){failures.push({kind,detail})}

for(const [name,route] of routes){
  for(const [device,viewport] of Object.entries(devices)){
    const context=await browser.newContext({viewport,deviceScaleFactor:1});
    const page=await context.newPage();
    const consoleErrors=[]; const pageErrors=[]; const requestFailures=[]; const badResponses=[];
    page.on('console',msg=>{if(msg.type()==='error') consoleErrors.push(msg.text())});
    page.on('pageerror',err=>pageErrors.push(String(err)));
    page.on('requestfailed',req=>{const u=req.url(); if(u.startsWith(BASE)) requestFailures.push(`${req.method()} ${u} :: ${req.failure()?.errorText||'failed'}`)});
    page.on('response',res=>{if(res.url().startsWith(BASE)&&res.status()>=400) badResponses.push(`${res.status()} ${res.url()}`)});
    let status=null, navError=null;
    try{
      const res=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000}); status=res?.status()??null;
      await page.waitForLoadState('networkidle',{timeout:10000}).catch(()=>{});
      await page.waitForTimeout(900);
    }catch(e){navError=String(e)}
    const metrics=await page.evaluate(()=>({
      title:document.title,
      lang:document.documentElement.lang||'',
      bodyText:(document.body?.innerText||'').trim(),
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth,
      scrollHeight:document.documentElement.scrollHeight,
      clientHeight:document.documentElement.clientHeight,
      anchors:[...document.querySelectorAll('a[href]')].map(a=>({href:a.href,text:(a.innerText||a.getAttribute('aria-label')||'').trim(),visible:!!(a.offsetWidth||a.offsetHeight||a.getClientRects().length)}))
    })).catch(()=>({title:'',lang:'',bodyText:'',scrollWidth:0,clientWidth:0,scrollHeight:0,clientHeight:0,anchors:[]}));
    const screenshot=path.join(OUT,device,`${slug(route)}.jpg`);
    await page.screenshot({path:screenshot,fullPage:true,type:'jpeg',quality:68}).catch(e=>pushFailure('screenshot',`${route} ${device}: ${e}`));
    const overflow=Math.max(0,metrics.scrollWidth-metrics.clientWidth);
    const blank=metrics.bodyText.length<40;
    const rec={name,route,device,status,final_url:page.url(),title:metrics.title,lang:metrics.lang,body_chars:metrics.bodyText.length,scroll_height:metrics.scrollHeight,horizontal_overflow_px:overflow,console_errors:consoleErrors,page_errors:pageErrors,request_failures:requestFailures,bad_responses:badResponses,screenshot};
    report.routes.push(rec);
    if(status!==200) pushFailure('http',`${route} ${device}: status ${status}`);
    if(navError) pushFailure('navigation',`${route} ${device}: ${navError}`);
    if(blank) pushFailure('blank',`${route} ${device}: only ${metrics.bodyText.length} body chars`);
    if(overflow>3) pushFailure('overflow',`${route} ${device}: ${overflow}px horizontal overflow`);
    if(pageErrors.length) pushFailure('pageerror',`${route} ${device}: ${pageErrors.join(' | ')}`);
    if(requestFailures.length) pushFailure('requestfailed',`${route} ${device}: ${requestFailures.join(' | ')}`);
    if(badResponses.length) pushFailure('badresponse',`${route} ${device}: ${badResponses.join(' | ')}`);
    await context.close();
  }
}

// Crawl every production-page internal anchor target observed from a clean desktop render.
const uniqueLinkChecks=new Map();
for(const [name,route] of routes){
  const page=await browser.newPage({viewport:devices.desktop});
  await page.goto(BASE+route,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(500);
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
  const p=await browser.newPage({viewport:devices.desktop});
  let status=null,err=null;
  try{const r=await p.goto(BASE+item.target,{waitUntil:'domcontentloaded',timeout:20000});status=r?.status()??null}catch(e){err=String(e)}
  const final_url=p.url();
  report.link_checks.push({...item,status,final_url,error:err});
  if(status!==200||err) pushFailure('link',`${item.source} -> ${item.target}: ${status||err}`);
  await p.close();
}

async function transition(id,source,selector,expected,{mobile=false,preload=null}={}){
  const context=await browser.newContext({viewport:mobile?devices.mobile:devices.desktop});
  const page=await context.newPage();
  if(preload){await page.goto(BASE+source,{waitUntil:'domcontentloaded'}); await page.evaluate(preload); await page.reload({waitUntil:'domcontentloaded'});}
  else await page.goto(BASE+source,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(600);
  let count=0,visible=false,error=null,final='';
  try{
    const loc=page.locator(selector).first(); count=await loc.count(); visible=count?await loc.isVisible():false;
    if(!count) throw new Error(`selector not found: ${selector}`);
    await Promise.all([page.waitForURL(url=>url.pathname===expected,{timeout:8000}).catch(()=>{}),loc.click()]);
    await page.waitForTimeout(350); final=new URL(page.url()).pathname;
  }catch(e){error=String(e); final=new URL(page.url()).pathname}
  const ok=count>0&&visible&&final===expected&&!error;
  report.transitions.push({id,source,selector,expected,final,count,visible,ok,error,mobile});
  if(!ok) pushFailure('transition',`${id}: expected ${expected}, got ${final}, selector count ${count}, visible ${visible}, error ${error||'none'}`);
  await context.close();
}

// Critical route ownership and language transitions, desktop + selected mobile paths.
await transition('RU editorial Start -> RU System','/','[data-editorial-action="test"]','/system/');
await transition('EN editorial Start -> EN System','/en/','[data-editorial-action="test"]','/en/system/');
await transition('RU editorial ?start=1 -> RU System','/?start=1','body','/system/');
await transition('EN editorial ?start=1 -> EN System','/en/?start=1','body','/en/system/');
await transition('RU System language -> EN System','/system/','.p120-language-switch-desktop a[lang="en"]','/en/system/');
await transition('EN System language -> RU System','/en/system/','.p120-language-switch-desktop a[lang="ru"]','/system/');
await transition('RU System home -> RU Editorial','/system/','[data-home]','/');
await transition('EN System home -> EN Editorial','/en/system/','[data-home]','/en/');
await transition('RU editorial mobile Start -> RU System','/','[data-mobile-start]','/system/',{mobile:true});
await transition('EN editorial mobile Start -> EN System','/en/','[data-mobile-start]','/en/system/',{mobile:true});

// Saved assessment state must never seize editorial routes.
for(const [id,source,expected] of [['RU saved-state editorial guard','/','/'],['EN saved-state editorial guard','/en/','/en/']]){
  const context=await browser.newContext({viewport:devices.desktop}); const page=await context.newPage();
  await page.goto(BASE+source,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.setItem('p120_web_prototype_v01',JSON.stringify({participantId:'P120-QATEST1',screen:'test',itemIndex:5,responses:{Q01:3},adminModes:{},telemetry:[],startedAt:new Date().toISOString(),consentAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()})));
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(500);
  const final=new URL(page.url()).pathname;
  const text=(await page.locator('body').innerText()).slice(0,3000);
  const questionnaireVisible=await page.locator('.question-card').count().then(async c=>c?await page.locator('.question-card').first().isVisible():false).catch(()=>false);
  const ok=final===expected&&!questionnaireVisible;
  report.transitions.push({id,source,expected,final,ok,questionnaireVisible});
  if(!ok) pushFailure('transition',`${id}: final ${final}; questionnaireVisible=${questionnaireVisible}; text=${text.slice(0,120)}`);
  await context.close();
}

await browser.close();

report.summary={production_pages:routes.length,render_cases:report.routes.length,link_checks:report.link_checks.length,transition_checks:report.transitions.length,failures:failures.length,pass:failures.length===0,failures};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
let md=`# P120 Independent Render & Transition Audit v1.0\n\n**Generated:** ${report.generated_at}\n\n**Production pages:** ${routes.length}\n**Render cases:** ${report.routes.length} (desktop + mobile)\n**Internal production link checks:** ${report.link_checks.length}\n**Critical transition checks:** ${report.transitions.length}\n**Result:** ${report.summary.pass?'PASS':'FAIL'}\n\n## Render matrix\n\n| Route | Device | HTTP | Lang | Body chars | H-overflow | Console/Page errors |\n|---|---|---:|---|---:|---:|---:|\n`;
for(const r of report.routes) md+=`| \`${r.route}\` | ${r.device} | ${r.status??'—'} | ${r.lang||'—'} | ${r.body_chars} | ${r.horizontal_overflow_px}px | ${r.console_errors.length+r.page_errors.length+r.request_failures.length+r.bad_responses.length} |\n`;
md+='\n## Critical transitions\n\n| Check | Source | Expected | Final | Result |\n|---|---|---|---|---|\n';
for(const t of report.transitions) md+=`| ${t.id} | \`${t.source}\` | \`${t.expected}\` | \`${t.final}\` | ${t.ok?'PASS':'FAIL'} |\n`;
md+='\n## Failures\n\n';
if(!failures.length) md+='None.\n'; else for(const f of failures) md+=`- **${f.kind}:** ${f.detail}\n`;
fs.writeFileSync(path.join(OUT,'REPORT.md'),md);
console.log(md);
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1)}
