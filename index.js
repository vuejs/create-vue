// @ts-check
import renderEjsFile from './renderEjsFile.js'

import thisPackage from './package.json' with { type: 'json' }
const versionMap = thisPackage.devDependencies

// This is also used in `create-vue`
export default function createConfig({
  styleGuide = 'default', // only the default is supported for now

  hasTypeScript = false,
  needsPrettier = false,
  needsOxlint = false,

  additionalConfigs = [],
}) {
  // This is the pkg object to extend
  const pickDependencies = (/** @type {string[]} */ keys) =>
    pickKeysFromObject(versionMap, keys)

  const pkg = {
    devDependencies: pickDependencies(['eslint', 'eslint-plugin-vue']),
    scripts: {},
  }

  const fileExtensions = ['vue']

  if (hasTypeScript) {
    // TODO: allowJs option
    fileExtensions.unshift('ts', 'mts', 'tsx')
    additionalConfigs.unshift({
      devDependencies: pickDependencies(['@vue/eslint-config-typescript', 'jiti']),
    })
  } else {
    fileExtensions.unshift('js', 'mjs', 'jsx')
    additionalConfigs.unshift({
      devDependencies: pickDependencies(['@eslint/js', 'globals']),
    })
  }

  if (needsOxlint) {
    additionalConfigs.push({
      devDependencies: pickDependencies([
        'oxlint',
        'eslint-plugin-oxlint',
        'npm-run-all2',
      ]),
      afterVuePlugin: [
        {
          importer: "import pluginOxlint from 'eslint-plugin-oxlint'",
          content: "...pluginOxlint.configs['flat/recommended'],",
        },
      ],
    })
    pkg.scripts['lint:oxlint'] = 'oxlint . --fix -D correctness --ignore-path .gitignore'
    pkg.scripts['lint:eslint'] = 'eslint . --fix --cache'
    pkg.scripts.lint = 'run-s lint:*'
  } else {
    pkg.scripts.lint = 'eslint . --fix --cache'
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

    // Default to only format the `src/` directory to avoid too much noise, and
    // the need for a `.prettierignore` file.
    // Users can still append any paths they'd like to format to the command,
    // e.g. `npm run format cypress/`.
    pkg.scripts.format = 'prettier --write src/'
  }

  if (needsOxlint && needsPrettier) {
    additionalConfigs.push({
      devDependencies: pickDependencies(['@prettier/plugin-oxc']),
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
    needsOxlint,
    needsPrettier,
    fileExtensions,
    configsBeforeVuePlugin,
    configsAfterVuePlugin,
  }

  const files = {
    '.editorconfig': renderEjsFile(
      './templates/_editorconfig.ejs',
      templateData,
    ),
  }

  if (hasTypeScript) {
    files['eslint.config.ts'] = renderEjsFile(
      './templates/eslint.config.ts.ejs',
      templateData,
    )
  } else {
    files['eslint.config.js'] = renderEjsFile(
      './templates/eslint.config.js.ejs',
      templateData,
    )
  }

  // .editorconfig & .prettierrc.json
  if (needsPrettier) {
    // Prettier recommends an explicit configuration file to let the editor know that it's used.
    files['.prettierrc.json'] = renderEjsFile(
      './templates/_prettierrc.json.ejs',
      templateData,
    )
  }

  // TODO:
  // I used renderEjsFile instead of readFileSync for simplicity and easier integration
  // with create-vue. But it's ugly.
  // Should refactor later, or move this project into create-vue.
  files['.gitattributes'] = renderEjsFile('./templates/_gitattributes', {})

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
 * @param {object} target the existing object
 * @param {object} obj the new object
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
