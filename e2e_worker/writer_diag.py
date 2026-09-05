from pathlib import Path
import ast
import json

FILES = [
    Path('/app/e2e_runner.py'),
    Path('/app/p120_report/writer.py'),
    Path('/app/p120_report/validator.py'),
    Path('/app/p120_report/definitions.py'),
    Path('/app/p120_release/semantic.py'),
]

print('=== P120 WRITER TRANSPORT DIAGNOSTIC START ===')
for path in FILES:
    print(f'--- FILE {path} ---')
    text = path.read_text(encoding='utf-8')
    tree = ast.parse(text)
    lines = text.splitlines()
    for node in ast.walk(tree):
        if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef)):
            if node.name == '_schema_compat' or any(tok in node.name.lower() for tok in ('writer','schema','derivative','semantic','validate')):
                end=getattr(node,'end_lineno',node.lineno)
                print(f'--- FUNCTION {node.name} lines {node.lineno}-{end} ---')
                print('\n'.join(lines[node.lineno-1:end]))

print('=== P120 JSON-SCHEMA ASSERTION INVENTORY START ===')
keys={'minItems','maxItems','uniqueItems','minLength','maxLength','pattern','prefixItems','const','enum'}
for root in [Path('/app/p120_report'),Path('/app/p120_release')]:
    for py in root.rglob('*.py'):
        try:
            text=py.read_text(encoding='utf-8')
            tree=ast.parse(text)
        except Exception:
            continue
        lines=text.splitlines()
        for node in ast.walk(tree):
            if isinstance(node,ast.Dict):
                present=[]
                for k,v in zip(node.keys,node.values):
                    if isinstance(k,ast.Constant) and k.value in keys:
                        try: val=ast.literal_eval(v)
                        except Exception: val='<dynamic>'
                        present.append((k.value,val))
                if present:
                    print(f'{py}:{node.lineno}: {present}')
print('=== P120 JSON-SCHEMA ASSERTION INVENTORY END ===')
print('=== P120 WRITER TRANSPORT DIAGNOSTIC END ===')
