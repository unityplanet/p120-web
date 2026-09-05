from pathlib import Path
import ast

p = Path('/app/e2e_runner.py')
s = p.read_text(encoding='utf-8')
tree = ast.parse(s)
cls = next((n for n in ast.walk(tree) if isinstance(n, ast.ClassDef) and n.name == 'BridgeTransport'), None)
if cls is None:
    raise SystemExit('P120_STRUCTURED_ARRAY_PATCH_BRIDGE_NOT_FOUND')

lines = s.splitlines(keepends=True)
start = cls.lineno - 1
end = cls.end_lineno

replacement = r'''def _schema_const(schema, property_name):
    if not isinstance(schema, dict):
        return None
    props = schema.get("properties")
    if not isinstance(props, dict):
        return None
    leaf = props.get(property_name)
    return leaf.get("const") if isinstance(leaf, dict) else None


def _compile_writer_transport_schema(schema):
    if _schema_const(schema, "schema_id") != "p120.derivative_report":
        return schema, None
    props = schema.get("properties", {})
    blocks_schema = props.get("blocks")
    if not isinstance(blocks_schema, dict):
        raise RuntimeError("P120_WRITER_BLOCK_SCHEMA_MISSING")
    block_defs = blocks_schema.get("prefixItems")
    if not isinstance(block_defs, list) or not block_defs:
        raise RuntimeError("P120_WRITER_BLOCK_PREFIX_MISSING")
    if blocks_schema.get("items") is not False:
        raise RuntimeError("P120_WRITER_BLOCK_TUPLE_NOT_CLOSED")
    if blocks_schema.get("minItems") != len(block_defs) or blocks_schema.get("maxItems") != len(block_defs):
        raise RuntimeError("P120_WRITER_BLOCK_CARDINALITY_MISMATCH")

    out = copy.deepcopy(schema)
    out_props = out["properties"]
    out_props.pop("blocks", None)
    block_slot_props = {}
    context_blocks = []

    for i, block_schema in enumerate(block_defs, 1):
        if not isinstance(block_schema, dict):
            raise RuntimeError("P120_WRITER_BLOCK_SCHEMA_INVALID")
        bprops = block_schema.get("properties")
        if not isinstance(bprops, dict):
            raise RuntimeError("P120_WRITER_BLOCK_PROPERTIES_MISSING")
        block_id_schema = bprops.get("block_id")
        sentences_schema = bprops.get("sentences")
        if not isinstance(block_id_schema, dict) or not isinstance(block_id_schema.get("const"), str):
            raise RuntimeError("P120_WRITER_BLOCK_ID_CONST_MISSING")
        block_id = block_id_schema["const"]
        if not isinstance(sentences_schema, dict) or not isinstance(sentences_schema.get("items"), dict):
            raise RuntimeError("P120_WRITER_SENTENCE_SCHEMA_MISSING")
        min_sent = sentences_schema.get("minItems")
        max_sent = sentences_schema.get("maxItems")
        if min_sent != 1 or not isinstance(max_sent, int) or max_sent < 1:
            raise RuntimeError(f"P120_WRITER_SENTENCE_BUDGET_INVALID:{block_id}:{min_sent}:{max_sent}")
        sentence_schema = copy.deepcopy(sentences_schema["items"])
        sprops = sentence_schema.get("properties", {})
        claims_schema = sprops.get("claim_ids", {}) if isinstance(sprops, dict) else {}
        claim_item = claims_schema.get("items", {}) if isinstance(claims_schema, dict) else {}
        allowed_claims = claim_item.get("enum") if isinstance(claim_item, dict) else None
        if not isinstance(allowed_claims, list) or not allowed_claims or not all(isinstance(x, str) and x.startswith("CLM-") for x in allowed_claims):
            raise RuntimeError(f"P120_WRITER_ALLOWED_CLAIMS_MISSING:{block_id}")

        sentence_slot_names = [f"sentence_{j:02d}" for j in range(1, max_sent + 1)]
        transport_block = copy.deepcopy(block_schema)
        tbprops = transport_block["properties"]
        tbprops.pop("sentences", None)
        tbprops["sentence_slots"] = {
            "type": "object",
            "properties": {
                name: {"anyOf": [copy.deepcopy(sentence_schema), {"type": "null"}]}
                for name in sentence_slot_names
            },
            "required": sentence_slot_names,
            "additionalProperties": False,
        }
        req = [x for x in transport_block.get("required", []) if x != "sentences"]
        if "sentence_slots" not in req:
            req.append("sentence_slots")
        transport_block["required"] = req
        block_slot = f"block_{i:02d}"
        block_slot_props[block_slot] = transport_block
        context_blocks.append({
            "slot": block_slot,
            "block_id": block_id,
            "sentence_slots": sentence_slot_names,
            "min_sentences": min_sent,
            "max_sentences": max_sent,
            "allowed_claims": list(allowed_claims),
        })

    block_slot_names = [x["slot"] for x in context_blocks]
    out_props["block_slots"] = {
        "type": "object",
        "properties": block_slot_props,
        "required": block_slot_names,
        "additionalProperties": False,
    }
    req = [x for x in out.get("required", []) if x != "blocks"]
    if "block_slots" not in req:
        req.append("block_slots")
    out["required"] = req
    return out, {
        "kind": "writer",
        "layer": _schema_const(schema, "layer"),
        "blocks": context_blocks,
    }


def _decode_writer_transport_object(obj, context):
    if not isinstance(obj, dict):
        raise RuntimeError("P120_WRITER_OUTPUT_NOT_OBJECT")
    slots = obj.get("block_slots")
    if not isinstance(slots, dict):
        raise RuntimeError("P120_WRITER_BLOCK_SLOTS_MISSING")
    expected_block_slots = [b["slot"] for b in context["blocks"]]
    if set(slots.keys()) != set(expected_block_slots):
        raise RuntimeError("P120_WRITER_BLOCK_SLOT_KEYS_MISMATCH")
    if "blocks" in obj:
        raise RuntimeError("P120_WRITER_MIXED_BLOCK_REPRESENTATION")

    blocks = []
    for bctx in context["blocks"]:
        block = slots.get(bctx["slot"])
        if not isinstance(block, dict):
            raise RuntimeError(f"P120_WRITER_BLOCK_SLOT_INVALID:{bctx['slot']}")
        if block.get("block_id") != bctx["block_id"]:
            raise RuntimeError(f"P120_WRITER_BLOCK_ID_MISMATCH:{bctx['block_id']}")
        sentence_slots = block.get("sentence_slots")
        if not isinstance(sentence_slots, dict):
            raise RuntimeError(f"P120_WRITER_SENTENCE_SLOTS_MISSING:{bctx['block_id']}")
        if set(sentence_slots.keys()) != set(bctx["sentence_slots"]):
            raise RuntimeError(f"P120_WRITER_SENTENCE_SLOT_KEYS_MISMATCH:{bctx['block_id']}")
        if "sentences" in block:
            raise RuntimeError(f"P120_WRITER_MIXED_SENTENCE_REPRESENTATION:{bctx['block_id']}")
        sentences = [sentence_slots[name] for name in bctx["sentence_slots"] if sentence_slots[name] is not None]
        if not (bctx["min_sentences"] <= len(sentences) <= bctx["max_sentences"]):
            raise RuntimeError(f"P120_WRITER_SENTENCE_CARDINALITY:{bctx['block_id']}:{len(sentences)}")

        allowed = set(bctx["allowed_claims"])
        covered = set()
        seen_sentence_ids = set()
        for sentence in sentences:
            if not isinstance(sentence, dict):
                raise RuntimeError(f"P120_WRITER_SENTENCE_INVALID:{bctx['block_id']}")
            sid = sentence.get("sentence_id")
            if not isinstance(sid, str) or sid in seen_sentence_ids:
                raise RuntimeError(f"P120_WRITER_SENTENCE_ID_INVALID_OR_DUPLICATE:{bctx['block_id']}")
            seen_sentence_ids.add(sid)
            text = sentence.get("text")
            if not isinstance(text, str) or not text:
                raise RuntimeError(f"P120_WRITER_SENTENCE_TEXT_EMPTY:{bctx['block_id']}:{sid}")
            claim_ids = sentence.get("claim_ids")
            if not isinstance(claim_ids, list) or not claim_ids:
                raise RuntimeError(f"P120_WRITER_SENTENCE_CLAIMS_EMPTY:{bctx['block_id']}:{sid}")
            if len(claim_ids) != len(set(claim_ids)):
                raise RuntimeError(f"P120_WRITER_SENTENCE_CLAIMS_DUPLICATE:{bctx['block_id']}:{sid}")
            claims = set(claim_ids)
            if not claims.issubset(allowed):
                raise RuntimeError(f"P120_WRITER_SENTENCE_FOREIGN_CLAIM:{bctx['block_id']}:{sid}")
            covered |= claims
        if covered != allowed:
            missing = sorted(allowed - covered)
            raise RuntimeError(f"P120_WRITER_BLOCK_CLAIM_COVERAGE_INCOMPLETE:{bctx['block_id']}:{','.join(missing)}")

        decoded_block = copy.deepcopy(block)
        decoded_block.pop("sentence_slots", None)
        decoded_block["sentences"] = sentences
        blocks.append(decoded_block)

    decoded = copy.deepcopy(obj)
    decoded.pop("block_slots", None)
    decoded["blocks"] = blocks
    return decoded


def _compile_semantic_transport_schema(schema):
    if _schema_const(schema, "schema_id") != "p120.semantic_alignment_result":
        return schema, None
    props = schema.get("properties", {})
    results_schema = props.get("sentence_results")
    if not isinstance(results_schema, dict):
        raise RuntimeError("P120_SEMANTIC_RESULTS_SCHEMA_MISSING")
    result_defs = results_schema.get("prefixItems")
    if not isinstance(result_defs, list):
        raise RuntimeError("P120_SEMANTIC_RESULTS_PREFIX_MISSING")
    if results_schema.get("items") is not False:
        raise RuntimeError("P120_SEMANTIC_RESULTS_TUPLE_NOT_CLOSED")
    if results_schema.get("minItems") != len(result_defs) or results_schema.get("maxItems") != len(result_defs):
        raise RuntimeError("P120_SEMANTIC_RESULTS_CARDINALITY_MISMATCH")

    slot_names = [f"result_{i:03d}" for i in range(1, len(result_defs) + 1)]
    out = copy.deepcopy(schema)
    out_props = out["properties"]
    out_props.pop("sentence_results", None)
    out_props["sentence_result_slots"] = {
        "type": "object",
        "properties": {name: copy.deepcopy(item) for name, item in zip(slot_names, result_defs)},
        "required": slot_names,
        "additionalProperties": False,
    }
    req = [x for x in out.get("required", []) if x != "sentence_results"]
    if "sentence_result_slots" not in req:
        req.append("sentence_result_slots")
    out["required"] = req

    expected = []
    for name, item in zip(slot_names, result_defs):
        iprops = item.get("properties", {}) if isinstance(item, dict) else {}
        sid_schema = iprops.get("sentence_id", {}) if isinstance(iprops, dict) else {}
        claims_schema = iprops.get("claim_ids", {}) if isinstance(iprops, dict) else {}
        claim_item = claims_schema.get("items", {}) if isinstance(claims_schema, dict) else {}
        sid = sid_schema.get("const") if isinstance(sid_schema, dict) else None
        claims = claim_item.get("enum") if isinstance(claim_item, dict) else None
        if not isinstance(sid, str) or not isinstance(claims, list) or not claims:
            raise RuntimeError("P120_SEMANTIC_EXPECTED_LINEAGE_MISSING")
        expected.append({"slot": name, "sentence_id": sid, "claim_ids": list(claims)})
    return out, {"kind": "semantic", "results": expected}


def _decode_semantic_transport_object(obj, context):
    if not isinstance(obj, dict):
        raise RuntimeError("P120_SEMANTIC_OUTPUT_NOT_OBJECT")
    slots = obj.get("sentence_result_slots")
    if not isinstance(slots, dict):
        raise RuntimeError("P120_SEMANTIC_RESULT_SLOTS_MISSING")
    expected_slots = [r["slot"] for r in context["results"]]
    if set(slots.keys()) != set(expected_slots):
        raise RuntimeError("P120_SEMANTIC_RESULT_SLOT_KEYS_MISMATCH")
    if "sentence_results" in obj:
        raise RuntimeError("P120_SEMANTIC_MIXED_RESULT_REPRESENTATION")

    results = []
    for rctx in context["results"]:
        result = slots.get(rctx["slot"])
        if not isinstance(result, dict):
            raise RuntimeError(f"P120_SEMANTIC_RESULT_INVALID:{rctx['slot']}")
        if result.get("sentence_id") != rctx["sentence_id"]:
            raise RuntimeError(f"P120_SEMANTIC_SENTENCE_ID_MISMATCH:{rctx['sentence_id']}")
        claim_ids = result.get("claim_ids")
        if not isinstance(claim_ids, list) or len(claim_ids) != len(set(claim_ids)):
            raise RuntimeError(f"P120_SEMANTIC_CLAIM_IDS_INVALID:{rctx['sentence_id']}")
        if set(claim_ids) != set(rctx["claim_ids"]):
            raise RuntimeError(f"P120_SEMANTIC_CLAIM_LINEAGE_MISMATCH:{rctx['sentence_id']}")
        risk_codes = result.get("risk_codes")
        if not isinstance(risk_codes, list) or not risk_codes or len(risk_codes) != len(set(risk_codes)):
            raise RuntimeError(f"P120_SEMANTIC_RISK_CODES_INVALID:{rctx['sentence_id']}")
        results.append(result)

    decoded = copy.deepcopy(obj)
    decoded.pop("sentence_result_slots", None)
    decoded["sentence_results"] = results
    return decoded


def _decode_transport_payload(payload, context, decoder):
    converted = 0

    def walk(node):
        nonlocal converted
        if isinstance(node, dict):
            if node.get("type") == "output_text" and isinstance(node.get("text"), str):
                try:
                    parsed = json.loads(node["text"])
                except Exception as exc:
                    raise RuntimeError(f"P120_STRUCTURED_ARRAY_TEXT_NOT_JSON:{type(exc).__name__}")
                marker = "block_slots" if context.get("kind") == "writer" else "sentence_result_slots"
                if isinstance(parsed, dict) and marker in parsed:
                    decoded = decoder(parsed, context)
                    node["text"] = json.dumps(decoded, ensure_ascii=False, separators=(",", ":"))
                    converted += 1
                    return
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk(payload)
    if converted != 1:
        raise RuntimeError(f"P120_STRUCTURED_ARRAY_DECODE_COUNT:{context.get('kind')}:{converted}")
    return payload


def _augment_writer_transport_prompt(request_body, context):
    max_sent = max(b["max_sentences"] for b in context["blocks"])
    guidance = (
        "\n\nSTAGING TRANSPORT CONSTRAINT — REPORT STRUCTURE. "
        f"Each report block provides exactly {max_sent} sentence slots. Use between 1 and {max_sent} non-null sentence slots per block; unused slots must be null. "
        "Every authorized claim in a block must be covered by at least one non-null sentence in that same block. "
        "Do not move claims between blocks, duplicate claim IDs inside a sentence, add claims, or change fixed block IDs."
    )
    inputs = request_body.get("input")
    if not isinstance(inputs, list):
        raise RuntimeError("P120_WRITER_PROMPT_INPUT_MISSING")
    developer_messages = [m for m in inputs if isinstance(m, dict) and m.get("role") == "developer"]
    if len(developer_messages) != 1:
        raise RuntimeError("P120_WRITER_PROMPT_DEVELOPER_COUNT")
    content = developer_messages[0].get("content")
    if not isinstance(content, list) or not content or not isinstance(content[0], dict) or not isinstance(content[0].get("text"), str):
        raise RuntimeError("P120_WRITER_PROMPT_CONTENT_MISSING")
    content[0]["text"] += guidance


class BridgeTransport:
    def __call__(self, body):
        request_body = copy.deepcopy(body)
        request_body.setdefault("metadata", {})["p120_e2e_run"] = E2E_RUN
        fmt = request_body.get("text", {}).get("format", {})
        analytical_context = None
        writer_context = None
        semantic_context = None
        if isinstance(fmt.get("schema"), dict):
            report_mode = request_body.get("metadata", {}).get("report_mode")
            transport_schema, analytical_context = _compile_analytical_transport_schema(fmt["schema"], report_mode)
            if analytical_context is not None:
                _augment_analytical_budget_prompt(request_body, analytical_context)
            else:
                transport_schema, writer_context = _compile_writer_transport_schema(fmt["schema"])
                if writer_context is not None:
                    _augment_writer_transport_prompt(request_body, writer_context)
                else:
                    transport_schema, semantic_context = _compile_semantic_transport_schema(fmt["schema"])
            fmt["schema"] = _schema_compat(transport_schema)
        status, payload = bridge({"action": "openai", "request": request_body}, timeout=240)
        if status == 200:
            if analytical_context is not None:
                payload = _decode_analytical_transport_payload(payload, analytical_context)
            elif writer_context is not None:
                payload = _decode_transport_payload(payload, writer_context, _decode_writer_transport_object)
            elif semantic_context is not None:
                payload = _decode_transport_payload(payload, semantic_context, _decode_semantic_transport_object)
        return status, payload
'''

patched = ''.join(lines[:start]) + replacement + ''.join(lines[end:])
ast.parse(patched)
p.write_text(patched, encoding='utf-8')
print('P120_STRUCTURED_ARRAY_PATCH PASS writer fixed block/sentence slots + semantic fixed result slots; canonical validators unchanged')
