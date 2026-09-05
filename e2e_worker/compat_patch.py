from pathlib import Path

p=Path('/app/e2e_runner.py')
s=p.read_text(encoding='utf-8')
needle='''    if prefix:\n        variants = [_schema_compat(x) for x in prefix]\n        if len(variants) == 1:\n            out["items"] = variants[0]\n        else:\n            out["items"] = {"anyOf": variants}\n    return out\n'''
replacement='''    if prefix:\n        variants = [_schema_compat(x) for x in prefix]\n        if len(variants) == 1:\n            out["items"] = variants[0]\n        else:\n            out["items"] = {"anyOf": variants}\n\n    # Staging transport compatibility only: OpenAI strict Structured Outputs\n    # requires explicit JSON types for enum/const leaves. Canonical P-120\n    # schemas remain unchanged; deterministic validators still enforce all\n    # removed assertion keywords and authority rules downstream.\n    if "type" not in out:\n        if "const" in out:\n            value = out["const"]\n            if value is None: out["type"] = "null"\n            elif isinstance(value, bool): out["type"] = "boolean"\n            elif isinstance(value, int): out["type"] = "integer"\n            elif isinstance(value, float): out["type"] = "number"\n            elif isinstance(value, str): out["type"] = "string"\n        elif "enum" in out and out["enum"]:\n            vals = out["enum"]\n            if all(isinstance(v, str) for v in vals): out["type"] = "string"\n            elif all(isinstance(v, bool) for v in vals): out["type"] = "boolean"\n            elif all(isinstance(v, int) and not isinstance(v, bool) for v in vals): out["type"] = "integer"\n            elif all(isinstance(v, (int, float)) and not isinstance(v, bool) for v in vals): out["type"] = "number"\n    return out\n'''
if needle not in s:
    raise SystemExit('P120_COMPAT_PATCH_TARGET_NOT_FOUND')
p.write_text(s.replace(needle,replacement),encoding='utf-8')
print('P120_COMPAT_PATCH PASS explicit enum/const types added')
