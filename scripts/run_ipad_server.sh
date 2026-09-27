#!/bin/zsh
set -e

cd "$(dirname "$0")"
export QPIXEL_DATA_DIR="$HOME/.config/qpixel"
mkdir -p "$QPIXEL_DATA_DIR"

if [[ "${1:-}" == "--forget-devices" ]]; then
  exec "$(command -v python3)" -B qpixel_ipad_https_server.py --forget-devices
fi
if [[ "$#" -ne 0 ]]; then
  echo "用法：$0 [--forget-devices]" >&2
  exit 2
fi

IP="$(/usr/sbin/ipconfig getifaddr en0 || true)"
if [[ -z "$IP" ]]; then
  IP="$(/usr/sbin/ipconfig getifaddr en1 || true)"
fi
if [[ -z "$IP" ]]; then
  echo "没有找到当前 Wi-Fi 地址，请先连接 Wi-Fi。"
  exit 1
fi

export QPIXEL_IP="$IP"
PYTHON_BIN="$(command -v python3)"
PAIR_CODE_FILE="$QPIXEL_DATA_DIR/ipad-current-pairing-code"
if /usr/sbin/lsof -tiTCP:8767 -sTCP:LISTEN >/dev/null 2>&1; then
  if [[ "${QPIXEL_SERVICE:-}" != "1" ]]; then
    echo "Q像素平板共享已在运行。"
    echo "平板地址：https://$IP:8767/index.html"
    if [[ -f "$PAIR_CODE_FILE" ]]; then echo "新平板配对码：$(cat "$PAIR_CODE_FILE")"; fi
  fi
  exit 0
fi
if ! /usr/bin/curl -fsS --max-time 15 http://127.0.0.1:8766/api/health >/dev/null; then
  echo "电脑创作空间服务未启动，请先启动 Q像素 App。" >&2
  exit 1
fi
export QPIXEL_PAIRING_CODE="$("$PYTHON_BIN" -c 'import secrets; print(secrets.token_urlsafe(9))')"
umask 077
mkdir -p "$(dirname "$PAIR_CODE_FILE")"
echo "$QPIXEL_PAIRING_CODE" > "$PAIR_CODE_FILE"
if [[ "${QPIXEL_SERVICE:-}" != "1" ]]; then
  echo "Q像素平板共享已开启。关闭此终端即可停止共享。"
  echo "平板地址：https://$IP:8767/index.html"
  echo "新平板本次配对码：$QPIXEL_PAIRING_CODE"
  echo "已配对的平板在一年内可直接连接，使用时自动续期。"
  echo "请只在自己的平板上输入配对码。"
fi
exec "$PYTHON_BIN" -B qpixel_ipad_https_server.py --host "$IP" --cert-host "$IP" --port 8767 --proxy-port 8766
