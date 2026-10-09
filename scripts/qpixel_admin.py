"""Read-only, loopback-only management endpoints. Never expose raw logs or secrets."""
import http.client
import ipaddress
import json
import posixpath
import re
import shutil
import ssl
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlparse


def admin_path(raw):
    return posixpath.normpath('/' + unquote(urlparse(raw).path).lstrip('/'))


def is_admin_path(raw):
    path = admin_path(raw)
    return path in {'/admin', '/admin.html', '/admin.js'} or path == '/api/admin' or path.startswith('/api/admin/')


def admin_allowed(handler):
    try:
        local = ipaddress.ip_address(handler.client_address[0]).is_loopback
    except ValueError:
        local = False
    return local and not handler.server.proxy_port and not handler.server.pairing_code


def read_json(path, fallback):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except (OSError, ValueError, UnicodeError):
        return fallback


def backup_path(directory, name):
    if not re.fullmatch(r'qpixel-(projects|settings)-\d{8}-\d{6}\.json', name):
        return None
    path = directory / name
    return path if not path.is_symlink() and path.is_file() and path.resolve().parent == directory.resolve() else None


def tablet_status():
    cert_dir = Path.home() / '.config/qpixel/ipad-cert'
    try:
        host = (cert_dir / 'qpixel-ipad-host.txt').read_text().strip()
        if not ipaddress.ip_address(host).is_private:
            return {'state': 'unknown', 'label': '未找到局域网共享地址'}
        context = ssl.create_default_context(cafile=str(cert_dir / 'qpixel-ipad.crt'))
        connection = http.client.HTTPSConnection(host, 8767, timeout=1, context=context)
        try:
            connection.request('GET', '/pair')
            response = connection.getresponse()
            ok = response.status == 200
            response.read(1024)
        finally:
            connection.close()
        return {'state': 'reachable' if ok else 'unavailable', 'label': 'HTTPS 配对入口可访问' if ok else '配对入口未就绪'}
    except (OSError, ValueError, http.client.HTTPException):
        return {'state': 'unknown', 'label': '无法确认平板服务；请检查共享入口'}


def dashboard(root, data_dir, backup_dir):
    diagnostics = []
    index = read_json(data_dir / 'qpixel-project-index-v1.json', {})
    signatures = []
    for path in (data_dir / 'projects').glob('*.json'):
        try:
            stat = path.stat(); signatures.append([path.name, stat.st_size, stat.st_mtime_ns])
        except OSError: pass
    projects = index.get('projects') if isinstance(index, dict) and index.get('signatures') == sorted(signatures) else None
    # A missing index must not cause an admin visit to migrate or write user files.
    if not isinstance(projects, list):
        projects = []
        for path in sorted((data_dir / 'projects').glob('*.json')):
            value = read_json(path, None)
            if isinstance(value, dict):
                projects.append(value)
            else:
                diagnostics.append({'kind': 'project-read', 'label': '存在无法读取的作品文件'})
        if not projects:
            legacy = read_json(data_dir / 'qpixel-projects.json', [])
            if isinstance(legacy, list): projects = legacy
    fields = ('id', 'title', 'name', 'width', 'height', 'updatedAt', 'savedAt', 'deleted', 'historyCount')
    summaries = [{key: item[key] for key in fields if key in item} for item in projects if isinstance(item, dict)]
    backups = []
    for path in sorted(backup_dir.glob('*.json'), reverse=True):
        if not backup_path(backup_dir, path.name): continue
        try:
            stat = path.stat()
            backups.append({'name': path.name, 'size': stat.st_size, 'updatedAt': datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat()})
        except OSError: pass
    for filename, label in [('qpixel_localserver.err.log', '电脑服务'), ('qpixel_ipadserver.err.log', '平板服务')]:
        try:
            with (Path('/tmp') / filename).open('rb') as file:
                file.seek(0, 2); file.seek(max(0, file.tell() - 65536))
                tail = file.read().decode('utf-8', errors='ignore').lower()
            count = sum(tail.count(word) for word in ('traceback', 'exception', 'address already in use'))
            diagnostics.append({'kind': 'log-summary', 'label': label, 'errorMarkers': count, 'scope': '日志末尾最多64KB；仅计数，不代表当前故障'})
        except OSError:
            diagnostics.append({'kind': 'log-summary', 'label': label, 'scope': '无可读取的日志摘要'})
    release = read_json(root / 'release-info.json', {})
    release = {k: release[k] for k in ('version', 'build', 'gitCommit', 'builtAt') if isinstance(release, dict) and k in release}
    try:
        match = re.search(r'<meta name="qpixel-revision" content="([a-zA-Z0-9-]+)"', (root / 'index.html').read_text())
        if match: release['interfaceRevision'] = match.group(1)
    except OSError: pass
    return {'release': release, 'computer': {'state': 'running', 'label': '当前电脑服务正常响应'}, 'tablet': tablet_status(), 'projects': summaries, 'backups': backups, 'diagnostics': diagnostics, 'checkedAt': datetime.now(timezone.utc).isoformat()}


def handle_admin_get(handler, root, data_dir, backup_dir):
    path = admin_path(handler.path)
    if path == '/api/admin/status':
        handler.send_json({'available': True}); return True
    if path == '/api/admin/dashboard':
        handler.send_json(dashboard(root, data_dir, backup_dir)); return True
    if path.startswith('/api/admin/backups/'):
        target = backup_path(backup_dir, path[len('/api/admin/backups/'):])
        if not target:
            handler.send_error(404, 'Backup not found'); return True
        try:
            with target.open('rb') as file:
                handler.send_response(200)
                handler.send_header('Content-Type', 'application/json')
                handler.send_header('Content-Disposition', f'attachment; filename="{target.name}"')
                handler.send_header('Content-Length', str(target.stat().st_size))
                handler.end_headers()
                shutil.copyfileobj(file, handler.wfile)
        except OSError: pass
        return True
    if path in {'/admin', '/admin.html', '/admin.js'}:
        target = root / ('admin.js' if path == '/admin.js' else 'admin.html')
        try: body = target.read_bytes()
        except OSError:
            handler.send_error(404); return True
        handler.send_response(200)
        handler.send_header('Content-Type', 'application/javascript; charset=utf-8' if path == '/admin.js' else 'text/html; charset=utf-8')
        handler.send_header('Content-Length', str(len(body)))
        handler.end_headers(); handler.wfile.write(body); return True
    if path == '/api/admin' or path.startswith('/api/admin/'):
        handler.send_error(404); return True
    return False
