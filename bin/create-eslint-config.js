import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

// 1. check for existing config files
// `.eslintrc.*`, `eslintConfig` in `package.json`
// ask if wanna overwrite?

// 2. Check Vue
// Not detected? Choose from Vue 2 or 3
// TODO: better support for 2.7 and vue-demi

// 3. Choose a style guide
// - Error Prevention (ESLint Recommended)
// - Standard
// - Airbnb

// 4. Check TypeScript
// 4.1 Allow JS in Vue?
// 4.2 Allow JSX (TSX, if answered no in 4.1) in Vue?

// 5. If Airbnb && !TypeScript
// Do you have any path aliases configured?
// Show [snippet prompts](https://github.com/enquirer/enquirer#snippet-prompt) for the user to input aliases

// 6. Do you need Prettier to format your codebase?

// Call `renderESLintConfig()` from '../index.js`

// Add `lint` command
// - Vue CLI -> vue-cli-service lint
// - Otherwise -> eslint ... (extensions vary based on the language)

// Prompt: Run `npm install` or `yarn` or `pnpm install`
