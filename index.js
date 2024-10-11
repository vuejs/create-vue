// @ts-check
import renderEjsFile from './renderEjsFile.js'

import thisPackage from './package.json' with { type: 'json' }
const versionMap = thisPackage.devDependencies

// This is also used in `create-vue`
export default function createConfig({
  styleGuide = 'default', // default ~~| airbnb | standard~~ only the default is supported for now

  hasTypeScript = false,
  needsPrettier = false,

  additionalConfigs = [],
}) {
  // This is the pkg object to extend
  const pickDependencies = (/** @type {string[]} */ keys) =>
    pickKeysFromObject(versionMap, keys)

  const pkg = {
    devDependencies: pickDependencies(['eslint', 'eslint-plugin-vue']),
  }

  const fileExtensions = ['vue']

  if (hasTypeScript) {
    // TODO: allowJs option
    fileExtensions.unshift('ts', 'mts', 'tsx')

    additionalConfigs.unshift({
      devDependencies: pickDependencies(['@vue/eslint-config-typescript']),
      afterVuePlugin: [
        {
          importer:
            "import vueTsEslintConfig from '@vue/eslint-config-typescript'",
          // TODO: supportedScriptLangs
          content: '...vueTsEslintConfig(),',
        },
      ],
    })
  } else {
    fileExtensions.unshift('js', 'mjs', 'jsx')
    additionalConfigs.unshift({
      devDependencies: pickDependencies(['@eslint/js']),
      beforeVuePlugin: [
        {
          importer: "import js from '@eslint/js'",
          content: 'js.configs.recommended,',
        },
      ],
    })
  }

  if (needsPrettier) {
    additionalConfigs.push({
      devDependencies: pickDependencies([
        'prettier',
        '@vue/eslint-config-prettier',
      ]),
      afterVuePlugin: [
        {
          importer:
            "import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'",
          content: 'skipFormatting,',
        },
      ],
    })
  }

  const configsBeforeVuePlugin = [],
    configsAfterVuePlugin = []
  for (const config of additionalConfigs) {
    deepMerge(pkg.devDependencies, config.devDependencies ?? {})
    configsBeforeVuePlugin.push(...(config.beforeVuePlugin ?? []))
    configsAfterVuePlugin.push(...(config.afterVuePlugin ?? []))
  }

  const templateData = {
    styleGuide,
    fileExtensions,
    configsBeforeVuePlugin,
    configsAfterVuePlugin,
  }

  const files = {
    'eslint.config.js': renderEjsFile(
      './templates/eslint.config.js.ejs',
      templateData,
    ),
    '.editorconfig': renderEjsFile(
      './templates/_editorconfig.ejs',
      templateData,
    ),
  }

  // .editorconfig & .prettierrc.json
  if (needsPrettier) {
    // Prettier recommends an explicit configuration file to let the editor know that it's used.
    files['.prettierrc.json'] = renderEjsFile(
      './templates/_prettierrc.json.ejs',
      templateData,
    )
  }

  return {
    pkg,
    files,
  }
}

/**
 * Picks specified keys from an object.
 *
 * @param {Object} obj - The source object.
 * @param {string[]} keys - The keys to pick from the object.
 * @returns {Object} - A new object with the picked keys.
 */
function pickKeysFromObject(obj, keys) {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key]
    }
    return acc
  }, {})
}

const isObject = val => val && typeof val === 'object'
const mergeArrayWithDedupe = (a, b) => Array.from(new Set([...a, ...b]))

/**
 * Recursively merge the content of the new object to the existing one
 * @param {Object} target the existing object
 * @param {Object} obj the new object
 */
export function deepMerge(target, obj) {
  for (const key of Object.keys(obj)) {
    const oldVal = target[key]
    const newVal = obj[key]

    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      target[key] = mergeArrayWithDedupe(oldVal, newVal)
    } else if (isObject(oldVal) && isObject(newVal)) {
      target[key] = deepMerge(oldVal, newVal)
    } else {
      target[key] = newVal
    }
  }

  return target
}
