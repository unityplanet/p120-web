from pathlib import Path
import ast

p=Path('/app/e2e_runner.py')
s=p.read_text(encoding='utf-8')

# Resolve the actual canonical helper parameter name instead of assuming it.
tree=ast.parse(s)
fn=next((n for n in ast.walk(tree) if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef)) and n.name=='_schema_compat'),None)
if fn is None or not fn.args.args:
    raise SystemExit('P120_COMPAT_PATCH_SCHEMA_HELPER_NOT_FOUND')
source_arg=fn.args.args[0].arg
if not source_arg.isidentifier():
    raise SystemExit('P120_COMPAT_PATCH_INVALID_SCHEMA_ARG')

needle='''    if prefix:\n        variants = [_schema_compat(x) for x in prefix]\n        if len(variants) == 1:\n            out["items"] = variants[0]\n        else:\n            out["items"] = {"anyOf": variants}\n    return out\n'''
replacement=f'''    if prefix:\n        variants = [_schema_compat(x) for x in prefix]\n        if len(variants) == 1:\n            out["items"] = variants[0]\n        else:\n            out["items"] = {{"anyOf": variants}}\n\n    # Staging transport compatibility only: OpenAI strict Structured Outputs\n    # requires explicit JSON types for enum/const leaves. Canonical P-120\n    # schemas remain unchanged; deterministic validators still enforce all\n    # removed assertion keywords and authority rules downstream.\n    if "type" not in out:\n        if "const" in out:\n            value = out["const"]\n            if value is None: out["type"] = "null"\n            elif isinstance(value, bool): out["type"] = "boolean"\n            elif isinstance(value, int): out["type"] = "integer"\n            elif isinstance(value, float): out["type"] = "number"\n            elif isinstance(value, str): out["type"] = "string"\n        elif "enum" in out and out["enum"]:\n            vals = out["enum"]\n            if all(isinstance(v, str) for v in vals): out["type"] = "string"\n            elif all(isinstance(v, bool) for v in vals): out["type"] = "boolean"\n            elif all(isinstance(v, int) and not isinstance(v, bool) for v in vals): out["type"] = "integer"\n            elif all(isinstance(v, (int, float)) and not isinstance(v, bool) for v in vals): out["type"] = "number"\n\n    # The canonical analytical schema constrains synthesis_id with a regex.\n    # OpenAI strict Structured Outputs does not accept that assertion keyword.\n    # Compile only this one identifier language into a finite staging transport\n    # vocabulary. Canonical regex validation remains authoritative downstream.\n    if {source_arg}.get("pattern") == r"^SYN-[A-Za-z0-9._-]+$":\n        out["type"] = "string"\n        out["enum"] = [f"SYN-{{i:03d}}" for i in range(1, 65)]\n\n    return out\n'''
if needle not in s:
    raise SystemExit('P120_COMPAT_PATCH_TARGET_NOT_FOUND')
patched=s.replace(needle,replacement)
# Syntax-check the exact patched runtime before writing it into the image.
ast.parse(patched)
p.write_text(patched,encoding='utf-8')
print(f'P120_COMPAT_PATCH PASS parameter={source_arg} explicit enum/const types + SYN transport enum')

# Build-time diagnostic only. No prompts, respondent data or provider output are printed.
# Reveal the transport wrapper implementation around the schema-conversion call so the
# next compatibility patch can be source-exact rather than guessed.
lines=patched.splitlines()
target=next((i for i,line in enumerate(lines) if 'fmt["schema"] = _schema_compat(fmt["schema"])' in line),None)
if target is None:
    raise SystemExit('P120_TRANSPORT_DIAGNOSTIC_TARGET_NOT_FOUND')
lo=max(0,target-18); hi=min(len(lines),target+42)
print('=== P120 TRANSPORT WRAPPER DIAGNOSTIC START ===')
for idx in range(lo,hi):
    print(f'{idx+1:04d}: {lines[idx]}')
print('=== P120 TRANSPORT WRAPPER DIAGNOSTIC END ===')
