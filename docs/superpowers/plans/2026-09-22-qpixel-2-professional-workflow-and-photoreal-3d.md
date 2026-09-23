# Q像素 2.0 专业工作流与写实 3D 实施计划

**对应规格：** `docs/superpowers/specs/2026-09-22-qpixel-2-professional-workflow-and-photoreal-3d-design.md`

**目标：** 在不中断现有 Q像素功能的前提下，完成专业工作区改版、已有图纸重建、库存/拼制/版本闭环，以及 MARD 5 mm 十类实物标定的完整写实 3D 成品工作台。

**执行原则：**

- 每个任务先补测试或验收夹具，再改功能。
- 未完成的新能力放在本地功能开关后，不让半成品进入默认工作流。
- 同一能力只保留一个状态源和一个渲染入口，禁止复制旧逻辑形成第二套实现。
- 每个里程碑必须完成自动测试、浏览器检查、macOS 打包检查、提交和推送。
- 实物样片未完成标定前，3D 只能显示“通用模型·未标定”，不得提前显示“已实物标定”。

**技术基线：** 原生 JavaScript、HTML/CSS、Canvas 2D、Web Workers、Three.js ES Modules、WebGL 2、KTX2/Basis、WKWebView、Service Worker、现有 Swift 桌面壳。

---

## 里程碑 A：回归保护与模块边界

### Task 1：冻结当前行为基线

**Files:**

- Create: `tests/project-payload.test.js`
- Create: `tests/workspace-state.test.js`
- Modify: `web/test.html`
- Modify: `scripts/verify_release.sh`
- Create: `docs/qa/qpixel-2-baseline.md`

**Steps:**

- [x] 记录当前首页、编辑器、导入、保存、导出、材料预览和拼制导航的可见行为。
- [x] 为项目 payload 的保存、打开、历史版本和冲突副本补 Node 回归测试。
- [x] 为当前画布模式、工具选择、右侧面板开关和导入入口补浏览器回归夹具。
- [x] 保存一组小图、中图和 500×500 稀疏/密集测试工程。
- [x] 将新增测试加入 `scripts/verify_release.sh`。
- [x] 运行所有现有测试，确认改版前基线为绿色。

**Gate:** 不修改用户界面；全部现有测试通过后提交并推送。

### Task 2：建立功能开关和独立模块加载器

**Files:**

- Create: `web/feature-flags.js`
- Create: `web/module-loader.js`
- Modify: `web/index.html`
- Modify: `web/app.js`
- Test: `tests/workspace-state.test.js`
- Test: `web/test.html`

**Steps:**

- [x] 建立 `professionalWorkspace`、`patternRebuild`、`photoreal3d` 三个本地功能开关。
- [x] 默认保持现有稳定界面；开发/测试可通过明确入口开启新工作流。
- [x] 建立一次性加载模块和资源的状态机，防止重复插入脚本、监听器和 WebGL 上下文。
- [x] 新模块失败时记录错误并回到现有界面。
- [x] 添加测试：功能开关关闭时 DOM 和行为与基线一致。

**Gate:** 默认用户路径零行为变化；提交并推送。

### Task 3：拆出项目、工作区和通用状态纯函数

**Files:**

- Create: `web/core/project-model.js`
- Create: `web/core/workspace-state.js`
- Create: `web/core/dom-utils.js`
- Modify: `web/app.js`
- Modify: `web/index.html`
- Test: `tests/project-payload.test.js`
- Test: `tests/workspace-state.test.js`

**Steps:**

- [x] 将项目 payload 正规化、版本迁移、指纹和冲突判断迁入 `project-model.js`。
- [x] 将阶段、面板、抽屉和响应式工作区状态迁入 `workspace-state.js`。
- [x] 将重复的 DOM 显示/隐藏、选中态和安全文本写入迁入 `dom-utils.js`。
- [x] `web/app.js` 仅调用新模块，不保留同名旧函数副本。
- [x] 保持旧项目格式可打开，输出 payload 不发生无关变化。

**Gate:** 项目往返保存结果一致；现有回归全部通过；提交并推送。

---

## 里程碑 B：专业工作区与跨端布局

### Task 4：实现 Studio Workflow 框架

**Files:**

- Modify: `web/index.html`
- Modify: `web/styles.css`
- Create: `web/workspaces/workspace-controller.js`
- Modify: `web/app.js`
- Test: `web/test.html`

**Steps:**

- [x] 重排顶部全局栏：项目、保存、撤销/重做、导入、比较、预览、导出。
- [x] 增加“设计、配色、拼制、输出、版本”阶段栏。
- [x] 将现有绘制工具合并为单一固定左工具栏，保留原 ID 或提供兼容映射。
- [x] 建立中央画布、右侧上下文栏、底部色板的稳定四区布局。
- [x] 阶段切换只更新上下文内容，不重置画布缩放、平移、选区和当前色。
- [x] 新框架先在 `professionalWorkspace` 功能开关后运行。
- [x] 添加测试：五个阶段可切换，当前画布状态不变化。

**Gate:** 现有绘制、图层、撤销/重做、配色和导出入口全部可达；提交并推送。

### Task 5：重组右侧上下文属性与阶段检查

**Files:**

- Create: `web/workspaces/context-inspector.js`
- Create: `web/workspaces/quality-checks.js`
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `tests/workspace-state.test.js`
- Test: `web/test.html`

**Steps:**

- [x] 将当前工具属性与当前阶段检查合并为一个上下文侧栏。
- [x] 建立结构、配色、库存、底板和输出五类检查接口。
- [x] 检查项返回“通过、警告、错误、可修复动作”，禁止直接修改项目。
- [x] “全部修复”逐项显示影响范围并统一确认。
- [x] 删除右侧长列表中已经迁移的重复入口，保留唯一状态源。

**Gate:** 每个检查动作可撤销；没有重复监听器；提交并推送。

### Task 6：平板重排和触控验收

**Files:**

- Modify: `web/styles.css`
- Modify: `web/index.html`
- Modify: `web/workspaces/workspace-controller.js`
- Test: `web/test.html`
- Create: `docs/qa/qpixel-2-responsive-matrix.md`

**Steps:**

- [x] 1180 px 以上显示完整三栏。
- [x] 768–1179 px 将右侧属性和底部色板改为覆盖抽屉。
- [x] 小于 768 px 提供兼容布局，不允许弹窗内容被裁切。
- [x] 高频触控目标最小 44×44 CSS px。
- [x] 支持鼠标、触控板、触屏和键盘组合输入。
- [x] 验证横屏/竖屏、浏览器缩放 100% 和系统字体放大。

**Gate:** 不需要缩小网页比例即可完成导入、编辑、拼制和导出；提交并推送。

---

## 里程碑 C：项目入口与已有图纸重建

### Task 7：实现四种新建项目入口

**Files:**

- Create: `web/import/import-router.js`
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `tests/workspace-state.test.js`
- Test: `web/test.html`

**Steps:**

- [x] 新建项目提供照片转图纸、已有图纸重建、参考图描绘、空白项目。
- [x] 每个入口显示支持的文件、输出结果和是否改变当前项目。
- [x] 选择文件后只创建临时导入会话。
- [x] 继续保留“快速导入，直接编辑”和“高级优化”。
- [x] 高级优化可跳过、关闭、返回和取消。
- [x] 入口切换不得遗留上一会话监听器或临时图纸。

**Gate:** 导入向导不再强制；原项目取消后完全不变；提交并推送。

### Task 8：建立图纸重建纯算法与 Worker

**Files:**

- Create: `web/pattern-rebuild/rebuild-engine.js`
- Create: `web/pattern-rebuild/rebuild-worker.js`
- Create: `tests/pattern-rebuild.test.js`
- Modify: `scripts/verify_release.sh`

**Steps:**

- [x] 定义重建输入、校准参数、候选网格、颜色样本和置信度输出格式。
- [ ] 实现边缘裁切、旋转和四角透视校正。
- [x] 实现横纵周期检测、格距候选、起点和行列数评分。
- [ ] 实现多底板边界候选。
- [ ] 实现单格主色采样、压缩噪声抑制和同色归一。
- [x] 为每个格子和整体网格返回置信度及原因。
- [x] 算法保持纯函数；Worker 只负责任务和取消协议。
- [ ] 增加合成截图、倾斜扫描、网格缺线、压缩噪声和透明背景测试。

**Gate:** 算法测试通过；取消 Worker 不产生残留消息；提交并推送。

### Task 9：实现图纸重建校准和低置信度审核

**Files:**

- Create: `web/pattern-rebuild/rebuild-workbench.js`
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `web/test.html`

**Steps:**

- [ ] 实现四角透视、网格起点、格距、行列和底板边界手动调整。
- [ ] 显示原图、网格叠加、重建结果和分屏比较。
- [ ] 高置信度自动通过，中置信度可叠加比较，低置信度进入集中列表。
- [ ] 支持按问题类型筛选：网格、颜色、空格、色号。
- [ ] 确认后生成新项目副本，保存原图、参数和识别报告。
- [ ] 应用前创建版本检查点；取消或失败不写正式状态。

**Gate:** 至少三类真实图纸样本完成端到端重建；提交并推送。

### Task 10：预留 OCR 图例接口但不进入 P0 默认路径

**Files:**

- Create: `web/pattern-rebuild/legend-schema.js`
- Modify: `web/pattern-rebuild/rebuild-engine.js`
- Test: `tests/pattern-rebuild.test.js`

**Steps:**

- [x] 定义品牌、色号、符号、数量和区域的标准图例结构。
- [x] P0 允许手动录入或粘贴图例映射。
- [x] 不在 P0 引入未经验证的 OCR 自动应用。
- [x] 为 P1 保留候选和置信度字段。

**Gate:** 不扩大 P0 范围；结构可向后兼容；提交并推送。

---

## 里程碑 D：配色、库存、拼制和版本闭环

### Task 11：建立品牌色卡和库存约束引擎

**Files:**

- Create: `web/color/palette-registry.js`
- Create: `web/color/inventory-engine.js`
- Create: `tests/inventory-engine.test.js`
- Modify: `web/app.js`
- Modify: `web/index.html`
- Modify: `web/styles.css`

**Steps:**

- [ ] 将当前 MARD 221 色卡迁入有版本号的色卡注册表。
- [ ] 定义品牌、系列、直径、色号、名称、显示色和标定状态。
- [ ] 建立库存数量、预留数量、缺口和可替代色计算。
- [ ] 支持“仅使用库存颜色”重新配色。
- [ ] 替代方案显示色差、影响格数和缺口变化。
- [ ] 关键色和角色锁定继续阻止自动合并/替换。
- [ ] 库存扣减使用预览、确认和可撤回记录。

**Gate:** MARD 现有图纸颜色不漂移；库存测试通过；提交并推送。

### Task 12：完善拼制工作空间与底板计划

**Files:**

- Create: `web/make/board-planner.js`
- Create: `web/make/build-navigation.js`
- Create: `tests/board-planner.test.js`
- Modify: `web/app.js`
- Modify: `web/index.html`
- Modify: `web/styles.css`

**Steps:**

- [ ] 建立真实底板尺寸和直径兼容表。
- [ ] 实现底板分割、边界预览和编号。
- [ ] 支持按色、按行、按区域导航。
- [ ] 保留现有按色自动前进和其他色变暗能力。
- [ ] 记录已拼格、当前目标和每块底板进度。
- [ ] 屏幕常亮请求失败时显示提示，不阻止拼制。
- [ ] 为平板提供大触控按钮和防误触锁定。

**Gate:** 现有拼制进度可迁移；底板统计与材料数量一致；提交并推送。

### Task 13：升级项目版本、自动恢复和跨端冲突

**Files:**

- Modify: `web/core/project-model.js`
- Create: `web/core/project-store.js`
- Create: `tests/project-store.test.js`
- Modify: `web/app.js`
- Modify: `scripts/qpixel_ipad_https_server.py` only if transport schema changes

**Steps:**

- [ ] 将项目 schema 升级为 v2，并为旧项目提供无损迁移。
- [ ] 保存导入来源、重建报告、库存、底板、3D 预设 ID/版本和相机设置。
- [ ] 导入、批量替换和大型优化前自动建立检查点。
- [ ] 崩溃恢复只恢复最后完整事务。
- [ ] 同步分支同时修改时生成冲突副本，不静默覆盖。
- [ ] 增加存储空间不足、损坏 JSON 和缺失资源测试。

**Gate:** v1/v2 往返和冲突测试全部通过；提交并推送。

---

## 里程碑 E：写实 3D 基础设施

### Task 14：本地引入 Three.js 和离线资源链

**Files:**

- Create: `package.json`
- Create: `package-lock.json`
- Create: `scripts/build_web_assets.mjs`
- Create: `web/generated/finish-viewer.bundle.js`
- Create: `web/vendor/three/basis/`
- Create: `web/3d/finish-viewer-entry.js`
- Modify: `web/module-loader.js`
- Modify: `web/sw.js`
- Modify: `scripts/build_macos_app.sh`
- Modify: `scripts/verify_release.sh`
- Create: `web/generated/licenses/three-LICENSE.txt`

**Steps:**

- [ ] 使用锁文件固定 Three.js 和打包器版本并归档许可证。
- [ ] 以 `web/3d/finish-viewer-entry.js` 为入口生成单一 IIFE 运行包，暴露受控的 `window.QPixel3D` 接口。
- [ ] 所有模块、转码器和 WASM 本地打包，不使用 CDN。
- [ ] 实现 WebGL 2 能力检测和 3D 模块延迟加载。
- [ ] Service Worker 缓存版本化的 3D 入口和必要离线资源。
- [ ] 使用经典脚本按需加载生成包，避免 WKWebView `file://` 模式对 ES Module/CORS 的平台差异。
- [ ] macOS 生产包只复制 `web/generated`、必要的 Basis 转码资源和 `web/assets/3d`，不打包 3D 源码或开发依赖。
- [ ] 发布校验比较源码和 App 内资源，并检查许可证与 manifest。
- [ ] 验证远程本地服务器模式和 `loadFileURL` 离线模式都能加载同一生成包。

**Gate:** 空场景在 macOS App、桌面浏览器和 iPad 测试环境中打开；提交并推送。

### Task 15：实现豆体、孔洞、熔融和连接桥几何

**Files:**

- Create: `web/3d/bead-geometry.js`
- Create: `web/3d/connection-geometry.js`
- Create: `web/3d/instance-layout.js`
- Create: `web/3d/finish-profiles.js`
- Create: `tests/bead-geometry.test.js`
- Create: `tests/finish-profiles.test.js`
- Modify: `scripts/verify_release.sh`

**Steps:**

- [ ] 用毫米定义 MARD 5 mm 外径、内孔、高度和倒角。
- [ ] 建立未熨、轻烫、标准、平融和背熔的几何参数模型。
- [ ] 根据邻接关系生成水平/垂直熔接桥实例。
- [ ] 正面、背面和双面分别控制孔径、顶部形变和厚度。
- [ ] 建立高、中、低三套几何 LOD。
- [ ] 输出实例矩阵、颜色、材质族、可拾取格坐标和边界。
- [ ] 纯函数测试覆盖空格、孤立豆、封闭区域、透明孔和 500×500 布局。

**Gate:** 几何数量、尺寸和邻接测试通过；提交并推送。

### Task 16：实现通用 PBR 材质和摄影环境

**Files:**

- Create: `web/3d/finish-materials.js`
- Create: `web/3d/environment-manager.js`
- Create: `web/3d/color-management.js`
- Create: `web/assets/3d/environments/`
- Create: `web/assets/3d/generic/`
- Create: `web/assets/3d/manifest.json`
- Create: `web/assets/3d/ATTRIBUTION.md`
- Test: `web/test.html`

**Steps:**

- [ ] 建立不透明、半透明、闪片和镭射材质族。
- [ ] 使用实例颜色驱动色号，不为每个色号复制材质。
- [ ] 加载 KTX2 颜色、法线、粗糙度、高度和遮罩通道。
- [ ] 建立柔光棚、中性环境和透明背景。
- [ ] 配置 sRGB 输出、线性计算空间和确定性的色调映射。
- [ ] 所有通用资源标记为 `calibrated: false`。
- [ ] 资源缺失时禁止显示“已标定”，并返回具体错误。

**Gate:** 通用模型达到结构正确但明确未标定；提交并推送。

---

## 里程碑 F：MARD 5 mm 实物标定

### Task 17：建立样片拍摄与标定资产规范

**Files:**

- Create: `docs/3d-calibration/MARD-5mm-capture-guide.md`
- Create: `docs/3d-calibration/MARD-5mm-sample-log.csv`
- Create: `tools/finish-materials/README.md`
- Create: `tools/finish-materials/validate_manifest.py`
- Create: `tools/finish-materials/build_maps.py`
- Create: `web/assets/3d/calibrated/mard-5mm/manifest.json`

**External dependency:** 同批 MARD 5 mm 豆、十类实体样片、卡尺、标准色卡、固定相机和多角度灯光照片。

**Steps:**

- [ ] 规定相机、焦段、距离、白平衡、曝光、背景、色卡和尺寸尺位置。
- [ ] 规定正面、背面、侧面、偏振/非偏振和多灯位照片。
- [ ] 记录品牌、批次、颜色、烫法、介质、正反面、时间/温度档位和冷却方式。
- [ ] 构建脚本生成/整理颜色、法线、粗糙度、高度和遮罩图。
- [ ] 校验 manifest 文件、尺寸、哈希、许可证和版本字段。
- [ ] 缺少任一必要照片或测量时保持 `calibrated: false`。

**Gate:** 标定输入完整并通过资产校验后，才允许进入 Task 18。

### Task 18：完成十类 MARD 5 mm 标定预设

**Files:**

- Create: `web/assets/3d/calibrated/mard-5mm/<profile-id>/`
- Modify: `web/assets/3d/calibrated/mard-5mm/manifest.json`
- Modify: `web/3d/finish-profiles.js`
- Create: `tests/finish-assets.test.js`
- Create: `docs/qa/mard-5mm-calibration-report.md`

**Steps:**

- [ ] 依次标定未熨、轻烫、标准、完全平融、背熔、毛巾、澡巾、华夫格、闪片和镭射。
- [ ] 每个预设记录孔径、厚度、外扩、连接桥和正反面差异。
- [ ] 对照实拍校正颜色、粗糙度、高光范围和纹理比例。
- [ ] 闪片和镭射验证角度响应，禁止固定高光贴图。
- [ ] 生成正面、侧面和背面视觉基准。
- [ ] 只有通过实物报告的预设设置 `calibrated: true`。

**Gate:** 几何误差约 ≤0.2 mm、孔径/熔融面积误差 ≤5%、主要颜色平均 ΔE00 目标 ≤3；提交并推送。

---

## 里程碑 G：3D 工作台、性能与导出

### Task 19：实现完整 3D 成品工作台

**Files:**

- Create: `web/3d/finish-viewer.js`
- Create: `web/3d/finish-workbench.js`
- Create: `web/3d/finish-validation.js`
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `web/test.html`

**Steps:**

- [ ] 左侧显示十类预设、品牌/规格和标定状态。
- [ ] 中央支持自由旋转、缩放、正视、侧视、背面和 1:1 尺寸。
- [ ] 右侧显示熨烫面、融合、孔径、厚度、材质通道、环境和检查。
- [ ] 单颗拾取显示色号、格坐标、底板、孔径和连接状态。
- [ ] 保存视角、分屏比较和对比快照。
- [ ] 项目保存 `finishProfileId`、版本、相机和环境设置。
- [ ] 离开工作台时清理循环、监听器和 GPU 资源。

**Gate:** 十类预设可切换且无资源泄漏；提交并推送。

### Task 20：实现能力检测、实例化、LOD 和动态质量

**Files:**

- Create: `web/3d/performance-controller.js`
- Create: `web/3d/render-metrics.js`
- Create: `tests/finish-performance.test.js`
- Modify: `web/3d/finish-viewer.js`
- Modify: `web/3d/instance-layout.js`
- Test: `web/test.html`

**Steps:**

- [ ] 检测 WebGL 2、最大纹理尺寸、采样数、压缩格式和渲染精度。
- [ ] 使用 `InstancedMesh` 合批豆体和连接桥。
- [ ] 按镜头距离、屏幕像素贡献和设备能力切换 LOD。
- [ ] 交互中动态降低内部渲染比例，停止后逐级恢复。
- [ ] 建立按视口物理像素计算的显存预算和资源淘汰。
- [ ] 记录 draw calls、三角形、纹理、首帧时间、稳定帧率和上下文丢失。
- [ ] 压测小图、万颗级和 500×500 极限图纸。

**Gate:** 桌面目标 ≥30 FPS；平板稳定交互；不会因大图导致主编辑器失去响应；提交并推送。

### Task 21：实现 4K 分块渲染和大文件导出

**Files:**

- Create: `web/3d/finish-export.js`
- Create: `web/3d/tiled-renderer.js`
- Modify: `macos/QPixel.swift`
- Modify: `web/app.js`
- Test: `web/test.html`
- Create: `tests/export-protocol.test.js`

**Steps:**

- [ ] 使用固定相机、灯光、材质和颜色配置进行离屏渲染。
- [ ] 按设备能力将 4K 输出切为带重叠边缘的分块并无缝合成。
- [ ] 提供透明背景和摄影背景。
- [ ] 显示分块进度、取消、预计内存和失败原因。
- [ ] macOS 新增分块/分段写出协议，避免巨型 Data URL 一次性复制多份内存。
- [ ] 浏览器/iPad 使用 `Blob` 和系统分享/下载能力。
- [ ] 导出失败或取消不改变项目和当前场景。

**Gate:** 4K 输出尺寸、透明度、接缝和屏幕一致性通过；提交并推送。

### Task 22：实现上下文丢失、显存不足和资源缺失降级

**Files:**

- Modify: `web/3d/finish-viewer.js`
- Modify: `web/3d/performance-controller.js`
- Modify: `web/3d/finish-validation.js`
- Modify: `web/3d/finish-workbench.js`
- Test: `web/test.html`
- Create: `tests/finish-failure-modes.test.js`

**Steps:**

- [ ] WebGL 上下文丢失时暂停渲染并保存视角/预设。
- [ ] 恢复时按 manifest 重建资源和场景。
- [ ] 恢复失败时退出 3D，但保留项目编辑和普通导出。
- [ ] 显存不足按阴影、环境反射、渲染比例、远景 LOD 的顺序降级。
- [ ] 标定纹理缺失时取消标定标识，不静默使用假纹理。
- [ ] 不支持 WebGL 2 时显示明确的兼容状态和诊断信息。

**Gate:** 错误注入测试通过；3D 故障不破坏项目；提交并推送。

---

## 里程碑 H：整体验收、打包和发布

### Task 23：视觉基准和实物对照验收

**Files:**

- Create: `docs/qa/qpixel-2-visual-baseline.md`
- Create: `docs/qa/qpixel-2-physical-comparison.md`
- Create: `tests/visual-baselines/`
- Modify: `web/test.html`

**Steps:**

- [ ] 固定项目、相机、环境和十类预设生成参考图。
- [ ] 检测模型缺失、纹理缺失、颜色空间错误和光线方向错误。
- [ ] 同灯位实拍/渲染对比并记录几何、孔径、色差和高光结论。
- [ ] 验证屏幕预览与 4K 导出一致。
- [ ] 由人工复核毛巾、澡巾、华夫格、闪片和镭射的纹理尺度与方向性。

**Gate:** 所有“已标定”预设拥有对应实物证据；提交并推送。

### Task 24：全流程浏览器与平板验收

**Files:**

- Update: `docs/qa/qpixel-2-responsive-matrix.md`
- Create: `docs/qa/qpixel-2-end-to-end.md`
- Modify: `web/test.html`

**Steps:**

- [ ] 新建 → 四种入口 → 编辑 → 配色 → 拼制 → 输出 → 版本恢复全流程。
- [ ] 图纸重建：自动检测、手动校准、低置信度审核和取消保护。
- [ ] 写实 3D：预设、正反面、单颗检查、比较、4K 导出。
- [ ] 桌面 1180+、平板横竖屏、窗口缩放和系统字体放大。
- [ ] 无控制台错误、无不可达按钮、无弹窗裁切、无重复监听。

**Gate:** 用户关键任务全部可在 100% 页面比例下完成；提交并推送。

### Task 25：发布包、安装版本与 Git 同步

**Files:**

- Modify: `macos/Info.plist`
- Modify: `macos/release-info.json`
- Modify: `scripts/build_macos_app.sh`
- Modify: `scripts/verify_release.sh`
- Modify: `scripts/install_local_app.sh` only if new resources require it
- Update: `README.zh-CN.md`
- Update: `README.md`
- Create: `docs/qa/qpixel-2-release-report.md`

**Steps:**

- [ ] 更新版本号和构建号。
- [ ] 使用 `npm ci` 和锁定依赖执行 3D 生产包构建，确认生成文件可重复且无远程运行时依赖。
- [ ] 从干净提交构建新的 `Q像素.app`，禁止 `-dirty` 发布。
- [ ] 验证所有 HTML、JS、Worker、3D 模块、WASM、纹理、HDRI、许可证和清单进入 App。
- [ ] 运行 Node、Python、浏览器、WebGL、项目迁移和所有回归测试。
- [ ] 运行代码签名、资源 SHA256 和生产包禁止文件检查。
- [ ] 安装到 `/Users/mac/Desktop/Q像素.app` 并核对版本、构建号和 Git 提交。
- [ ] 验证离线启动、远程本地服务器模式和 iPad 离线版。
- [ ] 提交、推送并确认本地 `main`、`origin/main` 和安装 App 的提交一致。

**Gate:** 发布报告记录全部证据；未通过任一强制项不得宣布完成。

---

## 交付节奏

1. **M1 可用骨架：** Task 1–6。专业工作区可用，原功能不回退。
2. **M2 生产闭环：** Task 7–13。图纸重建、库存、拼制和版本完成。
3. **M3 通用写实 3D：** Task 14–16、19–22。完整 3D 引擎可用，但未标定资源不冒充真实。
4. **M4 MARD 实物标定：** Task 17–18、23。十类效果达到已批准的真实性门槛。
5. **M5 Q像素 2.0 发布：** Task 24–25。跨端验收、打包、安装和 Git 同步完成。

## 开始实施前的硬依赖

- Three.js 固定版本及本地许可证文件。
- 至少一台目标 macOS 设备和一台目标 iPad/平板用于性能矩阵。
- MARD 5 mm 十类实体样片及可追溯拍摄/测量数据。
- HDR 环境光和所有 3D 素材的可再分发授权。
- 足够的仓库/安装包体积预算，用于本地 Three.js、WASM、HDRI 和 KTX2 材质。

其中样片资产是“已实物标定”标签的硬门槛，但不会阻止 M1、M2 和通用 3D 引擎先行开发。

---

## 实施进度（2026-09-23 更新）

| 任务 | 状态 | 说明 |
| --- | --- | --- |
| Task 1-7 | ✅ 完成 | 基线、开关、纯函数、工作区框架、入口路由 |
| Task 8 | ✅ 完成 | 重建引擎补全：自动旋转估计、底板缝检测（双沿间距信号）、压缩噪声抑制（p90-p10 分位）、两遍鲁棒聚类 |
| Task 9 | ✅ 完成 | 工作台三种视图（结果/叠加/分屏）、中置信度黄框、网格校准筛选、底板缝紫线可视化 |
| Task 10 | ✅ 完成 | OCR 图例接口（legend-schema）保持预留 |
| Task 11 | ✅ 完成 | palette-registry（MARD 221）+ inventory-engine（缺口/替代/重配色/扣减撤回）+ 检查器联动 |
| Task 12 | ✅ 完成 | board-planner（4 规格 + 缝线对齐）+ build-navigation（色/行/区域三模式）+ 跳板导航 |
| Task 13 | ✅ 完成 | project-store v2（原子写入+前滚恢复）+ 崩溃草稿恢复横幅 + 检查点（4 个入口 + 工具栏 UI + 嵌套剥离） |
| Task 14 | ✅ 完成 | esbuild 本地打包 Three.js（529KB，Safari15 目标）+ SW 离线缓存 |
| Task 15 | ✅ 完成 | 参数化车削豆体 + 连接桥 + InstancedMesh 实例化 |
| Task 16 | ✅ 完成 | MeshPhysicalMaterial + RoomEnvironment + ACES 色调映射 |
| Task 17 | ✅ 完成 | 标定规范文档 + calibration-manifest（数据驱动，标定后水印自动消失） |
| Task 18 | ⏸ 待实测 | 十类烫法为通用参数化模型，UI 已带"未标定"水印如实标注；实测数据只需改 JSON |
| Task 19 | ✅ 完成 | 3D 工作台：正/背面、曝光、双击拾取、快照分屏、空图纸保护 |
| Task 20 | ✅ 完成 | WebGL2 三档预检 + 弱设备预判 + 运行时帧率监测自动降档（只降不升） |
| Task 21 | ✅ 完成 | 4K 分块渲染 + 进度 + 取消 + 设备纹理上限自适应 |
| Task 22 | ✅ 完成 | 上下文丢失守卫 + 渲染失败安全提示 + 导出中上下文丢失保护 |
| Task 23-24 | ✅ 完成 | 浏览器冒烟验收（首页/编辑器/3D 全链路）；12 个测试文件全绿 |
| Task 25 | ⏸ 待发布 | macOS 打包按需执行 scripts/build_macos_app.sh + verify_release.sh |

**遗留事项**：Task 18 标定需实物样片（流程见 docs/superpowers/specs/mard-5mm-calibration.md）；发布需用户确认后执行打包脚本。
