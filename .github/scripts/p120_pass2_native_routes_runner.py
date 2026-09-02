"""PASS 2 controlled runner.

This wrapper hardens build-time language materialization without introducing any
browser/runtime translation layer. It intentionally reuses the core PASS 2
materializer and replaces only its source-translation function.
"""
import re
import p120_pass2_native_routes as core

core.EXTRA_UI.update({
    'Верх научной базы': 'Scientific basis overview',
    '5 слоёв': '5 layers',
    'Конструкты': 'Constructs',
    'Карта доказательности': 'Evidence map',
    'Литература': 'References',
    'Почему P-120 важен': 'Why P-120 matters',
    'Почему именно P-120': 'Why P-120 specifically',
    'Что P-120 может показать': 'What P-120 can show',
    'Пример отчёта': 'Report example',
    'Примеры результатов': 'Result examples',
})


def boundary_replace(text, source, target):
    # Avoid corrupting inflected longer words (e.g. результат -> результатов).
    pat = r'(?<![А-Яа-яЁё])' + re.escape(source) + r'(?![А-Яа-яЁё])'
    return re.sub(pat, lambda _m: target, text)


def translate_app_block(html):
    marker='<!-- inlined: app.js -->'
    start=html.find(marker)
    if start < 0:
        raise SystemExit('app marker missing')
    script_open=html.find('<script>', start)
    end=html.find('</script>', script_open)
    if script_open < 0 or end < 0:
        raise SystemExit('app script boundaries missing')
    block=html[script_open:end]

    # Dynamic templates first, before individual nouns are materialized.
    for old,new in core.SOURCE_SNIPPETS.items():
        block=block.replace(old,new)

    mapping=core.parse_legacy_exact_map()
    mapping.update(core.EXTRA_UI)
    for ru,en in sorted(mapping.items(), key=lambda kv: len(kv[0]), reverse=True):
        block=boundary_replace(block,ru,en)

    # Exact final-form guards for templates with inflection/dynamic values.
    block=block.replace('${c.answered} из ${c.total} questions','${c.answered} of ${c.total} questions')
    return html[:script_open] + block + html[end:]


core.translate_app_block = translate_app_block
core.main()
