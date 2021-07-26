#!/usr/bin/env node
// @ts-check

import fs from 'fs'
import minimist from 'minimist'
import prompts from 'prompts'
import { red, green, bold } from 'kolorist'

import emptyDir from './emptyDir.js'
import renderTemplate from './renderTemplate.js'
import path from 'path'

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

async function init() {
  const cwd = process.cwd()
  const argv = minimist(process.argv.slice(2))
  
  let targetDir = argv._[0]
  const defaultProjectName = !targetDir ? 'vue-project' : targetDir

  let result = {}
  try {
    // Prompts:
    // - Project name:
    //   - whether to overwrite the existing directory or not?
    //   - enter a valid package name for package.json
    // - Project language: JavaScript / TypeScript
    // - Install Vue Router & Vuex for SPA development?
    // - Add Cypress for testing?
    result = await prompts([
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
        type: () => canSafelyOverwrite(targetDir) ? null : 'confirm',
        message: () => {
          const dirForPrompt = targetDir === '.'
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
        validate: (dir) => isValidPackageName(dir) || 'Invalid package.json name'
      },
      {
        name: 'shouldUseTypeScript',
        type: 'toggle',
        message: 'Add TypeScript?',
        initial: false,
        active: 'Yes',
        inactive: 'No'
      },
      {
        name: 'isSPA',
        type: 'toggle',
        message: 'Install Vue Router & Vuex for Single Page Application development?',
        initial: false,
        active: 'Yes',
        inactive: 'No'
      },
      {
        name: 'shouldAddCypress',
        type: 'toggle',
        message: 'Add Cypress for testing?',
        initial: false,
        active: 'Yes',
        inactive: 'No'
      }
    ], {
      onCancel: () => {
        throw new Error(red('✖') + ' Operation cancelled')
      }
    })
  } catch (cancelled) {
    console.log(cancelled.message)
    process.exit(1)
  }

  const { packageName, shouldOverwrite, shouldUseTypeScript, isSPA, shouldAddCypress } = result
  const root = path.join(cwd, targetDir)

  if (shouldOverwrite) {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  // TODO:
  // Add command-line option as a template-shortcut,
  // so that we can generate them in playgrounds
  // e.g. `--template typescript-spa` and `--with-tests`

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
    function traverseAndRename(dir) {
      for (const filename of fs.readdirSync(dir)) {
        const fullpath = path.resolve(dir, filename)
        if (fs.lstatSync(fullpath).isDirectory()) {
          traverseAndRename(fullpath)
          continue
        }

        if (filename.endsWith('.js')) {
          fs.renameSync(fullpath, fullpath.replace(/\.js$/, '.ts'))
        }

        if (filename === 'jsconfig.json') {
          fs.renameSync(fullpath, fullpath.replace(/jsconfig\.json$/, 'tsconfig.json'))
        }
      }
    }

    traverseAndRename(root)
  }

  // Render code template.
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
    function removeTestDirectories (dir) {
      for (const filename of fs.readdirSync(dir)) {
        const subdir = path.resolve(dir, filename)
        const stats = fs.lstatSync(subdir)

        if (!stats.isDirectory()) { continue }

        if (filename === 'cypress' || filename === '__tests__') {
          emptyDir(subdir)
          fs.rmdirSync(subdir)
          continue
        }

        removeTestDirectories(subdir)
      }
    }

    removeTestDirectories(root)
  }

  // Instructions:
  // Supported package managers: pnpm > yarn > npm
  const packageManager = /pnpm/.test(process.env.npm_execpath)
    ? 'pnpm'
    : /yarn/.test(process.env.npm_execpath)
      ?'yarn'
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
