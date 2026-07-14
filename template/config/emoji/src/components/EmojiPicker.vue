<script setup>
import { ref, onMounted, onBeforeUnmount, watch, inject } from 'vue'
import data from '@emoji-mart/data'
import { Picker } from 'emoji-mart'

/**
 * EmojiPicker — Vue wrapper around emoji-mart's web component
 *
 * A fully-featured emoji picker with search, skin tone selection,
 * categories, and custom emoji support.
 *
 * Integrates assets from:
 *   - emoji-mart (picker & search engine)
 *   - noto-emoji (SVG color emoji)
 *   - google-emoji (retro animated pixel GIFs)
 *   - gemoji (emoji name/alias database)
 *   - openmoji (open-source SVG/PNG emoji, color & black variants + font)
 *   - gitmoji (emoji guide for commit messages)
 *
 * @example
 * <EmojiPicker @select="onEmojiSelect" />
 *
 * @example
 * <EmojiPicker :skin="2" theme="dark" set="google" />
 */
const props = defineProps({
  /** Emoji set: native, apple, google, facebook, twitter */
  set: { type: String, default: undefined },
  /** Skin tone: 1-6 */
  skin: { type: Number, default: undefined },
  /** Theme: auto, light, dark */
  theme: { type: String, default: 'auto' },
  /** Locale for i18n */
  locale: { type: String, default: 'en' },
  /** Number of emojis per line */
  perLine: { type: Number, default: 9 },
  /** Emoji size in pixels */
  emojiSize: { type: Number, default: 24 },
  /** Emoji button size in pixels */
  emojiButtonSize: { type: Number, default: 36 },
  /** Auto-focus search input */
  autoFocus: { type: Boolean, default: false },
  /** Navigation bar position: top, bottom, none */
  navPosition: { type: String, default: 'top' },
  /** Preview position: top, bottom, none */
  previewPosition: { type: String, default: 'bottom' },
  /** Search position: sticky, static, none */
  searchPosition: { type: String, default: 'sticky' },
  /** Max frequent emoji rows */
  maxFrequentRows: { type: Number, default: 4 },
  /** Custom emoji categories */
  custom: { type: Array, default: () => [] },
  /** Exclude specific emoji IDs */
  exceptEmojis: { type: Array, default: () => [] },
})

const emit = defineEmits(['select'])

const config = inject('emojiConfig', {})
const pickerRef = ref(null)
const pickerEl = ref(null)

onMounted(() => {
  pickerEl.value = new Picker({
    data,
    set: props.set || config.set || 'native',
    skin: props.skin || config.skin || 1,
    theme: props.theme,
    locale: props.locale,
    perLine: props.perLine,
    emojiSize: props.emojiSize,
    emojiButtonSize: props.emojiButtonSize,
    autoFocus: props.autoFocus,
    navPosition: props.navPosition,
    previewPosition: props.previewPosition,
    searchPosition: props.searchPosition,
    maxFrequentRows: props.maxFrequentRows,
    custom: props.custom?.length ? props.custom : config.custom || [],
    exceptEmojis: props.exceptEmojis,
    onEmojiSelect: (emoji) => {
      emit('select', emoji)
    },
  })

  if (pickerRef.value) {
    pickerRef.value.appendChild(pickerEl.value)
  }
})

onBeforeUnmount(() => {
  if (pickerEl.value && pickerEl.value.parentNode) {
    pickerEl.value.parentNode.removeChild(pickerEl.value)
  }
})

// Update picker when props change
watch(
  () => [props.set, props.skin, props.theme, props.locale],
  () => {
    if (pickerEl.value) {
      if (props.set) pickerEl.value.set = props.set
      if (props.skin) pickerEl.value.skin = props.skin
      if (props.theme) pickerEl.value.theme = props.theme
      if (props.locale) pickerEl.value.locale = props.locale
    }
  },
)
</script>

<template>
  <div ref="pickerRef" class="emoji-picker-wrapper"></div>
</template>

<style scoped>
.emoji-picker-wrapper {
  display: inline-block;
}

.emoji-picker-wrapper :deep(em-emoji-picker) {
  --border-radius: 12px;
  --color-border: transparent;
  --emoji-padding: 4px;
  --emoji-size: var(--emoji-size-override, 24px);
}
</style>
