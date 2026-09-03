# Fonts — MedHub24

## Approved faces

| Role | Family | File | Source |
|---|---|---|---|
| Khmer body & UI | **Hanuman** 400 | `Hanuman-Regular.ttf` | Medhub24 design system |
| Khmer hero display | **Angkor** 400 | `Angkor-Regular.ttf` | Medhub24 design system |
| Latin body | Plus Jakarta Sans | Google Fonts | — |
| Latin headings | Poppins | Google Fonts | — |

**Both Khmer faces are self-hosted in this directory.** Khmer rendering does
not depend on any third-party CDN and cannot be substituted by a device font.
This is what satisfies the "Khmer font stays consistent on every device"
requirement — a Google Fonts link alone does not, because a corporate proxy,
a strict CSP, or an offline device will silently fall back to the handset's
own Khmer font.

`Moul-Regular.ttf` is retained only so older deployments do not 404. It is no
longer referenced.

## Why unicode-range matters

`css/medhub-type.css` declares both Khmer faces with a `unicode-range` limited
to Khmer codepoints (`U+1780-17FF`, `U+19E0-19FF`, `U+200B`, `U+25CC`). That is
the mechanism keeping Khmer and English typography independent: a Latin glyph
cannot resolve to a Khmer face, and a Khmer glyph cannot resolve to a Latin
face, regardless of what any selector asks for. Change Khmer sizing freely —
it cannot move an English glyph.

## Hanuman has one weight

Hanuman ships Regular only. Both `@font-face` blocks point at the same file, so
weights 600–900 resolve to the real Regular rather than a browser-synthesised
bold — synthetic bold smears the subscript consonants (coeng). Khmer hierarchy
therefore comes from **size and colour**, not weight. Do not add
`font-weight: 700` to Khmer text expecting a heavier face.

## Verifying on a device

`js/khmer-font.js` runs on every load and writes the result to `<html>`:

```
data-khmer-font="selfhosted"   approved face rendering   ← expected
data-khmer-font="fallback"     device font rendering     ← problem
```

The console names the likely cause on failure. By hand, in any console:

```js
document.fonts.check('400 16px "MedHub Khmer"', 'ការព្យាបាល')  // must be true
document.documentElement.dataset.khmerFont                     // "selfhosted"
```

Test on a real iPhone (Safari) and a real Android handset (Chrome) — those
substitute Khmer fonts most aggressively and a desktop browser will not
reproduce the problem.

## Serving

Send the right content type or Safari rejects the file without a visible error:

```
.ttf    →  font/ttf
.woff2  →  font/woff2
```

Cache hard: `Cache-Control: public, max-age=31536000, immutable`.

### Optional: shrink the payload

`Hanuman-Regular.ttf` is a full TTF. Subsetting to Khmer + Latin and converting
to WOFF2 typically cuts it by 60–70%:

```bash
pip install fonttools brotli
pyftsubset Hanuman-Regular.ttf \
  --unicodes="U+1780-17FF,U+19E0-19FF,U+200B,U+25CC,U+0000-00FF" \
  --flavor=woff2 --output-file=Hanuman-Regular.woff2
```

Then add the woff2 ahead of the ttf in both `@font-face` blocks in
`css/medhub-type.css`, and update the `<link rel="preload">` in `index.html`.
