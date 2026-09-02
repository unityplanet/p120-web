from pathlib import Path

ROUTES = [Path('science/index.html'), Path('en/science/index.html')]
MARKER = '<script id="p120-dedicated-science-bootstrap-v2">'
TAG = '<script src="p120-scientific-base-runtime-v1.0.js?v=sbm10" data-p120-scientific-base-runtime="v1.0"></script>'

for path in ROUTES:
    text = path.read_text(encoding='utf-8')
    count = text.count(TAG)
    if count > 1:
        raise SystemExit(f'{path}: duplicate Scientific Base runtime tags: {count}')
    if count == 0:
        if text.count(MARKER) != 1:
            raise SystemExit(f'{path}: dedicated science bootstrap marker mismatch')
        text = text.replace(MARKER, TAG + '\n' + MARKER, 1)
        path.write_text(text, encoding='utf-8')
        print(f'{path}: MATERIALIZED')
    else:
        print(f'{path}: ALREADY CURRENT')

print('P120 Scientific Base production migration materializer: PASS')
