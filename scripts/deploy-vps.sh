#!/bin/sh
# One-shot VPS provisioning + deploy. Run FROM THE REPO on your machine:
#
#   sh scripts/deploy-vps.sh <vps-ip>
#
# Assumes: Ubuntu ARM/x86 instance, SSH key at ~/.ssh/teman_deploy,
# ports 80/443 open in the cloud firewall. Uses <ip>.sslip.io for the
# domain so Caddy can fetch a real certificate with no DNS setup at all.
set -eu

IP="${1:?usage: deploy-vps.sh <vps-ip>}"
SSH="ssh -i $HOME/.ssh/teman_deploy -o StrictHostKeyChecking=accept-new ubuntu@$IP"
DOMAIN="${DOMAIN:-$(echo "$IP" | tr '.' '-').sslip.io}"

echo "→ deploying to $IP as https://$DOMAIN"

echo "1/6 docker…"
# swap first: `next build` inside compose needs headroom on small shapes
$SSH 'test -f /swapfile || (sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile && echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab >/dev/null)'
$SSH 'command -v docker >/dev/null || (curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker ubuntu)'
# iptables on Oracle images blocks 80/443 by default, on top of the VCN rules
$SSH 'sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT; sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT; sudo iptables -I INPUT -p udp --dport 443 -j ACCEPT; sudo netfilter-persistent save 2>/dev/null || true'

echo "2/6 code…"
$SSH 'sudo mkdir -p /opt/teman && sudo chown ubuntu /opt/teman'
rsync -az -e "ssh -i $HOME/.ssh/teman_deploy" \
  --exclude node_modules --exclude .next --exclude .next-goal --exclude .git \
  --exclude .data --exclude test-results --exclude dist \
  ./ "ubuntu@$IP:/opt/teman/"

echo "3/6 env…"
$SSH "cd /opt/teman && test -f .env || cat > .env <<EOF
DOMAIN=$DOMAIN
PUBLIC_URL=https://$DOMAIN
POSTGRES_USER=teman
POSTGRES_PASSWORD=$(openssl rand -hex 16)
POSTGRES_DB=teman
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_URL=https://$DOMAIN
AUTH_TRUST_HOST=true
DEMO_MODE=true
DEMO_OTP=000000
REQUESTS_OPEN=true
LAUNCH_MONTH=2026-09
EOF"

echo "4/6 build + up…"
$SSH 'cd /opt/teman && sudo docker compose build app && sudo docker compose up -d db && sleep 10 && sudo docker compose up -d app worker caddy'

echo "5/6 migrate + seed…"
$SSH 'cd /opt/teman && sudo docker compose run --rm app node dist/migrate.js'
# seed runs via a disposable node container on the compose network:
$SSH 'cd /opt/teman && sudo docker run --rm --network teman_default -v /opt/teman:/w -w /w -e DATABASE_URL=postgres://teman:$(grep POSTGRES_PASSWORD .env | cut -d= -f2)@db:5432/teman node:22-alpine sh -c "npm i --no-save postgres@3 >/dev/null 2>&1 && node scripts/seed/areas.mjs && node scripts/seed/categories.mjs && node scripts/seed/admins.mjs && node scripts/seed/demo.mjs --reset --force"'

echo "6/6 verify…"
sleep 5
curl -s -o /dev/null -w "https://$DOMAIN → %{http_code} (TLS: %{ssl_verify_result})\n" "https://$DOMAIN/ta"
echo "done — demo logins: +60 12-000 0001/2/3/4, OTP 000000"
