from pathlib import Path

ROUTES = [
    (Path('science/index.html'), 'p120_science_page_state_ru_v1'),
    (Path('en/science/index.html'), 'p120_science_page_state_en_v1'),
]
MARKER = '<script id="p120-dedicated-science-bootstrap-v2">'
OLD_TAG = '<script src="p120-scientific-base-runtime-v1.0.js?v=sbm10" data-p120-scientific-base-runtime="v1.0"></script>'
TAG = '<script src="../p120-scientific-base-runtime-v1.0.js?v=sbm10" data-p120-scientific-base-runtime="v1.0"></script>'
LEGACY = "const KEY='p120_web_prototype_v01';"

for path, science_key in ROUTES:
    text = path.read_text(encoding='utf-8')

    # Dedicated Scientific Base pages must not own or mutate the historical
    # pre-PASS3 respondent migration source. Their dormant monolithic state is
    # isolated into a page-specific, locale-specific key until PASS 4 removes it.
    if LEGACY in text:
        if text.count(LEGACY) != 1:
            raise SystemExit(f'{path}: legacy state-key occurrence mismatch: {text.count(LEGACY)}')
        text = text.replace(LEGACY, f"const KEY='{science_key}';", 1)
    elif f"const KEY='{science_key}';" not in text:
        raise SystemExit(f'{path}: neither legacy nor expected Science state key found')

    # Both dedicated routes have <base href="../">. Using ../ here resolves the
    # runtime to the repository root for both /science/ and /en/science/.
    if OLD_TAG in text:
        if text.count(OLD_TAG) != 1:
            raise SystemExit(f'{path}: old runtime tag occurrence mismatch')
        text = text.replace(OLD_TAG, TAG, 1)

    count = text.count(TAG)
    if count > 1:
        raise SystemExit(f'{path}: duplicate Scientific Base runtime tags: {count}')
    if count == 0:
        if text.count(MARKER) != 1:
            raise SystemExit(f'{path}: dedicated science bootstrap marker mismatch')
        text = text.replace(MARKER, TAG + '\n' + MARKER, 1)

    path.write_text(text, encoding='utf-8')
    print(f'{path}: MATERIALIZED / STATE ISOLATED / ROOT-SAFE')

print('P120 Scientific Base production migration materializer: PASS')
