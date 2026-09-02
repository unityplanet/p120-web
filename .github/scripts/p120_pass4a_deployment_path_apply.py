from pathlib import Path

changes = [
    (
        Path('science/index.html'),
        '<script src="../p120-scientific-base-runtime-v1.0.js?v=sbm10" data-p120-scientific-base-runtime="v1.0"></script>',
        '<script src="p120-scientific-base-runtime-v1.0.js?v=sbm10" data-p120-scientific-base-runtime="v1.0"></script>',
        'RU Scientific Base runtime',
    ),
    (
        Path('en/science/index.html'),
        '<script src="../../p120-en-science-localization-runtime-v1.0.js?v=ensci10" data-p120-en-science-localization="v1.0"></script>',
        '<script src="../p120-en-science-localization-runtime-v1.0.js?v=ensci10" data-p120-en-science-localization="v1.0"></script>',
        'EN Scientific Base localization runtime',
    ),
]

for path, old, new, label in changes:
    text = path.read_text(encoding='utf-8')
    if new in text and old not in text:
        print(f'{label}: ALREADY CURRENT')
        continue
    if text.count(old) != 1:
        raise SystemExit(f'{path}: expected exactly one old path for {label}, found {text.count(old)}')
    text = text.replace(old, new, 1)
    path.write_text(text, encoding='utf-8')
    print(f'{label}: CORRECTED')

print('PASS 4A deployment-path materialization: PASS')
