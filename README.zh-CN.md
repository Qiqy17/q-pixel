# Q像素

Q像素是一个本地运行的像素画和拼豆图纸编辑器，包含网页端、macOS 桌面壳、本地同步服务、图片像素校准、色号优化和回归测试页面。

## 当前版本功能

- 电脑端 Q像素应用、电脑网页和平板网页通过本机 `/api/projects` 服务共享同一套作品数据。
- macOS 桌面应用支持原生保存 PNG 和 `.qpx` 设计文件。
- 增加色号优化功能，可将整幅图控制在指定色号数量内，例如小于或等于 20 色，并尽量保留深色线条和主体区域。
- 所有图片导入时都可选择“像素校准后导入”或“直接导入”。
- 像素校准支持调整网格位置、网格列数和单元格大小。
- 更新离线缓存版本，让平板网页和电脑网页更容易保持同一版本。

## 目录说明

- `web/`：网页应用源码，包括 HTML、CSS、JavaScript、离线缓存、安装清单和测试页。
- `macos/QPixel.swift`：macOS 桌面应用的 AppKit/WebKit 外壳源码。
- `scripts/`：本地 HTTP 同步服务、iPad 访问服务和部署脚本。
- `assets/`：应用图标和测试图片资源。

## 本地运行

在项目根目录运行：

```sh
python3 -m http.server 8766 --directory web
```

然后打开：

```text
http://127.0.0.1:8766/index.html
```

## 平板/多端同步

用于平板访问和多端同步的服务脚本是：

```text
scripts/qpixel_ipad_https_server.py
```

共享作品文件默认保存到：

```text
~/Documents/Q像素/qpixel-projects.json
```

同步逻辑会按作品的 `updatedAt`、`savedAt`、`createdAt` 判断新旧，避免电脑应用、电脑网页和平板网页互相覆盖旧版本。

## 编译 macOS 桌面壳

```sh
swiftc macos/QPixel.swift -o QPixel -framework AppKit -framework WebKit
```

编译出的 `QPixel` 可执行文件放入：

```text
Q像素.app/Contents/MacOS/QPixel
```

## 测试

基础检查：

```sh
node --check web/app.js
python3 -m py_compile scripts/qpixel_ipad_https_server.py scripts/qpixel_sync_server.py
swiftc macos/QPixel.swift -o /tmp/QPixel-test-build -framework AppKit -framework WebKit
```

浏览器回归测试页面：

```text
web/test.html
```

## 发布到 GitHub

先登录 GitHub CLI：

```sh
gh auth login --hostname github.com --git-protocol https --web
```

然后在项目根目录执行：

```sh
./scripts/deploy_github.sh
```

默认发布到：

```text
https://github.com/Qiqy17/q-pixel
```

