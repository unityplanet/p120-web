from pathlib import Path

p=Path('p120-brand-system-v1.0.js')
s=p.read_text(encoding='utf-8')

old_footer="""  function ensureFooterContact(inner){
    const legal=inner.querySelector('.p120-site-footer__legal');
    if(!legal) return;
    let service=legal.querySelector('.p120-site-footer__service');
    if(!service){
      service=document.createElement('nav');
      service.className='p120-site-footer__service p120-legal-footer__links';
      service.style.marginTop='12px';
      legal.appendChild(service);
    }
    service.setAttribute('aria-label',isEn?'Contact':'Связь');
    const current=pageKind==='contact'?' aria-current=\"page\"':'';
    service.innerHTML=`<a href=\"${routeFor('contact')}\"${current}>${copy.contact}</a>`;
  }
"""
new_footer="""  function ensureFooterContact(inner){
    const legal=inner.querySelector('.p120-site-footer__legal');
    if(!legal) return;
    let service=legal.querySelector('.p120-site-footer__service');
    if(!service){
      service=document.createElement('nav');
      service.className='p120-site-footer__service p120-legal-footer__links';
      service.style.marginTop='12px';
      legal.appendChild(service);
    }
    const serviceLabel=isEn?'Contact':'Связь';
    if(service.getAttribute('aria-label')!==serviceLabel) service.setAttribute('aria-label',serviceLabel);
    let link=service.querySelector('a[data-p120-contact-discovery]')||service.querySelector('a');
    if(!link){
      link=document.createElement('a');
      link.dataset.p120ContactDiscovery='5.3';
      service.appendChild(link);
    } else if(!link.dataset.p120ContactDiscovery){
      link.dataset.p120ContactDiscovery='5.3';
    }
    const href=routeFor('contact');
    if(link.href!==href) link.href=href;
    if(link.textContent!==copy.contact) link.textContent=copy.contact;
    if(pageKind==='contact'){
      if(link.getAttribute('aria-current')!=='page') link.setAttribute('aria-current','page');
    } else if(link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
  }
"""
old_mobile="""  function patchMobileContact(){
    if(!isPublicMain) return;
    const menu=document.querySelector('.mobile-menu');
    const group=menu?.querySelector('.mobile-menu-body > .mobile-menu-group');
    if(!group) return;
    let action=group.querySelector('[data-p120-contact-discovery]');
    if(!action){
      action=document.createElement('button');
      action.type='button';
      action.className='mobile-menu-action';
      action.dataset.p120ContactDiscovery='5.3';
      const science=group.querySelector('[data-science]');
      if(science) science.insertAdjacentElement('afterend',action); else group.appendChild(action);
      action.addEventListener('click',()=>{location.href=routeFor('contact');});
    }
    action.innerHTML=`<div><div>${copy.contact}</div><small>${copy.contactNote}</small></div>`;
    action.setAttribute('aria-label',`${copy.contact} — ${copy.contactNote}`);
  }
"""
new_mobile="""  function patchMobileContact(){
    if(!isPublicMain) return;
    const menu=document.querySelector('.mobile-menu');
    const group=menu?.querySelector('.mobile-menu-body > .mobile-menu-group');
    if(!group) return;
    let action=group.querySelector('[data-p120-contact-discovery]');
    if(!action){
      action=document.createElement('button');
      action.type='button';
      action.className='mobile-menu-action';
      action.dataset.p120ContactDiscovery='5.3';
      action.innerHTML='<div><div></div><small></small></div>';
      const science=group.querySelector('[data-science]');
      if(science) science.insertAdjacentElement('afterend',action); else group.appendChild(action);
      action.addEventListener('click',()=>{location.href=routeFor('contact');});
    }
    const title=action.querySelector(':scope > div > div');
    const note=action.querySelector(':scope > div > small');
    if(title&&title.textContent!==copy.contact) title.textContent=copy.contact;
    if(note&&note.textContent!==copy.contactNote) note.textContent=copy.contactNote;
    const aria=`${copy.contact} — ${copy.contactNote}`;
    if(action.getAttribute('aria-label')!==aria) action.setAttribute('aria-label',aria);
  }
"""

if s.count(old_footer)!=1:
    raise SystemExit(f'footer authority mismatch: {s.count(old_footer)}')
if s.count(old_mobile)!=1:
    raise SystemExit(f'mobile authority mismatch: {s.count(old_mobile)}')
s=s.replace(old_footer,new_footer).replace(old_mobile,new_mobile)
p.write_text(s,encoding='utf-8')
print('idempotency correction applied')
