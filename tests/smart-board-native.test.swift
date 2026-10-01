import Foundation

@main
enum SmartBoardNativeTests {
    static func main() {
        assert(SmartBoardPacketValidator.crc32(Array("123456789".utf8)) == 0xcbf43926)
        // Published three-byte image vector, changed from store(01) to preview(65).
        let bytes: [UInt8] = [0x12,0,2,0,0,3,0,0,0,0x63,0x37,0xc7,0xfa,0,0x65,0x11,0x22,0x33]
        assert(SmartBoardPacketValidator.validate([Data(bytes)], boardSize: 32))
        assert(!SmartBoardPacketValidator.validate([Data(bytes)], boardSize: 104))
        var corrupt = bytes; corrupt[17] ^= 1
        assert(!SmartBoardPacketValidator.validate([Data(corrupt)], boardSize: 32))
        corrupt = bytes; corrupt[14] = 1
        assert(!SmartBoardPacketValidator.validate([Data(corrupt)], boardSize: 32), "禁止默认写入设备存储")
        corrupt = bytes; corrupt[4] = 2
        assert(!SmartBoardPacketValidator.validate([Data(corrupt)], boardSize: 32))
        assert(!SmartBoardPacketValidator.validate([], boardSize: 32))
        var gate = SmartBoardAcknowledgementGate()
        assert(!gate.accept(1, queued: false, last: false), "不能接受过早应答")
        assert(!gate.accept(3, queued: true, last: false), "不能提前完成整图")
        assert(gate.accept(1, queued: true, last: false))
        assert(!gate.ready(awaitingWrite: true), "设备应答不能越过待完成的GATT写入")
        assert(!gate.accept(1, queued: true, last: false), "重复应答不能推进")
        assert(gate.ready(awaitingWrite: false))
        gate.reset(); assert(!gate.ready(awaitingWrite: false), "取消/重置清除旧应答")
        assert(!gate.accept(1, queued: true, last: true))
        assert(gate.accept(3, queued: true, last: true)); assert(gate.ready(awaitingWrite: false))
        print("native smart-board: CRC、数据校验、预览动作、早到/重复/最终应答及写入竞态通过")
    }
}
