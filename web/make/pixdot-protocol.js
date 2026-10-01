(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelPixDotProtocol = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  // Protocol reference: oxyroid/pixdot-protocol, ad5c6643 (Apache-2.0).
  // Independently implemented from documented wire format; not a hardware compatibility certification.
  const sizes = [32, 52, 78, 104], payloads = [12288, 12288, 8192, 4096];
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let k = 0; k < 8; k++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  function control(command, value, max) {
    if (!Number.isInteger(value) || value < 0 || value > max) throw new Error("设备控制参数无效。");
    return Uint8Array.of(5, 0, command, 128, value);
  }
  function imageFrames(bytes, size, save = false) {
    const index = sizes.indexOf(size);
    if (index < 0 || !(bytes instanceof Uint8Array) || !bytes.length) throw new Error("设备尺寸或图像无效。");
    if (size >= 78 && bytes.length !== size * size * 3) throw new Error("RGB图像尺寸与板子不符。");
    const frames = [], crc = crc32(bytes);
    for (let offset = 0; offset < bytes.length; offset += payloads[index]) {
      const part = bytes.subarray(offset, offset + payloads[index]), frame = new Uint8Array(15 + part.length), view = new DataView(frame.buffer);
      view.setUint16(0, frame.length, true); frame[2] = 2; frame[4] = offset ? 2 : 0;
      view.setUint32(5, bytes.length, true); view.setUint32(9, crc, true); frame[14] = save ? 1 : 101; frame.set(part, 15); frames.push(frame);
    }
    return frames;
  }
  function notification(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length < 4) return null;
    const size = bytes[0] | bytes[1] << 8;
    if (bytes.length !== size) return null;
    if (bytes[2] === 2 && bytes[3] === 0 && size === 5 && [1, 3].includes(bytes[4])) return { kind: "image", complete: bytes[4] === 3 };
    if (bytes[2] === 1 && bytes[3] === 128 && size >= 8 && sizes[bytes[4]]) return { kind: "board", size: sizes[bytes[4]], light: bytes[7] };
    return null;
  }
  return Object.freeze({ sizes, crc32, imageFrames, notification, brightness: (value) => control(4, value, 100), rotation: (value) => control(6, value, 3) });
});
