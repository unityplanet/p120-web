/* P-120 EN instrument binding v0.4
   Controlled language realization only.
   Item IDs, order, response values, scoring and measurement logic are unchanged. */
(() => {
  'use strict';
  const instrument = window.P120_INSTRUMENT;
  const T = window.P120_EN_ITEM_TRANSLATIONS || {};
  if (!instrument || !Array.isArray(instrument.items)) throw new Error('P120_INSTRUMENT unavailable');

  const moduleCopy = {
    SAT24: {
      title: 'Social-Affective Touch Architecture',
      subtitle: 'Social-affective touch',
      intro: 'The following questions concern touch from other people in situations that you yourself do not experience as sexual. Answer based on your usual real-life experience. If you do not have enough relevant experience, choose N/A.'
    },
    P72: {
      title: 'Erotic-Aesthetic Perception Profile',
      subtitle: 'Activation architecture · Core-72',
      intro: 'Questions 1–48: answer with the past 6–12 months and real experiences in mind. If you genuinely do not have enough relevant experience, choose N/A. Questions 49–72 are comparative choices: choose the mechanism that would be harder for you to replace.'
    },
    P72D: {
      title: 'Erotic Desire Stability and Couple Compatibility Profile',
      subtitle: 'Desire stability and couple compatibility',
      intro: 'Before D01–D48, choose a response mode. It sets the context for your answers and does not change Core-48 or the scoring logic.'
    },
    AO12: {
      title: 'Attachment Regulation Architecture',
      subtitle: 'Attachment regulation',
      intro: 'Think of a relationship in which the other person is genuinely emotionally important to you. We are interested in what usually happens inside you when the connection becomes significant.'
    },
    SOMA24: {
      title: 'Bodily Architecture of Erotic Response',
      subtitle: 'Bodily architecture of erotic response',
      intro: 'This section concerns how you personally experience your own body in erotic situations. If you do not have enough relevant experience, choose N/A.'
    }
  };

  instrument.status = 'Research version | 18+';
  instrument.disclaimer = 'This is not a validated, standardized, norm-referenced, clinical, or diagnostic instrument. N/A does not mean a low score. The result is not a diagnosis, does not determine sexual orientation, and does not establish psychological trauma.';
  instrument.locale = 'en';
  instrument.localizationVersion = 'EN v0.4 · PASS 4';

  for (const module of instrument.modules || []) {
    const m = moduleCopy[module.id];
    if (m) Object.assign(module, m);
  }

  const missing = [];
  for (const item of instrument.items) {
    const t = T[item.id];
    if (!t) { missing.push(item.id); continue; }
    item.text = t.text;
    if (item.type === 'comparative') {
      item.optionA = t.optionA;
      item.optionB = t.optionB;
      for (const choice of item.choices || []) {
        if (choice.value === 'A_STRONG') choice.label = 'A clearly';
        else if (choice.value === 'A_SLIGHT') choice.label = 'A slightly';
        else if (choice.value === 'B_SLIGHT') choice.label = 'B slightly';
        else if (choice.value === 'B_STRONG') choice.label = 'B clearly';
      }
    }
  }

  if (instrument.items.length !== 180 || missing.length) {
    throw new Error(`P120 EN binding failed: items=${instrument.items.length}, missing=${missing.join(',')}`);
  }

  window.P120_EN_BINDING = {
    locale: 'en',
    version: '0.4',
    itemCount: instrument.items.length,
    status: 'CONTROLLED_CANDIDATE_BOUND'
  };
})();
