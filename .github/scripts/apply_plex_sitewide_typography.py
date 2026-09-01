from pathlib import Path

FONT_OLD = 'inter:400,500,600,700,800|noto-serif:400,500,600,700|noto-serif-display:500,600,700'
FONT_NEW = 'ibm-plex-mono:300,400,500|ibm-plex-sans:300,400,500,600,700|noto-serif:400,500,600,700|noto-serif-display:500,600,700'


def edit(path, fn):
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    n = fn(s)
    if n == s:
        print(f'UNCHANGED {path}')
    else:
        p.write_text(n, encoding='utf-8')
        print(f'UPDATED {path}')


def main_page(s):
    s = s.replace(FONT_OLD, FONT_NEW)
    # Replace the previous functional sans wherever explicitly declared.
    s = s.replace('font-family:Inter,ui-sans-serif', 'font-family:"IBM Plex Sans",ui-sans-serif')
    s = s.replace('font-family:Inter,ui-sans-serif', 'font-family:"IBM Plex Sans",ui-sans-serif')
    s = s.replace('font-family:Inter,ui-sans-serif,system-ui,sans-serif', 'font-family:"IBM Plex Sans",ui-sans-serif,system-ui,sans-serif')
    s = s.replace(' Inter,ui-sans-serif', ' "IBM Plex Sans",ui-sans-serif')
    s = s.replace(' Inter,sans-serif', ' "IBM Plex Sans",sans-serif')
    return s


def why_html(s):
    return s.replace(FONT_OLD, FONT_NEW)


def why_css(s):
    s = s.replace('--wp-sans:Inter,ui-sans-serif', '--wp-sans:"IBM Plex Sans",Inter,ui-sans-serif')
    s = s.replace('font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace', 'font-family:"IBM Plex Mono","SFMono-Regular",Consolas,"Liberation Mono",monospace')
    return s


def founder_base(s):
    s = s.replace('--fnd-sans:Inter,ui-sans-serif', '--fnd-sans:"IBM Plex Sans",Inter,ui-sans-serif')
    return s


def creator_en(s):
    s = s.replace(FONT_OLD, FONT_NEW)
    s = s.replace('font-family:Inter,ui-sans-serif', 'font-family:"IBM Plex Sans",ui-sans-serif')
    s = s.replace(' Inter,sans-serif', ' "IBM Plex Sans",sans-serif')
    return s


def founder_objects(s):
    # Service indices and ordinal numbers are Plex Sans; true coordinate notation remains Mono.
    s = s.replace('font:300 10px/1.2 var(--fnd-mono);letter-spacing:.13em', 'font:300 10px/1.2 var(--fnd-tech);letter-spacing:.13em')
    s = s.replace('font:300 10px/1 var(--fnd-mono);letter-spacing:.12em;color:var(--fnd-muted);', 'font:300 10px/1 var(--fnd-tech);letter-spacing:.12em;color:var(--fnd-muted);')
    s = s.replace('font:300 9px/1 var(--fnd-mono);letter-spacing:.1em;color:var(--fnd-muted)', 'font:300 9px/1 var(--fnd-tech);letter-spacing:.1em;color:var(--fnd-muted)')

    old = '''.founder-vo__distance{\n  margin-top:clamp(58px,8vw,128px);max-width:1180px;display:grid;grid-template-columns:auto minmax(120px,1fr) auto;\n  align-items:center;gap:18px;color:var(--fnd-muted);pointer-events:none;\n}\n.founder-vo__distance span{font:300 11px/1.2 var(--fnd-mono);letter-spacing:.17em;text-transform:uppercase}\n.founder-vo__distance-line{position:relative;height:1px;background:var(--vo-line)}'''
    new = '''.founder-vo__distance{\n  margin-top:clamp(58px,8vw,128px);max-width:1180px;display:grid;grid-template-columns:max-content minmax(120px,1fr) max-content;\n  align-items:center;gap:0;color:var(--fnd-muted);pointer-events:none;\n}\n.founder-vo__distance span{position:relative;z-index:1;font:300 11px/1.2 var(--fnd-tech);letter-spacing:.17em;text-transform:uppercase;white-space:nowrap}\n.founder-vo__distance-line{position:relative;z-index:0;height:1px;background:var(--vo-line);margin-inline:-10px}'''
    if old not in s:
        raise SystemExit('Founder distance desktop block not found; refusing blind patch')
    s = s.replace(old, new, 1)
    # On mobile the line is vertical-stack punctuation and must not bleed outside its row.
    s = s.replace('.founder-vo__distance-line{order:2}', '.founder-vo__distance-line{order:2;margin-inline:0}')
    return s


edit('index.html', main_page)
edit('en/index.html', main_page)
edit('why-p120/index.html', why_html)
edit('why-p120/why-p120.css', why_css)
edit('founder-editorial-story-v1.0.css', founder_base)
edit('en/creator/index.html', creator_en)
edit('founder-visual-objects-v1.0.css', founder_objects)
