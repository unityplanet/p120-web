const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const base = process.env.P120_QA_BASE || 'http://127.0.0.1:8765/';
const out = path.join(process.cwd(),'qa-artifacts','founder-type-lab');
fs.mkdirSync(out,{recursive:true});

function assert(cond,msg){ if(!cond) throw new Error(msg); console.log('PASS',msg); }

(async()=>{
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});

  for(const mode of ['light','italic']){
    await page.goto(`${base}creator/?marginal=${mode}`,{waitUntil:'networkidle'});
    await page.waitForSelector('#fnd-09');
    await page.waitForTimeout(900);

    const rootMode = await page.evaluate(()=>document.documentElement.dataset.fndMarginal);
    assert(rootMode===mode,`${mode}: preview mode applied`);

    const notes = page.locator('.founder-story__marginal-note');
    assert(await notes.count()===3,`${mode}: exactly three marginal notes`);

    const styles = await notes.evaluateAll(els=>els.map(el=>{
      const c=getComputedStyle(el);
      return {fontFamily:c.fontFamily,fontWeight:c.fontWeight,fontStyle:c.fontStyle,fontSize:c.fontSize,lineHeight:c.lineHeight};
    }));
    styles.forEach((s,i)=>{
      assert(/IBM Plex Sans/i.test(s.fontFamily),`${mode}: note ${i+1} uses IBM Plex Sans`);
      assert(Number(s.fontWeight)<=300,`${mode}: note ${i+1} uses Light weight`);
      assert(s.fontStyle===(mode==='italic'?'italic':'normal'),`${mode}: note ${i+1} style is ${mode==='italic'?'italic':'normal'}`);
    });

    const width = await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
    assert(width.sw<=width.cw+1,`${mode}: no desktop horizontal overflow (${width.sw}/${width.cw})`);

    for(const [idx,scene] of [['01','#fnd-02'],['02','#fnd-06'],['03','#fnd-09']]){
      const loc=page.locator(scene);
      await loc.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      await loc.screenshot({path:path.join(out,`${mode}-note-${idx}.png`)});
    }
  }

  // Ensure default production view remains untouched.
  await page.goto(`${base}creator/`,{waitUntil:'networkidle'});
  await page.waitForSelector('#fnd-02');
  assert(await page.locator('.founder-story__marginal-note').count()===0,'default Founder page has no experimental marginal styling');
  assert(await page.locator('.founder-type-lab').count()===0,'default Founder page has no type-lab control');

  await browser.close();
  console.log('Founder marginal typography lab QA: PASS');
})().catch(e=>{console.error(e);process.exit(1)});
