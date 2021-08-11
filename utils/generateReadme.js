import fs from 'fs'

import getCommand from './getCommand.js'

const sfcTypeSupportDoc = fs.readFileSync(
  new URL('./docs/SFC-TYPE-SUPPORT.md', import.meta.url).pathname,
  'utf8'
)

export default function generateReadme({
  projectName,
  packageManager,
  needsTypeScript,
  needsTests
}) {
  let template = fs.readFileSync(
    new URL('./docs/README-TEMPLATE.md', import.meta.url).pathname,
    'utf8'
  )

  template = template.replace('{{projectName}}', projectName)

  if (needsTypeScript) {
    template = template.replace('<!-- SFC-TYPE-SUPPORT -->\n', sfcTypeSupportDoc)
  } else {
    template = template.replace('<!-- SFC-TYPE-SUPPORT -->\n\n', '')
  }

  let npmScriptsDescriptions = 
`\`\`\`sh
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
    npmScriptsDescriptions +=`
### Run Unit Tests with [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/introduction)

\`\`\`sh
${getCommand(packageManager, 'test:unit')} # or \`${getCommand(packageManager, 'test:unit:ci')}\` for headless testing
\`\`\`

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

\`\`\`sh
${getCommand(packageManager, 'test:e2e')} # or \`${getCommand(packageManager, 'test:e2e:ci')}\` for headless testing
\`\`\`
`
  }

  template = template.replace(
    '<!-- NPM-SCRIPTS -->\n',
    npmScriptsDescriptions
  )

  return template
}
