from __future__ import annotations
import argparse, hashlib, html, json, re
from pathlib import Path
from typing import Any
from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration

RENDERER_ID='p120.reference_pdf_renderer'; RENDERER_VERSION='1.0.1'; ARCHITECTURE_ID='P120-REP-ARCH-001/v1.0'
PAGE_CLASSES={'cover','how_to_read','executive_portrait','profile_module','cross_layer','limitations','technical_appendix'}
MISSING_STATES={'missing','not_applicable','not_exposed','insufficient_coverage'}
FONT_HASHES={
'NotoSerifDisplay-Regular.ttf':'8b45c367c7c6a4a1d82f132464b7f1aa8ff092df06602522b981daf1da64d927',
'Prata-Regular.ttf':'3b2b880737be3bda5f03554297b758516876157c88f9e3b3bae8fa1fc96a2c2c',
'IBMPlexSans-Regular.ttf':'975dcda37d80f038dcd143c22e33ca2d97a0cc5a929aace1c749153b0fe1afa5',
'IBMPlexSans-Light.ttf':'2218b5f3f1fc9d3a793343f45c3be5ee7eae9584a7a52391bb8cf2d37622b3e0',
'IBMPlexSans-Italic.ttf':'a9c6ef9942c49e49d11e11a6dacc0b3a087978757e9b22a06b8ac22a6400fb15',
'IBMPlexSans-LightItalic.ttf':'54ad6d58d163b6b1f850fcbab3c46a1ed6c1ec3050524abb904c076a52c6bb1a',
'IBMPlexSans-SemiBold.ttf':'a20caf8286023a6a7a85e40b1d2a4ae9fc3e3b1f9eda8f4c542dd4986af67bb1',
'IBMPlexMono-Regular.ttf':'7c6fbddca4b700be918f5f6183d9bd4464fa427fe435f0b480d77fe2bb8c5a43'}
INTERNAL_ID_RE=re.compile(r'\b(?:CLM|SYN|BR|RHO|RLD|RPK|ASM|ART)-[A-Z0-9][A-Z0-9._:-]*\b')
EMAIL_RE=re.compile(r'\b[^\s@]+@[^\s@]+\.[^\s@]+\b'); PHONE_RE=re.compile(r'\+?\d[\d\s().-]{8,}\d')
class ReferenceRenderError(ValueError): pass

def _visible_strings(doc:dict[str,Any]):
    if doc.get('title'): yield str(doc['title'])
    for p in doc.get('pages',[]):
        for k in ('heading','kicker','intro','subtitle','note'):
            if p.get(k): yield str(p[k])
        for pair in p.get('fields',[]): yield str(pair[0]); yield str(pair[1])
        for b in p.get('blocks',[]):
            for k in ('title','text','visible_state'):
                if b.get(k): yield str(b[k])

def validate_print_document(doc:dict[str,Any]):
    if doc.get('schema_id')!='p120.reference_print_document': raise ReferenceRenderError('schema_id mismatch')
    if doc.get('schema_version')!='1.0.0': raise ReferenceRenderError('schema_version mismatch')
    if doc.get('architecture_id')!=ARCHITECTURE_ID: raise ReferenceRenderError('architecture_id mismatch')
    if doc.get('publication_authorization')=='NO_PUBLICATION': raise ReferenceRenderError('NO_PUBLICATION cannot render')
    if doc.get('publication_authorization') not in {'FULL','EXPERT_ONLY'}: raise ReferenceRenderError('invalid publication authorization')
    pages=doc.get('pages') or []; missing=PAGE_CLASSES-{p.get('page_class') for p in pages}
    if missing: raise ReferenceRenderError(f'missing page classes: {sorted(missing)}')
    for p in pages:
        if p.get('page_class') not in PAGE_CLASSES: raise ReferenceRenderError('unknown page class')
        for b in p.get('blocks',[]):
            ec=b.get('evidence_class'); st=b.get('source_state')
            if ec in {'L1','L2'} and st is None: raise ReferenceRenderError('L1/L2 require source_state')
            if ec in {'L3','L4'} and b.get('numeric_value') is not None: raise ReferenceRenderError(f'{ec} cannot carry numeric_value')
            if st in MISSING_STATES and b.get('numeric_value') is not None: raise ReferenceRenderError('missing-like state cannot carry numeric_value')
    visible='\n'.join(_visible_strings(doc))
    if INTERNAL_ID_RE.search(visible): raise ReferenceRenderError('internal routing identifier in visible content')
    if EMAIL_RE.search(visible): raise ReferenceRenderError('email-like data in visible content')
    if PHONE_RE.search(visible): raise ReferenceRenderError('phone-like data in visible content')
    return {'valid':True,'pages':len(pages),'authorization':doc['publication_authorization']}

def verify_fonts(font_dir:Path):
    out={}
    for n,e in FONT_HASHES.items():
        p=font_dir/n
        if not p.is_file(): raise ReferenceRenderError(f'missing canonical font: {n}')
        g=hashlib.sha256(p.read_bytes()).hexdigest()
        if g!=e: raise ReferenceRenderError(f'font hash mismatch: {n}')
        out[n]=g
    return out

def esc(x): return html.escape(str(x),quote=True)
def evlabel(ec,lang):
    ru={'L1':'L1 · Измерено','L2':'L2 · Выведено по правилу','L3':'L3 · Интерпретация','L4':'L4 · Исследовательское'}
    en={'L1':'L1 · Measured','L2':'L2 · Derived','L3':'L3 · Interpretive','L4':'L4 · Exploratory'}
    return (ru if lang=='ru' else en).get(ec,'')
def pclabel(pc,lang):
    ru={'cover':'ОТЧЁТ','how_to_read':'КАК ЧИТАТЬ','executive_portrait':'КОРОТКИЙ ПОРТРЕТ','profile_module':'ПРОФИЛЬ / МОДУЛЬ','cross_layer':'МЕЖУРОВНЕВАЯ ИНТЕГРАЦИЯ','limitations':'ОГРАНИЧЕНИЯ','technical_appendix':'ТЕХНИЧЕСКОЕ ПРИЛОЖЕНИЕ'}
    return ru[pc] if lang=='ru' else pc.replace('_',' ').upper()

def build_html(doc,font_dir:Path):
    validate_print_document(doc); verify_fonts(font_dir); lang=doc.get('language','ru')
    uri=lambda n:(font_dir/n).as_uri()
    css=f"""
    @font-face{{font-family:P120Display;src:url('{uri('NotoSerifDisplay-Regular.ttf')}')}}
    @font-face{{font-family:P120Prata;src:url('{uri('Prata-Regular.ttf')}')}}
    @font-face{{font-family:P120Sans;src:url('{uri('IBMPlexSans-Regular.ttf')}');font-weight:400}}
    @font-face{{font-family:P120Sans;src:url('{uri('IBMPlexSans-SemiBold.ttf')}');font-weight:600}}
    @font-face{{font-family:P120Sans;src:url('{uri('IBMPlexSans-Italic.ttf')}');font-style:italic}}
    @font-face{{font-family:P120Mono;src:url('{uri('IBMPlexMono-Regular.ttf')}')}}
    @page{{size:A4;margin:17mm 18mm 18mm 18mm;@bottom-left{{content:'P120 · WHITE PRINT EDITION';font:7pt P120Sans;color:#666}}@bottom-right{{content:counter(page);font:7pt P120Sans;color:#666}}}}
    *{{box-sizing:border-box}}body{{font-family:P120Sans;font-size:10pt;line-height:1.48;color:#202526;margin:0}}section.page{{break-after:page;min-height:245mm}}section.page:last-child{{break-after:auto}}
    .kicker{{font:600 7.5pt P120Sans;letter-spacing:.13em;color:#356e69;margin:0 0 10mm}}h1{{font:400 42pt P120Display;margin:0 0 7mm}}h2{{font:400 18pt P120Prata;margin:0 0 5mm}}.intro{{font-size:10.5pt;color:#3d4444;margin-bottom:8mm}}.auth{{font:600 8pt P120Sans;border-top:.6pt solid #6b8f8b;border-bottom:.6pt solid #c6cfcd;padding:3mm 0;margin:8mm 0;color:#2e5551}}
    .block{{border-top:1.1pt solid #788c89;padding:4mm 0 4.5mm;break-inside:avoid}}.block.l2{{border-top-style:dashed}}.block.l3{{border-top-width:.6pt}}.block.l4{{border-top-style:dotted;border-top-width:.6pt}}.ev{{font:600 7.3pt P120Sans;letter-spacing:.08em;color:#356e69}}.bt{{font:600 10pt P120Sans;margin:1.4mm 0 1mm}}.bv{{font:400 16pt P120Display;margin:1mm 0 2mm}}.state{{font:italic 8.4pt P120Sans;color:#5b6262;margin-top:1.5mm}}
    .fields{{width:100%;border-collapse:collapse;margin-top:7mm}}.fields th,.fields td{{border-top:.5pt solid #b8c1bf;padding:2.5mm 1mm;text-align:left;vertical-align:top}}.fields th{{font:600 8.5pt P120Sans;width:34%}}.fields td{{font:9pt P120Sans}}.cover{{display:flex;flex-direction:column;justify-content:space-between}}.cover .title{{margin-top:30mm}}.cover .subtitle{{font:400 20pt P120Prata;max-width:130mm}}.cover .note{{font:8.5pt P120Sans;color:#626a69;max-width:135mm;margin-bottom:22mm}}.limitation{{background:#f7f7f4;padding:4mm 5mm;margin:2mm 0 4mm;border-left:1.2pt solid #8a9693}}
    """
    parts=[f"<!doctype html><html lang='{esc(lang)}'><head><meta charset='utf-8'><style>{css}</style></head><body>"]
    auth=doc['publication_authorization']
    for p in doc['pages']:
        pc=p['page_class']; parts.append(f"<section class='page {pc} {'cover' if pc=='cover' else ''}'>")
        if pc=='cover':
            parts.append(f"<div class='title'><div class='kicker'>{esc(pclabel(pc,lang))}</div><h1>{esc(p.get('heading',doc['title']))}</h1><div class='subtitle'>{esc(p.get('subtitle',''))}</div><div class='auth'>Публикация: {esc(auth)}</div></div><div class='note'>{esc(p.get('note',''))}</div>")
        else:
            parts.append(f"<div class='kicker'>{esc(pclabel(pc,lang))}</div><h2>{esc(p.get('heading',''))}</h2>")
            if p.get('intro'): parts.append(f"<div class='intro'>{esc(p['intro'])}</div>")
            if p.get('fields'):
                parts.append("<dl class='fields'>")
                for k,v in p['fields']: parts.append(f"<div class='fieldrow'><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>")
                parts.append('</dl>')
            for b in p.get('blocks',[]):
                ec=b.get('evidence_class'); cls='block '+(ec.lower() if ec else '')+(' limitation' if pc=='limitations' else '')
                parts.append(f"<article class='{cls}'>")
                if ec: parts.append(f"<div class='ev'>{esc(evlabel(ec,lang))}</div>")
                parts.append(f"<div class='bt'>{esc(b.get('title',''))}</div>")
                if b.get('numeric_value') is not None: parts.append(f"<div class='bv'>{esc(b['numeric_value'])}{' '+esc(b.get('unit')) if b.get('unit') else ''}</div>")
                if b.get('text'): parts.append(f"<div>{esc(b['text'])}</div>")
                if b.get('visible_state'): parts.append(f"<div class='state'>{esc(b['visible_state'])}</div>")
                parts.append('</article>')
        parts.append('</section>')
    parts.append('</body></html>'); return ''.join(parts)

def trace_manifest(doc,pdf=None):
    trace=[]
    for i,p in enumerate(doc['pages'],1):
        for b in p.get('blocks',[]): trace.append({'page':i,'element_id':b.get('element_id'),'source_ids':b.get('source_ids',[]),'evidence_class':b.get('evidence_class'),'source_state':b.get('source_state')})
    m={'schema_id':'p120.reference_renderer_trace','schema_version':'1.0.1','renderer':f'{RENDERER_ID}/{RENDERER_VERSION}','architecture_id':ARCHITECTURE_ID,'report_id':doc['report_id'],'publication_authorization':doc['publication_authorization'],'trace':trace}
    if pdf and Path(pdf).exists(): m['pdf_sha256']=hashlib.sha256(Path(pdf).read_bytes()).hexdigest()
    return m

def render_pdf(doc,out,font_dir,manifest=None):
    out=Path(out); out.parent.mkdir(parents=True,exist_ok=True)
    HTML(string=build_html(doc,Path(font_dir)),base_url=str(out.parent)).write_pdf(out,font_config=FontConfiguration(),pdf_variant='pdf/ua-1',pdf_tags=True,pdf_identifier=b'P120-REFERENCE-RENDERER-v1.0.1')
    m=trace_manifest(doc,out)
    if manifest: Path(manifest).write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return m

def main():
    a=argparse.ArgumentParser(); a.add_argument('input'); a.add_argument('output'); a.add_argument('--font-dir',required=True); a.add_argument('--manifest'); x=a.parse_args()
    doc=json.loads(Path(x.input).read_text(encoding='utf-8')); render_pdf(doc,x.output,x.font_dir,x.manifest)
if __name__=='__main__': main()
