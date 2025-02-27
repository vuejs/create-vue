#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

import { parseArgs } from 'node:util'
import { intro, outro, text, confirm, multiselect, select, isCancel } from '@clack/prompts'
import { red, green, cyan, bold, dim } from 'picocolors'

import ejs from 'ejs'

import * as banners from './utils/banners'

import renderTemplate from './utils/renderTemplate'
import { postOrderDirectoryTraverse, preOrderDirectoryTraverse } from './utils/directoryTraverse'
import generateReadme from './utils/generateReadme'
import getCommand from './utils/getCommand'
import getLanguage from './utils/getLanguage'
import renderEslint from './utils/renderEslint'
import { trimBoilerplate, removeCSSImport, emptyRouterConfig } from './utils/trimBoilerplate'

import cliPackageJson from './package.json'

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

function canSkipEmptying(dir: string) {
  if (!fs.existsSync(dir)) {
    return true
  }

  const files = fs.readdirSync(dir)
  if (files.length === 0) {
    return true
  }
  if (files.length === 1 && files[0] === '.git') {
    return true
  }

  return false
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return
  }

  postOrderDirectoryTraverse(
    dir,
    (dir) => fs.rmdirSync(dir),
    (file) => fs.unlinkSync(file),
  )
}

const helpMessage = `\
Usage: create-vue [FEATURE_FLAGS...] [OPTIONS...] [DIRECTORY]

Create a new Vue.js project.
Start the CLI in interactive mode when no FEATURE_FLAGS is provided, or if the DIRECTORY argument is not a valid package name.

Options:
  --force
    Create the project even if the directory is not empty.
  --bare
    Create a barebone project without example code.
  --help
    Display this help message.
  --version
    Display the version number of this CLI.

Available feature flags:
  --default
    Create a project with the default configuration without any additional features.
  --ts, --typescript
    Add TypeScript support.
  --jsx
    Add JSX support.
  --router, --vue-router
    Add Vue Router for SPA development.
  --pinia
    Add Pinia for state management.
  --vitest
    Add Vitest for unit testing.
  --cypress
    Add Cypress for end-to-end testing.
    If used without ${cyan('--vitest')}, it will also add Cypress Component Testing.
  --playwright
    Add Playwright for end-to-end testing.
  --nightwatch
    Add Nightwatch for end-to-end testing.
    If used without ${cyan('--vitest')}, it will also add Nightwatch Component Testing.
  --eslint
    Add ESLint for code quality.
  --eslint-with-oxlint
    Add ESLint for code quality, and use Oxlint to speed up the linting process.
  --eslint-with-prettier (Deprecated in favor of ${cyan('--eslint --prettier')})
    Add Prettier for code formatting in addition to ESLint.
  --prettier
    Add Prettier for code formatting.

Unstable feature flags:
  --tests, --with-tests
    Add both unit testing and end-to-end testing support.
    Currently equivalent to ${cyan('--vitest --cypress')}, but may change in the future.
`

async function init() {
  const cwd = process.cwd()
  const args = process.argv.slice(2)

  // // alias is not supported by parseArgs so we declare all the flags altogether
  const flags = [
    'default',
    'typescript',
    'ts',
    'jsx',
    'router',
    'vue-router',
    'pinia',
    'vitest',
    'cypress',
    'playwright',
    'nightwatch',
    'eslint',
    'eslint-with-oxlint',
    'eslint-with-prettier',
    'prettier',
    'tests',
    'with-tests',
    'force',
    'bare',
    'help',
    'version',
  ] as const
  type CLIOptions = {
    [key in (typeof flags)[number]]: { readonly type: 'boolean' }
  }
  const options = Object.fromEntries(flags.map((key) => [key, { type: 'boolean' }])) as CLIOptions

  const { values: argv, positionals } = parseArgs({
    args,
    options,
    strict: true,
    allowPositionals: true,
  })

  if (argv.help) {
    console.log(helpMessage)
    process.exit(0)
  }

  if (argv.version) {
    console.log(`${cliPackageJson.name} v${cliPackageJson.version}`)
    process.exit(0)
  }

  // if any of the feature flags is set, we would skip the feature prompts
  const isFeatureFlagsUsed =
    typeof (
      argv.default ??
      argv.ts ??
      argv.typescript ??
      argv.jsx ??
      argv.router ??
      argv['vue-router'] ??
      argv.pinia ??
      argv.tests ??
      argv['with-tests'] ??
      argv.vitest ??
      argv.cypress ??
      argv.nightwatch ??
      argv.playwright ??
      argv.eslint ??
      argv.prettier ??
      argv['eslint-with-oxlint'] ??
      argv['eslint-with-prettier']
    ) === 'boolean'

  let targetDir = positionals[0]
  const defaultProjectName = !targetDir ? 'vue-project' : targetDir

  const forceOverwrite = argv.force

  const language = getLanguage()

  let result: {
    projectName?: string
    shouldOverwrite?: boolean
    packageName?: string
    needsTypeScript?: boolean
    needsJsx?: boolean
    needsRouter?: boolean
    needsPinia?: boolean
    needsVitest?: boolean
    needsE2eTesting?: false | 'cypress' | 'nightwatch' | 'playwright'
    needsEslint?: false | 'eslintOnly' | 'speedUpWithOxlint'
    needsOxlint?: boolean
    needsPrettier?: boolean
    features?: string[]
  } = {}

  try {
    intro(
      process.stdout.isTTY && process.stdout.getColorDepth() > 8
        ? banners.gradientBanner
        : banners.defaultBanner,
    )

    if (!targetDir) {
      const projectNameInput = await text({
        message: language.projectName.message,
        placeholder: defaultProjectName,
        validate: (value) => (value.length > 0 ? undefined : 'Should not be empty'),
      })

      if (isCancel(projectNameInput)) {
        throw new Error(red('✖') + ` ${language.errors.operationCancelled}`)
      }

      targetDir = projectNameInput
    }

    if (!canSkipEmptying(targetDir) && !forceOverwrite) {
      const shouldOverwriteInput = await confirm({
        message: `${
          targetDir === '.'
            ? language.shouldOverwrite.dirForPrompts.current
            : `${language.shouldOverwrite.dirForPrompts.target} "${targetDir}"`
        } ${language.shouldOverwrite.message}`,
      })

      if (isCancel(shouldOverwriteInput) || !shouldOverwriteInput) {
        throw new Error(red('✖') + ` ${language.errors.operationCancelled}`)
      }

      result.shouldOverwrite = shouldOverwriteInput
    }

    if (!isValidPackageName(targetDir)) {
      const packageNameInput = await text({
        message: language.packageName.message,
        initialValue: toValidPackageName(targetDir),
        validate: (value) =>
          isValidPackageName(value) ? undefined : language.packageName.invalidMessage,
      })

      if (isCancel(packageNameInput)) {
        throw new Error(red('✖') + ` ${language.errors.operationCancelled}`)
      }

      result.packageName = packageNameInput
    }

    if (!isFeatureFlagsUsed) {
      const features = await multiselect({
        message: `${language.featureSelection.message} ${dim(language.featureSelection.hint)}`,
        options: [
          {
            value: 'typescript',
            label: language.needsTypeScript.message,
            hint: language.needsTypeScript.hint,
          },
          { value: 'jsx', label: language.needsJsx.message, hint: language.needsJsx.hint },
          {
            value: 'router',
            label: language.needsRouter.message,
            hint: language.needsRouter.hint,
          },
          {
            value: 'pinia',
            label: language.needsPinia.message,
            hint: language.needsPinia.hint,
          },
          {
            value: 'vitest',
            label: language.needsVitest.message,
            hint: language.needsVitest.hint,
          },
          {
            value: 'e2e',
            label: language.needsE2eTesting.message,
            hint: language.needsE2eTesting.hint,
          },
          {
            value: 'eslint',
            label: language.needsEslint.message,
            hint: language.needsEslint.hint,
          },
          {
            value: 'prettier',
            label: language.needsPrettier.message,
            hint: language.needsPrettier.hint,
          },
        ],
        required: false,
      })

      if (isCancel(features)) {
        throw new Error(red('✖') + ` ${language.errors.operationCancelled}`)
      }

      result.features = features

      if (features.includes('e2e')) {
        const e2eTestingInput = await select({
          message: `${language.e2eSelection.message} ${dim(language.e2eSelection.hint)}`,
          options: [
            {
              value: 'playwright',
              label: language.e2eSelection.selectOptions.playwright.title,
              hint: language.e2eSelection.selectOptions.playwright.desc,
            },
            {
              value: 'cypress',
              label: language.e2eSelection.selectOptions.cypress.title,
              hint: features.includes('vitest')
                ? language.e2eSelection.selectOptions.cypress.desc
                : language.e2eSelection.selectOptions.cypress.hintOnComponentTesting!,
            },
            {
              value: 'nightwatch',
              label: language.e2eSelection.selectOptions.nightwatch.title,
              hint: features.includes('vitest')
                ? language.e2eSelection.selectOptions.nightwatch.desc
                : language.e2eSelection.selectOptions.nightwatch.hintOnComponentTesting!,
            },
          ],
        })

        if (isCancel(e2eTestingInput)) {
          throw new Error(red('✖') + ` ${language.errors.operationCancelled}`)
        }

        result.needsE2eTesting = e2eTestingInput
      }

      if (features.includes('eslint')) {
        const oxlintInput = await confirm({
          message: language.needsOxlint.message,
          initialValue: false,
        })

        if (isCancel(oxlintInput)) {
          throw new Error(red('✖') + ` ${language.errors.operationCancelled}`)
        }

        result.needsOxlint = oxlintInput
      }
    }

    // Convert multiselect results to individual flags
    if (result.features) {
      result.needsTypeScript = result.features.includes('typescript')
      result.needsJsx = result.features.includes('jsx')
      result.needsRouter = result.features.includes('router')
      result.needsPinia = result.features.includes('pinia')
      result.needsVitest = result.features.includes('vitest')
      result.needsPrettier = result.features.includes('prettier')
      // E2E and ESLint are handled by their respective follow-up prompts
      if (!result.features.includes('e2e')) {
        result.needsE2eTesting = false
      }
      if (!result.features.includes('eslint')) {
        result.needsEslint = false
      }
    }
  } catch (cancelled) {
    outro(cancelled.message)
    process.exit(1)
  }

  // `initial` won't take effect if the prompt type is null
  // so we still have to assign the default values here
  const {
    projectName,
    packageName = projectName ?? defaultProjectName,
    shouldOverwrite = argv.force as boolean,
    needsJsx = argv.jsx as boolean,
    needsTypeScript = (argv.ts || argv.typescript) as boolean,
    needsRouter = (argv.router || argv['vue-router']) as boolean,
    needsPinia = argv.pinia as boolean,
    needsVitest = (argv.vitest || argv.tests) as boolean,
    needsPrettier = (argv.prettier || argv['eslint-with-prettier']) as boolean,
  } = result

  const needsEslint = Boolean(
    argv.eslint || argv['eslint-with-oxlint'] || argv['eslint-with-prettier'] || result.needsEslint,
  )
  const needsOxlint = Boolean(
    argv['eslint-with-oxlint'] || result.needsEslint === 'speedUpWithOxlint',
  )

  const { needsE2eTesting } = result
  const needsCypress = argv.cypress || argv.tests || needsE2eTesting === 'cypress'
  const needsCypressCT = needsCypress && !needsVitest
  const needsNightwatch = argv.nightwatch || needsE2eTesting === 'nightwatch'
  const needsNightwatchCT = needsNightwatch && !needsVitest
  const needsPlaywright = argv.playwright || needsE2eTesting === 'playwright'

  const root = path.join(cwd, targetDir)

  if (fs.existsSync(root) && shouldOverwrite) {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  console.log(`\n${language.infos.scaffolding} ${root}...`)

  const pkg = { name: packageName, version: '0.0.0' }
  fs.writeFileSync(path.resolve(root, 'package.json'), JSON.stringify(pkg, null, 2))

  // todo:
  // work around the esbuild issue that `import.meta.url` cannot be correctly transpiled
  // when bundling for node and the format is cjs
  // const templateRoot = new URL('./template', import.meta.url).pathname
  const templateRoot = path.resolve(__dirname, 'template')
  const callbacks = []
  const render = function render(templateName) {
    const templateDir = path.resolve(templateRoot, templateName)
    renderTemplate(templateDir, root, callbacks)
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
  if (needsNightwatch) {
    render('config/nightwatch')
  }
  if (needsNightwatchCT) {
    render('config/nightwatch-ct')
  }
  if (needsPlaywright) {
    render('config/playwright')
  }
  if (needsTypeScript) {
    render('config/typescript')

    // Render tsconfigs
    render('tsconfig/base')
    // The content of the root `tsconfig.json` is a bit complicated,
    // So here we are programmatically generating it.
    const rootTsConfig = {
      // It doesn't target any specific files because they are all configured in the referenced ones.
      files: [],
      // All templates contain at least a `.node` and a `.app` tsconfig.
      references: [
        {
          path: './tsconfig.node.json',
        },
        {
          path: './tsconfig.app.json',
        },
      ],
    }
    if (needsCypress) {
      render('tsconfig/cypress')
      // Cypress uses `ts-node` internally, which doesn't support solution-style tsconfig.
      // So we have to set a dummy `compilerOptions` in the root tsconfig to make it work.
      // I use `NodeNext` here instead of `ES2015` because that's what the actual environment is.
      // (Cypress uses the ts-node/esm loader when `type: module` is specified in package.json.)
      // @ts-ignore
      rootTsConfig.compilerOptions = {
        module: 'NodeNext',
      }
    }
    if (needsCypressCT) {
      render('tsconfig/cypress-ct')
      // Cypress Component Testing needs a standalone tsconfig.
      rootTsConfig.references.push({
        path: './tsconfig.cypress-ct.json',
      })
    }
    if (needsPlaywright) {
      render('tsconfig/playwright')
    }
    if (needsVitest) {
      render('tsconfig/vitest')
      // Vitest needs a standalone tsconfig.
      rootTsConfig.references.push({
        path: './tsconfig.vitest.json',
      })
    }
    if (needsNightwatch) {
      render('tsconfig/nightwatch')
      // Nightwatch needs a standalone tsconfig, but in a different folder.
      rootTsConfig.references.push({
        path: './nightwatch/tsconfig.json',
      })
    }
    if (needsNightwatchCT) {
      render('tsconfig/nightwatch-ct')
    }
    fs.writeFileSync(
      path.resolve(root, 'tsconfig.json'),
      JSON.stringify(rootTsConfig, null, 2) + '\n',
      'utf-8',
    )
  }

  // Render ESLint config
  if (needsEslint) {
    renderEslint(root, {
      needsTypeScript,
      needsOxlint,
      needsVitest,
      needsCypress,
      needsCypressCT,
      needsPrettier,
      needsPlaywright,
    })
    render('config/eslint')
  }

  if (needsPrettier) {
    render('config/prettier')
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

  // An external data store for callbacks to share data
  const dataStore = {}
  // Process callbacks
  for (const cb of callbacks) {
    await cb(dataStore)
  }

  // EJS template rendering
  preOrderDirectoryTraverse(
    root,
    () => {},
    (filepath) => {
      if (filepath.endsWith('.ejs')) {
        const template = fs.readFileSync(filepath, 'utf-8')
        const dest = filepath.replace(/\.ejs$/, '')
        const content = ejs.render(template, dataStore[dest])

        fs.writeFileSync(dest, content)
        fs.unlinkSync(filepath)
      }
    },
  )

  if (argv.bare) {
    trimBoilerplate(root)
    render('bare/base')
    // TODO: refactor the `render` utility to avoid this kind of manual mapping?
    if (needsTypeScript) {
      render('bare/typescript')
    }
    if (needsVitest) {
      render('bare/vitest')
    }
    if (needsCypressCT) {
      render('bare/cypress-ct')
    }
    if (needsNightwatchCT) {
      render('bare/nightwatch-ct')
    }
  }

  // Cleanup.

  // We try to share as many files between TypeScript and JavaScript as possible.
  // If that's not possible, we put `.ts` version alongside the `.js` one in the templates.
  // So after all the templates are rendered, we need to clean up the redundant files.
  // (Currently it's only `cypress/plugin/index.ts`, but we might add more in the future.)
  // (Or, we might completely get rid of the plugins folder as Cypress 10 supports `cypress.config.ts`)

  if (needsTypeScript) {
    // Convert the JavaScript template to the TypeScript
    // Check all the remaining `.js` files:
    //   - If the corresponding TypeScript version already exists, remove the `.js` version.
    //   - Otherwise, rename the `.js` file to `.ts`
    // Remove `jsconfig.json`, because we already have tsconfig.json
    // `jsconfig.json` is not reused, because we use solution-style `tsconfig`s, which are much more complicated.
    preOrderDirectoryTraverse(
      root,
      () => {},
      (filepath) => {
        if (filepath.endsWith('.js') && !filepath.endsWith('eslint.config.js')) {
          const tsFilePath = filepath.replace(/\.js$/, '.ts')
          if (fs.existsSync(tsFilePath)) {
            fs.unlinkSync(filepath)
          } else {
            fs.renameSync(filepath, tsFilePath)
          }
        } else if (path.basename(filepath) === 'jsconfig.json') {
          fs.unlinkSync(filepath)
        }
      },
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
      },
    )
  }

  if (argv.bare) {
    removeCSSImport(root, needsTypeScript, needsCypressCT)
    if (needsRouter) {
      emptyRouterConfig(root, needsTypeScript)
    }
  }

  // Instructions:
  // Supported package managers: pnpm > yarn > bun > npm
  const userAgent = process.env.npm_config_user_agent ?? ''
  const packageManager = /pnpm/.test(userAgent)
    ? 'pnpm'
    : /yarn/.test(userAgent)
      ? 'yarn'
      : /bun/.test(userAgent)
        ? 'bun'
        : 'npm'

  // README generation
  fs.writeFileSync(
    path.resolve(root, 'README.md'),
    generateReadme({
      projectName: result.projectName ?? result.packageName ?? defaultProjectName,
      packageManager,
      needsTypeScript,
      needsVitest,
      needsCypress,
      needsNightwatch,
      needsPlaywright,
      needsNightwatchCT,
      needsCypressCT,
      needsEslint,
    }),
  )

  let outroMessage = `${language.infos.done}\n\n`
  if (root !== cwd) {
    const cdProjectName = path.relative(cwd, root)
    outroMessage += `   ${bold(green(`cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`))}\n`
  }
  outroMessage += `   ${bold(green(getCommand(packageManager, 'install')))}\n`
  if (needsPrettier) {
    outroMessage += `   ${bold(green(getCommand(packageManager, 'format')))}\n`
  }
  outroMessage += `   ${bold(green(getCommand(packageManager, 'dev')))}\n`

  outroMessage += `
${dim('|')} Optional: Initialize Git in your project directory with:
   
   ${bold(green('git init && git add -A && git commit -m "initial commit"'))}`

  outro(outroMessage)
}

init().catch((e) => {
  console.error(e)
})
