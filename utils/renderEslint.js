import fs from 'fs'
import path from 'path'

import { devDependencies as allEslintDeps } from '../template/eslint/package.json'
import deepMerge from './deepMerge.js'
import sortDependencies from './sortDependencies.js'

const dependencies = {}
function addEslintDependency(name) {
  dependencies[name] = allEslintDeps[name]
}

addEslintDependency('eslint')
addEslintDependency('eslint-plugin-vue')

const config = {
  root: true,
  extends: ['plugin:vue/vue3-essential'],
  env: {
    'vue/setup-compiler-macros': true
  }
}

function configureEslint({ language, styleGuide, needsPrettier, needsCypress, needsCypressCT }) {
  switch (`${styleGuide}-${language}`) {
    case 'default-javascript':
      config.extends.push('eslint:recommended')
      break
    case 'default-typescript':
      addEslintDependency('@vue/eslint-config-typescript')
      config.extends.push('eslint:recommended')
      config.extends.push('@vue/eslint-config-typescript/recommended')
      break
    // TODO: airbnb and standard
  }

  if (needsPrettier) {
    addEslintDependency('prettier')
    addEslintDependency('@vue/eslint-config-prettier')
    config.extends.push('@vue/eslint-config-prettier')
  }

  if (needsCypress) {
    const cypressOverrides = [
      {
        files: needsCypressCT
          ? ['**/__tests__/*.spec.{js,ts,jsx,tsx}', 'cypress/integration/**.spec.{js,ts,jsx,tsx}']
          : ['cypress/integration/**.spec.{js,ts,jsx,tsx}'],
        extends: ['plugin:cypress/recommended']
      }
    ]

    addEslintDependency('eslint-plugin-cypress')
    config.overrides = cypressOverrides
  }

  // generate the configuration file
  let configuration = '/* eslint-env node */\n'
  if (styleGuide !== 'default' || language !== 'javascript' || needsPrettier) {
    addEslintDependency('@rushstack/eslint-patch')
    configuration += `require("@rushstack/eslint-patch/modern-module-resolution");\n\n`
  }
  configuration += `module.exports = ${JSON.stringify(config, undefined, 2)}\n`

  return {
    dependencies,
    configuration
  }
}

export default function renderEslint(
  rootDir,
  { needsTypeScript, needsCypress, needsCypressCT, needsPrettier }
) {
  const { dependencies, configuration } = configureEslint({
    language: needsTypeScript ? 'typescript' : 'javascript',
    // we currently don't support other style guides
    styleGuide: 'default',
    needsPrettier,
    needsCypress,
    needsCypressCT
  })

  // update package.json
  const packageJsonPath = path.resolve(rootDir, 'package.json')
  const existingPkg = JSON.parse(fs.readFileSync(packageJsonPath))
  const pkg = sortDependencies(
    deepMerge(existingPkg, {
      scripts: {
        // Note that we reuse .gitignore here to avoid duplicating the configuration
        lint: needsTypeScript
          ? 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore'
          : 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore'
      },
      devDependencies: dependencies
    })
  )
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')

  // write to .eslintrc.cjs
  const eslintrcPath = path.resolve(rootDir, '.eslintrc.cjs')
  fs.writeFileSync(eslintrcPath, configuration)
}
