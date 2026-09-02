from pathlib import Path

p=Path('en/science/index.html')
s=p.read_text(encoding='utf-8')
tag='<script src="../../p120-en-science-localization-runtime-v1.0.js?v=ensci10" data-p120-en-science-localization="v1.0"></script>'
if tag in s:
    print('EN Scientific Base localization runtime already bound.')
else:
    marker='</body>'
    if marker not in s:
        raise SystemExit('en/science/index.html missing </body> marker')
    s=s.replace(marker,tag+'\n'+marker,1)
    p.write_text(s,encoding='utf-8')
    print('Bound controlled EN Scientific Base localization runtime after dedicated science bootstrap.')
