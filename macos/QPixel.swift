import AppKit
import WebKit
import UniformTypeIdentifiers

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler, NSWindowDelegate {
    private var window: NSWindow!
    private var webView: WKWebView!
    private var checkingTermination = false
    private let smartBoard = SmartBoardController()

    func applicationDidFinishLaunching(_ notification: Notification) {
        let configuration = WKWebViewConfiguration()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = true
        configuration.userContentController.add(self, name: "exportPng")
        configuration.userContentController.add(self, name: "exportFile")
        configuration.userContentController.add(self, name: "smartBoard")
        configuration.userContentController.add(self, name: "openAdmin")
        smartBoard.emit = { [weak self] event in
            guard let data = try? JSONSerialization.data(withJSONObject: event), let json = String(data: data, encoding: .utf8) else { return }
            self?.webView.evaluateJavaScript("window.QPixelSmartBoardNative && window.QPixelSmartBoardNative(\(json))")
        }

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.setValue(false, forKey: "drawsBackground")

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1180, height: 760),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.delegate = self
        window.title = "Q像素"
        window.minSize = NSSize(width: 420, height: 520)
        placeWindowOnMainScreen()
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)

        loadInterface()
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    func windowShouldClose(_ sender: NSWindow) -> Bool {
        NSApp.terminate(nil)
        return false
    }

    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        if checkingTermination { return .terminateCancel }
        checkingTermination = true
        webView.evaluateJavaScript("window.QPixelHasUnsavedChanges ? window.QPixelHasUnsavedChanges() : null") { [weak self] value, error in
            guard let self else { sender.reply(toApplicationShouldTerminate: false); return }
            if error == nil, let dirty = value as? Bool, !dirty {
                self.checkingTermination = false
                sender.reply(toApplicationShouldTerminate: true)
                return
            }
            let alert = NSAlert()
            alert.messageText = "请先保存或备份当前修改"
            alert.informativeText = "当前修改尚未确认保存，或仍有作品库操作正在进行。返回画布保存后再退出。"
            alert.addButton(withTitle: "返回画布")
            alert.addButton(withTitle: "放弃未保存修改并退出")
            alert.beginSheetModal(for: self.window) { response in
                self.checkingTermination = false
                sender.reply(toApplicationShouldTerminate: response == .alertSecondButtonReturn)
            }
        }
        return .terminateLater
    }

    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
        let panel = NSOpenPanel()
        panel.canChooseFiles = true
        panel.canChooseDirectories = parameters.allowsDirectories
        panel.allowsMultipleSelection = parameters.allowsMultipleSelection
        panel.canCreateDirectories = false
        panel.beginSheetModal(for: window) { response in
            completionHandler(response == .OK ? panel.urls : nil)
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "openAdmin" {
            let url = message.frameInfo.request.url
            let local = url?.isFileURL == true || (url?.scheme == "http" && url?.host == "127.0.0.1" && url?.port == 8766)
            if message.frameInfo.isMainFrame && local, let admin = URL(string: "http://127.0.0.1:8766/admin") {
                NSWorkspace.shared.open(admin)
            }
            return
        }
        if message.name == "smartBoard" {
            let url = message.frameInfo.request.url
            let local = url?.isFileURL == true || (url?.scheme == "http" && url?.host == "127.0.0.1" && url?.port == 8766)
            guard message.frameInfo.isMainFrame, local, let body = message.body as? [String: Any] else { return }
            smartBoard.handle(body); return
        }
        guard let body = message.body as? [String: Any],
              let dataUrl = body["dataUrl"] as? String,
              let fileName = body["fileName"] as? String else {
            return
        }
        if message.name == "exportPng" {
            savePng(dataUrl: dataUrl, fileName: fileName)
        } else if message.name == "exportFile" {
            saveFile(dataUrl: dataUrl, fileName: fileName, requestId: body["requestId"] as? String)
        }
    }

    private func loadInterface() {
        let remoteURLs = [
            "http://127.0.0.1:8766/index.html"
        ].compactMap(URL.init(string:))
        loadRemoteInterface(remoteURLs, index: 0)
    }

    private func loadRemoteInterface(_ urls: [URL], index: Int) {
        guard index < urls.count else {
            loadBundledInterface()
            return
        }
        var request = URLRequest(url: urls[index], cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 2)
        request.setValue("no-cache", forHTTPHeaderField: "Cache-Control")
        URLSession.shared.dataTask(with: request) { [weak self] _, response, _ in
            DispatchQueue.main.async {
                guard let self else { return }
                if let httpResponse = response as? HTTPURLResponse,
                   (200..<500).contains(httpResponse.statusCode) {
                    self.webView.load(request)
                } else {
                    self.loadRemoteInterface(urls, index: index + 1)
                }
            }
        }.resume()
    }

    private func loadBundledInterface() {
        guard let url = Bundle.main.url(forResource: "index", withExtension: "html") else {
            showFatalError("没有找到 Q像素 的界面文件。")
            return
        }
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }

    private func placeWindowOnMainScreen() {
        let screen = NSScreen.screens.first(where: { $0.frame.minX == 0 }) ?? NSScreen.main ?? NSScreen.screens.first
        guard let visibleFrame = screen?.visibleFrame else {
            window.center()
            return
        }

        let width = min(max(window.frame.width, 980), visibleFrame.width - 80)
        let height = min(max(window.frame.height, 640), visibleFrame.height - 80)
        let x = visibleFrame.minX + (visibleFrame.width - width) / 2
        let y = visibleFrame.minY + (visibleFrame.height - height) / 2
        window.setFrame(NSRect(x: x, y: y, width: width, height: height), display: true)
    }

    private func showFatalError(_ message: String) {
        let alert = NSAlert()
        alert.messageText = "Q像素启动失败"
        alert.informativeText = message
        alert.alertStyle = .critical
        alert.runModal()
        NSApp.terminate(nil)
    }

    private func savePng(dataUrl: String, fileName: String) {
        guard let data = decodeDataUrl(dataUrl) else {
            showSaveError("导出的图片数据不完整。")
            return
        }

        let panel = NSSavePanel()
        panel.title = "导出 PNG"
        panel.nameFieldStringValue = fileName
        panel.allowedContentTypes = [.png]
        panel.canCreateDirectories = true
        panel.beginSheetModal(for: window) { [weak self] response in
            guard response == .OK, let url = panel.url else { return }
            do {
                try data.write(to: url, options: .atomic)
                self?.webView.evaluateJavaScript("window.QPixelNativeSaved && window.QPixelNativeSaved()")
            } catch {
                self?.showSaveError("保存失败，请检查保存位置。")
            }
        }
    }

    private func notifyExport(requestId: String?, status: String) {
        guard let requestId = requestId else { return }
        guard let data = try? JSONSerialization.data(withJSONObject: ["requestId": requestId, "status": status]),
              let json = String(data: data, encoding: .utf8) else { return }
        webView.evaluateJavaScript("window.QPixelNativeExportResult && window.QPixelNativeExportResult(\(json))")
    }

    private func saveFile(dataUrl: String, fileName: String, requestId: String?) {
        guard let data = decodeDataUrl(dataUrl) else {
            notifyExport(requestId: requestId, status: "failed")
            showSaveError("导出的文件数据不完整。")
            return
        }

        let panel = NSSavePanel()
        panel.title = "导出文件"
        panel.nameFieldStringValue = fileName
        if let type = UTType(filenameExtension: (fileName as NSString).pathExtension) {
            panel.allowedContentTypes = [type]
        }
        panel.canCreateDirectories = true
        panel.beginSheetModal(for: window) { [weak self] response in
            guard response == .OK, let url = panel.url else { self?.notifyExport(requestId: requestId, status: "cancelled"); return }
            do {
                try data.write(to: url, options: .atomic)
                if requestId != nil { self?.notifyExport(requestId: requestId, status: "saved") }
                else { self?.webView.evaluateJavaScript("window.QPixelNativeSaved && window.QPixelNativeSaved()") }
            } catch {
                self?.notifyExport(requestId: requestId, status: "failed")
                self?.showSaveError("保存失败，请检查保存位置。")
            }
        }
    }

    private func decodeDataUrl(_ dataUrl: String) -> Data? {
        guard let commaIndex = dataUrl.firstIndex(of: ",") else {
            return nil
        }
        let encoded = String(dataUrl[dataUrl.index(after: commaIndex)...])
        return Data(base64Encoded: encoded)
    }

    private func showSaveError(_ message: String) {
        let alert = NSAlert()
        alert.messageText = "导出失败"
        alert.informativeText = message
        alert.alertStyle = .warning
        alert.runModal()
    }
}

@main
struct QPixelApplication {
    static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()
        app.delegate = delegate
        app.setActivationPolicy(.regular)
        app.run()
    }
}
