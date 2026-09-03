# Connecting medhub24.com to Cloudflare Pages

One-time setup, done in the browser. No terminal, no API token. After
this, every push to the branch publishes automatically.

## 1. Create the Pages project

Cloudflare dashboard → **Compute (Workers & Pages)** → **Create** →
**Pages** tab → **Connect to Git**.

Authorise GitHub if asked, then pick the repository:

    kevinoversea/create-vue

## 2. Build settings

Set these exactly. The site is static — there is no build step, so the
build command must be left EMPTY.

| Field                     | Value                                        |
|---------------------------|----------------------------------------------|
| Project name              | `medhub24`                                   |
| Production branch         | `claude/cloudflare-deploy-ui-upgrade-nzfgzq` |
| Framework preset          | `None`                                       |
| Build command             | *(leave empty)*                              |
| Build output directory    | `medhub24`                                   |
| Root directory            | *(leave as `/`)*                             |

Click **Save and Deploy**. The first deploy takes about a minute and
publishes to `medhub24.pages.dev`.

**Check that URL before attaching the domain.** It should open in Khmer,
with the language pill top-right reading `KH / EN`.

## 3. Attach the domain

In the project → **Custom domains** → **Set up a custom domain**.

Add both:

- `www.medhub24.com`
- `medhub24.com`

The zone is already in this Cloudflare account, so Pages creates the DNS
records itself. No manual DNS entry is needed.

## 4. Pick one canonical hostname

Serving the same site on both the apex and `www` splits your SEO and
looks careless in a link. Choose one — `www.medhub24.com`, per the
domain you gave — and redirect the other to it:

**Rules → Redirect Rules → Create rule**

| Field | Value |
|---|---|
| Rule name | `apex to www` |
| When incoming requests match | Hostname **equals** `medhub24.com` |
| Then | Dynamic redirect |
| Expression | `concat("https://www.medhub24.com", http.request.uri.path)` |
| Status code | `301` |
| Preserve query string | on |

## 5. Verify

Open `https://www.medhub24.com/` on an actual iPhone, not just desktop:

- It opens in **Khmer**.
- Tapping `KH / EN` switches to English, and it stays English on reload.
- The tab strip under the logo scrolls sideways and every label is
  readable.
- Khmer headlines render in Angkor, Khmer body in Koh Santepheap. If
  Khmer looks like a plain system font, the webfonts did not deploy —
  see the font check in `DEPLOY.md`.
- Nothing is cut off at the right edge on any page.
- Tapping the phone number opens the dialler with `+855 12 464 639`.

## Later: moving to `main`

The production branch above is a working branch. Once you are happy with
the live site, merge it to `main` and change the production branch in
**Settings → Builds & deployments**. Nothing else changes.

## Rolling back

Project → **Deployments** → the last good one → **Rollback**. Every
deploy is kept, so this is always available.
