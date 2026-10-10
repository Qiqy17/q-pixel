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

    def request(self, secure, port, method, path, body=None, headers=None, conditional=True):
        if conditional and path.startswith("/api/projects/") and method in {"POST", "DELETE"}:
            status, _, current = self.request(secure, port, "GET", path, headers=headers, conditional=False)
            revision = json.loads(current).get("serverRevision") if status == 200 else None
            import uuid
            body = json.dumps({"project": json.loads(body) if body else None, "expectedRevision": revision, "mutationId": str(uuid.uuid4())})
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

    def test_admin_is_local_readonly_and_not_proxied(self):
        fixture = Path(self.temp.name) / "backups"
        fixture.mkdir(exist_ok=True)
        backup = fixture / "qpixel-projects-20261009-120000.json"
        backup.write_text('[{"id":"qa","name":"测试备份"}]')
        (fixture / "qpixel-projects-20261009-120001.json").symlink_to(backup)
        before = {str(p): p.read_bytes() for p in Path(self.temp.name).rglob('*') if p.is_file()}
        for path in ("/admin", "/admin.html", "/admin.js", "/api/admin/dashboard", "/%61dmin.html", "/x/../admin.js"):
            status, headers, _ = self.request(False, self.local_port, "GET", path)
            self.assertEqual(status, 200, path)
            self.assertEqual(headers['Cache-Control'], 'no-store')
            status, _, _ = self.request(True, self.paired_port, "GET", path)
            self.assertEqual(status, 403, path)
        _, headers, _ = self.request(True, self.paired_port, "POST", "/pair", urlencode({"code": self.pairing_code}), {"Content-Type": "application/x-www-form-urlencoded"})
        cookie = headers['Set-Cookie'].split(';', 1)[0]
        status, _, _ = self.request(True, self.paired_port, "GET", "/api/admin/dashboard", headers={"Cookie": cookie})
        self.assertEqual(status, 403)
        for method in ('POST', 'DELETE', 'HEAD'):
            status, _, _ = self.request(False, self.local_port, method, '/api/admin/dashboard')
            self.assertEqual(status, 405)
        for headers in ({'Host':'evil.example'}, {'Origin':'https://evil.example'}):
            status, _, _ = self.request(False, self.local_port, 'GET', '/admin', headers=headers)
            self.assertEqual(status, 403)
        status, _, body = self.request(False, self.local_port, 'GET', '/api/admin/backups/'+backup.name)
        self.assertEqual(status, 200); self.assertEqual(body, backup.read_bytes())
        status, _, _ = self.request(False, self.local_port, 'GET', '/api/admin/backups/qpixel-projects-20261009-120001.json')
        self.assertEqual(status, 404)
        after = {str(p): p.read_bytes() for p in Path(self.temp.name).rglob('*') if p.is_file()}
        # Pairing changes are expected; admin reads do not alter project or backup data.
        for name, content in before.items(): self.assertEqual(after[name], content)

    def test_release_endpoint_is_paired_and_same_revision(self):
        status, headers, body = self.request(False, self.local_port, "GET", "/api/release")
        self.assertEqual(status, 200)
        self.assertEqual(headers["Cache-Control"], "no-store")
        revision = json.loads(body)["interfaceRevision"]
        self.assertEqual(revision, "20261010-consumer-64")
        status, _, _ = self.request(True, self.paired_port, "GET", "/api/release")
        self.assertEqual(status, 401)
        _, headers, _ = self.request(True, self.paired_port, "POST", "/pair", urlencode({"code": self.pairing_code}), {"Content-Type": "application/x-www-form-urlencoded"})
        cookie = headers["Set-Cookie"].split(";", 1)[0]
        status, _, body = self.request(True, self.paired_port, "GET", "/api/release", headers={"Cookie": cookie})
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["interfaceRevision"], revision)

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

    def test_stale_revision_cannot_replace_newer_project_file(self):
        project_id = "save-order-test"
        newest = {"id": project_id, "updatedAt": "1900-01-01", "payload": {"value": "new"}}
        status, _, result = self.request(False, self.local_port, "POST", f"/api/projects/{project_id}", json.dumps(newest))
        self.assertEqual(status, 200)
        revision = json.loads(result)["serverRevision"]
        stale = {"project": {**newest, "updatedAt": "2099-01-01", "payload": {"value": "old"}}, "expectedRevision": None, "mutationId": "stale"}
        status, _, _ = self.request(False, self.local_port, "POST", f"/api/projects/{project_id}", json.dumps(stale), conditional=False)
        self.assertEqual(status, 409)
        status, _, body = self.request(False, self.local_port, "GET", f"/api/projects/{project_id}")
        self.assertEqual(json.loads(body)["payload"], newest["payload"])
        self.assertEqual(json.loads(body)["serverRevision"], revision)

    def test_atomic_race_retry_delete_and_restart(self):
        import concurrent.futures
        project = {"id": "race", "payload": {"value": "base"}}
        status, _, body = self.request(False, self.local_port, "POST", "/api/projects/race", json.dumps(project))
        base = json.loads(body)["serverRevision"]
        envelopes = [{"project": {**project, "payload": {"value": value}}, "expectedRevision": base, "mutationId": value} for value in ("a", "b")]
        with concurrent.futures.ThreadPoolExecutor() as pool:
            results = list(pool.map(lambda envelope: self.request(False, self.local_port, "POST", "/api/projects/race", json.dumps(envelope), conditional=False), envelopes))
        self.assertEqual(sorted(result[0] for result in results), [200, 409])
        winner = next(i for i, result in enumerate(results) if result[0] == 200)
        revision = json.loads(results[winner][2])["serverRevision"]
        status, _, body = self.request(False, self.local_port, "POST", "/api/projects/race", json.dumps(envelopes[winner]), conditional=False)
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["serverRevision"], revision)
        deletion = {"expectedRevision": revision, "mutationId": "delete"}
        status, _, body = self.request(False, self.local_port, "DELETE", "/api/projects/race", json.dumps(deletion), conditional=False)
        self.assertEqual(status, 200)
        deleted_revision = json.loads(body)["serverRevision"]
        for method, envelope in (("DELETE", deletion), ("POST", {"project": project, "expectedRevision": None, "mutationId": "revive"})):
            status, _, _ = self.request(False, self.local_port, method, "/api/projects/race", json.dumps(envelope), conditional=False)
            self.assertEqual(status, 200 if method == "DELETE" else 409)
        self.local.terminate(); self.local.wait(timeout=3)
        self.local = subprocess.Popen([sys.executable, str(SERVER), "--http", "--port", str(self.local_port)], env={**os.environ, "QPIXEL_DATA_DIR": self.temp.name}, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.wait_ready(self.local_port, False)
        status, _, body = self.request(False, self.local_port, "DELETE", "/api/projects/race", json.dumps(deletion), conditional=False)
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["serverRevision"], deleted_revision)
        self.assertEqual(self.request(False, self.local_port, "GET", "/api/projects/race")[0], 404)
        self.assertNotIn("payload", json.loads((Path(self.temp.name) / "projects/race.json").read_text()))
        self.assertEqual(json.loads(self.request(False, self.local_port, "GET", "/api/projects/index")[2]), [])

    def test_unconditional_routes_and_second_authority_are_rejected(self):
        for method, path, body in (("POST", "/api/projects", "[]"), ("POST", "/api/projects/old", '{"id":"old"}'), ("DELETE", "/api/projects/old", None)):
            self.assertEqual(self.request(False, self.local_port, method, path, body, conditional=False)[0], 428)
        second = subprocess.run([sys.executable, str(SERVER), "--http", "--port", str(free_port())], env={**os.environ, "QPIXEL_DATA_DIR": self.temp.name}, capture_output=True, timeout=3)
        self.assertNotEqual(second.returncode, 0)

    def test_legacy_revision_and_failed_index_persistence(self):
        project = {"id": "legacy", "title": "旧作品", "payload": {"value": "kept"}}
        path = Path(self.temp.name) / "projects" / "legacy.json"
        path.parent.mkdir(exist_ok=True); path.write_text(json.dumps(project))
        status, _, body = self.request(False, self.local_port, "GET", "/api/projects/legacy")
        revision = json.loads(body)["serverRevision"]
        self.assertTrue(revision.startswith("legacy-"))
        index_path = Path(self.temp.name) / "qpixel-project-index-v1.json"
        if index_path.exists(): index_path.unlink()
        index_path.mkdir()
        envelope = {"project": {**project, "title": "新名称"}, "expectedRevision": revision, "mutationId": "legacy-update"}
        status, _, body = self.request(False, self.local_port, "POST", "/api/projects/legacy", json.dumps(envelope), conditional=False)
        self.assertEqual(status, 200)
        token = json.loads(body)["serverRevision"]
        self.assertFalse(token.startswith("legacy-"))
        self.assertEqual(json.loads(path.read_text())["payload"], project["payload"])
        self.assertEqual(json.loads(self.request(False, self.local_port, "GET", "/api/projects/legacy")[2])["serverRevision"], token)

    def test_delete_update_race_and_paired_conflict_status(self):
        import concurrent.futures
        project = {"id": "delete-race", "payload": {"value": "base"}}
        status, _, body = self.request(False, self.local_port, "POST", "/api/projects/delete-race", json.dumps(project))
        revision = json.loads(body)["serverRevision"]
        update = {"project": {**project, "payload": {"value": "changed"}}, "expectedRevision": revision, "mutationId": "update"}
        deletion = {"expectedRevision": revision, "mutationId": "delete"}
        with concurrent.futures.ThreadPoolExecutor() as pool:
            jobs = [pool.submit(self.request, False, self.local_port, method, "/api/projects/delete-race", json.dumps(envelope), None, False)
                    for method, envelope in (("POST", update), ("DELETE", deletion))]
            results = [job.result() for job in jobs]
        self.assertEqual(sorted(result[0] for result in results), [200, 409])
        status, _, body = self.request(False, self.local_port, "GET", "/api/projects/delete-race")
        self.assertEqual(status, 200 if results[0][0] == 200 else 404)
        _, headers, _ = self.request(True, self.paired_port, "POST", "/pair", urlencode({"code": self.pairing_code}), {"Content-Type": "application/x-www-form-urlencoded"})
        cookie = headers["Set-Cookie"].split(";", 1)[0]
        bad = {**update, "mutationId": "other", "expectedRevision": "stale"}
        self.assertEqual(self.request(True, self.paired_port, "POST", "/api/projects/delete-race", json.dumps(bad), {"Cookie": cookie}, conditional=False)[0], 409)
        health = json.loads(self.request(True, self.paired_port, "GET", "/api/health", headers={"Cookie": cookie})[2])
        self.assertEqual(health["syncProtocolVersion"], 2)

    def test_corrupt_existing_file_is_not_overwritten_as_a_new_project(self):
        path = Path(self.temp.name) / "projects" / "corrupt.json"
        path.parent.mkdir(exist_ok=True); path.write_text("broken-original")
        self.assertEqual(self.request(False, self.local_port, "GET", "/api/projects/corrupt")[0], 503)
        envelope = {"expectedRevision": None, "mutationId": "repair", "project": {"id": "corrupt", "payload": {"new": True}}}
        self.assertEqual(self.request(False, self.local_port, "POST", "/api/projects/corrupt", json.dumps(envelope), conditional=False)[0], 503)
        self.assertEqual(path.read_text(), "broken-original")

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
