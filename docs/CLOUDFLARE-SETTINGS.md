# Cloudflare settings for medhub24.com

Written for a non-developer. There is one field that matters.

## The settings

Cloudflare → **Compute (Workers & Pages)** → the **medhub24** worker →
**Settings** → **Build**.

| Field | What to put | Why |
|---|---|---|
| **Root directory** | **`deploy`** | **This is the one that matters.** See below. |
| Build command | *leave empty* | The website is plain files. There is nothing to build. |
| Deploy command | `npx wrangler deploy` | The command that publishes it. |
| Branch | `claude/cloudflare-deploy-ui-upgrade-nzfgzq` | Where the finished website lives. |

Click **Save**, then find the most recent deployment and click
**Retry deployment**.

### Why "Root directory" matters

The website is 45 plain files that need no processing at all. But they sit
inside a copy of an unrelated tool for Vue developers, and that tool's setup
files are at the top of the folder.

Left at the top, Cloudflare tries to install that whole developer toolchain —
and download a separate project it refers to — before publishing your site. If
any of that stumbles, the build stops and the site never appears.

`deploy` is a small folder containing only the publishing instructions and
nothing else. Point Cloudflare there and there is nothing to install, so there
is nothing to fail.

---

## If the site still does not appear

**Do this one thing first.** It is worth more than any amount of guessing.

On the worker's main page in Cloudflare there is a link ending in
**`.workers.dev`**. Open it.

| What you see | What it means | What is left |
|---|---|---|
| The website loads | Publishing works. | Only connecting your domain. Small fix. |
| An error, or nothing | Publishing is still failing. | The build log says why — see below. |

Those two need completely different fixes, which is why this click is the
fastest way forward.

### Getting the build log

Cloudflare → the worker → **Deployments** (or **Builds**) → click the most
recent one → scroll to the bottom → copy the red text. A screenshot is fine.

---

## What "working" looks like

When it is right, `https://www.medhub24.com/` should:

- open in **Khmer**, not English
- show a padlock in the address bar
- show the founder's photograph, not a green circle with initials
- switch to English when you tap **KH / EN**, and stay English if you reload
- show **MedHub24.com** in the footer (not MedHub26)
- open your dialler on **+855 12 464 639** when you tap the phone number
- have nothing running off the right edge of a phone screen

---

## Security

Any API token pasted into a chat should be revoked:
**My Profile → API Tokens →** the three dots beside the token **→ Delete**.
Creating a fresh one takes a minute; a leaked one can redirect your domain.
