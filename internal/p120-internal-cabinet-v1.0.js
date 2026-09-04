/* P-120 Internal Cabinet v1.0
   PASS 1C control plane. No measurement/scoring/respondent-item authority lives here.
*/
(() => {
  'use strict';
  const cfg = window.P120_SUBMISSION_CONFIG || {};
  if (!window.supabase || !cfg.projectUrl || !cfg.publishableKey) throw new Error('P120 internal config unavailable');
  const sb = window.supabase.createClient(cfg.projectUrl, cfg.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const $ = id => document.getElementById(id);
  const loginView=$('loginView'), cabinetView=$('cabinetView'), authBadge=$('authBadge'), signOut=$('signOut');
  let currentUser=null, currentProfile=null;
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const status = (id,msg,kind='') => { const el=$(id); el.textContent=msg; el.classList.remove('hidden'); el.className='status '+kind; };
  const hideStatus = id => $(id).classList.add('hidden');
  const dt = v => v ? new Date(v).toLocaleString() : '—';
  const short = v => v ? String(v).slice(0,8)+'…' : '—';

  async function sendLink(){
    hideStatus('loginStatus');
    const email=$('email').value.trim();
    if(!email) return status('loginStatus','Введите email.','warn');
    const redirect = new URL('./', location.href).href;
    const {error}=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:redirect}});
    if(error) return status('loginStatus','Вход не разрешён или Magic Link не отправлен: '+error.message,'danger');
    status('loginStatus','Magic Link отправлен. Откройте письмо на этом устройстве.','ok');
  }

  async function loadProfile(){
    const {data,error}=await sb.from('p120_profiles').select('*').eq('user_id',currentUser.id).maybeSingle();
    if(error) throw error;
    currentProfile=data;
  }

  function table(headers,rows){
    if(!rows.length) return '<p class="muted">Нет записей.</p>';
    return `<div style="overflow:auto"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  }

  async function loadResources(){
    const {data,error}=await sb.from('p120_resources').select('*').order('created_at',{ascending:false});
    if(error) throw error;
    $('resources').innerHTML=table(['Resource','State','Version','Runtime','Launch'],(data||[]).map(r=>{
      const controls=currentProfile.role==='FOUNDER_ADMIN' ? `<select data-state="${r.resource_id}">${['PUBLIC','INTERNAL_ALPHA','PILOT','DISABLED'].map(s=>`<option ${s===r.release_state?'selected':''}>${s}</option>`).join('')}</select>` : `<span class="badge">${esc(r.release_state)}</span>`;
      const launch=r.is_launchable ? `<button data-launch="${r.resource_id}">Launch</button>` : `<span class="badge warn">HOLD</span>`;
      return `<tr><td><b>${esc(r.title)}</b><div class="mono">${esc(r.resource_key)}<br>${esc(r.resource_id)}</div></td><td>${controls}</td><td>${esc(r.release_version||'—')}</td><td class="mono">${esc(r.runtime_key||'—')}</td><td>${launch}</td></tr>`;
    }));
    $('resources').querySelectorAll('[data-state]').forEach(el=>el.addEventListener('change',()=>setResourceState(el.dataset.state,el.value)));
    $('resources').querySelectorAll('[data-launch]').forEach(el=>el.addEventListener('click',()=>launchResource(el.dataset.launch)));
  }

  async function setResourceState(id,stateValue){
    const reason=prompt('Reason for resource state change:')||'Founder cabinet state change';
    const {error}=await sb.rpc('p120_admin_set_resource_state',{p_resource_id:id,p_new_state:stateValue,p_reason:reason});
    if(error){status('cabinetStatus','Resource state change failed: '+error.message,'danger'); return loadResources();}
    status('cabinetStatus','Resource state updated and audited.','ok');
    await Promise.all([loadResources(),loadAudit()]);
  }

  async function launchResource(id){
    const locale=document.documentElement.lang==='en'?'en':'ru';
    const {data,error}=await sb.rpc('p120_create_assessment_session',{p_resource_id:id,p_locale:locale,p_environment:'PRODUCTION',p_link_mode:'NEW',p_access_group_id:null});
    if(error) return status('cabinetStatus','Launch blocked: '+error.message,'danger');
    const session=Array.isArray(data)?data[0]:data;
    location.href=`./runtime/?session=${encodeURIComponent(session.session_id)}`;
  }

  async function loadSessions(){
    const {data,error}=await sb.from('p120_assessment_sessions').select('session_id,participant_id,run_type,release_version,status,created_at,started_at,submitted_at,resource_id').order('created_at',{ascending:false}).limit(50);
    if(error) throw error;
    $('sessions').innerHTML=table(['Session','Participant','Run','Release','Status','Started','Submitted'],(data||[]).map(s=>`<tr><td class="mono">${esc(s.session_id)}</td><td class="mono">${esc(s.participant_id||'—')}</td><td>${esc(s.run_type)}</td><td>${esc(s.release_version||'—')}</td><td><span class="badge">${esc(s.status)}</span></td><td>${dt(s.started_at||s.created_at)}</td><td>${dt(s.submitted_at)}</td></tr>`));
  }

  async function loadProfiles(){
    if(currentProfile.role!=='FOUNDER_ADMIN') return;
    const {data,error}=await sb.from('p120_profiles').select('*').order('created_at',{ascending:true});
    if(error) throw error;
    $('profiles').innerHTML=table(['Email / UUID','Role','Status','Apply'],(data||[]).map(p=>`<tr><td>${esc(p.login_email||'—')}<div class="mono">${esc(p.user_id)}</div></td><td><select data-role="${p.user_id}">${['INTERNAL_USER','FOUNDER_ADMIN'].map(v=>`<option ${v===p.role?'selected':''}>${v}</option>`).join('')}</select></td><td><select data-profile-status="${p.user_id}">${['PENDING','ACTIVE','DISABLED'].map(v=>`<option ${v===p.status?'selected':''}>${v}</option>`).join('')}</select></td><td><button data-apply-profile="${p.user_id}" class="secondary">Apply</button></td></tr>`));
    $('profiles').querySelectorAll('[data-apply-profile]').forEach(btn=>btn.addEventListener('click',()=>applyProfile(btn.dataset.applyProfile)));
  }

  async function applyProfile(userId){
    const role=$('profiles').querySelector(`[data-role="${CSS.escape(userId)}"]`).value;
    const profileStatus=$('profiles').querySelector(`[data-profile-status="${CSS.escape(userId)}"]`).value;
    const reason=prompt('Reason for profile access change:')||'Founder cabinet profile change';
    const {error}=await sb.rpc('p120_admin_set_profile_access',{p_user_id:userId,p_role:role,p_status:profileStatus,p_reason:reason});
    if(error) return status('cabinetStatus','Profile change failed: '+error.message,'danger');
    status('cabinetStatus','Profile access updated and audited.','ok');
    await Promise.all([loadProfiles(),loadAudit()]);
  }

  async function grantEntitlement(){
    const userId=$('entUser').value.trim(); const resourceId=$('entResource').value.trim()||null; const level=$('entLevel').value;
    if(!userId) return status('cabinetStatus','User UUID required.','warn');
    const reason=prompt('Reason for entitlement:')||'Founder cabinet entitlement';
    const {error}=await sb.rpc('p120_admin_grant_entitlement',{p_user_id:userId,p_group_id:null,p_resource_id:resourceId,p_effect:'ALLOW',p_access_level:level,p_valid_from:null,p_valid_until:null,p_reason:reason});
    if(error) return status('cabinetStatus','Entitlement failed: '+error.message,'danger');
    status('cabinetStatus','Entitlement granted and audited.','ok'); await Promise.all([loadEntitlements(),loadAudit()]);
  }

  async function loadEntitlements(){
    if(currentProfile.role!=='FOUNDER_ADMIN') return;
    const {data,error}=await sb.from('p120_entitlements').select('*').order('created_at',{ascending:false}).limit(100); if(error) throw error;
    $('entitlements').innerHTML=table(['Principal','Resource','Effect / level','Status','Action'],(data||[]).map(e=>`<tr><td class="mono">${esc(e.user_id||e.group_id)}</td><td class="mono">${esc(e.resource_id||'GLOBAL')}</td><td>${esc(e.effect)} / ${esc(e.access_level)}</td><td>${esc(e.status)}</td><td>${e.status==='ACTIVE'?`<button class="danger-btn" data-revoke="${e.entitlement_id}">Revoke</button>`:'—'}</td></tr>`));
    $('entitlements').querySelectorAll('[data-revoke]').forEach(b=>b.addEventListener('click',()=>revokeEntitlement(b.dataset.revoke)));
  }
  async function revokeEntitlement(id){
    const reason=prompt('Reason for revoke:')||'Founder cabinet revoke';
    const {error}=await sb.rpc('p120_admin_revoke_entitlement',{p_entitlement_id:id,p_reason:reason});
    if(error) return status('cabinetStatus','Revoke failed: '+error.message,'danger');
    status('cabinetStatus','Entitlement revoked and audited.','ok'); await Promise.all([loadEntitlements(),loadAudit()]);
  }

  async function loadAudit(){
    if(currentProfile.role!=='FOUNDER_ADMIN') return;
    const {data,error}=await sb.from('p120_access_audit').select('*').order('occurred_at',{ascending:false}).limit(100); if(error) throw error;
    $('audit').innerHTML=table(['When','Actor','Action','Entity','Reason'],(data||[]).map(a=>`<tr><td>${dt(a.occurred_at)}</td><td class="mono">${esc(a.actor_kind)} ${short(a.actor_user_id)}</td><td>${esc(a.action)}</td><td>${esc(a.entity_type)}<div class="mono">${esc(a.entity_id||'—')}</div></td><td>${esc(a.reason||'—')}</td></tr>`));
  }

  async function enterCabinet(){
    loginView.classList.add('hidden'); cabinetView.classList.remove('hidden'); signOut.classList.remove('hidden');
    authBadge.textContent='AUTHENTICATED';
    await loadProfile();
    if(!currentProfile){
      $('identityMeta').innerHTML='<b>ACCOUNT</b><span>Profile missing</span>'; $('accessMeta').innerHTML='<b>STATUS</b><span class="danger">DENIED</span>'; return;
    }
    $('identityMeta').innerHTML=`<b>EMAIL</b><span>${esc(currentUser.email||currentProfile.login_email||'—')}</span><b>USER ID</b><span class="mono">${esc(currentUser.id)}</span><b>ROLE</b><span>${esc(currentProfile.role)}</span>`;
    $('accessMeta').innerHTML=`<b>STATUS</b><span>${esc(currentProfile.status)}</span><b>LEVEL</b><span>${currentProfile.role==='FOUNDER_ADMIN'?'MANAGE':'ENTITLEMENT-BOUND'}</span><b>AUTHORITY</b><span>Server-side RLS / RPC</span>`;
    if(currentProfile.status!=='ACTIVE'){
      authBadge.textContent=currentProfile.status; authBadge.classList.add('warn'); status('cabinetStatus','Account exists but is not ACTIVE. Resource access remains denied.','warn');
    }
    if(currentProfile.role==='FOUNDER_ADMIN') $('founderControls').classList.remove('hidden');
    await Promise.all([loadResources(),loadSessions(),loadProfiles(),loadEntitlements(),loadAudit()]);
  }

  async function refreshAuth(){
    const {data:{session}}=await sb.auth.getSession();
    currentUser=session?.user||null;
    if(!currentUser){ loginView.classList.remove('hidden'); cabinetView.classList.add('hidden'); signOut.classList.add('hidden'); authBadge.textContent='UNAUTHENTICATED'; return; }
    try{ await enterCabinet(); }catch(err){ status('cabinetStatus','Cabinet load failed: '+(err.message||err),'danger'); }
  }

  $('sendLink').addEventListener('click',sendLink); $('grantEnt').addEventListener('click',grantEntitlement);
  signOut.addEventListener('click',async()=>{await sb.auth.signOut(); location.reload();});
  sb.auth.onAuthStateChange(()=>setTimeout(refreshAuth,0));
  refreshAuth();
})();
