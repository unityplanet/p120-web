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

    /* What P-120 shows — orbital/list items rendered as fragments */
    ['что именно захватывает ваше внимание','what specifically captures your attention'],
    ['как красота превращается — или не превращается — в желание','how beauty does — or does not — become desire'],
    ['какую роль играют движение, форма, детали, свет и мультисенсорность','the role of movement, form, detail, light, and multisensory experience'],
    ['насколько важен живой ответ партнёра','how important a partner’s live response is'],
    ['нужно ли вам эротическое соавторство','whether you need erotic co-creation'],
    ['как вы относитесь к новизне','how you relate to novelty'],
    ['способно ли желание обновляться внутри знакомой связи','whether desire can renew itself within a familiar bond'],
    ['что происходит с ним при повторяемости и рутине','what happens to desire under repetition and routine'],
    ['как эмоциональная близость влияет на эротизм','how emotional closeness affects eroticism'],
    ['насколько важна автономность','how important autonomy is'],
    ['как вы переживаете прикосновение','how you experience touch'],
    ['как регулируете значимую близость','how you regulate meaningful closeness'],
    ['как замечаете и различаете реакции собственного тела','how you notice and differentiate your own bodily responses'],

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

    /* Science residual runtime strings */
    ['29 августа 2026 · 21 стр.','29 August 2026 · 21 pp.'],
    ['Гипотезы','Hypotheses'],
    ['Валидация','Validation'],
    ['Этика','Ethics'],
    ['AReA, TEAQ, ECR-RS, MAIA-2, SADI, SIS/SES, SBI, PSSLW, SAQ-9, SexFlex и реляционные переменные.','AReA, TEAQ, ECR-RS, MAIA-2, SADI, SIS/SES, SBI, PSSLW, SAQ-9, SexFlex, and relational variables.'],
    ['P-120 · Research Candidate · Научная база','P-120 · Research Candidate · Scientific Base'],

    /* Misc public runtime labels */
    ['Перейти к основному содержанию','Skip to main content'],
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
