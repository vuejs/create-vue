import { ref, computed, inject } from 'vue'
import data from '@emoji-mart/data'
import { init } from 'emoji-mart'

/**
 * useEmojiPicker — Reactive emoji picker state composable
 *
 * Manages the picker state (open/close, selected emoji, skin tone,
 * recent emojis) and provides methods for controlling the picker.
 *
 * Supports emoji sets from: native, noto-emoji, google-emoji,
 * openmoji (color/black), and custom sources.
 *
 * @example
 * const { isOpen, toggle, selectedEmoji, recentEmojis, selectEmoji } = useEmojiPicker()
 */
export function useEmojiPicker(options = {}) {
  const config = inject('emojiConfig', {
    animation: 'bounce',
    set: 'native',
    interactive: true,
    skin: 1,
    retroAnimated: false,
    custom: [],
  })

  const isOpen = ref(false)
  const selectedEmoji = ref(null)
  const skinTone = ref(options.skin || config.skin)
  const recentEmojis = ref([])
  const searchQuery = ref('')

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function selectEmoji(emoji) {
    selectedEmoji.value = emoji

    // Track recent emojis (deduplicated, max 20)
    const existing = recentEmojis.value.findIndex((e) => e.id === emoji.id)
    if (existing > -1) {
      recentEmojis.value.splice(existing, 1)
    }
    recentEmojis.value.unshift(emoji)
    if (recentEmojis.value.length > 20) {
      recentEmojis.value.pop()
    }

    // Call the on-select callback if provided
    if (options.onSelect) {
      options.onSelect(emoji)
    }
  }

  function setSkinTone(tone) {
    skinTone.value = tone
  }

  const pickerConfig = computed(() => ({
    data,
    set: config.set,
    skin: skinTone.value,
    custom: [...config.custom],
    theme: options.theme || 'auto',
    locale: options.locale || 'en',
    perLine: options.perLine || 9,
    emojiSize: options.emojiSize || 24,
    emojiButtonSize: options.emojiButtonSize || 36,
    autoFocus: options.autoFocus || false,
    navPosition: options.navPosition || 'top',
    previewPosition: options.previewPosition || 'bottom',
    searchPosition: options.searchPosition || 'sticky',
  }))

  return {
    isOpen,
    selectedEmoji,
    skinTone,
    recentEmojis,
    searchQuery,
    pickerConfig,
    toggle,
    open,
    close,
    selectEmoji,
    setSkinTone,
  }
}
