import * as THREE from "three";

const corners = [
  new THREE.Vector2(-1, -1), new THREE.Vector2(-1, 1),
  new THREE.Vector2(1, -1), new THREE.Vector2(1, 1)
];
const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
const hit = new THREE.Vector3();

export function visibleCellBounds(camera, surfaceY, width, height, centerX, centerZ) {
  const full = { firstRow: 0, lastRow: height, firstCol: 0, lastCol: width };
  if (!width || !height) return full;
  plane.constant = -surfaceY;
  camera.updateMatrixWorld();
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const corner of corners) {
    raycaster.setFromCamera(corner, camera);
    if (!raycaster.ray.intersectPlane(plane, hit)) return full;
    minX = Math.min(minX, hit.x); maxX = Math.max(maxX, hit.x);
    minZ = Math.min(minZ, hit.z); maxZ = Math.max(maxZ, hit.z);
  }
  // Include edge cells whose centres fall just outside the viewport.
  const clamp = (value, limit) => Math.max(0, Math.min(limit, value));
  return {
    firstRow: clamp(Math.floor((minZ + centerZ) / 5) - 2, height),
    lastRow: clamp(Math.ceil((maxZ + centerZ) / 5) + 3, height),
    firstCol: clamp(Math.floor((minX + centerX) / 5) - 2, width),
    lastCol: clamp(Math.ceil((maxX + centerX) / 5) + 3, width)
  };
}
