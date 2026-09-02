import { chromium } from 'playwright';

const ORIGIN='http://127.0.0.1:4179';
const LIVE='https://unityplanet.github.io/p120-web';
const SENTINELS={
  legacy:'{"sentinel":"legacy-preserve","responses":{"SAT01":"4"}}',
  ru:'{"sentinel":"ru-session-preserve","responses":{"SAT02":"5"}}',
  en:'{"sentinel":"en-session-preserve","responses":{"SAT02":"2"}}'
};
const baseStates=['CORE','EXTENDED','OUTCOMES','METHODS','LIBRARY'];

function cssPath(el){
  if(!el || el.nodeType!==1)return null;
  if(el.id)return `#${CSS.escape(el.id)}`;
  const parts=[];
  let node=el;
  while(node && node.nodeType===1 && node!==document.documentElement){
    let part=node.localName;
    if(node.classList.length)part+='.'+[...node.classList].slice(0,3).map(x=>CSS.escape(x)).join('.');
    const parent=node.parentElement;
    if(parent){
      const same=[...parent.children].filter(x=>x.localName===node.localName);
      if(same.length>1)part+=`:nth-of-type(${same.indexOf(node)+1})`;
    }
    parts.unshift(part);
    if(parent?.id){parts.unshift(`#${CSS.escape(parent.id)}`);break;}
    node=parent;
    if(parts.length>=7)break;
  }
  return parts.join(' > ');
}

async function seedContext(browser){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(seed=>{
    localStorage.setItem('p120_web_prototype_v01',seed.legacy);
    localStorage.setItem('p120_runtime_session_ru_v1',seed.ru);
    localStorage.setItem('p120_runtime_session_en_v1',seed.en);
    localStorage.removeItem('p120_science_page_state_ru_v1');
    localStorage.removeItem('p120_science_page_state_en_v1');
  },SENTINELS);
  return context;
}

async function waitRuntime(page){
  await page.waitForFunction(()=>document.documentElement.dataset.p120ScientificBaseStatus==='pass'&&window.P120ScientificBase?.status?.pass===true,null,{timeout:12000});
}

async function selectBase(page,base){
  if(base==='CORE'){
    await page.evaluate(()=>window.P120ScientificBase?.setBase('CORE'));
  }else{
    const button=page.locator(`[data-p120-science-base="${base}"]`);
    await button.waitFor({state:'visible',timeout:5000});
    await button.click();
  }
  await page.waitForFunction(expected=>document.documentElement.dataset.p120ScienceActiveBase===expected,base,{timeout:5000});
  await page.waitForTimeout(120);
}

async function snapshotLinks(page,label){
  const rows=await page.evaluate(({origin,label})=>{
    function pathFor(el){
      if(!el || el.nodeType!==1)return null;
      if(el.id)return `#${CSS.escape(el.id)}`;
      const parts=[];
      let node=el;
      while(node && node.nodeType===1 && node!==document.documentElement){
        let part=node.localName;
        if(node.classList.length)part+='.'+[...node.classList].slice(0,3).map(x=>CSS.escape(x)).join('.');
        const parent=node.parentElement;
        if(parent){
          const same=[...parent.children].filter(x=>x.localName===node.localName);
          if(same.length>1)part+=`:nth-of-type(${same.indexOf(node)+1})`;
        }
        parts.unshift(part);
        if(parent?.id){parts.unshift(`#${CSS.escape(parent.id)}`);break;}
        node=parent;
        if(parts.length>=7)break;
      }
      return parts.join(' > ');
    }
    return [...document.querySelectorAll('a[href]')].map((a,index)=>{
      const raw=a.getAttribute('href');
      const domHref=a.href;
      let rawResolved=null;
      try{rawResolved=new URL(raw,document.baseURI).href}catch(_){}
      let sameOrigin=false;
      try{sameOrigin=new URL(domHref).origin===origin}catch(_){}
      const source=a.closest('[data-p120-science-base],[data-p120-science-module],.p120-dedicated-science-lang,.science-page,nav,header,footer');
      return {
        checkpoint:label,
        index,
        text:(a.textContent||'').replace(/\s+/g,' ').trim(),
        outerHTML:a.outerHTML,
        rawHref:raw,
        documentBaseURI:document.baseURI,
        domHref,
        pageUrl:location.href,
        rawResolvedAgainstBaseURI:rawResolved,
        qaResolverUrl:domHref.split('#')[0],
        sameOrigin,
        selector:pathFor(a),
        sourceSelector:pathFor(source),
        sourceOuterHTML:source?.outerHTML?.slice(0,1800)||null
      };
    });
  },{origin:ORIGIN,label});
  return rows;
}

async function diagnoseLocal(browser){
  const context=await seedContext(browser);
  const page=await context.newPage();
  await page.goto(`${ORIGIN}/en/science/`,{waitUntil:'domcontentloaded'});
  await waitRuntime(page);

  const checkpoints=[];
  checkpoints.push({label:'initial-core',links:await snapshotLinks(page,'initial-core')});
  for(const base of baseStates){
    await selectBase(page,base);
    checkpoints.push({label:`after-${base.toLowerCase()}`,links:await snapshotLinks(page,`after-${base.toLowerCase()}`)});
  }
  await selectBase(page,'CORE');
  checkpoints.push({label:'qa-final-core',links:await snapshotLinks(page,'qa-final-core')});

  const finalRows=checkpoints.at(-1).links;
  const sameOrigin=[...new Map(finalRows.filter(x=>x.sameOrigin).map(x=>[x.domHref,x])).values()];
  const probes=[];
  for(const row of sameOrigin){
    const clean=row.qaResolverUrl;
    if(!clean)continue;
    const res=await page.request.get(clean,{failOnStatusCode:false,timeout:10000}).catch(error=>({status:()=>0,error:String(error)}));
    probes.push({url:clean,status:res.status(),error:res.error||null});
  }
  const broken=probes.filter(x=>x.status>=400||x.status===0);
  const targetUrls=new Set(broken.map(x=>x.url));
  const specific=finalRows.filter(x=>targetUrls.has(x.qaResolverUrl)||x.domHref.includes('/en/science/en/'));

  const emergence=[];
  for(const cp of checkpoints){
    const matches=cp.links.filter(x=>x.domHref.includes('/en/science/en/')||x.qaResolverUrl.includes('/en/science/en/'));
    emergence.push({checkpoint:cp.label,count:matches.length,matches});
  }

  await context.close();
  return {
    route:`${ORIGIN}/en/science/`,
    exactQaSequence:baseStates,
    qaResolverDefinition:'DOM a.href -> split("#")[0] -> page.request.get(clean)',
    broken,
    specific,
    emergence,
    conclusionHint:specific.length
      ? 'The failing URL exists as a browser-resolved DOM a.href at the exact QA checkpoint.'
      : 'The failing URL was not present as browser-resolved DOM a.href at the exact QA checkpoint; investigate QA/state nondeterminism.'
  };
}

async function checkLiveRoute(browser,path){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});
  const url=`${LIVE}${path}`;
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  let runtimeReady=false;
  try{
    await page.waitForFunction(()=>document.documentElement.dataset.p120ScientificBaseStatus==='pass'&&window.P120ScientificBase?.status?.pass===true,null,{timeout:15000});
    runtimeReady=true;
  }catch(_){}
  const result=await page.evaluate(()=>{
    const atlas=document.querySelector('#p120-science-atlas');
    const evidence=document.querySelector('#science-evidence');
    const visible=el=>Boolean(el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().height>0);
    return {
      pageUrl:location.href,
      baseURI:document.baseURI,
      lang:document.documentElement.lang,
      scientificBaseStatus:document.documentElement.dataset.p120ScientificBaseStatus||null,
      activeBase:window.P120ScientificBase?.activeBaseId||null,
      atlasExists:Boolean(atlas),
      atlasVisible:visible(atlas),
      atlasText:(atlas?.textContent||'').replace(/\s+/g,' ').trim().slice(0,500),
      evidenceExists:Boolean(evidence),
      evidenceVisible:visible(evidence),
      evidenceText:(evidence?.textContent||'').replace(/\s+/g,' ').trim().slice(0,500)
    };
  });
  await context.close();
  return {requested:url,httpStatus:response?.status()||null,runtimeReady,errors,...result};
}

const browser=await chromium.launch({headless:true});
try{
  const local=await diagnoseLocal(browser);
  const liveRU=await checkLiveRoute(browser,'/science/');
  const liveEN=await checkLiveRoute(browser,'/en/science/');
  console.log(JSON.stringify({
    document_id:'P120-PASS4-DIAGNOSTIC-RECONCILIATION-EN-SCIENCE-LINK-001',
    date:'2026-09-02',
    productionRuntimeMutation:'NONE',
    cleanupMutation:'NONE',
    local,
    live:{ru:liveRU,en:liveEN}
  },null,2));
} finally {
  await browser.close();
}
