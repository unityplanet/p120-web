import { chromium } from 'playwright';
import fs from 'node:fs';

const base=process.env.P120_QA_BASE || 'http://127.0.0.1:8765/';
const out='qa-artifacts/founder-pass6';
fs.mkdirSync(out,{recursive:true});
const viewports=[
  {name:'uhd',width:1920,height:1080},
  {name:'desktop',width:1440,height:900},
  {name:'tablet',width:1024,height:768},
  {name:'mobile',width:390,height:844},
];
const themes=['ivory','graphite','museum'];
const errors=[];
const assert=(ok,msg)=>{if(ok)console.log('PASS',msg);else{console.error('FAIL',msg);errors.push(msg)}};
const browser=await chromium.launch({headless:true});

// Main-page regression boundary: PASS 6 assets are creator-only.
{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(700);
  assert(await page.locator('link[href*="founder-visual-objects-v1.0.css"]').count()===0,'main page does not load PASS 6 visual CSS');
  assert(await page.locator('script[src*="founder-visual-objects-v1.0.js"]').count()===0,'main page does not load PASS 6 visual JS');
  assert(await page.locator('#founder-story').count()===0,'main page still contains no long Founder Story');
  await page.screenshot({path:`${out}/home-regression-1440.png`,fullPage:false});
  await page.close();
}

for(const vp of viewports){
  for(const theme of themes){
    const page=await browser.newPage({viewport:{width:vp.width,height:vp.height}});
    await page.addInitScript(({theme})=>localStorage.setItem('p120_web_theme_v16',theme),{theme});
    await page.goto(`${base}creator/`,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('#founder-story.founder-story--vo-v1',{timeout:10000});
    await page.waitForTimeout(700);

    assert(await page.locator('link[href*="founder-visual-objects-v1.0.css"]').count()===1,`${vp.name}/${theme}: PASS 6 CSS loaded exactly once`);
    assert(await page.locator('script[src*="founder-visual-objects-v1.0.js"]').count()===1,`${vp.name}/${theme}: PASS 6 JS loaded exactly once`);
    assert(await page.locator('[data-fnd-screen]').count()===12,`${vp.name}/${theme}: FND-00…FND-11 remain intact`);
    assert(await page.locator('.founder-vo__index').count()===12,`${vp.name}/${theme}: 12 research index marks`);
    assert(await page.locator('.founder-vo__thread').count()===5,`${vp.name}/${theme}: origin thread family installed`);
    assert(await page.locator('.founder-vo__distance').count()===1,`${vp.name}/${theme}: distance field installed`);
    assert(await page.locator('.founder-vo__atlas').count()===1,`${vp.name}/${theme}: coordinate atlas installed`);
    assert(await page.locator('.founder-vo__evidence-step').count()===5,`${vp.name}/${theme}: evidence threshold has 5 steps`);
    assert(await page.locator('.founder-vo__north-mark').count()===1,`${vp.name}/${theme}: North Star mark installed`);

    const runtime=await page.evaluate(()=>window.P120_FOUNDER_VISUAL_OBJECTS||null);
    assert(runtime?.version==='1.0',`${vp.name}/${theme}: visual runtime version 1.0`);
    assert(runtime?.profileAsset===false && runtime?.portraitAsset===false,`${vp.name}/${theme}: no portrait/profile asset declared`);
    assert(await page.locator('.founder-story img, img[src*="founder"], img[alt*="создател" i]').count()===0,`${vp.name}/${theme}: no Founder portrait/image`);
    assert(await page.locator('meta[name="author"]').count()===0,`${vp.name}/${theme}: no author metadata`);
    assert(await page.locator('script[type="application/ld+json"]').count()===0,`${vp.name}/${theme}: no identity JSON-LD`);

    const bodyTheme=await page.locator('body').getAttribute('data-theme');
    assert(bodyTheme===theme,`${vp.name}/${theme}: theme persistence`);
    const dims=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight}));
    assert(dims.sw<=dims.cw+2,`${vp.name}/${theme}: no horizontal overflow (${dims.sw}/${dims.cw})`);
    assert(dims.sh>vp.height*3,`${vp.name}/${theme}: editorial depth preserved`);

    const type=await page.evaluate(()=>{
      const eyebrow=document.querySelector('.founder-story__eyebrow');
      const mono=document.querySelector('.founder-story__coordinate-labels');
      const body=document.querySelector('.founder-story__reading');
      return {
        tech:getComputedStyle(eyebrow).fontFamily,
        mono:getComputedStyle(mono).fontFamily,
        literary:getComputedStyle(body).fontFamily,
      };
    });
    assert(type.tech.includes('IBM Plex Sans'),`${vp.name}/${theme}: IBM Plex Sans technical layer`);
    assert(type.mono.includes('IBM Plex Mono'),`${vp.name}/${theme}: IBM Plex Mono coordinate layer`);
    assert(type.literary.includes('Noto Serif'),`${vp.name}/${theme}: Noto Serif literary layer preserved`);

    if(theme==='museum'){
      await page.waitForTimeout(550);
      await page.screenshot({path:`${out}/creator-${vp.name}-museum-top.png`,fullPage:false});
      for(const [id,label] of [['fnd-03','distance'],['fnd-07','atlas'],['fnd-09','evidence'],['fnd-10','north'],['fnd-11','close']]){
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(700);
        await page.screenshot({path:`${out}/creator-${vp.name}-museum-${label}.png`,fullPage:false});
      }
    }
    if(vp.name==='desktop'){
      await page.locator('#fnd-07').scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      await page.screenshot({path:`${out}/creator-desktop-${theme}-atlas.png`,fullPage:false});
    }
    await page.close();
  }
}

// Reduced motion contract.
{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(`${base}creator/`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#founder-story.founder-story--vo-v1',{timeout:10000});
  const motion=await page.locator('.founder-vo__north-mark').evaluate(el=>({opacity:getComputedStyle(el).opacity,duration:getComputedStyle(el).transitionDuration}));
  assert(parseFloat(motion.opacity)>0,'reduced motion: decorative objects remain visible');
  assert(motion.duration==='0s','reduced motion: PASS 6 transitions disabled');
  await page.close();
}

await browser.close();
if(errors.length){
  console.error(`Founder PASS 6 FAILED: ${errors.length} issue(s)`);
  process.exit(1);
}
console.log('Founder PASS 6 cross-theme responsive regression: PASS');
