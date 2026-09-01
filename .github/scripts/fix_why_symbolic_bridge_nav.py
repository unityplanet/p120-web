from pathlib import Path

root = Path('.')
ru = root / 'why-p120' / 'index.html'
en = root / 'en' / 'why-p120' / 'index.html'

s = ru.read_text(encoding='utf-8')

style = r'''
<style id="wp-act1-act2-symbolic-bridge-v1">
/* ACT 1 → ACT 2 symbolic threshold. Brand mythology only; not methodology. */
.wp-fixed-editorial-theme .wp-nav{
  display:flex;align-items:center;gap:4px;margin-left:auto;
  padding:4px;border:1px solid rgba(255,255,255,.18);border-radius:999px;
  background:rgba(255,255,255,.025);box-shadow:inset 0 1px 0 rgba(255,255,255,.025)
}
.wp-fixed-editorial-theme .wp-nav a{
  display:inline-flex;align-items:center;justify-content:center;min-height:34px;
  padding:8px 12px;border-radius:999px;font-size:11px;font-weight:650;
  text-transform:none;letter-spacing:.01em;color:rgba(247,243,234,.72);
  transition:background .16s ease,color .16s ease,box-shadow .16s ease
}
.wp-fixed-editorial-theme .wp-nav a:hover,.wp-fixed-editorial-theme .wp-nav a:focus-visible,
.wp-fixed-editorial-theme .wp-nav a[aria-current="page"]{
  background:rgba(255,255,255,.09);color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.14)
}
.wp-symbol-bridge{position:relative;isolation:isolate;overflow:hidden;min-height:470px;color:#f2eee7;background:linear-gradient(180deg,#090b0c 0%,#0a0d0f 61%,#171819 74%,#f4f0e8 100%)}
.wp-symbol-bridge::before{content:"";position:absolute;inset:-20% 18% 18% 18%;background:radial-gradient(circle,rgba(199,160,91,.08),transparent 48%);pointer-events:none}
.wp-symbol-bridge-inner{position:relative;z-index:2;width:var(--wp-stage);margin:auto;padding:68px 0 118px;display:grid;justify-items:center;text-align:center}
.wp-symbol-kicker{display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:38px;font:700 9px/1.2 var(--wp-sans);letter-spacing:.14em;text-transform:uppercase;color:rgba(232,226,216,.52)}
.wp-symbol-kicker span{padding-left:10px;border-left:1px solid rgba(255,255,255,.18);color:rgba(232,226,216,.30)}
.wp-symbol-equations{display:grid;grid-template-columns:minmax(280px,1fr) minmax(350px,1.18fr);gap:clamp(34px,7vw,110px);align-items:center;width:min(900px,100%)}
.wp-symbol-track{display:flex;align-items:baseline;justify-content:center;gap:12px;white-space:nowrap;font-family:var(--wp-serif);font-size:clamp(24px,2vw,34px);color:rgba(241,236,227,.55)}
.wp-symbol-track .wp-symbol-origin{font-size:1.35em}.wp-symbol-track .wp-symbol-arrow{font-family:var(--wp-sans);font-size:.72em;opacity:.34}.wp-symbol-track strong{font-size:1.55em;font-weight:500}
.wp-symbol-track.gold .wp-symbol-origin,.wp-symbol-track.gold strong{color:var(--wp-gold-soft)}
.wp-symbol-track.blue .wp-symbol-origin,.wp-symbol-track.blue strong{color:#9cb2ca}
.wp-symbol-delta{margin-top:42px;display:flex;align-items:center;justify-content:center;gap:18px;font-family:var(--wp-serif);font-size:clamp(32px,3.2vw,54px);color:rgba(242,237,228,.78)}
.wp-symbol-delta .gold{color:var(--wp-gold-soft)}.wp-symbol-delta .blue{color:#9cb2ca}.wp-symbol-delta i{font-style:normal;opacity:.42}.wp-symbol-delta strong{font-size:1.72em;font-weight:500;line-height:.8;color:#f4efe7;text-shadow:0 0 34px rgba(255,255,255,.08)}
.wp-symbol-six-label{margin-top:18px;font:600 10px/1.4 var(--wp-sans);letter-spacing:.12em;text-transform:uppercase;color:rgba(241,236,227,.48)}
.wp-symbol-six-nodes{position:absolute;left:50%;bottom:31px;transform:translateX(-50%);width:min(720px,84vw);display:grid;grid-template-columns:repeat(6,1fr);gap:0;color:#756f67}
.wp-symbol-six-nodes::before{content:"";position:absolute;left:8%;right:8%;top:6px;height:1px;background:linear-gradient(90deg,rgba(199,160,91,.28),rgba(199,160,91,.16) 42%,rgba(121,150,181,.18) 58%,rgba(121,150,181,.30))}
.wp-symbol-six-nodes span{position:relative;padding-top:18px;font:700 8px/1 var(--wp-sans);letter-spacing:.12em}
.wp-symbol-six-nodes span::before{content:"";position:absolute;left:50%;top:3px;width:6px;height:6px;border-radius:50%;transform:translateX(-50%);background:#f4f0e8;border:1px solid #b79155}
.wp-symbol-six-nodes span:nth-child(n+4)::before{border-color:#7996b5}
@media(max-width:1100px){.wp-fixed-editorial-theme .wp-nav{gap:2px}.wp-fixed-editorial-theme .wp-nav a{padding:8px 9px;font-size:10px}.wp-symbol-bridge{min-height:440px}}
@media(max-width:980px){.wp-fixed-editorial-theme .wp-nav{display:none}.wp-symbol-bridge-inner{padding-top:58px}.wp-symbol-equations{grid-template-columns:1fr;gap:20px}.wp-symbol-delta{margin-top:30px}}
@media(max-width:720px){.wp-symbol-bridge{min-height:500px}.wp-symbol-bridge-inner{padding:54px 0 124px}.wp-symbol-kicker{display:grid;gap:7px;margin-bottom:30px}.wp-symbol-kicker span{border-left:0;padding-left:0}.wp-symbol-track{gap:8px;font-size:clamp(20px,6vw,28px)}.wp-symbol-delta{gap:12px}.wp-symbol-six-nodes{width:94vw}.wp-symbol-six-nodes span{font-size:7px;letter-spacing:.07em}}
@media(prefers-reduced-motion:reduce){.wp-fixed-editorial-theme .wp-nav a{transition:none}}
</style>
'''

if 'id="wp-act1-act2-symbolic-bridge-v1"' not in s:
    s = s.replace('</head>', style + '\n</head>', 1)

old_nav = '''      <nav class="wp-nav" aria-label="Главная навигация">
        <a href="../#why-important">О P-120</a>
        <a href="../#why-p120">Уникальность</a>'''
new_nav = '''      <nav class="wp-nav" aria-label="Главная навигация">
        <a href="../#why-important">О P-120</a>
        <a class="wp-nav-current" href="./" aria-current="page">Почему P-120?</a>
        <a href="../#why-p120">Уникальность</a>'''
if old_nav in s:
    s = s.replace(old_nav, new_nav, 1)
elif 'class="wp-nav-current"' not in s:
    raise SystemExit('Why P-120 navigation anchor not found')

bridge = r'''
    <section class="wp-symbol-bridge" id="symbolic-bridge" aria-labelledby="symbolic-bridge-title">
      <div class="wp-symbol-bridge-inner">
        <div class="wp-symbol-kicker" data-reveal><strong id="symbolic-bridge-title">Символический слой бренда</strong><span>не часть методологии</span></div>
        <div class="wp-symbol-equations" aria-label="Символическое сведение чисел 72 и 48">
          <div class="wp-symbol-track gold" data-reveal data-delay="1"><span class="wp-symbol-origin">72</span><span class="wp-symbol-arrow">→</span><span>7 + 2</span><span class="wp-symbol-arrow">→</span><strong>9</strong></div>
          <div class="wp-symbol-track blue" data-reveal data-delay="2"><span class="wp-symbol-origin">48</span><span class="wp-symbol-arrow">→</span><span>4 + 8</span><span class="wp-symbol-arrow">→</span><span>12</span><span class="wp-symbol-arrow">→</span><span>1 + 2</span><span class="wp-symbol-arrow">→</span><strong>3</strong></div>
        </div>
        <div class="wp-symbol-delta" data-reveal data-delay="3"><span class="gold">9</span><i>−</i><span class="blue">3</span><i>=</i><strong>6</strong></div>
        <div class="wp-symbol-six-label" data-reveal data-delay="4">Шесть смысловых направлений буквы P</div>
        <div class="wp-symbol-six-nodes" aria-hidden="true"><span>P.01</span><span>P.02</span><span>P.03</span><span>P.04</span><span>P.05</span><span>P.06</span></div>
      </div>
    </section>
'''

needle = '''    </section>\n\n    <section class="wp-act wp-act2 wp-light" id="act-2"'''
if 'id="symbolic-bridge"' not in s:
    if needle not in s:
        raise SystemExit('ACT 1 → ACT 2 insertion anchor not found')
    s = s.replace(needle, '    </section>\n' + bridge + '\n    <section class="wp-act wp-act2 wp-light" id="act-2"', 1)

ru.write_text(s, encoding='utf-8')

# Keep EN runtime translation symmetric with the RU source additions.
e_s = en.read_text(encoding='utf-8')
insert_after = "      ['<span>Прокрутите вниз</span>','<span>Scroll down</span>'],\n"
extra_pairs = """      ['<a class=\"wp-nav-current\" href=\"./\" aria-current=\"page\">Почему P-120?</a>','<a class=\"wp-nav-current\" href=\"../en/why-p120/\" aria-current=\"page\">Why P-120?</a>'],\n      ['<strong id=\"symbolic-bridge-title\">Символический слой бренда</strong><span>не часть методологии</span>','<strong id=\"symbolic-bridge-title\">Symbolic brand layer</strong><span>not part of the methodology</span>'],\n      ['aria-label=\"Символическое сведение чисел 72 и 48\"','aria-label=\"Symbolic reduction of 72 and 48\"'],\n      ['>Шесть смысловых направлений буквы P</div>','>Six semantic directions of the letter P</div>'],\n"""
if 'Symbolic reduction of 72 and 48' not in e_s:
    if insert_after not in e_s:
        raise SystemExit('EN translation-pair insertion anchor not found')
    e_s = e_s.replace(insert_after, insert_after + extra_pairs, 1)
en.write_text(e_s, encoding='utf-8')

# Acceptance checks
ru_now = ru.read_text(encoding='utf-8')
en_now = en.read_text(encoding='utf-8')
for token in [
    'id="symbolic-bridge"', '72</span><span class="wp-symbol-arrow">→</span><span>7 + 2',
    '<strong>9</strong>', '<strong>3</strong>', '<strong>6</strong>',
    'P.01</span><span>P.02</span><span>P.03</span><span>P.04</span><span>P.05</span><span>P.06',
    'class="wp-nav-current" href="./" aria-current="page">Почему P-120?</a>',
    'id="wp-act1-act2-symbolic-bridge-v1"'
]:
    if token not in ru_now:
        raise SystemExit(f'Missing RU acceptance token: {token}')
for token in ['Symbolic brand layer','not part of the methodology','Symbolic reduction of 72 and 48','Six semantic directions of the letter P','wp-nav-current']:
    if token not in en_now:
        raise SystemExit(f'Missing EN acceptance token: {token}')
print('Why P-120 symbolic bridge + rounded nav: PASS')

# trigger reconciliation
