import fs from 'fs'
import path from 'path'

import { spawnSync } from 'child_process'

const playgroundDir = new URL('./playground/', import.meta.url).pathname

for (const projectName of fs.readdirSync(playgroundDir)) {
  // TODO: test `dev` & `build` commands

  if (projectName.endsWith('with-tests')) {
    console.log(`Running unit tests in ${projectName}`)
    const unitTestResult = spawnSync('pnpm', ['test:unit:ci'], {
      cwd: path.resolve(playgroundDir, projectName),
      stdio: 'inherit'
    })
    if (unitTestResult.status !== 0) {
      throw new Error(`Unit tests failed in ${projectName}`)
    }

    console.log(`Running e2e tests in ${projectName}`)
    const e2eTestResult = spawnSync('pnpm', ['test:e2e:ci'], {
      cwd: path.resolve(playgroundDir, projectName),
      stdio: 'inherit'
    })
    if (e2eTestResult.status !== 0) {
      throw new Error(`E2E tests failed in ${projectName}`)
    }
  }
}
