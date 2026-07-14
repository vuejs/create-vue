import Particles from '@tsparticles/vue3'
import { loadSlim } from 'tsparticles-slim'
import { loadFireworksPreset } from 'tsparticles-preset-fireworks'

/**
 * Vue Particles & Fireworks Plugin
 *
 * Integrates tsParticles (highly customizable particles, confetti, fireworks)
 * and @fireworks-js/vue (lightweight fireworks canvas) into Vue apps.
 *
 * Powered by:
 *   - @tsparticles/vue3 — Official Vue 3 wrapper for tsParticles
 *   - tsparticles-slim — Lightweight core + common shapes
 *   - tsparticles-preset-fireworks — Ready-made fireworks preset
 *   - @fireworks-js/vue — Simple, performant fireworks component
 */
export default {
  install(app, options = {}) {
    // Register tsParticles Vue plugin
    app.use(Particles, {
      init: async (engine) => {
        // Load slim engine (lightweight)
        await loadSlim(engine)

        // Optionally load fireworks preset (adds fireworks preset)
        if (options.enableFireworksPreset !== false) {
          try {
            await loadFireworksPreset(engine)
          } catch (e) {
            // Preset may not be required; graceful fallback
            console.warn('[particles] Could not load fireworks preset:', e.message)
          }
        }
      },
    })

    // Provide global config for particles/fireworks
    app.provide('particlesConfig', {
      // Default particle options (can be overridden per-component)
      defaultOptions: options.defaultOptions || {
        particles: {
          number: { value: 80 },
          color: { value: '#ffffff' },
          shape: { type: 'circle' },
          opacity: { value: 0.8 },
          size: { value: { min: 1, max: 3 } },
          move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            outModes: { default: 'out' },
          },
          links: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
            width: 1,
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'repulse' },
            onClick: { enable: true, mode: 'push' },
          },
          modes: {
            repulse: { distance: 100 },
            push: { quantity: 4 },
          },
        },
        detectRetina: true,
      },

      // Fireworks preset defaults
      fireworksOptions: options.fireworksOptions || {
        preset: 'fireworks',
        background: { color: { value: 'transparent' } },
        particles: {
          number: { value: 0 },
          shape: { type: 'circle' },
          size: { value: 3 },
          move: { speed: { min: 5, max: 15 } },
        },
      },

      // Enable/disable specific effects globally
      enableConfetti: options.enableConfetti !== false,
      enableFireworks: options.enableFireworks !== false,
    })

    // Expose helper methods globally
    app.config.globalProperties.$particles = {
      loadFireworksPreset: () => loadFireworksPreset,
      loadSlim,
    }
  },
}
