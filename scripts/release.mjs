#!/usr/bin/env zx
import 'zx/globals'
import { runReleasePreflight } from './release-preflight.mjs'

const versionArgs = process.argv.slice(3)
const projectRoot = path.resolve(__dirname, '../')
const playgroundDir = path.resolve(projectRoot, 'playground/')

if (versionArgs.length !== 1) {
  throw new Error('Usage: pnpm release <major|minor|patch|x.y.z>')
}

await runReleasePreflight()

$.verbose = true
await $`pnpm version --no-git-checks --no-git-tag-version ${versionArgs}`

const { version } = JSON.parse(await fs.readFile(path.resolve(projectRoot, 'package.json'), 'utf8'))

await $`pnpm build`
await $`pnpm snapshot`

cd(playgroundDir)

await $`pnpm install`
await $`pnpm dedupe`
await $`git add -A .`
try {
  await $`git commit -m "version ${version} snapshot"`
} catch (e) {
  if (!e.stdout.includes('nothing to commit')) {
    throw e
  }
}

await $`git tag -m "v${version}" v${version}`

cd(projectRoot)
await $`git add package.json pnpm-lock.yaml`
await $`git commit -m "v${version}"`
await $`git tag -m "v${version}" v${version}`
await $`git add playground`
await $`git commit -m 'chore: update snapshot' --allow-empty`

cd(playgroundDir)
await $`git push origin HEAD:main --follow-tags`

cd(projectRoot)
await $`git push --follow-tags`
