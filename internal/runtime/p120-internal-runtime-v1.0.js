/* P-120 Internal Controlled Runtime v1.0
   Protected package bytes are fetched only after Auth + RLS authorization.
   This runner does not score or interpret. It preserves the existing raw submission intake contract.
*/
(() => {
  'use strict';
  const cfg=window.P120_SUBMISSION_CONFIG||{};
  const sb=window.supabase.createClient(cfg.projectUrl,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const $=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  const sessionId=params.get('session');
  let appSession=null,resource=null,pkg=null,state=null,index=0;
  const setGate=(m,k='')=>{const e=$('gateStatus');e.textContent=m;e.className='status '+k;};
  const stableKey=()=>`p120_account_runtime_${sessionId}`;
  const participantId=()=>{
    const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes=new Uint8Array(6);crypto.getRandomValues(bytes);
    return 'P120-'+Array.from(bytes,b=>alphabet[b%alphabet.length]).join('');
  };
  const digest=async blob=>{
    const buf=await blob.arrayBuffer();const h=await crypto.subtle.digest('SHA-256',buf);
    return Array.from(new Uint8Array(h),b=>b.toString(16).padStart(2,'0')).join('');
  };
  const loadScript=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});
  const save=()=>{state.itemIndex=index;state.lastSavedAt=new Date().toISOString();localStorage.setItem(stableKey(),JSON.stringify(state));};

  function validatePackage(p){
    if(!p||p.schema!=='p120.internal.runtime-package.v1.0') throw new Error('package_schema_mismatch');
    if(p.resource_key!==resource.resource_key) throw new Error('resource_key_mismatch');
    if(p.release_version!==resource.release_version) throw new Error('release_version_mismatch');
    if(p.runtime_key!==resource.runtime_key) throw new Error('runtime_key_mismatch');
    if(!p.instrument||!Array.isArray(p.instrument.items)||!p.instrument.items.length) throw new Error('instrument_missing');
    const ids=p.instrument.items.map(i=>i.id);
    if(ids.some(id=>!id)||new Set(ids).size!==ids.length) throw new Error('item_id_integrity_failure');
    if(p.manifest?.item_count!=null&&Number(p.manifest.item_count)!==ids.length) throw new Error('item_count_mismatch');
  }

  async function bindParticipant(){
    const {error}=await sb.rpc('p120_attach_participant',{p_session_id:sessionId,p_participant_id:state.participantId});
    if(error) throw new Error('participant_bind_failed:'+error.message);
  }

  async function initialise(){
    if(!sessionId) throw new Error('session_parameter_missing');
    const {data:{session}}=await sb.auth.getSession(); if(!session?.user) throw new Error('authentication_required');
    const {data:s,error:se}=await sb.from('p120_assessment_sessions').select('*').eq('session_id',sessionId).maybeSingle(); if(se||!s) throw new Error('assessment_session_not_found'); appSession=s;
    const {data:r,error:re}=await sb.from('p120_resources').select('*').eq('resource_id',s.resource_id).maybeSingle(); if(re||!r) throw new Error('resource_not_found'); resource=r;
    if(!r.is_launchable||r.release_state==='DISABLED'||!r.storage_bucket||!r.storage_object_path||!r.content_sha256) throw new Error('resource_not_launchable');
    const {data:allowed,error:ae}=await sb.rpc('p120_can_access_resource',{p_resource_id:r.resource_id,p_required_level:'RUN'}); if(ae||allowed!==true) throw new Error('access_denied');
    setGate('Access verified. Downloading protected package…');
    const {data:blob,error:de}=await sb.storage.from(r.storage_bucket).download(r.storage_object_path); if(de||!blob) throw new Error('protected_package_download_denied');
    const hash=await digest(blob); if(hash!==r.content_sha256||hash!==s.content_sha256) throw new Error('sha256_authority_mismatch');
    pkg=JSON.parse(await blob.text()); validatePackage(pkg);
    window.P120_SESSION_KEY=stableKey(); window.P120_INSTRUMENT=pkg.instrument;
    const existing=JSON.parse(localStorage.getItem(stableKey())||'null');
    state=existing&&existing.participantId?existing:{participantId:participantId(),sessionLocale:s.locale,screen:'test',itemIndex:0,responses:{},adminModes:{},startedAt:new Date().toISOString(),consentAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()};
    index=Math.min(Number(state.itemIndex)||0,pkg.instrument.items.length);
    await bindParticipant();
    setGate(`PASS\nAuth: verified\nResource: ${r.resource_key}\nRelease: ${r.release_version}\nSHA-256: ${hash}`,'ok');
    await loadScript('../../p120-submission-intake-v1.0.js');
    installSubmissionBinding();
    setTimeout(startRunner,250);
  }

  function startRunner(){
    $('gate').classList.add('hidden');
    if(index>=pkg.instrument.items.length) return finish();
    $('runner').classList.remove('hidden');render();
  }

  function render(){
    const items=pkg.instrument.items,item=items[index],v=state.responses[item.id];
    $('counter').textContent=`${index+1} / ${items.length}`;$('progressFill').style.width=`${Math.round(index/items.length*100)}%`;
    const mod=(pkg.instrument.modules||[]).find(m=>m.id===item.module);$('moduleLabel').textContent=mod?.name||item.module||'P-120';
    $('sessionMeta').textContent=`${state.participantId} · ${appSession.run_type} · ${appSession.release_version||'—'}`;
    $('question').textContent=item.text||item.prompt||item.id;
    const compare=$('compare');
    if(item.optionA||item.optionB){compare.classList.remove('hidden');compare.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 18px"><div class="status"><b>A</b><br>${escapeHtml(item.optionA||'')}</div><div class="status"><b>B</b><br>${escapeHtml(item.optionB||'')}</div></div>`;}else compare.classList.add('hidden');
    const choices=Array.isArray(item.choices)?item.choices:[];
    $('choices').innerHTML=choices.map(c=>`<button class="choice ${String(v)===String(c.value)?'selected':''}" data-value="${escapeAttr(c.value)}">${escapeHtml(c.label??c.value)}</button>`).join('');
    $('choices').querySelectorAll('.choice').forEach(b=>b.onclick=()=>{state.responses[item.id]=b.dataset.value;save();render();});
    $('prev').disabled=index===0;$('next').disabled=state.responses[item.id]===undefined||state.responses[item.id]===null||state.responses[item.id]==='';
    $('next').textContent=index===items.length-1?'Завершить':'Далее';
  }
  const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escapeAttr=v=>escapeHtml(v).replace(/`/g,'&#96;');

  $('prev').onclick=()=>{if(index>0){index--;save();render();}};
  $('next').onclick=()=>{const item=pkg.instrument.items[index];if(state.responses[item.id]===undefined)return;if(index<pkg.instrument.items.length-1){index++;save();render();}else{index=pkg.instrument.items.length;save();finish();}};

  async function finish(){
    state.screen='results';state.itemIndex=pkg.instrument.items.length;state.lastSavedAt=new Date().toISOString();save();
    $('runner').classList.add('hidden');$('complete').classList.remove('hidden');$('completeStatus').textContent='Submitting pseudonymous raw response package…';
    if(window.P120SubmissionIntake?.submitNow){const result=await window.P120SubmissionIntake.submitNow();if(result?.status==='stored') await bindReceipt(result);}
  }

  function installSubmissionBinding(){
    window.addEventListener('p120:submission-stored',e=>bindReceipt(e.detail).catch(err=>{$('completeStatus').textContent='Submission stored, but account binding failed: '+err.message;}));
  }
  async function bindReceipt(receipt){
    if(!receipt?.participant_id||!receipt?.payload_sha256)return;
    const {error}=await sb.rpc('p120_bind_submission',{p_session_id:sessionId,p_participant_id:receipt.participant_id,p_payload_sha256:receipt.payload_sha256});
    if(error) throw error;
    $('completeStatus').textContent=`Stored and bound.\nParticipant ID: ${receipt.participant_id}\nSHA-256: ${receipt.payload_sha256}`;$('completeStatus').className='status ok';
  }

  $('back').onclick=()=>location.href='../';
  initialise().catch(err=>{console.error('[P120 internal runtime]',err);setGate('LAUNCH BLOCKED\n'+(err.message||String(err)),'danger');});
})();
