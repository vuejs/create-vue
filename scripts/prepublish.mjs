#!/usr/bin/env zx
import 'zx/globals'

await $`pnpm build`
await $`pnpm snapshot`

let { version } = JSON.parse(await fs.readFile('./package.json'))

cd('./playground')

await $`git add -A .`
try {
  await $`git commit -m "version ${version} snapshot"`
} catch (e) {
  if (!e.message.includes('nothing to commit')) {
    throw e
  }
}

await $`git tag -m "v${version}" v${version}`
await $`git push --follow-tags`
