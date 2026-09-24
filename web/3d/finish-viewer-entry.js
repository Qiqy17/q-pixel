import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// 参数化豆体：车削轮廓由烫法档案驱动（外径=豆径+摊开量，内径=孔径占比）。
function beadGeometry(profile, segments) {
  const outer = 2.33 + profile.spread;
  const frontInner = Math.max(.025, outer * profile.hole);
  const backInner = Math.max(.025, outer * (profile.backHole == null ? profile.hole : profile.backHole));
  const h = profile.height;
  const points = [
    [backInner, .03], [backInner + .13, 0], [outer - .22, 0],
    [outer, .20], [outer, h - .28], [outer - .17, h - .04],
    [frontInner + .12, h], [frontInner, h - .10], [backInner, .16]
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(points, segments);
}

// 可重复的微表面：只改变法线与粗糙度，不改变色号基色。
function surfaceMaps(profile, opacity = .75) {
  const size = 128;
  const normals = new Uint8Array(size * size * 4);
  const roughness = new Uint8Array(size * size * 4);
  const flakes = new Uint8Array(size * size * 4);
  const fibers = new Uint8Array(size * size * 4);
  const noiseAt = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const smoothX = fx * fx * (3 - 2 * fx), smoothY = fy * fy * (3 - 2 * fy);
    const hash = (a, b) => {
      const value = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
      return (value - Math.floor(value)) * 2 - 1;
    };
    const top = hash(ix, iy) * (1 - smoothX) + hash(ix + 1, iy) * smoothX;
    const bottom = hash(ix, iy + 1) * (1 - smoothX) + hash(ix + 1, iy + 1) * smoothX;
    return top * (1 - smoothY) + bottom * smoothY;
  };
  const heightAt = (x, y) => {
    const grain = Math.sin(x * 37.7 + y * 19.3) * Math.sin(y * 43.1 - x * 13.7);
    if (profile.texture === "towel") return noiseAt(x * .58, y * .58) * .72 + noiseAt(x * .19, y * .19) * .22;
    if (profile.texture === "bath") return noiseAt(x * .36, y * .36) * .48 + Math.sin(x * .43) * Math.sin(y * .43) * .24;
    if (profile.texture === "waffle") return Math.cos(x * Math.PI / 12) * .35 + Math.cos(y * Math.PI / 12) * .35;
    if (profile.texture === "fabric") return Math.sin(x * .73) * Math.sin(y * .73) * .26 + grain * .12;
    if (profile.texture === "ribbed") return Math.sin(y * .76) * .34 + grain * .06;
    return noiseAt(x * .53, y * .53) * .08;
  };
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const i = (y * size + x) * 4;
    const dx = heightAt(x + 1, y) - heightAt(x - 1, y);
    const dy = heightAt(x, y + 1) - heightAt(x, y - 1);
    normals[i] = Math.max(0, Math.min(255, Math.round(128 - dx * 52)));
    normals[i + 1] = Math.max(0, Math.min(255, Math.round(128 - dy * 52)));
    normals[i + 2] = 248; normals[i + 3] = 255;
    const noise = ((Math.imul(x + 31, 1103515245) ^ Math.imul(y + 17, 12345)) >>> 8) & 255;
    const r = Math.max(55, Math.min(255, Math.round(profile.roughness * 255 + (noise - 128) * .11)));
    roughness[i] = roughness[i + 1] = roughness[i + 2] = r; roughness[i + 3] = 255;
    const fiberLight = Math.max(204, Math.min(255, Math.round(255 + (heightAt(x, y) * 38 - 20) * opacity)));
    fibers[i] = fibers[i + 1] = fibers[i + 2] = fiberLight; fibers[i + 3] = 255;
    const coarseSeed = ((Math.imul(Math.floor(x / 10) + 31, 1103515245) ^ Math.imul(Math.floor(y / 10) + 17, 12345)) >>> 8) & 255;
    const flakeX = x % 10 - (3 + (coarseSeed & 3));
    const flakeY = y % 10 - (3 + ((coarseSeed >> 2) & 3));
    const flakeRadius = 1.8 + ((coarseSeed >> 4) & 3) * .27;
    const coarseFlake = coarseSeed > 215 && flakeX * flakeX + flakeY * flakeY < flakeRadius * flakeRadius;
    const flake = profile.texture === "glitter-coarse" ? coarseFlake ? 255 : 0 : profile.glitter && noise > (profile.texture === "glitter-fine" ? 253 : 249) ? 255 : 0;
    flakes[i] = flakes[i + 1] = flakes[i + 2] = Math.round(flake * opacity); flakes[i + 3] = 255;
  }
  const texture = (data) => {
    const map = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.needsUpdate = true;
    return map;
  };
  return { normal: texture(normals), roughness: texture(roughness), flakes: texture(flakes), fibers: texture(fibers) };
}

// 每个条带生成相接的实心色块与外缘侧壁。正面、背面和侧壁分开，便于保孔/背熔切换。
function fusedStripe(cells, firstRow, lastRow, centerX, centerZ, colorOf, opticalClass, meltEdge = 0) {
  const buckets = {};
  const colorCache = new Map();
  const cellAt = (row, col) => cells[row] && cells[row][col];
  const colorFor = (code) => {
    if (!colorCache.has(code)) colorCache.set(code, new THREE.Color(colorOf(code) || "#aaaaaa"));
    return colorCache.get(code);
  };
  function quad(face, kind, vertices, normal, code) {
    const key = `${face}:${kind}`;
    const bucket = buckets[key] || (buckets[key] = { position: [], normal: [], color: [], uv: [] });
    const tint = colorFor(code);
    [0, 1, 2, 0, 2, 3].forEach((index) => {
      const p = vertices[index];
      bucket.position.push(p[0], p[1], p[2]);
      bucket.normal.push(...normal);
      bucket.color.push(tint.r, tint.g, tint.b);
      bucket.uv.push(p[0] / 80, p[2] / 80);
    });
  }
  // Only convex silhouette corners are rounded. Shared interior edges stay coincident,
  // so adjacent colors remain gap-free even at the strongest melt setting.
  function surface(face, kind, outline, elevation, code) {
    const key = `${face}:${kind}`;
    const bucket = buckets[key] || (buckets[key] = { position: [], normal: [], color: [], uv: [] });
    const tint = colorFor(code);
    const cx = outline.reduce((sum, point) => sum + point[0], 0) / outline.length;
    const cz = outline.reduce((sum, point) => sum + point[1], 0) / outline.length;
    const normal = face === "front" ? [0, 1, 0] : [0, -1, 0];
    for (let index = 0; index < outline.length; index += 1) {
      const a = outline[index], b = outline[(index + 1) % outline.length];
      const triangle = face === "front" ? [[cx, cz], a, b] : [[cx, cz], b, a];
      for (const point of triangle) {
        bucket.position.push(point[0], elevation, point[1]);
        bucket.normal.push(...normal);
        bucket.color.push(tint.r, tint.g, tint.b);
        bucket.uv.push(point[0] / 80, point[1] / 80);
      }
    }
  }
  for (let row = firstRow; row < lastRow; row += 1) {
    for (let col = 0; col < (cells[row] || []).length; col += 1) {
      const code = cellAt(row, col);
      if (!code) continue;
      const kind = opticalClass(code);
      const x0 = col * 5 - centerX - 2.5, x1 = x0 + 5;
      const z0 = row * 5 - centerZ - 2.5, z1 = z0 + 5;
      const top = !cellAt(row - 1, col), bottom = !cellAt(row + 1, col);
      const left = !cellAt(row, col - 1), right = !cellAt(row, col + 1);
      const radius = Math.min(1.12, Math.max(0, meltEdge) * .0112);
      const outline = [];
      // Winding follows the former front quad. Diagonal cuts soften singletons and perimeter tips.
      if (top && left && radius) outline.push([x0, z0 + radius], [x0 + radius * .3, z0 + radius * .3], [x0 + radius, z0]);
      else outline.push([x0, z0]);
      if (bottom && left && radius) outline.push([x0, z1 - radius], [x0 + radius * .3, z1 - radius * .3], [x0 + radius, z1]);
      else outline.push([x0, z1]);
      if (bottom && right && radius) outline.push([x1 - radius, z1], [x1 - radius * .3, z1 - radius * .3], [x1, z1 - radius]);
      else outline.push([x1, z1]);
      if (top && right && radius) outline.push([x1, z0 + radius], [x1 - radius * .3, z0 + radius * .3], [x1 - radius, z0]);
      else outline.push([x1, z0]);
      surface("front", kind, outline, 1, code);
      surface("back", kind, outline, 0, code);
      for (let index = 0; index < outline.length; index += 1) {
        const a = outline[index], b = outline[(index + 1) % outline.length];
        const interior = (!top && a[1] === z0 && b[1] === z0) || (!bottom && a[1] === z1 && b[1] === z1)
          || (!left && a[0] === x0 && b[0] === x0) || (!right && a[0] === x1 && b[0] === x1);
        if (interior) continue;
        const dx = b[0] - a[0], dz = b[1] - a[1], length = Math.hypot(dx, dz) || 1;
        quad("side", kind, [[a[0], 0, a[1]], [a[0], 1, a[1]], [b[0], 1, b[1]], [b[0], 0, b[1]]], [-dz / length, 0, dx / length], code);
      }
    }
  }
  return Object.entries(buckets).map(([key, data]) => {
    const geometry = new THREE.BufferGeometry();
    for (const [name, values] of Object.entries(data)) geometry.setAttribute(name, new THREE.Float32BufferAttribute(values, name === "uv" ? 2 : 3));
    geometry.computeBoundingSphere();
    const [face, kind] = key.split(":");
    return { face, kind, geometry };
  });
}

function create({ canvas, overlay, pattern, colorOf, settings, getGuides, getSelection, onPick, onEdit, onStatus }) {
  const core = window.QPixelFinishCore;
  const support = window.QPixelWebGLSupport;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 10000);
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  } catch (error) {
    throw new Error(`当前设备无法启动 3D 渲染：${error && error.message ? error.message : "WebGL 不可用"}`);
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = settings.exposure;
  renderer.shadowMap.enabled = false;
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(environment).texture;
  scene.environment = envMap;
  scene.background = settings.background === "transparent" ? null : new THREE.Color(0xe6e9e5);
  const controls = new OrbitControls(camera, canvas);
  controls.enabled = false;
  controls.enableDamping = true;
  controls.dampingFactor = .10;
  controls.minDistance = 10;
  controls.maxDistance = Math.max(pattern.width, pattern.height) * 12 + 80;
  const ambient = new THREE.HemisphereLight(0xffffff, 0x6e7f78, .52);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.position.set(-110, 180, 130);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, .3);
  fill.position.set(130, 90, -70);
  scene.add(fill);

  const width = pattern.width, height = pattern.height;
  let cells = pattern.cells;
  let minCol = width, maxCol = -1, minRow = height, maxRow = -1;
  for (let row = 0; row < height; row += 1) for (let col = 0; col < width; col += 1) {
    if (!cells[row] || !cells[row][col]) continue;
    minCol = Math.min(minCol, col); maxCol = Math.max(maxCol, col);
    minRow = Math.min(minRow, row); maxRow = Math.max(maxRow, row);
  }
  const occupiedWidth = width, occupiedHeight = height;
  const focusWidth = Math.max(6, maxCol - minCol + 1), focusHeight = Math.max(6, maxRow - minRow + 1);
  const centerX = (width - 1) * 2.5, centerZ = (height - 1) * 2.5;
  let count = core.analyze(cells).count;
  // LOD：图纸规模 → 基础档位；弱设备（低内存/少核心）再降一档。
  const memory = support ? support.memoryBudget() : { suggestLowDetail: false };
  let currentQuality = core.lod(count, canvas.clientWidth);
  if (memory.suggestLowDetail && currentQuality === "high") currentQuality = "medium";
  const segmentsFor = (level) => (level === "high" ? 24 : level === "medium" ? 12 : 8);

  let maps = surfaceMaps(core.profile(settings.profile), core.tuningFor(settings, settings.profile).textureOpacity / 100);
  const beadMaterials = {
    opaque: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .42, normalMap: maps.normal, normalScale: new THREE.Vector2(.16, .16), envMapIntensity: .75, clearcoat: .18, clearcoatRoughness: .48 }),
    translucent: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .24, transmission: .36, thickness: 1.2, ior: 1.45, envMapIntensity: 1, clearcoat: .2, side: THREE.DoubleSide }),
    clear: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .12, transmission: .88, thickness: 1.55, ior: 1.46, envMapIntensity: 1.25, clearcoat: .32, side: THREE.DoubleSide, depthWrite: false })
  };
  const bridgeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .52, envMapIntensity: .48, vertexColors: false });
  const palette = window.QPixelPaletteRegistry && window.QPixelPaletteRegistry.defaultPalette();
  const opticalClass = (code) => {
    const entry = palette && palette.colorOf(code);
    return entry && ["clear", "translucent"].includes(entry.opticalClass) ? entry.opticalClass : "opaque";
  };
  let groups = { opaque: [], translucent: [], clear: [] };
  function regroup() {
    groups = { opaque: [], translucent: [], clear: [] };
    for (let row = 0; row < height; row += 1) for (let col = 0; col < width; col += 1) {
      const code = cells[row] && cells[row][col];
      if (code) groups[opticalClass(code)].push({ row, col, code });
    }
  }
  regroup();
  const beadMeshes = [];
  const dummy = new THREE.Object3D(), tint = new THREE.Color();
  function ensureBeadMeshes() {
    if (beadMeshes.length) return;
    Object.entries(groups).filter(([, positions]) => positions.length).forEach(([kind, positions]) => {
      const mesh = new THREE.InstancedMesh(beadGeometry(core.profile(settings.profile), segmentsFor(currentQuality)), beadMaterials[kind], positions.length);
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      mesh.userData.positions = positions;
      mesh.castShadow = kind !== "clear";
      positions.forEach(({ row, col, code }, index) => {
        dummy.position.set(col * 5 - centerX, 0, row * 5 - centerZ);
        dummy.scale.set(1, 1, 1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        mesh.setColorAt(index, tint.set(colorOf(code) || "#aaaaaa"));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      scene.add(mesh);
      beadMeshes.push(mesh);
    });
  }
  const fusedMaterials = Object.fromEntries(Object.entries(beadMaterials).map(([kind, material]) => {
    const copy = material.clone();
    copy.vertexColors = true;
    return [kind, copy];
  }));
  const fusedGroups = { front: new THREE.Group(), back: new THREE.Group(), side: new THREE.Group() };
  Object.values(fusedGroups).forEach((group) => scene.add(group));
  const fusedMeshes = [];
  let fusedReady = false, fusedGeneration = 0, fusedStarted = false, fusedBuildPromise = Promise.resolve();
  const finishStatus = () => {
    const current = core.profile(settings.profile);
    return `${count.toLocaleString()} 颗 · ${current.frontTopology === "fused" ? "连续无孔" : current.backTopology === "fused" ? "正面保孔 / 背面融合" : "逐颗保孔"} · ${currentQuality} 精度 · 未实物标定`;
  };
  if (count <= 12000) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -occupiedWidth * 3;
    key.shadow.camera.right = occupiedWidth * 3;
    key.shadow.camera.top = occupiedHeight * 3;
    key.shadow.camera.bottom = -occupiedHeight * 3;
    key.shadow.camera.far = 1200;
    key.shadow.bias = -.0003;
  }
  const analysis = core.analyze(cells);
  const bridgeCount = analysis.horizontal + analysis.vertical;
  let bridgeMesh = bridgeCount && count <= 12000 && currentQuality !== "low" ? new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), bridgeMaterial, bridgeCount) : null;
  if (bridgeMesh) scene.add(bridgeMesh);

  // 逐豆实例布局：5mm 网格，中心对齐原点，颜色写实例缓冲。
  function updateTopology(profile) {
    const frontFused = profile.frontTopology === "fused";
    const backFused = profile.backTopology === "fused";
    if (!frontFused || !backFused) ensureBeadMeshes();
    beadMeshes.forEach((mesh) => { mesh.visible = !frontFused; });
    fusedGroups.front.visible = frontFused;
    fusedGroups.back.visible = backFused;
    fusedGroups.side.visible = frontFused || backFused;
    Object.values(fusedGroups).forEach((group) => { group.scale.y = profile.height; });
  }
  async function buildFusedSurfaces(generation) {
    const stripeHeight = currentQuality === "low" ? 24 : 32;
    for (let row = 0; row < height; row += stripeHeight) {
      if (disposed || generation !== fusedGeneration) return;
      fusedStripe(cells, row, Math.min(height, row + stripeHeight), centerX, centerZ, colorOf, opticalClass, core.tuningFor(settings, settings.profile).meltEdge).forEach(({ face, kind, geometry }) => {
        const mesh = new THREE.Mesh(geometry, fusedMaterials[kind]);
        mesh.castShadow = kind !== "clear";
        fusedGroups[face].add(mesh);
        fusedMeshes.push(mesh);
      });
      invalidate();
      if (height > stripeHeight) {
        onStatus(`正在生成无孔表面 ${Math.round(Math.min(height, row + stripeHeight) / height * 100)}% · 参考模拟`);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    fusedReady = true;
    onStatus(`${finishStatus()} · 表面已就绪`);
    invalidate();
  }
  function rebuildSurfaces() {
    fusedStarted = true;
    fusedGeneration += 1;
    fusedReady = false;
    fusedMeshes.splice(0).forEach((mesh) => { mesh.parent.remove(mesh); mesh.geometry.dispose(); });
    fusedBuildPromise = buildFusedSurfaces(fusedGeneration);
    invalidate();
    return fusedBuildPromise;
  }

  // 融合颈：用局部圆润接触替换明显的长方体连杆。
  function updateBridges(profile) {
    if (!bridgeMesh) return;
    let bridgeIndex = 0;
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        if (!cells[row] || !cells[row][col]) continue;
        if (cells[row][col + 1]) {
          dummy.position.set(col * 5 - centerX + 2.5, profile.height * .78, row * 5 - centerZ);
          dummy.scale.set(Math.max(.06, profile.bridge * 2.9), .18 + profile.bridge * 1.8, Math.max(.06, profile.bridge * 3.2));
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          bridgeMesh.setMatrixAt(bridgeIndex, dummy.matrix);
          bridgeMesh.setColorAt(bridgeIndex, tint.set(colorOf(cells[row][col]) || "#aaaaaa"));
          bridgeIndex += 1;
        }
        if (cells[row + 1] && cells[row + 1][col]) {
          dummy.position.set(col * 5 - centerX, profile.height * .78, row * 5 - centerZ + 2.5);
          dummy.scale.set(Math.max(.06, profile.bridge * 3.2), .18 + profile.bridge * 1.8, Math.max(.06, profile.bridge * 2.9));
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          bridgeMesh.setMatrixAt(bridgeIndex, dummy.matrix);
          bridgeMesh.setColorAt(bridgeIndex, tint.set(colorOf(cells[row][col]) || "#aaaaaa"));
          bridgeIndex += 1;
        }
      }
    }
    bridgeMesh.instanceMatrix.needsUpdate = true;
    if (bridgeMesh.instanceColor) bridgeMesh.instanceColor.needsUpdate = true;
    bridgeMesh.visible = profile.bridge > 0;
  }

  const boardGeometry = new THREE.BoxGeometry(occupiedWidth * 5 + 8, .8, occupiedHeight * 5 + 8);
  const boardMaterial = new THREE.MeshPhysicalMaterial({ color: 0x8e9b94, roughness: .86, metalness: 0 });
  const board = new THREE.Mesh(boardGeometry, boardMaterial);
  board.position.y = -.8;
  board.receiveShadow = true;
  scene.add(board);
  const focusX = (minCol + maxCol) * 2.5 - centerX, focusZ = (minRow + maxRow) * 2.5 - centerZ;
  camera.position.set(focusX + focusWidth * 4, Math.max(focusWidth, focusHeight) * 5, focusZ + focusHeight * 4);
  controls.target.set(focusX, 0, focusZ);
  controls.update();

  // Raycast the entire editable plane, including empty cells.
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const editPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -.5);
  const pick = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const point = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(editPlane, point)) return null;
    const col = Math.floor((point.x + centerX + 2.5) / 5);
    const row = Math.floor((point.z + centerZ + 2.5) / 5);
    return row >= 0 && row < height && col >= 0 && col < width ? { row, col, code: cells[row] && cells[row][col] || null } : null;
  };
  let activePointer = null, longPressTimer = 0, highlightedCode = null;
  function clearPress() {
    clearTimeout(longPressTimer);
    activePointer = null;
    highlightedCode = null;
    invalidate();
  }
  function pointerDown(event) {
    if (event.button != null && event.button !== 0) return;
    const cell = pick(event);
    if (!cell) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    activePointer = { id: event.pointerId, start: cell, last: cell, x: event.clientX, y: event.clientY, drawing: false, held: false };
    if (onPick) onPick(cell);
    if (cell.code) longPressTimer = setTimeout(() => {
      if (!activePointer || activePointer.id !== event.pointerId || activePointer.drawing) return;
      activePointer.held = true;
      highlightedCode = cell.code;
      onStatus(`已高亮所有 ${cell.code} 豆位 · 松开退出`);
      invalidate();
    }, 2000);
  }
  function editStroke(phase, cell) {
    if (onEdit && cell) onEdit(phase, cell);
  }
  function pointerMove(event) {
    if (!activePointer || activePointer.id !== event.pointerId || activePointer.held) return;
    const moved = Math.hypot(event.clientX - activePointer.x, event.clientY - activePointer.y);
    if (moved < 5 && !activePointer.drawing) return;
    clearTimeout(longPressTimer);
    const cell = pick(event);
    if (!cell) return;
    if (!activePointer.drawing) {
      activePointer.drawing = true;
      editStroke("start", activePointer.start);
    }
    if (cell.row !== activePointer.last.row || cell.col !== activePointer.last.col) {
      const from = activePointer.last;
      const steps = Math.max(Math.abs(cell.row - from.row), Math.abs(cell.col - from.col));
      for (let index = 1; index <= steps; index += 1) {
        const row = Math.round(from.row + (cell.row - from.row) * index / steps);
        const col = Math.round(from.col + (cell.col - from.col) * index / steps);
        editStroke("move", { row, col, code: cells[row] && cells[row][col] || null });
      }
      activePointer.last = cell;
    }
  }
  function pointerUp(event) {
    if (!activePointer || activePointer.id !== event.pointerId) return;
    const press = activePointer;
    clearTimeout(longPressTimer);
    if (!press.held) {
      if (!press.drawing) editStroke("start", press.start);
      editStroke("end", press.last);
    }
    clearPress();
  }
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", clearPress);

  let disposed = false, frame = 0, exportCancelled = false;

  // 上下文丢失守卫：浏览器回收 GPU 资源时暂停渲染并提示，恢复后重建渲染循环。
  let contextLost = false;
  const unwatch = support ? support.watchContext(canvas, {
    onLost() { contextLost = true; onStatus("GPU 上下文丢失，已暂停渲染；如长时间未恢复请关闭重开 3D 预览。"); },
    onRestored() { contextLost = false; resize(); onStatus("GPU 上下文已恢复，继续渲染。"); }
  }) : () => {};

  function draw() {
    if (disposed || contextLost) return;
    controls.update();
    renderer.render(scene, camera);
    drawOverlay();
  }
  function drawOverlay(target = overlay, outputWidth, outputHeight) {
    if (!target) return;
    const pixelWidth = outputWidth || Math.max(1, Math.round(canvas.clientWidth));
    const pixelHeight = outputHeight || Math.max(1, Math.round(canvas.clientHeight));
    if (!outputWidth && (target.width !== pixelWidth || target.height !== pixelHeight)) {
      target.width = pixelWidth; target.height = pixelHeight;
    }
    const ctx = target.getContext("2d");
    if (!outputWidth) ctx.clearRect(0, 0, pixelWidth, pixelHeight);
    const guides = getGuides ? getGuides() : [];
    const selected = getSelection ? getSelection() : [];
    if (!settings.showCodes && !settings.showGrid && !highlightedCode && !guides.length && !selected.length) return;
    const project = (x, z) => {
      const surfaceY = camera.position.y < 0 ? -.15 : core.profile(settings.profile).height + .15;
      const v = new THREE.Vector3(x, surfaceY, z).project(camera);
      return { x: (v.x + 1) * pixelWidth / 2, y: (1 - v.y) * pixelHeight / 2, visible: v.z >= -1 && v.z <= 1 };
    };
    const a = project(-centerX, -centerZ);
    const b = project(5 - centerX, -centerZ);
    const c = project(-centerX, 5 - centerZ);
    const density = Math.max(Math.hypot(a.x - b.x, a.y - b.y), Math.hypot(a.x - c.x, a.y - c.y));
    if (density < 5 && !highlightedCode && !guides.length && !selected.length) return;
    const showGrid = settings.showGrid && density >= 7;
    const showCodes = settings.showCodes && density >= 17;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = Math.max(.6, density * .025);
    ctx.strokeStyle = "rgba(21,55,52,.38)";
    ctx.font = `700 ${Math.max(8, Math.min(38, density * (.23 + settings.codeSize / 250)))}px system-ui, sans-serif`;
    let drawn = 0;
    guides.forEach((guide) => {
      const horizontal = guide.orientation === "horizontal";
      const index = Math.max(0, Math.min(horizontal ? height : width, Number(guide.index) || 0));
      const from = horizontal ? project(-centerX - 2.5, index * 5 - centerZ - 2.5) : project(index * 5 - centerX - 2.5, -centerZ - 2.5);
      const to = horizontal ? project((width - 1) * 5 - centerX + 2.5, index * 5 - centerZ - 2.5) : project(index * 5 - centerX - 2.5, (height - 1) * 5 - centerZ + 2.5);
      ctx.save(); ctx.globalAlpha = (Number(guide.opacity) || 80) / 100;
      ctx.strokeStyle = guide.color || "#ff9d38"; ctx.lineWidth = Math.max(1.5, density * .08);
      ctx.setLineDash(guide.style === "solid" ? [] : [Math.max(5, density * .3), Math.max(4, density * .2)]);
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke(); ctx.restore();
    });
    selected.slice(0, 12000).forEach(({ row, col }) => {
      const p = project(col * 5 - centerX, row * 5 - centerZ);
      if (!p.visible) return;
      ctx.fillStyle = "rgba(52,175,159,.42)";
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(3, density * .38), 0, Math.PI * 2); ctx.fill();
    });
    for (let row = 0; row < height; row += 1) for (let col = 0; col < width; col += 1) {
      const code = cells[row] && cells[row][col];
      if (!code && !showGrid) continue;
      const x = col * 5 - centerX, z = row * 5 - centerZ;
      const p = project(x, z);
      if (!p.visible || p.x < -density || p.y < -density || p.x > pixelWidth + density || p.y > pixelHeight + density) continue;
      if (++drawn > 12000) return;
      if (highlightedCode && code === highlightedCode) {
        ctx.fillStyle = "rgba(255,231,84,.64)";
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(3, density * .42), 0, Math.PI * 2); ctx.fill();
      }
      if (showGrid) {
        const corners = [[-2.5,-2.5],[2.5,-2.5],[2.5,2.5],[-2.5,2.5]].map(([dx,dz]) => project(x+dx,z+dz));
        ctx.beginPath(); ctx.moveTo(corners[0].x,corners[0].y);
        corners.slice(1).forEach((corner) => ctx.lineTo(corner.x,corner.y));
        ctx.closePath(); ctx.stroke();
      }
      if (showCodes && code) {
        ctx.globalAlpha = settings.codeOpacity / 100;
        ctx.lineWidth = Math.max(1.5, density * .07);
        ctx.strokeStyle = "rgba(255,255,255,.92)";
        ctx.strokeText(code, p.x, p.y);
        ctx.fillStyle = "#18332e"; ctx.fillText(code, p.x, p.y);
        ctx.globalAlpha = 1;
      }
    }
  }
  function invalidate() {
    if (disposed || frame) return;
    frame = requestAnimationFrame((now) => { frame = 0; monitorFrame(now); draw(); });
  }
  controls.addEventListener("change", invalidate);

  // 运行时性能监测：2 秒采样窗口，帧率持续偏低时自动降档（只降不升，避免抖动）。
  let sampleStart = 0, sampleFrames = 0, lastFrame = 0, degraded = false;
  function monitorFrame(now) {
    if (lastFrame && now - lastFrame > 120) { sampleStart = now; sampleFrames = 0; }
    lastFrame = now;
    if (sampleStart) {
      sampleFrames += 1;
      if (now - sampleStart >= 2000) {
        const fps = sampleFrames / ((now - sampleStart) / 1000);
        if (fps < 24 && !degraded && currentQuality !== "low") {
          currentQuality = currentQuality === "high" ? "medium" : "low";
          degraded = true;
          applyQuality(currentQuality);
          onStatus(`检测到卡顿，已自动降到${currentQuality === "medium" ? "中" : "低"}精度。`);
        }
        sampleStart = now;
        sampleFrames = 0;
      }
    } else {
      sampleStart = now;
      sampleFrames = 0;
    }
  }

  function applyQuality(level) {
    const next = core.profile(settings.profile);
    beadMeshes.forEach((mesh) => { mesh.geometry.dispose(); mesh.geometry = beadGeometry(next, segmentsFor(level)); });
    if (bridgeMesh) bridgeMesh.visible = level !== "low" && next.bridge > 0 && next.frontTopology === "beads";
    invalidate();
  }

  function resize() {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width)), h = Math.max(1, Math.floor(rect.height));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    invalidate();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  function setProfile(id) {
    const next = core.profile(id);
    settings.profile = next.id;
    updateTopology(next);
    beadMeshes.forEach((mesh) => { mesh.geometry.dispose(); mesh.geometry = beadGeometry(next, segmentsFor(currentQuality)); });
    const previousMaps = maps;
    const tuning = core.tuningFor(settings, next.id);
    maps = surfaceMaps(next, tuning.textureOpacity / 100);
    const opaque = beadMaterials.opaque;
    const woven = ["towel", "bath", "waffle", "fabric", "ribbed"].includes(next.texture);
    opaque.map = woven ? maps.fibers : null;
    opaque.normalMap = maps.normal;
    opaque.roughnessMap = maps.roughness;
    const textureStrength = {
      towel: .82, bath: .72, waffle: .65, fabric: .58, ribbed: .55
    }[next.texture] || (next.texture ? .28 : .07);
    opaque.normalScale.set(textureStrength * tuning.textureOpacity / 75 * (.55 + tuning.textureRoughness / 100), textureStrength * tuning.textureOpacity / 75 * (.55 + tuning.textureRoughness / 100));
    opaque.roughness = Math.max(.08, Math.min(.98, next.roughness + (tuning.textureRoughness - 50) / 170));
    opaque.clearcoat = next.glitter ? .38 : next.iridescence ? .45 : .18;
    opaque.metalness = next.glitter ? .5 : 0;
    opaque.metalnessMap = next.glitter ? maps.flakes : null;
    opaque.emissive.setHex(next.glitter ? 0xffffff : 0x000000);
    opaque.emissiveMap = next.glitter ? maps.flakes : null;
    opaque.emissiveIntensity = next.glitter ? .22 * tuning.textureOpacity / 75 : 0;
    opaque.iridescence = next.iridescence ? .85 : 0;
    opaque.iridescenceIOR = 1.25;
    opaque.iridescenceThicknessRange = [100, 280];
    opaque.needsUpdate = true;
    const fusedOpaque = fusedMaterials.opaque;
    fusedOpaque.map = opaque.map;
    fusedOpaque.normalMap = maps.normal;
    fusedOpaque.roughnessMap = maps.roughness;
    fusedOpaque.normalScale.copy(opaque.normalScale);
    fusedOpaque.roughness = opaque.roughness;
    fusedOpaque.clearcoat = opaque.clearcoat;
    fusedOpaque.metalness = opaque.metalness;
    fusedOpaque.metalnessMap = opaque.metalnessMap;
    fusedOpaque.emissive.copy(opaque.emissive);
    fusedOpaque.emissiveMap = opaque.emissiveMap;
    fusedOpaque.emissiveIntensity = opaque.emissiveIntensity;
    fusedOpaque.iridescence = opaque.iridescence;
    fusedOpaque.needsUpdate = true;
    for (const kind of ["translucent", "clear"]) {
      const material = beadMaterials[kind];
      material.roughness = kind === "clear" ? Math.max(.10, next.roughness * .45) : Math.max(.22, next.roughness * .72);
      material.iridescence = next.iridescence ? .35 : 0;
      material.needsUpdate = true;
      const fusedMaterial = fusedMaterials[kind];
      fusedMaterial.roughness = material.roughness;
      fusedMaterial.iridescence = material.iridescence;
      fusedMaterial.needsUpdate = true;
    }
    Object.values(previousMaps).forEach((map) => map.dispose());
    updateBridges(next);
    if (bridgeMesh) bridgeMesh.visible = next.frontTopology === "beads" && next.bridge > 0;
    if (fusedStarted) rebuildSurfaces();
    onStatus(finishStatus());
    invalidate();
  }
  function setOverlay(next) {
    for (const key of ["showCodes", "showGrid", "codeOpacity", "codeSize"]) settings[key] = next[key];
    invalidate();
  }
  function snapshot() {
    draw();
    const output = document.createElement("canvas");
    output.width = canvas.width; output.height = canvas.height;
    const ctx = output.getContext("2d");
    ctx.drawImage(canvas, 0, 0);
    if (overlay) ctx.drawImage(overlay, 0, 0, output.width, output.height);
    return output.toDataURL("image/png");
  }
  function moveCamera(action) {
    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    if (action === "rotate-left") spherical.theta -= Math.PI / 12;
    if (action === "rotate-right") spherical.theta += Math.PI / 12;
    if (action === "tilt-up") spherical.phi = Math.max(.15, spherical.phi - Math.PI / 18);
    if (action === "tilt-down") spherical.phi = Math.min(Math.PI - .15, spherical.phi + Math.PI / 18);
    if (action === "zoom-in") spherical.radius = Math.max(10, spherical.radius * .78);
    if (action === "zoom-out") spherical.radius = Math.min(controls.maxDistance, spherical.radius * 1.28);
    camera.position.copy(new THREE.Vector3().setFromSpherical(spherical).add(controls.target));
    camera.lookAt(controls.target);
    invalidate();
  }
  function updatePattern(next) {
    if (!next || next.width !== width || next.height !== height) return;
    cells = next.cells;
    count = core.analyze(cells).count;
    beadMeshes.splice(0).forEach((mesh) => { scene.remove(mesh); mesh.geometry.dispose(); });
    regroup();
    updateTopology(core.profile(settings.profile));
    if (bridgeMesh) { scene.remove(bridgeMesh); bridgeMesh.geometry.dispose(); bridgeMesh = null; }
    const adjacent = core.analyze(cells);
    const totalBridges = adjacent.horizontal + adjacent.vertical;
    if (totalBridges && count <= 12000 && currentQuality !== "low") {
      bridgeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), bridgeMaterial, totalBridges);
      scene.add(bridgeMesh);
      updateBridges(core.profile(settings.profile));
    }
    rebuildSurfaces();
    invalidate();
  }
  function setTuning(tuning) {
    settings.profileTuning = { ...(settings.profileTuning || {}), [settings.profile]: { ...tuning } };
    setProfile(settings.profile);
  }
  function setExposure(value) {
    renderer.toneMappingExposure = value;
    invalidate();
  }
  function setLighting(intensity, temperature) {
    const level = Math.max(.5, Math.min(1.6, Number(intensity) || 1));
    key.intensity = 1 * level;
    fill.intensity = .3 * level;
    ambient.intensity = .52 * level;
    key.color.setHex(temperature === "warm" ? 0xffe5c5 : temperature === "cool" ? 0xdceaff : 0xffffff);
    fill.color.setHex(temperature === "warm" ? 0xfff3df : temperature === "cool" ? 0xe5f1ff : 0xffffff);
    invalidate();
  }
  function setBackground(value) {
    scene.background = value === "transparent" ? null : new THREE.Color(value === "dark" ? 0x1d2626 : 0xe6e9e5);
    boardMaterial.color.setHex(value === "dark" ? 0x303c39 : 0x8e9b94);
    invalidate();
  }
  function view(side) {
    board.visible = side !== "back";
    const reach = Math.max(focusWidth, focusHeight) * 11.5;
    camera.position.set(controls.target.x + (side === "angle" ? reach * .75 : 0), side === "back" ? -reach : side === "angle" ? reach * .85 : reach, controls.target.z + (side === "angle" ? reach * .7 : 1));
    camera.lookAt(controls.target);
    controls.update();
    invalidate();
  }
  function cancelExport() {
    exportCancelled = true;
  }

  // 4K 分块导出：分块尺寸适配设备纹理上限，输出始终保持请求尺寸。
  async function exportPng({ size = 4096, onProgress } = {}) {
    exportCancelled = false;
    if (!fusedReady && settings.profile !== "raw" && settings.profile !== "light") await fusedBuildPromise;
    const maxTexture = renderer.capabilities ? renderer.capabilities.maxTextureSize : 4096;
    const targetSize = size;
    const output = document.createElement("canvas");
    output.width = targetSize;
    output.height = targetSize;
    const ctx = output.getContext("2d");
    const before = { aspect: camera.aspect };
    const tile = Math.max(1, Math.min(1024, maxTexture || 1024));
    try {
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      renderer.setSize(tile, tile, false);
      for (let y = 0; y < targetSize; y += tile) {
        for (let x = 0; x < targetSize; x += tile) {
          if (exportCancelled) throw new Error("导出已取消");
          if (contextLost) throw new Error("GPU 上下文已丢失，无法导出；请恢复后重试");
          const w = Math.min(tile, targetSize - x), h = Math.min(tile, targetSize - y);
          camera.setViewOffset(targetSize, targetSize, x, y, w, h);
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
          renderer.render(scene, camera);
          ctx.drawImage(canvas, 0, 0, w, h, x, y, w, h);
          if (onProgress) onProgress(Math.round(((y / tile) * Math.ceil(targetSize / tile) + x / tile + 1) / Math.ceil(targetSize / tile) ** 2 * 100));
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
      drawOverlay(output, targetSize, targetSize);
      return await new Promise((resolve, reject) => output.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG 编码失败"))), "image/png"));
    } finally {
      camera.clearViewOffset();
      camera.aspect = before.aspect;
      camera.updateProjectionMatrix();
      resize();
      onStatus("预览已恢复");
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelExport();
    unwatch();
    observer.disconnect();
    canvas.removeEventListener("pointerdown", pointerDown);
    canvas.removeEventListener("pointermove", pointerMove);
    canvas.removeEventListener("pointerup", pointerUp);
    canvas.removeEventListener("pointercancel", clearPress);
    clearPress();
    controls.dispose();
    beadMeshes.forEach((mesh) => mesh.geometry.dispose());
    fusedMeshes.forEach((mesh) => mesh.geometry.dispose());
    Object.values(beadMaterials).forEach((material) => material.dispose());
    Object.values(fusedMaterials).forEach((material) => material.dispose());
    Object.values(maps).forEach((map) => map.dispose());
    if (bridgeMesh) bridgeMesh.geometry.dispose();
    bridgeMaterial.dispose();
    boardGeometry.dispose();
    boardMaterial.dispose();
    envMap.dispose();
    pmrem.dispose();
    environment.dispose();
    renderer.dispose();
  }

  setProfile(settings.profile);
  setLighting(settings.lightIntensity, settings.lightTemperature);
  rebuildSurfaces();
  setBackground(settings.background);
  view(settings.side);
  onStatus(`${count.toLocaleString()} 颗 · ${currentQuality} 精度 · ${memory.suggestLowDetail ? "弱设备模式 · " : ""}未实物标定参考模型`);
  return { setProfile, setTuning, setOverlay, moveCamera, updatePattern, snapshot, setExposure, setLighting, setBackground, view, exportPng, cancelExport, dispose, draw, getQuality: () => currentQuality };
}

export { create };
