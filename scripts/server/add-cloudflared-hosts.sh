#!/usr/bin/env bash
# 미니PC(keymedi-mini-pc)에서 실행: sudo bash scripts/server/add-cloudflared-hosts.sh
# /etc/cloudflared/config.yml 에 방구석 호스트 2개를 추가하고 DNS 라우트를 만든 뒤 cloudflared 를 재시작한다.
# 이미 들어 있으면 아무것도 바꾸지 않는다. 원본은 config.yml.bak-<시각> 으로 백업.
set -euo pipefail

CONF=/etc/cloudflared/config.yml
TUNNEL=${TUNNEL:-keymedi-home}
APP=bangguseok.jawsweb.site
API=api-bangguseok.jawsweb.site

[ -f "$CONF" ] || { echo "❌ $CONF 없음 — 터널 설정 위치를 확인하세요"; exit 1; }

if grep -q "hostname: $APP" "$CONF"; then
  echo "✓ $APP 는 이미 config.yml 에 있습니다 — 건너뜀"
else
  cp "$CONF" "$CONF.bak-$(date +%Y%m%d%H%M%S)"
  python3 - "$CONF" "$APP" "$API" <<'PY'
import sys
conf, app, api = sys.argv[1:]
s = open(conf).read()
block = f"""  - hostname: {app}
    service: http://127.0.0.1:80
  - hostname: {api}
    path: ^/(rest|auth|storage|realtime|functions|graphql)/v1
    service: http://127.0.0.1:80
"""
marker = "  - service: http_status:404"
if marker not in s:
    sys.exit("❌ config.yml 에 '- service: http_status:404' 마지막 규칙이 없습니다. 수동으로 추가하세요.")
idx = s.rindex(marker)
open(conf, "w").write(s[:idx] + block + s[idx:])
print("✓ ingress 규칙 추가")
PY
fi

cloudflared tunnel ingress validate --config "$CONF"
cloudflared tunnel route dns "$TUNNEL" "$APP" || true
cloudflared tunnel route dns "$TUNNEL" "$API" || true
systemctl restart cloudflared
sleep 3
systemctl --no-pager --lines=3 status cloudflared | head -5
echo "✓ 완료 — https://$APP (Coolify 앱이 떠 있어야 200)"
