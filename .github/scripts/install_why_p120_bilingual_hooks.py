from pathlib import Path

FIX_SCRIPT = "      - '.github/scripts/fix_why_p120_bilingual_ui.py'"

# Why P-120 integration workflow
p = Path('.github/workflows/integrate-why-p120-production.yml')
s = p.read_text(encoding='utf-8')
trigger = "      - '.github/scripts/apply_why_p120_act2_semantic.py'"
if FIX_SCRIPT not in s:
    if trigger not in s:
        raise SystemExit('Why integration trigger anchor not found')
    s = s.replace(trigger, trigger + '\n' + FIX_SCRIPT, 1)
step_name = 'Apply bilingual UI alignment fix'
if step_name not in s:
    marker = '      - name: Convert static Brand Origin teaser to scroll interstitial\n'
    step = "      - name: Apply bilingual UI alignment fix\n        run: python3 .github/scripts/fix_why_p120_bilingual_ui.py\n\n"
    if marker not in s:
        raise SystemExit('Why integration step anchor not found')
    s = s.replace(marker, step + marker, 1)
p.write_text(s, encoding='utf-8')

# Bilingual public-site integration workflow
p = Path('.github/workflows/integrate-bilingual-public-site-v1.yml')
s = p.read_text(encoding='utf-8')
trigger = "      - 'navigation-architecture-v2.js'"
if FIX_SCRIPT not in s:
    if trigger not in s:
        raise SystemExit('Bilingual build trigger anchor not found')
    s = s.replace(trigger, trigger + '\n' + FIX_SCRIPT, 1)
step_name = 'Apply Why P-120 bilingual UI alignment'
if step_name not in s:
    marker = '      - name: Check generated runtime and localization scripts\n'
    step = "      - name: Apply Why P-120 bilingual UI alignment\n        run: python3 .github/scripts/fix_why_p120_bilingual_ui.py\n\n"
    if marker not in s:
        raise SystemExit('Bilingual build step anchor not found')
    s = s.replace(marker, step + marker, 1)
p.write_text(s, encoding='utf-8')

print('Durable Why P-120 bilingual hooks: PASS')
