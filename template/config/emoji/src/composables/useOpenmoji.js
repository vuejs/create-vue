import { ref, computed, inject } from 'vue'

/**
 * useOpenmoji — OpenMoji SVG/PNG asset access composable
 *
 * Provides reactive access to OpenMoji assets (SVGs, PNGs, fonts)
 * from the openmoji npm package or CDN.
 *
 * OpenMoji provides:
 *   - Color SVGs (618×618) with full Unicode emoji coverage
 *   - Black SVGs (outline style)
 *   - Color/Black PNG at 72×72 and 618×618
 *   - OpenMoji Color & Black TTF fonts
 *   - An npm package with per-emoji SVG file access
 *
 * @example
 * const { getEmojiUrl, getSvgUrl, fontClass } = useOpenmoji()
 * const sparkleUrl = getSvgUrl('2728') // → OpenMoji color SVG for ✨
 */
export function useOpenmoji(options = {}) {
  const config = inject('emojiConfig', {
    openmojiBasePath:
      'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@latest/color/svg',
  })

  const variant = ref(options.variant || 'color') // 'color' | 'black'
  const format = ref(options.format || 'svg') // 'svg' | 'png'
  const size = ref(options.size || 72) // for PNG: 72 or 618

  const basePath = computed(() => {
    if (options.basePath) return options.basePath
    return config.openmojiBasePath
  })

  /**
   * Convert a unicode emoji character to its hex codepoint
   * e.g. '🎉' → '1F389'
   */
  function emojiToHex(emoji) {
    if (!emoji) return ''
    // Handle emoji that are combinations (ZWJ sequences, skin tones)
    const codepoints = []
    for (const char of emoji) {
      const cp = char.codePointAt(0)
      // Skip variation selectors (FE0F) and ZWJ (200D) - include them in the codepoint string
      if (cp === 0xfe0f) continue
      codepoints.push(cp.toString(16).toUpperCase().padStart(4, '0'))
    }
    return codepoints.join('-')
  }

  /**
   * Get the OpenMoji SVG URL for an emoji
   * @param {string} hexOrEmoji - Either a hex codepoint (e.g. '1F389') or emoji character (e.g. '🎉')
   */
  function getSvgUrl(hexOrEmoji) {
    const hex = hexOrEmoji.includes('0') || /^[0-9A-Fa-f]/.test(hexOrEmoji)
      ? hexOrEmoji.toUpperCase()
      : emojiToHex(hexOrEmoji)
    const variantPath = variant.value === 'black' ? 'black' : 'color'
    return `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@latest/${variantPath}/svg/${hex}.svg`
  }

  /**
   * Get the OpenMoji PNG URL for an emoji
   * @param {string} hexOrEmoji - Hex codepoint or emoji character
   * @param {number} pngSize - 72 or 618
   */
  function getPngUrl(hexOrEmoji, pngSize) {
    const hex = hexOrEmoji.includes('0') || /^[0-9A-Fa-f]/.test(hexOrEmoji)
      ? hexOrEmoji.toUpperCase()
      : emojiToHex(hexOrEmoji)
    const s = pngSize || size.value
    const variantPath = variant.value === 'black' ? 'black' : 'color'
    return `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@latest/${variantPath}/${s}x${s}/${hex}.png`
  }

  /**
   * Get the optimal URL based on current format setting
   */
  function getEmojiUrl(hexOrEmoji) {
    if (format.value === 'png') {
      return getPngUrl(hexOrEmoji)
    }
    return getSvgUrl(hexOrEmoji)
  }

  /**
   * CSS class for OpenMoji font rendering
   * Requires the OpenMoji font to be loaded (from noto-emoji/font or openmoji/font)
   */
  const fontClass = computed(() => `openmoji-${variant.value}`)

  /**
   * OpenMoji font-face CSS string for loading the font
   */
  function getFontFaceCSS(fontBaseUrl) {
    const base = fontBaseUrl || 'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@latest/font'
    return `
@font-face {
  font-family: 'OpenMoji-Color';
  src: url('${base}/OpenMoji-color.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: 'OpenMoji-Black';
  src: url('${base}/OpenMoji-black.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
`.trim()
  }

  return {
    variant,
    format,
    size,
    basePath,
    fontClass,
    emojiToHex,
    getSvgUrl,
    getPngUrl,
    getEmojiUrl,
    getFontFaceCSS,
  }
}
