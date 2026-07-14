<script setup>
import { inject, computed } from 'vue'

/**
 * ParticlesBackground — Beautiful particle effects powered by tsParticles
 *
 * Supports all tsparticles options + common presets (confetti, fireworks, etc.).
 * Ideal for animated backgrounds, hero sections, or decorative elements.
 *
 * @example
 * <ParticlesBackground id="tsparticles" :options="options" />
 * <ParticlesBackground preset="fireworks" :full-screen="true" />
 */
const props = defineProps({
  /** Unique id for the particles container */
  id: { type: String, default: 'tsparticles' },

  /** Full tsparticles options object (overrides preset) */
  options: { type: Object, default: null },

  /** Preset name: 'fireworks', 'confetti', 'snow', 'links', etc. */
  preset: { type: String, default: null },

  /** Make canvas full-screen */
  fullScreen: { type: Boolean, default: false },

  /** Background color (CSS value) */
  background: { type: String, default: 'transparent' },

  /** Height of container (when not fullScreen) */
  height: { type: [String, Number], default: '100%' },

  /** Width of container */
  width: { type: [String, Number], default: '100%' },

  /** Z-index of canvas */
  zIndex: { type: Number, default: -1 },

  /** Emit when particles are loaded */
  particlesLoaded: { type: Function, default: null },
})

const emit = defineEmits(['particles-loaded', 'particles-error'])

const config = inject('particlesConfig', {})

const containerStyle = computed(() => ({
  position: props.fullScreen ? 'fixed' : 'relative',
  top: props.fullScreen ? '0' : undefined,
  left: props.fullScreen ? '0' : undefined,
  width: props.fullScreen ? '100vw' : typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: props.fullScreen ? '100vh' : typeof props.height === 'number' ? `${props.height}px` : props.height,
  zIndex: props.zIndex,
  pointerEvents: props.fullScreen ? 'none' : 'auto',
  background: props.background,
}))

const particlesOptions = computed(() => {
  if (props.options) return props.options

  const base = { ...config.defaultOptions }

  if (props.preset === 'fireworks') {
    return {
      ...base,
      ...config.fireworksOptions,
      preset: 'fireworks',
      background: { color: { value: props.background } },
    }
  }

  if (props.preset) {
    // Allow dynamic preset loading if supported
    return {
      ...base,
      preset: props.preset,
    }
  }

  return base
})

function onParticlesLoaded(container) {
  emit('particles-loaded', container)
  if (props.particlesLoaded) props.particlesLoaded(container)
}

function onParticlesError(err) {
  console.error('[ParticlesBackground] Error:', err)
  emit('particles-error', err)
}
</script>

<template>
  <div :style="containerStyle" class="particles-container">
    <vue-particles
      :id="id"
      :options="particlesOptions"
      @particles-loaded="onParticlesLoaded"
      @particles-error="onParticlesError"
    />
  </div>
</template>

<style scoped>
.particles-container {
  overflow: hidden;
}
</style>
