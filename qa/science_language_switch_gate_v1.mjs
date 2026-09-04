import { chromium } from 'playwright';

const ORIGIN='http://127.0.0.1:4179';
const cases=[
  {locale:'RU',path:'/science/',otherLang:'en',otherTarget:'/en/science/',currentLang:'ru'},
  {locale:'EN',path:'/en/science/',otherLang:'ru',otherTarget:'/science/',currentLang:'en'}
];
const viewports={desktop:{width:1440,height:1000},mobile:{width:390,height:844}};
const failures=[];
function check(id,pass,detail={}){if(!pass)failures.push({id,...detail});console.log(`${pass?'PASS':'FAIL'} ${id}`,detail);}

const browser=await chromium.launch({headless:true});
try{
  for(const c of cases){
    for(const [viewportName,viewport] of Object.entries(viewports)){
      const context=await browser.newContext({viewport});
      const page=await context.newPage();
      await page.goto(`${ORIGIN}${c.path}`,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>document.documentElement.dataset.p120ScientificBaseStatus==='pass'&&document.documentElement.dataset.p120ScienceLanguageSwitch==='canonical-single-owner',null,{timeout:12000});
      await page.waitForTimeout(180);
      const snapshot=await page.evaluate(()=>{
        const tools=document.querySelector('.topbar-tools');
        const nodes=tools?[...tools.querySelectorAll('.p120-language-switch, .p120-dedicated-science-lang')]:[];
        const canonical=tools?.querySelector('.p120-language-switch')||null;
        return {
          total:nodes.length,
          canonicalCount:nodes.filter(n=>n.classList.contains('p120-language-switch')).length,
          dedicatedOnly:nodes.filter(n=>n.classList.contains('p120-dedicated-science-lang')&&!n.classList.contains('p120-language-switch')).length,
          owner:document.documentElement.dataset.p120ScienceLanguageSwitch||null,
          ruHref:canonical?.querySelector('a[lang="ru"]')?.href||null,
          enHref:canonical?.querySelector('a[lang="en"]')?.href||null,
          ruCurrent:canonical?.querySelector('a[lang="ru"]')?.getAttribute('aria-current')||null,
          enCurrent:canonical?.querySelector('a[lang="en"]')?.getAttribute('aria-current')||null,
          mobileGroups:document.querySelectorAll('.p120-language-mobile-group').length
        };
      });
      const label=`${c.locale} ${viewportName}`;
      check(`${label}: exactly one desktop language switch`,snapshot.total===1,{snapshot});
      check(`${label}: canonical single owner`,snapshot.canonicalCount===1&&snapshot.dedicatedOnly===0&&snapshot.owner==='canonical-single-owner',{snapshot});
      const otherHref=c.otherLang==='en'?snapshot.enHref:snapshot.ruHref;
      let pathname=null;
      if(otherHref){try{pathname=new URL(otherHref).pathname}catch(_){}}
      check(`${label}: other-language route stays in Scientific Base`,Boolean(pathname?.endsWith(c.otherTarget)),{otherHref,pathname,target:c.otherTarget});
      const current=c.currentLang==='en'?snapshot.enCurrent:snapshot.ruCurrent;
      check(`${label}: current locale marked`,current==='page',{current});
      if(viewportName==='mobile')check(`${label}: exactly one mobile language group`,snapshot.mobileGroups===1,{mobileGroups:snapshot.mobileGroups});
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if(failures.length){console.error(JSON.stringify({status:'FAIL',failures},null,2));process.exit(1);}
console.log(JSON.stringify({status:'PASS',scope:'Scientific Base RU/EN single-owner language switch regression'},null,2));
