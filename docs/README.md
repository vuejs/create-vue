# MedHub24 — Web App

Bilingual (English / Khmer) site for MedHub24's overseas medical treatment
coordination service. Static SPA, no build step.

## Structure

```
medhub24-webapp/
├── index.html
├── khmer-copy-tool.html      # internal Khmer copy editor
├── css/
│   ├── tailwind-shim.css     # ① replaces the removed Tailwind CDN
│   ├── styles.css            # ② existing layout (11k lines, preserved)
│   ├── medhub-theme.css      # ③ design system palette + components
│   ├── medhub-responsive.css # ④ containment + touch ergonomics (layout only)
│   └── medhub-type.css       # ⑤ typography authority — MUST LOAD LAST
├── js/
│   ├── config.js             # theme values + admin schema
│   ├── khmer-font.js         # verifies the Khmer webfont rendered
│   ├── i18n.js               # locale rendering + language storage
│   ├── khmer-copy-tool.js
│   └── app.js                # routing (navigateTo) + language toggle
├── locales/
│   ├── en/common.js
│   └── km/common.js          # APPROVED — production content
├── assets/
│   ├── fonts/                # self-hosted Khmer faces (+ OFL.txt)
│   └── images/
├── _headers                  # response headers: caching + security
└── _redirects                # SPA fallback
```

Documentation lives in `docs/` at the repository root, deliberately
**outside** this directory. `medhub24/` is the published root — anything
left in it is reachable on medhub24.com. `docs/` holds this file,
`DEPLOY.md`, `SETUP-CLOUDFLARE.md` and `FONTS.md`.

Run: `python3 -m http.server 8000`. A server is required — `file://` blocks
the webfonts.

---

## Responsive behaviour

Verified with headless Safari-profile Chromium across 320 / 375 / 390 /
430 / 744 / 834 / 1024 / 1440px, both locales, all five pages — 80
combinations — checking three things: no element escaping the viewport
unclipped, no overlapping text runs, and no text below the legibility
floor (12px Latin, 13.5px Khmer). All three are clean.

`css/medhub-responsive.css` holds the layout half and sets no font
sizes. Section 9 of `medhub-type.css` holds the sizes.

### What was wrong

- **The English nav strip shrank its own type to fit.** Three mobile
  rules in `styles.css` replaced the scrolling tab strip in the markup
  with `grid-template-columns: repeat(5, minmax(0, 1fr))` and then
  stepped the label down — 8.8px at 430, 8px at 390, 7.7px at 375,
  **6.7px at 320** — to force five tabs into the viewport. The Khmer nav
  had already opted out of this and read its token. The strip now
  scrolls in both locales and the label sits at 12.5–13.8px.
- **Khmer in a `div` rendered in the Latin face.** The rule that assigns
  the Khmer family lists `p, li, a, button, span, …` and no `div`.
  `.travel-stat-label` is a div under a container with Plus Jakarta
  Sans, so its Khmer fell through to a system fallback and the coeng
  subscripts detached from their base consonants. Fixed by element type,
  not per-selector.
- **~40 further text runs below the floor** — kickers and eyebrows at
  9.9px, the footer copyright at 9.9px, pill labels and card step
  markers at 10.6–11.5px, and the checkup step number at **9.3px in
  Khmer**, the smallest text on the site.
- **Hero art bled past the viewport.** `object-fit: cover` under a
  `scale(1.02)` bleed inside an `overflow: visible` wrapper spilled
  3–5px on every page, hidden only by the global `overflow-x: hidden`.
  Clipped at its own wrapper now.
- **`overflow-x: hidden` → `clip`** on `html, body`. Same visual result
  without making `<body>` a scroll container, which on iOS competes with
  the fixed header.
- **Touch targets** raised to the 44px iOS HIG minimum on the nav tabs,
  the language toggle and the footer contact links.

### Content fix

The footer copyright read **`© 2026 MedHub26.com`** in both locales and
in `index.html`. Corrected to `MedHub24.com`.

---

## Design system

The site follows the **Medhub24 design system**: Forest Teal `#2a635c` primary,
Mint `#6eca99` accent, Cream `#FAF7F2` ground, Sand `#D4A574` premium accent,
Coral `#E87968` for emphasis only, teal-tinted shadows, Angkor + Hanuman for
Khmer.

### What changed and why

`styles.css` had grown **five near-duplicate palettes** — home, checkup,
surgery, travel and accommodation each declared their own teal, mint, gold,
ivory and ink at slightly different values (`#0e756f` / `#0f6b72` / `#1b7b7a`
for "teal"; `#52d4ca` / `#63d0c7` / `#4fc8bd` for "mint"; four separate golds).
Same intent, five answers — which is what made the site read as assembled
rather than designed.

`css/medhub-theme.css` maps all five onto the design system by **redefining the
tokens the existing rules already read**, so the 11k lines of layout in
`styles.css` were not rewritten. Alongside it, 151 raw hex values and 232
near-black shadow tints were remapped in place.

Also normalised: one radius scale, one four-step teal-tinted shadow scale
(replacing ~90 bespoke shadows), consistent card and button treatments, and
one hover convention (`translateY(-1px)`, shadow step up).

**Primary CTAs are Forest Teal, not coral.** They were a coral→gold gradient on
every page; the design system reserves coral for emphasis "used sparingly", and
a permanent coral CTA reads promotional rather than clinical.

**To revert the whole theme:** remove the one `<link>` to `medhub-theme.css`
in `index.html`. The palette remap inside `styles.css` is not reverted by that,
so keep a branch if you need a clean rollback.

---

## Typography

English and Khmer are separated **structurally**, not by convention:

1. **`unicode-range`.** The Khmer faces are declared for Khmer codepoints only.
   A Latin glyph cannot resolve to a Khmer face and vice versa.
2. **`html[lang]` scoping.** Khmer metrics live under `html[lang="km"]`,
   English under `html[lang="en"]`. Editing one cannot move the other.

| Script | Role | Family |
|---|---|---|
| Khmer | body, UI, headings | **Koh Santepheap** (self-hosted, 300/400/700/900) |
| Khmer | hero headlines | **Angkor** (self-hosted) |
| Latin | body | Plus Jakarta Sans |
| Latin | headings | Poppins |

Both Khmer faces are Google Fonts' own Khmer-subset `woff2` files, served
from this origin. Khmer therefore cannot be replaced by a device font and
does not depend on a third-party CDN staying reachable from Cambodia.
`js/khmer-font.js` verifies this on every load and writes
`data-khmer-font="selfhosted"` or `"fallback"` to `<html>`.
See `docs/FONTS.md`.

Koh Santepheap replaced Hanuman. Hanuman shipped one weight, so the CSS had
to map 600–900 onto the same file to stop the browser synthesising a fake
bold (which smears the coeng). Koh Santepheap has real weights, so Khmer
hierarchy can now use weight as well as size and colour. Hanuman stays
declared from its TTF as the last approved face before a device font. The
four woff2 files total 122KB, against 394KB for the two TTFs they replace.

**Latin inside a Khmer page.** The Khmer faces are declared for Khmer
codepoints only, so Latin skips past them in the stack. The Latin faces are
therefore named in `--medhub-khmer-*` too. Without them Latin fell through
to the generic `sans-serif`, and the MedHub24 wordmark, "PNH", "24/7" and
the phone numbers rendered in the device font whenever the site was in
Khmer.

### Rules for editing Khmer type

- Sizes come from the `--medhub-km-*` token scale at the top of
  `medhub-type.css`. Never write a literal Khmer font-size.
- **Khmer is never smaller than the Latin it replaces.** `styles.css` contained
  eight hand-tuned header rules doing the opposite (nav labels at 11.5px, brand
  subtitle at 10.2px) to force the nav onto one row. All now read the tokens;
  the nav row scrolls instead.
- Never use negative `letter-spacing` on Khmer — it collides the subscript
  consonants (coeng) with their base.
- Never use `word-break: break-all`, `overflow-wrap: anywhere` or
  `line-break: anywhere` on Khmer — they split a consonant from its own vowel
  sign mid-cluster. Use `overflow-wrap: break-word` with `line-break: auto`.
- Never apply `text-transform: uppercase` or wide tracking to Khmer.
- Khmer needs ~0.25–0.3 more line-height than Latin at the same size.
- Khmer has no italic; `<em>` renders as emphasis, not a slant.
- Hanuman has one weight. Hierarchy comes from size and colour, not weight.

---

## Language

**The site opens in Khmer.** The audience is Cambodian patients; English is
the manual switch.

`index.html` is authored in English, and that matters to the i18n layer:
`applyTranslationNodes` keys every text node against the English locale and
falls back to it for a missing key. `js/i18n.js` therefore keeps two
separate constants:

| Constant | Meaning |
|---|---|
| `DEFAULT_LANGUAGE` (`en`) | the language the markup is written in — the source locale |
| `INITIAL_LANGUAGE` (`km`) | what a first-time visitor sees |

Changing `DEFAULT_LANGUAGE` to `km` would break the reverse lookup against
the English markup. Change `INITIAL_LANGUAGE` instead.

Resolution order: `?lang=` → previous choice in `localStorage` → Khmer. A
visitor who switches to English stays in English on their next visit.

Because the markup is English, waiting for `DOMContentLoaded` to swap the
copy leaves a frame of English on screen. An inline script at the end of
`<body>` applies the translation there instead — the parser has built the
whole document but has not fired `DOMContentLoaded`, so the swap lands
before first contentful paint (measured: swap at 205ms, FCP at 216ms). The
`DOMContentLoaded` handler still runs and is idempotent, so the page is
unaffected if that script throws.

---

## Content

Both languages are keyed dictionaries in `locales/`. **Never hard-code
translated copy in `index.html`** — add a key and a `data-i18n` attribute.

`locales/km/common.js` is the approved production content. The English file
carries the same meaning, medical context and business message; if the Khmer
changes, update the matching English key.

Khmer punctuation (`?`, `។`, `៖`, `ៗ`) is preceded by a non-breaking space so
it can never orphan onto its own line. Preserve those when editing.

### 76 keys are defined but never displayed

Pre-existing. Both locales carry two parallel sets of copy for several
sections — a detailed original and a shorter set the markup actually uses. The
travel cards render `travel.story.beforeFlight` while
`travel.story.card1.title` and its longer `.desc` sit unused.

Harmless at runtime, but it means **some approved Khmer copy is not visible on
the site**. Worth a content review — either wire the richer strings in, or
delete them. To list them:

```js
const used = new Set([...document.querySelectorAll('[data-i18n]')].map(e => e.dataset.i18n));
Object.keys(MEDHUB_LOCALES.en).filter(k => !used.has(k) && !k.startsWith('meta.'));
```

---

## Notes

- The Tailwind CDN was removed; `css/tailwind-shim.css` implements only the
  utilities `index.html` uses. New Tailwind class names in the markup will not
  work until added there (or you move to a real Tailwind build).
- The manager portrait is still hot-linked from a signed `chatglm.cn` URL whose
  `auth_key` expires. It now degrades to a monogram rather than a broken image,
  but download it into `assets/images/` before production.
- Phone: displayed `012 464 639`, linked `tel:+85512464639`. Confirmed
  correct by the owner.
- Facebook blue `#1877f2` is deliberately kept off-palette on the social link.
