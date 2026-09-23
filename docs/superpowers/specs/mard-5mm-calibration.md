---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '4ff2ed45-95d7-49ac-ae6c-ee0d847d3fe5'
  PropagateID: '4ff2ed45-95d7-49ac-ae6c-ee0d847d3fe5'
  ReservedCode1: 'd342001e-c979-4379-b38e-65d3c7154fd8'
  ReservedCode2: 'd342001e-c979-4379-b38e-65d3c7154fd8'
---

# MARD 5mm 十类烫法 3D 标定规范

> 状态：规范已定稿，实测未开始。当前 3D 预览运行在"通用参数化模型"上，界面以水印如实标注。
> 本文档描述从"通用模型"升级为"实物标定模型"所需的全部测量工作。

## 1. 目标

把 3D 成品预览的豆体几何、表面材质、颜色三层数据全部替换为 MARD 5mm 真实测量值，使预览效果与实物照片肉眼可辨一致（主要视角下 ΔE2000 ≤ 6）。

## 2. 十类烫法档案

| ID | 名称 | 需标定参数 | 当前来源 |
| --- | --- | --- | --- |
| raw | 未烫 | 豆高、孔径、粗糙度 | 通用模型 |
| light | 轻烫保孔 | 豆高、孔径、摊开、连接桥、粗糙度 | 通用模型 |
| standard | 标准融合 | 豆高、孔径、摊开、连接桥、粗糙度 | 通用模型 |
| flat | 完全平融 | 豆高、孔径、摊开、连接桥、粗糙度 | 通用模型 |
| back | 背熔混合 | 前述全部 + 背面表面 | 通用模型 |
| towel | 毛巾烫 | 前述全部 + 织物纹理 | 通用模型 |
| bath | 澡巾烫 | 前述全部 + 织物纹理 | 通用模型 |
| waffle | 华夫格烫 | 前述全部 + 华夫格纹理 | 通用模型 |
| glitter | 闪片烫 | 前述全部 + 清漆层、闪片密度 | 通用模型 |
| laser | 镭射烫 | 前述全部 + 虹彩强度、虹彩 IOR | 通用模型 |

## 3. 几何测量

### 3.1 豆高（mm）

- 工具：数显游标卡尺（精度 0.02mm）
- 方法：每种烫法取 20 颗，测量豆体中心厚度，取**中位数**
- 记录：`measurements/{profileId}.json` → `height`

### 3.2 孔径占比（比例）

- 工具：俯拍照片（D65 光源、垂直 90°）+ 图像阈值分析
- 方法：孔径像素直径 ÷ 豆面像素直径，10 颗取中位数
- 记录：`hole`

### 3.3 摊开量（mm）

- 工具：烫前烫后同位置对比照
- 方法：单颗豆间距差值，5 组取中位数
- 记录：`spread`

### 3.4 连接桥（比例）

- 工具：侧拍照片（45° 光照突出轮廓）
- 方法：相邻豆连接高度 ÷ 豆高，5 组取中位数
- 记录：`bridge`

## 4. 表面测量

- **粗糙度**：光泽度仪读数，或与标准粗糙度样块目视对比分档（0.1~1.0）
- **织物纹理**（towel/bath/waffle）：俯拍法线参考图，输出 `textures/{profileId}_normal.jpg`（1024×1024，法线贴图格式）与 `{profileId}_roughness.jpg`
- **闪片/镭射**：清漆强度（clearcoat）、虹彩 IOR 用目视对比 + 参考照片微调

## 5. 颜色校准

- 同一 D65 光源下，221 色每色排 3 颗，一次拍摄（锁定曝光与白平衡）
- 首帧拍标准灰卡，后期按灰卡统一白平衡
- 每色输出：`measuredHex`（校准后的 sRGB）、`deltaEToNominal`（与色板标称值的 ΔE2000）
- 背景：中性灰，哑光，避免反光

## 6. 数据接入流程

1. 测量结果填入 `web/3d/calibration/measurements/{profileId}.json`（结构见 manifest `geometryCalibration.requiredMeasurements`）
2. 纹理放 `web/3d/calibration/textures/`
3. 颜色数据填 `web/3d/calibration/colors.json`
4. 把 `web/3d/calibration-manifest.json` 的 `status` 改为 `calibrated`，各 profile `currentSource` 改为 `measured`
5. `npm run build` 重打包 —— UI 水印自动消失，finish-core 在运行时优先读取实测参数

## 7. 验收标准

- 十种烫法各一张预览 vs 实物照，5 人盲评"明显一致"≥ 4 人
- 221 色在标准视角下与色板 ΔE2000 中位数 ≤ 6
- 预览帧率：100×100 图纸在中档设备（M1 MacBook Air / iPad Air）≥ 30fps

> AI生成