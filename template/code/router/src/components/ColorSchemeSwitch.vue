<script setup>
import IconMoon from './icons/Moon.vue'
import IconSun from './icons/Sun.vue'

import { watchEffect } from 'vue'
import useColorScheme from '@/composables/useColorScheme'

const { isDark, toggle } = useColorScheme()
watchEffect(() => {
  if (isDark.value) {
    window.document.body.setAttribute('data-color-scheme', 'dark')
  } else {
    window.document.body.setAttribute('data-color-scheme', 'light')
  }
})
</script>

<template>
  <label class="color-scheme-switch-wrapper">
    <span class="text">Color Scheme:</span>

    <button class="color-scheme-switch" @click="toggle">
      <div class="color-scheme-switch-check">
        <div class="color-scheme-switch-icon">
          <IconSun class="color-scheme-switch-svg is-sun" title="light" />
          <IconMoon class="color-scheme-switch-svg is-moon" title="dark" />
        </div>
      </div>
    </button>
  </label>
</template>

<style>
.color-scheme-switch-wrapper {
  background-color: var(--color-background-soft);
  border-radius: 8px;

  display: flex;
  justify-content: space-between;

  margin-top: 2em;
  padding: 12px 14px 12px 16px;
  line-height: 22px;

  cursor: pointer;
}

.color-scheme-switch-wrapper .text {
  font-weight: 500;
  font-size: 12px;
}

.color-scheme-switch {
  position: relative;
  margin-left: 1em;

  border-radius: 11px;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  background-color: var(--color-background-mute);
  transition: border-color 0.25s, background-color 0.25s;

  cursor: pointer;
}

.color-scheme-switch:hover {
  border-color: var(--color-border-hover);
}

.color-scheme-switch-check {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--color-background);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: background-color 0.25s, transform 0.25s;
}

[data-color-scheme='dark'] .color-scheme-switch-check {
  transform: translateX(18px);
}

.color-scheme-switch-icon {
  position: relative;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  overflow: hidden;
}

.color-scheme-switch-svg {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  color: var(--color-heading);
}

.color-scheme-switch-svg.is-sun {
  opacity: 1;
}
.color-scheme-switch-svg.is-moon {
  opacity: 0;
}

[data-color-scheme='dark'] .color-scheme-switch-svg.is-sun {
  opacity: 0;
}
[data-color-scheme='dark'] .color-scheme-switch-svg.is-moon {
  opacity: 1;
}

[data-color-scheme='dark'] .color-scheme-switch-svg {
  transition: opacity 0.25s;
}

@media (min-width: 1024px) {
  .color-scheme-switch-wrapper {
    justify-content: left;
    border: none;
    background-color: inherit;
    padding: 0;
    margin-top: 1.2em;
  }

  .color-scheme-switch-wrapper .text {
    font-size: 1.2rem;
    font-weight: normal;
  }
}
</style>
