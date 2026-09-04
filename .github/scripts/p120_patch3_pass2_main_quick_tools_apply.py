from pathlib import Path

path=Path('p120-brand-system-v1.0.js')
text=path.read_text(encoding='utf-8')
old="""  // PATCH 3 / PASS 2 — Main quick utilities reuse the canonical theme authority
  // while keeping Main's legacy render-local theme variable synchronized.
  function applyUtilityTheme(next){
    if(!THEMES.includes(next)) return;
    if(isMain && typeof window.setTheme==='function'){
      try{
        window.setTheme(next);
        currentTheme=next;
        applyTheme(next,{persist:false});
        return;
      }catch(_){}
    }
    applyTheme(next);
  }
"""
new="""  // PATCH 3 / PASS 2 — Main quick utilities reuse the canonical theme authority.
  // Main's theme setter is closure-local, so bridge through an already-bound
  // legacy data-set-theme control instead of creating a second theme engine.
  function applyUtilityTheme(next){
    if(!THEMES.includes(next)) return;
    if(isMain){
      const bridge=[...document.querySelectorAll('[data-set-theme]')].find(btn=>btn.dataset.setTheme===next);
      if(bridge){
        try{
          bridge.click();
          currentTheme=next;
          applyTheme(next,{persist:false});
          return;
        }catch(_){}
      }
    }
    applyTheme(next);
  }
"""
assert old in text, 'PATCH 3 Main utility theme helper not found'
path.write_text(text.replace(old,new,1),encoding='utf-8')
print('PATCH 3 / PASS 2 Main render-local theme bridge reconciled')
