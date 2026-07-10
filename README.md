# Q Pixel

[中文说明](README.zh-CN.md)

Q Pixel is a local pixel-art and bead-pattern editor. It includes the web app, the macOS WebKit wrapper, local sync services, import calibration, color-count optimization, and regression tests.

## What This Version Includes

- Shared project sync for the desktop app, desktop browser, and tablet browser through the local `/api/projects` service.
- Native macOS save bridge for PNG exports and `.qpx` design files.
- Color optimization control that can reduce a pattern to a target color-count limit, such as 20 colors, while preserving dark outlines and important regions as much as possible.
- Optional image import calibration for all image imports, including grid offset, column count, and cell size.
- Service worker cache refresh so tablets and browsers update to the same app version.

## Project Layout

- `web/` - HTML, CSS, JavaScript, service worker, manifest, offline page, and browser regression page.
- `macos/QPixel.swift` - macOS AppKit/WebKit wrapper for the desktop app.
- `scripts/` - local HTTP/sync server scripts and launch helpers.
- `assets/` - app icon and generated test images.

## Run Locally

From the project root:

```sh
python3 -m http.server 8766 --directory web
```

Open:

```text
http://127.0.0.1:8766/index.html
```

For tablet sync, use the app service script in `scripts/qpixel_ipad_https_server.py`, which stores shared projects at:

```text
~/Documents/Q像素/qpixel-projects.json
```

## Build macOS Wrapper

```sh
swiftc macos/QPixel.swift -o QPixel -framework AppKit -framework WebKit
```

The built `QPixel` executable belongs inside:

```text
Q像素.app/Contents/MacOS/QPixel
```

## Test

Syntax and service checks:

```sh
node --check web/app.js
python3 -m py_compile scripts/qpixel_ipad_https_server.py scripts/qpixel_sync_server.py
swiftc macos/QPixel.swift -o /tmp/QPixel-test-build -framework AppKit -framework WebKit
```

Browser regression page:

```text
web/test.html
```

## Publish To GitHub

Log in with GitHub CLI first:

```sh
gh auth login --hostname github.com --git-protocol https --web
```

Then publish:

```sh
./scripts/deploy_github.sh
```

By default this publishes to:

```text
https://github.com/Qiqy17/q-pixel
```
