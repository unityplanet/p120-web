from pathlib import Path
import ast
import re

TARGET = Path('/app/e2e_runner.py')
PLACEHOLDER = 'unbound-in-v0.8-worker'
CANONICAL_RULESET_SHA256 = '2e436fd61f9ac4f3ff0ce3e30565bcc7bda62b0f7aa12a407729e1c5f1d40c84'

if re.fullmatch(r'[0-9a-f]{64}', CANONICAL_RULESET_SHA256) is None:
    raise SystemExit('P120_PROVENANCE_PATCH_VALIDATION_FAILED')

if not TARGET.exists():
    raise SystemExit('P120_PROVENANCE_PATCH_TARGET_MISSING')

source = TARGET.read_text(encoding='utf-8')
placeholder_count = source.count(PLACEHOLDER)
if placeholder_count != 1:
    raise SystemExit(f'P120_PROVENANCE_PATCH_PLACEHOLDER_COUNT:{placeholder_count}')

patched = source.replace(PLACEHOLDER, CANONICAL_RULESET_SHA256)

try:
    tree = ast.parse(patched)
except SyntaxError as exc:
    raise SystemExit(f'P120_PROVENANCE_PATCH_SYNTAX_ERROR:{exc.lineno}')

bindings = 0
for node in ast.walk(tree):
    if not isinstance(node, ast.Dict):
        continue
    for key, value in zip(node.keys, node.values):
        if (
            isinstance(key, ast.Constant)
            and key.value == 'ruleset_sha256'
            and isinstance(value, ast.Constant)
            and value.value == CANONICAL_RULESET_SHA256
        ):
            bindings += 1

if bindings != 1:
    raise SystemExit(f'P120_PROVENANCE_PATCH_BINDING_COUNT:{bindings}')
if PLACEHOLDER in patched:
    raise SystemExit('P120_PROVENANCE_PATCH_PLACEHOLDER_REMAINS')

compile(patched, str(TARGET), 'exec')
TARGET.write_text(patched, encoding='utf-8')

roundtrip = TARGET.read_text(encoding='utf-8')
if roundtrip.count(CANONICAL_RULESET_SHA256) < 1 or PLACEHOLDER in roundtrip:
    raise SystemExit('P120_PROVENANCE_PATCH_ROUNDTRIP_FAILED')

print(
    'P120_PROVENANCE_PATCH PASS '
    f'ruleset_sha256={CANONICAL_RULESET_SHA256} '
    f'bindings={bindings}'
)
