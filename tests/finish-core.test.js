"use strict";
const assert = require("node:assert/strict");
const core = require("../web/3d/finish-core.js");
assert.equal(core.PROFILES.length, 10);
assert.equal(core.PROFILES.every((item) => item.hole >= 0 && item.height > 0), true);
assert.deepEqual(core.analyze([["A1", "A2", null], [null, "A2", "A3"]]), { count: 4, horizontal: 2, vertical: 1, isolated: 0 });
assert.equal(core.lod(13000, 1200), "medium");
assert.equal(core.lod(200000, 1200), "low");
assert.deepEqual(core.normalizeSettings({ profile: "invalid", exposure: 99, side: "back", background: "transparent" }), { version: 1, profile: "raw", exposure: 2, side: "back", background: "transparent", calibrated: false });
// 孤点：单独一颗没有任何邻接。
assert.equal(core.analyze([["A1", null], [null, null]]).isolated, 1);
// 标定状态联动：manifest 就绪时设置带 calibrated=true。
assert.equal(core.isCalibrated(), false);
globalThis.__QPIXEL_CALIBRATION_MANIFEST__ = { status: "calibrated", profiles: [] };
assert.equal(core.readManifestSync().status, "calibrated");
assert.equal(core.isCalibrated(), true);
assert.equal(core.normalizeSettings({}).calibrated, true);
delete globalThis.__QPIXEL_CALIBRATION_MANIFEST__;
assert.equal(core.isCalibrated(), false);
console.log("finish-core tests: PASS");
