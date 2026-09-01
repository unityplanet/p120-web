from pathlib import Path

TARGETS = [
    (Path('creator/index.html'), '../'),
    (Path('en/creator/index.html'), '../../'),
]

for path, prefix in TARGETS:
    text = path.read_text(encoding='utf-8')

    # Request real IBM Plex Sans Light Italic / Regular Italic from Bunny Fonts.
    text = text.replace('ibm-plex-sans:300,400,500,600,700', 'ibm-plex-sans:300,300i,400,400i,500,600,700')
    text = text.replace('ibm-plex-sans:300,400,500,600', 'ibm-plex-sans:300,300i,400,400i,500,600')

    css = f'<link rel="stylesheet" href="{prefix}founder-marginal-typography-lab-v0.1.css?v=fndlab01" data-p120-founder-type-lab="v0.1" />'
    if css not in text:
        marker = 'data-p120-founder-visual="v1.0" />'
        pos = text.find(marker)
        if pos >= 0:
            line_end = text.find('\n', pos)
            text = text[:line_end+1] + '  ' + css + '\n' + text[line_end+1:]
        else:
            marker2 = 'founder-editorial-story-v1.0.css?v=fnd10" />'
            pos2 = text.find(marker2)
            if pos2 < 0:
                raise SystemExit(f'CSS insertion point not found: {path}')
            line_end = text.find('\n', pos2)
            text = text[:line_end+1] + '  ' + css + '\n' + text[line_end+1:]

    js = f'<script src="{prefix}founder-marginal-typography-lab-v0.1.js?v=fndlab01" data-p120-founder-type-lab="v0.1"></script>'
    if js not in text:
        text = text.replace('</body>', f'  {js}\n</body>')

    path.write_text(text, encoding='utf-8')
    print(f'updated {path}')
