"use strict";
const assert = require("node:assert/strict");
const core = require("../web/3d/finish-core.js");
assert.equal(core.PROFILES.length, 14);
assert.equal(core.PROFILES.every((item) => item.hole >= 0 && item.height > 0), true);
assert.equal(core.PROFILES.filter((item) => item.frontTopology === "fused").length, 11);
assert.equal(core.profile("back").frontTopology, "beads");
assert.equal(core.profile("back").backTopology, "fused");
assert.deepEqual(core.analyze([["A1", "A2", null], [null, "A2", "A3"]]), { count: 4, horizontal: 2, vertical: 1, isolated: 0 });
assert.equal(core.lod(13000, 1200), "medium");
assert.equal(core.lod(200000, 1200), "low");
assert.deepEqual(core.normalizeSettings({ profile: "invalid", exposure: 99, side: "back", background: "transparent" }), { version: 1, profile: "raw", exposure: 2, lightIntensity: 1, lightTemperature: "neutral", side: "back", background: "transparent", boardMode: "transparent", boardColor: "#8e9b94", boardAlpha: 100, boardImageData: "", boardImageName: "", showCodes: false, showGrid: true, codeOpacity: 90, codeSize: 50, profileTuning: {}, calibrated: false });
assert.deepEqual(((settings) => [settings.boardMode, settings.boardColor, settings.boardAlpha, settings.boardImageData])(core.normalizeSettings({ boardMode: "image", boardColor: "unsafe", boardAlpha: 150, boardImageData: "https://example.com/image.png" })), ["image", "#8e9b94", 100, ""]);
assert.deepEqual(core.tuningFor(core.normalizeSettings({}), "standard"), { textureRoughness: 50, textureOpacity: 75, meltEdge: 58 });
assert.deepEqual(core.normalizeSettings({ profileTuning: { standard: { meltEdge: 130 } } }).profileTuning.standard, { textureRoughness: 50, textureOpacity: 75, meltEdge: 100 });
assert.equal(core.normalizeSettings({}).profile, "standard");
assert.equal(core.normalizeSettings({}).side, "angle");
assert.equal(core.normalizeSettings({ background: "dark" }).background, "dark");
assert.ok(core.profile("raw").height > core.profile("standard").height);
assert.ok(core.profile("standard").height > core.profile("flat").height);
assert.ok(core.profile("back").hole > core.profile("back").backHole);
// 孤点：单独一颗没有任何邻接。
assert.equal(core.analyze([["A1", null], [null, null]]).isolated, 1);
// 单改状态字段不能解除未标定提示；所有样片、色卡和资产都须验收。
assert.equal(core.isCalibrated(), false);
globalThis.__QPIXEL_CALIBRATION_MANIFEST__ = { status: "calibrated", profiles: [] };
assert.equal(core.readManifestSync().status, "calibrated");
assert.equal(core.isCalibrated(), false);
assert.equal(core.normalizeSettings({}).calibrated, false);
const completeProfiles = core.PROFILES.map((item) => ({
  id: item.id, currentSource: "measured", verified: true,
  requiresCalibration: ["height"], measurements: { height: item.height }
}));
globalThis.__QPIXEL_CALIBRATION_MANIFEST__ = {
  status: "calibrated", assetSchema: "mard-5mm-calibration-v1",
  beadSystem: { brand: "MARD", diameterMm: 5 },
  colorCalibration: { progress: { calibratedColors: 221, totalColors: 221 } },
  validation: { measurementsVerified: true, assetsVerified: true, comparisonAccepted: true },
  profiles: completeProfiles
};
assert.equal(core.isCalibrated(), true);
completeProfiles[0].verified = false;
assert.equal(core.isCalibrated(), false);
delete globalThis.__QPIXEL_CALIBRATION_MANIFEST__;
assert.equal(core.isCalibrated(), false);
console.log("finish-core tests: PASS");
