from pathlib import Path


def must_replace(s, old, new, label):
    if old not in s:
        raise SystemExit(f'anchor not found: {label}')
    return s.replace(old, new)

# Canonical non-Main brand/navigation runtime.
p=Path('p120-brand-system-v1.0.js')
s=p.read_text(encoding='utf-8')
s=must_replace(s,"    deeper:'Go deeper', deeperNote:'Extended Research Set · optional research', together:'Together?', togetherNote:'Dyadic research layer · relationship research',\n    contact:'Contact', contactNote:'Write to P-120',","    deeper:'Go deeper', deeperNote:'Extended Research Set · optional research', together:'Together?', togetherNote:'Dyadic research layer · relationship research',\n    decisionResearch:'Decision research', decisionResearchNote:'Human-governed cognitive analysis research',\n    contact:'Contact', contactNote:'Write to P-120',",'brand EN copy')
s=must_replace(s,"    deeper:'Хотите глубже?', deeperNote:'Система углублённых исследований', together:'Мы вместе?', togetherNote:'Исследование пары',\n    contact:'Контакты', contactNote:'Связаться с P-120',","    deeper:'Хотите глубже?', deeperNote:'Система углублённых исследований', together:'Мы вместе?', togetherNote:'Исследование пары',\n    decisionResearch:'Исследование решений', decisionResearchNote:'Проект управляемого когнитивного анализа',\n    contact:'Контакты', contactNote:'Связаться с P-120',",'brand RU copy')
s=must_replace(s,"    for(const k of ['intellectual-property','privacy','terms','about','why-p120','creator','extended','together','science','contact']){","    if(p.includes('/research/how-we-decide/')) return 'research/how-we-decide';\n    for(const k of ['intellectual-property','privacy','terms','about','why-p120','creator','extended','together','science','contact']){",'brand page kind')
s=must_replace(s,"<a class=\"p120-brand53-mega-card\" href=\"${routeFor('together')}\"${current('together')}><strong>${copy.together}</strong><small>${copy.togetherNote}</small></a></section>","<a class=\"p120-brand53-mega-card\" href=\"${routeFor('together')}\"${current('together')}><strong>${copy.together}</strong><small>${copy.togetherNote}</small></a><a class=\"p120-brand53-mega-card\" href=\"${routeFor('research/how-we-decide')}\"${current('research/how-we-decide')}><strong>${copy.decisionResearch}</strong><small>${copy.decisionResearchNote}</small></a></section>",'brand mega research card')
s=must_replace(s,"<a href=\"${routeFor('together')}\">${copy.together}</a><a href=\"${routeFor('science')}\">${copy.science}</a>","<a href=\"${routeFor('together')}\">${copy.together}</a><a href=\"${routeFor('research/how-we-decide')}\">${copy.decisionResearch}</a><a href=\"${routeFor('science')}\">${copy.science}</a>",'brand footer research link')
p.write_text(s,encoding='utf-8')


def patch_nav_text(s,label):
    s=must_replace(s,"    together:'Together?', togetherNote:'Dyadic research layer',\n    coming:'Coming', language:'Language'","    together:'Together?', togetherNote:'Dyadic research layer',\n    decisionResearch:'Decision research', decisionResearchNote:'Human-governed cognitive analysis research',\n    coming:'Coming', language:'Language'",label+' EN copy')
    s=must_replace(s,"    together:'Мы вместе?', togetherNote:'Dyadic research layer · исследование пары',\n    coming:'Готовится', language:'Language'","    together:'Мы вместе?', togetherNote:'Dyadic research layer · исследование пары',\n    decisionResearch:'Исследование решений', decisionResearchNote:'Проект управляемого когнитивного анализа',\n    coming:'Готовится', language:'Language'",label+' RU copy')
    s=must_replace(s,"    together:{status:'reserved',route:'together'}\n  };","    together:{status:'reserved',route:'together'},\n    decisionResearch:{status:'active',href:'research/how-we-decide/'}\n  };",label+' route')
    s=must_replace(s,"${itemMarkup('deeper',copy.deeper,copy.deeperNote)}${itemMarkup('together',copy.together,copy.togetherNote)}","${itemMarkup('deeper',copy.deeper,copy.deeperNote)}${itemMarkup('together',copy.together,copy.togetherNote)}${itemMarkup('decisionResearch',copy.decisionResearch,copy.decisionResearchNote)}",label+' desktop item')
    s=must_replace(s,"[['deeper',copy.deeper,copy.deeperNote],['together',copy.together,copy.togetherNote]]","[['deeper',copy.deeper,copy.deeperNote],['together',copy.together,copy.togetherNote],['decisionResearch',copy.decisionResearch,copy.decisionResearchNote]]",label+' mobile item')
    return s

for fn in ['navigation-architecture-v2.js','p120-public-runtime-v1.0.js']:
    pp=Path(fn)
    pp.write_text(patch_nav_text(pp.read_text(encoding='utf-8'),fn),encoding='utf-8')

print('HG-CGA PASS2 navigation patch applied to source + generated runtime + canonical brand system.')
