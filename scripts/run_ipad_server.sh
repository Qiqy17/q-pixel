#!/bin/zsh
set -e

cd "$(dirname "$0")"

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
if ! /usr/bin/curl -fsS --max-time 3 http://127.0.0.1:8766/api/health >/dev/null; then
  echo "电脑创作空间服务未启动，请先启动 Q像素 App。" >&2
  exit 1
fi
export QPIXEL_PAIRING_CODE="$("$PYTHON_BIN" -c 'import secrets; print(secrets.token_urlsafe(9))')"
echo "Q像素平板共享已开启。关闭此终端即可停止共享。"
echo "平板地址：https://$IP:8767/index.html"
echo "本次配对码：$QPIXEL_PAIRING_CODE"
echo "请只在自己的平板上输入配对码。"
exec "$PYTHON_BIN" -B qpixel_ipad_https_server.py --host "$IP" --cert-host "$IP" --port 8767 --proxy-port 8766
