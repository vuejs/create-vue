import { ref, computed, onMounted } from 'vue'
import { SearchIndex, init, getEmojiDataFromNative } from 'emoji-mart'
import data from '@emoji-mart/data'

/**
 * useEmoji — Headless emoji search & data composable
 *
 * Provides reactive emoji search, lookup, and data access
 * without any UI — perfect for building your own emoji UI.
 *
 * Powered by: emoji-mart, noto-emoji, google-emoji, gemoji,
 * openmoji, and gitmoji.
 *
 * @example
 * const { results, search, getByNative } = useEmoji()
 * await search('heart')
 * console.log(results.value) // [{ id, name, native, shortcodes, ... }, ...]
 */
export function useEmoji() {
  const initialized = ref(false)
  const results = ref([])
  const searchQuery = ref('')
  const loading = ref(false)

  onMounted(() => {
    if (!initialized.value) {
      init({ data })
      initialized.value = true
    }
  })

  /**
   * Search emojis by keyword
   */
  async function search(query) {
    searchQuery.value = query
    if (!query) {
      results.value = []
      return
    }
    loading.value = true
    try {
      const emojis = await SearchIndex.search(query)
      results.value = emojis.map((emoji) => ({
        id: emoji.id,
        name: emoji.name,
        native: emoji.skins?.[0]?.native || '',
        shortcodes: emoji.skins?.[0]?.shortcodes || '',
        keywords: emoji.keywords || [],
        unified: emoji.skins?.[0]?.unified || '',
        skins: emoji.skins || [],
      }))
    } finally {
      loading.value = false
    }
    return results.value
  }

  /**
   * Get emoji data from a native emoji character
   * @param {string} native - e.g. '👍'
   */
  async function getByNative(native) {
    if (!initialized.value) {
      init({ data })
      initialized.value = true
    }
    return getEmojiDataFromNative(native)
  }

  /**
   * Get emoji by its emoji-mart ID
   */
  async function getById(id) {
    if (!initialized.value) {
      init({ data })
      initialized.value = true
    }
    return SearchIndex.search(id).then((r) => r.find((e) => e.id === id))
  }

  const hasResults = computed(() => results.value.length > 0)

  return {
    results,
    searchQuery,
    loading,
    hasResults,
    search,
    getByNative,
    getById,
  }
}
