<script setup>
import { computed, inject } from 'vue'

/**
 * GitmojiIcon — Renders a gitmoji with optional code label
 *
 * Displays a gitmoji from the gitmoji convention (github.com/carloscuesta/gitmoji)
 * with optional description tooltip and code badge.
 *
 * @example
 * <GitmojiIcon code=":bug:" />
 * <GitmojiIcon emoji="🐛" show-label />
 * <GitmojiIcon code=":sparkles:" animated />
 */
const props = defineProps({
  /** Gitmoji :code: string, e.g. ':bug:' */
  code: { type: String, default: '' },
  /** Direct emoji character, e.g. '🐛' */
  emoji: { type: String, default: '' },
  /** Show the :code: label below the emoji */
  showLabel: { type: Boolean, default: false },
  /** Show description on hover */
  showTooltip: { type: Boolean, default: true },
  /** Emoji size in pixels */
  size: { type: Number, default: 24 },
  /** Apply bounce animation */
  animated: { type: Boolean, default: false },
  /** Color style: 'native' | 'openmoji' */
  style: { type: String, default: 'native' },
})

const config = inject('emojiConfig', { gitmojiEnabled: true })

// Static gitmoji lookup map (most commonly used)
const gitmojiMap = {
  ':art:': { emoji: '🎨', description: 'Improve structure / format of the code' },
  ':zap:': { emoji: '⚡️', description: 'Improve performance' },
  ':fire:': { emoji: '🔥', description: 'Remove code or files' },
  ':bug:': { emoji: '🐛', description: 'Fix a bug' },
  ':ambulance:': { emoji: '🚑️', description: 'Critical hotfix' },
  ':sparkles:': { emoji: '✨', description: 'Introduce new features' },
  ':memo:': { emoji: '📝', description: 'Add or update documentation' },
  ':rocket:': { emoji: '🚀', description: 'Deploy stuff' },
  ':lipstick:': { emoji: '💄', description: 'Add or update the UI and style files' },
  ':tada:': { emoji: '🎉', description: 'Begin a project' },
  ':white_check_mark:': { emoji: '✅', description: 'Add, update, or pass tests' },
  ':lock:': { emoji: '🔒️', description: 'Fix security or privacy issues' },
  ':closed_lock_with_key:': { emoji: '🔐', description: 'Add or update secrets' },
  ':bookmark:': { emoji: '🔖', description: 'Release / Version tags' },
  ':rotating_light:': { emoji: '🚨', description: 'Fix compiler / linter warnings' },
  ':construction:': { emoji: '🚧', description: 'Work in progress' },
  ':green_heart:': { emoji: '💚', description: 'Fix CI Build' },
  ':arrow_down:': { emoji: '⬇️', description: 'Downgrade dependencies' },
  ':arrow_up:': { emoji: '⬆️', description: 'Upgrade dependencies' },
  ':pushpin:': { emoji: '📌', description: 'Pin dependencies to specific versions' },
  ':construction_worker:': { emoji: '👷', description: 'Add or update CI build system' },
  ':chart_with_upwards_trend:': { emoji: '📈', description: 'Add or update analytics or track code' },
  ':recycle:': { emoji: '♻️', description: 'Refactor code' },
  ':whale:': { emoji: '🐳', description: 'Work about Docker' },
  ':heavy_plus_sign:': { emoji: '➕', description: 'Add a dependency' },
  ':heavy_minus_sign:': { emoji: '➖', description: 'Remove a dependency' },
  ':wrench:': { emoji: '🔧', description: 'Add or update configuration files' },
  ':hammer:': { emoji: '🔨', description: 'Add or update development scripts' },
  ':globe_with_meridians:': { emoji: '🌐', description: 'Internationalization and localization' },
  ':pencil2:': { emoji: '✏️', description: 'Fix typos' },
  ':poop:': { emoji: '💩', description: 'Write bad code that needs to be improved' },
  ':rewind:': { emoji: '⏪️', description: 'Revert changes' },
  ':twisted_rightwards_arrows:': { emoji: '🔀', description: 'Merge branches' },
  ':package:': { emoji: '📦️', description: 'Add or update compiled files or packages' },
  ':alien:': { emoji: '👽️', description: 'Update code due to external API changes' },
  ':truck:': { emoji: '🚚', description: 'Move or rename resources' },
  ':page_facing_up:': { emoji: '📄', description: 'Add or update license' },
  ':boom:': { emoji: '💥', description: 'Introduce breaking changes' },
  ':bento:': { emoji: '🍱', description: 'Add or update assets' },
  ':wheelchair:': { emoji: '♿️', description: 'Improve accessibility' },
  ':bulb:': { emoji: '💡', description: 'Add or update comments in source code' },
  ':beers:': { emoji: '🍻', description: 'Write code drunkenly' },
  ':speech_balloon:': { emoji: '💬', description: 'Add or update text and literals' },
  ':card_file_box:': { emoji: '🗃️', description: 'Perform database related changes' },
  ':loud_sound:': { emoji: '🔊', description: 'Add or update logs' },
  ':mute:': { emoji: '🔇', description: 'Remove logs' },
  ':busts_in_silhouette:': { emoji: '👥', description: 'Add or update contributor(s)' },
  ':children_crossing:': { emoji: '🚸', description: 'Improve user experience / usability' },
  ':building_construction:': { emoji: '🏗️', description: 'Make architectural changes' },
  ':iphone:': { emoji: '📱', description: 'Work on responsive design' },
  ':clown_face:': { emoji: '🤡', description: 'Mock things' },
  ':egg:': { emoji: '🥚', description: 'Add or update an easter egg' },
  ':see_no_evil:': { emoji: '🙈', description: 'Add or update a .gitignore file' },
  ':camera_flash:': { emoji: '📸', description: 'Add or update snapshots' },
  ':alembic:': { emoji: '⚗️', description: 'Perform experiments' },
  ':mag:': { emoji: '🔍️', description: 'Improve SEO' },
  ':label:': { emoji: '🏷️', description: 'Add or update types' },
  ':seedling:': { emoji: '🌱', description: 'Add or update seed files' },
  ':triangular_flag_on_post:': { emoji: '🚩', description: 'Add, update, or remove feature flags' },
  ':goal_net:': { emoji: '🥅', description: 'Catch errors' },
  ':dizzy:': { emoji: '💫', description: 'Add or update animations and transitions' },
  ':wastebasket:': { emoji: '🗑️', description: 'Deprecate code that needs to be cleaned up' },
  ':passport_control:': { emoji: '🛂', description: 'Work on code related to authorization' },
  ':adhesive_bandage:': { emoji: '🩹', description: 'Simple fix for a non-critical issue' },
  ':monocle_face:': { emoji: '🧐', description: 'Data exploration / inspection' },
  ':coffin:': { emoji: '⚰️', description: 'Remove dead code' },
  ':test_tube:': { emoji: '🧪', description: 'Add a failing test' },
  ':necktie:': { emoji: '👔', description: 'Add or update business logic' },
  ':stethoscope:': { emoji: '🩺', description: 'Add or update healthcheck' },
  ':bricks:': { emoji: '🧱', description: 'Infrastructure related changes' },
  ':technologist:': { emoji: '🧑‍💻', description: 'Improve developer experience' },
  ':money_with_wings:': { emoji: '💸', description: 'Add sponsorships or money related infrastructure' },
  ':thread:': { emoji: '🧵', description: 'Add or update code related to multithreading or concurrency' },
  ':safety_vest:': { emoji: '🦺', description: 'Add or update code related to validation' },
}

const gitmojiInfo = computed(() => {
  if (props.code) {
    return gitmojiMap[props.code] || { emoji: props.code, description: '' }
  }
  if (props.emoji) {
    const entry = Object.values(gitmojiMap).find((g) => g.emoji === props.emoji)
    return entry || { emoji: props.emoji, description: '' }
  }
  return { emoji: '', description: '' }
})

const displayEmoji = computed(() => props.emoji || gitmojiInfo.value.emoji)
const label = computed(() => props.code || '')
const description = computed(() => gitmojiInfo.value.description)

const fontSize = computed(() => `${props.size}px`)
</script>

<template>
  <span
    class="gitmoji-icon"
    :class="{ 'gitmoji-icon--animated': animated }"
    :style="{ fontSize }"
    :title="showTooltip && description ? description : undefined"
    role="img"
    :aria-label="description || label"
  >
    <span class="gitmoji-icon__emoji">{{ displayEmoji }}</span>
    <span v-if="showLabel" class="gitmoji-icon__label">{{ label }}</span>
  </span>
</template>

<style scoped>
.gitmoji-icon {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
  user-select: none;
}

.gitmoji-icon__emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.gitmoji-icon__label {
  font-size: 0.5em;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  color: #6b7280;
  white-space: nowrap;
}

.gitmoji-icon--animated .gitmoji-icon__emoji:hover {
  animation: gitmoji-bounce 0.4s ease;
}

@keyframes gitmoji-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}
</style>
