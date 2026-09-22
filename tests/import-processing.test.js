"use strict";

const assert = require("node:assert/strict");
const processing = require("../web/import-processing.js");

function makeImage(width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const light = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0;
      data.set(light ? [240, 220, 180, 255] : [35, 70, 110, 255], offset);
    }
  }
  return data;
}

const palette = [
  { code: "A", lab: processing.rgbToLab(240, 220, 180) },
  { code: "B", lab: processing.rgbToLab(35, 70, 110) }
];

async function run() {
  assert.equal(processing.VERSION, "responsive-import-1");
  const matcher = processing.createColorMatcher(palette);
  assert.equal(matcher.nearest(241, 221, 181), "A");
  matcher.nearest(241, 221, 181);
  assert.equal(matcher.stats().hits, 1, "quantized color cache should be reused");

  const progress = [];
  const result = await processing.processTask({
    data: makeImage(64, 64).buffer,
    width: 64,
    height: 64,
    targetWidth: 16,
    targetHeight: 16,
    settings: { type: "pixelArt", exposure: 0, contrast: 100, saturation: 100 },
    palette
  }, {
    onProgress: (item) => progress.push(item),
    yieldControl: () => Promise.resolve(),
    isCancelled: () => false
  });
  assert.equal(result.width, 16);
  assert.equal(result.height, 16);
  assert.equal(result.cells.length, 16);
  assert.ok(result.cells.every((row) => row.length === 16));
  assert.equal(result.processedData.length, 64 * 64 * 4);
  assert.ok(progress.some((item) => item.stage === "adjust"));
  assert.ok(progress.some((item) => item.stage === "match"));
  assert.equal(progress.at(-1).progress, 100);

  let cancelled = false;
  await assert.rejects(() => processing.processTask({
    data: makeImage(32, 32).buffer,
    width: 32,
    height: 32,
    targetWidth: 8,
    targetHeight: 8,
    settings: { type: "illustration" },
    palette
  }, {
    yieldControl: async () => { cancelled = true; },
    isCancelled: () => cancelled
  }), { name: "AbortError" });

  console.log("import-processing tests: PASS");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
