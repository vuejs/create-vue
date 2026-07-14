<script setup>
import { ref, onMounted, watch, inject, computed } from 'vue'

/**
 * FireworksCanvas — Performant fireworks using @fireworks-js/vue
 *
 * Official Vue 3 component wrapper for the fireworks-js library.
 * Supports rich configuration and programmatic control.
 *
 * @example
 * <FireworksCanvas :options="{ hue: { min: 0, max: 360 } }" />
 * <FireworksCanvas :autostart="false" ref="fw" />
 */
const props = defineProps({
  /** Options passed directly to @fireworks-js */
  options: { type: Object, default: () => ({}) },

  /** Auto-start animation */
  autostart: { type: Boolean, default: true },

  /** Height of canvas container */
  height: { type: [String, Number], default: 400 },

  /** Width of container */
  width: { type: [String, Number], default: '100%' },

  /** z-index */
  zIndex: { type: Number, default: 1 },

  /** Background color */
  background: { type: String, default: 'transparent' },
})

const emit = defineEmits(['start', 'stop'])

const config = inject('particlesConfig', {})
const fwRef = ref(null)

const containerStyle = {
  position: 'relative',
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  zIndex: props.zIndex,
  background: props.background,
  overflow: 'hidden',
}

const mergedOptions = computed(() => ({
  ...config.fireworksOptions,
  ...props.options,
}))

function start() {
  if (fwRef.value) {
    fwRef.value.start()
    emit('start')
  }
}

function stop() {
  if (fwRef.value) {
    fwRef.value.stop()
    emit('stop')
  }
}

function launch(count = 5) {
  if (fwRef.value && fwRef.value.launch) {
    fwRef.value.launch(count)
  }
}

defineExpose({ start, stop, launch, getInstance: () => fwRef.value })

onMounted(() => {
  // The @fireworks-js/vue component handles its own initialization
  if (props.autostart && fwRef.value) {
    // slight delay to ensure canvas is ready
    setTimeout(() => {
      if (fwRef.value?.start) fwRef.value.start()
    }, 50)
  }
})

watch(
  () => props.options,
  () => {
    // @fireworks-js/vue accepts reactive options
  },
  { deep: true }
)
</script>

<template>
  <div :style="containerStyle" class="fireworks-wrapper">
    <Fireworks
      ref="fwRef"
      :options="mergedOptions"
      :style="{ width: '100%', height: '100%' }"
    />
    <slot />
  </div>
</template>

<style scoped>
.fireworks-wrapper {
  display: block;
}
</style>
