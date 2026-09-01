/* P-120 WEB-SCIENCE EXT PASS 3 — EN dedicated Scientific Base bridge v0.3
   The EN dedicated page resolves this legacy relative path under /en/.
   Keep the public page stable and load only the root PASS 3 registry adapter. */
(()=>{
  'use strict';
  if(!/\/en\/science\/?$/i.test(location.pathname)) return;
  const id='p120-science-atlas-adapter-v0.3';
  if(document.getElementById(id)) return;
  const current=document.currentScript;
  const rootUrl=new URL('../p120-science-atlas-adapter-v0.3.js?v=websci30',current?.src||location.href).href;
  const script=document.createElement('script');
  script.id=id;
  script.src=rootUrl;
  script.async=false;
  script.dataset.p120WebsciencePass3='core-equivalence-en-bridge';
  document.head.appendChild(script);
})();
