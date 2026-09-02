from __future__ import annotations

from pathlib import Path
import json
import re
import subprocess
from collections import defaultdict

ROOT = Path('.')
OUT_JSON = Path('P120_PASS4_POST_SCIENCE_INVENTORY_v1.0.json')
OUT_MD = Path('P120_PASS4_POST_SCIENCE_INVENTORY_v1.0.md')

EXCLUDED_DIRS = {'.git', 'node_modules', 'qa-evidence-science-production-v1'}
TEXT_SUFFIXES = {'.html', '.js', '.mjs', '.json', '.md', '.py', '.yml', '.yaml', '.css', '.txt'}

TOKENS = {
    'legacy_respondent_storage': 'p120_web_prototype_v01',
    'science_state_ru': 'p120_science_page_state_ru_v1',
    'science_state_en': 'p120_science_page_state_en_v1',
    'pass3_session_ru': 'p120_runtime_session_ru_v1',
    'pass3_session_en': 'p120_runtime_session_en_v1',
    'science_runtime_v1': 'p120-scientific-base-runtime-v1.0.js',
    'old_science_atlas_adapter': 'p120-science-atlas-adapter-v0.3.js',
    'old_science_nav_reconciliation': 'science-navigation-reconciliation-v1.0.js',
    'old_extended_registry_v03': 'P120_WEBSCI_EXT_runtime_registry_v0.3_2026-09-02.json',
    'old_extended_registry_v02': 'P120_WEBSCI_EXT_science_registry_v0.2_2026-09-02.json',
    'production_registry_v1': 'P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json',
    'science_global_api': 'P120ScientificBase',
    'science_atlas_api': 'P120ScienceAtlas',
}

ROUTES = [Path('science/index.html'), Path('en/science/index.html')]
PROTECTED = [
    'system/index.html', 'en/system/index.html',
    'p120-session-contract-v1.0.js',
    'p120-submission-intake-v1.0.js',
    'manual-report-handoff-v1.0.js',
    'index.html', 'en/index.html',
]
BASELINE = 'f46b7335e47d75672424136979f91a1a3997aa37'


def iter_text_files():
    for p in ROOT.rglob('*'):
        if not p.is_file():
            continue
        if any(part in EXCLUDED_DIRS for part in p.parts):
            continue
        if p.suffix.lower() not in TEXT_SUFFIXES:
            continue
        yield p


def read_text(p: Path) -> str:
    try:
        return p.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        return p.read_text(encoding='utf-8', errors='replace')


def occurrences(text: str, token: str):
    rows = []
    for i, line in enumerate(text.splitlines(), 1):
        if token in line:
            rows.append({'line': i, 'excerpt': line.strip()[:300]})
    return rows


files = list(iter_text_files())
index = defaultdict(list)
for p in files:
    text = read_text(p)
    for key, token in TOKENS.items():
        hits = occurrences(text, token)
        if hits:
            index[key].append({'path': p.as_posix(), 'hits': hits, 'count': len(hits)})

# Runtime/source assets that are plausibly in PASS 4 scope.
science_assets = sorted({
    p.as_posix() for p in files
    if any(term in p.name.lower() for term in ('science', 'websci', 'atlas'))
    and p.suffix.lower() in TEXT_SUFFIXES
})

# Explicit candidate-era files retained on main. Presence is not itself a deletion authorization.
candidate_era = [p for p in science_assets if any(mark in p.lower() for mark in (
    'v0.1', 'v0.2', 'v0.3', 'pass1', 'pass2', 'pass3', 'candidate', 'adapter'
))]

route_scripts = {}
route_duplicate_scripts = {}
route_inline_state = {}
for route in ROUTES:
    text = read_text(route)
    srcs = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', text, flags=re.I)
    counts = defaultdict(int)
    for src in srcs:
        counts[src] += 1
    route_scripts[route.as_posix()] = srcs
    route_duplicate_scripts[route.as_posix()] = {k: v for k, v in counts.items() if v > 1}
    route_inline_state[route.as_posix()] = {
        'legacy_key_count': text.count('p120_web_prototype_v01'),
        'science_ru_key_count': text.count('p120_science_page_state_ru_v1'),
        'science_en_key_count': text.count('p120_science_page_state_en_v1'),
        'production_runtime_loader_count': text.count('p120-scientific-base-runtime-v1.0.js'),
        'old_adapter_loader_count': text.count('p120-science-atlas-adapter-v0.3.js'),
        'old_nav_loader_count': text.count('science-navigation-reconciliation-v1.0.js'),
    }

# Detect duplicate global ownership declarations in executable JS/HTML only.
global_owners = defaultdict(list)
owner_patterns = {
    'P120ScientificBase_assignment': re.compile(r'window\.P120ScientificBase\s*='),
    'P120ScienceAtlas_assignment': re.compile(r'window\.P120ScienceAtlas\s*='),
    'P120_SCIENCE_assignment': re.compile(r'window\.P120_SCIENCE\s*='),
}
for p in files:
    if p.suffix.lower() not in {'.js', '.mjs', '.html'}:
        continue
    text = read_text(p)
    for name, pat in owner_patterns.items():
        for m in pat.finditer(text):
            line = text.count('\n', 0, m.start()) + 1
            global_owners[name].append({'path': p.as_posix(), 'line': line})

# Verify materializer idempotence on the actual PASS 4 baseline checkout.
materializer = Path('.github/scripts/p120_scientific_base_production_migration.py')
idempotence = {'available': materializer.exists(), 'pass': None, 'changed_files': [], 'stdout': '', 'stderr': ''}
if materializer.exists():
    proc = subprocess.run(['python3', materializer.as_posix()], text=True, capture_output=True)
    changed = subprocess.run(['git', 'diff', '--name-only', '--', 'science/index.html', 'en/science/index.html'], text=True, capture_output=True)
    idempotence.update({
        'pass': proc.returncode == 0 and not changed.stdout.strip(),
        'changed_files': [x for x in changed.stdout.splitlines() if x.strip()],
        'stdout': proc.stdout.strip(),
        'stderr': proc.stderr.strip(),
    })
    if changed.stdout.strip():
        subprocess.run(['git', 'checkout', '--', 'science/index.html', 'en/science/index.html'], check=True)

# Protected baseline is the PASS 4 start. Inventory must not alter these files.
protected_hashes = {}
for rel in PROTECTED:
    p = Path(rel)
    if p.exists():
        import hashlib
        protected_hashes[rel] = hashlib.sha256(p.read_bytes()).hexdigest()

# Classify findings. These are recommendations, not automatic edits.
findings = []

def add(fid, category, severity, disposition, evidence, rationale):
    findings.append({
        'id': fid,
        'category': category,
        'severity': severity,
        'disposition': disposition,
        'evidence': evidence,
        'rationale': rationale,
    })

legacy_hits = index.get('legacy_respondent_storage', [])
science_route_legacy = [x for x in legacy_hits if x['path'] in {r.as_posix() for r in ROUTES}]
add('P4-F01', 'state-bridge', 'HIGH' if science_route_legacy else 'INFO',
    'REMOVE_FROM_ACTIVE_SCIENCE_RUNTIME' if science_route_legacy else 'NO_ACTIVE_SCIENCE_HIT',
    science_route_legacy,
    'Dedicated Science routes must not regain ownership of the historical respondent migration source.')

old_adapter_hits = index.get('old_science_atlas_adapter', [])
add('P4-F02', 'temporary-adapter', 'MEDIUM' if old_adapter_hits else 'INFO',
    'EVALUATE_DELETE_OR_ARCHIVE' if old_adapter_hits else 'ABSENT',
    old_adapter_hits,
    'Candidate v0.3 Atlas adapter is obsolete if production runtime v1.0 is the sole active owner.')

old_nav_hits = index.get('old_science_nav_reconciliation', [])
add('P4-F03', 'compatibility-glue', 'MEDIUM' if old_nav_hits else 'INFO',
    'EVALUATE_DELETE_OR_ARCHIVE' if old_nav_hits else 'ABSENT',
    old_nav_hits,
    'Legacy Science navigation reconciliation should not duplicate production route/navigation ownership.')

prod_loader_ok = all(route_inline_state[r.as_posix()]['production_runtime_loader_count'] == 1 for r in ROUTES)
add('P4-F04', 'runtime-glue', 'HIGH' if not prod_loader_ok else 'INFO',
    'KEEP_SINGLE_OWNER' if prod_loader_ok else 'RECONCILE',
    route_inline_state,
    'Each dedicated Science route should load exactly one production Scientific Base runtime.')

add('P4-F05', 'generated-source-consistency', 'HIGH' if idempotence.get('pass') is False else 'INFO',
    'KEEP' if idempotence.get('pass') else 'RECONCILE',
    idempotence,
    'Production migration materializer must be idempotent after release closure.')

active_old_route_loaders = {
    route: {k: v for k, v in state.items() if k in ('old_adapter_loader_count', 'old_nav_loader_count') and v}
    for route, state in route_inline_state.items()
}
active_old_route_loaders = {k: v for k, v in active_old_route_loaders.items() if v}
add('P4-F06', 'duplicate-runtime-glue', 'HIGH' if active_old_route_loaders else 'INFO',
    'REMOVE_ACTIVE_DUPLICATE' if active_old_route_loaders else 'NO_ACTIVE_DUPLICATE',
    active_old_route_loaders,
    'Old adapter/navigation loaders must not coexist with the production Scientific Base runtime on public Science routes.')

add('P4-F07', 'operational-debris', 'LOW' if candidate_era else 'INFO',
    'REVIEW_ONLY',
    candidate_era,
    'Candidate-era files may be retained as controlled evidence or removed if they are purely operational; PASS 4 must not erase scientific provenance.')

report = {
    'document_id': 'P120-WEB-RUNTIME-PASS4-INVENTORY-001',
    'version': '1.0',
    'date': '2026-09-02',
    'stage': 'P120 Web Runtime Reconciliation — PASS 4 / Post-Science Integration Cleanup & Consolidation',
    'status': 'INVENTORY COMPLETE',
    'baseline': BASELINE,
    'scope_rule': 'Post-Science technical consolidation only. No design, typography, content architecture, Scientific Base structure, measurement or scoring changes.',
    'acceptance_criterion': 'Post-Science cleanup completed with no regression to production behavior, locale isolation, measurement/scoring contract, Scientific Base presentation, or routing.',
    'token_index': dict(index),
    'science_assets': science_assets,
    'candidate_era_assets': candidate_era,
    'route_scripts': route_scripts,
    'route_duplicate_scripts': route_duplicate_scripts,
    'route_inline_state': route_inline_state,
    'global_owners': dict(global_owners),
    'materializer_idempotence': idempotence,
    'protected_hashes_at_inventory': protected_hashes,
    'findings': findings,
}
OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')

lines = [
    '# P120 Web Runtime Reconciliation — PASS 4',
    '## Post-Science Integration Cleanup & Consolidation — Controlled Inventory',
    '',
    '**Document code:** P120-WEB-RUNTIME-PASS4-INVENTORY-001  ',
    '**Version:** 1.0  ',
    '**Date:** 2026-09-02  ',
    '**Status:** INVENTORY COMPLETE  ',
    f'**Baseline:** `{BASELINE}`',
    '',
    '### Scope lock',
    '',
    report['scope_rule'],
    '',
    '### Acceptance criterion',
    '',
    f"> {report['acceptance_criterion']}",
    '',
    '### Findings',
    '',
    '| ID | Category | Severity | Disposition |',
    '|---|---|---:|---|',
]
for f in findings:
    lines.append(f"| {f['id']} | {f['category']} | {f['severity']} | {f['disposition']} |")
lines += [
    '',
    '### Production Science route state',
    '',
]
for route, state in route_inline_state.items():
    lines.append(f"- `{route}` — production loader `{state['production_runtime_loader_count']}`; legacy respondent key `{state['legacy_key_count']}`; old adapter loader `{state['old_adapter_loader_count']}`; old nav loader `{state['old_nav_loader_count']}`.")
lines += [
    '',
    '### Materializer consistency',
    '',
    f"- Available: `{idempotence['available']}`",
    f"- Idempotent: `{idempotence['pass']}`",
    f"- Changed routes on dry-run: `{', '.join(idempotence['changed_files']) if idempotence['changed_files'] else 'NONE'}`",
    '',
    '### Candidate-era / possible operational debris',
    '',
]
for p in candidate_era:
    lines.append(f'- `{p}`')
if not candidate_era:
    lines.append('- NONE')
lines += [
    '',
    '### Gate rule',
    '',
    'Inventory findings are not deletion authorization. PASS 4 implementation must prove each removal is non-authoritative and non-active before modification.',
]
OUT_MD.write_text('\n'.join(lines) + '\n', encoding='utf-8')

print(json.dumps({
    'status': report['status'],
    'findings': [{k: f[k] for k in ('id','category','severity','disposition')} for f in findings],
    'candidate_era_assets': len(candidate_era),
    'materializer_idempotent': idempotence.get('pass'),
    'reports': [OUT_JSON.as_posix(), OUT_MD.as_posix()],
}, ensure_ascii=False, indent=2))
