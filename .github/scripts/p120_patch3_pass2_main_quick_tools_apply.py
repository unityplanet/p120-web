from pathlib import Path

path=Path('p120-brand-system-v1.0.js')
text=path.read_text(encoding='utf-8')
old="window.P120_BRAND_SYSTEM=Object.freeze({version:'5.3',revision:'5.3.3'"
new="window.P120_BRAND_SYSTEM=Object.freeze({version:'5.3',revision:'5.3.2'"
assert old in text, 'PATCH 3 temporary revision marker not found'
path.write_text(text.replace(old,new,1),encoding='utf-8')
print('PATCH 3 / PASS 2 frozen brand revision preserved')
