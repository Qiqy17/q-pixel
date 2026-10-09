import importlib.util, json, tempfile, unittest
from pathlib import Path
from types import SimpleNamespace
spec = importlib.util.spec_from_file_location('admin', Path(__file__).resolve().parents[1] / 'scripts/qpixel_admin.py')
admin = importlib.util.module_from_spec(spec); spec.loader.exec_module(admin)
class AdminTest(unittest.TestCase):
    def test_access(self):
        server = SimpleNamespace(proxy_port=0, pairing_code='')
        self.assertTrue(admin.admin_allowed(SimpleNamespace(client_address=('127.0.0.1',1),server=server)))
        self.assertFalse(admin.admin_allowed(SimpleNamespace(client_address=('192.168.1.2',1),server=server)))
        server.proxy_port=8766
        self.assertFalse(admin.admin_allowed(SimpleNamespace(client_address=('127.0.0.1',1),server=server)))
        self.assertTrue(admin.is_admin_path('/x/../%61dmin.js'))
        self.assertTrue(admin.is_admin_path('/%61pi/admin/dashboard'))
    def test_readonly_and_whitelist(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp); (root/'projects').mkdir(); (root/'backups').mkdir()
            (root/'projects/a.json').write_text(json.dumps({'id':'a','title':'新作品','payload':{'secret':'private-body'},'apiKey':'secret-key','deleted':True}))
            (root/'qpixel-project-index-v1.json').write_text(json.dumps({'signatures':[],'projects':[{'id':'old'}]}))
            before={p:p.read_bytes() for p in root.rglob('*') if p.is_file()}
            result=admin.dashboard(root,root,root/'backups')
            self.assertEqual(result['projects'][0]['id'],'a')
            self.assertTrue(result['projects'][0]['deleted'])
            text=json.dumps(result)
            self.assertNotIn('private-body',text); self.assertNotIn('secret-key',text)
            self.assertEqual(before,{p:p.read_bytes() for p in root.rglob('*') if p.is_file()})
            self.assertIsNone(admin.backup_path(root/'backups','../../passwd'))
if __name__=='__main__': unittest.main()
