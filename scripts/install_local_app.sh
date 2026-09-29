#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_APP="${QPIXEL_APP_PATH:-$HOME/Desktop/Q像素.app}"
BACKUP_ROOT="${QPIXEL_BACKUP_DIR:-$HOME/Documents/Q像素/app-backups}"
LAUNCH_AGENT="$HOME/Library/LaunchAgents/com.qpixel.localserver.plist"
IPAD_AGENT="$HOME/Library/LaunchAgents/com.qpixel.ipadserver.plist"
OLD_AGENT="$HOME/Library/LaunchAgents/com.qpixel.sync.plist"
TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/qpixel-install.XXXXXX")"
trap 'rm -rf "$TEMP_DIR"' EXIT
STAGED_APP="$TEMP_DIR/Q像素.app"

"$REPO_DIR/scripts/build_macos_app.sh" "$STAGED_APP"
"$REPO_DIR/scripts/verify_release.sh" "$STAGED_APP"

mkdir -p "$BACKUP_ROOT" "$HOME/Library/LaunchAgents"
mkdir -p "$HOME/.config/qpixel"
if [ ! -d "$HOME/.config/qpixel/ipad-cert" ] && [ -d "$HOME/Documents/Q像素/ipad-cert" ]; then
  cp -R "$HOME/Documents/Q像素/ipad-cert" "$HOME/.config/qpixel/ipad-cert"
fi
if [ ! -f "$HOME/.config/qpixel/ipad-paired-devices.json" ] && [ -f "$HOME/Documents/Q像素/ipad-paired-devices.json" ]; then
  cp "$HOME/Documents/Q像素/ipad-paired-devices.json" "$HOME/.config/qpixel/ipad-paired-devices.json"
fi
chmod 700 "$HOME/.config/qpixel"
if [ -f "$HOME/.config/qpixel/ipad-paired-devices.json" ]; then chmod 600 "$HOME/.config/qpixel/ipad-paired-devices.json"; fi
STAMP="$(date +%Y%m%d-%H%M%S)"
if pgrep -f "$TARGET_APP/Contents/MacOS/QPixel" >/dev/null 2>&1; then
  osascript -e 'tell application id "local.qpixel.app" to quit' >/dev/null 2>&1 || true
  for _ in {1..30}; do
    if ! pgrep -f "$TARGET_APP/Contents/MacOS/QPixel" >/dev/null 2>&1; then break; fi
    sleep 0.1
  done
  if pgrep -f "$TARGET_APP/Contents/MacOS/QPixel" >/dev/null 2>&1; then
    echo "Q像素仍在运行；为保护未保存内容，已停止安装。请退出 App 后重试。" >&2
    exit 5
  fi
fi
if [ -d "$TARGET_APP" ]; then
  BACKUP_APP="$BACKUP_ROOT/Q像素-$STAMP.app"
  mv "$TARGET_APP" "$BACKUP_APP"
  echo "原 App 已备份：$BACKUP_APP"
fi
mv "$STAGED_APP" "$TARGET_APP"
xattr -cr "$TARGET_APP"

"$REPO_DIR/scripts/verify_release.sh" "$TARGET_APP"

USER_ID="$(id -u)"
launchctl bootout "gui/$USER_ID/com.qpixel.localserver" >/dev/null 2>&1 || true
launchctl bootout "gui/$USER_ID/com.qpixel.ipadserver" >/dev/null 2>&1 || true
launchctl bootout "gui/$USER_ID/com.qpixel.sync" >/dev/null 2>&1 || true
if [ -f "$LAUNCH_AGENT" ]; then
  cp "$LAUNCH_AGENT" "$BACKUP_ROOT/com.qpixel.localserver-$STAMP.plist"
fi
if [ -f "$IPAD_AGENT" ]; then
  cp "$IPAD_AGENT" "$BACKUP_ROOT/com.qpixel.ipadserver-$STAMP.plist"
fi
if [ -f "$OLD_AGENT" ]; then
  mv "$OLD_AGENT" "$BACKUP_ROOT/com.qpixel.sync-$STAMP.plist"
fi
PYTHON_BIN="$(command -v python3)"
RESOURCES_DIR="$TARGET_APP/Contents/Resources"
cp "$REPO_DIR/macos/com.qpixel.localserver.plist" "$TEMP_DIR/com.qpixel.localserver.plist"
sed -i '' -e "s|__PYTHON__|$PYTHON_BIN|g" -e "s|__RESOURCES__|$RESOURCES_DIR|g" "$TEMP_DIR/com.qpixel.localserver.plist"
plutil -lint "$TEMP_DIR/com.qpixel.localserver.plist" >/dev/null
mv "$TEMP_DIR/com.qpixel.localserver.plist" "$LAUNCH_AGENT"
launchctl bootstrap "gui/$USER_ID" "$LAUNCH_AGENT"
launchctl kickstart -k "gui/$USER_ID/com.qpixel.localserver"
LOCAL_SERVER_READY=0
for _ in {1..30}; do
  if /usr/bin/curl -fsS --max-time 1 http://127.0.0.1:8766/api/health >/dev/null 2>&1; then
    LOCAL_SERVER_READY=1
    break
  fi
  sleep 0.2
done
if [ "$LOCAL_SERVER_READY" -ne 1 ]; then
  echo "电脑创作空间服务未就绪，平板服务暂未启动。" >&2
  exit 6
fi
cp "$REPO_DIR/macos/com.qpixel.ipadserver.plist" "$TEMP_DIR/com.qpixel.ipadserver.plist"
sed -i '' -e "s|__RESOURCES__|$RESOURCES_DIR|g" "$TEMP_DIR/com.qpixel.ipadserver.plist"
plutil -lint "$TEMP_DIR/com.qpixel.ipadserver.plist" >/dev/null
mv "$TEMP_DIR/com.qpixel.ipadserver.plist" "$IPAD_AGENT"
launchctl bootstrap "gui/$USER_ID" "$IPAD_AGENT"
cp "$REPO_DIR/scripts/启动Q像素平板链接.command" "$HOME/Desktop/启动Q像素平板链接.command"
chmod +x "$HOME/Desktop/启动Q像素平板链接.command"
echo "Q像素已安装：$TARGET_APP"
