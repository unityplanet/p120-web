import { chromium } from 'playwright';
import fs from 'fs';
import crypto from 'crypto';

const out='pass4-artifacts/screenshots';
fs.mkdirSync(out,{recursive:true});
const report={pass:'FOUNDER-WEB PASS 4',commit:process.env.GITHUB_SHA,checks:[],viewports:{},privacy:{},regression:{},createdAt:new Date().toISOString()};
const assert=(cond,msg)=>{if(!cond)throw new Error(msg);report.checks.push(msg)};
const browser=await chromium.launch({headless:true});

async function pageFor(path,viewport,reducedMotion='no-preference'){
  const context=await browser.newContext({viewport,reducedMotion});
  const page=await context.newPage();
  await page.goto(`http://127.0.0.1:4173/${path}`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts?.ready);
  return {context,page};
}

try{
  // Regression baseline: layout before Founder insertion must remain unchanged.
  {
    const viewport={width:1440,height:1000};
    const base=await pageFor('qa-baseline.html',viewport);
    const cur=await pageFor('',viewport);
    const selectors=['.topbar','#why-important','#why-p120'];
    const metrics=async p=>p.evaluate(sel=>Object.fromEntries(sel.map(s=>{const e=document.querySelector(s);if(!e)return[s,null];const r=e.getBoundingClientRect();return[s,{x:r.x,y:r.y,w:r.width,h:r.height}]})),selectors);
    const a=await metrics(base.page),b=await metrics(cur.page);
    for(const s of selectors){
      assert(a[s]&&b[s],`Regression anchor exists: ${s}`);
      const delta=Math.max(...['x','y','w','h'].map(k=>Math.abs(a[s][k]-b[s][k])));
      assert(delta<=1.0,`Pre-Founder geometry unchanged <=1px: ${s}`);
    }
    await base.context.close();await cur.context.close();
    report.regression.preFounderGeometry='PASS';
  }

  // Main Founder contract and privacy audit.
  {
    const {context,page}=await pageFor('',{width:1440,height:1000});
    await page.waitForFunction(()=>window.P120_FOUNDER_STORY?.version==='1.0'&&window.P120_NAV_V2_ROUTES?.creator?.status==='active');
    const state=await page.evaluate(()=>{
      const root=document.querySelector('#founder-story');
      const html=root?.innerHTML||'';
      const ld=[...document.querySelectorAll('script[type="application/ld+json"]')].map(x=>x.textContent||'').join('\n');
      return{
        scenes:root?.querySelectorAll('[data-fnd-screen]').length||0,
        ids:[...root?.querySelectorAll('[data-fnd-screen]')||[]].map(x=>x.id),
        signature:(root?.textContent.match(/\bDi\b/g)||[]).length,
        identity:/Dmitry|Дмитрий|Chernyshev|Чернышев/i.test(html),
        media:root?.querySelectorAll('img,picture,video,canvas,svg').length||0,
        authorMeta:!!document.querySelector('meta[name="author"],meta[property="article:author"]'),
        personLD:/"@type"\s*:\s*"Person"/i.test(ld),
        creatorDisabled:document.querySelector('[data-ecosystem-route="creator"]')?.getAttribute('aria-disabled'),
        creatorStatus:document.querySelector('[data-ecosystem-route="creator"] .ecosystem-item-status')?.textContent||'',
        prev:root?.previousElementSibling?.id||''
      };
    });
    assert(state.scenes===12,'FND-00...FND-11 render as 12 scenes');
    assert(state.ids.join(',')==='fnd-00,fnd-01,fnd-02,fnd-03,fnd-04,fnd-05,fnd-06,fnd-07,fnd-08,fnd-09,fnd-10,fnd-11','Founder scene order is frozen');
    assert(state.signature===1,'Di appears exactly once in Founder story');
    assert(!state.identity,'No direct founder identity token in Founder DOM');
    assert(state.media===0,'No portrait/photo/vector media in Founder story launch');
    assert(!state.authorMeta,'No author identity metadata');
    assert(!state.personLD,'No Person JSON-LD identity disclosure');
    assert(state.creatorDisabled===null,'Creator navigation is active');
    assert(state.creatorStatus==='','Creator Coming badge removed');
    assert(state.prev==='why-p120','Founder story follows Why P-120 in home narrative');
    report.privacy={identityTokens:'PASS',portraitMedia:'PASS',authorMetadata:'PASS',personStructuredData:'PASS'};

    for(const theme of ['ivory','graphite','museum']){
      await page.evaluate(t=>{document.body.dataset.theme=t;localStorage.setItem('p120-theme',t)},theme);
      await page.waitForTimeout(120);
      const colors=await page.evaluate(()=>{const r=document.querySelector('#founder-story');const s=getComputedStyle(r);return{color:s.color,bg:getComputedStyle(document.body).backgroundColor}});
      assert(colors.color!=='rgba(0, 0, 0, 0)',`Theme ${theme}: Founder ink resolves`);
      await page.locator('#fnd-00').screenshot({path:`${out}/${theme}-desktop-fnd00.png`});
      await page.locator('#fnd-10').screenshot({path:`${out}/${theme}-desktop-fnd10.png`});
    }
    await page.evaluate(()=>{document.body.dataset.theme='museum'});
    for(const id of ['fnd-04','fnd-07','fnd-09','fnd-11'])await page.locator(`#${id}`).screenshot({path:`${out}/museum-desktop-${id}.png`});
    await context.close();
  }

  // Responsive layout.
  for(const vp of [{name:'mobile390',width:390,height:844},{name:'tablet768',width:768,height:1024},{name:'desktop1440',width:1440,height:1000},{name:'wide1920',width:1920,height:1080}]){
    const {context,page}=await pageFor('',{width:vp.width,height:vp.height});
    await page.waitForFunction(()=>window.P120_FOUNDER_STORY?.version==='1.0');
    await page.evaluate(()=>{document.body.dataset.theme='museum'});
    const layout=await page.evaluate(()=>{
      const root=document.querySelector('#founder-story');const vw=document.documentElement.clientWidth;
      const scenes=[...root.querySelectorAll('.founder-story__scene')].map(e=>{const r=e.getBoundingClientRect();return{id:e.id,left:r.left,right:r.right,width:r.width}});
      return{vw,rootScroll:root.scrollWidth,rootClient:root.clientWidth,scenes};
    });
    assert(layout.rootScroll<=layout.rootClient+2,`${vp.name}: no Founder horizontal overflow`);
    assert(layout.scenes.every(s=>s.left>=-1&&s.right<=layout.vw+1),`${vp.name}: scenes stay within viewport`);
    report.viewports[vp.name]='PASS';
    await page.locator('#fnd-00').screenshot({path:`${out}/${vp.name}-fnd00.png`});
    await page.locator('#fnd-10').screenshot({path:`${out}/${vp.name}-fnd10.png`});
    if(vp.name==='mobile390')await page.locator('#fnd-07').screenshot({path:`${out}/${vp.name}-fnd07.png`});
    await context.close();
  }

  // Reduced motion.
  {
    const {context,page}=await pageFor('',{width:390,height:844},'reduce');
    await page.waitForFunction(()=>window.P120_FOUNDER_STORY?.version==='1.0');
    const motion=await page.evaluate(()=>[...document.querySelectorAll('#founder-story .founder-story__reveal')].every(e=>{const s=getComputedStyle(e);return s.opacity==='1'&&s.transform==='none'}));
    assert(motion,'Reduced-motion renders all Founder content without reveal transforms');
    await context.close();
  }

  // CTA bindings.
  {
    const {context,page}=await pageFor('',{width:1280,height:900});
    await page.waitForFunction(()=>window.P120_FOUNDER_STORY?.version==='1.0');
    await page.locator('#fnd-09 [data-founder-route="science"]').click();
    await page.waitForSelector('#science-top',{timeout:5000});
    assert(true,'Founder to Scientific Base CTA works');
    await context.close();
  }
  {
    const {context,page}=await pageFor('',{width:1280,height:900});
    await page.waitForFunction(()=>window.P120_FOUNDER_STORY?.version==='1.0');
    await page.locator('#fnd-11 [data-founder-route="self"]').click();
    await page.waitForSelector('.preflight',{timeout:5000});
    assert(true,'Founder to self research CTA opens preflight');
    await context.close();
  }

  // EN remains reserved / untouched.
  {
    const {context,page}=await pageFor('en/',{width:1280,height:900});
    await page.waitForSelector('.topnav');
    await page.waitForTimeout(300);
    const en=await page.evaluate(()=>({story:!!document.querySelector('#founder-story'),creatorDisabled:document.querySelector('[data-ecosystem-route="creator"]')?.getAttribute('aria-disabled'),status:document.querySelector('[data-ecosystem-route="creator"] .ecosystem-item-status')?.textContent||''}));
    assert(!en.story,'EN: Founder Story not injected before controlled translation');
    assert(en.creatorDisabled==='true','EN: creator route remains reserved');
    assert(/Coming/i.test(en.status),'EN: Coming status preserved');
    await context.close();
  }

  report.status='PASS';
  report.screenshotCount=fs.readdirSync(out).filter(x=>x.endsWith('.png')).length;
  report.assetHashes={css:crypto.createHash('sha256').update(fs.readFileSync('founder-editorial-story-v1.0.css')).digest('hex'),js:crypto.createHash('sha256').update(fs.readFileSync('founder-editorial-story-v1.0.js')).digest('hex')};
  fs.writeFileSync('pass4-artifacts/PASS4_REPORT.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}finally{
  await browser.close();
}
