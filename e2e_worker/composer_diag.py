from pathlib import Path
import ast

FILES = [
    Path('/app/p120_report/composer.py'),
    Path('/app/p120_report/definitions.py'),
    Path('/app/p120_interpretation/schema.py'),
    Path('/app/p120_interpretation/runtime.py'),
    Path('/app/p120_interpretation/validator.py'),
]

print('=== P120 REPORT-PLAN DIAGNOSTIC START ===')
for path in FILES:
    print(f'--- FILE {path} ---')
    text = path.read_text(encoding='utf-8')
    tree = ast.parse(text)
    lines = text.splitlines()

    # Print function inventory and exact bodies for relevant analytical/report functions.
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            print(f'FUNCTION_NAME {node.name}')
            if any(token in node.name.lower() for token in ('schema','analytical','validate','compose','report_plan','publication')):
                end = getattr(node, 'end_lineno', node.lineno)
                print(f'--- FUNCTION {node.name} lines {node.lineno}-{end} ---')
                print('\n'.join(lines[node.lineno-1:end]))

    # Print assignments whose names or values control report sizing / synthesis structure.
    for node in tree.body:
        names=[]
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name): names.append(target.id)
        elif isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
            names.append(node.target.id)
        if names and any(any(token in name for token in ('PUBLICATION','PROFILE','MODE','LIMIT','SECTION')) for name in names):
            end=getattr(node,'end_lineno',node.lineno)
            print(f'--- ASSIGN {names} lines {node.lineno}-{end} ---')
            print('\n'.join(lines[node.lineno-1:end]))

    for i, line in enumerate(lines, 1):
        if any(token in line for token in ('max_blocks','synthesis_units','maxItems','minItems','report_mode','selected_claim_ids','omitted_claim_ids')):
            print(f'LINE {i}: {line}')
print('=== P120 REPORT-PLAN DIAGNOSTIC END ===')
