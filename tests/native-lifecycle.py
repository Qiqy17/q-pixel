#!/usr/bin/env python3
"""Compile the real Mac app with temporary QA instrumentation and isolated storage.

No production service, user files, credentials, or app identity are used.
This exercises native WebKit persistence/termination, not manual file panels.
"""
import functools
import http.server
import json
import os
from pathlib import Path
import plistlib
import subprocess
import sys
import tempfile
import threading
import time
import uuid

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = r"""
(async () => {
  const checks = [], check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  for (let i=0; i<200 && !window.QPixelTest?.getOfflineStoreForTest(); i++) await new Promise(r=>setTimeout(r,50));
  const t=QPixelTest, phase=__PHASE__;
  const settle=()=>new Promise(r=>setTimeout(r,350));
  if (phase==='seed') {
    await t.activateSyntheticBeadPattern(18,18);
    const p=t.makeProjectPayload(); p.id='native-qa'; p.title='隔离原生保存验收';
    p.pattern.cells[0][0]='H2'; p.layers[0].cells[0][0]='H2'; p.buildProgress={'0:0':true};
    check(t.applyProjectPayload(p),'load editable native pattern'); t.markUnsavedChangesForTest();
    check(QPixelHasUnsavedChanges(),'native exit hook sees dirty state');
    check(await t.saveCurrentProject(),'native local save succeeds');
    check(!QPixelHasUnsavedChanges(),'saved native app permits termination');
    check((await t.getOfflineStoreForTest().pending()).length===1,'save queues work without automatic upload');
  } else if (phase==='reopen') {
    await t.loadProject('native-qa'); const p=t.makeProjectPayload();
    check(p.pattern.cells[0][0]==='H2' && p.layers[0].cells[0][0]==='H2','process reopen preserves cells and layers');
    check(p.buildProgress['0:0']===true,'process reopen preserves progress');
    t.markUnsavedChangesForTest(); check(await t.persistRecoveryDraftForTest(),'recovery draft durably committed');
    await t.saveCurrentProject(); await settle();
    // Keep a stale recovery banner while another unsaved design is being edited.
    t.markUnsavedChangesForTest(); await t.persistRecoveryDraftForTest();
    await t.activateSyntheticBeadPattern(20,20); t.markUnsavedChangesForTest();
    await t.offerDraftRecoveryForTest();
    const banner=document.getElementById('studioRecoveryBanner'); check(banner,'recovery banner available');
    const originalConfirm=window.confirm; window.confirm=()=>false;
    banner.querySelector('button').click(); await settle(); window.confirm=originalConfirm;
    check(t.makeProjectPayload().pattern.width===20 && banner.isConnected,'cancel recovery protects current unsaved design');
    check(await t.saveCurrentProject(),'save current design before termination');
  } else if (phase==='crash') {
    await t.loadProject('native-qa'); const p=t.makeProjectPayload();
    p.pattern.cells[0][0]='H7'; p.layers[0].cells[0][0]='H7';
    t.applyProjectPayload(p); t.markUnsavedChangesForTest();
    check(await t.persistRecoveryDraftForTest(),'unsaved draft committed before forced process termination');
  } else {
    await t.offerDraftRecoveryForTest(); await settle();
    const banner=document.getElementById('studioRecoveryBanner'); check(banner,'forced termination offers persisted draft');
    banner.querySelector('button').click(); await settle();
    check(t.makeProjectPayload().pattern.cells[0][0]==='H7','recover committed unsaved cells');
    check(QPixelHasUnsavedChanges(),'recovery remains unsaved until explicit save');
    check(await t.saveCurrentProject(),'recovered design can be saved');
  }
  await settle();
  window.webkit.messageHandlers.qaFinished.postMessage({phase,checks});
})().catch(error=>window.webkit.messageHandlers.qaFinished.postMessage({error:String(error)})); null;
"""

def run(output):
    if sys.platform != 'darwin':
        raise RuntimeError('Native lifecycle QA requires macOS')
    output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='qpixel-native-qa-') as temporary:
        temp=Path(temporary)
        class QuietHandler(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *args):
                pass
        server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT/'web')))
        threading.Thread(target=server.serve_forever,daemon=True).start()
        port=server.server_address[1]
        source=(ROOT/'macos/QPixel.swift').read_text()
        source=source.replace('http://127.0.0.1:8766/index.html',f'http://127.0.0.1:{port}/index.html')
        source=source.replace('configuration.preferences.javaScriptCanOpenWindowsAutomatically = true','configuration.preferences.javaScriptCanOpenWindowsAutomatically = true\n        configuration.userContentController.add(self, name: "qaFinished")')
        source=source.replace('        if message.name == "openAdmin" {','''        if message.name == "qaFinished" {
            let data = try! JSONSerialization.data(withJSONObject: message.body, options: [.prettyPrinted, .sortedKeys])
            try! data.write(to: URL(fileURLWithPath: ProcessInfo.processInfo.environment["QPIXEL_QA_RESULT"]!))
            if ProcessInfo.processInfo.environment["QPIXEL_QA_PHASE"] != "crash" {
                NSApp.terminate(nil)
            }
            return
        }
        if message.name == "openAdmin" {''')
        js=SCRIPT.replace('__PHASE__',"JSON.parse('"+'"'+"PLACEHOLDER"+'"'+"')")
        hook='''
    private var qaStarted = false
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard !qaStarted else { return }; qaStarted = true
        let phase = ProcessInfo.processInfo.environment["QPIXEL_QA_PHASE"]!
        let script = #"""
JS_BODY
"""#.replacingOccurrences(of: "PLACEHOLDER", with: phase)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { webView.evaluateJavaScript(script, completionHandler: nil) }
    }
'''.replace('JS_BODY',js)
        source=source.replace('    private func loadInterface() {',hook+'\n    private func loadInterface() {')
        swift=temp/'QPixelQA.swift'; swift.write_text(source)
        bundle=temp/'QPixelQA.app'; executable=bundle/'Contents/MacOS/QPixelQA'; executable.parent.mkdir(parents=True)
        identity='local.qpixel.lifecycleqa.'+uuid.uuid4().hex
        (bundle/'Contents/Info.plist').write_bytes(plistlib.dumps({'CFBundleIdentifier':identity,'CFBundleExecutable':'QPixelQA','CFBundleName':'Q像素隔离验收','CFBundlePackageType':'APPL','NSAppTransportSecurity':{'NSAllowsArbitraryLoads':True}}))
        subprocess.run(['swiftc',str(swift),str(ROOT/'macos/SmartBoardController.swift'),str(ROOT/'macos/SmartBoardProtocol.swift'),'-o',str(executable),'-framework','AppKit','-framework','WebKit','-framework','CoreBluetooth'],check=True)
        subprocess.run(['codesign','--force','--sign','-',str(bundle)],check=True,capture_output=True)
        results=[]
        try:
            for phase in ['seed','reopen','crash','recover']:
                result=temp/f'{phase}.json'
                env=dict(os.environ,QPIXEL_QA_PHASE=phase,QPIXEL_QA_RESULT=str(result))
                with (temp/f'{phase}.log').open('w') as log:
                    process=subprocess.Popen([str(executable)],env=env,stdout=log,stderr=log)
                    deadline=time.monotonic()+60
                    try:
                        while not result.exists() and time.monotonic()<deadline and process.poll() is None:
                            time.sleep(.1)
                        if not result.exists(): raise RuntimeError(f'{phase}: missing result; '+(temp/f'{phase}.log').read_text()[-1500:])
                        data=json.loads(result.read_text())
                        if 'error' in data: raise RuntimeError(f'{phase}: {data}')
                        if phase=='crash': process.kill()
                        process.wait(timeout=15)
                        if phase!='crash' and process.returncode!=0: raise RuntimeError(f'{phase}: native termination failed')
                        results.append(data)
                        print(f'{phase}: {len(data["checks"])} checks passed',flush=True)
                    finally:
                        if process.poll() is None: process.kill(); process.wait()
            (output/'native-lifecycle-results.json').write_text(json.dumps({'scope':'real AppDelegate with isolated identity and static QA origin; file panels and physical devices not tested','results':results},ensure_ascii=False,indent=2)+'\n')
        finally:
            server.shutdown()

if __name__ == '__main__':
    run(Path(sys.argv[1]).resolve())
