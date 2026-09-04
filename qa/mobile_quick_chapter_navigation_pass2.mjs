import {chromium} from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE=process.env.P120_QA_BASE||'http://127.0.0.1:4173';
const widths=[360,390,430,480];
const themes=['ivory','graphite','museum'];
const locales=[
  {id:'RU',route:'/',labels:['Архитектура','Две системы','Результат','Ещё глубже','Наука']},
  {id:'EN',route:'/en/',labels:['Architecture','Two systems','Result','Go deeper','Science']}
];
const failures=[];
const report=[];
const artifactDir=path.resolve('qa-artifacts/mobile-quick-chapters-pass2');
fs.mkdirSync(artifactDir,{recursive:true});
const check=(ok,msg)=>{report.push(`${ok?'PASS':'FAIL'} ${msg}`);if(!ok)failures.push(msg);};

const browser=await chromium.launch({headless:true});

for(const locale of locales){
  for(const width of widths){
    for(const theme of themes){
      const page=await browser.newPage({viewport:{width,height:900}});
      const errors=[];
      page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
      page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`);});
      const url=BASE+locale.route;
      const response=await page.goto(url,{waitUntil:'networkidle'});
      await page.waitForTimeout(550);
      check(response?.ok()===true,`${locale.id} ${width} ${theme}: route HTTP OK`);

      await page.evaluate(t=>{document.body.dataset.theme=t;},theme);
      await page.waitForTimeout(80);

      const version=await page.evaluate(()=>window.P120_CHAPTER_SCROLL_TRACE?.version||null);
      check(version==='1.6.0',`${locale.id} ${width} ${theme}: chapter runtime v1.6.0 active`);
      check(await page.locator('#p120-mobile-quick-chapters').count()===1,`${locale.id} ${width} ${theme}: one quick chapter owner`);
      check(await page.locator('.mobile-bottom-nav > button').count()===4,`${locale.id} ${width} ${theme}: bottom navigation remains four buttons`);
      check(await page.locator('[data-mobile-menu]').count()===1,`${locale.id} ${width} ${theme}: hamburger remains present`);

      const topVisible=await page.locator('#p120-mobile-quick-chapters').isVisible().catch(()=>false);
      check(!topVisible,`${locale.id} ${width} ${theme}: opening editorial scene remains uninterrupted`);

      await page.locator('#two-systems').scrollIntoViewIfNeeded();
      await page.waitForTimeout(220);
      const quick=page.locator('#p120-mobile-quick-chapters');
      check(await quick.isVisible(),`${locale.id} ${width} ${theme}: quick chapter bubble appears after meaningful scroll`);

      const trigger=page.locator('[data-chapter-quick-trigger]');
      const triggerBox=await trigger.boundingBox();
      check(!!triggerBox&&triggerBox.height>=44,`${locale.id} ${width} ${theme}: quick trigger has >=44px touch height`);
      check(await trigger.getAttribute('aria-controls')==='p120-mobile-quick-chapters-panel',`${locale.id} ${width} ${theme}: trigger owns panel via aria-controls`);
      check(await trigger.getAttribute('aria-expanded')==='false',`${locale.id} ${width} ${theme}: trigger starts collapsed`);

      await trigger.click();
      await page.waitForTimeout(100);
      check(await trigger.getAttribute('aria-expanded')==='true',`${locale.id} ${width} ${theme}: quick picker expands`);
      check(await page.locator('#p120-mobile-quick-chapters-panel').isVisible(),`${locale.id} ${width} ${theme}: quick picker visible`);
      check(await page.locator('[data-chapter-quick]').count()===5,`${locale.id} ${width} ${theme}: five canonical chapter choices`);
      const quickLabels=(await page.locator('[data-chapter-quick]').allTextContents()).map(x=>x.replace(/^\s*\d+\s*/,'').trim());
      for(const label of locale.labels)check(quickLabels.some(x=>x.includes(label)),`${locale.id} ${width} ${theme}: localized quick label ${label}`);
      check(await page.locator('[data-chapter-quick][aria-current="location"]').count()===1,`${locale.id} ${width} ${theme}: exactly one quick current chapter`);

      await page.locator('[data-chapter-quick="result"]').click();
      await page.waitForTimeout(850);
      check(await trigger.getAttribute('aria-expanded')==='false',`${locale.id} ${width} ${theme}: selection closes picker`);
      check(await page.locator('[data-chapter-quick="result"][aria-current="location"]').count()===1,`${locale.id} ${width} ${theme}: quick active state follows selected chapter`);
      const targetTop=await page.locator('#showcase').evaluate(el=>el.getBoundingClientRect().top);
      check(targetTop>=0&&targetTop<260,`${locale.id} ${width} ${theme}: selected chapter uses canonical scroll owner`);

      const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth);
      check(overflow<=1,`${locale.id} ${width} ${theme}: no horizontal overflow`);

      await page.locator('[data-mobile-menu]').click();
      await page.waitForTimeout(120);
      check(await page.locator('body.mobile-menu-open').count()===1,`${locale.id} ${width} ${theme}: hamburger drawer still opens`);
      check(!(await quick.isVisible()),`${locale.id} ${width} ${theme}: quick bubble yields to hamburger drawer`);
      check(await page.locator('[data-p120-chapter-mobile]').count()===1,`${locale.id} ${width} ${theme}: existing drawer chapter group preserved`);
      check(await page.locator('[data-p120-chapter-mobile] [data-chapter-mobile]').count()===5,`${locale.id} ${width} ${theme}: drawer retains five chapter actions`);

      check(errors.length===0,`${locale.id} ${width} ${theme}: no console/page errors${errors.length?` (${errors.join(' | ')})`:''}`);
      await page.screenshot({path:path.join(artifactDir,`${locale.id.toLowerCase()}-${width}-${theme}.png`),fullPage:false});
      await page.close();
    }
  }
}

for(const locale of locales){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(BASE+locale.route,{waitUntil:'networkidle'});await page.waitForTimeout(400);
  check(await page.locator('#p120-mobile-quick-chapters').count()===0,`${locale.id} desktop: mobile quick owner absent`);
  await page.locator('#two-systems').scrollIntoViewIfNeeded();await page.waitForTimeout(160);
  check(await page.locator('#p120-chapter-navigation').isVisible(),`${locale.id} desktop: existing desktop chapter navigator preserved`);
  await page.close();
}

await browser.close();
const summary=[
  '# P-120 WEB — PATCH 1 / PASS 2 — MOBILE QUICK CHAPTER NAVIGATION QA',
  '',
  `STATUS: ${failures.length?'FAIL':'PASS'}`,
  `MOBILE CASES: ${locales.length*widths.length*themes.length}`,
  `DESKTOP PRESERVATION CASES: ${locales.length}`,
  `FAILURES: ${failures.length}`,
  '',
  ...report,
  ...(failures.length?['','## Failures',...failures]:[])
].join('\n')+'\n';
fs.writeFileSync(path.join(artifactDir,'PASS2_QA_REPORT.md'),summary);
console.log(summary);
if(failures.length)process.exit(1);
