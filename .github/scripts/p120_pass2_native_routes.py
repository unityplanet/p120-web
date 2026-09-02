from pathlib import Path
import ast
import hashlib
import json
import re

ROOT = Path('.')
RU_PATH = ROOT / 'system/index.html'
EN_PATH = ROOT / 'en/system/index.html'

TRANSLATION_FILES = [
    ROOT / 'localization/p120-en-items-sat24-v1.0.js',
    ROOT / 'localization/p120-en-items-p72-q01-q48-v1.0.js',
    ROOT / 'localization/p120-en-items-p72-q49-q72-v1.0.js',
    ROOT / 'localization/p120-en-items-p72d-v1.0.js',
    ROOT / 'localization/p120-en-items-ao12-v1.0.js',
    ROOT / 'localization/p120-en-items-soma24-v1.0.js',
    ROOT / 'localization/p120-en-pass4-overrides-v0.4.js',
]

MODULE_COPY = {
    'SAT24': {
        'title': 'Social-Affective Touch Architecture',
        'subtitle': 'Social-affective touch',
        'intro': 'The following questions concern touch from other people in situations that you yourself do not experience as sexual. Answer based on your usual real-life experience. If you do not have enough relevant experience, choose N/A.'
    },
    'P72': {
        'title': 'Erotic-Aesthetic Perception Profile',
        'subtitle': 'Activation architecture · Core-72',
        'intro': 'Questions 1–48: answer with the past 6–12 months and real experiences in mind. If you genuinely do not have enough relevant experience, choose N/A. Questions 49–72 are comparative choices: choose the mechanism that would be harder for you to replace.'
    },
    'P72D': {
        'title': 'Erotic Desire Stability and Couple Compatibility Profile',
        'subtitle': 'Desire stability and couple compatibility',
        'intro': 'Before D01–D48, choose a response mode. It sets the context for your answers and does not change Core-48 or the scoring logic.'
    },
    'AO12': {
        'title': 'Attachment Regulation Architecture',
        'subtitle': 'Attachment regulation',
        'intro': 'Think of a relationship in which the other person is genuinely emotionally important to you. We are interested in what usually happens inside you when the connection becomes significant.'
    },
    'SOMA24': {
        'title': 'Bodily Architecture of Erotic Response',
        'subtitle': 'Bodily architecture of erotic response',
        'intro': 'This section concerns how you personally experience your own body in erotic situations. If you do not have enough relevant experience, choose N/A.'
    },
}

INSTRUMENT_STATUS = 'Research version | 18+'
INSTRUMENT_DISCLAIMER = (
    'This is not a validated, standardized, norm-referenced, clinical, or diagnostic instrument. '
    'N/A does not mean a low score. The result is not a diagnosis, does not determine sexual orientation, '
    'and does not establish psychological trauma.'
)

# These substitutions are performed on source before the browser executes it.
# They are not a runtime translator. They materialize native English presentation
# copy in /en/system/index.html.
EXTRA_UI = {
    'Обычные прикосновения, границы и телесный комфорт.': 'Everyday touch, boundaries, and bodily comfort.',
    'Что именно захватывает внимание и включает притяжение.': 'What captures attention and activates attraction.',
    'Как желание меняется со временем, близостью и повторяемостью.': 'How desire changes over time, with closeness and repetition.',
    'Как переживаются доверие, дистанция и значимая близость.': 'How trust, distance, and meaningful closeness are experienced.',
    'Как тело замечает, удерживает и теряет эротический отклик.': 'How the body registers, sustains, and loses erotic response.',

    'Общая повторяющаяся тенденция': 'General recurring pattern',
    'Одна конкретная связь': 'One specific relationship',
    'Ограниченный опыт': 'Limited experience',
    'Повторяющаяся общая тенденция.': 'A recurring overall pattern.',
    'Все ответы относятся к одной выбранной связи.': 'All answers refer to one selected relationship.',
    'Только реально пережитый опыт; Н/Д ожидаемы.': 'Only experiences you have actually had; N/A responses are expected.',

    'Темы оформления': 'Appearance themes',
    'Тема оформления': 'Appearance',
    'Светлая': 'Light',
    'Графит': 'Graphite',
    'Музейная': 'Museum',
    'Тема': 'Theme',

    'Быстрая мобильная навигация': 'Quick mobile navigation',
    'Главная': 'Home',
    'О тесте': 'About',
    'Наука': 'Science',
    'Продолжить тест': 'Continue P-120',
    'Пройти P-120': 'Take P-120',
    'Продолжить': 'Continue',
    'Пройти': 'Start',
    'Закрыть меню': 'Close menu',
    'Открыть меню': 'Open menu',
    'Навигация': 'Navigation',
    'Разделы': 'Sections',
    'Главная страница': 'Home page',
    'Вернуться к editorial-структуре': 'Return to the editorial site',
    'Перейти к опроснику и сохранить ритм прохождения': 'Open the questionnaire and continue your progress',
    'Продолжить текущую сессию': 'Continue current session',
    'Почему P-120?': 'Why P-120?',
    'История названия · 72 + 48 · символический слой бренда': 'Name history · 72 + 48 · symbolic brand layer',
    'Научная база': 'Scientific basis',
    'Открыть отдельный научный раздел': 'Open the scientific section',
    'перейти в научную базу': 'open the scientific section',
    'перейти на главной странице': 'open on the home page',
    'Текущая сессия': 'Current session',
    'Текущий экран:': 'Current screen:',
    'переход между модулями': 'module transition',
    'подготовка': 'preflight',
    'результат': 'results',
    'главная': 'home',
    'тест': 'questionnaire',
    'общего прогресса': 'overall progress',
    'общий прогресс': 'overall progress',
    'исследовательская архитектура · 18+': 'research architecture · 18+',
    'исследовательская архитектура': 'research architecture',

    'О P-120': 'About P-120',
    'Уникальность': 'What makes it different',
    'Что покажет': 'What it shows',
    'Отчёт': 'Report',
    'Система': 'System',
    'Главная навигация': 'Main navigation',
    'P-120 — главное меню': 'P-120 — main navigation',
    'Исследовательская версия · 18+': 'Research version · 18+',
    'автосохранение': 'autosave',
    'сохранено': 'saved',
    'Общий прогресс теста': 'Overall questionnaire progress',

    'Участник': 'Participant',
    'Сессия сохраняется автоматически в этом браузере. Возврат в главное меню не удаляет ответы.': 'This session is saved automatically in this browser. Returning to the main site does not delete your answers.',
    'Прогресс модуля': 'Module progress',
    'прогресс модуля': 'module progress',

    'Перед прохождением · 18+': 'Before you begin · 18+',
    'Тихое пространство для внимательного и честного ответа.': 'A quiet space for careful, honest answers.',
    'Эта короткая подготовка нужна не для формальности, а для точности. Чем спокойнее и ближе к реальному опыту вы отвечаете, тем глубже и человечнее потом будет чтение результата.': 'This short preparation is about accuracy, not formality. The more calmly and closely you answer from real experience, the more meaningful the resulting profile can be.',
    'Опирайтесь на реальный опыт': 'Answer from real experience',
    'Не на желаемый образ себя и не на то, как «должно быть». Для P-120 важнее живая достоверность, чем социально правильный ответ.': 'Not from an idealized image of yourself or from how things “should” be. P-120 needs an accurate account of lived experience rather than a socially desirable answer.',
    'Используйте Н/Д честно': 'Use N/A honestly',
    'Если релевантного опыта не было, такой ответ полезнее случайной оценки и не трактуется как низкий показатель.': 'If you do not have relevant experience, N/A is more informative than a guess and is not interpreted as a low score.',
    'Делайте паузу, если нужно': 'Pause if you need to',
    'Автосохранение позволяет спокойно прерваться и вернуться к текущей сессии в этом же браузере без потери ответов.': 'Autosave lets you pause and return to the current session in the same browser without losing your answers.',
    'Рекомендуемый ритм прохождения': 'Recommended pace',
    'Лучше идти без спешки, отвечая по первому внутренне точному ощущению. Важно не «выиграть тест», а позволить ему бережно собрать карту вашей внутренней динамики.': 'Take your time and answer from the first response that feels internally accurate. The goal is not to “win the test”, but to let the questionnaire capture your pattern as faithfully as possible.',
    'Мне 18 лет или больше; я понимаю исследовательский статус формы и хочу начать самостоятельное прохождение.': 'I am 18 or older; I understand the research status of this form and want to begin the questionnaire.',
    'Начать P-120': 'Begin P-120',
    'Вернуться в главное меню': 'Return to the main site',
    'Идентификатор создаётся автоматически. Для прохождения имя, e-mail и телефон не требуются.': 'The identifier is created automatically. Your name, email address, and phone number are not required.',
    'Граница применения': 'Scope boundary',
    'Конфиденциальность текущей версии': 'Privacy in the current version',
    'В текущей автономной сборке ответы сохраняются локально в памяти браузера. Серверная передача должна включаться только после подключения защищённого backend.': 'In the current standalone build, answers are stored locally in your browser. Server transmission should only be enabled through a protected backend.',

    'Следующий модуль': 'Next module',
    'Перейти к': 'Continue to',
    'Назад': 'Back',
    'Главное меню': 'Main site',
    'Выберите более незаменимый механизм и силу предпочтения.': 'Choose the harder-to-replace mechanism and the strength of your preference.',
    '1 — минимально / совсем не характерно · 5 — максимально / очень характерно · N/A — недостаточно опыта': '1 — minimally / not at all characteristic · 5 — maximally / very characteristic · N/A — insufficient experience',
    '← Назад': '← Back',
    'Далее →': 'Next →',

    'Это автономная статическая сборка. Серверный OpenAI endpoint, база данных и e-mail должны подключаться только в защищённом hosting/backend окружении.': 'This is a standalone static build. The server-side report endpoint, database, and email must only be connected in a protected hosting/backend environment.',
    'Проверяю…': 'Checking…',
    'Проверяю сервер…': 'Checking server…',
    'Сервер недоступен': 'Server unavailable',
    'Слой автоматического отчёта сейчас ожидаемо заблокирован: ': 'The automated report layer is currently intentionally unavailable: ',
    'Сначала нужно подключить авторитетную конфигурацию расчёта и интерпретации.': 'The authoritative scoring and interpretation configuration must be connected first.',
    'Проверить AI endpoint': 'Check report endpoint',

    'Завершение сессии': 'Session complete',
    'Интерфейс завершил сбор профиля и подготовил основу для будущего отчёта.': 'The questionnaire has finished collecting the profile and prepared the basis for the future report.',
    'Эта версия уже умеет красиво собирать ответы, фиксировать покрытие модулей и готовить структурированный пакет данных. На следующем уровне к нему подключается отдельный серверный расчёт и генерация итогового текста по утверждённой логике.': 'This version already collects responses, records module coverage, and prepares a structured data package. The next layer adds separate server-side scoring and generation of the final text under the approved logic.',
    'Старт:': 'Started:',
    'Завершение:': 'Completed:',
    'заполнено': 'complete',
    'ответов из': 'responses of',
    'Реальный отчёт будет намного богаче этого экрана: с интерпретацией межмодульных сочетаний, условий устойчивости и ключевых паттернов профиля.': 'The full report will be much richer than this screen, including interpretation of cross-module combinations, conditions of stability, and key profile patterns.',
    'Демонстрация будущего результата': 'Future result demonstration',
    'Так может ощущаться персональный отчёт в полной версии.': 'This is how a personal report may read in the full version.',
    'Ниже — не реальная интерпретация этой конкретной сессии, а художественный макет будущей подачи результата: спокойный, редакционный и легко читаемый.': 'The section below is not an interpretation of this specific session. It is an editorial mock-up of how the future result may be presented: calm, structured, and easy to read.',
    'Фрагмент профиля': 'Profile excerpt',
    '«Эстетически чувствительный и партнёрно-устойчивый рисунок»': '“Aesthetically sensitive, partner-stable pattern”',
    'Обычно такой профиль быстрее включается через форму, красоту и живую сцену взаимодействия, а устойчивость желания сильнее раскрывается там, где присутствуют эмоциональная ответность, безопасность и ощущение телесного контакта без внутренней перегрузки.': 'A profile like this is often activated more readily by form, beauty, and a vivid scene of interaction, while desire is more likely to remain stable where emotional responsiveness, safety, and bodily contact are present without internal overload.',
    '«Ваше притяжение чаще не вспыхивает из пустоты, а складывается как узнавание: сначала — форма и эстетическая выразительность, затем — чувство присутствия другого человека, и только после этого — более устойчивое внутреннее включение.»': '“Your attraction is less likely to appear from nowhere than to build through recognition: first form and aesthetic expressiveness, then a sense of the other person’s presence, and only then a more sustained inner engagement.”',
    'Эстетическая активация': 'Aesthetic activation',
    'Телесная доступность': 'Bodily accessibility',
    'Устойчивость при близости': 'Stability with closeness',
    'Риск угасания': 'Risk of decline',
    'высокая': 'high',
    'умеренно высокая': 'moderately high',
    'хорошая': 'good',
    'контекст-зависимый': 'context-dependent',
    'Заполнение модулей': 'Module completion',
    'Структура прохождения': 'Questionnaire structure',
    'Каждый модуль остаётся самостоятельным слоем и в будущем участвует в общем профиле без сведения всего результата к одной цифре.': 'Each module remains an independent layer and contributes to the future overall profile without reducing the result to a single number.',
    'вопросов': 'questions',
    'Скачать JSON': 'Download JSON',
    'Вернуться к тесту': 'Return to questionnaire',
    'Статус движка': 'Engine status',
    'Что уже работает в текущей сборке, а что подключается отдельно.': 'What already works in this build and what is connected separately.',
    'РАСЧЁТ ПО КЛЮЧАМ: ЕЩЁ НЕ ПОДКЛЮЧЁН': 'KEY-BASED SCORING: NOT YET CONNECTED',
    'Публичный интерфейс знает ответы и покрытие, но не содержит замороженные scoring-keys и не должен интерпретировать их напрямую в браузере.': 'The public interface knows the responses and coverage, but does not contain the frozen scoring keys and must not interpret them directly in the browser.',
    '① Интерфейс участника · ответы и метаданные прохождения': '① Respondent interface · responses and session metadata',
    '② Серверный расчёт · детерминированные ключи и формулы': '② Server-side scoring · deterministic keys and formulas',
    '③ Слой автоматического отчёта · текст, summary, PDF / e-mail': '③ Automated report layer · text, summary, PDF / email',
    '④ Финальный результат для участника или специалиста': '④ Final result for the respondent or specialist',
    'Нажми кнопку, чтобы увидеть поведение подготовленного endpoint.': 'Use the button to check the prepared endpoint behavior.',
    'Предпросмотр данных': 'Data preview',
    'Структурированный объект результата': 'Structured result object',
    'Этот блок нужен для разработки и интеграции. На production-сайте его можно скрыть и отдавать только специалисту или администратору.': 'This block is for development and integration. In production it can be hidden and made available only to a specialist or administrator.',
}

# Dynamic source fragments that are easier/safer to replace as exact code snippets.
SOURCE_SNIPPETS = {
    '${totalAnswered()} из ${I.items.length}': '${totalAnswered()} of ${I.items.length}',
    '${pos} из ${total}': '${pos} of ${total}',
    '${c.answered} из ${c.total} вопросов': '${c.answered} of ${c.total} questions',
    '${cov.answered}</strong><span>ответов из ${cov.total}': '${cov.answered}</strong><span>responses of ${cov.total}',
}

EDITORIAL_EXTERNAL_SCRIPTS = [
    r'<script src="founder-route-v1\.1\.js[^>]*></script>\s*',
    r'<script src="p120-public-runtime-v1\.0\.js[^>]*></script>\s*',
    r'<script src="extended-research-navigation-v1\.0\.js[^>]*></script>\s*',
    r'<script src="science-navigation-reconciliation-v1\.0\.js[^>]*></script>\s*',
]
EDITORIAL_INLINE_IDS = [
    'brand-origin-scroll-interstitial-runtime-v1',
    'p120-science-public-v12-runtime',
]


def sha256_text(s):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()


def measurement_manifest(inst):
    manifest=[]
    for item in inst.get('items', []):
        manifest.append({
            'id': item.get('id'),
            'module': item.get('module'),
            'type': item.get('type'),
            'values': [c.get('value') for c in item.get('choices', [])],
        })
    return manifest


def extract_instrument(html):
    m = re.search(r'window\.P120_INSTRUMENT\s*=\s*(\{.*?\});\s*</script>', html, re.S)
    if not m:
        raise SystemExit('P120_INSTRUMENT not found')
    return m, json.loads(m.group(1))


def read_translations():
    merged={}
    pat = re.compile(
        r'Object\.assign\(window\.P120_EN_ITEM_TRANSLATIONS\s*\|\|\s*\{\},\s*(\{.*\})\s*\);',
        re.S
    )
    for p in TRANSLATION_FILES:
        s=p.read_text(encoding='utf-8')
        m=pat.search(s)
        if not m:
            raise SystemExit(f'Cannot parse translation object: {p}')
        merged.update(json.loads(m.group(1)))
    return merged


def localize_instrument(inst):
    out=json.loads(json.dumps(inst, ensure_ascii=False))
    translations=read_translations()
    items=out.get('items', [])
    ids=[x.get('id') for x in items]
    if len(items) != 180 or len(set(ids)) != 180:
        raise SystemExit(f'Expected 180 unique items, got {len(items)}/{len(set(ids))}')
    missing=[]
    for item in items:
        t=translations.get(item['id'])
        if not t:
            missing.append(item['id'])
            continue
        item['text']=t['text']
        if item.get('type') == 'comparative':
            item['optionA']=t['optionA']
            item['optionB']=t['optionB']
            for choice in item.get('choices', []):
                labels={
                    'A_STRONG':'A clearly',
                    'A_SLIGHT':'A slightly',
                    'B_SLIGHT':'B slightly',
                    'B_STRONG':'B clearly',
                }
                if choice.get('value') in labels:
                    choice['label']=labels[choice['value']]
    if missing:
        raise SystemExit('Missing EN items: ' + ','.join(missing))
    for module in out.get('modules', []):
        if module.get('id') in MODULE_COPY:
            module.update(MODULE_COPY[module['id']])
    out['status']=INSTRUMENT_STATUS
    out['disclaimer']=INSTRUMENT_DISCLAIMER
    out['locale']='en'
    out['localizationVersion']='EN v0.4 · PASS 4 · native materialization PASS 2'
    return out


def parse_legacy_exact_map():
    """Reuse reviewed wording from the former runtime translator at BUILD TIME only."""
    p=ROOT/'p120-en-system-runtime-v0.4.js'
    s=p.read_text(encoding='utf-8')
    m=re.search(r'const exact\s*=\s*new Map\(Object\.entries\(\{(.*?)\}\)\);', s, re.S)
    if not m:
        return {}
    block=m.group(1)
    pairs={}
    for km,vm in re.findall(r"'((?:\\.|[^'])*)'\s*:\s*'((?:\\.|[^'])*)'", block):
        try:
            k=ast.literal_eval("'"+km+"'")
            v=ast.literal_eval("'"+vm+"'")
            pairs[k]=v
        except Exception:
            pass
    return pairs


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
    mapping=parse_legacy_exact_map()
    mapping.update(EXTRA_UI)
    # Longest strings first so specific phrases win over component words.
    for ru,en in sorted(mapping.items(), key=lambda kv: len(kv[0]), reverse=True):
        block=block.replace(ru,en)
    for old,new in SOURCE_SNIPPETS.items():
        block=block.replace(old,new)
    return html[:script_open] + block + html[end:]


def strip_editorial_mutators(html):
    removed=[]
    for pat in EDITORIAL_EXTERNAL_SCRIPTS:
        html,n=re.subn(pat,'',html,flags=re.S)
        if n:
            removed.append(pat)
    for sid in EDITORIAL_INLINE_IDS:
        pat=rf'<script id="{re.escape(sid)}"[^>]*>.*?</script>\s*'
        html,n=re.subn(pat,'',html,flags=re.S)
        if n:
            removed.append(sid)
    return html,removed


def patch_ru(html):
    html=html.replace(
        '<body data-p120-page="system" data-p120-runtime="frozen">',
        '<body data-p120-page="system" data-p120-runtime="frozen" data-p120-locale="ru" data-p120-route-authority="native-ru">',
        1
    )
    html=html.replace('href="system/" aria-current="page"', 'href="./" aria-current="page"')
    html=html.replace("location.href='system/'", 'startOrResume()')
    html,removed=strip_editorial_mutators(html)
    return html,removed


def build_en(ru_html):
    html=ru_html
    html=html.replace('<html lang="ru">','<html lang="en">',1)
    html=html.replace('<base href="../" />','<base href="../../" />',1)
    html=html.replace('content="ru_RU"','content="en_US"',1)
    html=html.replace(
        'content="P-120 System — каноническая страница замороженного исследовательского инструмента P-120."',
        'content="P-120 System — English research version of the controlled P-120 instrument."',1)
    html=html.replace('content="P-120 — архитектура притяжения и близости"','content="P-120 — architecture of attraction and intimacy"')
    html=html.replace(
        'content="Многослойная исследовательская система о притяжении, близости, телесном отклике и устойчивости желания."',
        'content="A multilayer research system exploring attraction, intimacy, bodily response, and the stability of desire."',1)
    html=html.replace(
        'content="Research Candidate · 18+ · многослойная исследовательская архитектура."',
        'content="Research Candidate · 18+ · multilayer research architecture."',1)
    html=html.replace('<title>System — P-120</title>','<title>P-120 System — English research version</title>',1)
    html=html.replace('>Перейти к основному содержанию<','>Skip to main content<',1)
    html=html.replace('data-p120-locale="ru" data-p120-route-authority="native-ru"','data-p120-locale="en" data-p120-route-authority="native-en"',1)

    im,inst=extract_instrument(html)
    native=localize_instrument(inst)
    if measurement_manifest(inst) != measurement_manifest(native):
        raise SystemExit('Measurement manifest changed during EN materialization')
    native_json=json.dumps(native,ensure_ascii=False,separators=(',',':'))
    html=html[:im.start(1)] + native_json + html[im.end(1):]
    html=translate_app_block(html)

    # PASS 2 target: no browser translation/binding layers.
    html=re.sub(r'<script[^>]+(?:p120-en-system-runtime|p120-en-instrument-bind|p120-en-items-|p120-en-pass4-overrides)[^>]*></script>\s*','',html,flags=re.I)
    return html,inst,native


def patch_locale_detection(path):
    s=path.read_text(encoding='utf-8')
    old="const isEn = /\\/en\\/(?:index\\.html)?$/i.test(location.pathname);"
    new="const isEn = /(^|\\/)en(?:\\/|$)/i.test(location.pathname);"
    if old in s:
        s=s.replace(old,new,1)
    elif new not in s:
        raise SystemExit(f'Locale detector not recognized in {path}')
    path.write_text(s,encoding='utf-8')


def extract_function(app,name):
    m=re.search(rf'function\s+{re.escape(name)}\s*\([^)]*\)\s*\{{',app)
    if not m:
        return ''
    start=m.start()
    nxt=re.search(r'\nfunction\s+[A-Za-z0-9_]+\s*\(',app[m.end():])
    end=m.end()+nxt.start() if nxt else len(app)
    return app[start:end]


def app_block(html):
    marker='<!-- inlined: app.js -->'
    start=html.find(marker)
    op=html.find('<script>',start)
    end=html.find('</script>',op)
    return html[op:end]


def qa(ru,en,ru_inst,en_inst,removed):
    errors=[]
    if 'data-p120-route-authority="native-ru"' not in ru: errors.append('RU native authority marker missing')
    if 'data-p120-route-authority="native-en"' not in en: errors.append('EN native authority marker missing')
    if '<html lang="ru">' not in ru: errors.append('RU lang missing')
    if '<html lang="en">' not in en: errors.append('EN lang missing')
    if '<base href="../" />' not in ru: errors.append('RU base wrong')
    if '<base href="../../" />' not in en: errors.append('EN base wrong')
    for bad in ['p120-en-system-runtime-v0.4.js','p120-en-instrument-bind-v0.4.js']:
        if bad in en: errors.append('Legacy EN runtime layer remains: '+bad)
    for bad in ['p120-public-runtime-v1.0.js','founder-route-v1.1.js','extended-research-navigation-v1.0.js','science-navigation-reconciliation-v1.0.js','brand-origin-scroll-interstitial-runtime-v1','p120-science-public-v12-runtime']:
        if bad in ru or bad in en: errors.append('Editorial mutator remains on System route: '+bad)
    if 'href="system/" aria-current="page"' in ru or 'href="system/" aria-current="page"' in en:
        errors.append('Nested System self-link remains')
    if "location.href='system/'" in ru or "location.href='system/'" in en:
        errors.append('Nested mobile resume redirect remains')
    rman=measurement_manifest(ru_inst); eman=measurement_manifest(en_inst)
    if rman != eman: errors.append('RU/EN measurement manifest differs')
    if len(rman)!=180 or len({x['id'] for x in rman})!=180: errors.append('180-item invariant failed')
    # Active System functions must be language-clean. Dormant editorial/science renderers
    # remain until PASS 4 and are intentionally excluded from this active-surface gate.
    active=[
        'moduleBlurb','adminModeRu','adminModeHint','themeLabel','renderThemeSwitch',
        'renderMobileBottomNav','renderMobileDrawer','shell','updateTopbar','renderSidebar',
        'renderMobileModulebar','renderModuleProgress','renderPreflight','renderTransition',
        'renderQuestion','checkAI','renderResults'
    ]
    app=app_block(en)
    dirty={}
    for name in active:
        f=extract_function(app,name)
        hits=sorted(set(re.findall(r'[^\n]{0,70}[А-Яа-яЁё][^\n]{0,90}',f))) if f else []
        if hits: dirty[name]=hits[:8]
    if dirty:
        errors.append('Cyrillic remains in active EN functions: '+json.dumps(dirty,ensure_ascii=False))
    # Explicit regression tokens from owner screenshots.
    for token in ['ПРОГРЕСС МОДУЛЯ','прогресс модуля','Главная</small>','О тесте</small>','Наука</small>','Продолжить</small>']:
        if token in app: errors.append('Owner-visible mixed-language token remains: '+token)
    if errors:
        raise SystemExit('\n'.join(errors))
    return {
        'ru_sha256':sha256_text(ru),
        'en_sha256':sha256_text(en),
        'measurement_manifest_sha256':sha256_text(json.dumps(rman,ensure_ascii=False,sort_keys=True)),
        'item_count':len(rman),
        'editorial_mutators_removed_from_system':len(removed),
        'active_en_functions_checked':len(active),
    }


def main():
    original=RU_PATH.read_text(encoding='utf-8')
    ru0m,ru0inst=extract_instrument(original)
    ru,removed=patch_ru(original)
    RU_PATH.write_text(ru,encoding='utf-8')
    en,ru_inst,en_inst=build_en(ru)
    EN_PATH.parent.mkdir(parents=True,exist_ok=True)
    EN_PATH.write_text(en,encoding='utf-8')

    patch_locale_detection(ROOT/'manual-report-handoff-v1.0.js')
    patch_locale_detection(ROOT/'p120-submission-intake-v1.0.js')

    # Re-read instrument after RU patch to ensure no measurement mutation.
    _,ru_final_inst=extract_instrument(ru)
    if measurement_manifest(ru0inst) != measurement_manifest(ru_final_inst):
        raise SystemExit('RU measurement manifest changed')

    result=qa(ru,en,ru_final_inst,en_inst,removed)
    report={
        'document_id':'P120-WEB-REC-PASS2-NATIVE-ROUTE-QA',
        'version':'1.0',
        'status':'PASS',
        'date':'2026-09-02',
        'route_authority':{'/system/':'native-ru','/en/system/':'native-en'},
        'post_render_translator':'ABSENT_FROM_EN_SYSTEM',
        'runtime_item_binding':'MATERIALIZED_AT_BUILD_TIME',
        'measurement_scoring_changes':'NONE',
        'scientific_base_changes':'NONE',
        'session_storage_redesign':'DEFERRED_TO_PASS3',
        **result,
    }
    Path('P120_WEB_RECONCILIATION_PASS2_NATIVE_ROUTE_QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
