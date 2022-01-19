#!/usr/bin/env node
// @ts-check

import fs from 'fs'
import path from 'path'

import minimist from 'minimist'
import prompts from 'prompts'
import { red, green, bold } from 'kolorist'

import renderTemplate from './utils/renderTemplate.js'
import { postOrderDirectoryTraverse, preOrderDirectoryTraverse } from './utils/directoryTraverse.js'
import generateReadme from './utils/generateReadme.js'
import getCommand from './utils/getCommand.js'
import renderEslint from './utils/renderEslint.js'
import banner from './utils/banner.js'

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(projectName)
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
  if (!fs.existsSync(dir)) {
    return
  }

  postOrderDirectoryTraverse(
    dir,
    (dir) => fs.rmdirSync(dir),
    (file) => fs.unlinkSync(file)
  )
}

async function init() {
  console.log(`\n${banner}\n`)

  const cwd = process.cwd()
  // possible options:
  // --default
  // --typescript / --ts
  // --jsx
  // --router / --vue-router
  // --pinia
  // --with-tests / --tests (equals to `--vitest --cypress`)
  // --vitest
  // --cypress
  // --eslint
  // --eslint-with-prettier (only support prettier through eslint for simplicity)
  // --force (for force overwriting)
  const argv = minimist(process.argv.slice(2), {
    alias: {
      typescript: ['ts'],
      'with-tests': ['tests'],
      router: ['vue-router']
    },
    // all arguments are treated as booleans
    boolean: true
  })

  // if any of the feature flags is set, we would skip the feature prompts
  // use `??` instead of `||` once we drop Node.js 12 support
  const isFeatureFlagsUsed =
    typeof (
      argv.default ||
      argv.ts ||
      argv.jsx ||
      argv.router ||
      argv.pinia ||
      argv.tests ||
      argv.vitest ||
      argv.cypress ||
      argv.eslint
    ) === 'boolean'

  let targetDir = argv._[0]
  const defaultProjectName = !targetDir ? 'vue-project' : targetDir

  const forceOverwrite = argv.force

  let result = {}

  try {
    // Prompts:
    // - Project name:
    //   - whether to overwrite the existing directory or not?
    //   - enter a valid package name for package.json
    // - Project language: JavaScript / TypeScript
    // - Add JSX Support?
    // - Install Vue Router for SPA development?
    // - Install Pinia for state management?
    // - Add Cypress for testing?
    // - Add ESLint for code quality?
    // - Add Prettier for code formatting?
    result = await prompts(
      [
        {
          name: 'projectName',
          type: targetDir ? null : 'text',
          message: 'Project name:',
          initial: defaultProjectName,
          onState: (state) => (targetDir = String(state.value).trim() || defaultProjectName)
        },
        {
          name: 'shouldOverwrite',
          type: () => (canSafelyOverwrite(targetDir) || forceOverwrite ? null : 'confirm'),
          message: () => {
            const dirForPrompt =
              targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`

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
          name: 'needsTypeScript',
          type: () => (isFeatureFlagsUsed ? null : 'toggle'),
          message: 'Add TypeScript?',
          initial: false,
          active: 'Yes',
          inactive: 'No'
        },
        {
          name: 'needsJsx',
          type: () => (isFeatureFlagsUsed ? null : 'toggle'),
          message: 'Add JSX Support?',
          initial: false,
          active: 'Yes',
          inactive: 'No'
        },
        {
          name: 'needsRouter',
          type: () => (isFeatureFlagsUsed ? null : 'toggle'),
          message: 'Add Vue Router for Single Page Application development?',
          initial: false,
          active: 'Yes',
          inactive: 'No'
        },
        {
          name: 'needsPinia',
          type: () => (isFeatureFlagsUsed ? null : 'toggle'),
          message: 'Add Pinia for state management?',
          initial: false,
          active: 'Yes',
          inactive: 'No'
        },
        {
          name: 'needsVitest',
          type: () => (isFeatureFlagsUsed ? null : 'toggle'),
          message: 'Add Vitest for Unit Testing?',
          initial: false,
          active: 'Yes',
          inactive: 'No'
        },
        {
          name: 'needsCypress',
          type: () => (isFeatureFlagsUsed ? null : 'toggle'),
          message: (prev, answers) =>
            answers.needsVitest
              ? 'Add Cypress for End-to-End testing?'
              : 'Add Cypress for both Unit and End-to-End testing?',
          initial: false,
          active: 'Yes',
          inactive: 'No'
        },
        {
          name: 'needsEslint',
          type: () => (isFeatureFlagsUsed ? null : 'toggle'),
          message: 'Add ESLint for code quality?',
          initial: false,
          active: 'Yes',
          inactive: 'No'
        },
        {
          name: 'needsPrettier',
          type: (prev, values = {}) => {
            if (isFeatureFlagsUsed || !values.needsEslint) {
              return null
            }
            return 'toggle'
          },
          message: 'Add Prettier for code formatting?',
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
    projectName,
    packageName = projectName,
    shouldOverwrite = argv.force,
    needsJsx = argv.jsx,
    needsTypeScript = argv.typescript,
    needsRouter = argv.router,
    needsPinia = argv.pinia,
    needsCypress = argv.cypress || argv.tests,
    needsVitest = argv.vitest || argv.tests,
    needsEslint = argv.eslint || argv['eslint-with-prettier'],
    needsPrettier = argv['eslint-with-prettier']
  } = result
  const needsCypressCT = needsCypress && !needsVitest
  const root = path.join(cwd, targetDir)

  if (fs.existsSync(root) && shouldOverwrite) {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  console.log(`\nScaffolding project in ${root}...`)

  const pkg = { name: packageName, version: '0.0.0' }
  fs.writeFileSync(path.resolve(root, 'package.json'), JSON.stringify(pkg, null, 2))

  // todo:
  // work around the esbuild issue that `import.meta.url` cannot be correctly transpiled
  // when bundling for node and the format is cjs
  // const templateRoot = new URL('./template', import.meta.url).pathname
  const templateRoot = path.resolve(__dirname, 'template')
  const render = function render(templateName) {
    const templateDir = path.resolve(templateRoot, templateName)
    renderTemplate(templateDir, root)
  }

  // Render base template
  render('base')

  // Add configs.
  if (needsJsx) {
    render('config/jsx')
  }
  if (needsRouter) {
    render('config/router')
  }
  if (needsPinia) {
    render('config/pinia')
  }
  if (needsVitest) {
    render('config/vitest')
  }
  if (needsCypress) {
    render('config/cypress')
  }
  if (needsCypressCT) {
    render('config/cypress-ct')
  }
  if (needsTypeScript) {
    render('config/typescript')
  }

  if (needsEslint) {
    renderEslint(root, { needsTypeScript, needsCypress, needsCypressCT, needsPrettier })
  }

  // Render code template.
  // prettier-ignore
  const codeTemplate =
    (needsTypeScript ? 'typescript-' : '') +
    (needsRouter ? 'router' : 'default')
  render(`code/${codeTemplate}`)

  // Render entry file (main.js/ts).
  if (needsPinia && needsRouter) {
    render('entry/router-and-pinia')
  } else if (needsPinia) {
    render('entry/pinia')
  } else if (needsRouter) {
    render('entry/router')
  } else {
    render('entry/default')
  }

  // Cleanup.

  // We try to share as many files between TypeScript and JavaScript as possible.
  // If that's not possible, we put `.ts` version alongside the `.js` one in the templates.
  // So after all the templates are rendered, we need to clean up the redundant files.
  // (Currently it's only `cypress/plugin/index.ts`, but we might add more in the future.)

  if (needsTypeScript) {
    // Convert the JavaScript template to the TypeScript
    // Check all the remaining `.js` files:
    //   - If the corresponding TypeScript version already exists, remove the `.js` version.
    //   - Otherwise, rename the `.js` file to `.ts`
    // rename jsconfig.json to tsconfig.json
    preOrderDirectoryTraverse(
      root,
      () => {},
      (filepath) => {
        if (filepath.endsWith('.js')) {
          const tsFilePath = filepath.replace(/\.js$/, '.ts')
          if (fs.existsSync(tsFilePath)) {
            fs.unlinkSync(filepath)
          } else {
            fs.renameSync(filepath, tsFilePath)
          }
        } else if (path.basename(filepath) === 'jsconfig.json') {
          fs.renameSync(filepath, filepath.replace(/jsconfig\.json$/, 'tsconfig.json'))
        }
      }
    )

    // Rename entry in `index.html`
    const indexHtmlPath = path.resolve(root, 'index.html')
    const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8')
    fs.writeFileSync(indexHtmlPath, indexHtmlContent.replace('src/main.js', 'src/main.ts'))
  } else {
    // Remove all the remaining `.ts` files
    preOrderDirectoryTraverse(
      root,
      () => {},
      (filepath) => {
        if (filepath.endsWith('.ts')) {
          fs.unlinkSync(filepath)
        }
      }
    )
  }

  // Instructions:
  // Supported package managers: pnpm > yarn > npm
  // Note: until <https://github.com/pnpm/pnpm/issues/3505> is resolved,
  // it is not possible to tell if the command is called by `pnpm init`.
  const userAgent = process.env.npm_config_user_agent ?? ''
  const packageManager = /pnpm/.test(userAgent) ? 'pnpm' : /yarn/.test(userAgent) ? 'yarn' : 'npm'

  // README generation
  fs.writeFileSync(
    path.resolve(root, 'README.md'),
    generateReadme({
      projectName: result.projectName || defaultProjectName,
      packageManager,
      needsTypeScript,
      needsVitest,
      needsCypress,
      needsCypressCT,
      needsEslint
    })
  )

  console.log(`\nDone. Now run:\n`)
  if (root !== cwd) {
    console.log(`  ${bold(green(`cd ${path.relative(cwd, root)}`))}`)
  }
  console.log(`  ${bold(green(getCommand(packageManager, 'install')))}`)
  console.log(`  ${bold(green(getCommand(packageManager, 'dev')))}`)
  console.log()
}

init().catch((e) => {
  console.error(e)
})
