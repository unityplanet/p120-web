from pathlib import Path
import ast

FILES = [
    Path('/app/p120_report/composer.py'),
    Path('/app/p120_interpretation/schema.py'),
    Path('/app/p120_interpretation/runtime.py'),
]

print('=== P120 REPORT-PLAN DIAGNOSTIC START ===')
for path in FILES:
    print(f'--- FILE {path} ---')
    text = path.read_text(encoding='utf-8')
    tree = ast.parse(text)
    lines = text.splitlines()
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name in {
            'compose_report_plan', 'build_dynamic_schema', 'build_response_schema',
            'build_analytical_schema', 'run', 'interpret'
        }:
            end = getattr(node, 'end_lineno', node.lineno)
            print(f'--- FUNCTION {node.name} lines {node.lineno}-{end} ---')
            print('\n'.join(lines[node.lineno-1:end]))
    for i, line in enumerate(lines, 1):
        if any(token in line for token in ('MODE_', 'max_blocks', 'synthesis_units', 'maxItems', 'minItems', 'report_mode')):
            print(f'LINE {i}: {line}')
print('=== P120 REPORT-PLAN DIAGNOSTIC END ===')
