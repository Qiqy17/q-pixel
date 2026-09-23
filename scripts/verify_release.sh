#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="${1:-$REPO_DIR/dist/Q像素.app}"
RESOURCES_DIR="$APP_DIR/Contents/Resources"
VERIFY_DIR="$(mktemp -d "${TMPDIR:-/tmp}/qpixel-verify.XXXXXX")"
trap 'rm -rf "$VERIFY_DIR"' EXIT
VERIFY_APP="$VERIFY_DIR/Q像素.app"

test -d "$APP_DIR"
plutil -lint "$APP_DIR/Contents/Info.plist" >/dev/null
test "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$APP_DIR/Contents/Info.plist")" = "local.qpixel.app"
python3 -c 'import ast, pathlib, sys; [ast.parse(pathlib.Path(path).read_text(encoding="utf-8"), filename=path) for path in sys.argv[1:]]' "$RESOURCES_DIR/qpixel_ipad_https_server.py" "$RESOURCES_DIR/qpixel_openai.py"
node --check "$RESOURCES_DIR/app.js"
node --check "$RESOURCES_DIR/feature-flags.js"
node --check "$RESOURCES_DIR/module-loader.js"
node --check "$RESOURCES_DIR/core/project-model.js"
node --check "$RESOURCES_DIR/core/workspace-state.js"
node --check "$RESOURCES_DIR/core/dom-utils.js"
node --check "$RESOURCES_DIR/workspaces/quality-checks.js"
node --check "$RESOURCES_DIR/workspaces/context-inspector.js"
node --check "$RESOURCES_DIR/workspaces/workspace-controller.js"
node --check "$RESOURCES_DIR/import/import-router.js"
node --check "$RESOURCES_DIR/pattern-rebuild/rebuild-engine.js"
node --check "$RESOURCES_DIR/pattern-rebuild/rebuild-worker.js"
node --check "$RESOURCES_DIR/pattern-rebuild/legend-schema.js"
node --check "$RESOURCES_DIR/pattern-rebuild/rebuild-workbench.js"
node --check "$RESOURCES_DIR/import-engine.js"
node --check "$RESOURCES_DIR/import-processing.js"
node --check "$RESOURCES_DIR/import-worker.js"
node "$REPO_DIR/tests/import-engine.test.js"
node "$REPO_DIR/tests/import-processing.test.js"
node "$REPO_DIR/tests/project-payload.test.js"
node "$REPO_DIR/tests/workspace-state.test.js"
node "$REPO_DIR/tests/pattern-rebuild.test.js"

for file in index.html styles.css feature-flags.js module-loader.js import-engine.js import-processing.js import-worker.js app.js manifest.webmanifest icon.svg offline.html sw.js qpixel_ipad_https_server.py qpixel_openai.py OPENAI_SETUP.md; do
  case "$file" in
    qpixel_*.py) source_file="$REPO_DIR/scripts/$file" ;;
    OPENAI_SETUP.md) source_file="$REPO_DIR/docs/$file" ;;
    *) source_file="$REPO_DIR/web/$file" ;;
  esac
  cmp -s "$RESOURCES_DIR/$file" "$source_file"
done

for file in project-model.js workspace-state.js dom-utils.js; do
  cmp -s "$RESOURCES_DIR/core/$file" "$REPO_DIR/web/core/$file"
done

for file in quality-checks.js context-inspector.js workspace-controller.js; do
  cmp -s "$RESOURCES_DIR/workspaces/$file" "$REPO_DIR/web/workspaces/$file"
done

cmp -s "$RESOURCES_DIR/import/import-router.js" "$REPO_DIR/web/import/import-router.js"
for file in rebuild-engine.js rebuild-worker.js legend-schema.js rebuild-workbench.js; do
  cmp -s "$RESOURCES_DIR/pattern-rebuild/$file" "$REPO_DIR/web/pattern-rebuild/$file"
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
# Desktop/iCloud providers may reattach Finder metadata after installation.
# Verify an extension-attribute-free copy so provider metadata cannot create a
# false signature failure while the original resource manifest is still checked.
ditto --noextattr --noqtn "$APP_DIR" "$VERIFY_APP"
xattr -cr "$VERIFY_APP"
codesign --verify --deep --strict --verbose=2 "$VERIFY_APP"
echo "发布包校验通过：$APP_DIR"
