from pathlib import Path

# Shared header contract: keep /creator/ aligned with the production public navigation.
p = Path('creator/index.html')
s = p.read_text(encoding='utf-8')

old_css = ".creator-nav{justify-self:center;display:flex;align-items:center;gap:2px;border:1px solid var(--line);border-radius:999px;padding:3px}.creator-nav a{padding:9px 12px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:700;color:var(--muted)}.creator-nav a:hover,.creator-nav a:focus-visible{background:color-mix(in srgb,var(--card) 78%,transparent);color:var(--ink);outline:none}"
new_css = ".creator-nav{justify-self:center;display:flex;align-items:center;gap:4px;max-width:100%;border:1px solid var(--line-strong);border-radius:999px;padding:5px;background:color-mix(in srgb,var(--card) 46%,transparent);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--card) 80%,transparent)}.creator-nav a{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:9px 13px;border-radius:999px;text-decoration:none;white-space:nowrap;font-size:12px;font-weight:720;color:var(--muted);transition:background .16s ease,color .16s ease,box-shadow .16s ease,transform .16s ease}.creator-nav a:hover,.creator-nav a:focus-visible{background:color-mix(in srgb,var(--card) 88%,var(--soft));color:var(--ink);box-shadow:0 4px 14px color-mix(in srgb,var(--ink) 8%,transparent);outline:none}.creator-nav a:active{transform:translateY(1px)}.creator-nav .creator-explore{gap:7px}.creator-nav .creator-explore:after{content:\"\";width:6px;height:6px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(45deg) translateY(-2px);opacity:.58}"
if old_css in s:
    s = s.replace(old_css, new_css, 1)
elif 'creator-explore:after' not in s:
    raise SystemExit('Creator navigation CSS anchor not found')

old_nav = '''      <nav class="creator-nav" aria-label="Основная навигация">
        <a href="../">О P-120</a>
        <a href="../#why-p120">Почему P-120?</a>
        <a href="../#science-foundation">Научная база</a>
        <a href="../?start=1">Исследовать</a>
      </nav>'''
new_nav = '''      <nav class="creator-nav" aria-label="Основная навигация">
        <a href="../#why-important">О P-120</a>
        <a href="../why-p120/">Почему P-120?</a>
        <a href="../#why-p120">Уникальность</a>
        <a href="../#what-p120-shows">Что покажет</a>
        <a href="../#showcase">Отчёт</a>
        <a href="../#science-foundation">Научная база</a>
        <a class="creator-explore" href="../?start=1">Исследовать</a>
      </nav>'''
if old_nav in s:
    s = s.replace(old_nav, new_nav, 1)
elif 'href="../why-p120/">Почему P-120?</a>' not in s or 'creator-explore' not in s:
    raise SystemExit('Creator navigation markup anchor not found')

old_tablet = "@media(max-width:920px){.creator-topbar__inner{grid-template-columns:auto 1fr}.creator-nav{grid-column:1/-1;justify-self:start;max-width:100%;overflow:auto}.creator-tools{justify-self:end}.creator-lockup span{display:none}}"
new_tablet = "@media(max-width:1280px){.creator-topbar__inner{grid-template-columns:auto 1fr}.creator-nav{grid-column:1/-1;justify-self:start;width:100%;max-width:100%;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none}.creator-nav::-webkit-scrollbar{display:none}.creator-tools{justify-self:end}.creator-lockup span{display:none}}"
if old_tablet in s:
    s = s.replace(old_tablet, new_tablet, 1)
elif '@media(max-width:1280px)' not in s:
    raise SystemExit('Creator tablet navigation breakpoint anchor not found')

old_mobile = "@media(max-width:620px){.creator-topbar__inner{gap:10px}.creator-mark{display:none}.creator-lockup strong{font-size:24px}.creator-tools .creator-theme:not([aria-pressed='true']){display:none}.creator-nav{border:0;padding:0}.creator-nav a{font-size:11px;padding:8px}.creator-context{padding-top:14px}.creator-context p{font-size:9px}}"
new_mobile = "@media(max-width:620px){.creator-topbar__inner{gap:10px}.creator-mark{display:none}.creator-lockup strong{font-size:24px}.creator-tools .creator-theme:not([aria-pressed='true']){display:none}.creator-nav{width:100%;border:1px solid var(--line-strong);padding:4px}.creator-nav a{min-height:36px;font-size:11px;padding:8px 11px}.creator-context{padding-top:14px}.creator-context p{font-size:9px}}"
if old_mobile in s:
    s = s.replace(old_mobile, new_mobile, 1)
elif ".creator-nav{width:100%;border:1px solid var(--line-strong);padding:4px}" not in s:
    raise SystemExit('Creator mobile navigation anchor not found')

s = s.replace("else if(route==='why')location.href='../#why-p120';", "else if(route==='why')location.href='../why-p120/';")

p.write_text(s, encoding='utf-8')

# Static acceptance checks
checks = [
    'href="../why-p120/">Почему P-120?</a>',
    'href="../#why-p120">Уникальность</a>',
    'href="../#what-p120-shows">Что покажет</a>',
    'href="../#showcase">Отчёт</a>',
    'class="creator-explore"',
    'creator-explore:after',
    "else if(route==='why')location.href='../why-p120/';",
    '@media(max-width:1280px)',
]
for token in checks:
    if token not in s:
        raise SystemExit(f'Missing creator navigation acceptance token: {token}')
print('Creator shared navigation reconciliation: PASS')
