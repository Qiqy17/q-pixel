"use strict";

const assert = require("node:assert/strict");
const engine = require("../web/import-engine.js");

function makeImage(width, height, pixel) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const color = pixel(x, y);
      data.set([color[0], color[1], color[2], color[3] == null ? 255 : color[3]], offset);
    }
  }
  return data;
}

assert.equal(engine.VERSION, "adaptive-import-1");

const referenceDelta = engine.deltaE2000(
  { l: 50, a: 2.6772, b: -79.7751 },
  { l: 50, a: 0, b: -82.7485 }
);
assert.ok(Math.abs(referenceDelta - 2.0425) < 0.0002, `CIEDE2000 reference mismatch: ${referenceDelta}`);

const pixelArt = makeImage(64, 64, (x, y) => (
  (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? [20, 30, 40] : [240, 180, 40]
));
const illustration = makeImage(64, 64, (x, y) => (
  x < 32 ? (y < 32 ? [235, 80, 120] : [250, 220, 160]) : [60, 130, 220]
));
const photo = makeImage(64, 64, (x, y) => [
  (x * 3 + y * 2) % 256,
  (x * 2 + y * 3) % 256,
  (x * 5 + y) % 256
]);

assert.equal(engine.analyzeImageData(pixelArt, 64, 64).type, "pixelArt");
assert.equal(engine.analyzeImageData(illustration, 64, 64).type, "illustration");
assert.equal(engine.analyzeImageData(photo, 64, 64).type, "photo");

const connectedBackground = makeImage(7, 7, (x, y) => {
  if (x === 0 || y === 0 || x === 6 || y === 6) return [250, 250, 250];
  if (x === 3 && y === 3) return [250, 250, 250];
  return [35, 90, 180];
});
const removed = engine.removeConnectedBackground(connectedBackground, 7, 7, 16);
assert.equal(removed.rejected, false);
assert.equal(removed.data[3], 0, "connected border background should be transparent");
assert.equal(removed.data[(3 * 7 + 3) * 4 + 3], 255, "enclosed same-color detail must remain");

const allWhite = makeImage(8, 8, () => [255, 255, 255]);
const rejected = engine.removeConnectedBackground(allWhite, 8, 8, 20);
assert.equal(rejected.rejected, true);
assert.equal(rejected.data[3], 255, "over-aggressive removal must roll back");

const sourceCopy = new Uint8ClampedArray(photo);
const processed = engine.processImageData(photo, 64, 64, {
  type: "photo",
  exposure: 20,
  contrast: 110,
  saturation: 90,
  dither: "auto"
});
assert.deepEqual(photo, sourceCopy, "processing must not mutate the original image");
assert.notDeepEqual(processed.data, sourceCopy, "adjustments should change the derived image");

console.log("import-engine tests: PASS");
