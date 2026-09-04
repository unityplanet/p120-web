#!/usr/bin/env python3
import ast
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RU = ROOT / 'why-p120/index.html'
EN = ROOT / 'en/why-p120/index.html'
JS = ROOT / 'why-p120/why-p120.js'
STATIC_CSS = ROOT / 'why-p120/why-p120-firstpaint.css'
PAIR_CACHE = ROOT / 'qa/why-p120/translation-pairs-v1.json'

for p in (RU, EN, JS):
    if not p.exists():
        raise SystemExit(f'Missing required file: {p}')

ru = RU.read_text(encoding='utf-8')
en_current = EN.read_text(encoding='utf-8')
js = JS.read_text(encoding='utf-8')

# 1. Extract the critical responsive/mobile CSS that was previously injected
#    from JavaScript after first paint, then remove that injection block.
start_token = '  /* Why P-120 mobile corrective pass v4.'
keep_token = '  /* Keep RU and EN visually identical while preventing language leakage.'
if start_token in js:
    start = js.index(start_token)
    keep = js.index(keep_token, start)
    block = js[start:keep]
    m = re.search(r'style\.textContent=`(.*?)`;\n\s*document\.head\.appendChild\(style\);', block, re.S)
    if not m:
        raise SystemExit('Could not extract runtime mobile CSS')
    static_css = '/* P-120 Why P-120 — first-paint staticized responsive layer.\n   MICRO-POLISH only; composition unchanged. */\n' + m.group(1).strip() + '\n'
    STATIC_CSS.write_text(static_css, encoding='utf-8')
    js = js[:start] + '  /* Critical responsive/mobile CSS is staticized in why-p120-firstpaint.css. */\n\n' + js[keep:]
elif STATIC_CSS.exists():
    static_css = STATIC_CSS.read_text(encoding='utf-8')
else:
    raise SystemExit('Runtime mobile CSS block already absent but static CSS is missing')

# 2. Stabilize the RU first paint before any external stylesheet/font arrives.
first_paint_guard = (
    '  <meta name="color-scheme" content="dark" />\n'
    '  <style id="wp-first-paint-guard">'
    'html,body{margin:0;background:#090b0c;color:#f3eee5;color-scheme:dark}'
    'html{background:#090b0c!important}'
    'body.wp-fixed-editorial-theme{background:#090b0c}'
    '</style>\n'
)
if 'id="wp-first-paint-guard"' not in ru:
    anchor = '  <meta name="theme-color" content="#090b0c" id="theme-color-meta" />\n'
    if anchor not in ru:
        raise SystemExit('RU theme-color anchor not found')
    ru = ru.replace(anchor, anchor + first_paint_guard, 1)

ru = ru.replace('.wp-fixed-editorial-theme{color-scheme:light}', '.wp-fixed-editorial-theme{color-scheme:dark}')
ru = ru.replace('<body class="wp-fixed-editorial-theme">', '<body class="wp-fixed-editorial-theme" style="background:#090b0c">', 1)

static_link = '  <link id="wp-mobile-origin-corrective-v4" rel="stylesheet" href="why-p120-firstpaint.css?v=fp1" />\n'
if 'id="wp-mobile-origin-corrective-v4"' not in ru:
    anchor = '  <link rel="stylesheet" href="why-p120.css" />\n'
    if anchor not in ru:
        raise SystemExit('RU primary stylesheet anchor not found')
    ru = ru.replace(anchor, anchor + static_link, 1)

ru = re.sub(r'<script src="why-p120\.js\?v=[^"]+"></script>', '<script src="why-p120.js?v=firstpaint-v1"></script>', ru, count=1)

# 3. Preserve the existing EN translation map before removing the loader route.
PAIR_CACHE.parent.mkdir(parents=True, exist_ok=True)
if 'const pairs=[' in en_current:
    m = re.search(r'const pairs=\[(.*?)\n\s*\];', en_current, re.S)
    if not m:
        raise SystemExit('EN translation pair block not found')
    pairs = ast.literal_eval('[' + m.group(1) + ']')
    PAIR_CACHE.write_text(json.dumps(pairs, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
elif PAIR_CACHE.exists():
    pairs = json.loads(PAIR_CACHE.read_text(encoding='utf-8'))
else:
    raise SystemExit('EN loader already absent and translation-pair cache missing')

# 4. Materialize EN as a real static page. No route-loader, fetch or document.write.
en = ru.replace('<html lang="ru">', '<html lang="en">', 1)
en = en.replace('<head>', '<head>\n  <base href="../../why-p120/">', 1)
for a, b in pairs:
    en = en.replace(a, b)

# Defensive parity repairs for elements introduced after older translation maps.
en = en.replace('aria-label="Язык"', 'aria-label="Language"')
en = en.replace('>От создателя</a>', '>From the Creator</a>')
en = en.replace('>Почему P-120?</a>', '>Why P-120?</a>')
en = en.replace('>О P-120</a>', '>About P-120</a>')
en = en.replace('>Уникальность</a>', '>What makes it different</a>')
en = en.replace('>Что покажет</a>', '>What it can show</a>')
en = en.replace('>Отчёт</a>', '>Report</a>')
en = en.replace('>Научная база</a>', '>Scientific Base</a>')

RU.write_text(ru, encoding='utf-8')
EN.write_text(en, encoding='utf-8')
JS.write_text(js, encoding='utf-8')

# 5. Acceptance gates: first-paint architecture only; frozen composition untouched.
for label, text in [('RU', ru), ('EN', en)]:
    if 'id="wp-first-paint-guard"' not in text:
        raise SystemExit(f'{label}: first-paint guard missing')
    if 'color-scheme:light' in text:
        raise SystemExit(f'{label}: light color-scheme leakage remains')
    if 'id="wp-mobile-origin-corrective-v4"' not in text:
        raise SystemExit(f'{label}: static critical CSS link missing')
    for cls in ('wp-act1', 'wp-act2', 'wp-act3', 'wp-act4', 'wp-venn-six', 'wp-pi-stage', 'wp-coordinate-stage'):
        if cls not in text:
            raise SystemExit(f'{label}: frozen landmark missing: {cls}')
    if text.count('wp-semantic-item') < 6:
        raise SystemExit(f'{label}: semantic object incomplete')

for forbidden in ('route-loader', "fetch(sourceUrl", 'document.open()', 'document.write('):
    if forbidden in en:
        raise SystemExit(f'EN: legacy loader primitive remains: {forbidden}')

if 'document.createElement(\'style\')' in js and 'wp-mobile-origin-corrective-v4' in js:
    raise SystemExit('JS: critical mobile CSS is still runtime-injected')
if not STATIC_CSS.exists() or STATIC_CSS.stat().st_size < 1000:
    raise SystemExit('Staticized first-paint CSS missing or unexpectedly small')

print('WHY P-120 FIRST-PAINT STABILIZATION: PASS')
print('RU: dark first-paint guard PASS')
print('EN: static materialization PASS')
print('Critical responsive CSS: staticized PASS')
print('Frozen composition landmarks: PRESERVED')
