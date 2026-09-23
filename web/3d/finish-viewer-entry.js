import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// 参数化豆体：车削轮廓由烫法档案驱动（外径=豆径+摊开量，内径=孔径占比）。
function beadGeometry(profile, segments) {
  const outer = 2.33 + profile.spread;
  const inner = Math.max(.05, outer * profile.hole);
  const h = profile.height;
  const points = [
    [inner, 0], [outer - .15, 0], [outer, .12], [outer, h - .20],
    [outer - .18, h], [inner + .12, h], [inner, h - .10], [inner, .12]
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(points, segments);
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
  const ambient = new THREE.HemisphereLight(0xffffff, 0x6e7f78, 2.1);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff4e7, 3.2);
  key.position.set(-110, 180, 130);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd5e9f6, 1.7);
  fill.position.set(130, 90, -70);
  scene.add(fill);

  const width = pattern.width, height = pattern.height, cells = pattern.cells;
  const centerX = (width - 1) * 2.5, centerZ = (height - 1) * 2.5;
  const count = core.analyze(cells).count;
  // LOD：图纸规模 → 基础档位；弱设备（低内存/少核心）再降一档。
  const memory = support ? support.memoryBudget() : { suggestLowDetail: false };
  let currentQuality = core.lod(count, canvas.clientWidth);
  if (memory.suggestLowDetail && currentQuality === "high") currentQuality = "medium";
  const segmentsFor = (level) => (level === "high" ? 24 : level === "medium" ? 12 : 8);

  const beadMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .4, envMapIntensity: .7, clearcoat: .22, clearcoatRoughness: .45, iridescence: 0 });
  const bridgeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .52, envMapIntensity: .48, vertexColors: false });
  const beadMesh = new THREE.InstancedMesh(beadGeometry(core.profile(settings.profile), segmentsFor(currentQuality)), beadMaterial, count);
  beadMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  beadMesh.userData.positions = [];
  scene.add(beadMesh);
  const analysis = core.analyze(cells);
  const bridgeCount = analysis.horizontal + analysis.vertical;
  const bridgeMesh = bridgeCount && currentQuality !== "low" ? new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bridgeMaterial, bridgeCount) : null;
  if (bridgeMesh) scene.add(bridgeMesh);

  // 逐豆实例布局：5mm 网格，中心对齐原点，颜色写实例缓冲。
  const dummy = new THREE.Object3D(), tint = new THREE.Color();
  let index = 0;
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const code = cells[row] && cells[row][col];
      if (!code) continue;
      dummy.position.set(col * 5 - centerX, 0, row * 5 - centerZ);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      beadMesh.setMatrixAt(index, dummy.matrix);
      beadMesh.setColorAt(index, tint.set(colorOf(code) || "#aaaaaa"));
      beadMesh.userData.positions.push({ row, col, code });
      index += 1;
    }
  }
  beadMesh.instanceMatrix.needsUpdate = true;
  if (beadMesh.instanceColor) beadMesh.instanceColor.needsUpdate = true;

  // 连接桥：相邻豆之间按烫法 bridge 强度放置小方条，融合度越高越明显。
  function updateBridges(profile) {
    if (!bridgeMesh) return;
    let bridgeIndex = 0;
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        if (!cells[row] || !cells[row][col]) continue;
        if (cells[row][col + 1]) {
          dummy.position.set(col * 5 - centerX + 2.5, profile.height * .82, row * 5 - centerZ);
          dummy.scale.set(Math.max(.03, profile.bridge * 10), .22, Math.max(.05, profile.bridge * 12));
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          bridgeMesh.setMatrixAt(bridgeIndex, dummy.matrix);
          bridgeMesh.setColorAt(bridgeIndex, tint.set(colorOf(cells[row][col]) || "#aaaaaa"));
          bridgeIndex += 1;
        }
        if (cells[row + 1] && cells[row + 1][col]) {
          dummy.position.set(col * 5 - centerX, profile.height * .82, row * 5 - centerZ + 2.5);
          dummy.scale.set(Math.max(.05, profile.bridge * 12), .22, Math.max(.03, profile.bridge * 10));
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

  const boardGeometry = new THREE.BoxGeometry(width * 5 + 5, .8, height * 5 + 5);
  const boardMaterial = new THREE.MeshPhysicalMaterial({ color: 0xe9e5da, roughness: .79, metalness: 0 });
  const board = new THREE.Mesh(boardGeometry, boardMaterial);
  board.position.y = -.8;
  scene.add(board);
  camera.position.set(width * 4, Math.max(width, height) * 5, height * 4);
  controls.target.set(0, 0, 0);
  controls.update();

  // 双击拾取：射线检测实例网格，回调行/列/色号。
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const pick = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(beadMesh, false)[0];
    if (hit && hit.instanceId != null && onPick) onPick(beadMesh.userData.positions[hit.instanceId]);
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
  let sampleStart = 0, sampleFrames = 0, degraded = false;
  function monitorFrame(now) {
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
    beadMesh.geometry.dispose();
    beadMesh.geometry = beadGeometry(next, segmentsFor(level));
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
    beadMesh.geometry.dispose();
    beadMesh.geometry = beadGeometry(next, segmentsFor(currentQuality));
    beadMaterial.roughness = next.roughness;
    beadMaterial.clearcoat = next.glitter ? .58 : .22;
    beadMaterial.iridescence = next.iridescence ? 1 : 0;
    beadMaterial.iridescenceIOR = 1.28;
    beadMaterial.needsUpdate = true;
    updateBridges(next);
    invalidate();
  }
  function setExposure(value) {
    renderer.toneMappingExposure = value;
    invalidate();
  }
  function setBackground(value) {
    scene.background = value === "transparent" ? null : new THREE.Color(0xe6e9e5);
    invalidate();
  }
  function view(side) {
    board.visible = side !== "back";
    camera.position.set(0, side === "back" ? -Math.max(width, height) * 5 : Math.max(width, height) * 5, 1);
    camera.lookAt(0, 0, 0);
    controls.update();
    invalidate();
  }
  function cancelExport() {
    exportCancelled = true;
  }

  // 4K 分块导出：设备纹理上限不足时自动降到上限；上下文丢失时安全失败。
  async function exportPng({ size = 4096, onProgress } = {}) {
    exportCancelled = false;
    const maxTexture = renderer.capabilities ? renderer.capabilities.maxTextureSize : 4096;
    let targetSize = size;
    if (maxTexture && size > maxTexture) {
      targetSize = Math.floor(maxTexture / 2) * 2;
      onStatus(`设备支持上限 ${maxTexture}px，已自动调整导出尺寸。`);
    }
    const output = document.createElement("canvas");
    output.width = targetSize;
    output.height = targetSize;
    const ctx = output.getContext("2d");
    const before = { aspect: camera.aspect };
    const tile = 1024;
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
    beadMesh.geometry.dispose();
    beadMaterial.dispose();
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
  onStatus(`${count.toLocaleString()} 颗 · ${currentQuality} 精度 · ${memory.suggestLowDetail ? "弱设备模式 · " : ""}未标定通用模型`);
  return { setProfile, setExposure, setBackground, view, exportPng, cancelExport, dispose, draw, getQuality: () => currentQuality };
}

export { create };
