#!/usr/bin/env python3
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
DATA_DIR = Path.home() / "Documents" / "Q像素"
PROJECTS_FILE = DATA_DIR / "qpixel-projects.json"


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
        if urlparse(self.path).path == "/api/projects":
            self.send_json(self.read_projects())
            return
        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/projects":
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


def main():
    server = ThreadingHTTPServer(("0.0.0.0", 8765), QPixelHandler)
    print("Q像素同步服务：http://0.0.0.0:8765")
    server.serve_forever()


if __name__ == "__main__":
    main()
