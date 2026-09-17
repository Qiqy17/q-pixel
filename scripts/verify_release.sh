#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="${1:-$REPO_DIR/dist/Q像素.app}"
RESOURCES_DIR="$APP_DIR/Contents/Resources"

test -d "$APP_DIR"
plutil -lint "$APP_DIR/Contents/Info.plist" >/dev/null
test "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$APP_DIR/Contents/Info.plist")" = "local.qpixel.app"
codesign --verify --deep --strict --verbose=2 "$APP_DIR"
python3 -c 'import ast, pathlib, sys; [ast.parse(pathlib.Path(path).read_text(encoding="utf-8"), filename=path) for path in sys.argv[1:]]' "$RESOURCES_DIR/qpixel_ipad_https_server.py" "$RESOURCES_DIR/qpixel_openai.py"
node --check "$RESOURCES_DIR/app.js"

for file in index.html styles.css app.js manifest.webmanifest icon.svg offline.html sw.js qpixel_ipad_https_server.py qpixel_openai.py OPENAI_SETUP.md; do
  case "$file" in
    qpixel_*.py) source_file="$REPO_DIR/scripts/$file" ;;
    OPENAI_SETUP.md) source_file="$REPO_DIR/docs/$file" ;;
    *) source_file="$REPO_DIR/web/$file" ;;
  esac
  cmp -s "$RESOURCES_DIR/$file" "$source_file"
done

for forbidden in test.html q-pixel-test.png q-pixel-beads-test.png q-pixel-editor-space-test.png q-pixel-mard-beads-test.png qpixel_sync_server.py; do
  if find "$RESOURCES_DIR" -name "$forbidden" -print -quit | grep -q .; then
    echo "生产包包含不应发布的文件：$forbidden" >&2
    exit 4
  fi
done
if find "$RESOURCES_DIR" -type d -name __pycache__ -print -quit | grep -q .; then
  echo "生产包包含 Python 缓存目录。" >&2
  exit 4
fi
(
  cd "$RESOURCES_DIR"
  shasum -a 256 -c release-manifest.sha256 >/dev/null
)
codesign --verify --deep --strict --verbose=2 "$APP_DIR"
echo "发布包校验通过：$APP_DIR"
