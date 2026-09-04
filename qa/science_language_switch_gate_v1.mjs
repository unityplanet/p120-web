import { chromium } from 'playwright';

const ORIGIN='http://127.0.0.1:4179';
const cases=[
  {locale:'RU',path:'/science/',otherLang:'en',otherTarget:'/en/science/',currentLang:'ru'},
  {locale:'EN',path:'/en/science/',otherLang:'ru',otherTarget:'/science/',currentLang:'en'}
];
const viewports={desktop1440:{width:1440,height:1000},desktop1920:{width:1920,height:1080}};
const failures=[];
function check(id,pass,detail={}){if(!pass)failures.push({id,...detail});console.log(`${pass?'PASS':'FAIL'} ${id}`,detail);}

const browser=await chromium.launch({headless:true});
try{
  for(const c of cases){
    for(const [viewportName,viewport] of Object.entries(viewports)){
      const context=await browser.newContext({viewport});
      const page=await context.newPage();
      await page.goto(`${ORIGIN}${c.path}`,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>document.documentElement.dataset.p120ScientificBaseStatus==='pass',null,{timeout:12000});
      await page.waitForFunction(()=>document.querySelectorAll('.topbar-tools .p120-language-switch, .topbar-tools .p120-dedicated-science-lang').length===1,null,{timeout:5000});
      await page.waitForTimeout(180);
      const snapshot=await page.evaluate(()=>{
        const tools=document.querySelector('.topbar-tools');
        const nodes=tools?[...tools.querySelectorAll('.p120-language-switch, .p120-dedicated-science-lang')]:[];
        const control=nodes[0]||null;
        return {
          total:nodes.length,
          className:control?.className||null,
          ruHref:control?.querySelector('a[lang="ru"]')?.href||null,
          enHref:control?.querySelector('a[lang="en"]')?.href||null,
          ruCurrent:control?.querySelector('a[lang="ru"]')?.getAttribute('aria-current')||null,
          enCurrent:control?.querySelector('a[lang="en"]')?.getAttribute('aria-current')||null,
          labels:control?[...control.querySelectorAll('a')].map(a=>(a.textContent||'').trim()):[]
        };
      });
      const label=`${c.locale} ${viewportName}`;
      check(`${label}: exactly one RU/EN control`,snapshot.total===1,{snapshot});
      check(`${label}: RU and EN options present`,snapshot.labels.includes('RU')&&snapshot.labels.includes('EN'),{labels:snapshot.labels});
      const otherHref=c.otherLang==='en'?snapshot.enHref:snapshot.ruHref;
      let pathname=null;
      if(otherHref){try{pathname=new URL(otherHref).pathname}catch(_){}}
      check(`${label}: other-language route stays in Scientific Base`,Boolean(pathname?.endsWith(c.otherTarget)),{otherHref,pathname,target:c.otherTarget});
      const current=c.currentLang==='en'?snapshot.enCurrent:snapshot.ruCurrent;
      check(`${label}: current locale marked`,current==='page',{current});
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if(failures.length){console.error(JSON.stringify({status:'FAIL',failures},null,2));process.exit(1);}
console.log(JSON.stringify({status:'PASS',scope:'Scientific Base RU/EN one-control desktop regression'},null,2));
