import getCommand from './getCommand'

const sfcTypeSupportDoc = [
  '',
  '## Type Support for `.vue` Imports in TS',
  '',
  'TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.',
  '',
  "If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:",
  '',
  '1. Disable the built-in TypeScript Extension',
  "    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette",
  '    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`',
  '2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.',
  ''
].join('\n')

export default function generateReadme({
  projectName,
  packageManager,
  needsTypeScript,
  needsCypress,
  needsCypressCT,
  needsPlaywright,
  needsVitest,
  needsEslint
}) {
  const commandFor = (scriptName: string, args?: string) =>
    getCommand(packageManager, scriptName, args)

  let readme = `# ${projectName}

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).
${needsTypeScript ? sfcTypeSupportDoc : ''}
## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

`

  let npmScriptsDescriptions = `\`\`\`sh
${commandFor('install')}
\`\`\`

### Compile and Hot-Reload for Development

\`\`\`sh
${commandFor('dev')}
\`\`\`

### ${needsTypeScript ? 'Type-Check, ' : ''}Compile and Minify for Production

\`\`\`sh
${commandFor('build')}
\`\`\`
`

  if (needsVitest) {
    npmScriptsDescriptions += `
### Run Unit Tests with [Vitest](https://vitest.dev/)

\`\`\`sh
${commandFor('test:unit')}
\`\`\`
`
  }

  if (needsCypressCT) {
    npmScriptsDescriptions += `
### Run Headed Component Tests with [Cypress Component Testing](https://on.cypress.io/component)

\`\`\`sh
${commandFor('test:unit:dev')} # or \`${commandFor('test:unit')}\` for headless testing
\`\`\`
`
  }

  if (needsCypress) {
    npmScriptsDescriptions += `
### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

\`\`\`sh
${commandFor('test:e2e:dev')}
\`\`\`

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with \`test:e2e\` before deploying (e.g. in CI environments):

\`\`\`sh
${commandFor('build')}
${commandFor('test:e2e')}
\`\`\`
`
  }

  if (needsPlaywright) {
    npmScriptsDescriptions += `
### Run End-to-End Tests with [Playwright](https://playwright.dev)

\`\`\`sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
${commandFor('build')}

# Runs the end-to-end tests
${commandFor('test:e2e')}
# Runs the tests only on Chromium
${commandFor('test:e2e', '--project=chromium')}
# Runs the tests of a specific file
${commandFor('test:e2e', 'tests/example.spec.ts')}
# Runs the tests in debug mode
${commandFor('test:e2e', '--debug')}
\`\`\`
`
  }

  if (needsEslint) {
    npmScriptsDescriptions += `
### Lint with [ESLint](https://eslint.org/)

\`\`\`sh
${commandFor('lint')}
\`\`\`
`
  }

  readme += npmScriptsDescriptions

  return readme
}
