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
function surfaceMaps(profile) {
  const size = 128;
  const normals = new Uint8Array(size * size * 4);
  const roughness = new Uint8Array(size * size * 4);
  const flakes = new Uint8Array(size * size * 4);
  const heightAt = (x, y) => {
    const grain = Math.sin(x * 37.7 + y * 19.3) * Math.sin(y * 43.1 - x * 13.7);
    if (profile.texture === "towel") return grain * .42 + Math.sin(y * .88 + Math.sin(x * .22)) * .16;
    if (profile.texture === "bath") return grain * .28 + Math.sin(x * .39 + y * .31) * Math.sin(x * .31 - y * .39) * .38;
    if (profile.texture === "waffle") return Math.cos(x * Math.PI / 12) * .35 + Math.cos(y * Math.PI / 12) * .35;
    return grain * .08;
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
    const flake = profile.glitter && noise > 249 ? 255 : 0;
    flakes[i] = flakes[i + 1] = flakes[i + 2] = flake; flakes[i + 3] = 255;
  }
  const texture = (data) => {
    const map = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.needsUpdate = true;
    return map;
  };
  return { normal: texture(normals), roughness: texture(roughness), flakes: texture(flakes) };
}

function create({ canvas, pattern, colorOf, settings, onPick, onStatus }) {
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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = settings.exposure;
  renderer.shadowMap.enabled = false;
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(environment).texture;
  scene.environment = envMap;
  scene.background = settings.background === "transparent" ? null : new THREE.Color(0xe6e9e5);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = .10;
  controls.minDistance = 10;
  controls.maxDistance = Math.max(pattern.width, pattern.height) * 12 + 80;
  const ambient = new THREE.HemisphereLight(0xffffff, 0x6e7f78, .62);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff4e7, 1.35);
  key.position.set(-110, 180, 130);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd5e9f6, .38);
  fill.position.set(130, 90, -70);
  scene.add(fill);

  const width = pattern.width, height = pattern.height, cells = pattern.cells;
  let minCol = width, maxCol = -1, minRow = height, maxRow = -1;
  for (let row = 0; row < height; row += 1) for (let col = 0; col < width; col += 1) {
    if (!cells[row] || !cells[row][col]) continue;
    minCol = Math.min(minCol, col); maxCol = Math.max(maxCol, col);
    minRow = Math.min(minRow, row); maxRow = Math.max(maxRow, row);
  }
  const occupiedWidth = Math.max(1, maxCol - minCol + 1);
  const occupiedHeight = Math.max(1, maxRow - minRow + 1);
  const centerX = (minCol + maxCol) * 2.5, centerZ = (minRow + maxRow) * 2.5;
  const count = core.analyze(cells).count;
  // LOD：图纸规模 → 基础档位；弱设备（低内存/少核心）再降一档。
  const memory = support ? support.memoryBudget() : { suggestLowDetail: false };
  let currentQuality = core.lod(count, canvas.clientWidth);
  if (memory.suggestLowDetail && currentQuality === "high") currentQuality = "medium";
  const segmentsFor = (level) => (level === "high" ? 24 : level === "medium" ? 12 : 8);

  let maps = surfaceMaps(core.profile(settings.profile));
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
  const groups = { opaque: [], translucent: [], clear: [] };
  for (let row = 0; row < height; row += 1) for (let col = 0; col < width; col += 1) {
    const code = cells[row] && cells[row][col];
    if (code) groups[opticalClass(code)].push({ row, col, code });
  }
  const beadMeshes = Object.entries(groups).filter(([, positions]) => positions.length).map(([kind, positions]) => {
    const mesh = new THREE.InstancedMesh(beadGeometry(core.profile(settings.profile), segmentsFor(currentQuality)), beadMaterials[kind], positions.length);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    mesh.userData.positions = positions;
    mesh.castShadow = kind !== "clear";
    scene.add(mesh);
    return mesh;
  });
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
  const bridgeMesh = bridgeCount && count <= 12000 && currentQuality !== "low" ? new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), bridgeMaterial, bridgeCount) : null;
  if (bridgeMesh) scene.add(bridgeMesh);

  // 逐豆实例布局：5mm 网格，中心对齐原点，颜色写实例缓冲。
  const dummy = new THREE.Object3D(), tint = new THREE.Color();
  beadMeshes.forEach((mesh) => {
    mesh.userData.positions.forEach(({ row, col, code }, index) => {
      dummy.position.set(col * 5 - centerX, 0, row * 5 - centerZ);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, tint.set(colorOf(code) || "#aaaaaa"));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

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
  camera.position.set(occupiedWidth * 4, Math.max(occupiedWidth, occupiedHeight) * 5, occupiedHeight * 4);
  controls.target.set(0, 0, 0);
  controls.update();

  // 双击拾取：射线检测实例网格，回调行/列/色号。
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const pick = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(beadMeshes, false)[0];
    if (hit && hit.instanceId != null && onPick) onPick(hit.object.userData.positions[hit.instanceId]);
  };
  canvas.addEventListener("dblclick", pick);

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
    if (bridgeMesh) bridgeMesh.visible = level !== "low" && next.bridge > 0;
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
    beadMeshes.forEach((mesh) => { mesh.geometry.dispose(); mesh.geometry = beadGeometry(next, segmentsFor(currentQuality)); });
    const previousMaps = maps;
    maps = surfaceMaps(next);
    const opaque = beadMaterials.opaque;
    opaque.normalMap = maps.normal;
    opaque.roughnessMap = maps.roughness;
    opaque.normalScale.set(next.texture === "waffle" ? .24 : next.texture ? .18 : .07, next.texture === "waffle" ? .24 : next.texture ? .18 : .07);
    opaque.roughness = next.roughness;
    opaque.clearcoat = next.glitter ? .38 : next.iridescence ? .45 : .18;
    opaque.metalness = next.glitter ? .5 : 0;
    opaque.metalnessMap = next.glitter ? maps.flakes : null;
    opaque.iridescence = next.iridescence ? .85 : 0;
    opaque.iridescenceIOR = 1.25;
    opaque.iridescenceThicknessRange = [100, 280];
    opaque.needsUpdate = true;
    for (const kind of ["translucent", "clear"]) {
      const material = beadMaterials[kind];
      material.roughness = kind === "clear" ? Math.max(.10, next.roughness * .45) : Math.max(.22, next.roughness * .72);
      material.iridescence = next.iridescence ? .35 : 0;
      material.needsUpdate = true;
    }
    Object.values(previousMaps).forEach((map) => map.dispose());
    updateBridges(next);
    invalidate();
  }
  function setExposure(value) {
    renderer.toneMappingExposure = value;
    invalidate();
  }
  function setBackground(value) {
    scene.background = value === "transparent" ? null : new THREE.Color(value === "dark" ? 0x1d2626 : 0xe6e9e5);
    boardMaterial.color.setHex(value === "dark" ? 0x303c39 : 0x8e9b94);
    invalidate();
  }
  function view(side) {
    board.visible = side !== "back";
    const reach = Math.max(occupiedWidth, occupiedHeight) * 11.5;
    camera.position.set(side === "angle" ? reach * .75 : 0, side === "back" ? -reach : side === "angle" ? reach * .85 : reach, side === "angle" ? reach * .7 : 1);
    camera.lookAt(0, 0, 0);
    controls.update();
    invalidate();
  }
  function cancelExport() {
    exportCancelled = true;
  }

  // 4K 分块导出：分块尺寸适配设备纹理上限，输出始终保持请求尺寸。
  async function exportPng({ size = 4096, onProgress } = {}) {
    exportCancelled = false;
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
    canvas.removeEventListener("dblclick", pick);
    controls.dispose();
    beadMeshes.forEach((mesh) => mesh.geometry.dispose());
    Object.values(beadMaterials).forEach((material) => material.dispose());
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
  setBackground(settings.background);
  view(settings.side);
  onStatus(`${count.toLocaleString()} 颗 · ${currentQuality} 精度 · ${memory.suggestLowDetail ? "弱设备模式 · " : ""}未实物标定参考模型`);
  return { setProfile, setExposure, setBackground, view, exportPng, cancelExport, dispose, draw, getQuality: () => currentQuality };
}

export { create };
