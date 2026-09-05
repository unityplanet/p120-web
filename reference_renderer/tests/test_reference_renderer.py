import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from p120_reference_renderer import validate_print_document, ReferenceRenderError

fixture = json.loads((ROOT / 'fixtures' / 'synthetic_report_ru.json').read_text(encoding='utf-8'))
checks = []

def must_pass(name, fn):
    fn(); checks.append((name, 'PASS'))

def must_fail(name, fn, contains):
    try:
        fn()
    except ReferenceRenderError as e:
        assert contains in str(e), (name, str(e))
        checks.append((name, 'PASS'))
    else:
        raise AssertionError(name + ' did not fail')

must_pass('valid fixture', lambda: validate_print_document(fixture))

x = copy.deepcopy(fixture); x['publication_authorization'] = 'NO_PUBLICATION'
must_fail('NO_PUBLICATION fail closed', lambda: validate_print_document(x), 'NO_PUBLICATION')

x = copy.deepcopy(fixture); x['architecture_id'] = 'P120-OTHER/v9'
must_fail('wrong architecture id fail closed', lambda: validate_print_document(x), 'architecture_id')

x = copy.deepcopy(fixture); x['pages'][2]['blocks'][2]['numeric_value'] = 99
must_fail('L3 numeric forbidden', lambda: validate_print_document(x), 'cannot carry numeric_value')

x = copy.deepcopy(fixture); x['pages'][4]['blocks'][2]['numeric_value'] = 1
must_fail('L4 numeric forbidden', lambda: validate_print_document(x), 'cannot carry numeric_value')

x = copy.deepcopy(fixture); x['pages'][3]['blocks'][1]['numeric_value'] = 0
must_fail('missingness cannot become zero', lambda: validate_print_document(x), 'missing-like state')

x = copy.deepcopy(fixture); x['pages'][2]['blocks'][0]['text'] = 'Internal CLM-SECRET-001 should not render'
must_fail('internal id visible forbidden', lambda: validate_print_document(x), 'internal routing identifier')

x = copy.deepcopy(fixture); x['pages'][2]['blocks'][0]['text'] = 'Write respondent@example.com'
must_fail('visible email-like content forbidden', lambda: validate_print_document(x), 'email-like')

x = copy.deepcopy(fixture); x['pages'][2]['blocks'][0]['text'] = 'Call +41 79 123 45 67'
must_fail('visible phone-like content forbidden', lambda: validate_print_document(x), 'phone-like')

x = copy.deepcopy(fixture); x['pages'] = x['pages'][:-1]
must_fail('all seven page classes required', lambda: validate_print_document(x), 'missing page classes')

print(json.dumps({'ok': True, 'check': 'P120_REFERENCE_RENDERER_CONTRACT_TESTS', 'results': checks}, ensure_ascii=False))
