#!/usr/bin/env zx
import 'zx/globals'

// Vitest would otherwise enable watch mode by default.
process.env.CI = '1';

const playgroundDir = path.resolve(__dirname, '../playground/')
let projects = fs.readdirSync(playgroundDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .filter(name => !name.startsWith('.') && name !== 'node_modules')

if (process.argv[3])
  projects = projects.filter(project => project.includes(process.argv[3]))

cd(playgroundDir)
console.log('Installing playground dependencies')
await $`pnpm install`

for (const projectName of projects) {
  cd(path.resolve(playgroundDir, projectName))

  if (projectName.includes('vitest')) {
    console.log(`Running unit tests in ${projectName}`)
    await $`pnpm test:unit`
  }

  cd(path.resolve(playgroundDir, projectName))

  const packageJSON = require(path.resolve(playgroundDir, projectName, 'package.json'));

  console.log(`Building ${projectName}`)
  await $`pnpm build`

  if ('cypress' in packageJSON.devDependencies) {
    console.log(`Running e2e tests in ${projectName}`)
    await $`pnpm test:e2e:ci`
  }
  if ('@playwright/test' in packageJSON.devDependencies) {
    await $`pnpm playwright install --with-deps`
    await $`pnpm test:e2e`
  }

  if ('test:unit:ci' in packageJSON.scripts) {
    // Without Vitest, the project will use Cypress Component Testing for unit testing
    // Cypress Component Testing is flaky in CI environment, so we need to tolerate the errors.
    try {
      await $`pnpm test:unit:ci`
    } catch (e) {
      console.error(`Component Testing in ${projectName} fails:`)
      console.error(e)
      process.exit(1)
    }
  } else if ('test:unit' in packageJSON.scripts) {
    console.log(`Running unit tests in ${projectName}`)
    await $`pnpm test:unit`
  }
}
