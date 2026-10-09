# Q像素应用市场上线缺口审计

核查日期：2026-10-09（北京时间）。基于当前本地仓库、安装包、签名身份、设备列表及 Apple / Google 官方资料；没有登录商店后台，账号开通及商店记录不能确认。本报告不是上线验收，也不承诺审核通过或上线时间。

## 当前可交付与真正的阻塞

| 项目 | 现状与证据 | 上架前需要 |
|---|---|---|
| macOS 发行 | Swift AppKit/WKWebView + Python 本机服务；`scripts/build_macos_app.sh` 用 swiftc 构建，默认 ad hoc 签名；`local.qpixel.app` 标识 | 正式 Bundle ID、开发者 Team、发行签名与可提交的 Xcode 发行工程／归档流程 |
| 沙盒／安装架构 | 未发现 entitlements / App Sandbox；安装脚本创建 LaunchAgent、依赖外部 python3，作品位于 Documents/Q像素 | Mac App Store 要求沙盒、自包含和规定打包方式。需把必需运行时与服务整合到受支持发行架构，迁移沙盒数据及用户选定目录权限，并明确后台服务生命周期与授权 |
| 开发者证书 | `security find-identity -v -p codesigning` 返回 0 valid identities | 本机配置发行证书及权限；此结果不证明用户没有账号。账号状态需用户确认／登录核对 |
| iPhone／iPad App | 仓库仅 macOS 原生壳和网页，没有检索到 iOS 工程或 IPA | 需要独立移动 App 工程、离线首启、文件导入导出与触控适配，打包、签名、TestFlight 真机验证；平板网页不能当作商店 App |
| Android | 未找到 Android 工程或 AAB | 若选择 Google Play 或安卓市场，另建 Android 交付工程、签名及所选市场材料 |
| 真机及原生验收 | `xcrun devicectl list devices` 列出的 iPad 为 unavailable；历史 QA 明确原生编辑流程与实物板未验收 | 真机导入→编辑→保存→退出→重开、断网、迁移、同步冲突；BLE 作为可选试点，未验收能力不对外承诺 |
| 隐私与支持 | 仓库未发现可上架隐私政策页面／商店素材包；有用户可选 AI 服务 | 公共隐私 URL 和应用内入口、支持联系及 URL、数据去向和保留／删除说明；核实 AI 图片传输、第三方服务、配对记录及隐私标签，不能笼统填写不收集 |
| 商店资料 | 未核查 App Store Connect；未发现现成截图／审核说明包 | 名称副标题、描述、关键词、图标、各目标设备真实截图、年龄分级、价格／地区、出口合规及审核说明 |
| 授权与合规 | three 有许可证文件；色板和材质需完整核实 | 汇总运行时与材质许可证、品牌命名及色库来源，样例作品版权；地域要求按最终市场另行核对 |
| 收费与后台 | 运营账号／会员／订单尚未定义 | 若首版收费，确定付费下载或商店内购、恢复购买、权益与服务；本机管理台不等同商业运营后台 |

## 建议顺序

1. 先确定首发平台，建议先完成 macOS 商店发行架构，再单列 iPad App。当前网页和本机安装版可继续迭代。
2. 完成沙盒／自包含、签名／归档及新装离线可用；再做真机与原生完整流程验收。
3. 准备隐私、支持和商店素材，核实授权、价格与地区后提交测试和审核。未经审核不能将本机安装描述为已上架。

独立网站分发 macOS 的 Developer ID／公证与 Mac App Store 发行是不同路径；目前 ad hoc 签名不能作为两者的正式交付证明。WebView 本身不意味着拒审，但需证明独立、实用的编辑／离线功能，不能只依赖电脑服务。

Google Play：若使用 2023-11-13 后创建的个人开发者账号，官方要求至少 12 位测试者连续加入封闭测试 14 日后申请生产权限；不是所有账号一律适用。其他安卓商店另按所选渠道核对。

## 官方来源（2026-10-09 查阅）

- Apple 审核指南 2.4.5、4.2、5.1：https://developer.apple.com/app-store/review/guidelines/
- Apple 发行准备：https://developer.apple.com/documentation/Xcode/preparing-your-app-for-distribution
- App Sandbox：https://developer.apple.com/documentation/security/protecting-user-data-with-app-sandbox
- 隐私资料：https://developer.apple.com/help/app-store-connect/reference/app-information/app-privacy
- macOS 公证：https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution
- Google 新个人账号测试：https://support.google.com/googleplay/android-developer/answer/14151465?hl=en
