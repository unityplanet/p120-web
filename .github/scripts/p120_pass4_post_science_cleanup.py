from pathlib import Path
import subprocess

# PASS 4 narrow cleanup allowlist.
# Only obsolete Science migration/recovery/apply/legacy-QA operational assets are removed.
# Production HTML, runtime JS/CSS, scientific content, dictionaries and controlled records are not in scope.
TARGETS = [
    '.github/scripts/p120_scientific_base_production_migration.py',
    '.github/scripts/p120_en_science_localization_bind_v1.py',
    '.github/workflows/p120-scientific-base-production-migration-apply.yml',
    '.github/workflows/apply-science-public-v12.yml',
    '.github/workflows/publish-p120-public-science-v12.yml',
    '.github/workflows/publish-p120-public-science-en-v12.yml',
    '.github/workflows/extract-science-localization-source.yml',
    '.github/workflows/restore-science-visual-parity-v1.yml',
    '.github/workflows/restore-science-visual-parity-v2.yml',
    '.github/workflows/fix-science-navigation-direction-v1.yml',
    '.github/workflows/fix-science-navigation-direction-v1-1.yml',
    '.github/workflows/fix-science-navigation-direction-v1-2.yml',
    '.github/workflows/fix-science-navigation-direction-v1-3.yml',
    '.github/workflows/fix-science-navigation-direction-v1-4.yml',
    '.github/workflows/fix-science-parity-idempotence.yml',
    '.github/workflows/patch-science-direct-link-v1.yml',
    '.github/workflows/p120-en-science-localization-bind-v1.yml',
    '.github/workflows/p120-en-science-localization-gate-v1.yml',
    '.github/workflows/p120-en-science-localization-probe-v1.yml',
    '.github/workflows/qa-scientific-base-dedicated-v1.yml',
    '.github/workflows/qa-web-science-pass3.yml',
    'qa/en_science_localization_gate_v1.mjs',
    'qa/en_science_localization_probe_v1.mjs',
    '.github/p120-public-science-en-v12-xz/part-00.b64',
    '.github/p120-public-science-en-v12-xz/part-01.b64',
    '.github/p120-public-science-en-v12-xz/part-02.b64',
    '.github/p120-public-science-en-v12-xz/part-04.b64',
    '.github/p120-public-science-en-v12-xz/part-05.b64',
    '.github/p120-public-science-v12-xz/part-00.b64',
    '.github/p120-public-science-v12-xz/part-01.b64',
    '.github/p120-public-science-v12-xz/part-02.b64',
    '.github/p120-public-science-v12-xz/part-03.b64',
    '.github/p120-public-science-v12-xz/part-04.b64',
    '.github/p120-public-science-v12-xz/part-05.b64',
    '.github/p120-public-science-v12/part-00.b64',
    '.github/p120-public-science-v12/part-01.b64',
    '.github/p120-public-science-v12/part-02.b64',
    '.github/p120-public-science-v12/part-03.b64',
    '.github/p120-public-science-v12/part-04.b64',
]

# Production executable surfaces that must never reference the cleanup targets.
ACTIVE_RUNTIME = [
    Path('index.html'), Path('en/index.html'),
    Path('science/index.html'), Path('en/science/index.html'),
    Path('system/index.html'), Path('en/system/index.html'),
    Path('p120-scientific-base-runtime-v1.0.js'),
    Path('p120-public-runtime-v1.0.js'),
    Path('p120-session-contract-v1.0.js'),
    Path('p120-submission-intake-v1.0.js'),
    Path('manual-report-handoff-v1.0.js'),
    Path('science-navigation-reconciliation-v1.0.js'),
    Path('p120-en-science-localization-runtime-v1.0.js'),
    Path('public-en-science-dictionary-v1.0.js'),
]

missing = [p for p in TARGETS if not Path(p).exists()]
if missing:
    raise SystemExit('PASS 4 allowlist mismatch; expected cleanup target(s) missing before apply: ' + ', '.join(missing))

# Ensure no active production executable depends on any target filename/path.
violations = []
for active in ACTIVE_RUNTIME:
    if not active.exists():
        raise SystemExit(f'Protected active runtime missing: {active}')
    text = active.read_text(encoding='utf-8', errors='replace')
    for target in TARGETS:
        name = Path(target).name
        if target in text or name in text:
            violations.append(f'{active} -> {target}')
if violations:
    raise SystemExit('Cleanup target still referenced by active production runtime: ' + '; '.join(violations))

# The authoritative current Science QA must remain.
for required in [
    '.github/workflows/p120-scientific-base-production-gate.yml',
    'qa/scientific_base_production_gate_v1.mjs',
    'p120-scientific-base-runtime-v1.0.js',
    'P120_WEBSCI_PRODUCTION_registry_v1.0_2026-09-02.json',
    'P120_SCIENTIFIC_BASE_PRODUCTION_MIGRATION_v1.0.md',
]:
    if not Path(required).exists():
        raise SystemExit(f'Authoritative production Science asset missing: {required}')

subprocess.run(['git', 'rm', '--', *TARGETS], check=True)
print(f'PASS 4 cleanup staged: {len(TARGETS)} obsolete operational files removed.')
print('Production content/runtime files touched: NONE')
