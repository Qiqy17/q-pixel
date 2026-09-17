#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_APP="${QPIXEL_APP_PATH:-$HOME/Desktop/Q像素.app}"
BACKUP_ROOT="${QPIXEL_BACKUP_DIR:-$HOME/Documents/Q像素/app-backups}"
LAUNCH_AGENT="$HOME/Library/LaunchAgents/com.qpixel.localserver.plist"
OLD_AGENT="$HOME/Library/LaunchAgents/com.qpixel.sync.plist"
TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/qpixel-install.XXXXXX")"
trap 'rm -rf "$TEMP_DIR"' EXIT
STAGED_APP="$TEMP_DIR/Q像素.app"

"$REPO_DIR/scripts/build_macos_app.sh" "$STAGED_APP"
"$REPO_DIR/scripts/verify_release.sh" "$STAGED_APP"

mkdir -p "$BACKUP_ROOT" "$HOME/Library/LaunchAgents"
STAMP="$(date +%Y%m%d-%H%M%S)"
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
launchctl bootout "gui/$USER_ID/com.qpixel.sync" >/dev/null 2>&1 || true
if [ -f "$LAUNCH_AGENT" ]; then
  cp "$LAUNCH_AGENT" "$BACKUP_ROOT/com.qpixel.localserver-$STAMP.plist"
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
echo "Q像素已安装：$TARGET_APP"
