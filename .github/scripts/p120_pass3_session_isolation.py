from pathlib import Path

ROOT=Path('.')
FILES={
    'ru_editorial':ROOT/'index.html',
    'en_editorial':ROOT/'en/index.html',
    'ru_system':ROOT/'system/index.html',
    'en_system':ROOT/'en/system/index.html',
}

LEGACY="const KEY='p120_web_prototype_v01';"
SYSTEM_KEY="const KEY=window.P120_SESSION_KEY||(/\\/en\\/system(?:\\/|$)/i.test(location.pathname)?'p120_runtime_session_en_v1':'p120_runtime_session_ru_v1');"
CONTRACT_TAG='<script src="p120-session-contract-v1.0.js?v=pass3" data-p120-session-contract="v1.0"></script>'
MIGRATION_MARK='<!-- P120 SYSTEM CONTROLLED MIGRATION:START -->'
FRESH_OLD="const fresh=()=>({participantId:uid(),screen:'home',itemIndex:0,responses:{},adminModes:{},telemetry:[{type:'session_created',at:now()}],startedAt:null,consentAt:null,lastSavedAt:now()});"
FRESH_NEW="const fresh=()=>({participantId:uid(),sessionLocale:(window.P120_SESSION_CONTRACT?.locale||(/\\/en\\/system(?:\\/|$)/i.test(location.pathname)?'en':'ru')),screen:'home',itemIndex:0,responses:{},adminModes:{},telemetry:[{type:'session_created',at:now()}],startedAt:null,consentAt:null,lastSavedAt:now()});"
COMMENT_OLD='/* Keep the v0.1 storage key intentionally so an existing local demo session survives this UX update. */'
COMMENT_NEW='/* PASS 3: respondent state is stored in a locale-isolated System session; legacy state is copied once without deletion. */'


def replace_exact(text, old, new, expected, label):
    count=text.count(old)
    if count!=expected:
        raise SystemExit(f'{label}: expected {expected} occurrence(s), found {count}')
    return text.replace(old,new)

# Editorial routes: old embedded questionnaire code remains dormant until PASS 4,
# but it no longer owns or writes the respondent session key.
for key, storage_key in [('ru_editorial','p120_editorial_state_ru_v1'),('en_editorial','p120_editorial_state_en_v1')]:
    p=FILES[key]
    text=p.read_text(encoding='utf-8')
    text=replace_exact(text,LEGACY,f"const KEY='{storage_key}';",1,f'{key} storage boundary')
    text=text.replace(COMMENT_OLD,'/* PASS 3: dormant editorial runtime uses editorial-only state; respondent sessions belong to /system/. */',1)
    p.write_text(text,encoding='utf-8')

# System routes: use route-derived locale session key and copy-preserving migration runtime.
for key in ('ru_system','en_system'):
    p=FILES[key]
    text=p.read_text(encoding='utf-8')
    text=replace_exact(text,LEGACY,SYSTEM_KEY,2,f'{key} System key')
    if CONTRACT_TAG not in text:
        if text.count(MIGRATION_MARK)!=1:
            raise SystemExit(f'{key}: migration marker mismatch')
        text=text.replace(MIGRATION_MARK,CONTRACT_TAG+'\n  '+MIGRATION_MARK,1)
    text=replace_exact(text,FRESH_OLD,FRESH_NEW,1,f'{key} fresh session locale')
    text=text.replace(COMMENT_OLD,COMMENT_NEW,1)
    p.write_text(text,encoding='utf-8')

print('P120 PASS 3 session isolation patch: APPLIED')
