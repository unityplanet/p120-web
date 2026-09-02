from pathlib import Path

FILES=[Path('system/index.html'),Path('en/system/index.html')]
OLD="if(entryParams.get('start')==='1'){location.replace('system/');return}"
NEW="if(entryParams.get('start')==='1'){location.replace(location.pathname);return}"

changed=[]
for p in FILES:
    s=p.read_text(encoding='utf-8')
    if NEW in s:
        continue
    if OLD not in s:
        raise SystemExit(f'start-route marker missing in {p}')
    s=s.replace(OLD,NEW,1)
    p.write_text(s,encoding='utf-8')
    changed.append(str(p))

print('Normalized direct System ?start=1 route handling:', ', '.join(changed) if changed else 'already current')
