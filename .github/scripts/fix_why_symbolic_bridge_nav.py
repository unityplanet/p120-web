from pathlib import Path
import re

root = Path('.')
ru = root / 'why-p120' / 'index.html'
en = root / 'en' / 'why-p120' / 'index.html'

s = ru.read_text(encoding='utf-8')

# Remove the failed standalone ACT1→ACT2 bridge and its independent color block.
s = re.sub(r'\n?<style id="wp-act1-act2-symbolic-bridge-v[12]">.*?</style>\n?', '\n', s, flags=re.S)
s = re.sub(r'\n\s*<section class="wp-symbol-bridge".*?</section>\s*(?=<section class="wp-act wp-act2)', '\n\n    ', s, flags=re.S)

style = r'''
<style id="wp-act1-symbolic-venn-v2">
/* ACT 1 symbolic number layer lives inside the existing 72/48 Venn plane.
   Brand mythology only — not methodology or scoring logic. */
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

.wp-venn{height:352px}
.wp-venn-content{display:grid;justify-items:center;align-content:center;min-width:0}
.wp-venn-reduction{
  margin-top:12px;padding-top:9px;min-width:150px;border-top:1px solid currentColor;
  display:flex;align-items:baseline;justify-content:center;gap:6px;
  font-family:var(--wp-serif);font-size:13px;line-height:1;color:rgba(245,241,234,.44)
}
.wp-venn-reduction i{font-family:var(--wp-sans);font-style:normal;font-size:9px;opacity:.38}
.wp-venn-reduction strong{font-size:18px;font-weight:500;color:currentColor}
.wp-venn-a .wp-venn-reduction{color:var(--wp-gold-soft);border-top-color:rgba(199,160,91,.22)}
.wp-venn-b .wp-venn-reduction{color:#9cb2ca;border-top-color:rgba(121,150,181,.24)}
.wp-venn-reduction .soft{color:rgba(245,241,234,.44)}

.wp-venn-result{bottom:84px;font-size:35px}
.wp-venn-result::before{height:30px;bottom:37px}
.wp-venn-six{
  position:absolute;left:50%;bottom:0;transform:translateX(-50%);
  width:430px;display:grid;justify-items:center;text-align:center;color:#f2ede5
}
.wp-venn-six::before{content:"";position:absolute;left:50%;top:-31px;width:1px;height:24px;background:linear-gradient(rgba(255,255,255,.34),transparent)}
.wp-venn-six-equation{display:flex;align-items:baseline;justify-content:center;gap:8px;font-family:var(--wp-serif);font-size:18px;line-height:1;color:rgba(242,237,229,.62)}
.wp-venn-six-equation .gold{color:var(--wp-gold-soft)}
.wp-venn-six-equation .blue{color:#9cb2ca}
.wp-venn-six-equation i{font-style:normal;opacity:.38}
.wp-venn-six-equation strong{font-size:27px;font-weight:500;color:#f5f0e7}
.wp-venn-six-nodes{position:relative;width:330px;margin-top:9px;display:grid;grid-template-columns:repeat(6,1fr);color:rgba(238,232,222,.38)}
.wp-venn-six-nodes::before{content:"";position:absolute;left:7%;right:7%;top:3px;height:1px;background:linear-gradient(90deg,rgba(199,160,91,.34),rgba(199,160,91,.16) 42%,rgba(121,150,181,.18) 58%,rgba(121,150,181,.35))}
.wp-venn-six-nodes span{position:relative;padding-top:12px;font:700 6.5px/1 var(--wp-sans);letter-spacing:.08em}
.wp-venn-six-nodes span::before{content:"";position:absolute;left:50%;top:0;width:5px;height:5px;border-radius:50%;transform:translateX(-50%);background:#0b0d0e;border:1px solid var(--wp-gold)}
.wp-venn-six-nodes span:nth-child(n+4)::before{border-color:var(--wp-blue)}
.wp-venn-symbol-note{margin-top:7px;font:650 6.5px/1.3 var(--wp-sans);letter-spacing:.11em;text-transform:uppercase;color:rgba(240,234,225,.25);white-space:nowrap}

@media(max-width:1100px){
  .wp-fixed-editorial-theme .wp-nav{gap:2px}.wp-fixed-editorial-theme .wp-nav a{padding:8px 9px;font-size:10px}
  .wp-venn{height:335px}
}
@media(max-width:980px){.wp-fixed-editorial-theme .wp-nav{display:none}}
@media(max-width:720px){
  .wp-venn{height:282px}
  .wp-venn-reduction{margin-top:7px;padding-top:6px;min-width:118px;gap:4px;font-size:9px}
  .wp-venn-reduction i{font-size:7px}.wp-venn-reduction strong{font-size:13px}
  .wp-venn-result{bottom:68px;font-size:28px}.wp-venn-result::before{height:20px;bottom:31px}
  .wp-venn-six{width:min(340px,94vw)}.wp-venn-six::before{top:-25px;height:18px}
  .wp-venn-six-equation{font-size:15px}.wp-venn-six-equation strong{font-size:22px}
  .wp-venn-six-nodes{width:min(280px,82vw);margin-top:7px}.wp-venn-six-nodes span{font-size:5.7px;padding-top:10px}
  .wp-venn-symbol-note{font-size:5.5px;letter-spacing:.07em;margin-top:6px}
}
@media(max-width:420px){
  .wp-venn{height:270px}
  .wp-venn-reduction{min-width:102px;font-size:8px}.wp-venn-reduction strong{font-size:12px}
  .wp-venn-six-nodes{width:250px}
}
@media(prefers-reduced-motion:reduce){.wp-fixed-editorial-theme .wp-nav a{transition:none}}
</style>
'''

s = re.sub(r'\n?<style id="wp-act1-symbolic-venn-v2">.*?</style>\n?', '\n', s, flags=re.S)
s = s.replace('</head>', style + '\n</head>', 1)

# Keep Why P-120 as current item inside the unified rounded navigation bubble.
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

old_venn = '''          <div class="wp-venn" data-reveal data-delay="2">
            <div class="wp-venn-circle wp-venn-a"><div><div class="wp-venn-num">72</div><div class="wp-venn-label">основное<br>измерительное<br>ядро</div></div></div>
            <div class="wp-venn-circle wp-venn-b"><div><div class="wp-venn-num">48</div><div class="wp-venn-label">второй<br>независимый<br>слой</div></div></div>
            <div class="wp-venn-result">120</div>
          </div>'''

new_venn = '''          <div class="wp-venn" data-reveal data-delay="2">
            <div class="wp-venn-circle wp-venn-a"><div class="wp-venn-content"><div class="wp-venn-num">72</div><div class="wp-venn-label">основное<br>измерительное<br>ядро</div><div class="wp-venn-reduction" aria-label="Символическое сведение 72 к 9"><span>7 + 2</span><i>→</i><strong>9</strong></div></div></div>
            <div class="wp-venn-circle wp-venn-b"><div class="wp-venn-content"><div class="wp-venn-num">48</div><div class="wp-venn-label">второй<br>независимый<br>слой</div><div class="wp-venn-reduction" aria-label="Символическое сведение 48 к 3"><span>4 + 8 = 12</span><i>→</i><span class="soft">1 + 2 =</span><strong>3</strong></div></div></div>
            <div class="wp-venn-result">120</div>
            <div class="wp-venn-six" data-reveal data-delay="3">
              <div class="wp-venn-six-equation" aria-label="Девять минус три равно шесть"><span class="gold">9</span><i>−</i><span class="blue">3</span><i>=</i><strong>6</strong></div>
              <div class="wp-venn-six-nodes" aria-label="Шесть смысловых направлений буквы P"><span>P.01</span><span>P.02</span><span>P.03</span><span>P.04</span><span>P.05</span><span>P.06</span></div>
              <div class="wp-venn-symbol-note">Символический слой бренда · не часть методологии</div>
            </div>
          </div>'''

if 'class="wp-venn-six"' not in s:
    if old_venn not in s:
        raise SystemExit('ACT 1 Venn insertion anchor not found')
    s = s.replace(old_venn, new_venn, 1)

ru.write_text(s, encoding='utf-8')

# Keep EN runtime translation symmetric with the RU source additions.
e_s = en.read_text(encoding='utf-8')
insert_after = "      ['<span>Прокрутите вниз</span>','<span>Scroll down</span>'],\n"
extra_pairs = """      ['<a class=\"wp-nav-current\" href=\"./\" aria-current=\"page\">Почему P-120?</a>','<a class=\"wp-nav-current\" href=\"../en/why-p120/\" aria-current=\"page\">Why P-120?</a>'],\n      ['aria-label=\"Символическое сведение 72 к 9\"','aria-label=\"Symbolic reduction of 72 to 9\"'],\n      ['aria-label=\"Символическое сведение 48 к 3\"','aria-label=\"Symbolic reduction of 48 to 3\"'],\n      ['aria-label=\"Девять минус три равно шесть\"','aria-label=\"Nine minus three equals six\"'],\n      ['aria-label=\"Шесть смысловых направлений буквы P\"','aria-label=\"Six semantic directions of the letter P\"'],\n      ['Символический слой бренда · не часть методологии','Symbolic brand layer · not part of the methodology'],\n"""
if 'Symbolic reduction of 72 to 9' not in e_s:
    if insert_after not in e_s:
        raise SystemExit('EN translation-pair insertion anchor not found')
    e_s = e_s.replace(insert_after, insert_after + extra_pairs, 1)
en.write_text(e_s, encoding='utf-8')

# Acceptance checks
ru_now = ru.read_text(encoding='utf-8')
en_now = en.read_text(encoding='utf-8')
for token in [
    'id="wp-act1-symbolic-venn-v2"', 'class="wp-venn-six"',
    'Символическое сведение 72 к 9', 'Символическое сведение 48 к 3',
    'Девять минус три равно шесть', 'P.01</span><span>P.02</span><span>P.03</span><span>P.04</span><span>P.05</span><span>P.06',
    'Символический слой бренда · не часть методологии',
    'class="wp-nav-current" href="./" aria-current="page">Почему P-120?</a>'
]:
    if token not in ru_now:
        raise SystemExit(f'Missing RU acceptance token: {token}')
if 'class="wp-symbol-bridge"' in ru_now or 'wp-act1-act2-symbolic-bridge-v1' in ru_now:
    raise SystemExit('Standalone symbolic bridge still present')
for token in ['Symbolic reduction of 72 to 9','Symbolic reduction of 48 to 3','Nine minus three equals six','Symbolic brand layer · not part of the methodology']:
    if token not in en_now:
        raise SystemExit(f'Missing EN acceptance token: {token}')
print('Why P-120 ACT 1 symbolic Venn layer + rounded nav: PASS')
