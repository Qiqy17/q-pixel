import http.client
import base64
import json
import os
import ssl
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from urllib.parse import urlencode


ROOT = Path(__file__).resolve().parent.parent
SERVER = ROOT / "scripts" / "qpixel_ipad_https_server.py"


def free_port():
    import socket
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


class LocalServerSecurityTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="qpixel-security-")
        self.local_port = free_port()
        self.paired_port = free_port()
        env = {**os.environ, "QPIXEL_DATA_DIR": self.temp.name}
        self.local = subprocess.Popen(
            [sys.executable, str(SERVER), "--http", "--host", "127.0.0.1", "--port", str(self.local_port)],
            env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        self.wait_ready(self.local_port, secure=False)
        self.pairing_code = "test-code-only"
        self.paired = subprocess.Popen(
            [sys.executable, str(SERVER), "--host", "127.0.0.1", "--cert-host", "127.0.0.1",
             "--port", str(self.paired_port), "--proxy-port", str(self.local_port)],
            env={**env, "QPIXEL_PAIRING_CODE": self.pairing_code},
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        self.wait_ready(self.paired_port, secure=True)

    def tearDown(self):
        for process in (getattr(self, "paired", None), getattr(self, "local", None)):
            if process:
                process.terminate()
                try:
                    process.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=3)
        self.temp.cleanup()

    def request(self, secure, port, method, path, body=None, headers=None):
        connection = (http.client.HTTPSConnection(
            "127.0.0.1", port, context=ssl._create_unverified_context(), timeout=2,
        ) if secure else http.client.HTTPConnection("127.0.0.1", port, timeout=2))
        try:
            connection.request(method, path, body=body, headers=headers or {})
            response = connection.getresponse()
            return response.status, dict(response.getheaders()), response.read()
        finally:
            connection.close()

    def wait_ready(self, port, secure):
        for _ in range(100):
            try:
                status, _, _ = self.request(secure, port, "GET", "/pair" if secure else "/api/health")
                if status == 200:
                    return
            except (OSError, ssl.SSLError):
                pass
            time.sleep(0.1)
        self.fail(f"server did not start: {port}")

    def test_pairing_protects_shared_api_and_proxies_one_store(self):
        status, headers, _ = self.request(True, self.paired_port, "GET", "/api/projects")
        self.assertEqual(status, 401)
        self.assertNotIn("Access-Control-Allow-Origin", headers)
        status, _, _ = self.request(True, self.paired_port, "POST", "/pair", urlencode({"code": "wrong"}),
                                    {"Content-Type": "application/x-www-form-urlencoded"})
        self.assertEqual(status, 403)
        status, headers, _ = self.request(True, self.paired_port, "POST", "/pair",
                                          urlencode({"code": self.pairing_code}),
                                          {"Content-Type": "application/x-www-form-urlencoded"})
        self.assertEqual(status, 303)
        cookie = headers["Set-Cookie"].split(";", 1)[0]
        self.assertIn("Max-Age=31536000", headers["Set-Cookie"])
        self.assertIn("HttpOnly; Secure; SameSite=Strict", headers["Set-Cookie"])
        status, renewed_headers, _ = self.request(True, self.paired_port, "GET", "/api/projects",
                                                  headers={"Cookie": cookie})
        self.assertEqual(status, 200)
        self.assertIn("Max-Age=31536000", renewed_headers["Set-Cookie"])
        project = {"id": "security-test", "name": "security-test", "updatedAt": "2026-09-25T00:00:00"}
        status, _, _ = self.request(True, self.paired_port, "POST", "/api/projects/security-test",
                                    json.dumps(project), {"Cookie": cookie, "Content-Type": "application/json"})
        self.assertEqual(status, 200)
        status, _, body = self.request(False, self.local_port, "GET", "/api/projects/security-test")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["name"], "security-test")
        status, _, _ = self.request(True, self.paired_port, "GET", "/api/projects",
                                    headers={"Cookie": cookie, "Origin": "https://other.example"})
        self.assertEqual(status, 403)
        status, _, _ = self.request(True, self.paired_port, "GET", "/api/projects",
                                    headers={"Cookie": cookie, "Host": "other.example"})
        self.assertEqual(status, 403)
        status, _, _ = self.request(True, self.paired_port, "POST", "/api/projects", "[]",
                                    {"Cookie": cookie, "Content-Length": "bad"})
        self.assertEqual(status, 400)

    def test_paired_browser_survives_restart_and_can_be_revoked(self):
        status, headers, _ = self.request(True, self.paired_port, "POST", "/pair",
                                          urlencode({"code": self.pairing_code}),
                                          {"Content-Type": "application/x-www-form-urlencoded"})
        self.assertEqual(status, 303)
        cookie = headers["Set-Cookie"].split(";", 1)[0]
        self.paired.terminate()
        self.paired.wait(timeout=3)
        self.paired = subprocess.Popen(
            [sys.executable, str(SERVER), "--host", "127.0.0.1", "--cert-host", "127.0.0.1",
             "--port", str(self.paired_port), "--proxy-port", str(self.local_port)],
            env={**os.environ, "QPIXEL_DATA_DIR": self.temp.name,
                 "QPIXEL_PAIRING_CODE": "new-code-after-restart"},
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        self.wait_ready(self.paired_port, secure=True)
        status, _, _ = self.request(True, self.paired_port, "GET", "/api/projects",
                                    headers={"Cookie": cookie})
        self.assertEqual(status, 200)
        subprocess.run([sys.executable, str(SERVER), "--forget-devices"], check=True,
                       env={**os.environ, "QPIXEL_DATA_DIR": self.temp.name},
                       stdout=subprocess.DEVNULL)
        status, _, _ = self.request(True, self.paired_port, "GET", "/api/projects",
                                    headers={"Cookie": cookie})
        self.assertEqual(status, 401)

    def test_expired_device_requires_pairing_again(self):
        status, headers, _ = self.request(True, self.paired_port, "POST", "/pair",
                                          urlencode({"code": self.pairing_code}),
                                          {"Content-Type": "application/x-www-form-urlencoded"})
        self.assertEqual(status, 303)
        cookie = headers["Set-Cookie"].split(";", 1)[0]
        devices_file = Path(self.temp.name) / "ipad-paired-devices.json"
        self.assertEqual(devices_file.stat().st_mode & 0o777, 0o600)
        data = json.loads(devices_file.read_text(encoding="utf-8"))
        data["devices"][0]["expires"] = int(time.time()) - 1
        devices_file.write_text(json.dumps(data), encoding="utf-8")
        status, _, _ = self.request(True, self.paired_port, "GET", "/api/projects",
                                    headers={"Cookie": cookie})
        self.assertEqual(status, 401)

    def test_older_save_cannot_replace_newer_project_file(self):
        project_id = "save-order-test"
        newest = {"id": project_id, "updatedAt": "2026-09-28T00:02:00Z", "payload": {"value": "new"}}
        older = {"id": project_id, "updatedAt": "2026-09-28T00:01:00Z", "payload": {"value": "old"}}
        for project, accepted in ((newest, True), (older, False)):
            status, _, body = self.request(False, self.local_port, "POST", f"/api/projects/{project_id}",
                                           json.dumps(project), {"Content-Type": "application/json"})
            self.assertEqual(status, 200)
            self.assertEqual(json.loads(body)["accepted"], accepted)
        status, _, body = self.request(False, self.local_port, "GET", f"/api/projects/{project_id}")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["payload"], newest["payload"])

    def test_project_index_and_thumbnails_update_without_rewriting_other_projects(self):
        thumbnail = b"\x89PNG\r\n\x1a\nthumbnail"
        first = {"id": "first", "updatedAt": "2026-09-28T00:00:00Z", "payload": {"value": 1},
                 "thumbnail": "data:image/png;base64," + base64.b64encode(thumbnail).decode("ascii")}
        second = {"id": "second", "updatedAt": "2026-09-28T00:00:00Z", "payload": {"value": 2}}
        for project in (first, second):
            status, _, _ = self.request(False, self.local_port, "POST", f"/api/projects/{project['id']}",
                                        json.dumps(project), {"Content-Type": "application/json"})
            self.assertEqual(status, 200)
        second_path = Path(self.temp.name) / "projects" / "second.json"
        original_mtime = second_path.stat().st_mtime_ns
        first["updatedAt"] = "2026-09-28T00:01:00Z"
        status, _, _ = self.request(False, self.local_port, "POST", "/api/projects/first",
                                    json.dumps(first), {"Content-Type": "application/json"})
        self.assertEqual(status, 200)
        self.assertEqual(second_path.stat().st_mtime_ns, original_mtime)
        status, _, body = self.request(False, self.local_port, "GET", "/api/projects/index")
        self.assertEqual(status, 200)
        index = json.loads(body)
        self.assertEqual([item["id"] for item in index], ["first", "second"])
        self.assertTrue(index[0]["hasThumbnail"])
        self.assertNotIn("thumbnail", index[0])
        self.assertNotIn("payload", index[0])
        status, headers, body = self.request(False, self.local_port, "GET", "/api/projects/first/thumbnail")
        self.assertEqual(status, 200)
        self.assertEqual(headers["Content-Type"], "image/png")
        self.assertEqual(body, thumbnail)
        metadata_only = {"id": "first", "title": "Moved", "updatedAt": "2026-09-28T00:02:00Z"}
        status, _, body = self.request(False, self.local_port, "POST", "/api/projects/first",
                                       json.dumps(metadata_only), {"Content-Type": "application/json"})
        self.assertEqual(status, 200)
        self.assertTrue(json.loads(body)["accepted"])
        status, _, body = self.request(False, self.local_port, "GET", "/api/projects/first")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["payload"], first["payload"])
        self.assertEqual(json.loads(body)["thumbnail"], first["thumbnail"])
        self.assertTrue((Path(self.temp.name) / "qpixel-project-index-v1.json").exists())
        (Path(self.temp.name) / "qpixel-projects.json").write_text(json.dumps([first, second]), encoding="utf-8")
        for project_id in ("first", "second"):
            status, _, _ = self.request(False, self.local_port, "DELETE", f"/api/projects/{project_id}")
            self.assertEqual(status, 200)
        status, _, body = self.request(False, self.local_port, "GET", "/api/projects")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body), [])


if __name__ == "__main__":
    unittest.main()
