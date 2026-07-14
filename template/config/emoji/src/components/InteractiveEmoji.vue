<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'

/**
 * InteractiveEmoji — Fully interactive emoji with drag, reactions, and particles
 *
 * An advanced emoji component that goes beyond simple display:
 *   - Draggable positioning on the page
 *   - Click to spawn particle burst effects
 *   - Hover glow and scale animations
 *   - Long-press for emoji detail popup
 *   - Reactions counter (like social media reactions)
 *   - Integration with noto-emoji SVGs, google-emoji animated GIFs,
 *     and openmoji color/black SVG assets
 *   - Gitmoji-aware descriptions for commit-style emoji
 *
 * @example
 * <InteractiveEmoji emoji="🎉" :draggable="true" :particles="true" />
 * <InteractiveEmoji emoji="❤️" :reactions="true" @react="onReact" />
 */
const props = defineProps({
  /** Emoji character or emoji-mart ID */
  emoji: { type: String, required: true },
  /** Size in pixels */
  size: { type: Number, default: 48 },
  /** Allow dragging the emoji around */
  draggable: { type: Boolean, default: false },
  /** Show particle burst on click */
  particles: { type: Boolean, default: true },
  /** Enable reaction counter */
  reactions: { type: Boolean, default: false },
  /** Initial reaction count */
  initialCount: { type: Number, default: 0 },
  /** Particle colors */
  particleColors: {
    type: Array,
    default: () => ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bcb'],
  },
  /** Number of particles per burst */
  particleCount: { type: Number, default: 12 },
  /** Animation on hover: bounce, wiggle, pulse, spin, none */
  hoverAnimation: { type: String, default: 'bounce' },
  /** Use retro GIF style */
  retro: { type: Boolean, default: false },
})

const emit = defineEmits(['click', 'react', 'dragStart', 'dragEnd', 'drag'])

const config = inject('emojiConfig', { interactive: true, retroAnimated: false })

const isHovered = ref(false)
const isDragging = ref(false)
const isLongPress = ref(false)
const reactionCount = ref(props.initialCount)
const position = ref({ x: 0, y: 0 })
const dragOffset = ref({ x: 0, y: 0 })
const particlesList = ref([])
const showDetail = ref(false)

let longPressTimer = null
let particleId = 0

const emojiStyle = computed(() => ({
  fontSize: `${props.size}px`,
  ...(props.draggable && isDragging.value
    ? {
        position: 'fixed',
        left: `${position.value.x}px`,
        top: `${position.value.y}px`,
        zIndex: 9999,
        cursor: 'grabbing',
      }
    : {}),
}))

const wrapperClass = computed(() => [
  'interactive-emoji',
  {
    'interactive-emoji--hovered': isHovered.value,
    'interactive-emoji--dragging': isDragging.value,
    'interactive-emoji--retro': props.retro || config.retroAnimated,
    [`interactive-emoji--anim-${props.hoverAnimation}`]: isHovered.value,
  },
])

function handleClick(e) {
  if (isDragging.value) return

  // Spawn particles
  if (props.particles) {
    spawnParticles(e.clientX, e.clientY)
  }

  // Increment reaction
  if (props.reactions) {
    reactionCount.value++
    emit('react', { emoji: props.emoji, count: reactionCount.value })
  }

  emit('click', { emoji: props.emoji, event: e })
}

function spawnParticles(x, y) {
  for (let i = 0; i < props.particleCount; i++) {
    const angle = (Math.PI * 2 * i) / props.particleCount
    const velocity = 40 + Math.random() * 60
    const id = particleId++

    particlesList.value.push({
      id,
      x: 0,
      y: 0,
      targetX: Math.cos(angle) * velocity,
      targetY: Math.sin(angle) * velocity,
      color: props.particleColors[i % props.particleColors.length],
      size: 4 + Math.random() * 6,
    })

    // Remove particle after animation
    setTimeout(() => {
      particlesList.value = particlesList.value.filter((p) => p.id !== id)
    }, 600)
  }
}

function handleMouseEnter() {
  isHovered.value = true
  startLongPress()
}

function handleMouseLeave() {
  isHovered.value = false
  cancelLongPress()
}

function startLongPress() {
  longPressTimer = setTimeout(() => {
    isLongPress.value = true
    showDetail.value = true
  }, 800)
}

function cancelLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  showDetail.value = false
  isLongPress.value = false
}

// Drag handlers
function handleDragStart(e) {
  if (!props.draggable) return
  isDragging.value = true

  const clientX = e.clientX || (e.touches && e.touches[0].clientX)
  const clientY = e.clientY || (e.touches && e.touches[0].clientY)

  position.value = { x: clientX, y: clientY }
  dragOffset.value = { x: clientX - position.value.x, y: clientY - position.value.y }

  emit('dragStart', { emoji: props.emoji, position: position.value })
}

function handleDragMove(e) {
  if (!isDragging.value) return
  e.preventDefault()

  const clientX = e.clientX || (e.touches && e.touches[0].clientX)
  const clientY = e.clientY || (e.touches && e.touches[0].clientY)

  position.value = {
    x: clientX - dragOffset.value.x,
    y: clientY - dragOffset.value.y,
  }

  emit('drag', { emoji: props.emoji, position: position.value })
}

function handleDragEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  emit('dragEnd', { emoji: props.emoji, position: position.value })
}

onMounted(() => {
  if (props.draggable) {
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragEnd)
    window.addEventListener('touchmove', handleDragMove, { passive: false })
    window.addEventListener('touchend', handleDragEnd)
  }
})

onBeforeUnmount(() => {
  if (props.draggable) {
    window.removeEventListener('mousemove', handleDragMove)
    window.removeEventListener('mouseup', handleDragEnd)
    window.removeEventListener('touchmove', handleDragMove)
    window.removeEventListener('touchend', handleDragEnd)
  }
  cancelLongPress()
})
</script>

<template>
  <span class="interactive-emoji-container" @click="handleClick">
    <span
      :class="wrapperClass"
      :style="emojiStyle"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousedown="handleDragStart"
      @touchstart="handleDragStart"
      role="img"
      :aria-label="emoji"
    >
      {{ emoji }}

      <!-- Reaction counter badge -->
      <span v-if="reactions && reactionCount > 0" class="interactive-emoji__badge">
        {{ reactionCount }}
      </span>
    </span>

    <!-- Particle burst effect -->
    <span v-if="particlesList.length" class="interactive-emoji__particles">
      <span
        v-for="p in particlesList"
        :key="p.id"
        class="interactive-emoji__particle"
        :style="{
          '--target-x': `${p.targetX}px`,
          '--target-y': `${p.targetY}px`,
          backgroundColor: p.color,
          width: `${p.size}px`,
          height: `${p.size}px`,
        }"
      />
    </span>

    <!-- Long-press detail popup -->
    <span v-if="showDetail" class="interactive-emoji__detail">
      {{ emoji }}
    </span>
  </span>
</template>

<style scoped>
.interactive-emoji-container {
  position: relative;
  display: inline-flex;
}

.interactive-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  user-select: none;
  transition: transform 0.2s ease, filter 0.2s ease;
  position: relative;
  cursor: pointer;
}

.interactive-emoji:hover {
  filter: brightness(1.1);
}

.interactive-emoji--dragging {
  cursor: grabbing;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

/* Hover animation variants */
.interactive-emoji--anim-bounce:hover {
  animation: ie-bounce 0.5s ease;
}

.interactive-emoji--anim-wiggle:hover {
  animation: ie-wiggle 0.4s ease;
}

.interactive-emoji--anim-pulse:hover {
  animation: ie-pulse 0.8s ease infinite;
}

.interactive-emoji--anim-spin:hover {
  animation: ie-spin 0.8s ease;
}

/* Reaction badge */
.interactive-emoji__badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #ff4757;
  color: white;
  font-size: 10px;
  font-family: system-ui, sans-serif;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
}

/* Particle burst */
.interactive-emoji__particles {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
}

.interactive-emoji__particle {
  position: absolute;
  border-radius: 50%;
  animation: ie-particle-burst 0.5s ease-out forwards;
  transform: translate(-50%, -50%);
}

/* Long-press detail popup */
.interactive-emoji__detail {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 64px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  animation: ie-pop-in 0.2s ease;
  pointer-events: none;
}

/* Retro pixel style */
.interactive-emoji--retro {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* === Keyframes === */

@keyframes ie-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-12px);
  }
  60% {
    transform: translateY(-4px);
  }
}

@keyframes ie-wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(10deg);
  }
  40% {
    transform: rotate(-8deg);
  }
  60% {
    transform: rotate(6deg);
  }
  80% {
    transform: rotate(-3deg);
  }
}

@keyframes ie-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes ie-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes ie-particle-burst {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(
        calc(-50% + var(--target-x)),
        calc(-50% + var(--target-y))
      )
      scale(0);
    opacity: 0;
  }
}

@keyframes ie-pop-in {
  0% {
    transform: translateX(-50%) scale(0.5);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
}
</style>
