#!/usr/bin/env bash
# Deploy medhub24.com to Cloudflare and verify it.
#
#   CLOUDFLARE_API_TOKEN=<token> ./scripts/deploy.sh
#
# Safe to re-run. Reads DNS before touching anything and never deletes a
# record. Requires network access to api.cloudflare.com.

set -euo pipefail
ZONE="medhub24.com"
WWW="www.medhub24.com"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-f3c26a34786535542210e320b2bbaad9}"
API="https://api.cloudflare.com/client/v4"
CF=(-sS -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN}")
cd "$(dirname "$0")/.."

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
jq_() { python3 -c "import sys,json;d=json.load(sys.stdin);$1"; }

say "1/6  Verifying the API token"
curl "${CF[@]}" "$API/user/tokens/verify" | jq_ "
assert d['success'], d.get('errors')
print('   token status:', d['result']['status'])"

say "2/6  Reading existing DNS records (read-only — nothing changed yet)"
ZID=$(curl "${CF[@]}" "$API/zones?name=$ZONE" | jq_ "
assert d['success'] and d['result'], 'zone not found or token lacks Zone:Read'
print(d['result'][0]['id'])")
echo "   zone id: $ZID"
curl "${CF[@]}" "$API/zones/$ZID/dns_records?per_page=100" | jq_ "
rs=d['result']
print(f'   {len(rs)} records found:')
for r in sorted(rs, key=lambda r:(r['type'],r['name'])):
    tag=''
    if r['name'] in ('$ZONE','$WWW') and r['type'] in ('A','AAAA','CNAME'):
        tag='   <-- this deploy will point this at the site'
    print(f\"     {r['type']:<6} {r['name']:<28} {str(r['content'])[:44]:<46}{tag}\")
mx=[r for r in rs if r['type'] in ('MX','TXT')]
print(f'   {len(mx)} MX/TXT records (email) — NOT touched by this deploy')"

say "3/6  Deploying the site"
npx --yes wrangler@latest deploy

say "4/6  Confirming the custom domains attached"
for h in "$WWW" "$ZONE"; do
  curl "${CF[@]}" "$API/accounts/$ACCOUNT_ID/workers/domains?hostname=$h" | jq_ "
rs=d.get('result') or []
print('   $h:', rs[0]['hostname']+' -> '+rs[0]['service'] if rs else 'NOT ATTACHED')" || true
done

say "5/6  Waiting for DNS + certificate"
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -m 10 -w '%{http_code}' "https://$WWW/" || true)
  [ "$code" = "200" ] && { echo "   https://$WWW -> HTTP 200"; break; }
  echo "   attempt $i: HTTP $code — waiting 10s"; sleep 10
done

say "6/6  Verifying the live site"
echo "   certificate:"
echo | openssl s_client -servername "$WWW" -connect "$WWW:443" 2>/dev/null \
  | openssl x509 -noout -issuer -dates 2>/dev/null | sed 's/^/     /'
for path in / /checkup /css/medhub-type.css /js/app.js \
            /assets/fonts/KohSantepheap-Regular.woff2 \
            /assets/images/founder-portrait.jpg /nonexistent-page; do
  printf '   %-46s ' "$path"
  curl -s -o /dev/null -m 15 -w '%{http_code}  %{content_type}\n' "https://$WWW$path"
done
echo "   opens in Khmer:"
curl -s -m 15 "https://$WWW/" | grep -oE '<html lang="[a-z]+"' | sed 's/^/     /'

say "Done. Next: set the apex redirect (see docs/SETUP-CLOUDFLARE.md section 4),"
echo "then revoke the API token."
