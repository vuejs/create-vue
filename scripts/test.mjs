#!/usr/bin/env zx
import 'zx/globals'

const playgroundDir = path.resolve(__dirname, '../playground/')

for (const projectName of fs.readdirSync(playgroundDir)) {
  if (projectName.endsWith('with-tests')) {
    cd(path.resolve(playgroundDir, projectName))

    console.log(`Running unit tests in ${projectName}`)
    await $`pnpm test:unit:ci`

    console.log(`Building ${projectName}`)
    await $`pnpm build`

    console.log(`Running e2e tests in ${projectName}`)
    await $`pnpm test:e2e:ci`
  }
}
