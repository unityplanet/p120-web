from pathlib import Path

ru_path = Path('why-p120/index.html')
en_path = Path('en/why-p120/index.html')

ru = ru_path.read_text(encoding='utf-8')
en = en_path.read_text(encoding='utf-8')

style = r'''<style id="wp-act2-semantic-object-v1">
/* ACT 2 — bilingual P-semantic object: P.01–P.06 */
.wp-semantic{position:relative;display:grid;gap:0;align-self:center;padding-left:42px;max-width:360px}
.wp-semantic::before{content:"";position:absolute;left:14px;top:14px;bottom:14px;width:1px;background:linear-gradient(to bottom,rgba(199,160,91,.12),rgba(199,160,91,.52) 18%,rgba(121,150,181,.38) 72%,rgba(121,150,181,.08))}
.wp-semantic-item{position:relative;display:grid;grid-template-columns:52px minmax(0,1fr);gap:10px;align-items:start;padding:10px 0 11px;border-bottom:1px solid rgba(31,30,28,.075)}
.wp-semantic-item:last-child{border-bottom:0}
.wp-semantic-item::before{content:"";position:absolute;left:-30px;top:17px;width:5px;height:5px;border-radius:50%;box-sizing:border-box;background:#f4f0e8;border:1px solid rgba(199,160,91,.72);box-shadow:0 0 0 4px rgba(199,160,91,.045)}
.wp-semantic-item:nth-child(n+4)::before{border-color:rgba(121,150,181,.74);box-shadow:0 0 0 4px rgba(121,150,181,.045)}
.wp-semantic-index{padding-top:3px;font:700 9px/1 var(--wp-sans);letter-spacing:.13em;color:#ad874a;font-variant-numeric:tabular-nums}
.wp-semantic-item:nth-child(n+4) .wp-semantic-index{color:#6f88a3}
.wp-semantic-copy{display:grid;gap:2px;min-width:0}
.wp-semantic-term{font-family:var(--wp-serif);font-size:14px;line-height:1.15;letter-spacing:.12em;text-transform:uppercase;color:#24211e}
.wp-semantic-detail{font:500 11.5px/1.35 var(--wp-sans);color:#9b958c;letter-spacing:.005em}
.wp-act2-note{display:grid;gap:4px;max-width:190px}
.wp-act2-note span{font:500 11px/1.4 var(--wp-sans);color:#9a948b}
.wp-act2-note strong{font:500 12px/1.45 var(--wp-serif);letter-spacing:.01em;color:#817a70}
@media(max-width:1100px){.wp-semantic{padding-left:36px;max-width:330px}.wp-semantic-item{grid-template-columns:48px minmax(0,1fr);padding:9px 0 10px}.wp-semantic-item::before{left:-25px}.wp-semantic::before{left:12px}}
@media(max-width:720px){.wp-semantic{padding-left:34px;max-width:100%;margin-top:30px}.wp-semantic::before{left:11px;top:12px;bottom:12px}.wp-semantic-item{grid-template-columns:46px minmax(0,1fr);gap:8px;padding:10px 0 11px}.wp-semantic-item::before{left:-25px;top:17px}.wp-semantic-term{font-size:13px}.wp-semantic-detail{font-size:11px}.wp-act2-note{position:static!important;margin:26px 0 0 auto;max-width:210px;text-align:right}}
</style>'''

old_block = '''        <div class="wp-semantic" aria-label="Смыслы буквы P">
          <div class="wp-semantic-item" data-reveal><span class="wp-semantic-en">Person</span><span class="wp-semantic-ru">человек</span></div>
          <div class="wp-semantic-item" data-reveal data-delay="1"><span class="wp-semantic-en">Profile</span><span class="wp-semantic-ru">профиль</span></div>
          <div class="wp-semantic-item" data-reveal data-delay="2"><span class="wp-semantic-en">Pattern</span><span class="wp-semantic-ru">паттерн</span></div>
          <div class="wp-semantic-item" data-reveal data-delay="3"><span class="wp-semantic-en">Perception</span><span class="wp-semantic-ru">восприятие</span></div>
          <div class="wp-semantic-item" data-reveal data-delay="4"><span class="wp-semantic-en">Presence</span><span class="wp-semantic-ru">присутствие</span></div>
          <div class="wp-semantic-item" data-reveal data-delay="5"><span class="wp-semantic-en">Partnership</span><span class="wp-semantic-ru">партнёрство</span></div>
        </div>
        <p class="wp-act2-note">Одна буква.<br>Много смыслов.</p>'''

new_block = '''        <div class="wp-semantic" aria-label="Шесть смысловых направлений буквы P">
          <div class="wp-semantic-item" data-reveal><span class="wp-semantic-index">P.01</span><span class="wp-semantic-copy"><span class="wp-semantic-term">Person</span><span class="wp-semantic-detail">человек</span></span></div>
          <div class="wp-semantic-item" data-reveal data-delay="1"><span class="wp-semantic-index">P.02</span><span class="wp-semantic-copy"><span class="wp-semantic-term">Profile</span><span class="wp-semantic-detail">профиль</span></span></div>
          <div class="wp-semantic-item" data-reveal data-delay="2"><span class="wp-semantic-index">P.03</span><span class="wp-semantic-copy"><span class="wp-semantic-term">Pattern</span><span class="wp-semantic-detail">паттерн</span></span></div>
          <div class="wp-semantic-item" data-reveal data-delay="3"><span class="wp-semantic-index">P.04</span><span class="wp-semantic-copy"><span class="wp-semantic-term">Perception</span><span class="wp-semantic-detail">восприятие</span></span></div>
          <div class="wp-semantic-item" data-reveal data-delay="4"><span class="wp-semantic-index">P.05</span><span class="wp-semantic-copy"><span class="wp-semantic-term">Presence</span><span class="wp-semantic-detail">присутствие</span></span></div>
          <div class="wp-semantic-item" data-reveal data-delay="5"><span class="wp-semantic-index">P.06</span><span class="wp-semantic-copy"><span class="wp-semantic-term">Partnership</span><span class="wp-semantic-detail">партнёрство</span></span></div>
        </div>
        <p class="wp-act2-note"><span>Одна буква.</span><strong>Шесть направлений смысла.</strong></p>'''

if 'id="wp-act2-semantic-object-v1"' not in ru:
    ru = ru.replace('</head>', style + '\n</head>', 1)

if 'P.01</span>' not in ru:
    if old_block not in ru:
        raise SystemExit('RU ACT 2 semantic block target not found')
    ru = ru.replace(old_block, new_block, 1)

# Update the English transformation table so the secondary line is meaningful,
# rather than repeating the English term.
old_pairs = [
    "      ['<span class=\"wp-semantic-ru\">человек</span>','<span class=\"wp-semantic-ru\">person</span>'],",
    "      ['<span class=\"wp-semantic-ru\">профиль</span>','<span class=\"wp-semantic-ru\">profile</span>'],",
    "      ['<span class=\"wp-semantic-ru\">паттерн</span>','<span class=\"wp-semantic-ru\">pattern</span>'],",
    "      ['<span class=\"wp-semantic-ru\">восприятие</span>','<span class=\"wp-semantic-ru\">perception</span>'],",
    "      ['<span class=\"wp-semantic-ru\">присутствие</span>','<span class=\"wp-semantic-ru\">presence</span>'],",
    "      ['<span class=\"wp-semantic-ru\">партнёрство</span>','<span class=\"wp-semantic-ru\">partnership</span>'],",
    "      ['Одна буква.<br>Много смыслов.','One letter.<br>Many meanings.'],",
]
for line in old_pairs:
    en = en.replace(line + '\n', '')
    en = en.replace(line, '')

anchor = "      ['aria-label=\"Смыслы буквы P\"','aria-label=\"Meanings of the letter P\"'],"
new_pairs = '''      ['aria-label="Шесть смысловых направлений буквы P"','aria-label="Six semantic directions of the letter P"'],
      ['<span class="wp-semantic-detail">человек</span>','<span class="wp-semantic-detail">the individual</span>'],
      ['<span class="wp-semantic-detail">профиль</span>','<span class="wp-semantic-detail">structured portrait</span>'],
      ['<span class="wp-semantic-detail">паттерн</span>','<span class="wp-semantic-detail">recurring form</span>'],
      ['<span class="wp-semantic-detail">восприятие</span>','<span class="wp-semantic-detail">way of sensing</span>'],
      ['<span class="wp-semantic-detail">присутствие</span>','<span class="wp-semantic-detail">felt engagement</span>'],
      ['<span class="wp-semantic-detail">партнёрство</span>','<span class="wp-semantic-detail">relational bond</span>'],
      ['<p class="wp-act2-note"><span>Одна буква.</span><strong>Шесть направлений смысла.</strong></p>','<p class="wp-act2-note"><span>One letter.</span><strong>Six directions of meaning.</strong></p>'],'''

if 'Six directions of meaning.' not in en:
    if anchor in en:
        en = en.replace(anchor, new_pairs, 1)
    else:
        marker = "      ['<div class=\"wp-eyebrow\" data-reveal>Акт 3</div>','<div class=\"wp-eyebrow\" data-reveal>Act 3</div>'],"
        if marker not in en:
            raise SystemExit('EN ACT 2 translation insertion target not found')
        en = en.replace(marker, new_pairs + '\n' + marker, 1)
else:
    en = en.replace(anchor + '\n', '')

ru_path.write_text(ru, encoding='utf-8')
en_path.write_text(en, encoding='utf-8')

# Acceptance checks
assert ru.count('P.01</span>') == 1
assert ru.count('P.06</span>') == 1
assert 'wp-semantic-en' not in ru
assert 'wp-semantic-ru' not in ru
assert 'Шесть направлений смысла.' in ru
assert 'the individual' in en
assert 'structured portrait' in en
assert 'relational bond' in en
assert 'Six directions of meaning.' in en
assert 'wp-semantic-ru' not in en
print('Why P-120 ACT 2 bilingual semantic object: PASS')
