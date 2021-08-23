import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const playgroundDir = path.resolve(__dirname, './playground/')

for (const projectName of fs.readdirSync(playgroundDir)) {
  // TODO: test `dev` & `build` commands

  if (projectName.endsWith('with-tests')) {
    console.log(`Running unit tests in ${projectName}`)
    const unitTestResult = spawnSync('pnpm', ['test:unit:ci'], {
      cwd: path.resolve(playgroundDir, projectName),
      stdio: 'inherit',
      shell: true
    })
    if (unitTestResult.status !== 0) {
      throw new Error(`Unit tests failed in ${projectName}`)
    }

    console.log(`Running e2e tests in ${projectName}`)
    const e2eTestResult = spawnSync('pnpm', ['test:e2e:ci'], {
      cwd: path.resolve(playgroundDir, projectName),
      stdio: 'inherit',
      shell: true
    })
    if (e2eTestResult.status !== 0) {
      throw new Error(`E2E tests failed in ${projectName}`)
    }
  }
}
