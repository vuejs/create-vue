import { cancel, confirm, isCancel } from '@clack/prompts'
import 'zx/globals'

const projectRoot = path.resolve(__dirname, '../')
const playgroundDir = path.resolve(projectRoot, 'playground/')

function formatStatus(status, prefix) {
  return status
    .split('\n')
    .filter(Boolean)
    .map((line) => `[${prefix}] ${line}`)
}

function printStatusSummary(message, lines) {
  console.log(`${message}:`)
  console.log(lines.slice(0, 30).join('\n'))
  if (lines.length > 30) {
    console.log(`... and ${lines.length - 30} more`)
  }
}

async function cleanPlayground() {
  cd(projectRoot)
  $.verbose = false
  const rootPlaygroundStatus = (await $`git status --short -- playground`).stdout.trim()

  cd(playgroundDir)
  const playgroundStatus = (await $`git status --short`).stdout.trim()

  if (!rootPlaygroundStatus && !playgroundStatus) {
    return
  }

  const statusLines = [
    ...formatStatus(rootPlaygroundStatus, 'root'),
    ...formatStatus(playgroundStatus, 'playground'),
  ]
  printStatusSummary(`playground has ${statusLines.length} changed paths`, statusLines)

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('playground must be clean before releasing.')
  }

  const shouldClean = await confirm({
    message:
      'Reset and clean playground before releasing? This discards uncommitted playground changes.',
    initialValue: false,
  })

  if (isCancel(shouldClean) || !shouldClean) {
    cancel('Release cancelled.')
    process.exit(1)
  }

  cd(projectRoot)
  $.verbose = true
  await $`git submodule update --force --checkout playground`

  cd(playgroundDir)
  await $`git reset --hard`
  await $`git clean -fd`

  $.verbose = false
  cd(projectRoot)
  const remainingRootStatus = (await $`git status --short -- playground`).stdout.trim()
  cd(playgroundDir)
  const remainingStatus = (await $`git status --short`).stdout.trim()
  if (remainingRootStatus || remainingStatus) {
    throw new Error(
      `Failed to clean playground:\n\n${[remainingRootStatus, remainingStatus]
        .filter(Boolean)
        .join('\n')}`,
    )
  }
}

async function assertWorkingTreeClean() {
  cd(projectRoot)
  $.verbose = false
  const status = (await $`git status --short`).stdout.trim()
  if (!status) {
    return
  }

  const statusLines = status.split('\n').filter(Boolean)
  printStatusSummary('Working tree still has changes', statusLines)
  throw new Error('Commit or stash non-playground changes before releasing.')
}

async function assertBranchUpToDate() {
  cd(projectRoot)
  $.verbose = true
  await $`git fetch`

  $.verbose = false
  const rootStatus = (await $`git status -uno`).stdout
  if (!rootStatus.includes('Your branch is up to date')) {
    throw new Error(`Please update your branch before releasing.\n\n${rootStatus}`)
  }
}

export async function runReleasePreflight() {
  await cleanPlayground()
  await assertWorkingTreeClean()
  await assertBranchUpToDate()
}
