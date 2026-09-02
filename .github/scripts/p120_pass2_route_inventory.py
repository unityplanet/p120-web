from pathlib import Path
import re

src = Path('system/index.html').read_text(encoding='utf-8')
start = src.find('<!-- inlined: app.js -->')
if start < 0:
    raise SystemExit('app.js marker not found')
end = src.find('</script>', start)
if end < 0:
    raise SystemExit('app.js close not found')
app = src[start:end]

# Collect every app-runtime line containing Cyrillic. This is intentionally
# conservative: PASS 2 needs a complete presentation-language inventory before
# native EN materialization.
rows=[]
for n,line in enumerate(app.splitlines(),1):
    if re.search(r'[А-Яа-яЁё]', line):
        rows.append(f'{n:04d}\t{line.rstrip()}')

out = Path('P120_WEB_RECONCILIATION_PASS2_CYRILLIC_RUNTIME_INVENTORY.txt')
out.write_text(
    'P120 WEB RECONCILIATION PASS 2 — CYRILLIC RUNTIME INVENTORY\n'
    'Scope: system/index.html app.js block only\n'
    f'Lines containing Cyrillic: {len(rows)}\n\n' + '\n'.join(rows) + '\n',
    encoding='utf-8'
)
print(f'PASS2 inventory lines: {len(rows)}')
