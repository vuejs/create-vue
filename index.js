// @ts-check
import renderEjsFile from './renderEjsFile.js'

import thisPackage from './package.json' with { type: 'json' }
const versionMap = thisPackage.devDependencies

/**
 * Creates an ESLint configuration for Vue.js projects.
 * This is also used in `create-vue`.
 *
 * @param {object} options - Configuration options
 * @param {string} [options.styleGuide='default'] - The style guide to use (only 'default' is supported for now)
 * @param {boolean} [options.hasTypeScript=false] - Whether the project uses TypeScript
 * @param {boolean} [options.needsPrettier=false] - Whether to include Prettier integration
 * @param {boolean} [options.needsOxlint=false] - Whether to include Oxlint (faster linter to complement ESLint)
 * @param {boolean} [options.needsOxfmt=false] - Whether to include Oxfmt (faster formatter to complement Prettier, experimental)
 * @param {Array<{devDependencies?: object, beforeVuePlugin?: Array<{importer: string, content: string}>, afterVuePlugin?: Array<{importer: string, content: string}>}>} [options.additionalConfigs=[]] - Additional configurations to merge
 * @returns {{pkg: {devDependencies: object, scripts: object}, files: object}} An object containing package.json modifications and generated config files
 */
export default function createConfig({
  styleGuide = 'default', // only the default is supported for now

  hasTypeScript = false,
  needsPrettier = false,
  needsOxlint = false,
  needsOxfmt = false,

  additionalConfigs = [],
}) {
  // This is the pkg object to extend
  const pickDependencies = (/** @type {string[]} */ keys) =>
    pickKeysFromObject(versionMap, keys)

  const pkg = {
    devDependencies: pickDependencies(['eslint', 'eslint-plugin-vue']),
    /** @type Record<string, string> */
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

    // For now, oxfmt's feature isn't complete enough to fully replace prettier
    if (needsOxfmt) {
      additionalConfigs.push({
        devDependencies: pickDependencies(['oxfmt']),
      })
      pkg.scripts['format:oxfmt'] = 'oxfmt src/'
      pkg.scripts['format:prettier'] = `prettier --write src/ '!**/*.{js,jsx,ts,tsx}'`
      pkg.scripts.format = 'run-p format:oxfmt format:prettier'
    }
  }

  // TBH they don't share dependencies so the plugin can be added with or without oxlint/oxfmt.
  // But I don't feel like pushing this as the default option right now.
  // If the user shows interest in oxlint/oxfmt, we can safely assume they wants this plugin too.
  if (needsPrettier && (needsOxlint || needsOxfmt)) {
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

  /** @type Record<string, string> */
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
 * Recursively merge the content of the new object to the existing one.
 * @param {object} target - The existing object
 * @param {object} obj - The new object
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
