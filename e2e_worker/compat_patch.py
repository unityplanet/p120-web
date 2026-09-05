from pathlib import Path
import ast
import json

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

schema_needle='''    if prefix:\n        variants = [_schema_compat(x) for x in prefix]\n        if len(variants) == 1:\n            out["items"] = variants[0]\n        else:\n            out["items"] = {"anyOf": variants}\n    return out\n'''
schema_replacement=f'''    if prefix:\n        variants = [_schema_compat(x) for x in prefix]\n        if len(variants) == 1:\n            out["items"] = variants[0]\n        else:\n            out["items"] = {{"anyOf": variants}}\n\n    # Staging transport compatibility only: OpenAI strict Structured Outputs\n    # requires explicit JSON types for enum/const leaves. Canonical P-120\n    # schemas remain unchanged; deterministic validators still enforce all\n    # removed assertion keywords and authority rules downstream.\n    if "type" not in out:\n        if "const" in out:\n            value = out["const"]\n            if value is None: out["type"] = "null"\n            elif isinstance(value, bool): out["type"] = "boolean"\n            elif isinstance(value, int): out["type"] = "integer"\n            elif isinstance(value, float): out["type"] = "number"\n            elif isinstance(value, str): out["type"] = "string"\n        elif "enum" in out and out["enum"]:\n            vals = out["enum"]\n            if all(isinstance(v, str) for v in vals): out["type"] = "string"\n            elif all(isinstance(v, bool) for v in vals): out["type"] = "boolean"\n            elif all(isinstance(v, int) and not isinstance(v, bool) for v in vals): out["type"] = "integer"\n            elif all(isinstance(v, (int, float)) and not isinstance(v, bool) for v in vals): out["type"] = "number"\n\n    # The canonical analytical schema constrains synthesis_id with a regex.\n    # OpenAI strict Structured Outputs does not accept that assertion keyword.\n    # Compile only this one identifier language into a finite staging transport\n    # vocabulary. Canonical regex validation remains authoritative downstream.\n    if {source_arg}.get("pattern") == r"^SYN-[A-Za-z0-9._-]+$":\n        out["type"] = "string"\n        out["enum"] = [f"SYN-{{i:03d}}" for i in range(1, 65)]\n\n    return out\n'''
if schema_needle not in s:
    raise SystemExit('P120_COMPAT_PATCH_TARGET_NOT_FOUND')
patched=s.replace(schema_needle,schema_replacement)

transport_needle='''class BridgeTransport:\n    def __call__(self, body):\n        request_body = copy.deepcopy(body)\n        request_body.setdefault("metadata", {})["p120_e2e_run"] = E2E_RUN\n        fmt = request_body.get("text", {}).get("format", {})\n        if isinstance(fmt.get("schema"), dict):\n            fmt["schema"] = _schema_compat(fmt["schema"])\n        status, payload = bridge({"action": "openai", "request": request_body}, timeout=240)\n        return status, payload\n'''
transport_replacement='''def _find_claim_enum(node):\n    if isinstance(node, dict):\n        vals = node.get("enum")\n        if isinstance(vals, list) and vals and all(isinstance(v, str) and v.startswith("CLM-") for v in vals):\n            return list(vals)\n        for value in node.values():\n            found = _find_claim_enum(value)\n            if found:\n                return found\n    elif isinstance(node, list):\n        for value in node:\n            found = _find_claim_enum(value)\n            if found:\n                return found\n    return None\n\n\ndef _compile_analytical_partition_schema(schema):\n    if not isinstance(schema, dict):\n        return schema, None\n    props = schema.get("properties")\n    if not isinstance(props, dict):\n        return schema, None\n    required_keys = {"selected_claim_ids", "omitted_claim_ids", "synthesis_units"}\n    if not required_keys.issubset(props.keys()):\n        return schema, None\n\n    selected_ids = _find_claim_enum(props["selected_claim_ids"])\n    omitted_ids = _find_claim_enum(props["omitted_claim_ids"])\n    if not selected_ids or not omitted_ids or set(selected_ids) != set(omitted_ids):\n        raise RuntimeError("P120_ANALYTICAL_PARTITION_ENUM_MISMATCH")\n    if len(selected_ids) != len(set(selected_ids)):\n        raise RuntimeError("P120_ANALYTICAL_PARTITION_DUPLICATE_CLAIM_ID")\n\n    # Lossless staging transport encoding: every eligible claim receives exactly\n    # one explicit model disposition. This does not authorize, add, drop or repair\n    # claims; the untouched canonical validator remains authoritative afterward.\n    out = copy.deepcopy(schema)\n    out_props = out["properties"]\n    out_props.pop("selected_claim_ids", None)\n    out_props.pop("omitted_claim_ids", None)\n    out_props["claim_dispositions"] = {\n        "type": "object",\n        "properties": {\n            cid: {"type": "string", "enum": ["selected", "omitted"]}\n            for cid in selected_ids\n        },\n        "required": list(selected_ids),\n        "additionalProperties": False,\n    }\n    req = [x for x in out.get("required", []) if x not in ("selected_claim_ids", "omitted_claim_ids")]\n    if "claim_dispositions" not in req:\n        req.append("claim_dispositions")\n    out["required"] = req\n    return out, list(selected_ids)\n\n\ndef _decode_claim_partition_object(obj, allowed_ids):\n    if not isinstance(obj, dict):\n        raise RuntimeError("P120_ANALYTICAL_PARTITION_OUTPUT_NOT_OBJECT")\n    dispositions = obj.get("claim_dispositions")\n    if not isinstance(dispositions, dict):\n        raise RuntimeError("P120_ANALYTICAL_PARTITION_DISPOSITIONS_MISSING")\n    if set(dispositions.keys()) != set(allowed_ids):\n        raise RuntimeError("P120_ANALYTICAL_PARTITION_KEYS_INCOMPLETE")\n    if any(v not in ("selected", "omitted") for v in dispositions.values()):\n        raise RuntimeError("P120_ANALYTICAL_PARTITION_INVALID_DISPOSITION")\n    if "selected_claim_ids" in obj or "omitted_claim_ids" in obj:\n        raise RuntimeError("P120_ANALYTICAL_PARTITION_MIXED_REPRESENTATION")\n\n    decoded = copy.deepcopy(obj)\n    decoded.pop("claim_dispositions", None)\n    decoded["selected_claim_ids"] = [cid for cid in allowed_ids if dispositions[cid] == "selected"]\n    decoded["omitted_claim_ids"] = [cid for cid in allowed_ids if dispositions[cid] == "omitted"]\n    return decoded\n\n\ndef _decode_analytical_partition_payload(payload, allowed_ids):\n    converted = 0\n\n    def walk(node):\n        nonlocal converted\n        if isinstance(node, dict):\n            if node.get("type") == "output_text" and isinstance(node.get("text"), str):\n                try:\n                    parsed = json.loads(node["text"])\n                except Exception as exc:\n                    raise RuntimeError(f"P120_ANALYTICAL_PARTITION_TEXT_NOT_JSON:{type(exc).__name__}")\n                if isinstance(parsed, dict) and "claim_dispositions" in parsed:\n                    decoded = _decode_claim_partition_object(parsed, allowed_ids)\n                    node["text"] = json.dumps(decoded, ensure_ascii=False, separators=(",", ":"))\n                    converted += 1\n                    return\n            for value in node.values():\n                walk(value)\n        elif isinstance(node, list):\n            for value in node:\n                walk(value)\n\n    walk(payload)\n    if converted != 1:\n        raise RuntimeError(f"P120_ANALYTICAL_PARTITION_DECODE_COUNT:{converted}")\n    return payload\n\n\nclass BridgeTransport:\n    def __call__(self, body):\n        request_body = copy.deepcopy(body)\n        request_body.setdefault("metadata", {})["p120_e2e_run"] = E2E_RUN\n        fmt = request_body.get("text", {}).get("format", {})\n        analytical_claim_ids = None\n        if isinstance(fmt.get("schema"), dict):\n            transport_schema, analytical_claim_ids = _compile_analytical_partition_schema(fmt["schema"])\n            fmt["schema"] = _schema_compat(transport_schema)\n        status, payload = bridge({"action": "openai", "request": request_body}, timeout=240)\n        if analytical_claim_ids is not None and status == 200:\n            payload = _decode_analytical_partition_payload(payload, analytical_claim_ids)\n        return status, payload\n'''
if transport_needle not in patched:
    raise SystemExit('P120_TRANSPORT_PATCH_TARGET_NOT_FOUND')
patched=patched.replace(transport_needle,transport_replacement)

# Syntax-check the exact patched runtime before writing it into the image.
ast.parse(patched)
p.write_text(patched,encoding='utf-8')
print(f'P120_COMPAT_PATCH PASS parameter={source_arg} explicit types + SYN enum + analytical partition codec')

# Diagnostic inventory of canonical schema regex constraints in packaged runtime.
# Only literal regex strings are emitted; no prompts, respondent data or outputs.
patterns=set()
for root in [Path('/app/p120_interpretation'),Path('/app/p120_report'),Path('/app/p120_release')]:
    if not root.exists():
        continue
    for py in root.rglob('*.py'):
        try:
            t=ast.parse(py.read_text(encoding='utf-8'))
        except Exception:
            continue
        for n in ast.walk(t):
            if isinstance(n, ast.Dict):
                for k,v in zip(n.keys,n.values):
                    if isinstance(k,ast.Constant) and k.value=='pattern' and isinstance(v,ast.Constant) and isinstance(v.value,str):
                        patterns.add(v.value)
print('=== P120 CANONICAL PATTERN INVENTORY START ===')
for value in sorted(patterns):
    print(value)
print('=== P120 CANONICAL PATTERN INVENTORY END ===')
