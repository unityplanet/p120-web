from pathlib import Path

RU_WHY = Path('why-p120/index.html')
EN_WHY = Path('en/why-p120/index.html')
EN_HOME = Path('en/index.html')

for p in (RU_WHY, EN_WHY, EN_HOME):
    if not p.exists():
        raise SystemExit(f'Missing required file: {p}')

ru = RU_WHY.read_text(encoding='utf-8')
en_why = EN_WHY.read_text(encoding='utf-8')
en_home = EN_HOME.read_text(encoding='utf-8')

# ---------------------------------------------------------------------------
# 1) ACT 2: make the closing statement part of the semantic object itself.
#    This removes the desktop absolute-position collision with P.05 / P.06.
# ---------------------------------------------------------------------------
note = '<p class="wp-act2-note"><span>Одна буква.</span><strong>Шесть направлений смысла.</strong></p>'
outside = '        </div>\n        ' + note
inside = '          ' + note + '\n        </div>'
if outside in ru:
    ru = ru.replace(outside, inside, 1)
elif note not in ru:
    raise SystemExit('ACT 2 closing note not found in RU Why page')

# Final override comes after the earlier ACT 2 rules and intentionally wins on
# desktop/tablet/mobile. It also provides the shared language switch styling.
fix_style = r'''<style id="wp-bilingual-ui-fix-v1">
/* Why P-120 — bilingual UI / ACT 2 composition correction */
.wp-semantic>.wp-act2-note{
  position:static!important;
  display:grid!important;
  gap:3px!important;
  justify-self:end;
  align-self:start;
  width:min(220px,100%);
  max-width:220px!important;
  margin:18px 0 0 auto!important;
  padding:14px 0 0;
  border-top:1px solid rgba(31,30,28,.10);
  text-align:right!important;
}
.wp-semantic>.wp-act2-note span,
.wp-semantic>.wp-act2-note strong{display:block}
.wp-semantic::before{bottom:82px!important}
.wp-lang-switch{display:inline-flex;gap:2px;padding:3px;border:1px solid rgba(255,255,255,.2);border-radius:999px;flex:0 0 auto}
.wp-lang-switch a{min-width:30px;height:25px;padding:0 7px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;text-decoration:none;font:700 9px/1 Inter,system-ui,sans-serif;letter-spacing:.06em;color:rgba(247,243,234,.68)}
.wp-lang-switch a[aria-current="page"]{background:rgba(255,255,255,.12);color:#fff}
@media(max-width:1100px){
  .wp-semantic>.wp-act2-note{margin-top:16px!important}
  .wp-semantic::before{bottom:80px!important}
}
@media(max-width:720px){
  .wp-lang-switch{margin-left:auto}
  .wp-lang-switch a{min-width:28px}
  .wp-mobile-menu{margin-left:0}
  .wp-semantic>.wp-act2-note{margin:18px 0 0 auto!important;max-width:220px!important}
  .wp-semantic::before{bottom:80px!important}
}
</style>'''

if 'id="wp-bilingual-ui-fix-v1"' not in ru:
    if '</head>' not in ru:
        raise SystemExit('RU Why </head> not found')
    ru = ru.replace('</head>', fix_style + '\n</head>', 1)

# ---------------------------------------------------------------------------
# 2) RU Why page: add the same RU/EN selector already present in the EN route.
# ---------------------------------------------------------------------------
ru_switch = '<nav class="wp-lang-switch" aria-label="Язык"><a href="./" lang="ru" aria-current="page">RU</a><a href="../en/why-p120/" lang="en">EN</a></nav>'
if 'class="wp-lang-switch"' not in ru:
    marker = '<div class="wp-header-tools">'
    if marker not in ru:
        raise SystemExit('RU Why header-tools target not found')
    ru = ru.replace(marker, marker + ru_switch, 1)

# ---------------------------------------------------------------------------
# 3) EN Why loader: transform the RU selector into EN state and do not inject a
#    second selector if the source already contains one.
# ---------------------------------------------------------------------------
en_switch = '<nav class="wp-lang-switch" aria-label="Language"><a href="./" lang="ru">RU</a><a href="../en/why-p120/" lang="en" aria-current="page">EN</a></nav>'
pair_line = "      ['" + ru_switch + "','" + en_switch + "'],"
if pair_line not in en_why:
    anchor = "      ['aria-label=\"Главная навигация\"','aria-label=\"Main navigation\"'],"
    if anchor not in en_why:
        raise SystemExit('EN Why language-pair insertion anchor not found')
    en_why = en_why.replace(anchor, anchor + '\n' + pair_line, 1)

old_inject = "      src=src.replace('<div class=\"wp-header-tools\">','<div class=\"wp-header-tools\"><nav class=\"wp-lang-switch\" aria-label=\"Language\"><a href=\"./\" lang=\"ru\">RU</a><a href=\"../en/why-p120/\" lang=\"en\" aria-current=\"page\">EN</a></nav>');"
new_inject = "      if(!src.includes('class=\"wp-lang-switch\"')) src=src.replace('<div class=\"wp-header-tools\">','<div class=\"wp-header-tools\"><nav class=\"wp-lang-switch\" aria-label=\"Language\"><a href=\"./\" lang=\"ru\">RU</a><a href=\"../en/why-p120/\" lang=\"en\" aria-current=\"page\">EN</a></nav>');"
if old_inject in en_why:
    en_why = en_why.replace(old_inject, new_inject, 1)
elif new_inject not in en_why:
    raise SystemExit('EN Why language-switch injection target not found')

# ---------------------------------------------------------------------------
# 4) EN main site: localize the newly introduced Brand Origin route directly in
#    the generated render functions. Existing runtime localization still handles
#    all older strings, but these new strings were not in the dictionary.
# ---------------------------------------------------------------------------
en_home = en_home.replace(
    '<button class="navlink navlink-origin" data-why-origin>Почему P-120?</button>',
    '<button class="navlink navlink-origin" data-why-origin>Why P-120?</button>'
)
en_home = en_home.replace(
    '<button class="navlink" data-nav="why-p120">Уникальность</button>',
    '<button class="navlink" data-nav="why-p120">What makes it different</button>'
)
en_home = en_home.replace(
    '<button class="mobile-menu-action" data-why-origin><div><div>Почему P-120?</div><small>История названия · 72 + 48 · символический слой бренда</small></div></button>',
    '<button class="mobile-menu-action" data-why-origin><div><div>Why P-120?</div><small>The origin of the name · 72 + 48 · symbolic brand layer</small></div></button>'
)

# The hidden static teaser can still be rendered before the scroll-interstitial
# runtime hides it. Keep its EN source clean as well, without broad replacements.
en_home = en_home.replace(
    '<h2 id="brand-origin-title">Почему P-120?</h2><p>72 + 48 объясняют число. Но не весь смысл названия.</p><a class="brand-origin-link" href="why-p120/">Узнать историю ',
    '<h2 id="brand-origin-title">Why P-120?</h2><p>72 + 48 explain the number. But not the whole meaning of the name.</p><a class="brand-origin-link" href="../why-p120/">Discover the story '
)

RU_WHY.write_text(ru, encoding='utf-8')
EN_WHY.write_text(en_why, encoding='utf-8')
EN_HOME.write_text(en_home, encoding='utf-8')

# ---------------------------------------------------------------------------
# Acceptance gates
# ---------------------------------------------------------------------------
assert ru.count('class="wp-lang-switch"') == 1
assert 'lang="ru" aria-current="page">RU</a>' in ru
assert 'id="wp-bilingual-ui-fix-v1"' in ru
assert '          ' + note + '\n        </div>' in ru
assert outside not in ru
assert pair_line in en_why
assert new_inject in en_why
assert 'data-why-origin>Why P-120?</button>' in en_home
assert 'data-why-origin>Почему P-120?</button>' not in en_home
assert 'data-nav="why-p120">What makes it different</button>' in en_home
assert 'The origin of the name · 72 + 48 · symbolic brand layer' in en_home
print('Why P-120 bilingual UI hotfix: PASS')
