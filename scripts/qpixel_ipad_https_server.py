#!/usr/bin/env python3
import argparse
import ipaddress
import json
import os
import shutil
import ssl
import subprocess
import tempfile
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

from qpixel_openai import OpenAIConfigError, OpenAIRequestError, generate_image, get_provider_status


ROOT = Path(__file__).resolve().parent
DATA_DIR = Path.home() / "Documents" / "Q像素"
PROJECTS_FILE = DATA_DIR / "qpixel-projects.json"
SETTINGS_FILE = DATA_DIR / "qpixel-settings.json"
BACKUP_DIR = DATA_DIR / "backups"
PROJECT_BACKUP_LIMIT = 100
SETTINGS_BACKUP_LIMIT = 30
CERT_DIR = DATA_DIR / "ipad-cert"
CERT_FILE = CERT_DIR / "qpixel-ipad.crt"
KEY_FILE = CERT_DIR / "qpixel-ipad.key"
CERT_HOST_FILE = CERT_DIR / "qpixel-ipad-host.txt"


class QPixelHttpsHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        path = urlparse(self.path).path
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        if path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        else:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/ai/status":
            self.send_json({"providers": get_provider_status()})
            return
        if path == "/api/health":
            self.send_json(health_payload(self.read_projects(), self.read_settings()))
            return
        if path == "/api/projects/index":
            self.send_json([summary for summary in (project_summary(project) for project in self.read_projects()) if summary])
            return
        if path == "/api/projects":
            self.send_json(self.read_projects())
            return
        project_id = get_project_id_from_path(path)
        if project_id:
            project = find_project(self.read_projects(), project_id)
            if project:
                self.send_json(project)
            else:
                self.send_error(404, "Project not found")
            return
        if path == "/api/settings":
            self.send_json(self.read_settings())
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/ai/generate":
            self.generate_ai_image()
            return
        if path == "/api/settings":
            self.write_settings_request()
            return
        project_id = get_project_id_from_path(path)
        if project_id:
            self.write_single_project_request(project_id)
            return
        if path != "/api/projects":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length") or "0")
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8") or "[]")
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
            return
        if not isinstance(payload, list):
            self.send_error(400, "Expected project list")
            return
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        backup_projects_file()
        payload = merge_projects(self.read_projects(), payload)
        tmp = PROJECTS_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload[:200], ensure_ascii=False), encoding="utf-8")
        os.replace(tmp, PROJECTS_FILE)
        self.send_json({"ok": True, "count": len(payload[:200])})

    def generate_ai_image(self):
        length = int(self.headers.get("Content-Length") or "0")
        try:
            request = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.send_json({"error": "请求格式无效"}, status=400)
            return
        try:
            result = generate_image(request)
        except ValueError as error:
            self.send_json({"error": str(error)}, status=400)
            return
        except OpenAIConfigError as error:
            self.send_json({"error": str(error)}, status=503)
            return
        except OpenAIRequestError as error:
            self.send_json({"error": str(error)}, status=502)
            return
        self.send_json({"ok": True, **result})

    def write_single_project_request(self, project_id):
        length = int(self.headers.get("Content-Length") or "0")
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
            return
        if not isinstance(payload, dict) or not payload.get("id"):
            self.send_error(400, "Expected project object")
            return
        if str(payload.get("id")) != project_id:
            self.send_error(400, "Project id mismatch")
            return
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        backup_projects_file()
        projects = merge_projects(self.read_projects(), [payload])
        tmp = PROJECTS_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(projects[:200], ensure_ascii=False), encoding="utf-8")
        os.replace(tmp, PROJECTS_FILE)
        self.send_json({"ok": True, "id": project_id, "count": len(projects[:200])})

    def write_settings_request(self):
        length = int(self.headers.get("Content-Length") or "0")
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
            return
        if not isinstance(payload, dict):
            self.send_error(400, "Expected settings object")
            return
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        backup_settings_file()
        existing = self.read_settings()
        merged = merge_settings(existing, payload)
        tmp = SETTINGS_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(merged, ensure_ascii=False), encoding="utf-8")
        os.replace(tmp, SETTINGS_FILE)
        self.send_json({"ok": True, "updatedAt": merged.get("updatedAt")})

    def read_projects(self):
        if not PROJECTS_FILE.exists():
            return []
        try:
            data = json.loads(PROJECTS_FILE.read_text(encoding="utf-8"))
            return data if isinstance(data, list) else []
        except Exception:
            return []

    def read_settings(self):
        if not SETTINGS_FILE.exists():
            return {"stylePresets": [], "exportPresets": [], "updatedAt": ""}
        try:
            data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
            return data if isinstance(data, dict) else {"stylePresets": [], "exportPresets": [], "updatedAt": ""}
        except Exception:
            return {"stylePresets": [], "exportPresets": [], "updatedAt": ""}

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def ensure_cert(host):
    CERT_DIR.mkdir(parents=True, exist_ok=True)
    previous_host = CERT_HOST_FILE.read_text(encoding="utf-8").strip() if CERT_HOST_FILE.exists() else ""
    if CERT_FILE.exists() and KEY_FILE.exists() and previous_host == host:
        return
    for file in (CERT_FILE, KEY_FILE):
        if file.exists():
            file.unlink()
    openssl = shutil.which("openssl")
    if not openssl:
        raise RuntimeError("没有找到 openssl，无法生成 iPad HTTPS 证书。")
    san = f"IP:{host}" if is_ip(host) else f"DNS:{host}"
    config = f"""
[req]
distinguished_name=req_distinguished_name
x509_extensions=v3_req
prompt=no
[req_distinguished_name]
CN={host}
[v3_req]
basicConstraints=critical,CA:TRUE
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid:always,issuer
subjectAltName={san},DNS:localhost,IP:127.0.0.1
keyUsage=critical,digitalSignature,keyCertSign,keyEncipherment
extendedKeyUsage=serverAuth
"""
    with tempfile.NamedTemporaryFile("w", delete=False) as file:
        file.write(config)
        config_path = file.name
    try:
        subprocess.run([
            openssl, "req", "-x509", "-nodes", "-newkey", "rsa:2048",
            "-keyout", str(KEY_FILE),
            "-out", str(CERT_FILE),
            "-days", "825",
            "-config", config_path
        ], check=True)
        CERT_HOST_FILE.write_text(host, encoding="utf-8")
    finally:
        os.unlink(config_path)


def is_ip(value):
    try:
        ipaddress.ip_address(value)
        return True
    except ValueError:
        return False


def project_sort_time(project):
    if not isinstance(project, dict):
        return ""
    return project.get("updatedAt") or project.get("savedAt") or project.get("createdAt") or ""


def normalize_project(project):
    return project if isinstance(project, dict) and project.get("id") else None


def project_summary(project):
    project = normalize_project(project)
    if not project:
        return None
    payload = project.get("payload") if isinstance(project.get("payload"), dict) else {}
    pattern = payload.get("pattern") if isinstance(payload.get("pattern"), dict) else {}
    summary = {key: value for key, value in project.items() if key != "payload"}
    summary["hasPayload"] = bool(project.get("payload"))
    summary["width"] = summary.get("width") or pattern.get("width") or 0
    summary["height"] = summary.get("height") or pattern.get("height") or 0
    summary["payloadSize"] = len(json.dumps(project.get("payload") or {}, ensure_ascii=False))
    return summary


def get_project_id_from_path(path):
    prefix = "/api/projects/"
    if not path.startswith(prefix):
        return ""
    project_id = unquote(path[len(prefix):].strip("/"))
    return project_id if project_id and "/" not in project_id else ""


def find_project(projects, project_id):
    for project in projects or []:
        project = normalize_project(project)
        if project and str(project.get("id")) == project_id:
            return project
    return None


def file_size(path):
    try:
        return path.stat().st_size if path.exists() else 0
    except OSError:
        return 0


def health_payload(projects, settings):
    projects_ok = isinstance(projects, list)
    settings_ok = isinstance(settings, dict)
    return {
        "ok": projects_ok and settings_ok,
        "projectsOk": projects_ok,
        "settingsOk": settings_ok,
        "projectCount": len(projects) if projects_ok else 0,
        "projectsFileExists": PROJECTS_FILE.exists(),
        "projectsFileSize": file_size(PROJECTS_FILE),
        "settingsFileExists": SETTINGS_FILE.exists(),
        "settingsFileSize": file_size(SETTINGS_FILE),
        "backupCount": len(list(BACKUP_DIR.glob("*.json"))) if BACKUP_DIR.exists() else 0,
        "dataDir": str(DATA_DIR),
        "updatedAt": datetime.now().isoformat(),
    }


def merge_projects(existing, incoming):
    merged = {}
    for project in list(existing or []) + list(incoming or []):
        project = normalize_project(project)
        if not project:
            continue
        current = merged.get(project["id"])
        if current is None or project_sort_time(project) >= project_sort_time(current):
            if current and not project.get("payload") and current.get("payload"):
                project = dict(project)
                project["payload"] = current.get("payload")
            merged[project["id"]] = project
    return sorted(merged.values(), key=project_sort_time, reverse=True)


def backup_projects_file():
    if not PROJECTS_FILE.exists():
        return
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = BACKUP_DIR / f"qpixel-projects-{stamp}.json"
    shutil.copy2(PROJECTS_FILE, backup)
    cleanup_backups()


def backup_settings_file():
    if not SETTINGS_FILE.exists():
        return
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = BACKUP_DIR / f"qpixel-settings-{stamp}.json"
    shutil.copy2(SETTINGS_FILE, backup)
    cleanup_backups()


def cleanup_backup_group(pattern, keep_count, now=None):
    if not BACKUP_DIR.exists():
        return 0
    files = []
    for path in BACKUP_DIR.glob(pattern):
        if not path.is_file() or path.suffix != ".json":
            continue
        try:
            files.append((path.stat().st_mtime, path))
        except OSError:
            continue
    files.sort(reverse=True)
    removed = 0
    for mtime, path in files[keep_count:]:
        try:
            path.unlink()
            removed += 1
        except OSError:
            pass
    return removed


def cleanup_backups():
    return (
        cleanup_backup_group("qpixel-projects-*.json", PROJECT_BACKUP_LIMIT)
        + cleanup_backup_group("qpixel-settings-*.json", SETTINGS_BACKUP_LIMIT)
    )


def item_sort_time(item):
    if not isinstance(item, dict):
        return ""
    return item.get("updatedAt") or item.get("savedAt") or item.get("createdAt") or item.get("id") or ""


def normalize_setting_item(item):
    return item if isinstance(item, dict) and item.get("id") else None


def merge_setting_lists(existing, incoming, limit=120):
    merged = {}
    for item in list(existing or []) + list(incoming or []):
        item = normalize_setting_item(item)
        if not item:
            continue
        current = merged.get(item["id"])
        if current is None or item_sort_time(item) >= item_sort_time(current):
            merged[item["id"]] = item
    return sorted(merged.values(), key=item_sort_time, reverse=True)[:limit]


def merge_settings(existing, incoming):
    existing = existing if isinstance(existing, dict) else {}
    incoming = incoming if isinstance(incoming, dict) else {}
    now = datetime.now().isoformat()
    if incoming.get("replace"):
        return {
            "stylePresets": merge_setting_lists([], incoming.get("stylePresets"), 80),
            "exportPresets": merge_setting_lists([], incoming.get("exportPresets"), 80),
            "updatedAt": incoming.get("updatedAt") or now,
        }
    return {
        "stylePresets": merge_setting_lists(existing.get("stylePresets"), incoming.get("stylePresets"), 80),
        "exportPresets": merge_setting_lists(existing.get("exportPresets"), incoming.get("exportPresets"), 80),
        "updatedAt": incoming.get("updatedAt") or existing.get("updatedAt") or now,
    }

def main():
    parser = argparse.ArgumentParser(description="Q像素 iPad 本地访问服务")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--cert-host", default=os.environ.get("QPIXEL_IP", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=8766)
    parser.add_argument("--http", action="store_true", help="使用普通 HTTP，保留创作空间同步接口。")
    args = parser.parse_args()
    cleanup_backups()
    server = ThreadingHTTPServer((args.host, args.port), QPixelHttpsHandler)
    if args.http:
        print(f"Q像素 iPad HTTP 服务：http://{args.cert_host}:{args.port}/index.html")
    else:
        ensure_cert(args.cert_host)
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(certfile=str(CERT_FILE), keyfile=str(KEY_FILE))
        server.socket = context.wrap_socket(server.socket, server_side=True)
        print(f"Q像素 iPad HTTPS 服务：https://{args.cert_host}:{args.port}/index.html")
        print(f"iPad 证书文件：{CERT_FILE}")
    server.serve_forever()


if __name__ == "__main__":
    main()
