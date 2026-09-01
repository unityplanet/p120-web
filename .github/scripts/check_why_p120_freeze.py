#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FREEZE_FILE = Path("why-p120/COMPOSITION_FREEZE_v1.0.md")
FROZEN_PREFIXES = ("why-p120/", "en/why-p120/")
EVIDENCE_PREFIX = "qa/why-p120/"


def fail(msg: str) -> None:
    print(f"WHY-P120 FREEZE GATE: FAIL — {msg}", file=sys.stderr)
    sys.exit(1)


def run(*args: str) -> str:
    return subprocess.check_output(args, cwd=ROOT, text=True).strip()


def changed_files():
    base = os.environ.get("GITHUB_BASE_REF") or "main"
    subprocess.run(["git", "fetch", "origin", base, "--depth=1"], cwd=ROOT, check=True)
    out = run("git", "diff", "--name-only", f"origin/{base}...HEAD")
    return [x for x in out.splitlines() if x.strip()]


def pr_metadata():
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path or not Path(event_path).exists():
        return "", ""
    data = json.loads(Path(event_path).read_text(encoding="utf-8"))
    pr = data.get("pull_request") or {}
    return pr.get("title") or "", pr.get("body") or ""


class FreezeHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.section_order = []
        self.class_counts = {}

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        classes = (attr.get("class") or "").split()
        for cls in classes:
            self.class_counts[cls] = self.class_counts.get(cls, 0) + 1
        if tag == "section":
            for cls in ("wp-act1", "wp-act2", "wp-act3", "wp-act4"):
                if cls in classes:
                    self.section_order.append(cls)


def validate_structure():
    html_path = ROOT / "why-p120/index.html"
    if not html_path.exists():
        fail("why-p120/index.html is missing")
    parser = FreezeHTMLParser()
    parser.feed(html_path.read_text(encoding="utf-8"))

    expected = ["wp-act1", "wp-act2", "wp-act3", "wp-act4"]
    if parser.section_order != expected:
        fail(f"four-act order changed: {parser.section_order!r}")

    for cls in ("wp-venn-a", "wp-venn-b", "wp-venn-six", "wp-pi-stage", "wp-coordinate-stage"):
        if parser.class_counts.get(cls, 0) < 1:
            fail(f"frozen composition landmark missing: {cls}")

    semantic_count = parser.class_counts.get("wp-semantic-item", 0)
    if semantic_count != 6:
        fail(f"P.01–P.06 semantic object must contain exactly 6 items; found {semantic_count}")


def validate_evidence(files):
    manifests = [Path(f) for f in files if f.startswith(EVIDENCE_PREFIX) and f.endswith("/manifest.md")]
    if len(manifests) != 1:
        fail("exactly one changed qa/why-p120/<PASS_ID>/manifest.md is required per micro-polish PR")

    manifest_rel = manifests[0]
    evidence_dir = ROOT / manifest_rel.parent
    manifest_path = ROOT / manifest_rel
    if not manifest_path.exists():
        fail("evidence manifest does not exist")

    required_stems = ("desktop-before", "desktop-after", "mobile-before", "mobile-after")
    for stem in required_stems:
        matches = []
        for ext in ("png", "jpg", "jpeg", "webp"):
            p = evidence_dir / f"{stem}.{ext}"
            if p.exists():
                matches.append(p)
        if not matches:
            fail(f"missing screenshot evidence: {stem}.png/.jpg/.jpeg/.webp")

    text = manifest_path.read_text(encoding="utf-8")
    required_tokens = (
        "Frozen invariant changed: NO",
        "Visual fidelity: PASS",
        "Responsive: PASS",
        "Horizontal overflow: PASS",
        "Console/runtime: PASS",
    )
    for token in required_tokens:
        if token not in text:
            fail(f"manifest missing required PASS declaration: {token}")


def main():
    files = changed_files()
    frozen_changes = [f for f in files if f.startswith(FROZEN_PREFIXES)]
    if not frozen_changes:
        print("WHY-P120 FREEZE GATE: PASS — frozen scope unchanged")
        return

    if str(FREEZE_FILE) in files:
        fail("freeze authority itself may not be edited in a MICRO-POLISH PR")

    title, body = pr_metadata()
    marker = f"{title}\n{body}".upper()
    if "MICRO-POLISH" not in marker and "MICRO POLISH" not in marker:
        fail("PR title/body must explicitly identify the change as MICRO-POLISH")

    validate_structure()
    validate_evidence(files)

    print("WHY-P120 FREEZE GATE: PASS")
    print("Frozen scope changed only under MICRO-POLISH protocol.")
    print("Changed frozen files:")
    for f in frozen_changes:
        print(f" - {f}")


if __name__ == "__main__":
    main()
