import { chromium } from 'playwright';
import fs from 'fs';import path from 'path';
const base=process.env.P120_QA_BASE||'http://127.0.0.1:8765/';
const out=path.join(process.cwd(),'qa-artifacts','founder-shell-bilingual-v2');fs.mkdirSync(out,{recursive:true});
const assert=(c,m)=>{if(!c)throw new Error(m);console.log('PASS',m)};
const browser=await chromium.launch({headless:true});
const cases=[
  {lang:'ru',url:'creator/',trigger:'Исследовать',theme:'Музейная',north:'10 / Главный ориентир P-120',atlas:'семантическое поле координат / баллы не нанесены',note:'ЗАМЕТКА / 01',forbidden:['North Star','semantic coordinate field','no score plotted','NOTE /','Ivory','Graphite','Extended Research Set','Dyadic research layer']},
  {lang:'en',url:'en/creator/',trigger:'Explore',theme:'Museum',north:'10 / P-120 North Star',atlas:'semantic coordinate field / no score plotted',note:'NOTE / 01',forbidden:['ОЩУЩЕНИЕ','СЛОВО','НАБЛЮДЕНИЕ','ГИПОТЕЗА','ОСНОВАНИЕ','ЗАМЕТКА']}
];
try{
  for(const c of cases){
    for(const vp of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
      const page=await browser.newPage({viewport:{width:vp.width,height:vp.height}});
      await page.goto(base+c.url,{waitUntil:'networkidle'});await page.waitForSelector('#founder-story');
      await page.waitForFunction(()=>document.documentElement.dataset.founderShell==='v2');
      await page.waitForFunction(()=>document.querySelector('#founder-story')?.dataset.voInstalled==='1.1');
      await page.waitForSelector('.founder-story__marginal-note');await page.waitForTimeout(250);
      assert(await page.locator('[data-fnd-screen]').count()===12,`${c.lang}/${vp.name}: 12 Founder scenes`);
      assert(await page.locator('[data-founder-mega] .ecosystem-trigger').count()===1,`${c.lang}/${vp.name}: one Explore mega trigger`);
      assert((await page.locator('[data-founder-mega] .ecosystem-trigger').innerText()).trim()===c.trigger,`${c.lang}/${vp.name}: localized Explore trigger`);
      assert(await page.locator('.creator-explore[href*="start"]').count()===0,`${c.lang}/${vp.name}: no legacy direct-test Explore link`);
      const before=page.url();await page.locator('[data-founder-mega] .ecosystem-trigger').click();await page.waitForTimeout(120);
      assert(page.url()===before,`${c.lang}/${vp.name}: Explore click does not navigate`);
      assert(await page.locator('[data-founder-mega].is-open').count()===1,`${c.lang}/${vp.name}: mega panel opens`);
      assert(await page.locator('[data-founder-ecosystem]').count()===4,`${c.lang}/${vp.name}: mega panel has four ecosystem routes`);
      await page.keyboard.press('Escape');
      assert(await page.locator('.header-theme-menu').count()===1,`${c.lang}/${vp.name}: one compact theme dropdown`);
      assert(await page.locator('.creator-theme').count()===0,`${c.lang}/${vp.name}: old three theme buttons removed`);
      assert((await page.locator('.header-theme-menu summary').innerText()).includes(c.theme),`${c.lang}/${vp.name}: localized current theme label`);
      await page.locator('.header-theme-menu summary').click();await page.locator('[data-set-theme="graphite"]').click();
      assert(await page.locator('body').getAttribute('data-theme')==='graphite',`${c.lang}/${vp.name}: theme dropdown switches theme`);

      const north=(await page.locator('#fnd-10 .founder-story__eyebrow').textContent()||'').trim();
      assert(north===c.north,`${c.lang}/${vp.name}: localized North Star eyebrow`);
      const atlas=(await page.locator('.founder-vo__atlas-caption').textContent()||'').trim();
      assert(atlas===c.atlas,`${c.lang}/${vp.name}: localized atlas caption`);
      const noteBefore=await page.locator('.founder-story__marginal-note').first().evaluate(el=>getComputedStyle(el,'::before').content.replace(/^['"]|['"]$/g,''));
      assert(noteBefore===c.note,`${c.lang}/${vp.name}: localized marginal-note label`);

      const sourceText=await page.locator('body').textContent()||'';
      for(const bad of c.forbidden)assert(!sourceText.includes(bad),`${c.lang}/${vp.name}: forbidden visible/source token absent: ${bad}`);
      const prata=await page.locator('#fnd-06 .founder-story__reading > p:nth-child(3)').evaluate(el=>getComputedStyle(el).fontFamily);
      assert(prata.toLowerCase().includes('prata'),`${c.lang}/${vp.name}: Prata secondary serif preserved`);
      const display=await page.locator('#fnd-06 .founder-story__display--turn').evaluate(el=>getComputedStyle(el).fontFamily);
      assert(display.toLowerCase().includes('noto serif'),`${c.lang}/${vp.name}: Noto display preserved`);
      const note=await page.locator('.founder-story__marginal-note').first().evaluate(el=>{const s=getComputedStyle(el);return{s:s.fontStyle,w:s.fontWeight,f:s.fontFamily}});
      assert(note.s==='italic'&&String(note.w)==='300'&&note.f.toLowerCase().includes('ibm plex sans'),`${c.lang}/${vp.name}: Plex Light Italic marginal role preserved`);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      assert(overflow<=1,`${c.lang}/${vp.name}: no horizontal overflow`);
      await page.screenshot({path:path.join(out,`${c.lang}-${vp.name}.png`),fullPage:true});await page.close();
    }
  }
  console.log('Founder Shell Bilingual v2 QA: PASS');
} finally {await browser.close();}
