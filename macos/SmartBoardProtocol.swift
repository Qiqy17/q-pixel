import Foundation

enum SmartBoardPacketValidator {
    static func crc32(_ bytes: [UInt8]) -> UInt32 {
        var crc: UInt32 = 0xffffffff
        for byte in bytes { crc ^= UInt32(byte); for _ in 0..<8 { crc = crc & 1 == 1 ? 0xedb88320 ^ (crc >> 1) : crc >> 1 } }
        return crc ^ 0xffffffff
    }
    private static func u32(_ b: [UInt8], _ p: Int) -> UInt32 { UInt32(b[p]) | UInt32(b[p+1]) << 8 | UInt32(b[p+2]) << 16 | UInt32(b[p+3]) << 24 }
    static func validate(_ data: [Data], boardSize: Int) -> Bool {
        guard [32, 52, 78, 104].contains(boardSize), !data.isEmpty, data.count <= 128 else { return false }
        let payloadLimit = boardSize == 104 ? 4096 : boardSize == 78 ? 8192 : 12288
        var total = 0; var declared: UInt32?; var checksum: UInt32?
        for (index, frame) in data.enumerated() {
            let b = [UInt8](frame)
            guard b.count > 15, b.count <= payloadLimit + 15, Int(b[0]) | Int(b[1]) << 8 == b.count,
                  b[2] == 2, b[3] == 0, b[4] == (index == 0 ? 0 : 2), b[13] == 0, b[14] == 101 else { return false }
            let length = u32(b, 5), crc = u32(b, 9)
            if let existing = declared, existing != length { return false }
            if let existing = checksum, existing != crc { return false }
            declared = length; checksum = crc; total += b.count - 15
        }
        guard total <= 1024 * 1024, declared == UInt32(total) else { return false }
        if boardSize >= 78 && total != boardSize * boardSize * 3 { return false }
        return checksum == crc32(data.flatMap { [UInt8]($0.dropFirst(15)) })
    }
}

struct SmartBoardAcknowledgementGate {
    private(set) var value: UInt8?
    mutating func reset() { value = nil }
    mutating func accept(_ status: UInt8, queued: Bool, last: Bool) -> Bool {
        guard queued, value == nil, status == (last ? 3 : 1) else { return false }
        value = status; return true
    }
    func ready(awaitingWrite: Bool) -> Bool { value != nil && !awaitingWrite }
}
