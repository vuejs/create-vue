import data from '@emoji-mart/data'
import { init } from 'emoji-mart'

/**
 * Vue Emoji Plugin
 *
 * Initializes emoji-mart data and provides global configuration
 * for animated & interactive emoji support in Vue apps.
 *
 * Powered by:
 *   - emoji-mart (picker & search)
 *   - noto-emoji (SVG color emoji)
 *   - google-emoji (retro animated pixel GIFs)
 *   - gemoji (emoji name/alias database)
 *   - openmoji (open-source SVG/PNG emoji, color & black variants + font)
 *   - gitmoji (emoji guide for commit messages)
 */
export default {
  install(app, options = {}) {
    // Initialize emoji-mart with the full emoji dataset
    init({ data })

    // Provide global emoji config to all components
    app.provide('emojiConfig', {
      // Default animation style: 'bounce' | 'wiggle' | 'pulse' | 'spin' | 'none'
      animation: options.animation || 'bounce',
      // Default emoji set: 'native' | 'apple' | 'google' | 'facebook' | 'twitter' | 'openmoji'
      set: options.set || 'native',
      // Enable interactive (click/hover/drag) behaviors
      interactive: options.interactive !== false,
      // Skin tone default (1-6)
      skin: options.skin || 1,
      // Enable retro animated GIF emojis from google-emoji
      retroAnimated: options.retroAnimated || false,
      // Custom emoji categories (emoji-mart custom format)
      custom: options.custom || [],
      // OpenMoji base path for SVG/PNG assets (CDN or local)
      openmojiBasePath:
        options.openmojiBasePath || 'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@latest/color/svg',
      // Gitmoji commit style enabled
      gitmojiEnabled: options.gitmojiEnabled !== false,
    })

    // Make init available globally for late initialization
    app.config.globalProperties.$emojiInit = init
  },
}
