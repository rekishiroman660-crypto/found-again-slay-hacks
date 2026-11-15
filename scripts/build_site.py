"""Stage the static app and notices; require all locked assets to verify."""
from pathlib import Path
import shutil
from prepare_assets import ROOT, entries, check

for asset in entries():
    check(ROOT / asset['path'], asset)
site = ROOT / '_site'
if site.exists():
    shutil.rmtree(site)
shutil.copytree(ROOT / 'app', site)
shutil.copytree(ROOT / 'licenses', site / 'licenses')
for name in ['LICENSE', 'THIRD_PARTY.md']:
    shutil.copy2(ROOT / name, site / name)
(site / '.nojekyll').touch()
print('Staged app and license notices in _site/')
