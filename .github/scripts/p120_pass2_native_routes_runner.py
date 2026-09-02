"""PASS 2 controlled runner.

This wrapper hardens build-time language materialization without introducing any
browser/runtime translation layer. It also reconciles System-only routing and
preserves the RU/EN selector without the editorial MutationObserver bundle.
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
    'Язык': 'Language',
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


_original_patch_ru = core.patch_ru


def patch_ru(html):
    html,removed = _original_patch_ru(html)

    # The old monolith routed its CTA back into "system/". Once System is its
    # own page this must become an in-page state transition, not a nested URL.
    native_start = """function startOrResume(){
  if(state.itemIndex>=I.items.length){state.screen='results';save();renderResults();return false}
  if(hasProgress()){state.screen='test';save();renderQuestion();return false}
  state.screen='preflight';save();renderPreflight();return false
}"""
    html=re.sub(
        r"function startOrResume\(\)\{(?:location\.href='system/'|startOrResume\(\));return false\}",
        native_start,
        html,
        count=1
    )

    # Resolve editorial destinations against the actual route URL, not <base>.
    html=re.sub(
        r"function goHome\(anchor\)\{.*?\n\}",
        """function goHome(anchor){
  const url=new URL('../',location.href);
  if(anchor)url.hash=encodeURIComponent(anchor);
  location.href=url.href;
}""",
        html,
        count=1,
        flags=re.S
    )
    html=re.sub(
        r"function goScience\(anchor\)\{.*?\n\}",
        """function goScience(anchor){
  const url=new URL('../',location.href);
  url.hash=anchor||'science-foundation';
  location.href=url.href;
}""",
        html,
        count=1,
        flags=re.S
    )
    html=html.replace(
        "location.href='../why-p120/'",
        "location.href=new URL('../why-p120/',location.href).href"
    )

    # Preserve the intentional language selector as a System-owned component.
    # No MutationObserver is used: shell() and renderMobileDrawer() own it.
    if 'function systemLocaleHref(' not in html:
        helper = r'''function systemLocaleHref(locale){
  const url=new URL(location.href);
  let p=url.pathname;
  if(locale==='en'){
    if(!/\/en\/system\/?$/i.test(p))p=p.replace(/\/system\/?$/i,'/en/system/');
  }else{
    p=p.replace(/\/en\/system\/?$/i,'/system/');
  }
  url.pathname=p;url.search='';url.hash='';return url.href;
}
function renderSystemLanguageSwitch(mode='desktop'){
  const isEn=document.documentElement.lang==='en';
  const label=isEn?'Language':'Язык';
  if(mode==='mobile')return `<section class="p120-language-mobile-group" aria-label="${label}"><div class="p120-language-mobile-label">${label}</div><div class="p120-language-mobile-options"><a href="${systemLocaleHref('ru')}" lang="ru" ${!isEn?'aria-current="page"':''}>RU</a><a href="${systemLocaleHref('en')}" lang="en" ${isEn?'aria-current="page"':''}>EN</a></div></section>`;
  return `<nav class="p120-language-switch p120-language-switch-desktop" aria-label="${label}"><a href="${systemLocaleHref('ru')}" lang="ru" ${!isEn?'aria-current="page"':''}>RU</a><a href="${systemLocaleHref('en')}" lang="en" ${isEn?'aria-current="page"':''}>EN</a></nav>`;
}
'''
        html=html.replace('function isAssessmentScreen(){',helper+'function isAssessmentScreen(){',1)

    if "${renderSystemLanguageSwitch('desktop')}" not in html:
        html=html.replace(
            '<div class="topbar-tools">\n          ${renderHeaderThemeMenu()}',
            '<div class="topbar-tools">\n          ${renderSystemLanguageSwitch(\'desktop\')}\n          ${renderHeaderThemeMenu()}',
            1
        )
    if "${renderSystemLanguageSwitch('mobile')}" not in html:
        html=html.replace(
            '        <div class="mobile-menu-group">\n          <span class="eyebrow">Тема оформления</span>',
            "        ${renderSystemLanguageSwitch('mobile')}\n        <div class=\"mobile-menu-group\">\n          <span class=\"eyebrow\">Тема оформления</span>",
            1
        )

    # <base> deliberately points to the repository root for shared assets, so a
    # literal href="./" would navigate away from System. Use the route helper.
    html=html.replace(
        '<a class="navlink system-navlink" href="./" aria-current="page"',
        '<a class="navlink system-navlink" href="${systemLocaleHref(document.documentElement.lang===\'en\'?\'en\':\'ru\')}" aria-current="page"',
        1
    )

    return html,removed


core.translate_app_block = translate_app_block
core.patch_ru = patch_ru
core.main()
