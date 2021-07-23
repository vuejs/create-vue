import prompts from 'prompts'
import kolorist from 'kolorist'

import renderTemplate from './renderTemplate.js'

// Prompts:
// - Project name:
// - Project language: JavaScript / TypeScript
// - Install Vue Router & Vuex for Single Page Applications?
// - Adding tests?

// TODO:
// add command-line for all possible option combinations
// so that we can generate them in playgrounds

// Add configs.
// renderTemplate('config/base')
// if (needs tests) {
//   renderTemplate('config/cypress')
// }
// if (is typescript) {
//   renderTemplate('config/typescript')
// }

// sourceTemplateName =
//   (isTs ? 'typescript-' : '') +
//   (isSPA ? 'spa' : 'default')
// renderTemplate(`source/${sourceTemplateName}`)

// Cleanup.

// All templates assumes the need of tests.
// If the user doesn't need it:
// rm -rf cypress **/__tests__/

// TS config template may add redundant tsconfig.json.
// Should clean that too.

// Instructions:
// Supported package managers: pnpm > yarn > npm
