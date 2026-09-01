from pathlib import Path
import hashlib

FONT_LEGACY = 'inter:400,500,600,700,800|noto-serif:400,500,600,700|noto-serif-display:500,600,700'
FONT_BASE = 'ibm-plex-mono:300,400,500|ibm-plex-sans:300,400,500,600,700|noto-serif:400,500,600,700|noto-serif-display:500,600,700'
FONT_PRATA = 'ibm-plex-mono:300,400,500|ibm-plex-sans:300,400,500,600,700|noto-serif:400,500,600,700|noto-serif-display:500,600,700|prata:400'
PATCH = 'prata-literary-voice-v1.0.css'
WHY_MARKER = '/* P-120 Why P-120 — Prata literary voice v1.0 */'


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


def main_page(s):
    before = {
        'instrument': sha(cut(s, 'window.P120_INSTRUMENT =', 'window.P120_SCIENCE=')),
        'assessment': sha(cut(s, 'function renderPreflight(){', 'function render(){')),
        'mobile': sha(cut(s, 'function renderMobileBottomNav(){', 'function renderMobileDrawer(){')),
    }
    n = add_prata_font(s)
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


def integration_workflow(s):
    s = add_prata_font(s)
    trigger = "      - 'navigation-architecture-v2.js'\n"
    if "      - 'prata-literary-voice-v1.0.css'\n" not in s:
        if trigger not in s:
            raise SystemExit('Integration workflow trigger anchor not found')
        s = s.replace(trigger, trigger + "      - 'prata-literary-voice-v1.0.css'\n", 1)

    bundle_anchor = "'navigation-architecture-v2.css','depth-statement-v1.2.css','visual-fix-v1.7.1j.css'"
    bundle_new = "'navigation-architecture-v2.css','depth-statement-v1.2.css','visual-fix-v1.7.1j.css','prata-literary-voice-v1.0.css'"
    if PATCH not in s[s.find('css_sources=['):s.find('js_sources=[')]:
        if bundle_anchor not in s:
            raise SystemExit('Integration workflow CSS bundle anchor not found')
        s = s.replace(bundle_anchor, bundle_new, 1)

    s = s.replace('pub20', 'pub21')
    s = s.replace('Final depth statement: v1.3 desktop-fit staircase Noto\\n',
                  'Final depth statement: v1.3 desktop-fit staircase Noto\\nPrata literary voice: v1.0 selective human/reflective narrative only\\n')
    return s


if __name__ == '__main__':
    if not Path(PATCH).exists():
        raise SystemExit(f'Missing {PATCH}')

    edit('index.html', main_page)
    edit('en/index.html', main_page)
    edit('why-p120/index.html', add_prata_font)
    edit('why-p120/why-p120.css', why_css)
    edit('.github/workflows/integrate-bilingual-public-site-v1.yml', integration_workflow)

    # Static conformance guards: Prata must not enter measurement/science/functional surfaces.
    patch = Path(PATCH).read_text(encoding='utf-8')
    forbidden = ['.qtext{', '.choice{', '.science-section{', '.navlink{', '.mobile-menu-link{', '.extended-module{']
    hits = [x for x in forbidden if x in patch]
    if hits:
        raise SystemExit(f'Prata boundary violation in patch selectors: {hits}')

    print('P-120 Prata sitewide typography migration: PASS')
