from pathlib import Path
import re

SURFACES = [
    'about/index.html','why-p120/index.html','creator/index.html','extended/index.html',
    'together/index.html','science/index.html','contact/index.html',
    'en/about/index.html','en/why-p120/index.html','en/creator/index.html','en/extended/index.html',
    'en/together/index.html','en/science/index.html','en/contact/index.html',
]


def patch_file(path_str: str) -> bool:
    p = Path(path_str)
    if not p.exists():
        raise SystemExit(f'missing controlled surface: {path_str}')
    s = p.read_text(encoding='utf-8')
    is_en = path_str.startswith('en/')
    title = 'Decision research' if is_en else 'Исследование решений'
    note = 'Human-governed cognitive analysis research' if is_en else 'Проект управляемого когнитивного анализа'
    href = '../research/how-we-decide/'
    changed = False

    # Reconcile any canonical static mega-menu without replacing page-specific shells.
    def mega_repl(m):
        nonlocal changed
        block = m.group(0)
        if 'research/how-we-decide/' in block:
            return block
        anchor_re = re.compile(r'(<a class="p120-brand53-mega-card" href="[^"]*together/"[^>]*>.*?</a>)', re.S)
        mm = anchor_re.search(block)
        if not mm:
            return block
        card = f'<a class="p120-brand53-mega-card" href="{href}"><strong>{title}</strong><small>{note}</small></a>'
        changed = True
        return block[:mm.end()] + card + block[mm.end():]

    s = re.sub(r'<details class="p120-brand53-mega".*?</details>', mega_repl, s, flags=re.S)

    # Reconcile explicit page-level mobile drawers where they exist.
    mobile_label = 'Mobile navigation' if is_en else 'Мобильная навигация'
    mobile_re = re.compile(rf'(<nav aria-label="{re.escape(mobile_label)}"[^>]*>)(.*?)(</nav>)', re.S)
    def mobile_repl(m):
        nonlocal changed
        body = m.group(2)
        if 'research/how-we-decide/' in body:
            return m.group(0)
        link = f'<a href="{href}">{title}<small>{note}</small></a>'
        changed = True
        return m.group(1) + body + link + m.group(3)
    s = mobile_re.sub(mobile_repl, s, count=1)

    if changed:
        p.write_text(s, encoding='utf-8')
    return changed


changed=[]
for surface in SURFACES:
    if patch_file(surface):
        changed.append(surface)

print(f'HG-CGA PASS2 static-surface reconciliation changed {len(changed)} files')
for item in changed:
    print(item)
