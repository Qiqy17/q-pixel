#!/usr/bin/env python3
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
DATA_DIR = Path.home() / "Documents" / "Q像素"
PROJECTS_FILE = DATA_DIR / "qpixel-projects.json"
SETTINGS_FILE = DATA_DIR / "qpixel-settings.json"
BACKUP_DIR = DATA_DIR / "backups"


class QPixelHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/health":
            self.send_json(health_payload(self.read_projects()))
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
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
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
        tmp = PROJECTS_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload[:200], ensure_ascii=False), encoding="utf-8")
        os.replace(tmp, PROJECTS_FILE)
        self.send_json({"ok": True, "count": len(payload[:200])})

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
        projects = merge_projects(self.read_projects(), [payload])
        tmp = PROJECTS_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(projects[:200], ensure_ascii=False), encoding="utf-8")
        os.replace(tmp, PROJECTS_FILE)
        self.send_json({"ok": True, "id": project_id, "count": len(projects[:200])})

    def read_projects(self):
        if not PROJECTS_FILE.exists():
            return []
        try:
            data = json.loads(PROJECTS_FILE.read_text(encoding="utf-8"))
            return data if isinstance(data, list) else []
        except Exception:
            return []

    def send_json(self, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


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


def health_payload(projects):
    projects_ok = isinstance(projects, list)
    return {
        "ok": projects_ok,
        "projectsOk": projects_ok,
        "settingsOk": True,
        "projectCount": len(projects) if projects_ok else 0,
        "projectsFileExists": PROJECTS_FILE.exists(),
        "projectsFileSize": file_size(PROJECTS_FILE),
        "settingsFileExists": SETTINGS_FILE.exists(),
        "settingsFileSize": file_size(SETTINGS_FILE),
        "backupCount": len(list(BACKUP_DIR.glob("*.json"))) if BACKUP_DIR.exists() else 0,
        "dataDir": str(DATA_DIR),
        "updatedAt": datetime_now_iso(),
    }


def datetime_now_iso():
    from datetime import datetime
    return datetime.now().isoformat()


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


def main():
    server = ThreadingHTTPServer(("0.0.0.0", 8765), QPixelHandler)
    print("Q像素同步服务：http://0.0.0.0:8765")
    server.serve_forever()


if __name__ == "__main__":
    main()
