import getCommand from './getCommand'

const sfcTypeSupportDoc = [
  '',
  '## Type Support for `.vue` Imports in TS',
  '',
  'TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.',
  '',
].join('\n')

export default function generateReadme({
  projectName,
  packageManager,
  needsTypeScript,
  needsCypress,
  needsCypressCT,
  needsPlaywright,
  needsVitest,
  needsEslint,
  needsEmoji,
  needsParticles,
}) {
  const commandFor = (scriptName: string, args?: string) =>
    getCommand(packageManager, scriptName, args)

  let readme = `# ${projectName}

This template should help get you started developing with Vue 3 in Vite.
${
  needsEmoji
    ? `
## 🎉 Animated & Interactive Emoji Support

This project includes emoji support powered by:

- **[emoji-mart](https://github.com/missive/emoji-mart)** — Customizable emoji picker with search, skin tones & categories
- **[noto-emoji](https://github.com/googlefonts/noto-emoji)** — Google's high-quality SVG color emoji assets
- **[google-emoji](https://github.com/mistydemeo/google-emoji)** — Retro animated pixel-art GIF emojis
- **[gemoji](https://github.com/github/gemoji)** — Emoji name & alias database
- **[openmoji](https://github.com/hfg-gmuend/openmoji)** — Open-source SVG/PNG emoji (color & black variants + font)
- **[gitmoji](https://github.com/carloscuesta/gitmoji)** — Emoji guide for commit messages

### Vue Components

- \`<EmojiPicker>\` — Full emoji picker with search, categories, and skin tone selection
- \`<AnimatedEmoji>\` — Emoji with CSS animations (bounce, wiggle, pulse, spin, float, shake)
- \`<InteractiveEmoji>\` — Draggable emoji with particle burst effects, reaction counters, and long-press detail popups
- \`<GitmojiIcon>\` — Gitmoji renderer with optional code label and tooltip
- \`<CommitEmoji>\` — Gitmoji-powered commit message builder with search and semver badges

### Composables

- \`useEmoji()\` — Headless emoji search and data access
- \`useEmojiPicker()\` — Reactive picker state management
- \`useGitmoji()\` — Gitmoji search, lookup, and commit message formatting
- \`useOpenmoji()\` — OpenMoji SVG/PNG asset URLs and font loading

### Quick Start

\`\`\`vue
<script setup>
import AnimatedEmoji from './components/AnimatedEmoji.vue'
import InteractiveEmoji from './components/InteractiveEmoji.vue'
import GitmojiIcon from './components/GitmojiIcon.vue'
import CommitEmoji from './components/CommitEmoji.vue'
</script>

<template>
  <!-- Animated emojis -->
  <AnimatedEmoji emoji="🎉" animation="bounce" :size="48" />
  <AnimatedEmoji emoji="❤️" animation="pulse" interactive />

  <!-- Interactive emoji with drag & particles -->
  <InteractiveEmoji emoji="🔥" :draggable="true" :particles="true" />

  <!-- Gitmoji commit icons -->
  <GitmojiIcon code=":bug:" show-label />
  <GitmojiIcon code=":sparkles:" animated />

  <!-- Commit message builder -->
  <CommitEmoji @commit="onCommit" />
</template>
\`\`\`
`
    : ''
}${
  needsParticles
    ? `
## ✨ Particles & Fireworks Effects

This project includes rich particle and fireworks effects powered by:

- **[@tsparticles/vue3](https://github.com/tsparticles/tsparticles)** — Official Vue 3 component for the powerful tsParticles engine
- **[tsparticles-slim](https://github.com/tsparticles/tsparticles)** — Lightweight particle engine
- **[tsparticles-preset-fireworks](https://github.com/tsparticles/tsparticles)** — Ready-made fireworks preset
- **[@fireworks-js/vue](https://github.com/crashmax-dev/fireworks-js)** — Simple, performant Vue 3 fireworks component

### Components

- \`<ParticlesBackground>\` — Highly customizable particle backgrounds (links, snow, confetti, fireworks, etc.)
- \`<FireworksCanvas>\` — Lightweight canvas-based fireworks with full control

### Quick Start

\`\`\`vue
<script setup>
import ParticlesBackground from './components/ParticlesBackground.vue'
import FireworksCanvas from './components/FireworksCanvas.vue'
</script>

<template>
  <!-- tsParticles background (fireworks preset) -->
  <ParticlesBackground preset="fireworks" :full-screen="true" />

  <!-- Custom particles -->
  <ParticlesBackground
    id="my-particles"
    :options="{ particles: { color: { value: '#ff0000' } } }"
  />

  <!-- Fireworks canvas -->
  <FireworksCanvas :height="300" :options="{ hue: { min: 0, max: 360 } }" />
</template>
\`\`\`

Use \`<ParticlesBackground preset="fireworks" />\` or the dedicated \`<FireworksCanvas />\` for beautiful celebration effects.
`
    : ''
}

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)
${needsTypeScript ? sfcTypeSupportDoc : ''}
## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

`

  let npmScriptsDescriptions = `\`\`\`sh
${commandFor('install')}
\`\`\`

### Compile and Hot-Reload for Development

\`\`\`sh
${commandFor('dev')}
\`\`\`

### ${needsTypeScript ? 'Type-Check, ' : ''}Compile and Minify for Production

\`\`\`sh
${commandFor('build')}
\`\`\`
`

  if (needsVitest) {
    npmScriptsDescriptions += `
### Run Unit Tests with [Vitest](https://vitest.dev/)

\`\`\`sh
${commandFor('test:unit')}
\`\`\`
`
  }

  if (needsCypressCT) {
    npmScriptsDescriptions += `
### Run Headed Component Tests with [Cypress Component Testing](https://on.cypress.io/component)

\`\`\`sh
${commandFor('test:unit:dev')} # or \`${commandFor('test:unit')}\` for headless testing
\`\`\`
`
  }

  if (needsCypress) {
    npmScriptsDescriptions += `
### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

\`\`\`sh
${commandFor('test:e2e:dev')}
\`\`\`

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with \`test:e2e\` before deploying (e.g. in CI environments):

\`\`\`sh
${commandFor('build')}
${commandFor('test:e2e')}
\`\`\`
`
  }

  if (needsPlaywright) {
    npmScriptsDescriptions += `
### Run End-to-End Tests with [Playwright](https://playwright.dev)

\`\`\`sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
${commandFor('build')}

# Runs the end-to-end tests
${commandFor('test:e2e')}
# Runs the tests only on Chromium
${commandFor('test:e2e', '--project=chromium')}
# Runs the tests of a specific file
${commandFor('test:e2e', 'tests/example.spec.ts')}
# Runs the tests in debug mode
${commandFor('test:e2e', '--debug')}
\`\`\`
`
  }

  if (needsEslint) {
    npmScriptsDescriptions += `
### Lint with [ESLint](https://eslint.org/)

\`\`\`sh
${commandFor('lint')}
\`\`\`
`
  }

  readme += npmScriptsDescriptions

  return readme
}
