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
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
DATA_DIR = Path.home() / "Documents" / "Q像素"
PROJECTS_FILE = DATA_DIR / "qpixel-projects.json"
SETTINGS_FILE = DATA_DIR / "qpixel-settings.json"
BACKUP_DIR = DATA_DIR / "backups"
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
        if path == "/api/projects":
            self.send_json(self.read_projects())
            return
        if path == "/api/settings":
            self.send_json(self.read_settings())
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/settings":
            self.write_settings_request()
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

    def send_json(self, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
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


def merge_projects(existing, incoming):
    merged = {}
    for project in list(existing or []) + list(incoming or []):
        project = normalize_project(project)
        if not project:
            continue
        current = merged.get(project["id"])
        if current is None or project_sort_time(project) >= project_sort_time(current):
            merged[project["id"]] = project
    return sorted(merged.values(), key=project_sort_time, reverse=True)


def backup_projects_file():
    if not PROJECTS_FILE.exists():
        return
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = BACKUP_DIR / f"qpixel-projects-{stamp}.json"
    shutil.copy2(PROJECTS_FILE, backup)


def backup_settings_file():
    if not SETTINGS_FILE.exists():
        return
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = BACKUP_DIR / f"qpixel-settings-{stamp}.json"
    shutil.copy2(SETTINGS_FILE, backup)


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
