import AppKit
import WebKit

// Isolated WKWebView: never opens the user's persistent App store or production service.
final class ReliabilityQA: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKScriptMessageHandler {
    var window: NSWindow!
    var webView: WKWebView!
    var running = false
    var failed = false
    let outputDirectory = CommandLine.arguments[1]
    func applicationDidFinishLaunching(_ notification: Notification) {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.userContentController.add(self, name: "qaResult")
        webView = WKWebView(frame: NSRect(x: 0, y: 0, width: 1180, height: 760), configuration: config)
        webView.navigationDelegate = self
        window = NSWindow(contentRect: webView.frame, styleMask: [.titled, .closable, .resizable], backing: .buffered, defer: false)
        window.title = "Q像素 · 隔离 WKWebView 验收"
        window.contentView = webView
        window.orderFront(nil)
        webView.load(URLRequest(url: URL(string: "http://127.0.0.1:8872/index.html")!))
        DispatchQueue.main.asyncAfter(deadline: .now() + 150) { if !self.running { self.finishFailure("WKWebView readiness timeout") } }
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if running { return }
        running = true
        let script = """
        (async () => {
          const checks = [], check = (v, name) => { if (!v) throw new Error(name); checks.push(name); };
          const t = QPixelTest;
          await t.activateSyntheticBeadPattern(18,18);
          const p = t.makeProjectPayload(); p.id = 'wk-qa-' + crypto.randomUUID(); p.title='WKWebView 隔离验收';
          p.pattern.cells[0][0]='H2'; p.layers[0].cells[0][0]='H2'; p.buildProgress={'0:0':true};
          check(t.applyProjectPayload(p), 'native WebKit loads pattern'); t.markUnsavedChangesForTest();
          check(await t.saveCurrentProject(), 'native WebKit local save succeeds');
          check(document.getElementById('saveStatus').textContent === '已保存到本机', 'native WebKit status explicit');
          await t.syncOfflineForTest();
          check((await t.getOfflineStoreForTest().pending()).length===0, 'native WebKit conditional sync confirmed: '+document.getElementById('message').textContent);
          const backup = await t.buildLibraryBackupForTest();
          check((await QPixelProjectLibrary.inspect(backup.text)).invalid.length===0,'native WebKit SHA256 library roundtrip');
          t.markUnsavedChangesForTest(); check(QPixelHasUnsavedChanges(), 'native exit hook protects edits');
          check(await t.saveCurrentProject(), 'native save before reopen');
          const id = t.makeProjectPayload().id;
          check(await t.loadProject(id) !== false, 'native reopens saved pattern');
          const opened=t.makeProjectPayload();
          check(opened.layers.length===p.layers.length && opened.pattern.cells[0][0]==='H2', 'native reopen preserves layers and colors');
          check(opened.buildProgress['0:0']===true,'native reopen preserves build progress');
          document.getElementById('libraryBackupButton').click();
          for(let i=0;i<80&&!document.getElementById('projectLibraryDialog').open;i++) await new Promise(r=>setTimeout(r,25));
          check(document.getElementById('projectLibraryDialog').open,'native library dialog opens');
          window.webkit.messageHandlers.qaResult.postMessage({passed:checks.length,checks});
        })().catch(error => window.webkit.messageHandlers.qaResult.postMessage({error:String(error)}));
        null;
        """
        webView.evaluateJavaScript(script) { _, error in if let error { self.finishFailure(error.localizedDescription) } }
        DispatchQueue.main.asyncAfter(deadline: .now() + 150) { if self.window != nil { self.finishFailure("WKWebView test timeout") } }
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let result = message.body as? [String: Any] else { finishFailure("Invalid QA result"); return }
        guard result["error"] == nil else { finishFailure(String(describing: result["error"]!)); return }
        do {
            let data = try JSONSerialization.data(withJSONObject: result, options: [.prettyPrinted, .sortedKeys])
            try data.write(to: URL(fileURLWithPath: outputDirectory).appendingPathComponent("wkwebview-results.json"))
            print(String(data: data, encoding: .utf8)!)
        } catch { finishFailure(error.localizedDescription); return }
        webView.takeSnapshot(with: nil) { image, _ in
            if let tiff = image?.tiffRepresentation, let bitmap = NSBitmapImageRep(data: tiff), let png = bitmap.representation(using: .png, properties: [:]) {
                try? png.write(to: URL(fileURLWithPath: self.outputDirectory).appendingPathComponent("wkwebview-library.png"))
            }
            self.window = nil
            NSApp.terminate(nil)
        }
    }
    func finishFailure(_ message: String) { print("FAILED: \(message)"); failed = true; NSApp.terminate(nil) }
}
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let delegate = ReliabilityQA()
app.delegate = delegate
app.run()
exit(delegate.failed ? 1 : 0)
