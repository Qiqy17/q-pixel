import Foundation
import CoreBluetooth

// Experimental HPD/PDD transport. No fixed vendor UUIDs are assumed.
final class SmartBoardController: NSObject, CBCentralManagerDelegate, CBPeripheralDelegate {
    var emit: (([String: Any]) -> Void)?
    private var central: CBCentralManager!
    private var devices: [UUID: CBPeripheral] = [:]
    private var peripheral: CBPeripheral?
    private var writeCharacteristic: CBCharacteristic?
    private var notifyCharacteristic: CBCharacteristic?
    private var pairs: [(CBCharacteristic, CBCharacteristic)] = []
    private var servicesPending = 0
    private var boardSize = 0
    private var queriedSize: Int?
    private var requestID: Int?
    private var action = ""
    private var timeout: DispatchWorkItem?
    private var scanTimer: DispatchWorkItem?
    private var frames: [Data] = []
    private var frameIndex = 0
    private var chunkOffset = 0
    private var awaitingWrite = false
    private var ackGate = SmartBoardAcknowledgementGate()
    private var notificationBuffer = Data()

    func handle(_ body: [String: Any]) {
        guard let id = body["id"] as? Int, let command = body["action"] as? String else { return }
        if command == "cancel" || command == "disconnect" {
            fail("操作已取消。设备画面可能未完整，请重连后重新发送。", disconnect: true)
            emit?(["id": id, "ok": true]); return
        }
        guard requestID == nil else { emit?(["id": id, "error": "设备正在操作，请等待或取消。"]); return }
        requestID = id; action = command
        if central == nil { central = CBCentralManager(delegate: self, queue: .main) }
        if command == "scan" {
            armTimeout(15)
            if central.state == .poweredOn { startScan() }
            else if central.state != .unknown && central.state != .resetting { fail("蓝牙不可用，请检查系统蓝牙权限和开关。") }
            return
        }
        guard central.state == .poweredOn else { fail("请先开启蓝牙并扫描设备。"); return }
        if command == "connect" {
            guard peripheral == nil else { fail("请先断开当前设备，再连接另一台设备。"); return }
            guard let key = body["device"] as? String, let uuid = UUID(uuidString: key), let device = devices[uuid] else { fail("设备未找到，请重新扫描。"); return }
            resetConnection(); peripheral = device; device.delegate = self
            armTimeout(15); central.connect(device); return
        }
        guard boardSize > 0, let device = peripheral, device.state == .connected, writeCharacteristic != nil else { fail("请先连接并查询设备。"); return }
        if command == "control" {
            guard let raw = body["bytes"] as? [Int], raw.count == 5, raw[0] == 5, raw[1] == 0, raw[3] == 128,
                  (raw[2] == 4 && (0...100).contains(raw[4])) || (raw[2] == 6 && (0...3).contains(raw[4])) else { fail("控制指令无效。"); return }
            frames = [Data(raw.map { UInt8($0) })]; frameIndex = 0; chunkOffset = 0; armTimeout(10); writeChunks(); return
        }
        if command == "send" {
            guard body["size"] as? Int == boardSize, let encoded = body["frames"] as? [String], !encoded.isEmpty, encoded.count <= 128 else { fail("图像尺寸或分帧数据无效。"); return }
            let data = encoded.compactMap { Data(base64Encoded: $0) }
            guard data.count == encoded.count, SmartBoardPacketValidator.validate(data, boardSize: boardSize) else { fail("图像协议数据无效。"); return }
            frames = data; frameIndex = 0; chunkOffset = 0; ackGate.reset(); armTimeout(10); writeChunks(); return
        }
        fail("未知设备操作。")
    }

    private func armTimeout(_ seconds: Double) {
        timeout?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.fail("设备应答超时，请重连后重试。", disconnect: true) }
        timeout = work; DispatchQueue.main.asyncAfter(deadline: .now() + seconds, execute: work)
    }
    private func finish(_ values: [String: Any] = [:]) {
        timeout?.cancel(); timeout = nil; scanTimer?.cancel(); scanTimer = nil
        var reply = values; reply["id"] = requestID; reply["ok"] = true
        requestID = nil; action = ""; frames = []; awaitingWrite = false; ackGate.reset()
        emit?(reply)
    }
    private func fail(_ message: String, disconnect: Bool = false) {
        timeout?.cancel(); timeout = nil; scanTimer?.cancel(); scanTimer = nil
        if action == "scan" { central?.stopScan() }
        let id = requestID; requestID = nil; action = ""; frames = []; awaitingWrite = false; ackGate.reset()
        if disconnect {
            if let device = peripheral { central?.cancelPeripheralConnection(device) }
            resetConnection(); emit?(["type": "disconnected", "message": message])
        }
        if let id { emit?(["id": id, "error": message]) }
    }
    private func resetConnection() {
        peripheral = nil; writeCharacteristic = nil; notifyCharacteristic = nil; boardSize = 0; queriedSize = nil; notificationBuffer = Data(); pairs = []; servicesPending = 0
    }
    private func startScan() {
        guard action == "scan", scanTimer == nil else { return }
        devices = [:]; central.scanForPeripherals(withServices: nil)
        let work = DispatchWorkItem { [weak self] in
            guard let self, self.action == "scan" else { return }
            self.central.stopScan()
            let results = self.devices.values.sorted { ($0.name ?? "") < ($1.name ?? "") }.map { ["id": $0.identifier.uuidString, "name": $0.name ?? "PDD设备"] }
            self.finish(["devices": results])
        }
        scanTimer = work; DispatchQueue.main.asyncAfter(deadline: .now() + 8, execute: work)
    }
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        if central.state == .poweredOn { if action == "scan" { startScan() } }
        else if central.state != .unknown && central.state != .resetting { fail("蓝牙已关闭或未授权。", disconnect: true) }
    }
    func centralManager(_ central: CBCentralManager, didDiscover device: CBPeripheral, advertisementData: [String: Any], rssi RSSI: NSNumber) {
        let name = device.name ?? advertisementData[CBAdvertisementDataLocalNameKey] as? String ?? ""
        if name.contains("PDD_") { devices[device.identifier] = device }
    }
    func centralManager(_ central: CBCentralManager, didConnect device: CBPeripheral) {
        guard device === peripheral, action == "connect" else { central.cancelPeripheralConnection(device); return }
        device.discoverServices(nil)
    }
    func centralManager(_ central: CBCentralManager, didFailToConnect device: CBPeripheral, error: Error?) {
        if device === peripheral { fail("连接失败：" + (error?.localizedDescription ?? "设备不可用"), disconnect: true) }
    }
    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral device: CBPeripheral, error: Error?) {
        if device === peripheral { fail("设备已断开，画面可能未完整。", disconnect: true) }
    }
    func peripheral(_ device: CBPeripheral, didDiscoverServices error: Error?) {
        guard device === peripheral else { return }
        guard error == nil, let services = device.services, !services.isEmpty else { fail("设备服务发现失败。", disconnect: true); return }
        servicesPending = services.count
        for service in services { device.discoverCharacteristics(nil, for: service) }
    }
    func peripheral(_ device: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        guard device === peripheral else { return }
        guard error == nil else { fail("设备特征发现失败。", disconnect: true); return }
        let chars = service.characteristics ?? []
        let writes = chars.filter { $0.properties.contains(.write) || $0.properties.contains(.writeWithoutResponse) }
        let notices = chars.filter { $0.properties.contains(.notify) || $0.properties.contains(.indicate) }
        for write in writes { for notice in notices { pairs.append((write, notice)) } }
        servicesPending -= 1
        guard servicesPending == 0 else { return }
        guard pairs.count == 1 else { fail("无法唯一识别设备通信服务，停止试点连接。", disconnect: true); return }
        writeCharacteristic = pairs[0].0; notifyCharacteristic = pairs[0].1
        device.setNotifyValue(true, for: pairs[0].1)
    }
    func peripheral(_ device: CBPeripheral, didUpdateNotificationStateFor characteristic: CBCharacteristic, error: Error?) {
        guard device === peripheral, characteristic === notifyCharacteristic, action == "connect" else { return }
        guard error == nil, characteristic.isNotifying else { fail("设备通知订阅失败。", disconnect: true); return }
        let components = Calendar.current.dateComponents([.hour, .minute, .second], from: Date())
        frames = [Data([8, 0, 1, 128, UInt8(components.hour ?? 0), UInt8(components.minute ?? 0), UInt8(components.second ?? 0), 1])]
        frameIndex = 0; chunkOffset = 0; armTimeout(10); writeChunks()
    }
    private func writeChunks() {
        guard let device = peripheral, let char = writeCharacteristic, !frames.isEmpty, frameIndex < frames.count, !awaitingWrite else { return }
        let frame = frames[frameIndex], type: CBCharacteristicWriteType = char.properties.contains(.write) ? .withResponse : .withoutResponse
        let length = min(20, device.maximumWriteValueLength(for: type))
        guard length > 0 else { fail("设备写入长度无效。", disconnect: true); return }
        while chunkOffset < frame.count {
            if type == .withoutResponse && !device.canSendWriteWithoutResponse { return }
            let end = min(chunkOffset + length, frame.count), chunk = frame.subdata(in: chunkOffset..<end)
            chunkOffset = end
            if type == .withResponse { awaitingWrite = true }
            device.writeValue(chunk, for: char, type: type)
            if type == .withResponse { return }
        }
        if action == "control" { finish() }
        else if action == "send" { advanceIfAcknowledged() }
        else if action == "connect" { finishConnectIfReady() }
    }
    func peripheral(_ device: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?) {
        guard device === peripheral, characteristic === writeCharacteristic else { return }
        guard error == nil else { fail("设备写入失败。", disconnect: true); return }
        awaitingWrite = false; writeChunks()
    }
    func peripheralIsReady(toSendWriteWithoutResponse device: CBPeripheral) { if device === peripheral { writeChunks() } }
    private func finishConnectIfReady() {
        guard action == "connect", !awaitingWrite, let size = queriedSize,
              !frames.isEmpty, chunkOffset == frames[0].count else { return }
        boardSize = size; queriedSize = nil; finish(["size": size])
    }
    private func advanceIfAcknowledged() {
        guard action == "send", !awaitingWrite, frameIndex < frames.count, chunkOffset == frames[frameIndex].count, ackGate.ready(awaitingWrite: awaitingWrite), let ack = ackGate.value else { return }
        let last = frameIndex == frames.count - 1
        guard ack == (last ? 3 : 1) else { fail("设备图像应答与发送进度不符。", disconnect: true); return }
        emit?(["type": "progress", "done": frameIndex + 1, "total": frames.count])
        if last { finish(); return }
        frameIndex += 1; chunkOffset = 0; ackGate.reset(); armTimeout(10); writeChunks()
    }
    func peripheral(_ device: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        guard device === peripheral, characteristic === notifyCharacteristic else { return }
        guard error == nil, let bytes = characteristic.value else { fail("读取设备通知失败。", disconnect: true); return }
        notificationBuffer.append(bytes)
        while notificationBuffer.count >= 2 {
            let b = [UInt8](notificationBuffer), length = Int(b[0]) | Int(b[1]) << 8
            guard length >= 4, length <= 65535 else { fail("设备通知格式无效。", disconnect: true); return }
            if notificationBuffer.count < length { return }
            let frame = [UInt8](notificationBuffer.prefix(length)); notificationBuffer.removeFirst(length)
            if action == "connect", length >= 8, frame[2] == 1, frame[3] == 128, Int(frame[4]) < 4 {
                queriedSize = [32, 52, 78, 104][Int(frame[4])]; finishConnectIfReady()
            } else if action == "send", length == 5, frame[2] == 2, frame[3] == 0, [1, 3].contains(frame[4]) {
                // An ACK before the last transport chunk is queued is unrelated or malformed.
                guard ackGate.accept(frame[4], queued: chunkOffset == frames[frameIndex].count, last: frameIndex == frames.count - 1) else { fail("收到重复或过早的设备应答。", disconnect: true); return }
                advanceIfAcknowledged()
            }
        }
    }
}
