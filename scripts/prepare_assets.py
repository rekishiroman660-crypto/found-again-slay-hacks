"""Fetch locked public runtime/model assets, failing closed on any mismatch."""
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import urllib.request
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
HOSTS = {'cdn.jsdelivr.net', 'raw.githubusercontent.com', 'www.apache.org', 'huggingface.co'}


def entries():
    manifest = json.loads((ROOT / 'evidence/assets.json').read_text())
    files = manifest['files']
    if not files:
        raise ValueError('Empty asset manifest')
    seen = set()
    for entry in files:
        path = PurePosixPath(entry['path'])
        if (path.is_absolute() or '..' in path.parts or path.as_posix() in seen
                or path.parts[:2] not in [('app', 'vendor'), ('app', 'models')]):
            raise ValueError('Invalid or duplicate asset path')
        seen.add(path.as_posix())
        url = urlsplit(entry['url'])
        if url.scheme != 'https' or url.hostname not in HOSTS or url.username or url.password:
            raise ValueError('Unexpected asset source')
        if not re.fullmatch(r'[0-9a-f]{64}', entry['sha256']):
            raise ValueError('Missing/invalid SHA-256')
        if not isinstance(entry['bytes'], int) or not 0 < entry['bytes'] < 100_000_000:
            raise ValueError('Invalid asset size')
    return files


def check(path, entry):
    if path.stat().st_size != entry['bytes']:
        raise RuntimeError('Size mismatch: ' + entry['path'])
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != entry['sha256']:
        raise RuntimeError('SHA-256 mismatch: ' + entry['path'])


def fetch(entry):
    path = ROOT / entry['path']
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        check(path, entry)
    else:
        temporary = path.with_name(path.name + '.part')
        try:
            with urllib.request.urlopen(entry['url'], timeout=120) as response, temporary.open('wb') as out:
                size = 0
                while chunk := response.read(1024 * 1024):
                    size += len(chunk)
                    if size > entry['bytes']:
                        raise RuntimeError('Download exceeds locked size: ' + entry['path'])
                    out.write(chunk)
            check(temporary, entry)
            temporary.replace(path)
        finally:
            temporary.unlink(missing_ok=True)
    print('Verified ' + entry['path'], flush=True)


if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(fetch, entries()))
