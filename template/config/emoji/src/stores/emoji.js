import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Emoji Store — Pinia store for emoji state management
 *
 * Manages emoji picker state, recent emojis, favorites,
 * and configuration. Works with Pinia + Emoji plugin together.
 *
 * Powered by emoji-mart, noto-emoji, google-emoji, gemoji,
 * openmoji, and gitmoji.
 */
export const useEmojiStore = defineStore('emoji', () => {
  // State
  const recentEmojis = ref([])
  const favoriteEmojis = ref([])
  const skinTone = ref(1)
  const emojiSet = ref('native')
  const animationStyle = ref('bounce')
  const retroAnimated = ref(false)
  const pickerOpen = ref(false)
  const openmojiVariant = ref('color') // 'color' | 'black'
  const openmojiFormat = ref('svg') // 'svg' | 'png'
  const gitmojiEnabled = ref(true)

  // Getters
  const hasRecentEmojis = computed(() => recentEmojis.value.length > 0)
  const hasFavoriteEmojis = computed(() => favoriteEmojis.value.length > 0)

  // Actions
  function addToRecent(emoji) {
    const existing = recentEmojis.value.findIndex((e) => e.id === emoji.id)
    if (existing > -1) {
      recentEmojis.value.splice(existing, 1)
    }
    recentEmojis.value.unshift({
      id: emoji.id,
      name: emoji.name,
      native: emoji.native || emoji.skins?.[0]?.native || '',
      shortcodes: emoji.shortcodes || '',
      skin: emoji.skin,
    })
    // Keep max 40 recent
    if (recentEmojis.value.length > 40) {
      recentEmojis.value.pop()
    }
  }

  function toggleFavorite(emoji) {
    const index = favoriteEmojis.value.findIndex((e) => e.id === emoji.id)
    if (index > -1) {
      favoriteEmojis.value.splice(index, 1)
    } else {
      favoriteEmojis.value.push({
        id: emoji.id,
        name: emoji.name,
        native: emoji.native || emoji.skins?.[0]?.native || '',
        shortcodes: emoji.shortcodes || '',
      })
    }
  }

  function isFavorite(emojiId) {
    return favoriteEmojis.value.some((e) => e.id === emojiId)
  }

  function removeFromRecent(emojiId) {
    recentEmojis.value = recentEmojis.value.filter((e) => e.id !== emojiId)
  }

  function setSkinTone(tone) {
    skinTone.value = tone
  }

  function setEmojiSet(set) {
    emojiSet.value = set
  }

  function setOpenmojiVariant(v) {
    openmojiVariant.value = v
  }

  function setOpenmojiFormat(f) {
    openmojiFormat.value = f
  }

  function setGitmojiEnabled(enabled) {
    gitmojiEnabled.value = enabled
  }

  function setAnimationStyle(style) {
    animationStyle.value = style
  }

  function toggleRetroAnimated() {
    retroAnimated.value = !retroAnimated.value
  }

  function togglePicker() {
    pickerOpen.value = !pickerOpen.value
  }

  function openPicker() {
    pickerOpen.value = true
  }

  function closePicker() {
    pickerOpen.value = false
  }

  function clearRecent() {
    recentEmojis.value = []
  }

  function clearFavorites() {
    favoriteEmojis.value = []
  }

  return {
    // State
    recentEmojis,
    favoriteEmojis,
    skinTone,
    emojiSet,
    animationStyle,
    retroAnimated,
    pickerOpen,
    openmojiVariant,
    openmojiFormat,
    gitmojiEnabled,
    // Getters
    hasRecentEmojis,
    hasFavoriteEmojis,
    // Actions
    addToRecent,
    toggleFavorite,
    isFavorite,
    removeFromRecent,
    setSkinTone,
    setEmojiSet,
    setOpenmojiVariant,
    setOpenmojiFormat,
    setGitmojiEnabled,
    setAnimationStyle,
    toggleRetroAnimated,
    togglePicker,
    openPicker,
    closePicker,
    clearRecent,
    clearFavorites,
  }
})
