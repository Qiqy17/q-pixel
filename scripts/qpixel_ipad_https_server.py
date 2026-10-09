#!/usr/bin/env python3
import argparse
import fcntl
import base64
import binascii
import hashlib
import hmac
import http.client
import ipaddress
import json
import os
import re
import secrets
import shutil
import ssl
import subprocess
import tempfile
import time
from datetime import datetime, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from http.cookies import SimpleCookie
from pathlib import Path
from threading import Lock
from urllib.parse import parse_qs, unquote, urlparse

from qpixel_admin import is_admin_path, admin_allowed, handle_admin_get

from qpixel_openai import OpenAIConfigError, OpenAIRequestError, find_latest_download_image, generate_image, get_provider_status


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_WEB_DIR = SCRIPT_DIR.parent / "web"
ROOT = REPO_WEB_DIR if (REPO_WEB_DIR / "index.html").exists() else SCRIPT_DIR
DATA_DIR = Path(os.environ.get("QPIXEL_DATA_DIR") or Path.home() / "Documents" / "Q像素").expanduser()
PROJECTS_FILE = DATA_DIR / "qpixel-projects.json"
PROJECTS_DIR = DATA_DIR / "projects"
PROJECT_INDEX_FILE = DATA_DIR / "qpixel-project-index-v1.json"
SETTINGS_FILE = DATA_DIR / "qpixel-settings.json"
BACKUP_DIR = DATA_DIR / "backups"
PROJECT_BACKUP_LIMIT = 100
SETTINGS_BACKUP_LIMIT = 30
CERT_DIR = DATA_DIR / "ipad-cert"
CERT_FILE = CERT_DIR / "qpixel-ipad.crt"
KEY_FILE = CERT_DIR / "qpixel-ipad.key"
CERT_HOST_FILE = CERT_DIR / "qpixel-ipad-host.txt"
PAIRED_DEVICES_FILE = DATA_DIR / "ipad-paired-devices.json"
PAIRING_LIFETIME_SECONDS = 365 * 24 * 60 * 60
WRITE_LOCK = Lock()
PAIRING_LOCK = Lock()
PROJECT_INDEX_CACHE = None
SYNC_PROTOCOL_VERSION = 2


def paired_device_hash(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def read_paired_devices():
    try:
        data = json.loads(PAIRED_DEVICES_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    devices = data.get("devices", []) if isinstance(data, dict) else []
    now = time.time()
    return [device for device in devices if isinstance(device, dict)
            and isinstance(device.get("hash"), str) and isinstance(device.get("expires"), (int, float))
            and device["expires"] > now]


def save_paired_devices(devices):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=DATA_DIR,
                                     prefix=".ipad-paired-", delete=False) as file:
        path = Path(file.name)
        try:
            json.dump({"devices": devices}, file, ensure_ascii=False)
            file.flush()
            os.fsync(file.fileno())
        except Exception:
            path.unlink(missing_ok=True)
            raise
    try:
        os.chmod(path, 0o600)
        os.replace(path, PAIRED_DEVICES_FILE)
    finally:
        path.unlink(missing_ok=True)


def forget_paired_devices():
    with PAIRING_LOCK:
        PAIRED_DEVICES_FILE.unlink(missing_ok=True)


class QPixelHttpsHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        path = urlparse(self.path).path
        if is_admin_path(self.path):
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Frame-Options", "DENY")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'")
        host = self.headers.get("Host", "")
        origin = self.headers.get("Origin")
        if self.server.pairing_code and host in self.server.allowed_hosts and (not origin or origin == f"{self.server.scheme}://{host}") and self.paired():
            cookie = SimpleCookie()
            cookie.load(self.headers.get("Cookie", ""))
            token = cookie.get("qpixel_pair")
            if token:
                self.send_header("Set-Cookie", f"qpixel_pair={token.value}; Max-Age={PAIRING_LIFETIME_SECONDS}; HttpOnly; Secure; SameSite=Strict; Path=/")
                token_hash = paired_device_hash(token.value)
                with PAIRING_LOCK:
                    devices = read_paired_devices()
                    for device in devices:
                        if hmac.compare_digest(token_hash, device["hash"]) and device["expires"] < time.time() + PAIRING_LIFETIME_SECONDS - 86400:
                            device["expires"] = int(time.time()) + PAIRING_LIFETIME_SECONDS
                            try:
                                save_paired_devices(devices)
                            except OSError:
                                pass
                            break
        if path.startswith("/api/projects/") and path.endswith("/thumbnail"):
            self.send_header("Cache-Control", "private, max-age=31536000, immutable")
        elif path.startswith("/api/") or is_admin_path(self.path):
            self.send_header("Cache-Control", "no-store")
        else:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_OPTIONS(self):
        if not self.check_request_origin():
            return
        self.send_response(204)
        self.end_headers()

    def check_request_origin(self):
        host = self.headers.get("Host", "")
        allowed = self.server.allowed_hosts
        if host not in allowed:
            self.send_error(403, "Host not allowed")
            return False
        origin = self.headers.get("Origin")
        if origin and origin != f"{self.server.scheme}://{host}":
            self.send_error(403, "Origin not allowed")
            return False
        return True

    def paired(self):
        if not self.server.pairing_code:
            return True
        cookie = SimpleCookie()
        try:
            cookie.load(self.headers.get("Cookie", ""))
        except Exception:
            return False
        value = cookie.get("qpixel_pair")
        if not value or len(value.value) > 128:
            return False
        token_hash = paired_device_hash(value.value)
        with PAIRING_LOCK:
            return any(hmac.compare_digest(token_hash, device["hash"])
                       for device in read_paired_devices())

    def gate(self):
        if is_admin_path(self.path):
            if not admin_allowed(self):
                self.send_error(403, "Management is available on this computer only")
                return False
            if self.command not in ("GET",):
                self.send_error(405, "Read-only management")
                return False
        if not self.check_request_origin():
            return False
        if not self.server.pairing_code or self.paired():
            return True
        if urlparse(self.path).path == "/pair" and self.command in ("GET", "POST"):
            return True
        if urlparse(self.path).path.startswith("/api/"):
            self.send_json({"error": "请先在平板上输入配对码。"}, status=401)
        else:
            self.send_response(303)
            self.send_header("Location", "/pair")
            self.end_headers()
        return False

    def pair_page(self, error=False):
        message = "配对码不正确，请重试。" if error else "首次连接请输入电脑终端显示的配对码。此浏览器将在一年内自动连接，使用时自动续期。"
        body = ("<!doctype html><html lang='zh-CN'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
                "<title>Q像素平板配对</title><style>body{font:16px -apple-system,sans-serif;max-width:420px;margin:12vh auto;padding:24px;color:#173e38}"
                "input,button{box-sizing:border-box;width:100%;min-height:48px;margin-top:12px;padding:10px;font-size:17px}button{background:#176d61;color:white;border:0;border-radius:8px}</style>"
                f"<h1>Q像素平板配对</h1><p>{message}</p><form method='post' action='/pair'><input name='code' type='password' required autocomplete='one-time-code' aria-label='配对码'><button>连接创作空间</button></form></html>").encode("utf-8")
        self.send_response(403 if error else 200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def pair_request(self):
        length = self.request_length(4096)
        if length is None:
            return
        if length < 1 or length > 4096:
            self.send_error(413, "Invalid pairing request")
            return
        code = parse_qs(self.rfile.read(length).decode("utf-8", "replace")).get("code", [""])[0]
        if not hmac.compare_digest(code, self.server.pairing_code):
            self.pair_page(error=True)
            return
        token = secrets.token_urlsafe(32)
        with PAIRING_LOCK:
            try:
                devices = read_paired_devices()
                devices.append({"hash": paired_device_hash(token),
                                "expires": int(time.time()) + PAIRING_LIFETIME_SECONDS})
                save_paired_devices(devices)
            except OSError:
                self.send_json({"error": "无法保存平板配对信息，请检查电脑存储权限。"}, status=503)
                return
        self.send_response(303)
        self.send_header("Location", "/index.html")
        self.send_header("Set-Cookie", f"qpixel_pair={token}; Max-Age={PAIRING_LIFETIME_SECONDS}; HttpOnly; Secure; SameSite=Strict; Path=/")
        self.end_headers()

    def proxy_request(self):
        length = self.request_length(100 * 1024 * 1024)
        if length is None:
            return
        body = self.rfile.read(length) if length else None
        connection = http.client.HTTPConnection("127.0.0.1", self.server.proxy_port, timeout=60)
        try:
            headers = {"Accept": "application/json"}
            if body is not None:
                headers["Content-Type"] = self.headers.get("Content-Type", "application/json")
            connection.request(self.command, self.path, body=body, headers=headers)
            response = connection.getresponse()
            payload = response.read()
            self.send_response(response.status)
            self.send_header("Content-Type", response.getheader("Content-Type", "application/json"))
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except (OSError, http.client.HTTPException):
            self.send_json({"error": "电脑创作空间暂时不可用。"}, status=503)
        finally:
            connection.close()

    def request_length(self, limit):
        try:
            length = int(self.headers.get("Content-Length") or "0")
        except ValueError:
            self.send_error(400, "Invalid Content-Length")
            return None
        if length < 0 or length > limit:
            self.send_error(413, "Request too large")
            return None
        return length

    def do_HEAD(self):
        if not self.gate(): return
        if is_admin_path(self.path):
            self.send_error(405); return
        super().do_HEAD()

    def do_GET(self):
        if not self.gate():
            return
        if handle_admin_get(self, ROOT, DATA_DIR, BACKUP_DIR):
            return
        path = urlparse(self.path).path
        if path == "/pair" and self.server.pairing_code:
            self.pair_page()
            return
        if path.startswith("/api/") and self.server.proxy_port:
            self.proxy_request()
            return
        if path == "/api/ai/status":
            self.send_json({"providers": get_provider_status()})
            return
        if path == "/api/ai/latest-download":
            self.send_json(find_latest_download_image(parse_query(self.path).get("since", ["0"])[0]) or {"found": False})
            return
        if path == "/api/release":
            self.send_json(release_payload())
            return
        if path == "/api/health":
            with WRITE_LOCK:
                index = read_project_index()
            self.send_json(health_payload(index, self.read_settings()))
            return
        if path == "/api/projects/index":
            with WRITE_LOCK:
                index = read_project_index()
            self.send_json(index)
            return
        if path == "/api/projects":
            self.send_json(self.read_projects())
            return
        thumbnail_id = get_thumbnail_id_from_path(path)
        if thumbnail_id:
            try:
                project = self.read_project(thumbnail_id)
            except OSError:
                self.send_json({"error": "作品文件无法读取"}, status=503)
                return
            thumbnail = project.get("thumbnail", "") if project else ""
            try:
                header, encoded = thumbnail.split(",", 1)
                media_type = header.removeprefix("data:").split(";", 1)[0]
                if media_type not in {"image/png", "image/jpeg", "image/webp"} or ";base64" not in header:
                    raise ValueError("Invalid thumbnail")
                body = base64.b64decode(encoded, validate=True)
            except (ValueError, AttributeError, binascii.Error):
                self.send_error(404, "Thumbnail not found")
                return
            self.send_response(200)
            self.send_header("Content-Type", media_type)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        project_id = get_project_id_from_path(path)
        if project_id:
            try:
                project = self.read_project(project_id)
            except OSError:
                self.send_json({"error": "作品文件无法读取，请保留本机修改并检查电脑备份。"}, status=503)
                return
            if project and not project.get("purged"):
                self.send_json(public_project(project))
            else:
                self.send_error(404, "Project not found")
            return
        if path == "/api/settings":
            self.send_json(self.read_settings())
            return
        super().do_GET()

    def do_POST(self):
        if not self.gate():
            return
        path = urlparse(self.path).path
        if path == "/pair" and self.server.pairing_code:
            self.pair_request()
            return
        if path.startswith("/api/") and self.server.proxy_port:
            self.proxy_request()
            return
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
        length = self.request_length(50 * 1024 * 1024)
        if length is None:
            return
        self.rfile.read(length)
        self.send_json({"error": "请更新客户端，使用逐作品条件同步。"}, status=428)

    def do_DELETE(self):
        if not self.gate():
            return
        if urlparse(self.path).path.startswith("/api/") and self.server.proxy_port:
            self.proxy_request()
            return
        project_id = get_project_id_from_path(urlparse(self.path).path)
        if not project_id:
            self.send_error(404)
            return
        self.conditional_project_request(project_id, deleting=True)

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
        self.conditional_project_request(project_id)

    def conditional_project_request(self, project_id, deleting=False):
        length = self.request_length(50 * 1024 * 1024)
        if length is None:
            return
        try:
            envelope = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        except (ValueError, UnicodeDecodeError):
            self.send_json({"error": "Invalid JSON"}, status=400)
            return
        if not isinstance(envelope, dict) or "expectedRevision" not in envelope:
            self.send_json({"error": "客户端版本过旧，请先备份并更新。"}, status=428)
            return
        expected = envelope["expectedRevision"]
        mutation = envelope.get("mutationId")
        project = envelope.get("project")
        if (expected is not None and not isinstance(expected, str)) or not isinstance(mutation, str) or not 1 <= len(mutation) <= 200:
            self.send_json({"error": "Invalid write condition"}, status=400)
            return
        if not project_file_path(project_id) or (not deleting and (not isinstance(project, dict) or project.get("id") != project_id)):
            self.send_json({"error": "Project id mismatch"}, status=400)
            return
        # Server-owned fields cannot be supplied by a client.
        clean = {key: value for key, value in (project or {}).items()
                 if key not in {"serverRevision", "_lastMutation", "_lastDigest", "purged", "expectedRevision", "mutationId"}}
        digest = hashlib.sha256(json.dumps([deleting, expected, clean], sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
        try:
            with WRITE_LOCK:
                index = read_project_index()
                existing = self.read_project(project_id)
                revision = project_revision(existing)
                if existing and existing.get("_lastMutation") == mutation:
                    if existing.get("_lastDigest") != digest:
                        self.send_json({"error": "mutationId already used"}, status=409)
                        return
                    self.send_json({"ok": True, "accepted": True, "serverRevision": revision, "id": project_id, "replayed": True})
                    return
                if revision != expected:
                    self.send_json({"error": "电脑作品已变化，双方修改将保留。", "serverRevision": revision, "purged": bool(existing and existing.get("purged"))}, status=409)
                    return
                if existing and existing.get("purged"):
                    self.send_json({"error": "作品已永久删除，请另存为新作品。", "serverRevision": revision, "purged": True}, status=409)
                    return
                if deleting:
                    stored = {"id": project_id, "deleted": True, "purged": True}
                else:
                    stored = dict(clean)
                    # A metadata-only update preserves existing content, including history.
                    for key in ("payload", "thumbnail", "history"):
                        if key not in stored and existing and key in existing:
                            stored[key] = existing[key]
                stored.update(serverRevision=secrets.token_hex(16), _lastMutation=mutation, _lastDigest=digest)
                write_project_file(stored)
                update_project_index(index, stored, removed_id=project_id if deleting else None)
            self.send_json({"ok": True, "accepted": True, "id": project_id, "serverRevision": stored["serverRevision"]})
        except OSError:
            self.send_json({"error": "电脑写入失败，请保留本机修改并重试。"}, status=503)

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
        with WRITE_LOCK:
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            backup_settings_file()
            existing = self.read_settings()
            merged = merge_settings(existing, payload)
            tmp = SETTINGS_FILE.with_suffix(".tmp")
            tmp.write_text(json.dumps(merged, ensure_ascii=False), encoding="utf-8")
            os.replace(tmp, SETTINGS_FILE)
        self.send_json({"ok": True, "updatedAt": merged.get("updatedAt")})

    def read_projects(self):
        project_files = list_project_files()
        if project_files or PROJECT_INDEX_FILE.exists():
            return [public_project(p) for p in project_files if not p.get("purged")]
        if not PROJECTS_FILE.exists():
            return []
        try:
            data = json.loads(PROJECTS_FILE.read_text(encoding="utf-8"))
            return [public_project(p) for p in data if isinstance(p, dict) and not p.get("purged")] if isinstance(data, list) else []
        except Exception:
            return []

    def read_project(self, project_id):
        path = project_file_path(project_id)
        if not path or not path.exists():
            return None
        try:
            return normalize_project(json.loads(path.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError, UnicodeDecodeError) as error:
            raise OSError("Existing project file cannot be read") from error

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


def project_revision(project):
    if not project:
        return None
    return project.get("serverRevision") or "legacy-" + hashlib.sha256(
        json.dumps(project, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()


def public_project(project):
    return {**{key: value for key, value in project.items() if key not in {"_lastMutation", "_lastDigest"}},
            "serverRevision": project_revision(project)}


def project_sort_time(project):
    if not isinstance(project, dict):
        return ""
    return project.get("updatedAt") or project.get("savedAt") or project.get("createdAt") or ""


def normalize_project(project):
    return project if isinstance(project, dict) and project.get("id") else None


def project_file_path(project_id):
    safe_id = str(project_id or "").strip()
    if not safe_id or "/" in safe_id or "\\" in safe_id or safe_id in {".", ".."}:
        return None
    return PROJECTS_DIR / f"{safe_id}.json"


def list_project_paths():
    if not PROJECTS_DIR.exists():
        return []
    return [path for path in PROJECTS_DIR.glob("*.json") if path.is_file()]


def list_project_files():
    projects = []
    for path in list_project_paths():
        try:
            project = normalize_project(json.loads(path.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError, UnicodeDecodeError):
            project = None
        if project:
            projects.append(project)
    return sorted(projects, key=project_sort_time, reverse=True)


def project_file_signatures():
    signatures = []
    for path in list_project_paths():
        try:
            stat = path.stat()
            signatures.append([path.name, stat.st_size, stat.st_mtime_ns])
        except OSError:
            continue
    return sorted(signatures)


def persist_project_index(summaries, signatures):
    global PROJECT_INDEX_CACHE
    PROJECT_INDEX_CACHE = (signatures, summaries)
    path = None
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=DATA_DIR,
                                         prefix=".qpixel-project-index-", delete=False) as file:
            path = Path(file.name)
            json.dump({"version": 2, "signatures": signatures, "projects": summaries}, file, ensure_ascii=False)
        os.replace(path, PROJECT_INDEX_FILE)
    except OSError:
        # Project files remain authoritative when the optional index cannot be saved.
        pass
    finally:
        if path:
            path.unlink(missing_ok=True)


def rebuild_project_index():
    summaries = [summary for summary in (project_summary(project) for project in list_project_files()) if summary]
    persist_project_index(summaries, project_file_signatures())
    return summaries


def read_project_index():
    global PROJECT_INDEX_CACHE
    signatures = project_file_signatures()
    if PROJECT_INDEX_CACHE and PROJECT_INDEX_CACHE[0] == signatures:
        return PROJECT_INDEX_CACHE[1]
    try:
        saved = json.loads(PROJECT_INDEX_FILE.read_text(encoding="utf-8"))
        if saved.get("version") == 2 and saved.get("signatures") == signatures and isinstance(saved.get("projects"), list):
            PROJECT_INDEX_CACHE = (signatures, saved["projects"])
            return saved["projects"]
    except (OSError, ValueError, AttributeError):
        pass
    return rebuild_project_index()


def update_project_index(previous, project=None, removed_id=None):
    summaries = [item for item in previous if item.get("id") not in {removed_id, project.get("id") if project else None}]
    if project:
        summary = project_summary(project)
        if summary:
            summaries.append(summary)
    summaries.sort(key=project_sort_time, reverse=True)
    persist_project_index(summaries, project_file_signatures())


def write_project_file(project):
    project = normalize_project(project)
    path = project_file_path(project.get("id") if project else "")
    if not project or not path:
        return
    PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as file:
        json.dump(project, file, ensure_ascii=False)
        file.flush()
        os.fsync(file.fileno())
    os.replace(tmp, path)


def write_project_files(projects):
    for project in projects or []:
        write_project_file(project)


def directory_size(path):
    try:
        return sum(item.stat().st_size for item in list_project_paths())
    except OSError:
        return 0


def project_summary(project):
    project = normalize_project(project)
    if not project or project.get("purged"):
        return None
    payload = project.get("payload") if isinstance(project.get("payload"), dict) else {}
    pattern = payload.get("pattern") if isinstance(payload.get("pattern"), dict) else {}
    history = project.get("history") if isinstance(project.get("history"), list) else []
    summary = {key: value for key, value in public_project(project).items() if key not in {"payload", "history", "thumbnail"}}
    summary["hasPayload"] = bool(project.get("payload"))
    summary["hasThumbnail"] = bool(project.get("thumbnail"))
    summary["historyCount"] = len(history)
    summary["width"] = summary.get("width") or pattern.get("width") or 0
    summary["height"] = summary.get("height") or pattern.get("height") or 0
    return summary


def get_project_id_from_path(path):
    prefix = "/api/projects/"
    if not path.startswith(prefix):
        return ""
    project_id = unquote(path[len(prefix):].strip("/"))
    return project_id if project_id and "/" not in project_id else ""


def get_thumbnail_id_from_path(path):
    suffix = "/thumbnail"
    if not path.endswith(suffix):
        return ""
    return get_project_id_from_path(path[:-len(suffix)])


def parse_query(path):
    from urllib.parse import parse_qs
    return parse_qs(urlparse(path).query)


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


def release_payload():
    result = {}
    try:
        data = json.loads((ROOT / "release-info.json").read_text(encoding="utf-8"))
        result = {key: data[key] for key in ("version", "build", "gitCommit", "builtAt") if key in data}
    except (OSError, ValueError, TypeError):
        pass
    try:
        match = re.search(r'<meta name="qpixel-revision" content="([a-zA-Z0-9-]+)"', (ROOT / "index.html").read_text(encoding="utf-8"))
        if match:
            result["interfaceRevision"] = match.group(1)
    except OSError:
        pass
    return result


def health_payload(projects, settings):
    projects_ok = isinstance(projects, list)
    settings_ok = isinstance(settings, dict)
    return {
        "ok": projects_ok and settings_ok,
        "syncProtocolVersion": SYNC_PROTOCOL_VERSION,
        "projectsOk": projects_ok,
        "settingsOk": settings_ok,
        "projectCount": len(projects) if projects_ok else 0,
        "projectFileCount": len(list_project_paths()),
        "projectDirectorySize": directory_size(PROJECTS_DIR),
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
        if project.get("deleted") and project.get("deletedAt"):
            try:
                if datetime.fromisoformat(str(project["deletedAt"]).replace("Z", "+00:00")).replace(tzinfo=None) < datetime.now() - timedelta(days=90):
                    continue
            except ValueError:
                pass
        current = merged.get(project["id"])
        if current is None or project_sort_time(project) >= project_sort_time(current):
            if current and any(not project.get(key) and current.get(key) for key in ("payload", "thumbnail", "history")):
                project = dict(project)
                for key in ("payload", "thumbnail", "history"):
                    if not project.get(key) and current.get(key):
                        project[key] = current[key]
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


def migrate_projects_if_needed():
    if list_project_paths() or PROJECT_INDEX_FILE.exists() or not PROJECTS_FILE.exists():
        return
    try:
        data = json.loads(PROJECTS_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, UnicodeDecodeError):
        return
    if isinstance(data, list):
        write_project_files(data)


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
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--cert-host", default=os.environ.get("QPIXEL_IP", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=8766)
    parser.add_argument("--proxy-port", type=int, default=0, help="配对服务转发到本机服务端口。")
    parser.add_argument("--http", action="store_true", help="使用普通 HTTP，保留创作空间同步接口。")
    parser.add_argument("--forget-devices", action="store_true", help="清除所有已记住的平板，然后退出。")
    args = parser.parse_args()
    if args.forget_devices:
        forget_paired_devices()
        print("已清除所有已记住的平板。下次访问需重新输入配对码。")
        return
    pairing_code = os.environ.get("QPIXEL_PAIRING_CODE", "").strip()
    try:
        loopback = ipaddress.ip_address(args.host).is_loopback
    except ValueError:
        loopback = args.host == "localhost"
    if not loopback and not pairing_code:
        parser.error("非本机地址必须通过 run_ipad_server.sh 启用配对。")
    if pairing_code and (args.http or not args.proxy_port):
        parser.error("配对服务必须使用 HTTPS，并转发到本机服务。")
    authority_lock = None
    if not args.proxy_port:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        authority_lock = (DATA_DIR / ".authority.lock").open("a")
        try:
            fcntl.flock(authority_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            parser.error("同一作品目录已有写服务运行；请停止旧服务后重试。")
        cleanup_backups()
        migrate_projects_if_needed()
    server = ThreadingHTTPServer((args.host, args.port), QPixelHttpsHandler)
    server.scheme = "http" if args.http else "https"
    server.allowed_hosts = {f"{args.cert_host}:{args.port}"} if pairing_code else {f"127.0.0.1:{args.port}", f"localhost:{args.port}"}
    server.pairing_code = pairing_code
    server.proxy_port = args.proxy_port
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
