/* P-120 EN public site — localization patch v1.1
   Covers derived/split UI strings rendered from public editorial content.
   Assessment/preflight/questionnaire content is intentionally excluded. */
(() => {
  'use strict';
  const D = window.P120_EN_TRANSLATIONS ||= new Map();
  const add = pairs => pairs.forEach(([ru,en]) => D.set(ru,en));

  add([
    /* Why P-120: split contrast cards */
    ['Красота','Beauty'],
    ['сексуальное возбуждение','sexual arousal'],
    ['Потребность в новизне','Need for novelty'],
    ['потребность в новом партнёре','need for a new partner'],
    ['Любовь к прикосновению','Enjoyment of touch'],
    ['зависимость желания от прикосновения','dependence of desire on touch'],
    ['Эмоциональная близость','Emotional closeness'],
    ['эротическое желание','erotic desire'],
    ['Автономность','Autonomy'],
    ['избегание близости','avoidance of closeness'],
    ['Сильная первоначальная химия','Strong initial chemistry'],
    ['способность сохранять желание годами','ability to sustain desire over years'],
    ['Умение замечать реакцию собственного тела','Ability to notice your body’s response'],
    ['способность понимать её смысл','ability to understand what it means'],
    ['не одно и то же','not the same thing'],

    /* Life context framed words */
    ['Принятие','Acceptance'],
    ['Отвержение','Rejection'],
    ['Желанность','Feeling desired'],
    ['Ревность','Jealousy'],
    ['Безопасность','Safety'],
    ['Дистанция','Distance'],
    ['Непонятость','Feeling misunderstood'],
    ['Телесная близость','Physical closeness'],
    ['Хроническое напряжение','Chronic tension'],

    /* Science-foundation tag cloud */
    ['сексуальное возбуждение и торможение','sexual excitation and inhibition'],
    ['желание','desire'],
    ['привязанность','attachment'],
    ['сексуальную коммуникацию','sexual communication'],
    ['прикосновение','touch'],
    ['интероцепцию','interoception'],
    ['сексуальную инициативность','sexual agency'],
    ['новизну и скуку','novelty and boredom'],
    ['отношения в длительной паре','long-term relationships'],
    ['сексуальную автономность','sexual autonomy'],
    ['отзывчивость партнёра','partner responsiveness'],

    /* Profile examples / disclosure state */
    ['Свернуть','Collapse'],
    ['Подробнее','Read more'],
    ['Пример профиля','Profile example'],
    ['Что обычно поддерживает такой профиль','What tends to support this profile'],
    ['Важно не перепутать','Important distinction'],

    /* Extended Research Set — intro and CTA surfaces */
    ['P-120 уже даёт самостоятельный многослойный профиль. Extended Research Set позволяет исследовать отдельные стороны опыта глубже — не изменяя основной результат.','P-120 already provides a self-contained multilayer profile. The Extended Research Set lets you examine selected aspects of experience more deeply — without changing the core result.'],
    ['P-120 уже даёт самостоятельный многослойный профиль.','P-120 already provides a self-contained multilayer profile.'],
    ['Extended Research Set позволяет посмотреть ещё глубже — не заменяя и не пересчитывая основной результат.','The Extended Research Set lets you look deeper — without replacing or recalculating the core result.'],
    ['Посмотреть Extended Set','Explore the Extended Set'],
    ['А хотите ещё глубже?','Want to go deeper?'],
    ['Основной профиль остаётся неизменным.','The core profile remains unchanged.'],
    ['Дополнительные модули добавляют новые слои понимания.','Supplemental modules add new layers of understanding.'],
    ['Ваш основной профиль','Your core profile'],
    ['Самое интересное начинается между слоями','The most interesting questions begin between the layers'],
    ['Что это означает — и чего пока не означает','What this means — and what it does not mean yet'],
    ['И ещё один уровень глубже — двое','One level deeper still — two people'],
    ['Следить за развитием Extended Set','Follow the Extended Set'],
    ['Как устроена исследовательская программа','How the research program is structured'],
    ['В разработке','In development'],

    /* Final editorial contrast */
    ['Не для того, чтобы поместить себя в коробку.','Not to put yourself in a box.'],
    ['А чтобы увидеть себя объёмнее.','But to see yourself in greater depth.'],

    /* Misc public runtime labels */
    ['Карта независимых, но взаимодействующих сигналов','A map of independent but interacting signals'],
    ['не один показатель','not a single score'],
    ['Процессы, которые важно не смешивать','Processes that should not be collapsed together'],
    ['Карта инструмента','Instrument map'],
    ['Пример будущего отчёта','Future report example'],
    ['Профиль участника','Participant profile'],
    ['пример','example'],
    ['Как это может звучать','How this might read'],
    ['Возможные конфигурации','Possible configurations'],
    ['Прозрачность доказательной базы','Evidence transparency'],
    ['Открыть научную базу','Open the Scientific Base']
  ]);
})();
