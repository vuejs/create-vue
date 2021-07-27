#!/usr/bin/env node
// @ts-check

import fs from 'fs'
import path from 'path'

import minimist from 'minimist'
import prompts from 'prompts'
import { red, green, bold } from 'kolorist'

import templateList from './utils/templateList.js'
import renderTemplate from './utils/renderTemplate.js'
import {
  postOrderDirectoryTraverse,
  preOrderDirectoryTraverse
} from './utils/directoryTraverse.js'

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  )
}

function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-')
}

function canSafelyOverwrite(dir) {
  return !fs.existsSync(dir) || fs.readdirSync(dir).length === 0
}

function emptyDir(dir) {
  postOrderDirectoryTraverse(
    dir,
    (dir) => fs.rmdirSync(dir),
    (file) => fs.unlinkSync(file)
  )
}

async function init() {
  const cwd = process.cwd()
  const argv = minimist(process.argv.slice(2))

  let targetDir = argv._[0]
  const defaultProjectName = !targetDir ? 'vue-project' : targetDir

  let template = argv.template || argv.t
  const isValidTemplate = templateList.includes(template)

  let result = {}

  try {
    // Prompts:
    // - Project name:
    //   - whether to overwrite the existing directory or not?
    //   - enter a valid package name for package.json
    // - Project language: JavaScript / TypeScript
    // - Install Vue Router & Vuex for SPA development?
    // - Add Cypress for testing?
    result = await prompts(
      [
        {
          name: 'projectName',
          type: targetDir ? null : 'text',
          message: 'Project name:',
          initial: defaultProjectName,
          onState: (state) =>
            (targetDir = String(state.value).trim() || defaultProjectName)
        },
        {
          name: 'shouldOverwrite',
          type: () => (canSafelyOverwrite(targetDir) ? null : 'confirm'),
          message: () => {
            const dirForPrompt =
              targetDir === '.'
                ? 'Current directory'
                : `Target directory "${targetDir}"`

            return `${dirForPrompt} is not empty. Remove existing files and continue?`
          }
        },
        {
          name: 'overwriteChecker',
          type: (prev, values = {}) => {
            if (values.shouldOverwrite === false) {
              throw new Error(red('✖') + ' Operation cancelled')
            }
            return null
          }
        },
        {
          name: 'packageName',
          type: () => (isValidPackageName(targetDir) ? null : 'text'),
          message: 'Package name:',
          initial: () => toValidPackageName(targetDir),
          validate: (dir) =>
            isValidPackageName(dir) || 'Invalid package.json name'
        },
        {
          name: 'shouldUseTypeScript',
          type: () => (isValidTemplate ? null : 'toggle'),
          message: 'Add TypeScript?',
          initial: false,
          active: 'Yes',
          inactive: 'No'
        },
        {
          name: 'isSPA',
          type: () => (isValidTemplate ? null : 'toggle'),
          message:
            'Add Vue Router & Vuex for Single Page Application development?',
          initial: false,
          active: 'Yes',
          inactive: 'No'
        },
        {
          name: 'shouldAddCypress',
          type: () => (isValidTemplate ? null : 'toggle'),
          message: 'Add Cypress for testing?',
          initial: false,
          active: 'Yes',
          inactive: 'No'
        }
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        }
      }
    )
  } catch (cancelled) {
    console.log(cancelled.message)
    process.exit(1)
  }

  // `initial` won't take effect if the prompt type is null
  // so we still have to assign the default values here
  const {
    packageName = toValidPackageName(defaultProjectName),
    shouldOverwrite,
    shouldUseTypeScript = isValidTemplate && template.includes('-ts'),
    isSPA = isValidTemplate && template.includes('spa'),
    shouldAddCypress = isValidTemplate && template.includes('-with-tests')
  } = result
  const root = path.join(cwd, targetDir)

  if (shouldOverwrite) {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  console.log(`\nScaffolding project in ${root}...`)

  const pkg = { name: packageName, version: '0.0.0' }
  fs.writeFileSync(
    path.resolve(root, 'package.json'),
    JSON.stringify(pkg, null, 2)
  )

  const templateRoot = new URL('./template', import.meta.url).pathname
  const render = function render(templateName) {
    const templateDir = path.resolve(templateRoot, templateName)
    renderTemplate(templateDir, root)
  }

  // Add configs.
  render('config/base')
  if (shouldAddCypress) {
    render('config/cypress')
  }
  if (shouldUseTypeScript) {
    render('config/typescript')

    // rename all `.js` files to `.ts`
    // rename jsconfig.json to tsconfig.json
    preOrderDirectoryTraverse(
      root,
      () => {},
      (filepath) => {
        if (filepath.endsWith('.js')) {
          fs.renameSync(filepath, filepath.replace(/\.js$/, '.ts'))
        } else if (path.basename(filepath) === 'jsconfig.json') {
          fs.renameSync(
            filepath,
            filepath.replace(/jsconfig\.json$/, 'tsconfig.json')
          )
        }
      }
    )
  }

  // Render code template.
  // prettier-ignore
  const codeTemplate =
    (shouldUseTypeScript ? 'typescript-' : '') +
    (isSPA ? 'spa' : 'default')
  render(`code/${codeTemplate}`)

  // TODO: README generation

  // Cleanup.

  if (!shouldAddCypress) {
    // All templates assumes the need of tests.
    // If the user doesn't need it:
    // rm -rf cypress **/__tests__/
    preOrderDirectoryTraverse(
      root,
      (dirpath) => {
        const dirname = path.basename(dirpath)

        if (dirname === 'cypress' || dirname === '__tests__') {
          emptyDir(dirpath)
          fs.rmdirSync(dirpath)
        }
      },
      () => {}
    )
  }

  // Instructions:
  // Supported package managers: pnpm > yarn > npm
  const packageManager = /pnpm/.test(process.env.npm_execpath)
    ? 'pnpm'
    : /yarn/.test(process.env.npm_execpath)
    ? 'yarn'
    : 'npm'

  const commandsMap = {
    install: {
      pnpm: 'pnpm install',
      yarn: 'yarn',
      npm: 'npm install'
    },
    dev: {
      pnpm: 'pnpm dev',
      yarn: 'yarn dev',
      npm: 'npm run dev'
    }
  }

  console.log(`\nDone. Now run:\n`)
  if (root !== cwd) {
    console.log(`  ${bold(green(`cd ${path.relative(cwd, root)}`))}`)
  }
  console.log(`  ${bold(green(commandsMap.install[packageManager]))}`)
  console.log(`  ${bold(green(commandsMap.dev[packageManager]))}`)
  console.log()
}

init().catch((e) => {
  console.error(e)
})
