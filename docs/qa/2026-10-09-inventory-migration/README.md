# 完整备料清单、离线入口迁移与三端更新

日期：2026-10-09（北京时间）。用户确认落实两项具体方案，并要求核查三端、后台和市场上线差距。

## 源码交付

- 完整缺货表（全部色号、需求、库存、缺口）、复制与 BOM CSV；零库存估算明确标注。复制拒绝时提供完整可选择文本。
- 迁移引导显示当前入口，逐个保存→备份→导入→核对→保存→手动同步。导入前保护未保存内容，不承诺跨 origin 自动找回。
- /api/release 经原有 Host/Origin 与配对检查，平板代理同一版本端点；首页比对页面与服务修订，切回页面／恢复网络复查，仅提示、不强制刷新。
- 修复 650px 以下首页“同步电脑文件”被 CSS 隐藏的问题。全局色板未减少，跨网络方案未启用。

## 验证证据

- npm test：23 个 JS 文件、6 个 Python 用例通过（新增配对版本接口检查）；npm run build 与 git diff --check 通过。
- 独立地址 127.0.0.1:8891、数据目录 /tmp/qpixel-qa-20261009、隔离浏览器会话 qpixel-review61：browser-check.js 的 21 项通过。实际 DOM、CSV Blob 与 qpx Blob；剪贴板拒绝与版本差异使用受控注入。
- 9 色清单均显示；324 颗图纸扣除 7 颗库存后缺 317 颗；覆盖库存时无缺货导出。导出不改库存和图层。
- 取消导入保留未保存画布；本机保存项目 POST=0，明确手动同步后项目 POST>0，使用独立实际 Python 服务。
- 既有 tests/offline-projects.browser.js 的 14 项真实 IndexedDB 检查通过。未操作用户作品库。

## 独立交付边界

后台管理台为独立待确认方案：docs/superpowers/specs/2026-10-09-local-admin-proposal.md。上架审计见 store-readiness.md。管理台和应用市场发布均未实施。
真实 iPad 在本轮 devicectl 结果仍为 unavailable；桌面 Chromium 窄屏检查不是平板真机验收。实际 BLE 板不在本次验收范围。
