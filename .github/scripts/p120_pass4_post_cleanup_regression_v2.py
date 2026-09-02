from __future__ import annotations

import hashlib
import json
from pathlib import Path

BASELINE = "563c1a932702dd47c3608772311468a3f10628f1"
OUT_JSON = Path("P120_PASS4_POST_CLEANUP_REGRESSION_v2.0.json")
OUT_MD = Path("P120_PASS4_POST_CLEANUP_REGRESSION_v2.0.md")

SOURCES = {
    "independent_render": Path("qa-evidence-independent-render-v1-1/report.json"),
    "pass3_session_contract": Path("qa-evidence-pass3-session-contract-v1/P120_WEB_RECONCILIATION_PASS3_QA.json"),
    "science_production": Path("qa-evidence-science-production-v1/P120_SCIENCE_PRODUCTION_QA_v1.0.json"),
    "pass4a_project_subpath": Path("qa-evidence-pass4a/P120_PASS4A_QA_v1.0.json"),
}


def load(path: Path):
    if not path.exists():
        raise SystemExit(f"missing regression evidence: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


data = {key: load(path) for key, path in SOURCES.items()}

checks = []
def add(check_id: str, passed: bool, detail=None):
    checks.append({"id": check_id, "pass": bool(passed), "detail": detail})

render = data["independent_render"]
render_summary = render.get("summary", {})
add("20-route desktop/mobile render + transition audit", render_summary.get("pass") is True, render_summary)
add("render matrix contains 40 route/device cases", len(render.get("routes", [])) == 40, len(render.get("routes", [])))
mp = render.get("measurement_parity", {})
add("independent 180/180 measurement parity", mp.get("ru_items") == 180 and mp.get("en_items") == 180 and mp.get("coded_structure_parity") is True and mp.get("id_order_parity") is True, mp)

p3 = data["pass3_session_contract"]
add("PASS 3 locale-isolated session/measurement/scoring contract", p3.get("status") == "PASS", {"status": p3.get("status"), "measurement": p3.get("measurement"), "storage": p3.get("storage")})
add("PASS 3 measurement count remains 180", p3.get("measurement", {}).get("item_count") == 180, p3.get("measurement"))

science = data["science_production"]
add("Scientific Base production regression", science.get("status") == "PASS" and science.get("checks_failed") == 0, {"status": science.get("status"), "checks": [science.get("checks_passed"), science.get("checks_total")], "failed": science.get("checks_failed")})

p4a = data["pass4a_project_subpath"]
add("PASS 4A project-subpath Science regression", p4a.get("status") == "PASS" and p4a.get("checks_failed") == 0, {"status": p4a.get("status"), "checks": [p4a.get("checks_passed"), p4a.get("checks_total")], "failed": p4a.get("checks_failed")})
add("PASS 4A project path remains /p120-web/", p4a.get("project_path") == "/p120-web/", p4a.get("project_path"))

passed = all(row["pass"] for row in checks)
report = {
    "document_id": "P120-WEB-RUNTIME-PASS4-REGRESSION-002",
    "version": "2.0",
    "date": "2026-09-02",
    "stage": "P120 Web Runtime Reconciliation — PASS 4 / Post-Science Integration Cleanup & Consolidation",
    "entry_baseline": BASELINE,
    "status": "PASS" if passed else "FAIL",
    "acceptance_criterion": "Post-Science cleanup completed with no regression to production behavior, locale isolation, measurement/scoring contract, Scientific Base presentation, or routing.",
    "checks": checks,
    "evidence": {key: {"path": str(path), "sha256": sha256(path)} for key, path in SOURCES.items()},
    "scope_note": "Regression validates the narrow post-Science operational-debris cleanup only. No design, typography, content architecture, Scientific Base structure, measurement or scoring changes are authorized.",
}
OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

lines = [
    "# P120 Web Runtime Reconciliation — PASS 4",
    "## Post-Cleanup Regression v2.0",
    "",
    "**Document code:** P120-WEB-RUNTIME-PASS4-REGRESSION-002  ",
    "**Date:** 2026-09-02  ",
    f"**Entry baseline:** `{BASELINE}`  ",
    f"**Status:** {report['status']}  ",
    "",
    "### Acceptance criterion",
    "",
    "> Post-Science cleanup completed with no regression to production behavior, locale isolation, measurement/scoring contract, Scientific Base presentation, or routing.",
    "",
    "### Regression matrix",
    "",
    "| Check | Result |",
    "|---|---|",
]
for row in checks:
    lines.append(f"| {row['id']} | {'PASS' if row['pass'] else 'FAIL'} |")
lines += [
    "",
    "### Controlled disposition",
    "",
    "This record covers the narrow post-Science cleanup only. PASS 4 is not production-closed by this branch record alone; controlled PR/merge and post-merge regression remain required before final closure.",
]
OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

print(json.dumps({"status": report["status"], "checks": len(checks), "passed": sum(1 for x in checks if x["pass"]), "failed": sum(1 for x in checks if not x["pass"])}, indent=2))
if not passed:
    raise SystemExit(1)
