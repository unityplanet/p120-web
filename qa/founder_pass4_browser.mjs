import { chromium } from 'playwright';
import fs from 'node:fs';

const base=process.env.P120_QA_BASE || 'http://127.0.0.1:8765/';
const out='qa-artifacts/founder-pass4';
fs.mkdirSync(out,{recursive:true});

const viewports=[
  {name:'uhd',width:1920,height:1080},
  {name:'desktop',width:1440,height:900},
  {name:'tablet',width:1024,height:768},
  {name:'mobile',width:390,height:844},
];
const themes=['ivory','graphite','museum'];
const errors=[];
const assert=(ok,msg)=>{if(!ok){errors.push(msg);console.error('FAIL',msg)}else console.log('PASS',msg)};

const browser=await chromium.launch({headless:true});

// Main-page non-regression: Founder Story must not render into the home document.
{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(900);
  assert(await page.locator('#founder-story').count()===0,'main page contains no Founder Story block');
  assert(await page.locator('script[src*="founder-route-v1.1.js"]').count()===1,'main page loads route-only adapter');
  assert(await page.locator('script[src*="founder-editorial-story-v1.0.js"]').count()===0,'main page does not load full Founder Story runtime');
  const creator=page.locator('[data-ecosystem-route="creator"]').first();
  if(await creator.count()){
    await page.waitForTimeout(500);
    assert((await creator.getAttribute('aria-disabled'))===null,'desktop Creator navigation is active');
  }
  await page.screenshot({path:`${out}/home-regression-1440.png`,fullPage:false});
  await page.close();
}

for(const vp of viewports){
  for(const theme of themes){
    const page=await browser.newPage({viewport:{width:vp.width,height:vp.height}});
    await page.addInitScript(({theme})=>localStorage.setItem('p120_web_theme_v16',theme),{theme});
    await page.goto(`${base}creator/`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('#founder-story',{timeout:8000});
    await page.waitForTimeout(350);

    const scenes=await page.locator('[data-fnd-screen]').count();
    assert(scenes===12,`${vp.name}/${theme}: 12 Founder scenes render`);
    assert(await page.locator('#fnd-00').count()===1,`${vp.name}/${theme}: FND-00 present`);
    assert(await page.locator('#fnd-11').count()===1,`${vp.name}/${theme}: FND-11 present`);
    assert(await page.locator('.founder-story img, img[src*="founder"], img[alt*="создател" i]').count()===0,`${vp.name}/${theme}: no Founder portrait/image`);
    assert(await page.locator('meta[name="author"]').count()===0,`${vp.name}/${theme}: no author identity metadata`);
    assert(await page.locator('script[type="application/ld+json"]').count()===0,`${vp.name}/${theme}: no identity JSON-LD`);

    const bodyTheme=await page.locator('body').getAttribute('data-theme');
    assert(bodyTheme===theme,`${vp.name}/${theme}: theme persisted`);

    const dims=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight}));
    assert(dims.sw<=dims.cw+2,`${vp.name}/${theme}: no horizontal overflow (${dims.sw}/${dims.cw})`);
    assert(dims.sh>vp.height*3,`${vp.name}/${theme}: editorial story has expected vertical depth`);

    const first=await page.locator('#fnd-00').boundingBox();
    assert(!!first && first.width>vp.width*.85,`${vp.name}/${theme}: opening scene occupies editorial width`);

    const headline=page.locator('#founder-story-title');
    const headlineStyle=await headline.evaluate(el=>{const s=getComputedStyle(el);return {size:parseFloat(s.fontSize),color:s.color,display:s.display}});
    assert(headlineStyle.size>=38,`${vp.name}/${theme}: opening typography remains display-scale`);

    if(theme==='museum'){
      await page.screenshot({path:`${out}/creator-${vp.name}-museum-top.png`,fullPage:false});
      await page.locator('#fnd-05').scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
      await page.screenshot({path:`${out}/creator-${vp.name}-museum-insight.png`,fullPage:false});
      await page.locator('#fnd-11').scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
      await page.screenshot({path:`${out}/creator-${vp.name}-museum-close.png`,fullPage:false});
    }
    await page.close();
  }
}

await browser.close();
if(errors.length){
  console.error(`Founder PASS 4 browser regression FAILED: ${errors.length} issue(s)`);
  process.exit(1);
}
console.log('Founder PASS 4 browser regression: PASS');
