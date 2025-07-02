#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { intro, outro, text, confirm, multiselect, select, isCancel, cancel } from '@clack/prompts'
import { red, green, cyan, bold, dim } from 'picocolors'

import ejs from 'ejs'

import * as banners from './utils/banners'

import renderTemplate from './utils/renderTemplate'
import {
  postOrderDirectoryTraverse,
  preOrderDirectoryTraverse,
  dotGitDirectoryState,
} from './utils/directoryTraverse'
import generateReadme from './utils/generateReadme'
import getCommand from './utils/getCommand'
import getLanguage from './utils/getLanguage'
import renderEslint from './utils/renderEslint'
import { trimBoilerplate, removeCSSImport, emptyRouterConfig } from './utils/trimBoilerplate'

import cliPackageJson from './package.json' with { type: 'json' }

const language = await getLanguage(fileURLToPath(new URL('./locales', import.meta.url)))

const FEATURE_FLAGS = [
  'default',
  'ts',
  'typescript',
  'jsx',
  'router',
  'vue-router',
  'pinia',
  'tests',
  'with-tests',
  'vitest',
  'cypress',
  'nightwatch',
  'playwright',
  'eslint',
  'prettier',
  'eslint-with-prettier',
  'oxlint',
  'rolldown-vite',
] as const

const FEATURE_OPTIONS = [
  {
    value: 'typescript',
    label: language.needsTypeScript.message,
  },
  {
    value: 'jsx',
    label: language.needsJsx.message,
  },
  {
    value: 'router',
    label: language.needsRouter.message,
  },
  {
    value: 'pinia',
    label: language.needsPinia.message,
  },
  {
    value: 'vitest',
    label: language.needsVitest.message,
  },
  {
    value: 'e2e',
    label: language.needsE2eTesting.message,
  },
  {
    value: 'eslint',
    label: language.needsEslint.message,
  },
  {
    value: 'prettier',
    label: language.needsPrettier.message,
  },
] as const
const EXPERIMENTAL_FEATURE_OPTIONS = [
  {
    value: 'oxlint',
    label: language.needsOxlint.message,
  },
  {
    value: 'rolldown-vite',
    label: language.needsRolldownVite.message,
  },
] as const

type PromptResult = {
  projectName?: string
  shouldOverwrite?: boolean
  packageName?: string
  features?: (typeof FEATURE_OPTIONS)[number]['value'][]
  e2eFramework?: 'cypress' | 'nightwatch' | 'playwright'
  experimentFeatures?: (typeof EXPERIMENTAL_FEATURE_OPTIONS)[number]['value'][]
}

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
    dotGitDirectoryState.hasDotGitDirectory = true
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

async function unwrapPrompt<T>(maybeCancelPromise: Promise<T | symbol>): Promise<T> {
  const result = await maybeCancelPromise

  if (isCancel(result)) {
    cancel(red('✖') + ` ${language.errors.operationCancelled}`)
    process.exit(0)
  }
  return result
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
  --eslint-with-prettier (Deprecated in favor of ${cyan('--eslint --prettier')})
    Add Prettier for code formatting in addition to ESLint.
  --prettier
    Add Prettier for code formatting.
  --oxlint
    Add Oxlint for code quality and formatting.
  --rolldown-vite
    Use Rolldown Vite instead of Vite for building the project.

Unstable feature flags:
  --tests, --with-tests
    Add both unit testing and end-to-end testing support.
    Currently equivalent to ${cyan('--vitest --cypress')}, but may change in the future.
`

async function init() {
  const cwd = process.cwd()
  const args = process.argv.slice(2)

  // // alias is not supported by parseArgs so we declare all the flags altogether
  const flags = [...FEATURE_FLAGS, 'force', 'bare', 'help', 'version'] as const
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
  const isFeatureFlagsUsed = FEATURE_FLAGS.some((flag) => typeof argv[flag] === 'boolean')

  let targetDir = positionals[0]
  const defaultProjectName = targetDir || 'vue-project'

  const forceOverwrite = argv.force

  const result: PromptResult = {
    projectName: defaultProjectName,
    shouldOverwrite: forceOverwrite,
    packageName: defaultProjectName,
    features: [],
    e2eFramework: undefined,
    experimentFeatures: [],
  }

  intro(
    process.stdout.isTTY && process.stdout.getColorDepth() > 8
      ? banners.gradientBanner
      : banners.defaultBanner,
  )

  if (!targetDir) {
    const _result = await unwrapPrompt(
      text({
        message: language.projectName.message,
        placeholder: defaultProjectName,
        defaultValue: defaultProjectName,
        validate: (value) =>
          value.length === 0 || value.trim().length > 0
            ? undefined
            : language.projectName.invalidMessage,
      }),
    )
    targetDir = result.projectName = result.packageName = _result.trim()
  }

  if (!canSkipEmptying(targetDir) && !forceOverwrite) {
    result.shouldOverwrite = await unwrapPrompt(
      confirm({
        message: `${
          targetDir === '.'
            ? language.shouldOverwrite.dirForPrompts.current
            : `${language.shouldOverwrite.dirForPrompts.target} "${targetDir}"`
        } ${language.shouldOverwrite.message}`,
        initialValue: false,
      }),
    )

    if (!result.shouldOverwrite) {
      cancel(red('✖') + ` ${language.errors.operationCancelled}`)
      process.exit(0)
    }
  }

  if (!isValidPackageName(targetDir)) {
    result.packageName = await unwrapPrompt(
      text({
        message: language.packageName.message,
        initialValue: toValidPackageName(targetDir),
        validate: (value) =>
          isValidPackageName(value) ? undefined : language.packageName.invalidMessage,
      }),
    )
  }

  if (!isFeatureFlagsUsed) {
    result.features = await unwrapPrompt(
      multiselect({
        message: `${language.featureSelection.message} ${dim(language.featureSelection.hint)}`,
        // @ts-expect-error @clack/prompt's type doesn't support readonly array yet
        options: FEATURE_OPTIONS,
        required: false,
      }),
    )

    if (result.features.includes('e2e')) {
      const hasVitest = result.features.includes('vitest')
      result.e2eFramework = await unwrapPrompt(
        select({
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
              hint: hasVitest
                ? language.e2eSelection.selectOptions.cypress.desc
                : language.e2eSelection.selectOptions.cypress.hintOnComponentTesting!,
            },
            {
              value: 'nightwatch',
              label: language.e2eSelection.selectOptions.nightwatch.title,
              hint: hasVitest
                ? language.e2eSelection.selectOptions.nightwatch.desc
                : language.e2eSelection.selectOptions.nightwatch.hintOnComponentTesting!,
            },
          ],
        }),
      )
    }
    result.experimentFeatures = await unwrapPrompt(
      multiselect({
        message: `${language.needsExperimentalFeatures.message} ${dim(language.needsExperimentalFeatures.hint)}`,
        // @ts-expect-error @clack/prompt's type doesn't support readonly array yet
        options: EXPERIMENTAL_FEATURE_OPTIONS,
        required: false,
      }),
    )
  }

  const { features, experimentFeatures } = result

  const needsTypeScript = argv.ts || argv.typescript || features.includes('typescript')
  const needsJsx = argv.jsx || features.includes('jsx')
  const needsRouter = argv.router || argv['vue-router'] || features.includes('router')
  const needsPinia = argv.pinia || features.includes('pinia')
  const needsVitest = argv.vitest || argv.tests || features.includes('vitest')
  const needsEslint = argv.eslint || argv['eslint-with-prettier'] || features.includes('eslint')
  const needsPrettier =
    argv.prettier || argv['eslint-with-prettier'] || features.includes('prettier')
  const needsOxlint = experimentFeatures.includes('oxlint') || argv['oxlint']
  const needsRolldownVite = experimentFeatures.includes('rolldown-vite') || argv['rolldown-vite']

  const { e2eFramework } = result
  const needsCypress = argv.cypress || argv.tests || e2eFramework === 'cypress'
  const needsCypressCT = needsCypress && !needsVitest
  const needsNightwatch = argv.nightwatch || e2eFramework === 'nightwatch'
  const needsNightwatchCT = needsNightwatch && !needsVitest
  const needsPlaywright = argv.playwright || e2eFramework === 'playwright'

  const root = path.join(cwd, targetDir)

  if (fs.existsSync(root) && result.shouldOverwrite) {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  console.log(`\n${language.infos.scaffolding} ${root}...`)

  const pkg = { name: result.packageName, version: '0.0.0' }
  fs.writeFileSync(path.resolve(root, 'package.json'), JSON.stringify(pkg, null, 2))

  const templateRoot = fileURLToPath(new URL('./template', import.meta.url))
  const callbacks = []
  const render = function render(templateName) {
    const templateDir = path.resolve(templateRoot, templateName)
    renderTemplate(templateDir, root, callbacks)
  }
  const replaceVite = () => {
    const content = fs.readFileSync(path.resolve(root, 'package.json'), 'utf-8')
    const json = JSON.parse(content)
    // Replace `vite` with `rolldown-vite` if the feature is enabled
    json.devDependencies.vite = 'npm:rolldown-vite@latest'
    fs.writeFileSync(path.resolve(root, 'package.json'), JSON.stringify(json, null, 2))
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
  if (needsEslint || needsOxlint) {
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

  if (needsOxlint) {
    render('config/oxlint')
  }

  if (needsPrettier) {
    render('config/prettier')
  }

  // use rolldown-vite if the feature is enabled
  if (needsRolldownVite) {
    replaceVite()
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

  if (!dotGitDirectoryState.hasDotGitDirectory) {
    outroMessage += `
${dim('|')} ${language.infos.optionalGitCommand}
  
   ${bold(green('git init && git add -A && git commit -m "initial commit"'))}`
  }

  outro(outroMessage)
}

init().catch((e) => {
  console.error(e)
  process.exit(1)
})
