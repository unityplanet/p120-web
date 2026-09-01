from pathlib import Path
import re

p = Path('why-p120/index.html')
s = p.read_text(encoding='utf-8')

# Force the current mobile-navigation runtime to bypass stale GitHub Pages/browser caches.
s2, n = re.subn(
    r'<script src="why-p120\.js(?:\?[^\"]*)?"></script>',
    '<script src="why-p120.js?v=mobile-nav-v1"></script>',
    s,
    count=1,
)
if n != 1:
    raise SystemExit('why-p120.js script tag not found exactly once')

p.write_text(s2, encoding='utf-8')
print('Why P-120 mobile navigation cache key: PASS')
