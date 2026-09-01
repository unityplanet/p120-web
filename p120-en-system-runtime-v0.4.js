/* P-120 EN System respondent UI localization v0.4
   Presentation/runtime language only. Measurement and scoring logic unchanged. */
(() => {
  'use strict';

  const exact = new Map(Object.entries({
    'исследовательская архитектура':'research architecture',
    'исследовательская архитектура · 18+':'research architecture · 18+',
    'Главная навигация':'Main navigation',
    'О P-120':'About P-120',
    'Почему P-120?':'Why P-120?',
    'Уникальность':'What makes it different',
    'Что покажет':'What it shows',
    'Отчёт':'Report',
    'Система':'System',
    'Научная база':'Scientific basis',
    'Исследовательская версия · 18+':'Research version · 18+',
    'автосохранение':'autosave',
    'Меню':'Menu',
    'Навигация':'Navigation',
    'Разделы':'Sections',
    'Главная страница':'Home page',
    'Вернуться к editorial-структуре':'Return to the editorial site',
    'Продолжить текущую сессию':'Continue current session',
    'Перейти к опроснику и сохранить ритм прохождения':'Open the questionnaire and continue your progress',
    'Открыть отдельный научный раздел':'Open the scientific section',
    'История названия · 72 + 48 · символический слой бренда':'Name history · 72 + 48 · symbolic brand layer',
    'Пройти P-120':'Take P-120',
    'Продолжить тест':'Continue P-120',
    'Текущая сессия':'Current session',
    'Текущий экран:':'Current screen:',
    'тест':'questionnaire',
    'подготовка':'preflight',
    'переход между модулями':'module transition',
    'результат':'results',
    'главная':'home',
    'Перед прохождением · 18+':'Before you begin · 18+',
    'Тихое пространство для внимательного и честного ответа.':'A quiet space for careful, honest answers.',
    'Эта короткая подготовка нужна не для формальности, а для точности. Чем спокойнее и ближе к реальному опыту вы отвечаете, тем глубже и человечнее потом будет чтение результата.':'This short preparation is about accuracy, not formality. The more calmly and closely you answer from real experience, the more meaningful the resulting profile can be.',
    'Опирайтесь на реальный опыт':'Answer from real experience',
    'Не на желаемый образ себя и не на то, как «должно быть». Для P-120 важнее живая достоверность, чем социально правильный ответ.':'Not from an idealized image of yourself or from how things “should” be. P-120 needs an accurate account of lived experience rather than a socially desirable answer.',
    'Используйте Н/Д честно':'Use N/A honestly',
    'Если релевантного опыта не было, такой ответ полезнее случайной оценки и не трактуется как низкий показатель.':'If you do not have relevant experience, N/A is more informative than a guess and is not interpreted as a low score.',
    'Делайте паузу, если нужно':'Pause if you need to',
    'Автосохранение позволяет спокойно прерваться и вернуться к текущей сессии в этом же браузере без потери ответов.':'Autosave lets you pause and return to the current session in the same browser without losing your answers.',
    'Рекомендуемый ритм прохождения':'Recommended pace',
    'Лучше идти без спешки, отвечая по первому внутренне точному ощущению. Важно не «выиграть тест», а позволить ему бережно собрать карту вашей внутренней динамики.':'Take your time and answer from the first response that feels internally accurate. The goal is not to “win the test”, but to let the questionnaire capture your pattern as faithfully as possible.',
    'Мне 18 лет или больше; я понимаю исследовательский статус формы и хочу начать самостоятельное прохождение.':'I am 18 or older; I understand the research status of this form and want to begin the questionnaire.',
    'Начать P-120':'Begin P-120',
    'Вернуться в главное меню':'Return to the main site',
    'Идентификатор создаётся автоматически. Для прохождения имя, e-mail и телефон не требуются.':'The identifier is created automatically. Your name, email address, and phone number are not required.',
    'Граница применения':'Scope boundary',
    'Конфиденциальность текущей версии':'Privacy in the current version',
    'В текущей автономной сборке ответы сохраняются локально в памяти браузера. Серверная передача должна включаться только после подключения защищённого backend.':'In the current standalone build, answers are stored locally in your browser. Server transmission should only be enabled through a protected backend.',
    'Следующий модуль':'Next module',
    'Перейти к':'Continue to',
    'Назад':'Back',
    'Главное меню':'Main site',
    'Общая повторяющаяся тенденция':'General recurring pattern',
    'Одна конкретная связь':'One specific relationship',
    'Ограниченный опыт':'Limited experience',
    'Повторяющаяся общая тенденция.':'A recurring overall pattern.',
    'Все ответы относятся к одной выбранной связи.':'All answers refer to one selected relationship.',
    'Только реально пережитый опыт; Н/Д ожидаемы.':'Only experiences you have actually had; N/A responses are expected.',
    'Выберите более незаменимый механизм и силу предпочтения.':'Choose the harder-to-replace mechanism and the strength of your preference.',
    '1 — минимально / совсем не характерно · 5 — максимально / очень характерно · N/A — недостаточно опыта':'1 — minimally / not at all characteristic · 5 — maximally / very characteristic · N/A — insufficient experience',
    '← Назад':'← Back',
    'Далее →':'Next →',
    'Как прикосновение меняет эмоциональный и телесный фон.':'How touch changes emotional and bodily state.',
    'Как визуальная форма, движение, детали и взаимность включают интерес.':'How visual form, movement, detail, and mutuality engage interest.',
    'Как желание меняется со временем, близостью и повторяемостью.':'How desire changes over time, with closeness and repetition.',
    'Как переживаются доверие, дистанция и значимая близость.':'How trust, distance, and meaningful closeness are experienced.',
    'Как тело замечает, удерживает и теряет эротический отклик.':'How the body registers, sustains, and loses erotic response.',
    'Светлая':'Light',
    'Тёмная':'Dark',
    'Музейная':'Museum',
    'Тема':'Theme',
    'Закрыть':'Close',
    'сохранено':'saved'
  }));

  function dynamic(s) {
    if (!s) return s;
    if (exact.has(s)) return exact.get(s);
    let m;
    if ((m=s.match(/^Следующий модуль · (.+)$/))) return `Next module · ${m[1]}`;
    if ((m=s.match(/^Перейти к (.+)$/))) return `Continue to ${m[1]}`;
    if ((m=s.match(/^(\d+) из (\d+)$/))) return `${m[1]} of ${m[2]}`;
    if ((m=s.match(/^(\d+)% общего прогресса$/))) return `${m[1]}% overall progress`;
    if ((m=s.match(/^общий прогресс (\d+)%$/))) return `overall progress ${m[1]}%`;
    if ((m=s.match(/^сохранено (.+)$/))) return `saved ${m[1]}`;
    if ((m=s.match(/^Участник (P120-[A-Z0-9]+)$/))) return `Participant ${m[1]}`;
    if ((m=s.match(/^Прогресс модуля (.+): (\d+) из (\d+)$/))) return `${m[1]} module progress: ${m[2]} of ${m[3]}`;
    if ((m=s.match(/^Общий прогресс теста (\d+)%$/))) return `Overall questionnaire progress ${m[1]}%`;
    if ((m=s.match(/^Вопрос (\d+) из (\d+)$/))) return `Question ${m[1]} of ${m[2]}`;
    return s;
  }

  function translateTextNode(n) {
    const raw=n.nodeValue;
    if (!raw || !/[А-Яа-яЁё]/.test(raw)) return;
    const lead=raw.match(/^\s*/)?.[0]||'';
    const tail=raw.match(/\s*$/)?.[0]||'';
    const core=raw.trim();
    if (!core) return;
    const en=dynamic(core);
    if (en!==core) n.nodeValue=lead+en+tail;
  }

  function translateAttrs(el) {
    for (const attr of ['aria-label','title','placeholder']) {
      const raw=el.getAttribute?.(attr);
      if (!raw || !/[А-Яа-яЁё]/.test(raw)) continue;
      const en=dynamic(raw.trim());
      if (en!==raw.trim()) el.setAttribute(attr,en);
    }
  }

  function translateTree(root) {
    if (!root) return;
    if (root.nodeType===1) translateAttrs(root);
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
    let n;
    while((n=w.nextNode())) {
      if(n.nodeType===Node.TEXT_NODE) translateTextNode(n);
      else translateAttrs(n);
    }
  }

  function normalizeRoutes() {
    document.querySelectorAll('a.system-navlink').forEach(a=>a.setAttribute('href','./'));
  }

  function run() {
    document.documentElement.lang='en';
    document.documentElement.dataset.p120Locale='en';
    document.body?.setAttribute('data-p120-locale','en');
    document.title='P-120 System — English research version';
    translateTree(document.getElementById('app')||document.body);
    translateTree(document.querySelector('.topbar'));
    normalizeRoutes();
  }

  document.addEventListener('click',e=>{
    const el=e.target.closest?.('button,a');
    if(!el) return;
    let url=null;
    if(el.matches('[data-home],.brand-button')) url=new URL('../',location.href);
    else if(el.matches('[data-why-origin]')) url=new URL('../why-p120/',location.href);
    else if(el.matches('[data-science]')) url=new URL('../#science-foundation',location.href);
    else if(el.matches('[data-nav]')) url=new URL('../#'+el.dataset.nav,location.href);
    else if(el.matches('a.system-navlink')) url=new URL('./',location.href);
    if(url){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      location.href=url.href;
    }
  },true);

  let timer=0;
  function schedule(){if(timer)clearTimeout(timer);timer=setTimeout(()=>{timer=0;run()},20)}
  function start(){
    const watch=document.getElementById('app')||document.body;
    new MutationObserver(schedule).observe(watch,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
    run();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
