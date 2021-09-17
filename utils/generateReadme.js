import fs from 'fs'

import getCommand from './getCommand.js'

const sfcTypeSupportDoc =
  '\n' +
  '## Type Support for `.vue` Imports in TS\n' +
  '\n' +
  "Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates.\n" +
  '\n' +
  'However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can run `Volar: Switch TS Plugin on/off` from VSCode command palette.\n'

export default function generateReadme({
  projectName,
  packageManager,
  needsTypeScript,
  needsTests
}) {
  let readme = `# ${projectName}

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur).
${needsTypeScript ? sfcTypeSupportDoc : ''}
## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

`

  let npmScriptsDescriptions = `\`\`\`sh
${getCommand(packageManager, 'install')}
\`\`\`

### Compile and Hot-Reload for Development

\`\`\`sh
${getCommand(packageManager, 'dev')}
\`\`\`

### ${needsTypeScript ? 'Type-Check, ' : ''}Compile and Minify for Production

\`\`\`sh
${getCommand(packageManager, 'build')}
\`\`\`
`

  if (needsTests) {
    npmScriptsDescriptions += `
### Run Unit Tests with [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/introduction)

\`\`\`sh
${getCommand(packageManager, 'test:unit')} # or \`${getCommand(
      packageManager,
      'test:unit:ci'
    )}\` for headless testing
\`\`\`

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

\`\`\`sh
${getCommand(packageManager, 'test:e2e')} # or \`${getCommand(
      packageManager,
      'test:e2e:ci'
    )}\` for headless testing
\`\`\`
`
  }

  readme += npmScriptsDescriptions

  return readme
}
