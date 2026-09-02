import { chromium } from 'playwright';

const BASE='http://127.0.0.1:4175';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto(BASE+'/en/science/',{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForLoadState('networkidle',{timeout:10000}).catch(()=>{});
await page.waitForTimeout(1000);
await page.evaluate(async()=>{
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const h=Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0);
  for(let y=0;y<=h;y+=700){window.scrollTo(0,y);await sleep(45)}
  window.scrollTo(0,0);await sleep(400);
});
const probe=await page.evaluate(()=>{
  const cyr=/[А-Яа-яЁё]/;
  const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
  const D=window.P120_EN_TRANSLATIONS;
  const rows=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let n;
  while((n=walker.nextNode())){
    const text=norm(n.nodeValue);
    if(!text||!cyr.test(text)) continue;
    const el=n.parentElement;
    if(!el) continue;
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden') continue;
    rows.push({
      text,
      mapped:!!D?.has?.(text),
      mapped_value:D?.get?.(text)||null,
      tag:el.tagName,
      cls:el.className||'',
      id:el.id||''
    });
  }
  const attrs=[];
  for(const el of document.querySelectorAll('[aria-label],[title],[placeholder]')){
    for(const a of ['aria-label','title','placeholder']){
      const text=norm(el.getAttribute(a));
      if(text&&cyr.test(text)) attrs.push({attr:a,text,mapped:!!D?.has?.(text),mapped_value:D?.get?.(text)||null,tag:el.tagName,cls:el.className||'',id:el.id||''});
    }
  }
  const unique=arr=>[...new Map(arr.map(x=>[`${x.text}|${x.tag}|${x.cls}|${x.id}`,x])).values()];
  return {lang:document.documentElement.lang,title:document.title,map_size:D?.size||0,text:unique(rows),attrs:unique(attrs)};
});
console.log(JSON.stringify(probe,null,2));
await browser.close();
