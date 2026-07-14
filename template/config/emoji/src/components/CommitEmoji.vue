<script setup>
import { ref, computed, onMounted } from 'vue'
import gitmojisRaw from 'gitmojis/src/gitmojis.json'

/**
 * CommitEmoji — Gitmoji-powered commit message builder component
 *
 * An interactive commit message composer that uses gitmoji conventions
 * from github.com/carloscuesta/gitmoji. Lets users pick a gitmoji,
 * type a scope and message, and generates a properly formatted commit string.
 *
 * @example
 * <CommitEmoji @commit="handleCommit" />
 */
const emit = defineEmits(['commit'])

const gitmojis = ref(gitmojisRaw.gitmojis || [])
const selectedGitmoji = ref(null)
const scope = ref('')
const message = ref('')
const searchQuery = ref('')
const isOpen = ref(false)

const filteredGitmojis = computed(() => {
  if (!searchQuery.value) return gitmojis.value
  const q = searchQuery.value.toLowerCase()
  return gitmojis.value.filter(
    (g) =>
      g.description.toLowerCase().includes(q) ||
      g.name.toLowerCase().includes(q) ||
      g.code.toLowerCase().includes(q) ||
      g.emoji === q,
  )
})

const commitMessage = computed(() => {
  if (!selectedGitmoji.value || !message.value) return ''
  const scopeStr = scope.value ? `(${scope.value})` : ''
  return `${selectedGitmoji.value.emoji}${scopeStr}: ${message.value}`
})

function selectGitmoji(g) {
  selectedGitmoji.value = g
  isOpen.value = false
  searchQuery.value = ''
}

function handleSubmit() {
  if (!commitMessage.value) return
  emit('commit', {
    emoji: selectedGitmoji.value.emoji,
    code: selectedGitmoji.value.code,
    scope: scope.value,
    message: message.value,
    full: commitMessage.value,
    semver: selectedGitmoji.value.semver,
  })
}

function reset() {
  selectedGitmoji.value = null
  scope.value = ''
  message.value = ''
}

function toggleOpen() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="commit-emoji">
    <div class="commit-emoji__preview">
      <span v-if="selectedGitmoji" class="commit-emoji__selected" @click="toggleOpen">
        {{ selectedGitmoji.emoji }}
      </span>
      <button v-else class="commit-emoji__pick-btn" @click="toggleOpen">
        Pick gitmoji…
      </button>
      <input
        v-model="scope"
        class="commit-emoji__scope"
        type="text"
        placeholder="scope"
        maxlength="30"
      />
      <span class="commit-emoji__colon">:</span>
      <input
        v-model="message"
        class="commit-emoji__message"
        type="text"
        placeholder="commit message"
        @keydown.enter="handleSubmit"
      />
      <button class="commit-emoji__submit" :disabled="!commitMessage" @click="handleSubmit">
        ✓
      </button>
    </div>

    <div v-if="isOpen" class="commit-emoji__dropdown">
      <input
        v-model="searchQuery"
        class="commit-emoji__search"
        type="text"
        placeholder="Search gitmoji…"
        autofocus
      />
      <ul class="commit-emoji__list">
        <li
          v-for="g in filteredGitmojis"
          :key="g.code"
          class="commit-emoji__item"
          :class="{ 'commit-emoji__item--selected': selectedGitmoji?.code === g.code }"
          @click="selectGitmoji(g)"
        >
          <span class="commit-emoji__item-emoji">{{ g.emoji }}</span>
          <span class="commit-emoji__item-code">{{ g.code }}</span>
          <span class="commit-emoji__item-desc">{{ g.description }}</span>
          <span v-if="g.semver" class="commit-emoji__item-semver" :data-semver="g.semver">
            {{ g.semver }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.commit-emoji {
  position: relative;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 14px;
}

.commit-emoji__preview {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
}

.commit-emoji__selected {
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 2px;
  border-radius: 4px;
  transition: background 0.15s;
}

.commit-emoji__selected:hover {
  background: #f3f4f6;
}

.commit-emoji__pick-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
}

.commit-emoji__pick-btn:hover {
  border-color: #9ca3af;
  color: #374151;
}

.commit-emoji__scope {
  width: 80px;
  padding: 4px 6px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.commit-emoji__scope:focus {
  border-color: #6366f1;
}

.commit-emoji__colon {
  color: #9ca3af;
  font-weight: 500;
}

.commit-emoji__message {
  flex: 1;
  padding: 4px 6px;
  border: none;
  outline: none;
  font-size: 13px;
  background: transparent;
}

.commit-emoji__submit {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: #6366f1;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
}

.commit-emoji__submit:hover:not(:disabled) {
  background: #4f46e5;
}

.commit-emoji__submit:disabled {
  background: #c7d2fe;
  cursor: not-allowed;
}

.commit-emoji__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 50;
  max-height: 320px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.commit-emoji__search {
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid #f3f4f6;
  outline: none;
  font-size: 13px;
}

.commit-emoji__list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  max-height: 280px;
}

.commit-emoji__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.1s;
}

.commit-emoji__item:hover {
  background: #f9fafb;
}

.commit-emoji__item--selected {
  background: #eef2ff;
}

.commit-emoji__item-emoji {
  font-size: 18px;
  flex-shrink: 0;
}

.commit-emoji__item-code {
  font-size: 12px;
  color: #6b7280;
  min-width: 140px;
}

.commit-emoji__item-desc {
  font-size: 12px;
  color: #374151;
  flex: 1;
}

.commit-emoji__item-semver {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.commit-emoji__item-semver[data-semver='major'] {
  background: #fee2e2;
  color: #dc2626;
}

.commit-emoji__item-semver[data-semver='minor'] {
  background: #fef3c7;
  color: #d97706;
}

.commit-emoji__item-semver[data-semver='patch'] {
  background: #dcfce7;
  color: #16a34a;
}
</style>
