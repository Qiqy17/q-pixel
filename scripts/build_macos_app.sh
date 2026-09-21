#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_PATH="${1:-$REPO_DIR/dist/Q像素.app}"
VERSION="${QPIXEL_VERSION:-1.2.0}"
BUILD_NUMBER="${QPIXEL_BUILD_NUMBER:-3}"
SIGN_IDENTITY="${CODESIGN_IDENTITY:--}"

case "$OUTPUT_PATH" in
  *.app) ;;
  *) echo "输出路径必须以 .app 结尾。" >&2; exit 2 ;;
esac
if [ -e "$OUTPUT_PATH" ]; then
  echo "输出已存在，请先移动或指定新的输出路径：$OUTPUT_PATH" >&2
  exit 2
fi

BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/qpixel-build.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT
APP_DIR="$BUILD_DIR/Q像素.app"
CONTENTS_DIR="$APP_DIR/Contents"
RESOURCES_DIR="$CONTENTS_DIR/Resources"
MACOS_DIR="$CONTENTS_DIR/MacOS"
mkdir -p "$RESOURCES_DIR" "$MACOS_DIR"

cp "$REPO_DIR/macos/Info.plist" "$CONTENTS_DIR/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" "$CONTENTS_DIR/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" "$CONTENTS_DIR/Info.plist"

swiftc "$REPO_DIR/macos/QPixel.swift" -o "$MACOS_DIR/QPixel" -framework AppKit -framework WebKit

for file in index.html styles.css import-engine.js app.js manifest.webmanifest icon.svg offline.html sw.js; do
  cp "$REPO_DIR/web/$file" "$RESOURCES_DIR/$file"
done
mkdir -p "$RESOURCES_DIR/assets"
cp -R "$REPO_DIR/web/assets/materials" "$RESOURCES_DIR/assets/materials"
cp "$REPO_DIR/scripts/qpixel_ipad_https_server.py" "$RESOURCES_DIR/qpixel_ipad_https_server.py"
cp "$REPO_DIR/scripts/qpixel_openai.py" "$RESOURCES_DIR/qpixel_openai.py"
cp "$REPO_DIR/scripts/run_ipad_server.sh" "$RESOURCES_DIR/run_ipad_server.sh"
cp "$REPO_DIR/scripts/配置HuggingFace令牌.command" "$RESOURCES_DIR/配置HuggingFace令牌.command"
cp "$REPO_DIR/scripts/配置OpenAI密钥.command" "$RESOURCES_DIR/配置OpenAI密钥.command"
cp "$REPO_DIR/scripts/配置即梦API.command" "$RESOURCES_DIR/配置即梦API.command"
cp "$REPO_DIR/docs/OPENAI_SETUP.md" "$RESOURCES_DIR/OPENAI_SETUP.md"
chmod +x "$MACOS_DIR/QPixel" "$RESOURCES_DIR/run_ipad_server.sh" "$RESOURCES_DIR"/*.command

ICON_SOURCE="$BUILD_DIR/QPixel.tiff"
if command -v magick >/dev/null 2>&1; then
  magick -background none "$REPO_DIR/web/icon.svg" -resize 1024x1024 -depth 8 "TIFF:$ICON_SOURCE"
elif command -v convert >/dev/null 2>&1; then
  convert -background none "$REPO_DIR/web/icon.svg" -resize 1024x1024 -depth 8 "TIFF:$ICON_SOURCE"
else
  echo "缺少 SVG 转换工具，无法生成规范的 ICNS 图标。" >&2
  exit 3
fi
tiff2icns "$ICON_SOURCE" "$RESOURCES_DIR/QPixel.icns"

GIT_COMMIT="$(git -C "$REPO_DIR" rev-parse HEAD 2>/dev/null || echo unknown)"
if [ -n "$(git -C "$REPO_DIR" status --porcelain 2>/dev/null || true)" ]; then GIT_COMMIT="${GIT_COMMIT}-dirty"; fi
cp "$REPO_DIR/macos/release-info.json" "$RESOURCES_DIR/release-info.json"
BUILT_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
sed -i '' \
  -e "s|__VERSION__|$VERSION|g" \
  -e "s|__BUILD__|$BUILD_NUMBER|g" \
  -e "s|__GIT_COMMIT__|$GIT_COMMIT|g" \
  -e "s|__BUILT_AT__|$BUILT_AT|g" \
  "$RESOURCES_DIR/release-info.json"
(
  cd "$RESOURCES_DIR"
  find . -type f ! -name release-manifest.sha256 -print0 | sort -z | xargs -0 shasum -a 256 | tee release-manifest.sha256 >/dev/null
)

codesign --force --deep --sign "$SIGN_IDENTITY" --identifier local.qpixel.app "$APP_DIR"
codesign --verify --deep --strict --verbose=2 "$APP_DIR"
mkdir -p "$(dirname "$OUTPUT_PATH")"
mv "$APP_DIR" "$OUTPUT_PATH"
echo "$OUTPUT_PATH"
