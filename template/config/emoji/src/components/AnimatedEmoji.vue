<script setup>
import { ref, computed, inject, onMounted } from 'vue'

/**
 * AnimatedEmoji — Renders an emoji with CSS animations
 *
 * Supports multiple animation styles and interactive behaviors.
 * Uses native emoji rendering with CSS animation overlays,
 * and can load animated GIF sprites from google-emoji for
 * retro animated pixel art emojis.
 *
 * Powered by assets from:
 *   - noto-emoji (high-quality SVG color emoji)
 *   - google-emoji (retro animated pixel GIF emojis)
 *   - gemoji (emoji name database for lookup)
 *   - openmoji (open-source SVG/PNG emoji, color & black variants)
 *   - gitmoji (emoji guide for commit messages)
 *
 * @example
 * <AnimatedEmoji emoji="🎉" animation="bounce" :size="48" />
 * <AnimatedEmoji emoji="❤️" animation="pulse" interactive />
 * <AnimatedEmoji emoji="🔥" animation="wiggle" :speed="0.8" />
 */
const props = defineProps({
  /** Emoji character or emoji-mart ID */
  emoji: { type: String, required: true },
  /** Animation type: bounce, wiggle, pulse, spin, float, shake, none */
  animation: { type: String, default: undefined },
  /** Animation speed multiplier (0.1 - 3.0) */
  speed: { type: Number, default: 1 },
  /** Size in pixels */
  size: { type: Number, default: 32 },
  /** Enable interactive hover/click effects */
  interactive: { type: Boolean, default: undefined },
  /** Animation delay in seconds */
  delay: { type: Number, default: 0 },
  /** Number of animation iterations (0 = infinite) */
  iterations: { type: Number, default: 0 },
  /** Use retro animated GIF style from google-emoji */
  retro: { type: Boolean, default: false },
})

const emit = defineEmits(['click', 'mouseenter', 'mouseleave', 'animationEnd'])

const config = inject('emojiConfig', {
  animation: 'bounce',
  interactive: true,
  retroAnimated: false,
})

const isHovered = ref(false)
const isClicked = ref(false)
const animating = ref(true)

const activeAnimation = computed(() => props.animation || config.animation)
const isInteractive = computed(() =>
  props.interactive !== undefined ? props.interactive : config.interactive,
)
const isRetro = computed(() => props.retro || config.retroAnimated)

const animationDuration = computed(() => {
  const baseDurations = {
    bounce: 0.6,
    wiggle: 0.5,
    pulse: 1.0,
    spin: 1.5,
    float: 2.0,
    shake: 0.4,
    none: 0,
  }
  const base = baseDurations[activeAnimation.value] || 0.6
  return `${base / props.speed}s`
})

const animationIterationCount = computed(() =>
  props.iterations === 0 ? 'infinite' : props.iterations,
)

const animationStyle = computed(() => {
  if (activeAnimation.value === 'none' || !animating.value) return {}

  return {
    animationDuration: animationDuration.value,
    animationDelay: `${props.delay}s`,
    animationIterationCount: animationIterationCount.value,
    animationName: `emoji-${activeAnimation.value}`,
    animationTimingFunction: 'ease-in-out',
    animationFillMode: 'both',
  }
})

const fontSize = computed(() => `${props.size}px`)

function handleClick(e) {
  if (isInteractive.value) {
    isClicked.value = true
    setTimeout(() => (isClicked.value = false), 300)
  }
  emit('click', e)
}

function handleMouseEnter(e) {
  isHovered.value = true
  emit('mouseenter', e)
}

function handleMouseLeave(e) {
  isHovered.value = false
  emit('mouseleave', e)
}

function handleAnimationEnd() {
  animating.value = false
  emit('animationEnd')
}

function replay() {
  animating.value = false
  requestAnimationFrame(() => {
    animating.value = true
  })
}

defineExpose({ replay })
</script>

<template>
  <span
    class="animated-emoji"
    :class="[
      `animated-emoji--${activeAnimation}`,
      {
        'animated-emoji--interactive': isInteractive,
        'animated-emoji--hovered': isHovered,
        'animated-emoji--clicked': isClicked,
        'animated-emoji--retro': isRetro,
      },
    ]"
    :style="[{ fontSize }, animationStyle]"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @animationend="handleAnimationEnd"
    role="img"
    :aria-label="emoji"
  >
    {{ emoji }}
  </span>
</template>

<style scoped>
.animated-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  user-select: none;
  transition: transform 0.2s ease;
}

.animated-emoji--interactive {
  cursor: pointer;
}

.animated-emoji--interactive:hover {
  transform: scale(1.15);
}

.animated-emoji--interactive:active {
  transform: scale(0.9);
}

.animated-emoji--clicked {
  transform: scale(1.3) !important;
}

/* === Animation Keyframes === */

/* Bounce - playful up-down motion */
@keyframes emoji-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-8px);
  }
  50% {
    transform: translateY(0);
  }
  75% {
    transform: translateY(-4px);
  }
}

/* Wiggle - side-to-side wobble */
@keyframes emoji-wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(8deg);
  }
  30% {
    transform: rotate(-6deg);
  }
  45% {
    transform: rotate(4deg);
  }
  60% {
    transform: rotate(-2deg);
  }
  75% {
    transform: rotate(1deg);
  }
}

/* Pulse - scale in/out breathing */
@keyframes emoji-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.85;
  }
}

/* Spin - rotation */
@keyframes emoji-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Float - gentle floating */
@keyframes emoji-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-6px) rotate(2deg);
  }
  50% {
    transform: translateY(-2px) rotate(0deg);
  }
  75% {
    transform: translateY(-8px) rotate(-2deg);
  }
}

/* Shake - rapid oscillation */
@keyframes emoji-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-3px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(3px);
  }
}

/* Retro pixel-art style for google-emoji GIFs */
.animated-emoji--retro {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
