import { ref, computed } from 'vue'
import gitmojisData from 'gitmojis/src/gitmojis.json'

/**
 * useGitmoji — Gitmoji commit emoji composable
 *
 * Provides access to gitmoji data for building commit-style emoji UIs.
 * Uses the gitmojis npm package (from github.com/carloscuesta/gitmoji)
 * which contains the full list of emoji-commit-convention entries.
 *
 * Each gitmoji has: { emoji, entity, code, description, name, semver }
 *
 * @example
 * const { gitmojis, search, findByCode, categories } = useGitmoji()
 * await search('fix')
 * console.log(gitmojis.value) // [{ emoji: '🐛', code: ':bug:', description: 'Fix a bug.', ... }, ...]
 */
export function useGitmoji() {
  const searchQuery = ref('')
  const gitmojis = ref(gitmojisData.gitmojis || [])

  /**
   * Search gitmojis by keyword (matches description, name, and code)
   */
  function search(query) {
    searchQuery.value = query
    if (!query) {
      gitmojis.value = gitmojisData.gitmojis || []
      return gitmojis.value
    }
    const q = query.toLowerCase()
    gitmojis.value = (gitmojisData.gitmojis || []).filter(
      (g) =>
        g.description.toLowerCase().includes(q) ||
        g.name.toLowerCase().includes(q) ||
        g.code.toLowerCase().includes(q),
    )
    return gitmojis.value
  }

  /**
   * Find a gitmoji by its :code: string (e.g. ':bug:')
   */
  function findByCode(code) {
    return (gitmojisData.gitmojis || []).find((g) => g.code === code)
  }

  /**
   * Find a gitmoji by its emoji character (e.g. '🐛')
   */
  function findByEmoji(emoji) {
    return (gitmojisData.gitmojis || []).find((g) => g.emoji === emoji)
  }

  /**
   * Get gitmojis grouped by semver impact
   */
  const bySemver = computed(() => {
    const groups = { major: [], minor: [], patch: [], none: [] }
    for (const g of gitmojisData.gitmojis || []) {
      const key = g.semver || 'none'
      if (groups[key]) groups[key].push(g)
      else groups.none.push(g)
    }
    return groups
  })

  /**
   * Format a commit message with gitmoji prefix
   */
  function formatCommitMessage(gitmojiCode, message, scope) {
    const g = findByCode(gitmojiCode)
    if (!g) return message
    const scopeStr = scope ? `(${scope})` : ''
    return `${g.emoji}${scopeStr}: ${message}`
  }

  /**
   * Get all unique semver categories
   */
  const semverCategories = computed(() => {
    const cats = new Set()
    for (const g of gitmojisData.gitmojis || []) {
      cats.add(g.semver || 'none')
    }
    return [...cats]
  })

  const hasResults = computed(() => gitmojis.value.length > 0)

  return {
    gitmojis,
    searchQuery,
    hasResults,
    bySemver,
    semverCategories,
    search,
    findByCode,
    findByEmoji,
    formatCommitMessage,
  }
}
