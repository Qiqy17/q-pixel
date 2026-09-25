"use strict";
const assert = require("node:assert/strict");

(async () => {
  const THREE = await import("three");
  const { visibleCellBounds } = await import("../web/3d/overlay-viewport.mjs");
  const width = 500, height = 500, center = (width - 1) * 2.5;
  const cameras = [
    [new THREE.Vector3(0, 240, 0), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(250, 390, 310), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(-180, -350, 250), new THREE.Vector3(0, 0, 0)]
  ];
  for (const [position, target] of cameras) {
    const camera = new THREE.PerspectiveCamera(34, 1.5, .1, 10000);
    camera.position.copy(position);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    const surfaceY = position.y < 0 ? -.15 : 4;
    const bounds = visibleCellBounds(camera, surfaceY, width, height, center, center);
    assert.ok((bounds.lastRow - bounds.firstRow) * (bounds.lastCol - bounds.firstCol) < width * height);
    for (let row = 0; row < height; row += 2) {
      for (let col = 0; col < width; col += 2) {
        const point = new THREE.Vector3(col * 5 - center, surfaceY, row * 5 - center).project(camera);
        if (point.z < -1 || point.z > 1 || Math.abs(point.x) > 1 || Math.abs(point.y) > 1) continue;
        assert.ok(row >= bounds.firstRow && row < bounds.lastRow && col >= bounds.firstCol && col < bounds.lastCol,
          `visible cell omitted at ${row}, ${col}`);
      }
    }
  }
  const horizon = new THREE.PerspectiveCamera(34, 1.5, .1, 10000);
  horizon.position.set(0, 10, 0);
  horizon.lookAt(0, 9, -1000);
  assert.deepEqual(visibleCellBounds(horizon, 4, width, height, center, center),
    { firstRow: 0, lastRow: height, firstCol: 0, lastCol: width });
  console.log("overlay-viewport tests: PASS");
})().catch((error) => { console.error(error); process.exitCode = 1; });
