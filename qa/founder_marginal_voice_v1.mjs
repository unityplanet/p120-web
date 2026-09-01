import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base=process.env.P120_QA_BASE||'http://127.0.0.1:8765/';
const out=path.join(process.cwd(),'qa-artifacts','founder-marginal-voice-v1');
fs.mkdirSync(out,{recursive:true});
const assert=(cond,msg)=>{if(!cond)throw new Error(msg);console.log('PASS',msg)};

const targets=[
  ['01','#fnd-02 .founder-story__reading > p:last-child'],
  ['02','#fnd-06 .founder-story__reading > p:nth-child(2)'],
  ['03','#fnd-09 .founder-story__boundary-copy > p:nth-child(3)']
];

const browser=await chromium.launch({headless:true});
try{
  for(const vp of [{name:'desktop',width:1440,height:1100},{name:'mobile',width:390,height:844}]){
    const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1});
    for(const theme of ['museum','ivory','graphite']){
      await page.goto(`${base}creator/`,{waitUntil:'networkidle'});
      await page.waitForSelector('#fnd-09');
      await page.evaluate(()=>document.fonts?.ready);
      await page.click(`[data-set-theme="${theme}"]`);
      await page.waitForTimeout(250);

      const notes=page.locator('.founder-story__marginal-note');
      assert(await notes.count()===3,`${vp.name}/${theme}: exactly three marginal notes`);
      assert(await page.locator('.founder-type-lab').count()===0,`${vp.name}/${theme}: no experimental type-lab control`);

      for(const [idx,selector] of targets){
        const loc=page.locator(selector);
        assert(await loc.count()===1,`${vp.name}/${theme}: NOTE ${idx} target exists`);
        assert(await loc.evaluate(el=>el.classList.contains('founder-story__marginal-note')),`${vp.name}/${theme}: NOTE ${idx} marked`);
        assert(await loc.getAttribute('data-note-index')===idx,`${vp.name}/${theme}: NOTE ${idx} index preserved`);
        const st=await loc.evaluate(el=>{const c=getComputedStyle(el);const p=getComputedStyle(el,'::before');return{family:c.fontFamily,weight:c.fontWeight,style:c.fontStyle,pseudoFamily:p.fontFamily,pseudoStyle:p.fontStyle}});
        assert(/IBM Plex Sans/i.test(st.family),`${vp.name}/${theme}: NOTE ${idx} uses IBM Plex Sans`);
        assert(Number(st.weight)===300,`${vp.name}/${theme}: NOTE ${idx} uses Light 300`);
        assert(st.style==='italic',`${vp.name}/${theme}: NOTE ${idx} uses true italic style`);
        assert(/IBM Plex Sans/i.test(st.pseudoFamily),`${vp.name}/${theme}: NOTE ${idx} label uses Plex Sans`);
        assert(st.pseudoStyle==='normal',`${vp.name}/${theme}: NOTE ${idx} label remains roman`);
      }

      const roles=await page.evaluate(()=>{
        const story=document.querySelector('.founder-story');
        const reading=document.querySelector('#fnd-02 .founder-story__reading');
        const eyebrow=document.querySelector('#fnd-02 .founder-story__eyebrow');
        return {
          declaredReading:getComputedStyle(story).getPropertyValue('--fnd-reading'),
          readingFamily:getComputedStyle(reading).fontFamily,
          functionalFamily:getComputedStyle(eyebrow).fontFamily
        };
      });
      assert(/Noto Serif/i.test(roles.declaredReading)||/Noto Serif/i.test(roles.readingFamily),`${vp.name}/${theme}: Noto narrative role preserved`);
      assert(/IBM Plex Sans/i.test(roles.functionalFamily),`${vp.name}/${theme}: Plex functional role preserved`);

      const geom=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
      assert(geom.sw<=geom.cw+1,`${vp.name}/${theme}: no horizontal overflow (${geom.sw}/${geom.cw})`);

      if(theme==='museum'){
        for(const [idx,selector] of targets){
          const loc=page.locator(selector);
          await loc.scrollIntoViewIfNeeded();
          await page.waitForTimeout(180);
          await loc.screenshot({path:path.join(out,`${vp.name}-museum-note-${idx}.png`)});
        }
      }
    }
    await page.close();
  }

  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(`${base}creator/?marginal=light`,{waitUntil:'networkidle'});
  await page.waitForSelector('.founder-story__marginal-note');
  assert(await page.locator('.founder-story__marginal-note').first().evaluate(el=>getComputedStyle(el).fontStyle)==='italic','legacy marginal query cannot revert frozen Italic role');
  const assets=await page.locator('link[rel="stylesheet"],script[src]').evaluateAll(els=>els.map(e=>e.getAttribute('href')||e.getAttribute('src')||''));
  assert(assets.some(x=>x.includes('founder-marginal-voice-v1.0')),'production marginal voice asset is loaded');
  assert(!assets.some(x=>x.includes('founder-marginal-typography-lab')),'experimental lab assets are not loaded');
  const fontLink=await page.locator('link[href*="fonts.bunny.net/css"]').first().getAttribute('href');
  assert(fontLink?.includes('300i'),'true IBM Plex Sans Light Italic font is requested');
  await page.close();

  console.log('Founder Marginal Voice v1 production QA: PASS');
} finally {
  await browser.close();
}
