import { chromium } from 'playwright';
import fs from 'fs';

const BASE='http://127.0.0.1:4176';
const OUT='qa-evidence-en-science-localization-v1';
const cases={desktop:{width:1440,height:1000},mobile:{width:390,height:844}};
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={version:'P120 EN Scientific Base Localization Gate v1.0',generated_at:new Date().toISOString(),cases:[],pass:true};
const CYR=/[А-Яа-яЁё]/;

for(const [device,viewport] of Object.entries(cases)){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  const pageErrors=[];const badResponses=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('response',r=>{if(r.url().startsWith(BASE)&&r.status()>=400)badResponses.push(`${r.status()} ${r.url()}`)});
  const response=await page.goto(BASE+'/en/science/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForLoadState('networkidle',{timeout:10000}).catch(()=>{});
  await page.waitForTimeout(800);
  await page.evaluate(async()=>{
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const step=Math.max(520,Math.floor(innerHeight*.8));
    let height=Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0);
    for(let y=0;y<=height;y+=step){scrollTo(0,y);await sleep(55);height=Math.max(height,document.documentElement.scrollHeight,document.body?.scrollHeight||0)}
    scrollTo(0,0);await sleep(450);
  });
  const audit=await page.evaluate(()=>{
    const CYR=/[А-Яа-яЁё]/;
    const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
    const hiddenByTree=el=>{
      let n=el;
      while(n&&n.nodeType===1){
        if(n.matches('script,style,noscript,template,[hidden]')) return true;
        const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0) return true;
        n=n.parentElement;
      }
      return false;
    };
    const visible=el=>!hiddenByTree(el)&&!!(el.getClientRects().length||el===document.body);
    const text=[];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
    while((n=walker.nextNode())){
      const t=norm(n.nodeValue);const el=n.parentElement;
      if(t&&CYR.test(t)&&el&&visible(el)) text.push(t);
    }
    const attrs=[];
    for(const el of document.querySelectorAll('[aria-label],[title],[placeholder]')){
      if(!visible(el))continue;
      for(const a of ['aria-label','title','placeholder']){
        const t=norm(el.getAttribute(a));if(t&&CYR.test(t))attrs.push(`${a}: ${t}`);
      }
    }
    const uniq=a=>[...new Set(a)];
    const pdf=[...document.querySelectorAll('a[href]')].map(a=>a.href).find(h=>/p120-scientific-concept-paper-en-v1\.2\.pdf(?:$|[?#])/i.test(h))||null;
    return {
      lang:document.documentElement.lang,title:document.title,
      body_chars:norm(document.body.innerText).length,
      overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),
      visible_cyrillic:uniq(text),visible_cyrillic_attrs:uniq(attrs),pdf_link:pdf,
      localization_marker:document.documentElement.dataset.scienceLocalization||null
    };
  });
  const shot=`${OUT}/${device}.jpg`;await page.screenshot({path:shot,fullPage:true,type:'jpeg',quality:75});
  const rec={device,http:response?.status()??null,...audit,page_errors:pageErrors,bad_responses:badResponses,screenshot:shot};
  rec.pass=rec.http===200&&rec.lang==='en'&&rec.body_chars>500&&rec.overflow<=3&&!rec.visible_cyrillic.length&&!rec.visible_cyrillic_attrs.length&&!pageErrors.length&&!badResponses.length&&!!rec.pdf_link&&rec.localization_marker==='en-v1.0';
  if(!rec.pass)report.pass=false;
  report.cases.push(rec);
  await context.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.pass)process.exit(1);
