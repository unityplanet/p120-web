/* P-120 Founder Visual Objects v1.0
   Decorative/semantic visual-object runtime for /creator/.
   Does not alter Founder copy, identity policy, assessment, scoring or science logic. */
(() => {
  'use strict';
  if(!/\/creator\/(?:index\.html)?$/i.test(location.pathname)) return;

  const ROOT_ID='founder-story';
  const VERSION='1.0';
  const sceneStages={
    'fnd-00':'origin','fnd-01':'question','fnd-02':'observation','fnd-03':'distance',
    'fnd-04':'specimens','fnd-05':'insight','fnd-06':'threshold','fnd-07':'atlas',
    'fnd-08':'doctrine','fnd-09':'evidence','fnd-10':'north','fnd-11':'signature'
  };
  const threadScenes=new Set(['fnd-00','fnd-01','fnd-05','fnd-06','fnd-10']);

  function el(tag,cls,attrs={}){
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));
    return node;
  }

  function addIndex(scene,idx){
    if(scene.querySelector('.founder-vo__index'))return;
    const mark=el('div','founder-vo__index',{'aria-hidden':'true'});
    mark.textContent=`FND / ${String(idx).padStart(2,'0')}`;
    scene.appendChild(mark);
  }

  function addThread(scene){
    if(scene.querySelector('.founder-vo__thread'))return;
    const box=el('div','founder-vo__thread',{'aria-hidden':'true'});
    box.innerHTML=`<svg viewBox="0 0 420 560" focusable="false" aria-hidden="true">
      <path d="M72 34 C 132 94, 64 158, 142 220 S 282 302, 224 382 S 246 486, 354 520" />
      <circle cx="72" cy="34" r="5" data-solid="1" />
      <circle cx="142" cy="220" r="5" />
      <circle cx="224" cy="382" r="5" />
      <circle cx="354" cy="520" r="5" data-solid="1" />
    </svg>`;
    scene.appendChild(box);
  }

  function addDistance(scene){
    if(scene.querySelector('.founder-vo__distance'))return;
    const box=el('div','founder-vo__distance',{'aria-hidden':'true'});
    box.innerHTML='<span>ОЩУЩЕНИЕ</span><div class="founder-vo__distance-line"><i></i></div><span>СЛОВО</span>';
    scene.querySelector('.founder-story__inner')?.appendChild(box);
  }

  function addAtlas(scene){
    const field=scene.querySelector('.founder-story__coordinate-field');
    if(!field||field.querySelector('.founder-vo__atlas'))return;
    const atlas=el('div','founder-vo__atlas',{'aria-hidden':'true'});
    atlas.innerHTML=`
      <i class="founder-vo__atlas-ring"></i><i class="founder-vo__atlas-ring"></i><i class="founder-vo__atlas-ring"></i><i class="founder-vo__atlas-ring"></i>
      <i class="founder-vo__atlas-axis"></i><i class="founder-vo__atlas-axis"></i><i class="founder-vo__atlas-axis"></i><i class="founder-vo__atlas-axis"></i><i class="founder-vo__atlas-axis"></i><i class="founder-vo__atlas-axis"></i>
      <i class="founder-vo__atlas-center"></i><span class="founder-vo__atlas-caption">semantic coordinate field / no score plotted</span>`;
    field.appendChild(atlas);
  }

  function addEvidence(scene){
    const inner=scene.querySelector('.founder-story__inner');
    if(!inner||inner.querySelector('.founder-vo__evidence'))return;
    const chain=el('div','founder-vo__evidence',{'aria-hidden':'true'});
    ['НАБЛЮДЕНИЕ','ГИПОТЕЗА','КОНСТРУКТ','ИЗМЕРЕНИЕ','ОСНОВАНИЕ'].forEach(label=>{
      const item=el('div','founder-vo__evidence-step');
      item.innerHTML=`<span>${label}</span>`;
      chain.appendChild(item);
    });
    inner.appendChild(chain);
  }

  function addNorth(scene){
    if(scene.querySelector('.founder-vo__north-mark'))return;
    scene.appendChild(el('div','founder-vo__north-mark',{'aria-hidden':'true'}));
  }

  function observe(root){
    if(!('IntersectionObserver' in window)){
      root.querySelectorAll('[data-vo-stage]').forEach(s=>s.dataset.voVisible='1');
      return;
    }
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting)entry.target.dataset.voVisible='1'});
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    root.querySelectorAll('[data-vo-stage]').forEach(s=>io.observe(s));
  }

  function install(){
    const root=document.getElementById(ROOT_ID);
    if(!root||root.dataset.voInstalled===VERSION)return false;
    root.classList.add('founder-story--vo-v1');
    root.dataset.voInstalled=VERSION;

    [...root.querySelectorAll('[data-fnd-screen]')].forEach((scene,idx)=>{
      const id=scene.id;
      scene.dataset.voStage=sceneStages[id]||'editorial';
      addIndex(scene,idx);
      if(threadScenes.has(id))addThread(scene);
    });
    addDistance(document.getElementById('fnd-03'));
    addAtlas(document.getElementById('fnd-07'));
    addEvidence(document.getElementById('fnd-09'));
    addNorth(document.getElementById('fnd-10'));
    observe(root);

    window.P120_FOUNDER_VISUAL_OBJECTS={version:VERSION,root:'#founder-story',profileAsset:false,portraitAsset:false,typography:{literary:'Noto Serif',display:'Noto Serif Display',technical:'IBM Plex Sans',mono:'IBM Plex Mono'}};
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{
    tries+=1;
    if(install()||tries>80)clearInterval(timer);
  },50);
  if(document.readyState!=='loading')install();
  else document.addEventListener('DOMContentLoaded',install,{once:true});
})();
