from pathlib import Path
import hashlib
import re

FONT_LEGACY = 'inter:400,500,600,700,800|noto-serif:400,500,600,700|noto-serif-display:500,600,700'
FONT_BASE = 'ibm-plex-mono:300,400,500|ibm-plex-sans:300,400,500,600,700|noto-serif:400,500,600,700|noto-serif-display:500,600,700'
FONT_PRATA = 'ibm-plex-mono:300,400,500|ibm-plex-sans:300,400,500,600,700|noto-serif:400,500,600,700|noto-serif-display:500,600,700|prata:400'
PATCH = 'prata-literary-voice-v1.0.css'
WHY_MARKER = '/* P-120 Why P-120 — Prata literary voice v1.0 */'
ROOT_LINK = '<link rel="stylesheet" href="prata-literary-voice-v1.0.css?v=prata10" data-p120-prata-literary="v1.0" />'
EN_LINK = '<link rel="stylesheet" href="../prata-literary-voice-v1.0.css?v=prata10" data-p120-prata-literary="v1.0" />'


def sha(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def cut(text, start, end):
    a = text.index(start)
    b = text.index(end, a)
    return text[a:b]


def edit(path, fn):
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    n = fn(s)
    if n == s:
        print(f'UNCHANGED {path}')
    else:
        p.write_text(n, encoding='utf-8')
        print(f'UPDATED {path}')


def add_prata_font(s):
    s = s.replace(FONT_LEGACY, FONT_PRATA)
    s = s.replace(FONT_BASE, FONT_PRATA)
    return s


def ensure_public_link(s, link):
    # Idempotently remove an older direct Prata link, then install one canonical current link.
    s = re.sub(r'\s*<link[^>]+data-p120-prata-literary=["\'][^"\']+["\'][^>]*>\s*', '\n', s, flags=re.I)
    if '</head>' not in s:
        raise SystemExit('Missing </head> while installing Prata literary layer')
    return s.replace('</head>', f'  {link}\n</head>', 1)


def main_page(s, link):
    before = {
        'instrument': sha(cut(s, 'window.P120_INSTRUMENT =', 'window.P120_SCIENCE=')),
        'assessment': sha(cut(s, 'function renderPreflight(){', 'function render(){')),
        'mobile': sha(cut(s, 'function renderMobileBottomNav(){', 'function renderMobileDrawer(){')),
    }
    n = ensure_public_link(add_prata_font(s), link)
    after = {
        'instrument': sha(cut(n, 'window.P120_INSTRUMENT =', 'window.P120_SCIENCE=')),
        'assessment': sha(cut(n, 'function renderPreflight(){', 'function render(){')),
        'mobile': sha(cut(n, 'function renderMobileBottomNav(){', 'function renderMobileDrawer(){')),
    }
    if before != after:
        raise SystemExit(f'LOCK VIOLATION in main page: {before} != {after}')
    return n


def why_css(s):
    if WHY_MARKER in s:
        return s
    return s.rstrip() + '''\n\n''' + WHY_MARKER + '''
:root{--wp-literary:"Prata","Noto Serif",Georgia,"Times New Roman",serif}

/* Brand-origin narrative uses the secondary human/literary voice.
   Display titles, symbolic objects, semantics, labels and navigation remain Noto/Plex. */
.wp-body,
.wp-act2-note,
.wp-act2-note span,
.wp-act2-note strong,
.wp-pi-caption{
  font-family:var(--wp-literary)!important;
  font-weight:400!important;
  font-style:normal!important;
}
.wp-body{letter-spacing:-.004em}
.wp-act2-note{letter-spacing:-.002em}
.wp-pi-caption{letter-spacing:-.006em;line-height:1.42}

/* Explicit protection of authoritative display and functional/technical layers. */
.wp-display,
.wp-big-p120,
.wp-equation,
.wp-venn-num,
.wp-venn-result,
.wp-bg-letter,
.wp-act2-letter,
.wp-semantic-en,
.wp-pi-p,
.wp-pi-mark{
  font-family:var(--wp-serif)!important;
}
.wp-nav,.wp-header-tools,.wp-eyebrow,.wp-semantic-detail,.wp-semantic-ru,.wp-btn,.wp-scroll-cue{font-family:var(--wp-sans)!important}
.wp-decimals{font-family:"IBM Plex Mono","SFMono-Regular",Consolas,"Liberation Mono",monospace!important}

@media(max-width:720px){
  .wp-body{letter-spacing:0;line-height:1.72}
  .wp-pi-caption{line-height:1.46}
}
'''


if __name__ == '__main__':
    if not Path(PATCH).exists():
        raise SystemExit(f'Missing {PATCH}')

    edit('index.html', lambda s: main_page(s, ROOT_LINK))
    edit('en/index.html', lambda s: main_page(s, EN_LINK))
    edit('why-p120/index.html', add_prata_font)
    edit('why-p120/why-p120.css', why_css)

    # Static conformance guards: Prata must not enter measurement/science/functional surfaces.
    patch = Path(PATCH).read_text(encoding='utf-8')
    forbidden = ['.qtext{', '.choice{', '.science-section{', '.navlink{', '.mobile-menu-link{', '.extended-module{']
    hits = [x for x in forbidden if x in patch]
    if hits:
        raise SystemExit(f'Prata boundary violation in patch selectors: {hits}')

    for f, marker in [('index.html', ROOT_LINK), ('en/index.html', EN_LINK)]:
        text = Path(f).read_text(encoding='utf-8')
        if text.count('data-p120-prata-literary="v1.0"') != 1 or marker not in text:
            raise SystemExit(f'Prata direct-link conformance failed for {f}')

    print('P-120 Prata sitewide typography migration: PASS')
