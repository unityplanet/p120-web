from pathlib import Path

root = Path('.')
ru = root / 'why-p120' / 'index.html'
en = root / 'en' / 'why-p120' / 'index.html'

ru_text = ru.read_text(encoding='utf-8')
en_text = en.read_text(encoding='utf-8')

ru_anchor = '        <a class="wp-nav-current" href="./" aria-current="page">Почему P-120?</a>\n'
ru_creator = '        <a href="../creator/">От создателя</a>\n'
if ru_creator not in ru_text:
    if ru_anchor not in ru_text:
        raise SystemExit('RU Why P-120 current nav anchor not found')
    ru_text = ru_text.replace(ru_anchor, ru_anchor + ru_creator, 1)

# The EN page materializes the RU source at runtime, so add one deterministic translation pair.
en_pair_anchor = "      ['<a class=\"wp-nav-current\" href=\"./\" aria-current=\"page\">Почему P-120?</a>','<a class=\"wp-nav-current\" href=\"../en/why-p120/\" aria-current=\"page\">Why P-120?</a>'],\n"
en_creator_pair = "      ['href=\"../creator/\">От создателя</a>','href=\"../en/creator/\">From the Creator</a>'],\n"
if en_creator_pair not in en_text:
    if en_pair_anchor not in en_text:
        raise SystemExit('EN Why P-120 nav translation anchor not found')
    en_text = en_text.replace(en_pair_anchor, en_pair_anchor + en_creator_pair, 1)

ru.write_text(ru_text, encoding='utf-8')
en.write_text(en_text, encoding='utf-8')

ru_now = ru.read_text(encoding='utf-8')
en_now = en.read_text(encoding='utf-8')
if 'href="../creator/">От создателя</a>' not in ru_now:
    raise SystemExit('RU creator nav missing after patch')
if 'href=\"../en/creator/\">From the Creator</a>' not in en_now:
    raise SystemExit('EN creator nav translation missing after patch')
print('Why P-120 creator navigation: PASS')
