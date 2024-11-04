#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { bold, blue, yellow, red, green, dim } from 'kolorist'

import createConfig, { deepMerge } from '../index.js'

const require = createRequire(import.meta.url)
const Enquirer = require('enquirer')
const enquirer = new Enquirer()

function abort () {
  console.error(red('✖') + ' Operation cancelled')
  process.exit(1)
}

function prompt (questions) {
  return enquirer.prompt(questions).catch(abort)
}

const cwd = process.cwd()
const requireInCwd = createRequire(path.resolve(cwd, 'index.cjs'))

// Only works in directories that has a `package.json`
const pkgJsonPath = path.resolve(cwd, 'package.json')
if (!existsSync(pkgJsonPath)) {
  console.error(`${bold(yellow('package.json'))} not found in the current directory.`)
  abort()
}

const rawPkgJson = readFileSync(pkgJsonPath, 'utf-8')
function inferIndent (rawJson) {
  const lines = rawJson.split('\n')
  const firstLineWithIndent = lines.find(l => l.startsWith(' ') || l.startsWith('\t'))

  if (!firstLineWithIndent) { return '' }
  return /^\s+/.exec(firstLineWithIndent)[0]
}
const indent = inferIndent(rawPkgJson)
const pkg = JSON.parse(rawPkgJson)

// 1. check for existing config files
// `.eslintrc.*`, `eslintConfig` in `package.json`
// FIXME: `eslint.config.*`
// ask if wanna overwrite?

// https://eslint.org/docs/latest/user-guide/configuring/configuration-files#configuration-file-formats
// The experimental `eslint.config.js` isn't supported yet
const eslintConfigFormats = ['js', 'cjs', 'yaml', 'yml', 'json']
for (const fmt of eslintConfigFormats) {
  const configFileName = `.eslintrc.${fmt}`
  const fullConfigPath = path.resolve(cwd, configFileName)
  if (existsSync(fullConfigPath)) {
    const { shouldRemove } = await prompt({
      type: 'toggle',
      disabled: 'No',
      enabled: 'Yes',
      name: 'shouldRemove',
      message:
        `Found existing ESLint config file: ${bold(blue(configFileName))}.\n` +
        'Do you want to remove the config file and continue?',
      initial: false
    })

    if (shouldRemove) {
      unlinkSync(fullConfigPath)
    } else {
      abort()
    }
  }
}

if (pkg.eslintConfig) {
  const { shouldRemoveConfigField } = await prompt({
    type: 'toggle',
    disabled: 'No',
    enabled: 'Yes',
    name: 'shouldRemoveConfigField',
    message:
      `Found existing ${bold(blue('eslintConfig'))} field in ${bold(yellow('package.json'))}.\n` +
      'Do you want to remove the config field and continue?',
    initial: false
  })

  if (shouldRemoveConfigField) {
    delete pkg.eslintConfig
  }
}

// 2. Check Vue
let vueVersion
// Not detected? Abort
// Vue 2? Abort because this tool only supports Vue 3
try {
  vueVersion = requireInCwd('vue/package.json').version
  console.info(dim(`Detected Vue.js version: ${vueVersion}`))
} catch (e) {
  // FIXME: warning that this only support Vue 3
}

// 4. Check TypeScript
// 4.1 Allow JS?
// 4.2 Allow JS in Vue? Allow JSX (TSX, if answered no in 4.1) in Vue?
let hasTypeScript = false
try {
  const tsVersion = requireInCwd('typescript/package.json').version
  console.info(dim(`Detected TypeScript version: ${tsVersion}`))
  hasTypeScript = true
} catch (e) {
  const anwsers = await prompt({
    type: 'toggle',
    disabled: 'No',
    enabled: 'Yes',
    name: 'hasTypeScript',
    message: 'Does your project use TypeScript?',
    initial: false
  })
  hasTypeScript = anwsers.hasTypeScript
}

const supportedScriptLangs = {}
// FIXME: Use a multi-select prompt
// if (hasTypeScript) {
//   const { allowJsInVue } = await prompt({
//     type: 'toggle',
//     disabled: 'No',
//     enabled: 'Yes',
//     name: 'allowJsInVue',
//     message: `Do you use plain ${yellow('<script>')}s (without ${blue('lang="ts"')}) in ${green('.vue')} files?`,
//     initial: false
//   })

//   if (allowJsInVue) {
//     const { allowJsxInVue } = await prompt({
//       type: 'toggle',
//       disabled: 'No',
//       enabled: 'Yes',
//       name: 'allowJsxInVue',
//       message: `Do you use ${yellow('<script lang="jsx">')}s in ${green('.vue')} files (not recommended)?`,
//       initial: false
//     })

//     additionalConfig.extends = [
//       `@vue/eslint-config-${styleGuide}-with-typescript/${
//         allowJsxInVue
//           ? 'allow-jsx-in-vue'
//           : 'allow-js-in-vue'
//       }`
//     ]
//   } else {
//     const { allowTsxInVue } = await prompt({
//       type: 'toggle',
//       disabled: 'No',
//       enabled: 'Yes',
//       name: 'allowTsxInVue',
//       message: `Do you use ${yellow('<script lang="tsx">')}s in ${green('.vue')} files (not recommended)?`,
//       initial: false
//     })

//     if (allowTsxInVue) {
//       additionalConfig.extends = [
//         `@vue/eslint-config-${styleGuide}-with-typescript/allow-tsx-in-vue`
//       ]
//     }
//   }
// }

// 5. Do you need Prettier to format your codebase?
const { needsPrettier } = await prompt({
  type: 'toggle',
  disabled: 'No',
  enabled: 'Yes',
  name: 'needsPrettier',
  message: 'Do you need Prettier to format your code?'
})

const { needsOxlint } = await prompt({
  type: 'toggle',
  disabled: 'No',
  enabled: 'Yes',
  name: 'needsOxlint',
  message: 'Would you like to supplement ESLint with Oxlint for faster linting (experimental)?'
})

const { pkg: pkgToExtend, files } = createConfig({
  hasTypeScript,
  supportedScriptLangs,
  needsPrettier,
  needsOxlint,
})

// TODO:
// Add `lint` command to package.json
// Add a `format` command to package.json when prettier is used

deepMerge(pkg, pkgToExtend)

// Write `package.json` back
writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, indent) + '\n', 'utf8')
// Write files back
for (const [name, content] of Object.entries(files)) {
  const fullPath = path.resolve(cwd, name)
  writeFileSync(fullPath, content, 'utf8')
}

// Prompt: Run `npm install` or `yarn` or `pnpm install`
const userAgent = process.env.npm_config_user_agent ?? ''
const packageManager = /pnpm/.test(userAgent) ? 'pnpm' : /yarn/.test(userAgent) ? 'yarn' : 'npm'

const installCommand = packageManager === 'yarn' ? 'yarn' : `${packageManager} install`
const lintCommand = packageManager === 'npm' ? 'npm run lint' : `${packageManager} lint`

console.info(
  '\n' +
  `${bold(yellow('package.json'))} and ${bold(blue('eslint.config.js'))} have been updated.\n` +
  `Now please run ${bold(green(installCommand))} to re-install the dependencies.\n` +
  `Then you can run ${bold(green(lintCommand))} to lint your files.`
)
