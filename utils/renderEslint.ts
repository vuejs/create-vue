import * as fs from 'node:fs'
import * as path from 'node:path'

import createESLintConfig from '@vue/create-eslint-config'

import sortDependencies from './sortDependencies'
import deepMerge from './deepMerge'

import eslintTemplatePackage from '../template/eslint/package.json' assert { type: 'json' }
const eslintDeps = eslintTemplatePackage.devDependencies

export default function renderEslint(
  rootDir,
  {
    needsTypeScript,
    needsVitest,
    needsCypress,
    needsCypressCT,
    needsOxlint,
    needsPrettier,
    needsPlaywright,
  },
) {
  const additionalConfigs = getAdditionalConfigs({
    needsTypeScript,
    needsVitest,
    needsCypress,
    needsCypressCT,
    needsPlaywright,
  })

  const { pkg, files } = createESLintConfig({
    styleGuide: 'default',
    hasTypeScript: needsTypeScript,
    needsOxlint,
    // Theoretically, we could add Prettier without requring ESLint.
    // But it doesn't seem to be a good practice, so we just let createESLintConfig handle it.
    needsPrettier,
    additionalConfigs,
  })

  // update package.json
  const packageJsonPath = path.resolve(rootDir, 'package.json')
  const existingPkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const updatedPkg = sortDependencies(deepMerge(existingPkg, pkg))
  fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPkg, null, 2) + '\n', 'utf8')

  // write to eslint.config.js, .prettierrc.json, .editorconfig, etc.
  for (const [fileName, content] of Object.entries(files)) {
    const fullPath = path.resolve(rootDir, fileName)
    fs.writeFileSync(fullPath, content as string, 'utf8')
  }
}

type ConfigItemInESLintTemplate = {
  importer: string
  content: string
}
type AdditionalConfig = {
  devDependencies: Record<string, string>
  beforeVuePlugin?: Array<ConfigItemInESLintTemplate>
  afterVuePlugin?: Array<ConfigItemInESLintTemplate>
}
type AdditionalConfigArray = Array<AdditionalConfig>

// visible for testing
export function getAdditionalConfigs({
  needsTypeScript,
  needsVitest,
  needsCypress,
  needsCypressCT,
  needsPlaywright,
}) {
  const additionalConfigs: AdditionalConfigArray = []

  if (needsVitest) {
    additionalConfigs.push({
      devDependencies: {
        '@vitest/eslint-plugin': eslintDeps['@vitest/eslint-plugin'],
      },
      afterVuePlugin: [
        {
          importer: `import pluginVitest from '@vitest/eslint-plugin'`,
          content: `
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },`,
        },
      ],
    })
  }

  if (needsCypress) {
    additionalConfigs.push({
      devDependencies: {
        'eslint-plugin-cypress': eslintDeps['eslint-plugin-cypress'],
      },
      afterVuePlugin: [
        {
          importer:
            (needsTypeScript
              ? `// eslint-disable-next-line @typescript-eslint/ban-ts-comment\n` +
                `// @ts-ignore\n`
              : '') + "import pluginCypress from 'eslint-plugin-cypress/flat'",
          content: `
  {
    ...pluginCypress.configs.recommended,
    files: [
      ${[
        ...(needsCypressCT ? ['**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}'] : []),
        'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
        'cypress/support/**/*.{js,ts,jsx,tsx}',
      ]
        .map(JSON.stringify.bind(JSON))
        .join(',\n      ')
        .replace(/"/g, "'" /* use single quotes as in the other configs */)}
    ],
  },`,
        },
      ],
    })
  }

  if (needsPlaywright) {
    additionalConfigs.push({
      devDependencies: {
        'eslint-plugin-playwright': eslintDeps['eslint-plugin-playwright'],
      },
      afterVuePlugin: [
        {
          importer: "import pluginPlaywright from 'eslint-plugin-playwright'",
          content: `
  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },`,
        },
      ],
    })
  }

  return additionalConfigs
}
