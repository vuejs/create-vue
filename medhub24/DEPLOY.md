# Deploying medhub24.com to Cloudflare Pages

The site is static — no build step. Cloudflare Pages serves this
directory as-is.

## What you need once

A **Cloudflare API token**, not your dashboard password. Create it at
Cloudflare dashboard → My Profile → API Tokens → Create Token →
*Custom token*, with these permissions on your account:

| Scope   | Permission           | Level |
|---------|----------------------|-------|
| Account | Cloudflare Pages     | Edit  |
| Zone    | DNS                  | Edit  (zone: medhub24.com) |
| Zone    | Zone                 | Read  (zone: medhub24.com) |

Then export it in the shell you deploy from:

```sh
export CLOUDFLARE_API_TOKEN="<token>"
export CLOUDFLARE_ACCOUNT_ID="f3c26a34786535542210e320b2bbaad9"
```

## Deploy

```sh
npx wrangler@latest pages deploy . --project-name=medhub24 --branch=main
```

First run creates the project if it does not exist. Every later run
publishes a new version to the same project.

## Custom domain (once per project)

```sh
npx wrangler@latest pages domain add medhub24.com  --project-name=medhub24
npx wrangler@latest pages domain add www.medhub24.com --project-name=medhub24
```

Because the zone is already in the same Cloudflare account, Pages
creates the CNAME records itself. Confirm afterwards:

```sh
npx wrangler@latest pages deployment list --project-name=medhub24
```

Then set `www.medhub24.com` as the canonical host and redirect the apex
to it (Rules → Redirect Rules), or the reverse — pick one and keep it,
so the site is never reachable on two hostnames at once.

## Verify after deploy

```sh
curl -sI https://www.medhub24.com/ | head -20
curl -s  https://www.medhub24.com/ | grep -o '<title>.*</title>'
curl -sI https://www.medhub24.com/css/medhub-type.css | grep -i cache-control
curl -sI https://www.medhub24.com/assets/fonts/Hanuman-Regular.ttf | grep -i 'cache-control\|content-type'
```

The last one matters: if the Khmer font 404s, the whole Khmer side of
the site falls back to a device font and the typography work is lost.
`js/khmer-font.js` writes `data-khmer-font="selfhosted"` or `"fallback"`
onto `<html>` — check it in Safari's inspector on a real iPhone.

## Rollback

Cloudflare Pages keeps every deployment. In the dashboard, open the
project → Deployments → the last known-good one → *Rollback*.

## Local preview

```sh
python3 -m http.server 8000
# then http://localhost:8000
```

A server is required; `file://` blocks the webfonts.
