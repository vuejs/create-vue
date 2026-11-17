#!/usr/bin/env zx
import 'zx/globals'
import { isValid } from 'verkit'
import { runReleasePreflight } from './release-preflight.mjs'
import { nextReleaseVersion } from './release-version.mjs'

const [explicitVersion, ...extraArgs] = process.argv.slice(3)
const projectRoot = path.resolve(__dirname, '../')
const playgroundDir = path.resolve(projectRoot, 'playground/')
const packageJsonPath = path.resolve(projectRoot, 'package.json')

if (extraArgs.length || (explicitVersion !== undefined && !isValid(explicitVersion))) {
  throw new Error('Usage: pnpm release [x.y.z]')
}

await runReleasePreflight()

$.verbose = true
const { version: currentVersion } = await fs.readJson(packageJsonPath)
const targetVersion = explicitVersion ?? nextReleaseVersion(currentVersion, new Date())
await $`pnpm version --no-git-checks --no-git-tag-version ${targetVersion}`

const { version } = await fs.readJson(packageJsonPath)
const tagName = `v${version}`

await $`pnpm build`
await $`pnpm snapshot`

cd(playgroundDir)

await $`pnpm install`
await $`pnpm dedupe`
await $`git add -A .`
try {
  const snapshotCommitMessage = `version ${version} snapshot`
  await $`git commit -m ${snapshotCommitMessage}`
} catch (e) {
  if (!e.stdout.includes('nothing to commit')) {
    throw e
  }
}

await $`git tag -m ${tagName} ${tagName}`

cd(projectRoot)
await $`git add package.json pnpm-lock.yaml`
await $`git commit -m ${tagName}`
await $`git tag -m ${tagName} ${tagName}`
await $`git add playground`
await $`git commit -m 'chore: update snapshot' --allow-empty`

cd(playgroundDir)
await $`git push origin HEAD:main --follow-tags`

cd(projectRoot)
await $`git push --follow-tags`
