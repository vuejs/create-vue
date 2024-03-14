#!/usr/bin/env zx
import 'zx/globals'

/**
 * @see https://vitest.dev/guide/features.html#watch-mode
 */
process.env.CI = 'true'

const playgroundDir = path.resolve(__dirname, '../playground/')

cd(playgroundDir)
console.log('Installing playground dependencies')
await $`pnpm install`

for (const projectName of fs.readdirSync(playgroundDir)) {
  if (projectName.includes('vitest')) {
    cd(path.resolve(playgroundDir, projectName))

    console.log(`Running unit tests in ${projectName}`)
    await $`CI=1 pnpm test:unit`
  }

  if (projectName.includes('cypress')) {
    cd(path.resolve(playgroundDir, projectName))

    console.log(`Building ${projectName}`)
    await $`pnpm build`

    console.log(`Running e2e tests in ${projectName}`)
    await $`pnpm test:e2e:ci`

    // Without Vitest, the project will use Cypress Component Testing for unit testing
    if (!projectName.includes('vitest')) {
      // Cypress Component Testing is flaky in CI environment, so we need to tolerate the errors.
      try {
        await `pnpm test:unit:ci`
      } catch (e) {
        console.error(`Component Testing in ${projectName} fails:`)
        console.error(e)
      }
    }
  }

  // equivalent of `--vitest --cypress`
  if (projectName.endsWith('with-tests')) {
    cd(path.resolve(playgroundDir, projectName))

    console.log(`Running unit tests in ${projectName}`)
    await $`CI=1 pnpm test:unit`

    console.log(`Building ${projectName}`)
    await $`pnpm build`

    console.log(`Running e2e tests in ${projectName}`)
    await $`pnpm test:e2e:ci`
  }
}
